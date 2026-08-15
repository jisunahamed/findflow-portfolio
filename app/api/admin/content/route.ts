import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminAccess } from "@/lib/admin-auth";
import { saveSiteSection } from "@/lib/site-content";

export async function POST(request: NextRequest) {
  const access = await getCurrentAdminAccess();

  if (!access.approved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { key, data } = await request.json();

    if (!key) {
      return NextResponse.json({ error: "Section key is required" }, { status: 400 });
    }

    await saveSiteSection(key, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save section" }, { status: 400 });
  }
}
