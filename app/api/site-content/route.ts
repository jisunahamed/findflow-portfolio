import { NextResponse } from "next/server";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const siteContent = await getSiteContent();
    return NextResponse.json({ siteContent, error: false });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ siteContent: null, error: true }, { status: 500 });
  }
}
