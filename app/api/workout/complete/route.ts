import { NextResponse } from "next/server";
import { db } from "@/backend/db";

export async function POST() {
  try {
    const result = db.completeWorkout();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to complete workout" },
      { status: 500 }
    );
  }
}
