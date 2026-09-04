const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const normalizedSupabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/i, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

function buildHeaders(serviceRole = false) {
  const apiKey = serviceRole ? supabaseServiceRoleKey : supabaseAnonKey;

  if (!normalizedSupabaseUrl || !apiKey) {
    return null;
  }

  return {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
  };
}

export function getSupabaseProjectUrl() {
  return normalizedSupabaseUrl;
}

export function getSupabaseRestUrl() {
  return normalizedSupabaseUrl ? `${normalizedSupabaseUrl}/rest/v1` : "";
}

export function getSupabaseAuthUrl() {
  return normalizedSupabaseUrl ? `${normalizedSupabaseUrl}/auth/v1` : "";
}

export function hasSupabaseServerAccess() {
  return Boolean(normalizedSupabaseUrl && supabaseServiceRoleKey);
}

export async function supabaseRestRequest(
  path: string,
  init: RequestInit = {},
  serviceRole = false,
) {
  const headers = buildHeaders(serviceRole);
  const restUrl = getSupabaseRestUrl();

  if (!headers || !restUrl) {
    throw new Error("Supabase environment variables are missing");
  }

  const requestHeaders = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    requestHeaders.set(key, value);
  }
  new Headers(init.headers).forEach((value, key) => {
    requestHeaders.set(key, value);
  });

  if (!requestHeaders.has("Content-Type") && init.body) {
    requestHeaders.set("Content-Type", "application/json");
  }

  return fetch(`${restUrl}${path}`, {
    ...init,
    headers: requestHeaders,
    cache: "no-store",
  });
}

export async function supabaseAuthRequest(
  path: string,
  init: RequestInit = {},
  serviceRole = false,
) {
  const headers = buildHeaders(serviceRole);
  const authUrl = getSupabaseAuthUrl();

  if (!headers || !authUrl) {
    throw new Error("Supabase environment variables are missing");
  }

  const requestHeaders = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    requestHeaders.set(key, value);
  }
  new Headers(init.headers).forEach((value, key) => {
    requestHeaders.set(key, value);
  });

  if (!requestHeaders.has("Content-Type") && init.body) {
    requestHeaders.set("Content-Type", "application/json");
  }

  return fetch(`${authUrl}${path}`, {
    ...init,
    headers: requestHeaders,
    cache: "no-store",
  });
}
