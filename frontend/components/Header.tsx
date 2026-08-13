"use client";

import { useApp } from "@/frontend/context/AppContext";
import { useToast } from "@/frontend/components/Toast";
import { Sparkles, Plus, Droplets, RotateCcw, User, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { AuthModal } from "@/frontend/components/AuthModal";

export function Header() {
  const { userProfile, metrics, logWater, refreshMacros, logoutUserAccount } = useApp();
  const { showToast } = useToast();
  const [waterLoggedMessage, setWaterLoggedMessage] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleQuickWater = async () => {
    await logWater(0.25);
    setWaterLoggedMessage(true);
    setTimeout(() => setWaterLoggedMessage(false), 2000);
  };

  const handleRefreshMacros = async () => {
    await refreshMacros();
    showToast("🔄 Macros Refreshed to 0! Log your next meal or water.", "info");
  };

  return (
    <>
      <header className="pt-6 pb-4 px-4 sm:px-6 max-w-5xl mx-auto w-full flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#bfff00] bg-[#bfff00]/10 px-2.5 py-0.5 rounded-full border border-[#bfff00]/20">
              Thursday, Aug 13
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#4b8eff] bg-[#4b8eff]/10 px-2 py-0.5 rounded-full border border-[#4b8eff]/20">
              <Sparkles className="w-3 h-3" /> AI Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Good morning, {userProfile.name || "Raghu"} 👋
          </h1>
          <p className="text-sm text-[#c3caac] mt-0.5">
            {userProfile.goal} Plan ({userProfile.weightKg}kg BW): <strong className="text-white">{metrics.calories.target.toLocaleString()} kcal</strong> & <strong className="text-[#bfff00]">{metrics.protein.target}g protein</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAuthModal(true)}
            className="inline-flex items-center gap-1.5 bg-[#201f1f] hover:bg-[#2a2a2a] text-[#c3caac] hover:text-white border border-[#434933]/50 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 shadow-sm"
            title="Log In / Account Settings"
          >
            {userProfile.isLoggedIn ? <User className="w-3.5 h-3.5 text-[#bfff00]" /> : <LogIn className="w-3.5 h-3.5 text-[#4b8eff]" />}
            <span className="hidden sm:inline">{userProfile.isLoggedIn ? userProfile.name : "Log In"}</span>
          </button>

          <button
            onClick={handleRefreshMacros}
            className="inline-flex items-center gap-1.5 bg-[#201f1f] hover:bg-[#2a2a2a] text-[#c3caac] hover:text-white border border-[#434933]/50 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 shadow-sm"
            title="Refresh Macros (Reset to 0)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#bfff00]" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleQuickWater}
            className="relative inline-flex items-center gap-1.5 bg-[#201f1f] hover:bg-[#2a2a2a] text-white border border-[#434933]/50 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 shadow-sm"
            title="Quick Add 250ml Water"
          >
            <Droplets className="w-4 h-4 text-[#4b8eff]" />
            <span className="hidden sm:inline">+250ml</span>
            <Plus className="w-3.5 h-3.5 text-[#bfff00]" />

            {waterLoggedMessage && (
              <span className="absolute -bottom-7 right-0 text-[10px] bg-[#4b8eff] text-white px-2 py-0.5 rounded shadow animate-bounce">
                +250ml Added!
              </span>
            )}
          </button>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
