import { NextRequest, NextResponse } from "next/server";
import { getAdminCookieOptions, signInWithPassword } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const session = await signInWithPassword(email, password);
    const response = NextResponse.json({ success: true });
    const cookieOptions = getAdminCookieOptions();

    response.cookies.set("findflow_admin_access_token", session.access_token, cookieOptions);
    response.cookies.set("findflow_admin_refresh_token", session.refresh_token, cookieOptions);

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Login failed" }, { status: 400 });
  }
}
