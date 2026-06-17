"use client";

import React, { useState } from "react";
import { User, KeyRound, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { updateProfile } from "@/app/actions/profile";

export default function ProfileSettingsClient({ user }: { user: any }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // Optionally reload to update sidebar/navbar
      setTimeout(() => window.location.reload(), 1500);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-namsan-text mb-6 flex items-center gap-2">
          <User className="w-6 h-6 text-namsan-primary" /> Pengaturan Profil
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-2 font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label>
            <input 
              type="text" 
              name="nama_lengkap" 
              defaultValue={user.nama_lengkap} 
              required 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-namsan-primary outline-none transition-colors" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
            <input 
              type="text" 
              name="username" 
              defaultValue={user.username} 
              required 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-namsan-primary outline-none transition-colors" 
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <KeyRound className="w-4 h-4" /> Ubah Password
            </h3>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password Baru (Opsional)</label>
            <input 
              type="password" 
              name="password" 
              placeholder="Kosongkan jika tidak ingin mengubah password" 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-namsan-primary outline-none transition-colors" 
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" /> {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
