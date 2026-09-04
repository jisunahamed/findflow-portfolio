import { NextRequest, NextResponse } from "next/server";
import { exchangeRecoveryToken, updatePasswordWithAccessToken } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const { action, tokenHash, accessToken, password } = await request.json();

    if (action === "exchange") {
      if (!tokenHash) {
        return NextResponse.json({ error: "Recovery token is required" }, { status: 400 });
      }

      const payload = await exchangeRecoveryToken(tokenHash);
      return NextResponse.json({
        success: true,
        accessToken: payload.access_token ?? "",
        refreshToken: payload.refresh_token ?? "",
      });
    }

    if (action === "update") {
      if (!accessToken || !password) {
        return NextResponse.json({ error: "Access token and password are required" }, { status: 400 });
      }

      await updatePasswordWithAccessToken(accessToken, password);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid recovery action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Password recovery failed" },
      { status: 400 },
    );
  }
}
