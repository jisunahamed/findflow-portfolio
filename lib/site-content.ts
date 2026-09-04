import {
  DEFAULT_SITE_CONTENT,
  EDITABLE_SITE_SECTION_KEYS,
  SITE_SECTION_LABELS,
  type EditableSiteSectionKey,
  type SiteContent,
} from "@/lib/default-site-content";
import { hasSupabaseServerAccess, supabaseRestRequest } from "@/lib/supabase-rest";

type SiteSectionRow = {
  key: EditableSiteSectionKey;
  data: unknown;
};

export type EditableSiteSection = {
  key: EditableSiteSectionKey;
  label: string;
  data: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge<T>(base: T, override: unknown): T {
  if (Array.isArray(base)) {
    return (Array.isArray(override) ? override : base) as T;
  }

  if (!isRecord(base) || !isRecord(override)) {
    return (override ?? base) as T;
  }

  const merged: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const baseValue = merged[key];

    if (Array.isArray(value)) {
      merged[key] = value;
      continue;
    }

    if (isRecord(baseValue) && isRecord(value)) {
      merged[key] = deepMerge(baseValue, value);
      continue;
    }

    merged[key] = value;
  }

  return merged as T;
}

export async function getSiteContent() {
  if (!hasSupabaseServerAccess()) {
    return DEFAULT_SITE_CONTENT;
  }

  try {
    const keyFilter = EDITABLE_SITE_SECTION_KEYS.join(",");
    const response = await supabaseRestRequest(`/site_sections?select=key,data&key=in.(${keyFilter})`, {}, true);

    if (!response.ok) {
      throw new Error(`Site content request failed with ${response.status}`);
    }

    const rows = (await response.json()) as SiteSectionRow[];
    let content: SiteContent = DEFAULT_SITE_CONTENT;

    for (const row of rows) {
      if (!EDITABLE_SITE_SECTION_KEYS.includes(row.key)) {
        continue;
      }

      content = {
        ...content,
        [row.key]: deepMerge(content[row.key], row.data),
      };
    }

    return content;
  } catch (error) {
    console.error(error);
    return DEFAULT_SITE_CONTENT;
  }
}

export async function getEditableSiteSections() {
  const content = await getSiteContent();

  return EDITABLE_SITE_SECTION_KEYS.map((key) => ({
    key,
    label: SITE_SECTION_LABELS[key],
    data: content[key],
  })) satisfies EditableSiteSection[];
}

export async function saveSiteSection(key: EditableSiteSectionKey, data: unknown) {
  const response = await supabaseRestRequest(
    "/site_sections",
    {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([{ key, data }]),
    },
    true,
  );

  if (!response.ok) {
    throw new Error(`Failed to save ${key} with ${response.status}`);
  }

  return response.json();
}
