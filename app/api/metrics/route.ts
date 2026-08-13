import { NextResponse } from "next/server";
import { db } from "@/backend/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shouldReset = searchParams.get("reset") === "true";

    if (shouldReset) {
      const metrics = db.resetMetrics();
      return NextResponse.json({ success: true, metrics, reset: true });
    }

    const metrics = db.getMetrics();
    return NextResponse.json({ success: true, metrics });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
