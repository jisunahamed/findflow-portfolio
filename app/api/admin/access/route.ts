import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminAccess, reviewAccessRequest } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const access = await getCurrentAdminAccess();

  if (!access.approved || !access.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { requestId, approve } = await request.json();

    if (!requestId) {
      return NextResponse.json({ error: "Request id is required" }, { status: 400 });
    }

    await reviewAccessRequest(requestId, access.userId, Boolean(approve));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to review access request" }, { status: 400 });
  }
}
