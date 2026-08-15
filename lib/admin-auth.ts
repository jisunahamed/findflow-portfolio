import { cookies } from "next/headers";
import { hasSupabaseServerAccess, supabaseAuthRequest, supabaseRestRequest } from "@/lib/supabase-rest";

const ACCESS_TOKEN_COOKIE = "findflow_admin_access_token";
const REFRESH_TOKEN_COOKIE = "findflow_admin_refresh_token";
const OWNER_ADMIN_EMAILS = (process.env.ADMIN_OWNER_EMAILS ?? process.env.ADMIN_OWNER_EMAIL ?? "support@findflowbd.com")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

type AuthSessionPayload = {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email?: string;
  };
};

export type CurrentAdminAccess = {
  authenticated: boolean;
  approved: boolean;
  owner: boolean;
  userId: string | null;
  email: string | null;
};

export type AccessRequestRecord = {
  id: string;
  user_id: string;
  email: string;
  status: string;
  requested_at: string;
};

function isOwnerEmail(email: string) {
  return OWNER_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

function shouldUseSecureCookies() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "";
  if (!appUrl) {
    return process.env.NODE_ENV === "production";
  }

  try {
    const url = new URL(appUrl);
    return url.protocol === "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1";
  } catch {
    return process.env.NODE_ENV === "production";
  }
}

export function getOwnerAdminEmail() {
  return OWNER_ADMIN_EMAILS.join(", ");
}

function createCookieOptions(days = 7) {
  const maxAge = 60 * 60 * 24 * days;

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: shouldUseSecureCookies(),
    path: "/",
    maxAge,
  };
}

export function getAdminCookieOptions(days = 7) {
  return createCookieOptions(days);
}

export async function persistAdminSession(session: AuthSessionPayload) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, session.access_token, createCookieOptions());
  cookieStore.set(REFRESH_TOKEN_COOKIE, session.refresh_token, createCookieOptions());
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

async function getAccessTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? "";
}

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

async function getUserFromAccessToken(accessToken: string) {
  if (!accessToken) {
    return null;
  }

  const response = await supabaseAuthRequest(
    "/user",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    false,
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

async function upsertOwnerAdmin(userId: string, email: string) {
  if (!hasSupabaseServerAccess()) {
    return;
  }

  await supabaseRestRequest(
    "/admin_users",
    {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([
        {
          user_id: userId,
          email,
          is_owner: true,
          is_approved: true,
          approved_at: new Date().toISOString(),
        },
      ]),
    },
    true,
  );
}

async function ensureAccessRequest(userId: string, email: string) {
  if (!hasSupabaseServerAccess()) {
    return;
  }

  await supabaseRestRequest(
    "/admin_access_requests",
    {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([
        {
          user_id: userId,
          email,
          status: "pending",
          requested_at: new Date().toISOString(),
        },
      ]),
    },
    true,
  );
}

export async function getCurrentAdminAccess(): Promise<CurrentAdminAccess> {
  const accessToken = await getAccessTokenFromCookies();
  const user = await getUserFromAccessToken(accessToken);

  if (!user?.id || !user?.email) {
    return {
      authenticated: false,
      approved: false,
      owner: false,
      userId: null,
      email: null,
    };
  }

  const normalizedEmail = String(user.email).trim().toLowerCase();
  const owner = isOwnerEmail(normalizedEmail);

  if (owner) {
    try {
      await upsertOwnerAdmin(user.id, normalizedEmail);
    } catch (error) {
      console.error(error);
    }

    return {
      authenticated: true,
      approved: true,
      owner: true,
      userId: user.id,
      email: normalizedEmail,
    };
  }

  if (!hasSupabaseServerAccess()) {
    return {
      authenticated: true,
      approved: false,
      owner: false,
      userId: user.id,
      email: normalizedEmail,
    };
  }

  try {
    const response = await supabaseRestRequest(
      `/admin_users?select=user_id,is_approved,is_owner,email&user_id=eq.${user.id}&limit=1`,
      {},
      true,
    );

    if (!response.ok) {
      throw new Error(`Admin user lookup failed with ${response.status}`);
    }

    const [adminUser] = (await response.json()) as Array<{
      user_id: string;
      is_approved: boolean;
      is_owner: boolean;
      email: string;
    }>;

    if (!adminUser?.is_approved) {
      await ensureAccessRequest(user.id, normalizedEmail);
    }

    return {
      authenticated: true,
      approved: Boolean(adminUser?.is_approved),
      owner: Boolean(adminUser?.is_owner),
      userId: user.id,
      email: normalizedEmail,
    };
  } catch (error) {
    console.error(error);
    return {
      authenticated: true,
      approved: false,
      owner: false,
      userId: user.id,
      email: normalizedEmail,
    };
  }
}

export async function signInWithPassword(email: string, password: string) {
  const response = await supabaseAuthRequest(
    "/token?grant_type=password",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    false,
  );

  if (!response.ok) {
    const errorBody = await response.text();
    if (errorBody.includes("email_not_confirmed")) {
      throw new Error("Please confirm your email from the Supabase mail first, then log in.");
    }
    throw new Error(errorBody || "Invalid email or password");
  }

  const session = (await response.json()) as AuthSessionPayload;
  await persistAdminSession(session);
  return session;
}

export async function signUpAdminUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const response = await supabaseAuthRequest(
    "/signup",
    {
      method: "POST",
      body: JSON.stringify({
        email: normalizedEmail,
        password,
        data: {
          requested_admin_access: true,
        },
        options: {
          emailRedirectTo: `${getApiBaseUrl()}/auth/confirm`,
        },
      }),
    },
    false,
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || "Failed to create admin access request");
  }

  const payload = await response.json();
  const userId = payload.user?.id as string | undefined;

  if (userId) {
    await ensureAccessRequest(userId, normalizedEmail);
  }

  return payload;
}

