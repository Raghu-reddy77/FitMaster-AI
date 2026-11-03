import { NextResponse } from "next/server";
import { db } from "@/backend/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emailOrPhone, password } = body;

    if (!emailOrPhone || !password) {
      return NextResponse.json(
        { success: false, error: "Email or phone number and password are required" },
        { status: 400 }
      );
    }

    const result = db.loginUser(emailOrPhone, password);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 401 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to authenticate account" },
      { status: 500 }
    );
  }
}
