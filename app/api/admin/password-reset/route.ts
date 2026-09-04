import { NextRequest, NextResponse } from "next/server";
import { sendAdminPasswordReset } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await sendAdminPasswordReset(email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Password reset failed" }, { status: 400 });
  }
}
