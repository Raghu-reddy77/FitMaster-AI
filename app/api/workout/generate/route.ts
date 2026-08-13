import { NextResponse } from "next/server";
import { db } from "@/backend/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { focusArea, variationId } = body;

    if (!focusArea || typeof focusArea !== "string") {
      return NextResponse.json(
        { success: false, error: "Workout focus area string is required" },
        { status: 400 }
      );
    }

    const workout = db.generateWorkout(focusArea, variationId || "var-a");
    return NextResponse.json({ success: true, workout });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to generate workout plan" },
      { status: 500 }
    );
  }
}
