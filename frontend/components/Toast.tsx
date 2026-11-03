"use client";

import React, { createContext, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5 ${
              toast.type === "success"
                ? "bg-[#1c2415]/90 border-[#bfff00]/50 text-[#bfff00]"
                : toast.type === "error"
                ? "bg-[#291515]/90 border-[#ff4b4b]/50 text-[#ff4b4b]"
                : "bg-[#152029]/90 border-[#4b8eff]/50 text-[#4b8eff]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5 shrink-0" />}
              {toast.type === "error" && <AlertCircle className="w-5 h-5 shrink-0" />}
              {toast.type === "info" && <Info className="w-5 h-5 shrink-0" />}
              <span className="text-xs font-semibold text-white leading-tight">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#c3caac] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
