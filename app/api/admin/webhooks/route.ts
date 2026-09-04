import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminAccess } from "@/lib/admin-auth";
import { saveWebhookSetting } from "@/lib/webhook-settings";

async function validateWebhookEndpoint(endpointUrl: string, method: "GET" | "POST", secretHeader: string) {
  try {
    const target = new URL(endpointUrl);
    const headers: Record<string, string> = secretHeader ? { "x-findflow-secret": secretHeader } : {};
    const response = await fetch(target.toString(), {
      method,
      headers: method === "POST" ? { "Content-Type": "application/json", ...headers } : headers,
      body:
        method === "POST"
          ? JSON.stringify({ event: "webhook_validation", source: "findflow_admin", checkedAt: new Date().toISOString() })
          : undefined,
      cache: "no-store",
    });

    let remoteMessage = "";

    try {
      const rawBody = await response.text();
      if (rawBody) {
        try {
          const parsed = JSON.parse(rawBody) as { message?: string; msg?: string; error?: string; hint?: string };
          remoteMessage = parsed.message ?? parsed.msg ?? parsed.error ?? parsed.hint ?? rawBody;
        } catch {
          remoteMessage = rawBody;
        }
      }
    } catch {
      remoteMessage = "";
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { ok: false, status: response.status, message: "Unauthorized (Not connected)" };
      }

      if (response.status === 404) {
        return {
          ok: false,
          status: response.status,
          message: remoteMessage || "Webhook not registered or published URL is inactive",
        };
      }

      return {
        ok: false,
        status: response.status,
        message: remoteMessage || `Webhook validation failed with ${response.status}`,
      };
    }

    return { ok: true, status: response.status, message: "Success" };
  } catch {
    return { ok: false, status: 0, message: "Invalid webhook URL" };
  }
}

export async function POST(request: NextRequest) {
  const access = await getCurrentAdminAccess();

  if (!access.approved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { webhook } = await request.json();
    const endpointUrl = typeof webhook?.endpointUrl === "string" ? webhook.endpointUrl.trim() : "";
    const enabled = Boolean(webhook?.enabled) && Boolean(endpointUrl);

    if (!webhook?.key || !webhook?.label) {
      return NextResponse.json({ error: "Webhook key and label are required" }, { status: 400 });
    }

    if (enabled) {
      const validation = await validateWebhookEndpoint(
        endpointUrl,
        webhook.method === "POST" ? "POST" : "GET",
        webhook.secretHeader ?? "",
      );

      if (!validation.ok) {
        return NextResponse.json(
          { error: validation.message, validationStatus: validation.message },
          { status: validation.status || 400 },
        );
      }

      const savedWebhook = await saveWebhookSetting({
        ...webhook,
        endpointUrl,
        enabled,
      });
      return NextResponse.json({ success: true, webhook: savedWebhook, validationStatus: validation.message });
    }

    const savedWebhook = await saveWebhookSetting({
      ...webhook,
      endpointUrl: "",
      enabled: false,
    });

    return NextResponse.json({
      success: true,
      webhook: savedWebhook,
      validationStatus: "Webhook disabled",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save webhook" }, { status: 400 });
  }
}
