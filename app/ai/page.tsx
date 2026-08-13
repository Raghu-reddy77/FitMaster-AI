"use client";

import { Navigation } from "@/frontend/components/Navigation";
import { useApp } from "@/frontend/context/AppContext";
import { useToast } from "@/frontend/components/Toast";
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  ArrowLeft, 
  Zap, 
  Plus, 
  Dumbbell, 
  Utensils,
  CheckCircle2,
  Droplet,
  Flame,
  Activity,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function AIAssistantPage() {
  const { userProfile, aiMessages, sendChatMessage, metrics, addMeal, logWater, generateCustomWorkout } = useApp();
  const { showToast } = useToast();

  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText);
    setInputText("");
  };

  const handleQuickPrompt = (promptText: string) => {
    sendChatMessage(promptText);
  };

  // Interactive suggestion trigger
  const handleActionableSuggestion = async (suggestion: { type: string; title: string }) => {
    if (suggestion.type === "meal") {
      await addMeal({
        name: suggestion.title,
        category: "Snack",
        calories: 320,
        protein: 30,
        carbs: 24,
        fat: 6,
      });
      showToast(`✅ Executed AI Recommendation: Logged "${suggestion.title}" (+30g Protein)!`, "success");
    } else if (suggestion.type === "water") {
      await logWater(0.5);
      showToast("💧 Executed AI Recommendation: Logged +500ml Hydration!", "success");
    } else if (suggestion.type === "workout") {
      await generateCustomWorkout("Chest & Push", "var-a");
      showToast("🏋️ Executed AI Recommendation: Generated Active 6-Exercise Workout Plan!", "success");
    }
  };

  const displayName = userProfile.name || "Raghu";

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col pb-24 md:pb-10 md:pl-64">
      {/* Header Bar */}
      <header className="pt-6 pb-4 px-4 sm:px-6 max-w-5xl mx-auto w-full flex items-center justify-between border-b border-[#353534]/50">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl bg-[#201f1f] text-[#c3caac] hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4b8eff]/20 border border-[#4b8eff]/40 text-[#4b8eff] flex items-center justify-center relative">
              <Bot className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#bfff00] rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Interactive Gemini AI Coach</h1>
                <span className="text-[10px] bg-[#bfff00]/20 text-[#bfff00] font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
              </div>
              <p className="text-xs text-[#c3caac]">Good morning, {displayName} 👋 ({userProfile.goal} Target Plan)</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col justify-between space-y-4">
        {/* Chat History Box */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[400px] max-h-[560px]">
          {aiMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === "user"
                    ? "bg-[#bfff00] text-[#263500]"
                    : "bg-[#4b8eff] text-white shadow-[0_0_12px_rgba(75,142,255,0.4)]"
                }`}
              >
                {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-2 text-sm leading-relaxed border shadow-md ${
                  msg.sender === "user"
                    ? "bg-[#bfff00]/15 border-[#bfff00]/40 text-white rounded-tr-none"
                    : "bg-[#201f1f] border-[#353534] text-[#e5e2e1] rounded-tl-none"
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] text-[#c3caac] font-medium border-b border-[#353534]/50 pb-1 mb-1">
                  <span>{msg.sender === "user" ? displayName : "Gemini AI Coach"}</span>
                  <span>{msg.timestamp}</span>
                </div>

                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Interactive Action Button inside AI responses */}
                {msg.actionableSuggestion && (
                  <button
                    onClick={() => handleActionableSuggestion(msg.actionableSuggestion!)}
                    className="mt-3 w-full p-3 bg-[#181818] hover:bg-[#263500] border border-[#bfff00]/40 rounded-xl flex items-center justify-between text-xs text-[#bfff00] font-bold transition-all active:scale-98 shadow-sm group"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#bfff00] group-hover:animate-spin" />
                      <span>{msg.actionableSuggestion.title}</span>
                    </div>
                    <span className="text-[10px] bg-[#bfff00] text-[#263500] px-2 py-0.5 rounded font-extrabold flex items-center gap-1">
                      Execute Action <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Interactive Quick Action Suggestions */}
        <section className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-[#c3caac] uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#bfff00]" /> Interactive AI Coach Controls
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { prompt: `Good morning! Recommend protein meal for ${displayName}`, label: "🥗 High Protein Meal" },
              { prompt: `Generate active 6-exercise workout plan for ${displayName}`, label: "🏋️ 6-Exercise Workout" },
              { prompt: `Calculate calorie surplus/deficit for ${userProfile.goal}`, label: "🔥 Calorie Target Math" },
              { prompt: `Check hydration recovery for ${userProfile.weightKg}kg BW`, label: "💧 Hydration Advice" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => handleQuickPrompt(item.prompt)}
                className="text-left text-xs bg-[#201f1f] hover:bg-[#2a2a2a] text-[#c3caac] hover:text-white border border-[#353534] p-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-between"
              >
                <span className="font-semibold text-white">{item.label}</span>
                <Sparkles className="w-3.5 h-3.5 text-[#bfff00]" />
              </button>
            ))}
          </div>
        </section>

        {/* Input Form Bar */}
        <form onSubmit={handleSend} className="relative flex items-center pt-1">
          <input
            type="text"
            placeholder={`Ask Gemini AI Coach about your ${userProfile.goal} plan, meals, or workouts...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-[#201f1f] border border-[#353534] rounded-2xl py-3.5 pl-4 pr-12 text-sm text-white placeholder-[#c3caac]/60 focus:outline-none focus:border-[#4b8eff] shadow-lg"
          />
          <button
            type="submit"
            className="absolute right-2 bg-[#4b8eff] hover:bg-[#3b7eff] text-white p-2 rounded-xl transition-all shadow-md active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </main>

      <Navigation />
    </div>
  );
}
