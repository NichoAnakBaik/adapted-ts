import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col items-center bg-white p-8 rounded-3xl shadow-xl border border-gray-100 animate-in zoom-in-95 duration-300">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-namsan-primary rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Memuat...</h3>
        <p className="text-gray-500 font-medium text-center">
          Sistem sedang memproses permintaan Anda.
        </p>
      </div>
    </div>
  );
}
