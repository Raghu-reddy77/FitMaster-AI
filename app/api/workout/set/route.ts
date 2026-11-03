import { NextResponse } from "next/server";
import { db } from "@/backend/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { exerciseId, setIndex } = body;

    if (!exerciseId || typeof setIndex !== "number") {
      return NextResponse.json(
        { success: false, error: "exerciseId and setIndex are required" },
        { status: 400 }
      );
    }

    const workout = db.toggleExerciseSet(exerciseId, setIndex);
    return NextResponse.json({ success: true, workout });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to toggle exercise set" },
      { status: 500 }
    );
  }
}
