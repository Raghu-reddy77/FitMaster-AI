"use client";

import React, { useState } from "react";
import { useApp } from "@/frontend/context/AppContext";
import { useToast } from "@/frontend/components/Toast";
import { TransformationGoal } from "@/backend/db";
import { User, Weight, Ruler, Sparkles, ArrowRight, Target, Flame, Scissors, Zap } from "lucide-react";

export function OnboardingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { userProfile, updateUserProfile } = useApp();
  const { showToast } = useToast();

  const [name, setName] = useState(userProfile.name || "Raghu");
  const [weightKg, setWeightKg] = useState(userProfile.weightKg?.toString() || "75");
  const [heightCm, setHeightCm] = useState(userProfile.heightCm?.toString() || "178");
  const [goal, setGoal] = useState<TransformationGoal>(userProfile.goal || "Lean Bulk");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !weightKg || !heightCm) return;

    await updateUserProfile(name.trim(), Number(weightKg), Number(heightCm), goal);
    showToast(`🎯 Profile set for ${name}! Target macro plan: ${goal}.`, "success");
    onClose();
  };

  // Target preview calculation
  const bw = Number(weightKg || 75);
  const ht = Number(heightCm || 178);
  const baseKcal = Math.round(bw * 30 + ht * 2);
  let targetKcal = baseKcal;
  let targetProtein = Math.round(bw * 2.2);

  if (goal === "Bulking") {
    targetKcal = baseKcal + 500;
  } else if (goal === "Cutting") {
    targetKcal = baseKcal - 400;
    targetProtein = Math.round(bw * 2.4);
  } else {
    targetKcal = baseKcal + 250;
  }

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1b1b] border border-[#bfff00]/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95">
        <div className="flex items-center gap-2.5 text-[#bfff00]">
          <div className="w-9 h-9 rounded-xl bg-[#bfff00]/20 border border-[#bfff00]/40 flex items-center justify-center">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Setup Your Transformation Profile</h3>
            <p className="text-xs text-[#c3caac]">Enter body metrics & pick your transformation goal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <div>
            <label className="text-xs font-semibold text-[#c3caac] flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5 text-[#bfff00]" /> Your Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Raghu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#201f1f] border border-[#353534] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#bfff00] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#c3caac] flex items-center gap-1.5 mb-1">
                <Weight className="w-3.5 h-3.5 text-[#4b8eff]" /> Body Weight (kg)
              </label>
              <input
                type="number"
                required
                step="0.1"
                placeholder="75"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full bg-[#201f1f] border border-[#353534] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#4b8eff] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#c3caac] flex items-center gap-1.5 mb-1">
                <Ruler className="w-3.5 h-3.5 text-[#adc6ff]" /> Height (cm)
              </label>
              <input
                type="number"
                required
                placeholder="178"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full bg-[#201f1f] border border-[#353534] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#adc6ff] transition-colors"
              />
            </div>
          </div>

          {/* Transformation Goal Selection */}
          <div>
            <label className="text-xs font-semibold text-[#c3caac] flex items-center gap-1.5 mb-1.5">
              <Target className="w-3.5 h-3.5 text-[#bfff00]" /> What Transformation Do You Want?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "Bulking", label: "Bulking", icon: "🏋️", detail: "+500 kcal Surplus" },
                { id: "Cutting", label: "Cutting", icon: "✂️", detail: "-400 kcal Deficit" },
                { id: "Lean Bulk", label: "Lean Bulk", icon: "💪", detail: "+250 kcal Clean" },
              ].map((g) => {
                const isSel = goal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id as TransformationGoal)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all active:scale-95 ${
                      isSel
                        ? "bg-[#bfff00]/20 border-[#bfff00] text-white shadow-[0_0_12px_rgba(191,255,0,0.2)]"
                        : "bg-[#201f1f] border-[#353534] text-[#c3caac] hover:border-[#c3caac]/40"
                    }`}
                  >
                    <span className="text-base">{g.icon}</span>
                    <span className="text-xs font-bold text-white mt-1">{g.label}</span>
                    <span className="text-[9px] text-[#bfff00] font-medium">{g.detail}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target preview */}
          <div className="p-3 bg-[#201f1f] rounded-xl border border-[#353534] text-xs text-[#c3caac] space-y-1">
            <span className="font-semibold text-white block">Calculated Target Plan ({goal}):</span>
            <div className="flex items-center justify-between text-[11px]">
              <span>Calories: <strong className="text-white">{targetKcal} kcal</strong></span>
              <span>Protein: <strong className="text-[#bfff00]">{targetProtein}g</strong></span>
              <span>Water: <strong className="text-[#4b8eff]">3.0 L</strong></span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#bfff00] hover:bg-[#a1d800] text-[#263500] font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(191,255,0,0.2)] flex items-center justify-center gap-2 active:scale-98"
          >
            Save Profile & Activate Goals <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
