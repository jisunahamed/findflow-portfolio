import { hasSupabaseServerAccess, supabaseRestRequest } from "@/lib/supabase-rest";

export type WebhookSetting = {
  id: string;
  key: string;
  label: string;
  eventType: string;
  endpointUrl: string;
  method: "GET" | "POST";
  enabled: boolean;
  secretHeader: string;
  notes: string;
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type WebhookSettingRecord = {
  id: string;
  key: string;
  label: string;
  event_type: string;
  endpoint_url: string | null;
  method: "GET" | "POST";
  enabled: boolean;
  secret_header: string | null;
  notes: string | null;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapRecordToWebhook(record: WebhookSettingRecord): WebhookSetting {
  return {
    id: record.id,
    key: record.key,
    label: record.label,
    eventType: record.event_type,
    endpointUrl: record.endpoint_url ?? "",
    method: record.method,
    enabled: Boolean(record.enabled),
    secretHeader: record.secret_header ?? "",
    notes: record.notes ?? "",
    lastTriggeredAt: record.last_triggered_at,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapWebhookToRecord(webhook: Partial<WebhookSetting> & Pick<WebhookSetting, "key" | "label">) {
  return {
    key: webhook.key,
    label: webhook.label,
    event_type: webhook.eventType ?? "contact_submission",
    endpoint_url: webhook.endpointUrl ?? "",
    method: webhook.method === "POST" ? "POST" : "GET",
    enabled: Boolean(webhook.enabled),
    secret_header: webhook.secretHeader ?? "",
    notes: webhook.notes ?? "",
  };
}

export function createEmptyWebhook(index: number) {
  const now = new Date().toISOString();
  return {
    id: `draft-webhook-${Date.now()}-${index}`,
    key: "contact-submission",
    label: "Contact Submission Webhook",
    eventType: "contact_submission",
    endpointUrl: "",
    method: "GET" as const,
    enabled: false,
    secretHeader: "",
    notes: "",
    lastTriggeredAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getWebhookSettings() {
  if (!hasSupabaseServerAccess()) {
    return [createEmptyWebhook(0)];
  }

  try {
    const response = await supabaseRestRequest(
      "/webhook_settings?select=id,key,label,event_type,endpoint_url,method,enabled,secret_header,notes,last_triggered_at,created_at,updated_at&order=created_at.asc",
      {},
      true,
    );

    if (!response.ok) {
      if (response.status === 404) {
        return [createEmptyWebhook(0)];
      }

      throw new Error(`Webhook settings query failed with ${response.status}`);
    }

    const rows = (await response.json()) as WebhookSettingRecord[];
    return rows.length ? [mapRecordToWebhook(rows[0])] : [createEmptyWebhook(0)];
  } catch (error) {
    console.error(error);
    return [createEmptyWebhook(0)];
  }
}

export async function saveWebhookSetting(webhook: Partial<WebhookSetting> & Pick<WebhookSetting, "key" | "label">) {
  const patchResponse = await supabaseRestRequest(
    `/webhook_settings?key=eq.${encodeURIComponent(webhook.key)}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify(mapWebhookToRecord(webhook)),
    },
    true,
  );

  if (!patchResponse.ok) {
    throw new Error(`Failed to update webhook setting with ${patchResponse.status}`);
  }

  const patchedRows = (await patchResponse.json()) as WebhookSettingRecord[];
  if (patchedRows.length) {
    return mapRecordToWebhook(patchedRows[0]);
  }

  const createResponse = await supabaseRestRequest(
    "/webhook_settings",
    {
      method: "POST",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify([mapWebhookToRecord(webhook)]),
    },
    true,
  );

  if (!createResponse.ok) {
    throw new Error(`Failed to create webhook setting with ${createResponse.status}`);
  }

  const [saved] = (await createResponse.json()) as WebhookSettingRecord[];
  return mapRecordToWebhook(saved);
}

export async function getEnabledWebhookSettings(eventType = "contact_submission") {
  if (!hasSupabaseServerAccess()) {
    return [] as WebhookSetting[];
  }

  try {
    const response = await supabaseRestRequest(
      `/webhook_settings?select=id,key,label,event_type,endpoint_url,method,enabled,secret_header,notes,last_triggered_at,created_at,updated_at&event_type=eq.${encodeURIComponent(eventType)}&enabled=eq.true&order=created_at.asc`,
      {},
      true,
    );

    if (!response.ok) {
      return [] as WebhookSetting[];
    }

    const rows = (await response.json()) as WebhookSettingRecord[];
    return rows.map(mapRecordToWebhook).filter((item) => item.endpointUrl).slice(0, 1);
  } catch (error) {
    console.error(error);
    return [] as WebhookSetting[];
  }
}

export async function touchWebhookTriggeredAt(key: string) {
  const response = await supabaseRestRequest(
    `/webhook_settings?key=eq.${encodeURIComponent(key)}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        last_triggered_at: new Date().toISOString(),
      }),
    },
    true,
  );

  if (!response.ok) {
    throw new Error(`Failed to update webhook timestamp with ${response.status}`);
  }

  const [saved] = (await response.json()) as WebhookSettingRecord[];
  return mapRecordToWebhook(saved);
}
