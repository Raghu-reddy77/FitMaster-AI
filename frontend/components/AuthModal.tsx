"use client";

import React, { useState } from "react";
import { useApp } from "@/frontend/context/AppContext";
import { useToast } from "@/frontend/components/Toast";
import { TransformationGoal } from "@/backend/db";
import { User, Weight, Ruler, Sparkles, ArrowRight, Lock, Mail, Phone, Target, LogIn, UserPlus, X } from "lucide-react";

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { userProfile, loginUserAccount, registerUserAccount } = useApp();
  const { showToast } = useToast();

  const [mode, setMode] = useState<"login" | "register">("register");

  // Form State
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(userProfile.name || "Raghu");
  const [weightKg, setWeightKg] = useState(userProfile.weightKg?.toString() || "75");
  const [heightCm, setHeightCm] = useState(userProfile.heightCm?.toString() || "178");
  const [goal, setGoal] = useState<TransformationGoal>(userProfile.goal || "Lean Bulk");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim() || !password.trim()) return;

    if (mode === "login") {
      const ok = await loginUserAccount(emailOrPhone.trim(), password.trim());
      if (ok) {
        showToast(`👋 Welcome back! Logged in successfully.`, "success");
        onClose();
      } else {
        showToast("❌ Invalid Email/Phone or Password!", "error");
      }
    } else {
      if (!name.trim() || !weightKg || !heightCm) return;
      const ok = await registerUserAccount(
        emailOrPhone.trim(),
        password.trim(),
        name.trim(),
        Number(weightKg),
        Number(heightCm),
        goal
      );
      if (ok) {
        showToast(`🎉 Account created for ${name}! Target macro plan: ${goal}.`, "success");
        onClose();
      } else {
        showToast("⚠️ Account creation failed or account already exists!", "error");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1b1b] border border-[#bfff00]/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#c3caac] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Switcher: Login vs Register */}
        <div className="flex items-center gap-2 border-b border-[#353534] pb-3">
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === "register"
                ? "bg-[#bfff00] text-[#263500] shadow-[0_0_12px_rgba(191,255,0,0.2)]"
                : "bg-[#201f1f] text-[#c3caac] hover:text-white"
            }`}
          >
            <UserPlus className="w-4 h-4" /> Create Account
          </button>

          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === "login"
                ? "bg-[#4b8eff] text-white shadow-[0_0_12px_rgba(75,142,255,0.2)]"
                : "bg-[#201f1f] text-[#c3caac] hover:text-white"
            }`}
          >
            <LogIn className="w-4 h-4" /> Log In
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-[#c3caac] flex items-center gap-1.5 mb-1">
              <Mail className="w-3.5 h-3.5 text-[#bfff00]" /> Email or Phone Number
            </label>
            <input
              type="text"
              required
              placeholder="raghu@example.com or +1234567890"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="w-full bg-[#201f1f] border border-[#353534] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#bfff00] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#c3caac] flex items-center gap-1.5 mb-1">
              <Lock className="w-3.5 h-3.5 text-[#4b8eff]" /> Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#201f1f] border border-[#353534] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#4b8eff] transition-colors"
            />
          </div>

          {mode === "register" && (
            <>
              <div>
                <label className="text-xs font-semibold text-[#c3caac] flex items-center gap-1.5 mb-1">
                  <User className="w-3.5 h-3.5 text-[#bfff00]" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Raghu"
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

              <div>
                <label className="text-xs font-semibold text-[#c3caac] flex items-center gap-1.5 mb-1.5">
                  <Target className="w-3.5 h-3.5 text-[#bfff00]" /> Transformation Goal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "Bulking", label: "Bulking", icon: "🏋️" },
                    { id: "Cutting", label: "Cutting", icon: "✂️" },
                    { id: "Lean Bulk", label: "Lean Bulk", icon: "💪" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGoal(g.id as TransformationGoal)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        goal === g.id
                          ? "bg-[#bfff00]/20 border-[#bfff00] text-white font-bold"
                          : "bg-[#201f1f] border-[#353534] text-[#c3caac]"
                      }`}
                    >
                      <span className="text-sm block">{g.icon}</span>
                      <span className="text-[11px]">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-[#bfff00] hover:bg-[#a1d800] text-[#263500] font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(191,255,0,0.2)] flex items-center justify-center gap-2 active:scale-98 mt-2"
          >
            {mode === "register" ? "Create Account & Save Data" : "Log In to Your Account"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
