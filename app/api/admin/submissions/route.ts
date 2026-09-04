import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminAccess } from "@/lib/admin-auth";
import { deleteContactSubmission, updateContactSubmissionStatus } from "@/lib/contact-submissions";

export async function POST(request: NextRequest) {
  const access = await getCurrentAdminAccess();

  if (!access.approved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id, status } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Submission id is required" }, { status: 400 });
    }

    const submission = await updateContactSubmissionStatus(id, status === "reviewed" ? "reviewed" : "new");
    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update submission" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const access = await getCurrentAdminAccess();

  if (!access.approved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Submission id is required" }, { status: 400 });
  }

  try {
    await deleteContactSubmission(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete submission" }, { status: 400 });
  }
}
