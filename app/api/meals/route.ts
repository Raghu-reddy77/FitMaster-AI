import { NextResponse } from "next/server";
import { db } from "@/backend/db";

export async function GET() {
  try {
    const meals = db.getMeals();
    return NextResponse.json({ success: true, meals });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch meals" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, calories, protein, carbs, fat, imageUrl } = body;

    if (!name || !category || typeof calories !== "number") {
      return NextResponse.json(
        { success: false, error: "Name, category, and numerical calories are required" },
        { status: 400 }
      );
    }

    const { meal, metrics, meals } = db.addMeal({
      name,
      category,
      calories,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      imageUrl,
    });

    return NextResponse.json({ success: true, meal, metrics, meals });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to add meal" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Meal ID is required" },
        { status: 400 }
      );
    }

    const result = db.deleteMeal(id);
    return NextResponse.json({ success: result.success, metrics: result.metrics, meals: result.meals });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete meal" },
      { status: 500 }
    );
  }
}
