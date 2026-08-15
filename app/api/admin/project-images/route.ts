import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminAccess } from "@/lib/admin-auth";
import { getSupabaseProjectUrl } from "@/lib/supabase-rest";

const bucketName = process.env.SUPABASE_PROJECT_IMAGES_BUCKET?.trim() || "project-images";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";

function sanitizeSegment(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "") || "asset";
}

export async function POST(request: NextRequest) {
  const access = await getCurrentAdminAccess();

  if (!access.approved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!serviceRoleKey || !getSupabaseProjectUrl()) {
    return NextResponse.json({ error: "Supabase storage is not configured" }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folderInput = typeof formData.get("folder") === "string" ? String(formData.get("folder")) : "projects";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    const fileExt = file.name.includes(".") ? file.name.split(".").pop() : "png";
    const fileName = `${Date.now()}-${sanitizeSegment(file.name.replace(/\.[^.]+$/, ""))}.${fileExt}`;
    const objectPath = `${sanitizeSegment(folderInput)}/${fileName}`;
    const uploadUrl = `${getSupabaseProjectUrl()}/storage/v1/object/${bucketName}/${objectPath}`;
    const publicUrl = `${getSupabaseProjectUrl()}/storage/v1/object/public/${bucketName}/${objectPath}`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "true",
      },
      body: Buffer.from(await file.arrayBuffer()),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Upload failed with ${response.status}`);
    }

    return NextResponse.json({ success: true, url: publicUrl, path: objectPath, bucket: bucketName });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Image upload failed" }, { status: 400 });
  }
}
