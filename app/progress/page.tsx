"use client";

import { Navigation } from "@/frontend/components/Navigation";
import { useApp } from "@/frontend/context/AppContext";
import { useToast } from "@/frontend/components/Toast";
import { 
  TrendingUp, 
  Award, 
  Sparkles, 
  Activity, 
  Calendar, 
  ArrowLeft,
  Flame,
  Zap,
  CheckCircle2,
  Trophy,
  Plus,
  Weight,
  Footprints,
  X
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ProgressPage() {
  const { userProfile, metrics, activeWorkout, logSteps } = useApp();
  const { showToast } = useToast();

  const [timeframe, setTimeframe] = useState<"7D" | "30D" | "90D">("30D");
  const [showLogWeightModal, setShowLogWeightModal] = useState(false);
  const [showStepModal, setShowStepModal] = useState(false);
  const [newWeight, setNewWeight] = useState(userProfile.weightKg?.toString() || "75");
  const [stepInput, setStepInput] = useState("2000");

  const [weightHistory, setWeightHistory] = useState([
    { date: "Aug 06", weightKg: 75.8 },
    { date: "Aug 07", weightKg: 75.6 },
    { date: "Aug 08", weightKg: 75.5 },
    { date: "Aug 09", weightKg: 75.4 },
    { date: "Aug 10", weightKg: 75.2 },
    { date: "Aug 11", weightKg: 75.1 },
    { date: "Aug 12", weightKg: Number(userProfile.weightKg) || 75.0 },
  ]);

  // Calculate real volume lifted from active workout
  let calculatedVolumeKg = 0;
  activeWorkout.exercises.forEach((ex) => {
    ex.sets.forEach((set) => {
      if (set.completed) {
        calculatedVolumeKg += set.weight * set.targetReps;
      }
    });
  });

  useEffect(() => {
    setWeightHistory((prev) => {
      const last = prev[prev.length - 1];
      if (last.weightKg !== userProfile.weightKg) {
        return [...prev.slice(0, -1), { ...last, weightKg: userProfile.weightKg }];
      }
      return prev;
    });
  }, [userProfile.weightKg]);

  const handleLogWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || isNaN(Number(newWeight))) return;

    const w = Number(newWeight);
    try {
      const res = await fetch("/api/progress/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightKg: w }),
      });
      const data = await res.json();
      if (data.success) {
        const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" });
        setWeightHistory((prev) => [...prev, { date: todayStr, weightKg: w }]);
        showToast(`⚖️ Logged real weight entry: ${w} kg!`, "success");
        setShowLogWeightModal(false);
      }
    } catch (err) {
      console.error("Error logging weight:", err);
    }
  };

  const handleLogStepsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const count = Number(stepInput) || 0;
    await logSteps(count);
    showToast(`👟 Logged +${count.toLocaleString()} real steps!`, "success");
    setShowStepModal(false);
  };

  const displayHistory = timeframe === "7D" ? weightHistory.slice(-7) : weightHistory;
  const initialW = displayHistory[0]?.weightKg || 75.8;
  const currentW = displayHistory[displayHistory.length - 1]?.weightKg || 75.0;
  const weightDiff = Number((currentW - initialW).toFixed(1));

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col pb-24 md:pb-10 md:pl-64">
      {/* Header Bar */}
      <header className="pt-6 pb-4 px-4 sm:px-6 max-w-5xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl bg-[#201f1f] text-[#c3caac] hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#bfff00]">Analytics & Milestones</span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Progress Tracker ({userProfile.name || "Raghu"})</h1>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-[#201f1f] p-1 rounded-xl border border-[#353534]">
          {(["7D", "30D", "90D"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                timeframe === tf
                  ? "bg-[#bfff00] text-[#263500]"
                  : "text-[#c3caac] hover:text-white"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 space-y-6">
        {/* Real Analytics & Milestones Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#201f1f] rounded-2xl p-4 border border-[#434933]/40 space-y-1">
            <span className="text-[10px] text-[#c3caac] uppercase font-bold tracking-wider">Recovery Index</span>
            <p className="text-2xl font-extrabold text-[#bfff00]">94%</p>
            <span className="text-[11px] text-[#c3caac]">Optimal Readiness</span>
          </div>

          <div 
            onClick={() => setShowStepModal(true)}
            className="bg-[#201f1f] rounded-2xl p-4 border border-[#434933]/40 space-y-1 cursor-pointer hover:border-[#4b8eff]/60 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#c3caac] uppercase font-bold tracking-wider">Steps Logged</span>
              <span className="text-[10px] bg-[#4b8eff]/20 text-[#4b8eff] px-1.5 py-0.5 rounded font-bold">+Steps</span>
            </div>
            <p className="text-2xl font-extrabold text-[#4b8eff]">{metrics.steps.current.toLocaleString()}</p>
            <span className="text-[11px] text-[#c3caac]">/ 10,000 target steps</span>
          </div>

          <div className="bg-[#201f1f] rounded-2xl p-4 border border-[#434933]/40 space-y-1">
            <span className="text-[10px] text-[#c3caac] uppercase font-bold tracking-wider">Session Volume</span>
            <p className="text-2xl font-extrabold text-[#e2e2e2]">{calculatedVolumeKg.toLocaleString()} <span className="text-xs font-normal">kg</span></p>
            <span className="text-[11px] text-[#c3caac]">Calculated from sets</span>
          </div>

          <div 
            onClick={() => setShowLogWeightModal(true)}
            className="bg-[#201f1f] rounded-2xl p-4 border border-[#434933]/40 space-y-1 cursor-pointer hover:border-[#bfff00]/60 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#c3caac] uppercase font-bold tracking-wider">Body Weight</span>
              <span className="text-[10px] bg-[#bfff00]/20 text-[#bfff00] px-1.5 py-0.5 rounded font-bold">Log</span>
            </div>
            <p className="text-2xl font-extrabold text-[#bfff00]">{currentW} kg</p>
            <span className="text-[11px] text-[#bfff00]">{weightDiff <= 0 ? `${weightDiff} kg` : `+${weightDiff} kg`} ({userProfile.goal})</span>
          </div>
        </section>

        {/* Interactive Bodyweight Trend Chart Card */}
        <section className="bg-[#201f1f] rounded-2xl border border-[#434933]/50 p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#bfff00] uppercase tracking-wider">Real Weight Analytics ({userProfile.name || "Raghu"})</span>
              <h2 className="text-lg font-bold text-white">{userProfile.goal} Transformation Progress ({timeframe})</h2>
            </div>
            <button
              onClick={() => setShowLogWeightModal(true)}
              className="inline-flex items-center gap-1 bg-[#bfff00] hover:bg-[#a1d800] text-[#263500] font-bold text-xs uppercase px-3 py-1.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Log Weight Entry
            </button>
          </div>

          {/* SVG Visual Graph */}
          <div className="h-48 w-full bg-[#1c1b1b] rounded-xl p-4 border border-[#353534] flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs text-[#c3caac]">
              <span>Current BW: <strong className="text-white">{currentW} kg</strong></span>
              <span>Goal: <strong className="text-[#bfff00] font-semibold">{userProfile.goal} Target</strong></span>
            </div>

            {/* Dynamic Interactive SVG Points & Line */}
            <div className="relative h-28 w-full flex items-end justify-between px-2 pt-4">
              {displayHistory.map((item, idx) => {
                const min = 70.0;
                const max = 80.0;
                const percent = Math.max(10, Math.min(90, ((item.weightKg - min) / (max - min)) * 100));

                return (
                  <div key={idx} className="flex flex-col items-center gap-1 group relative">
                    <div 
                      className="w-3.5 h-3.5 rounded-full bg-[#bfff00] border-2 border-[#1c1b1b] group-hover:scale-125 transition-all shadow-[0_0_8px_rgba(191,255,0,0.5)] cursor-pointer"
                      style={{ marginBottom: `${percent * 0.8}px` }}
                      title={`${item.date}: ${item.weightKg} kg`}
                    />
                    <span className="text-[9px] text-[#c3caac] font-medium">{item.date}</span>
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-[#353534] text-[#bfff00] text-[10px] font-bold px-1.5 py-0.5 rounded transition-opacity pointer-events-none whitespace-nowrap">
                      {item.weightKg} kg
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Navigation />

      {/* Log Weight Modal */}
      {showLogWeightModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1b1b] border border-[#bfff00]/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setShowLogWeightModal(false)}
              className="absolute top-4 right-4 text-[#c3caac] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#bfff00]">
              <Weight className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Log Real Weight Entry</h3>
            </div>

            <form onSubmit={handleLogWeightSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-[#c3caac] font-semibold">Body Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full bg-[#201f1f] border border-[#353534] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#bfff00] mt-1"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#bfff00] hover:bg-[#a1d800] text-[#263500] font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-colors shadow-md"
                >
                  Save Entry
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogWeightModal(false)}
                  className="bg-[#353534] hover:bg-[#434933] text-white font-medium text-xs py-3 px-4 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Steps Modal */}
      {showStepModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1b1b] border border-[#4b8eff]/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setShowStepModal(false)}
              className="absolute top-4 right-4 text-[#c3caac] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#4b8eff]">
              <Footprints className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Log Active Steps</h3>
            </div>

            <form onSubmit={handleLogStepsSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-[#c3caac] font-semibold">Steps Walked Today</label>
                <input
                  type="number"
                  required
                  value={stepInput}
                  onChange={(e) => setStepInput(e.target.value)}
                  className="w-full bg-[#201f1f] border border-[#353534] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#4b8eff] mt-1"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#4b8eff] hover:bg-[#3b7eff] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-colors shadow-md"
                >
                  Log Steps
                </button>
                <button
                  type="button"
                  onClick={() => setShowStepModal(false)}
                  className="bg-[#353534] hover:bg-[#434933] text-white font-medium text-xs py-3 px-4 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
