import { NextResponse } from "next/server";
import { db } from "@/backend/db";

export async function GET() {
  try {
    const workout = db.getWorkout();
    return NextResponse.json({ success: true, workout });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch active workout" },
      { status: 500 }
    );
  }
}
