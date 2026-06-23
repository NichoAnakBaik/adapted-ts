"use client";

import React, { useState, useEffect } from "react";
import { User, KeyRound, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { updateProfile, getUserProfile } from "@/app/actions/profile";

export default function ProfileSettingsClient() {
  const [user, setUser] = useState<{ nama_lengkap: string, username: string } | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getUserProfile().then(data => {
      if (data) setUser(data);
      setIsLoading(false);
    });
  }, []);

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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-namsan-text flex items-center gap-2">
            <User className="w-6 h-6 text-namsan-primary" /> Pengaturan Profil
          </h2>
          <p className="text-sm text-namsan-text-muted mt-1">Perbarui informasi pribadi dan keamanan akun Anda.</p>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-12 text-gray-400 gap-3">
              <div className="w-8 h-8 border-4 border-namsan-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="font-medium text-sm">Memuat profil...</p>
            </div>
          ) : user ? (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

                <div className="pt-6 border-t border-gray-100 mt-6">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <KeyRound className="w-5 h-5 text-gray-400" /> Keamanan
                  </h3>
                  <div className="max-w-md">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Password Baru (Opsional)</label>
                    <input 
                      type="password" 
                      name="password" 
                      placeholder="Kosongkan jika tidak ingin mengubah" 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-namsan-primary outline-none transition-colors text-sm" 
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 text-sm shadow-md"
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
