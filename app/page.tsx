"use client";

import { Header } from "@/frontend/components/Header";
import { Navigation } from "@/frontend/components/Navigation";
import { OnboardingModal } from "@/frontend/components/OnboardingModal";
import { useApp } from "@/frontend/context/AppContext";
import { useToast } from "@/frontend/components/Toast";
import { 
  Flame, 
  Egg, 
  Wheat, 
  Droplet, 
  Footprints, 
  Dumbbell, 
  Bot, 
  Plus, 
  Trash2,
  CheckCircle2, 
  Circle,
  Zap,
  Sparkles,
  ArrowRight,
  Target
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DashboardHome() {
  const { userProfile, metrics, meals, activeWorkout, deleteMeal, addMeal, logWater, logSteps } = useApp();
  const { showToast } = useToast();

  const [showCustomMealModal, setShowCustomMealModal] = useState(false);
  const [mealName, setMealName] = useState("");
  const [mealCalories, setMealCalories] = useState("");
  const [mealProtein, setMealProtein] = useState("");
  const [mealCategory, setMealCategory] = useState<"Breakfast" | "Lunch" | "Snack" | "Dinner">("Lunch");

  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleAddCustomMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim() || !mealCalories) return;

    await addMeal({
      name: mealName.trim(),
      category: mealCategory,
      calories: Number(mealCalories),
      protein: Number(mealProtein) || 0,
      carbs: Math.round((Number(mealCalories) * 0.4) / 4),
      fat: Math.round((Number(mealCalories) * 0.25) / 9),
    });

    showToast(`🥗 Logged custom meal: ${mealName}!`, "success");
    setMealName("");
    setMealCalories("");
    setMealProtein("");
    setShowCustomMealModal(false);
  };

  const handleDeleteMeal = async (id: string, name: string) => {
    await deleteMeal(id);
    showToast(`🗑️ Removed meal: ${name}`, "info");
  };

  // Metric percent calculations (0-start behavior)
  const calPercent = Math.min(100, Math.round((metrics.calories.current / metrics.calories.target) * 100));
  const proPercent = Math.min(100, Math.round((metrics.protein.current / metrics.protein.target) * 100));
  const waterPercent = Math.min(100, Math.round((metrics.water.current / metrics.water.target) * 100));
  const stepPercent = Math.min(100, Math.round((metrics.steps.current / metrics.steps.target) * 100));

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col pb-24 md:pb-10 md:pl-64">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 space-y-6">
        {/* Interactive 0-Start Key Metrics Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Calories Card */}
          <div className="bg-[#201f1f] rounded-2xl p-4 border border-[#434933]/50 flex flex-col justify-between space-y-3 shadow-md hover:border-[#bfff00]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-[#c3caac] uppercase tracking-wider">Calories Intake</span>
              <div className="w-7 h-7 rounded-lg bg-[#bfff00]/10 text-[#bfff00] flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {metrics.calories.current.toLocaleString()} <span className="text-xs font-normal text-[#c3caac]">/ {metrics.calories.target.toLocaleString()} kcal</span>
              </div>
              <div className="h-1.5 w-full bg-[#353534] rounded-full overflow-hidden mt-2">
                <div className="h-full bg-[#bfff00] rounded-full transition-all duration-500" style={{ width: `${calPercent}%` }} />
              </div>
            </div>

            <span className="text-[10px] text-[#c3caac]">{calPercent}% of daily transformation target ({userProfile.goal})</span>
          </div>

          {/* Protein Card */}
          <div className="bg-[#201f1f] rounded-2xl p-4 border border-[#434933]/50 flex flex-col justify-between space-y-3 shadow-md hover:border-[#bfff00]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-[#c3caac] uppercase tracking-wider">Protein Target</span>
              <div className="w-7 h-7 rounded-lg bg-[#bfff00]/10 text-[#bfff00] flex items-center justify-center">
                <Egg className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {metrics.protein.current} <span className="text-xs font-normal text-[#c3caac]">/ {metrics.protein.target}g</span>
              </div>
              <div className="h-1.5 w-full bg-[#353534] rounded-full overflow-hidden mt-2">
                <div className="h-full bg-[#bfff00] rounded-full transition-all duration-500" style={{ width: `${proPercent}%` }} />
              </div>
            </div>

            <span className="text-[10px] text-[#bfff00] font-medium">{metrics.protein.target - metrics.protein.current > 0 ? `${metrics.protein.target - metrics.protein.current}g needed` : 'Target Met! 🎉'}</span>
          </div>

          {/* Water Intake Card */}
          <div className="bg-[#201f1f] rounded-2xl p-4 border border-[#434933]/50 flex flex-col justify-between space-y-3 shadow-md hover:border-[#4b8eff]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-[#c3caac] uppercase tracking-wider">Water Intake</span>
              <button 
                onClick={() => logWater(0.25)}
                className="w-7 h-7 rounded-lg bg-[#4b8eff]/20 text-[#4b8eff] hover:bg-[#4b8eff] hover:text-white transition-colors flex items-center justify-center"
                title="Log 250ml Water"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {metrics.water.current} <span className="text-xs font-normal text-[#c3caac]">/ {metrics.water.target} L</span>
              </div>
              <div className="h-1.5 w-full bg-[#353534] rounded-full overflow-hidden mt-2">
                <div className="h-full bg-[#4b8eff] rounded-full transition-all duration-500" style={{ width: `${waterPercent}%` }} />
              </div>
            </div>

            <span className="text-[10px] text-[#4b8eff] font-medium">+250ml quick add available</span>
          </div>

          {/* Active Steps Card */}
          <div className="bg-[#201f1f] rounded-2xl p-4 border border-[#434933]/50 flex flex-col justify-between space-y-3 shadow-md hover:border-[#adc6ff]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-[#c3caac] uppercase tracking-wider">Daily Steps</span>
              <button
                onClick={() => logSteps(1000)}
                className="w-7 h-7 rounded-lg bg-[#adc6ff]/20 text-[#adc6ff] hover:bg-[#adc6ff] hover:text-[#181818] transition-colors flex items-center justify-center"
                title="Add +1000 Steps"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {metrics.steps.current.toLocaleString()} <span className="text-xs font-normal text-[#c3caac]">/ {metrics.steps.target.toLocaleString()}</span>
              </div>
              <div className="h-1.5 w-full bg-[#353534] rounded-full overflow-hidden mt-2">
                <div className="h-full bg-[#adc6ff] rounded-full transition-all duration-500" style={{ width: `${stepPercent}%` }} />
              </div>
            </div>

            <span className="text-[10px] text-[#c3caac]">Tap + to log 1,000 steps</span>
          </div>
        </section>

        {/* Quick Action Navigation Buttons */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/food" className="bg-[#201f1f] hover:bg-[#2a2a2a] border border-[#353534] hover:border-[#bfff00]/50 p-3.5 rounded-xl flex items-center gap-3 transition-all group shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#bfff00]/10 text-[#bfff00] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Food Scanner</h3>
              <p className="text-[10px] text-[#c3caac]">Real Web Camera</p>
            </div>
          </Link>

          <Link href="/workout" className="bg-[#201f1f] hover:bg-[#2a2a2a] border border-[#353534] hover:border-[#bfff00]/50 p-3.5 rounded-xl flex items-center gap-3 transition-all group shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#bfff00]/10 text-[#bfff00] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">6-Exercise Plans</h3>
              <p className="text-[10px] text-[#c3caac]">Push / Pull / Legs</p>
            </div>
          </Link>

          <Link href="/progress" className="bg-[#201f1f] hover:bg-[#2a2a2a] border border-[#353534] hover:border-[#bfff00]/50 p-3.5 rounded-xl flex items-center gap-3 transition-all group shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#bfff00]/10 text-[#bfff00] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Analytics</h3>
              <p className="text-[10px] text-[#c3caac]">Weight & Volume</p>
            </div>
          </Link>

          <Link href="/ai" className="bg-[#201f1f] hover:bg-[#2a2a2a] border border-[#353534] hover:border-[#4b8eff]/50 p-3.5 rounded-xl flex items-center gap-3 transition-all group shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#4b8eff]/20 text-[#4b8eff] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Gemini Coach</h3>
              <p className="text-[10px] text-[#4b8eff]">Personal Advice</p>
            </div>
          </Link>
        </section>

        {/* Meals Logged Today Section (With Delete Option) */}
        <section className="bg-[#201f1f] rounded-2xl border border-[#434933]/50 p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#bfff00] uppercase tracking-wider">Nutrition Management</span>
              <h2 className="text-lg font-bold text-white">Meals Logged Today ({meals.length})</h2>
            </div>

            <button
              onClick={() => setShowCustomMealModal(true)}
              className="inline-flex items-center gap-1.5 bg-[#bfff00] hover:bg-[#a1d800] text-[#263500] font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Custom Meal
            </button>
          </div>

          {meals.length === 0 ? (
            <div className="p-6 bg-[#181818] rounded-xl border border-[#353534] text-center space-y-2">
              <p className="text-xs text-[#c3caac]">No meals logged today yet. Metrics currently start at 0.</p>
              <div className="flex justify-center gap-2 pt-1">
                <Link href="/food" className="text-xs bg-[#bfff00]/20 text-[#bfff00] hover:bg-[#bfff00]/30 px-3 py-1.5 rounded-lg font-bold transition-colors">
                  Open Camera Scanner
                </Link>
                <button 
                  onClick={() => setShowCustomMealModal(true)}
                  className="text-xs bg-[#353534] text-white hover:bg-[#434933] px-3 py-1.5 rounded-lg font-semibold transition-colors"
                >
                  Quick Add Meal
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {meals.map((meal) => (
                <div key={meal.id} className="bg-[#181818] p-3.5 rounded-xl border border-[#353534] flex items-center justify-between gap-3 group hover:border-[#bfff00]/40 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {meal.imageUrl ? (
                      <img src={meal.imageUrl} alt={meal.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[#bfff00]/10 text-[#bfff00] flex items-center justify-center font-bold text-xs shrink-0">
                        {meal.category.slice(0, 3)}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white truncate">{meal.name}</h4>
                        <span className="text-[9px] bg-[#353534] text-[#c3caac] px-1.5 py-0.5 rounded font-semibold">{meal.category}</span>
                      </div>
                      <p className="text-[11px] text-[#c3caac] mt-0.5">
                        <strong className="text-white">{meal.calories} kcal</strong> • <span className="text-[#bfff00]">{meal.protein}g protein</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteMeal(meal.id, meal.name)}
                    className="p-2 text-[#c3caac] hover:text-[#ff4b4b] hover:bg-[#ff4b4b]/10 rounded-lg transition-colors shrink-0"
                    title="Delete meal & update macros"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Navigation />

      {/* Custom Meal Modal */}
      {showCustomMealModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1b1b] border border-[#bfff00]/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-white">Log Custom Meal</h3>
            <form onSubmit={handleAddCustomMeal} className="space-y-3">
              <div>
                <label className="text-xs text-[#c3caac] font-semibold">Meal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chicken Rice Bowl"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full bg-[#201f1f] border border-[#353534] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#bfff00] mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#c3caac] font-semibold">Calories (kcal)</label>
                  <input
                    type="number"
                    required
                    placeholder="550"
                    value={mealCalories}
                    onChange={(e) => setMealCalories(e.target.value)}
                    className="w-full bg-[#201f1f] border border-[#353534] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#bfff00] mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#c3caac] font-semibold">Protein (g)</label>
                  <input
                    type="number"
                    placeholder="40"
                    value={mealProtein}
                    onChange={(e) => setMealProtein(e.target.value)}
                    className="w-full bg-[#201f1f] border border-[#353534] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#bfff00] mt-1"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="submit" className="flex-1 bg-[#bfff00] text-[#263500] font-bold text-xs uppercase py-3 rounded-xl shadow-md">
                  Log Meal
                </button>
                <button type="button" onClick={() => setShowCustomMealModal(false)} className="bg-[#353534] text-white text-xs py-3 px-4 rounded-xl">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Onboarding Trigger */}
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
}
