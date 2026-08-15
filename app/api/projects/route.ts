import { NextResponse } from "next/server";
import { getPublishedProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await getPublishedProjects();
    return NextResponse.json({ projects, error: false });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ projects: [], error: true });
  }
}