export async function sendAdminPasswordReset(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const isOwner = isOwnerEmail(normalizedEmail);

  if (!isOwner && hasSupabaseServerAccess()) {
    const response = await supabaseRestRequest(
      `/admin_users?select=email,is_approved&email=eq.${encodeURIComponent(normalizedEmail)}&is_approved=eq.true&limit=1`,
      {},
      true,
    );

    if (!response.ok) {
      throw new Error(`Admin lookup failed with ${response.status}`);
    }

    const rows = (await response.json()) as Array<{ email: string }>;
    if (!rows.length) {
      throw new Error("Password reset is only available for approved admin emails");
    }
  }

  const response = await supabaseAuthRequest(
    "/recover",
    {
      method: "POST",
      body: JSON.stringify({
        email: normalizedEmail,
        redirect_to: `${getApiBaseUrl()}/admin/login`,
      }),
    },
    false,
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || "Failed to send password reset email");
  }
}

export async function verifyEmailToken(tokenHash: string, type: string) {
  const response = await supabaseAuthRequest(
    "/verify",
    {
      method: "POST",
      body: JSON.stringify({
        token_hash: tokenHash,
        type,
      }),
    },
    false,
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || "Confirmation link is invalid or expired");
  }

  return (await response.json()) as Partial<AuthSessionPayload>;
}

export async function exchangeRecoveryToken(tokenHash: string) {
  const response = await supabaseAuthRequest(
    "/verify",
    {
      method: "POST",
      body: JSON.stringify({
        token_hash: tokenHash,
        type: "recovery",
      }),
    },
    false,
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || "Recovery link is invalid or expired");
  }

  return (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
  };
}

export async function updatePasswordWithAccessToken(accessToken: string, password: string) {
  const response = await supabaseAuthRequest(
    "/user",
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        password,
      }),
    },
    false,
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || "Failed to update password");
  }

  return response.json();
}

export async function getPendingAccessRequests() {
  if (!hasSupabaseServerAccess()) {
    return [] as AccessRequestRecord[];
  }

  const response = await supabaseRestRequest(
    "/admin_access_requests?select=id,user_id,email,status,requested_at&status=eq.pending&order=requested_at.desc",
    {},
    true,
  );

  if (!response.ok) {
    throw new Error(`Access request lookup failed with ${response.status}`);
  }

  return (await response.json()) as AccessRequestRecord[];
}

export async function reviewAccessRequest(
  requestId: string,
  reviewerUserId: string,
  approve: boolean,
) {
  if (!hasSupabaseServerAccess()) {
    throw new Error("Supabase server access is not configured");
  }

  const requestResponse = await supabaseRestRequest(
    `/admin_access_requests?select=id,user_id,email&id=eq.${requestId}&limit=1`,
    {},
    true,
  );

  if (!requestResponse.ok) {
    throw new Error(`Request lookup failed with ${requestResponse.status}`);
  }

  const [requestRecord] = (await requestResponse.json()) as Array<{
    id: string;
    user_id: string;
    email: string;
  }>;

  if (!requestRecord) {
    throw new Error("Access request not found");
  }

  if (approve) {
    await supabaseRestRequest(
      "/admin_users",
      {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify([
          {
            user_id: requestRecord.user_id,
            email: requestRecord.email,
            is_owner: isOwnerEmail(requestRecord.email),
            is_approved: true,
            approved_by: reviewerUserId,
            approved_at: new Date().toISOString(),
          },
        ]),
      },
      true,
    );
  }

  await supabaseRestRequest(
    `/admin_access_requests?id=eq.${requestId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: approve ? "approved" : "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerUserId,
      }),
    },
    true,
  );
}
