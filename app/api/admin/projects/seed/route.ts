import { NextResponse } from "next/server";
import { getCurrentAdminAccess } from "@/lib/admin-auth";
import { seedProjectsIntoSupabase } from "@/lib/projects";

export async function POST() {
  const access = await getCurrentAdminAccess();

  if (!access.approved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await seedProjectsIntoSupabase();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to seed projects" }, { status: 400 });
  }
}
