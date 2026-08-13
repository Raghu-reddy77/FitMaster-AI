import { NextResponse } from "next/server";
import { db } from "@/backend/db";

export async function GET() {
  try {
    const progress = db.getProgress();
    return NextResponse.json({ success: true, progress });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch progress summary" },
      { status: 500 }
    );
  }
}
