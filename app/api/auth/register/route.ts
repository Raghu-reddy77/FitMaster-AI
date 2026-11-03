import { NextResponse } from "next/server";
import { db, TransformationGoal } from "@/backend/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emailOrPhone, password, name, weightKg, heightCm, goal } = body;

    if (!emailOrPhone || !password || !name || !weightKg || !heightCm) {
      return NextResponse.json(
        { success: false, error: "Email or phone, password, name, body weight, and height are required" },
        { status: 400 }
      );
    }

    const transformationGoal: TransformationGoal = goal || "Lean Bulk";

    const result = db.registerUser(
      emailOrPhone,
      password,
      name.trim() || "Raghu",
      Number(weightKg),
      Number(heightCm),
      transformationGoal
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create account" },
      { status: 500 }
    );
  }
}
