"use client";

import { Navigation } from "@/frontend/components/Navigation";
import { useApp } from "@/frontend/context/AppContext";
import { useToast } from "@/frontend/components/Toast";
import { 
  Dumbbell, 
  Clock, 
  Flame, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Play, 
  RotateCcw,
  Plus,
  Zap,
  Award,
  ArrowLeft,
  Check,
  X,
  Trophy,
  Activity,
  Layers
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function WorkoutPage() {
  const { userProfile, activeWorkout, toggleExerciseSet, completeCurrentWorkout, generateCustomWorkout } = useApp();
  const { showToast } = useToast();

  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restCountdown, setRestCountdown] = useState(60);
  const [workoutCompletedModal, setWorkoutCompletedModal] = useState(false);

  const [selectedFocus, setSelectedFocus] = useState<string>("Chest & Push");
  const [selectedVariation, setSelectedVariation] = useState<string>("var-a");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showRestTimer && restCountdown > 0) {
      interval = setInterval(() => {
        setRestCountdown((prev) => prev - 1);
      }, 1000);
    } else if (restCountdown === 0) {
      setShowRestTimer(false);
      setRestCountdown(60);
      showToast("🔔 Rest Time Up! Ready for your next set!", "info");
    }
    return () => clearInterval(interval);
  }, [showRestTimer, restCountdown, showToast]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectWorkoutFocus = async (focusArea: string, variationId: string) => {
    setSelectedFocus(focusArea);
    setSelectedVariation(variationId);
    await generateCustomWorkout(focusArea, variationId);
    showToast(`🏋️ Generated ${focusArea} (${variationId === 'var-b' ? 'Variation B' : 'Variation A'}) for ${userProfile.weightKg}kg BW!`, "success");
  };

  const handleToggleSet = async (exerciseId: string, setIndex: number, currentCompleted: boolean) => {
    await toggleExerciseSet(exerciseId, setIndex);
    if (!currentCompleted) {
      showToast("💪 Set completed!", "success");
      setShowRestTimer(true);
      setRestCountdown(60);
    }
  };

  const handleFinishWorkout = async () => {
    setIsTimerRunning(false);
    await completeCurrentWorkout();
    setWorkoutCompletedModal(true);
    showToast("🎉 Workout Session Completed! Stats saved.", "success");
  };

  // Calculate completed sets
  let totalSets = 0;
  let completedSetsCount = 0;
  activeWorkout.exercises.forEach((ex) => {
    totalSets += ex.sets.length;
    ex.sets.forEach((set) => {
      if (set.completed) completedSetsCount++;
    });
  });

  const progressPercent = totalSets > 0 ? Math.round((completedSetsCount / totalSets) * 100) : 0;

  const workoutCategories = [
    {
      category: "Chest & Push",
      icon: "💪",
      variations: [
        { id: "var-a", title: "Upper Chest Focus", desc: "Incline Barbell, Flat DB Bench, Cable Flyes, Overhead Ext" },
        { id: "var-b", title: "Heavy Flat Bench Power", desc: "Flat Barbell Bench, Weighted Dips, DB Lateral Raises, Skullcrushers" },
      ]
    },
    {
      category: "Back & Pull",
      icon: "🏋️",
      variations: [
        { id: "var-a", title: "Lat Width Focus", desc: "Wide Lat Pulldowns, Straight-Arm Pullovers, DB Rows, Hammer Curls" },
        { id: "var-b", title: "Thick Back & Deadlift", desc: "Barbell Deadlifts, Heavy T-Bar Rows, DB Rows, Preacher Curls" },
      ]
    },
    {
      category: "Leg Day",
      icon: "🦵",
      variations: [
        { id: "var-a", title: "Quad Sweep Focus", desc: "Barbell Back Squats, 45° Leg Press, Walking Lunges, Calf Raises" },
        { id: "var-b", title: "Posterior & Glute Focus", desc: "Barbell RDLs, Hip Thrusts, Lying Leg Curls, Seated Calf Raises" },
      ]
    },
    {
      category: "Full Body",
      icon: "⚡",
      variations: [
        { id: "var-a", title: "Heavy Compound Strength", desc: "Goblet Squats, Push-up Rows, DB RDLs, Core Holds" },
        { id: "var-b", title: "HIIT & Core Blast", desc: "Kettlebell Swings, DB Thrusters, Hanging Leg Raises, Plank Taps" },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col pb-24 md:pb-10 md:pl-64">
      {/* Header Bar */}
      <header className="pt-6 pb-4 px-4 sm:px-6 max-w-5xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl bg-[#201f1f] text-[#c3caac] hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#bfff00]">AI Session Planner</span>
            <h1 className="text-2xl font-bold text-white tracking-tight">{activeWorkout.title}</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 space-y-6">
        {/* Interactive Workout Focus & Variations Selection */}
        <section className="bg-[#201f1f] rounded-2xl border border-[#434933]/50 p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#bfff00]">
              <Layers className="w-4 h-4" />
              <h2 className="text-xs font-bold uppercase tracking-wider">Select Workout Focus & Variations</h2>
            </div>
            <span className="text-xs text-[#c3caac]">Adjusted for {userProfile.goal} ({userProfile.weightKg}kg BW)</span>
          </div>

          <div className="space-y-4">
            {workoutCategories.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <span>{cat.icon}</span>
                  <span>{cat.category}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {cat.variations.map((v) => {
                    const isSel = selectedFocus.toLowerCase().includes(cat.category.toLowerCase().split(" ")[0]) && selectedVariation === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => handleSelectWorkoutFocus(cat.category, v.id)}
                        className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all active:scale-95 ${
                          isSel
                            ? "bg-[#bfff00]/20 border-[#bfff00] shadow-[0_0_12px_rgba(191,255,0,0.2)]"
                            : "bg-[#181818] border-[#353534] hover:border-[#c3caac]/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">{v.title}</h4>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            isSel ? "bg-[#bfff00] text-[#263500]" : "bg-[#353534] text-[#c3caac]"
                          }`}>
                            {v.id === "var-a" ? "Var A" : "Var B"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#c3caac] mt-1 line-clamp-1">{v.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Active Session Timer Card */}
        <section className="bg-gradient-to-r from-[#201f1f] via-[#2a2a2a] to-[#201f1f] border border-[#bfff00]/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#bfff00] text-[#263500] flex items-center justify-center font-bold shadow-[0_0_15px_rgba(191,255,0,0.3)]">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs text-[#c3caac] uppercase tracking-wider font-semibold">Active Session Timer</span>
                <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
                  {formatTimer(seconds)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowRestTimer(true);
                  setRestCountdown(60);
                  showToast("⏱️ 60-Second Rest Timer Started", "info");
                }}
                className="bg-[#353534] hover:bg-[#434933] text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#bfff00]" />
                Rest 60s
              </button>

              <button
                onClick={handleFinishWorkout}
                className="bg-[#bfff00] hover:bg-[#a1d800] text-[#263500] font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-[0_0_15px_rgba(191,255,0,0.2)] transition-all active:scale-95"
              >
                Finish Workout
              </button>
            </div>
          </div>

          {/* Rest Countdown Bar */}
          {showRestTimer && (
            <div className="mt-4 p-3 bg-[#4b8eff]/10 border border-[#4b8eff]/30 rounded-xl flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2 text-[#4b8eff] text-xs font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4 animate-spin" />
                Rest Interval Countdown: <span className="font-mono text-sm text-white">{restCountdown}s</span>
              </div>
              <button
                onClick={() => setShowRestTimer(false)}
                className="text-[10px] bg-[#4b8eff]/20 text-[#4b8eff] hover:bg-[#4b8eff]/40 px-2 py-1 rounded-lg font-bold"
              >
                Skip Rest
              </button>
            </div>
          )}

          {/* Session Progress Bar */}
          <div className="mt-4 pt-3 border-t border-[#353534]/50">
            <div className="flex justify-between text-xs text-[#c3caac] mb-1 font-medium">
              <span>Overall Completion</span>
              <span>{completedSetsCount} / {totalSets} Sets ({progressPercent}%)</span>
            </div>
            <div className="h-2 w-full bg-[#353534] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#bfff00] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </section>

        {/* Generated Plan Exercises Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-[#c3caac] uppercase tracking-wider">
            Active Exercise Plan ({activeWorkout.exercises.length} Exercises)
          </h2>

          <div className="space-y-4">
            {activeWorkout.exercises.map((ex, exIdx) => {
              const exCompletedSets = ex.sets.filter((s) => s.completed).length;
              const isExDone = exCompletedSets === ex.sets.length;

              return (
                <div 
                  key={ex.id}
                  className={`bg-[#201f1f] rounded-2xl p-5 border transition-all shadow-md ${
                    isExDone ? "border-[#bfff00]/50 bg-[#1e2417]/40" : "border-[#353534]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isExDone ? "bg-[#bfff00] text-[#263500]" : "bg-[#353534] text-white"
                      }`}>
                        {exIdx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">{ex.name}</h3>
                          <span className="text-[10px] bg-[#353534] text-[#c3caac] px-2 py-0.5 rounded-md font-semibold">
                            {ex.category}
                          </span>
                        </div>
                        <p className="text-xs text-[#c3caac] mt-0.5">
                          Target: {ex.setsCount} sets × {ex.targetReps} reps @ {ex.targetWeight}
                        </p>
                      </div>
                    </div>

                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isExDone ? "bg-[#bfff00]/20 text-[#bfff00]" : "bg-[#353534] text-[#c3caac]"
                    }`}>
                      {exCompletedSets} / {ex.sets.length} Sets
                    </span>
                  </div>

                  {/* Interactive Sets List */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    {ex.sets.map((set, setIdx) => (
                      <button
                        key={setIdx}
                        onClick={() => handleToggleSet(ex.id, setIdx, set.completed)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all active:scale-95 ${
                          set.completed
                            ? "bg-[#bfff00]/15 border-[#bfff00]/60 text-white"
                            : "bg-[#181818] border-[#353534] text-[#c3caac] hover:border-[#c3caac]/50"
                        }`}
                      >
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider block text-[#c3caac]">Set {set.setNumber}</span>
                          <span className="text-xs font-bold text-white">{set.weight} kg × {set.targetReps}</span>
                        </div>
                        {set.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-[#bfff00] shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#353534] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Navigation />

      {/* Workout Completed Summary Modal */}
      {workoutCompletedModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1b1b] border border-[#bfff00]/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-[#bfff00]/20 text-[#bfff00] border border-[#bfff00]/50 flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-white">Workout Complete!</h3>
              <p className="text-xs text-[#c3caac] mt-1">Great job finishing today&apos;s session.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#201f1f] p-4 rounded-xl border border-[#353534]">
              <div>
                <span className="text-[10px] text-[#c3caac] font-bold uppercase">Time Elapsed</span>
                <p className="text-xl font-bold text-white">{formatTimer(seconds)}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#bfff00] font-bold uppercase">Est. Calories Burned</span>
                <p className="text-xl font-bold text-[#bfff00]">~{activeWorkout.estimatedCalories} kcal</p>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <Link
                href="/ai"
                onClick={() => setWorkoutCompletedModal(false)}
                className="flex-1 bg-[#bfff00] hover:bg-[#a1d800] text-[#263500] font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-colors shadow-md"
              >
                View Post-Workout AI Advice
              </Link>
              <button
                onClick={() => setWorkoutCompletedModal(false)}
                className="bg-[#353534] hover:bg-[#434933] text-white font-medium text-xs py-3 px-4 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
