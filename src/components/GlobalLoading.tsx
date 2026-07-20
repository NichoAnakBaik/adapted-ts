"use client";

import React, { createContext, useContext, useState } from "react";
import { Loader2 } from "lucide-react";

interface GlobalLoadingContextType {
  isLoading: boolean;
  loadingText: string;
  showLoading: (text?: string) => void;
  hideLoading: () => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextType | undefined>(undefined);

export function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Sedang memproses...");

  const showLoading = (text = "Sedang memproses...") => {
    setLoadingText(text);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
  };

  return (
    <GlobalLoadingContext.Provider value={{ isLoading, loadingText, showLoading, hideLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4 border border-white/20">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-md bg-namsan-primary/30 animate-pulse"></div>
              <Loader2 className="w-12 h-12 text-namsan-primary animate-spin relative z-10" />
            </div>
            <p className="text-gray-800 font-bold text-lg animate-pulse">{loadingText}</p>
          </div>
        </div>
      )}
    </GlobalLoadingContext.Provider>
  );
}

export function useGlobalLoading() {
  const context = useContext(GlobalLoadingContext);
  if (context === undefined) {
    throw new Error("useGlobalLoading must be used within a GlobalLoadingProvider");
  }
  return context;
}
