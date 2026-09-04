import { hasSupabaseServerAccess, supabaseRestRequest } from "@/lib/supabase-rest";

export type ContactSubmission = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceKey: string;
  serviceLabel: string;
  message: string;
  status: "new" | "reviewed";
  source: string;
  createdAt: string;
  reviewedAt: string | null;
  webhookDeliveryStatus: "not_configured" | "pending" | "delivered" | "failed";
  webhookDeliveredAt: string | null;
  webhookError: string;
  rawPayload: Record<string, unknown>;
};

export type CreateContactSubmissionInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  serviceKey: string;
  serviceLabel: string;
  message: string;
  source?: string;
  rawPayload?: Record<string, unknown>;
  webhookDeliveryStatus?: ContactSubmission["webhookDeliveryStatus"];
};

type ContactSubmissionRecord = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  service_key: string;
  service_label: string;
  message: string;
  status: "new" | "reviewed";
  source: string;
  created_at: string;
  reviewed_at: string | null;
  webhook_delivery_status: ContactSubmission["webhookDeliveryStatus"];
  webhook_delivered_at: string | null;
  webhook_error: string | null;
  raw_payload: Record<string, unknown> | null;
};

function mapRecordToSubmission(record: ContactSubmissionRecord): ContactSubmission {
  return {
    id: record.id,
    firstName: record.first_name,
    lastName: record.last_name,
    email: record.email,
    phone: record.phone ?? "",
    serviceKey: record.service_key,
    serviceLabel: record.service_label,
    message: record.message,
    status: record.status,
    source: record.source,
    createdAt: record.created_at,
    reviewedAt: record.reviewed_at,
    webhookDeliveryStatus: record.webhook_delivery_status,
    webhookDeliveredAt: record.webhook_delivered_at,
    webhookError: record.webhook_error ?? "",
    rawPayload: record.raw_payload ?? {},
  };
}

function mapInputToRecord(input: CreateContactSubmissionInput) {
  return {
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() ?? "",
    service_key: input.serviceKey.trim(),
    service_label: input.serviceLabel.trim(),
    message: input.message.trim(),
    status: "new",
    source: input.source?.trim() || "website",
    webhook_delivery_status: input.webhookDeliveryStatus ?? "not_configured",
    raw_payload: input.rawPayload ?? {},
  };
}

export async function getContactSubmissions() {
  if (!hasSupabaseServerAccess()) {
    return [] as ContactSubmission[];
  }

  try {
    const response = await supabaseRestRequest(
      "/contact_submissions?select=id,first_name,last_name,email,phone,service_key,service_label,message,status,source,created_at,reviewed_at,webhook_delivery_status,webhook_delivered_at,webhook_error,raw_payload&order=created_at.desc",
      {},
      true,
    );

    if (!response.ok) {
      if (response.status === 404) {
        return [] as ContactSubmission[];
      }

      throw new Error(`Contact submissions query failed with ${response.status}`);
    }

    const rows = (await response.json()) as ContactSubmissionRecord[];
    return rows.map(mapRecordToSubmission);
  } catch (error) {
    console.error(error);
    return [] as ContactSubmission[];
  }
}

export async function createContactSubmission(input: CreateContactSubmissionInput) {
  const response = await supabaseRestRequest(
    "/contact_submissions",
    {
      method: "POST",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify([mapInputToRecord(input)]),
    },
    true,
  );

  if (!response.ok) {
    throw new Error(`Failed to create contact submission with ${response.status}`);
  }

  const [saved] = (await response.json()) as ContactSubmissionRecord[];
  return mapRecordToSubmission(saved);
}

export async function updateContactSubmissionStatus(id: string, status: ContactSubmission["status"]) {
  const response = await supabaseRestRequest(
    `/contact_submissions?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        status,
        reviewed_at: status === "reviewed" ? new Date().toISOString() : null,
      }),
    },
    true,
  );

  if (!response.ok) {
    throw new Error(`Failed to update contact submission with ${response.status}`);
  }

  const [saved] = (await response.json()) as ContactSubmissionRecord[];
  return mapRecordToSubmission(saved);
}

export async function deleteContactSubmission(id: string) {
  const response = await supabaseRestRequest(
    `/contact_submissions?id=eq.${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
    true,
  );

  if (!response.ok) {
    throw new Error(`Failed to delete contact submission with ${response.status}`);
  }
}

export async function updateContactSubmissionWebhookDelivery(
  id: string,
  payload: {
    webhookDeliveryStatus: ContactSubmission["webhookDeliveryStatus"];
    webhookDeliveredAt?: string | null;
    webhookError?: string;
  },
) {
  const response = await supabaseRestRequest(
    `/contact_submissions?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        webhook_delivery_status: payload.webhookDeliveryStatus,
        webhook_delivered_at: payload.webhookDeliveredAt ?? null,
        webhook_error: payload.webhookError ?? "",
      }),
    },
    true,
  );

  if (!response.ok) {
    throw new Error(`Failed to update webhook delivery with ${response.status}`);
  }

  const [saved] = (await response.json()) as ContactSubmissionRecord[];
  return mapRecordToSubmission(saved);
}
