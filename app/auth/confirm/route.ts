import { NextRequest, NextResponse } from "next/server";
import { getAdminCookieOptions, verifyEmailToken } from "@/lib/admin-auth";

const ALLOWED_TYPES = new Set(["signup", "invite", "magiclink", "email_change"]);

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") ?? "signup";

  if (!tokenHash || !ALLOWED_TYPES.has(type)) {
    return NextResponse.redirect(new URL("/admin/login?error=confirmation", url.origin));
  }

  try {
    const payload = await verifyEmailToken(tokenHash, type);
    const response = NextResponse.redirect(new URL("/admin?confirmed=1", url.origin));

    if (payload.access_token && payload.refresh_token) {
      const cookieOptions = getAdminCookieOptions();
      response.cookies.set("findflow_admin_access_token", payload.access_token, cookieOptions);
      response.cookies.set("findflow_admin_refresh_token", payload.refresh_token, cookieOptions);
    }

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL("/admin/login?error=confirmation", url.origin));
  }
}
