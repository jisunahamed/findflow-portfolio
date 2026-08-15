import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminAccess } from "@/lib/admin-auth";
import { deleteProject, saveProject } from "@/lib/projects";

export async function POST(request: NextRequest) {
  const access = await getCurrentAdminAccess();

  if (!access.approved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { project } = await request.json();
    const savedProject = await saveProject(project);
    return NextResponse.json({ success: true, project: savedProject });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save project" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const access = await getCurrentAdminAccess();

  if (!access.approved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Project id is required" }, { status: 400 });
  }

  try {
    await deleteProject(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete project" }, { status: 400 });
  }
}
