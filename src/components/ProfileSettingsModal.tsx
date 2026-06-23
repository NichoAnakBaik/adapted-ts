"use client";

import React, { useState, useEffect } from "react";
import { User, KeyRound, Save, AlertCircle, CheckCircle2, X } from "lucide-react";
import { updateProfile, getUserProfile } from "@/app/actions/profile";

export default function ProfileSettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [user, setUser] = useState<{ nama_lengkap: string, username: string } | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getUserProfile().then(data => {
        if (data) setUser(data);
        setIsLoading(false);
      });
    } else {
      setError("");
      setSuccess("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const res = await updateProfile(formData);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Profil berhasil diperbarui!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <h2 className="text-lg md:text-xl font-bold text-namsan-text flex items-center gap-2">
            <User className="w-5 h-5 text-namsan-primary" /> Pengaturan Profil
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-12 text-gray-400 gap-3">
              <div className="w-8 h-8 border-4 border-namsan-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="font-medium text-sm">Memuat profil...</p>
            </div>
          ) : user ? (
            <>
              {error && (
                <div className="mb-4 md:mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                </div>
              )}

              {success && (
                <div className="mb-4 md:mb-6 p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label>
                  <input 
                    type="text" 
                    name="nama_lengkap" 
                    defaultValue={user.nama_lengkap} 
                    required 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-namsan-primary outline-none transition-colors text-sm" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                  <input 
                    type="text" 
                    name="username" 
                    defaultValue={user.username} 
                    required 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-namsan-primary outline-none transition-colors text-sm" 
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <KeyRound className="w-4 h-4" /> Ubah Password
                  </h3>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Password Baru (Opsional)</label>
                  <input 
                    type="password" 
                    name="password" 
                    placeholder="Kosongkan jika tidak ingin mengubah" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-namsan-primary outline-none transition-colors text-sm" 
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-sm"
                  >
                    <Save className="w-5 h-5" /> {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center text-red-500 py-8">Gagal memuat profil.</div>
          )}
        </div>
      </div>
    </div>
  );
}
