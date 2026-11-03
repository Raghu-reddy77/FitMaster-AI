import { NextResponse } from "next/server";
import { db } from "@/backend/db";
import { GoogleGenAI } from "@google/genai";

export async function GET() {
  try {
    const messages = db.getAIMessages();
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch AI messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Message text is required" },
        { status: 400 }
      );
    }

    const userProfile = db.getUserProfile();
    const metrics = db.getMetrics();
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

    let aiReplyText = "";

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `You are FitMaster AI Coach, an elite digital fitness & nutrition coach.
Address the user by their exact name: "${userProfile.name || 'Raghu'}". Always start greetings with "Good morning, ${userProfile.name || 'Raghu'}!" or similar warm personalized greeting addressing ${userProfile.name || 'Raghu'}.
User Context:
- Name: ${userProfile.name || 'Raghu'}
- Transformation Goal: ${userProfile.goal}
- Body Weight: ${userProfile.weightKg} kg
- Height: ${userProfile.heightCm} cm
- Daily Macro Targets: ${metrics.calories.target} kcal, ${metrics.protein.target}g Protein, ${metrics.carbs.target}g Carbs, ${metrics.fat.target}g Fat
- Currently Logged Today: ${metrics.calories.current} kcal, ${metrics.protein.current}g Protein, ${metrics.water.current}L Water, ${metrics.steps.current} Steps

Keep advice concise, energetic, actionable, and structured for fitness goals.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            { role: "system", parts: [{ text: systemPrompt }] },
            { role: "user", parts: [{ text: message }] }
          ]
        });

        if (response?.text) {
          aiReplyText = response.text;
        }
      } catch (genAiError) {
        console.warn("Gemini API call warning (using dynamic coach fallback):", genAiError);
      }
    }

    // Call db method (which handles fallback and stores in-memory history)
    const { userMsg, aiMsg } = db.addAIMessage(message);

    // If Gemini returned a live response, override the fallback text
    if (aiReplyText) {
      aiMsg.text = aiReplyText;
    }

    const messages = db.getAIMessages();

    return NextResponse.json({
      success: true,
      userMessage: userMsg,
      aiMessage: aiMsg,
      allMessages: messages,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
