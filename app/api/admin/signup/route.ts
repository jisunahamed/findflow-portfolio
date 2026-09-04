import { NextRequest, NextResponse } from "next/server";
import { signUpAdminUser } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    await signUpAdminUser(email, password);
    return NextResponse.json({
      success: true,
      message: "Confirmation email sent. Please verify your email first, then log in and wait for admin approval.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Signup failed" }, { status: 400 });
  }
}
