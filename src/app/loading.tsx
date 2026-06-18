import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-5 fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-xl border border-gray-200 flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-namsan-primary animate-spin" />
        <span className="text-sm font-bold text-gray-800">Memproses...</span>
      </div>
    </div>
  );
}
