import { NextResponse } from "next/server";
import { db, TransformationGoal } from "@/backend/db";

export async function GET() {
  try {
    const profile = db.getUserProfile();
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, weightKg, heightCm, goal } = body;

    if (!name || !weightKg || !heightCm) {
      return NextResponse.json(
        { success: false, error: "Name, weightKg, and heightCm are required" },
        { status: 400 }
      );
    }

    const transformationGoal: TransformationGoal = goal || "Lean Bulk";

    const { profile, metrics } = db.updateUserProfile(
      name.trim() || "Raghu",
      Number(weightKg),
      Number(heightCm),
      transformationGoal
    );

    return NextResponse.json({ success: true, profile, metrics });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
