import { NextRequest, NextResponse } from "next/server";
import {
  createContactSubmission,
  updateContactSubmissionWebhookDelivery,
} from "@/lib/contact-submissions";
import {
  getEnabledWebhookSettings,
  touchWebhookTriggeredAt,
} from "@/lib/webhook-settings";

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function sendWebhook(url: string, method: "GET" | "POST", secretHeader: string, payload: Record<string, unknown>) {
  if (method === "GET") {
    const target = new URL(url);
    for (const [key, value] of Object.entries(payload)) {
      if (value === null || value === undefined) {
        continue;
      }
      target.searchParams.set(key, typeof value === "string" ? value : JSON.stringify(value));
    }

    return fetch(target.toString(), {
      method: "GET",
      headers: secretHeader ? { "x-findflow-secret": secretHeader } : undefined,
    });
  }

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(secretHeader ? { "x-findflow-secret": secretHeader } : {}),
    },
    body: JSON.stringify(payload),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const firstName = readString(body.firstName);
    const lastName = readString(body.lastName);
    const email = readString(body.email);
    const phone = readString(body.phone);
    const serviceKey = readString(body.serviceKey);
    const serviceLabel = readString(body.serviceLabel);
    const message = readString(body.message);

    if (!firstName || !lastName || !email || !serviceKey || !serviceLabel || !message) {
      return NextResponse.json({ error: "Please complete the required form fields." }, { status: 400 });
    }

    const webhooks = await getEnabledWebhookSettings("contact_submission");
    const submission = await createContactSubmission({
      firstName,
      lastName,
      email,
      phone,
      serviceKey,
      serviceLabel,
      message,
      source: "website",
      rawPayload: body,
      webhookDeliveryStatus: webhooks.length ? "pending" : "not_configured",
    });

    if (webhooks.length) {
      let deliveredCount = 0;
      let lastError = "";
      const webhookPayload = {
        event: "contact_submission",
        submission,
      };

      for (const webhook of webhooks) {
        try {
          const response = await sendWebhook(webhook.endpointUrl, webhook.method, webhook.secretHeader, webhookPayload);
          if (!response.ok) {
            throw new Error(`Webhook responded with ${response.status}`);
          }
          deliveredCount += 1;
          await touchWebhookTriggeredAt(webhook.key);
        } catch (error) {
          lastError = error instanceof Error ? error.message : "Webhook delivery failed";
        }
      }

      await updateContactSubmissionWebhookDelivery(submission.id, {
        webhookDeliveryStatus: deliveredCount ? "delivered" : "failed",
        webhookDeliveredAt: deliveredCount ? new Date().toISOString() : null,
        webhookError: deliveredCount === webhooks.length ? "" : lastError,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Thanks. Your project brief has been saved and is now visible in the admin panel.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to submit the form",
      },
      { status: 500 },
    );
  }
}
