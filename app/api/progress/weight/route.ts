import { NextResponse } from "next/server";
import { db } from "@/backend/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { weightKg } = body;

    if (!weightKg || typeof weightKg !== "number") {
      return NextResponse.json(
        { success: false, error: "Numerical weightKg is required" },
        { status: 400 }
      );
    }

    const progress = db.addWeightEntry(weightKg);
    return NextResponse.json({ success: true, progress });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to log weight entry" },
      { status: 500 }
    );
  }
}
