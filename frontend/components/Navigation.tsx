"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/frontend/context/AppContext";
import { useState } from "react";
import { OnboardingModal } from "@/frontend/components/OnboardingModal";
import { 
  LayoutDashboard, 
  Utensils, 
  Dumbbell, 
  TrendingUp, 
  Bot,
  Zap,
  User
} from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const { userProfile } = useApp();
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/food", label: "Food", icon: Utensils },
    { href: "/workout", label: "Workout", icon: Dumbbell },
    { href: "/progress", label: "Progress", icon: TrendingUp },
    { href: "/ai", label: "AI Coach", icon: Bot, isAI: true },
  ];

  const displayName = userProfile.name || "Raghu";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#353534]/50 bg-[#1c1b1b] p-6 fixed inset-y-0 left-0 z-40">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-9 h-9 rounded-xl bg-[#bfff00] text-[#263500] flex items-center justify-center font-bold shadow-[0_0_12px_rgba(191,255,0,0.4)]">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-tight tracking-tight">FitMaster AI</h1>
            <p className="text-xs text-[#c3caac]">Pro Performance</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-[#201f1f] text-[#bfff00] border border-[#bfff00]/30 shadow-[0_0_10px_rgba(191,255,0,0.15)]"
                    : "text-[#c3caac] hover:text-white hover:bg-[#201f1f]/60"
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? "text-[#bfff00]" : "text-[#c3caac]"}`} />
                  {item.isAI && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#bfff00] rounded-full animate-pulse" />
                  )}
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Card at Bottom Left */}
        <div className="pt-4 border-t border-[#353534]/50">
          <button
            onClick={() => setShowProfileEdit(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#201f1f] hover:bg-[#2a2a2a] border border-[#353534] transition-all text-left group cursor-pointer"
            title="Click to edit user profile & transformation goals"
          >
            <div className="w-9 h-9 rounded-full bg-[#4b8eff] text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
              {userInitial}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-white truncate">{displayName}</p>
              <p className="text-[11px] text-[#bfff00] font-medium truncate">{userProfile.goal} ({userProfile.weightKg}kg)</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#131313]/95 backdrop-blur-lg border-t border-[#353534]/60 px-3 py-2 z-50">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all ${
                  isActive ? "text-[#bfff00]" : "text-[#c3caac] hover:text-white"
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.isAI && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#bfff00] rounded-full animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] font-semibold tracking-wider uppercase">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Profile Editor Modal Trigger */}
      <OnboardingModal
        isOpen={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
      />
    </>
  );
}
