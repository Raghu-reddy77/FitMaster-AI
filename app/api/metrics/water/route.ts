import { NextResponse } from "next/server";
import { db } from "@/backend/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amountLiters } = body;

    if (!amountLiters || typeof amountLiters !== "number") {
      return NextResponse.json(
        { success: false, error: "Valid water amount in liters is required" },
        { status: 400 }
      );
    }

    const metrics = db.logWater(amountLiters);
    return NextResponse.json({ success: true, metrics });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to log water" },
      { status: 500 }
    );
  }
}
