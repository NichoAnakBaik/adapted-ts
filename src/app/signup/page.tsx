"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { signupAction } from "@/app/actions/auth";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await signupAction(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else if (result?.success) {
        setSuccess("Akun berhasil dibuat! Mengalihkan ke halaman utama...");
        setTimeout(() => {
          window.location.href = result.redirectUrl || "/login";
        }, 1500);
      }
    } catch (e) {
      console.error(e);
      setError("Terjadi kesalahan sistem.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-namsan-bg p-4">
      <Card className="w-full max-w-md shadow-lg border-namsan-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-namsan-text">
            Daftar <span className="text-namsan-primary">AdapteEd</span>
          </CardTitle>
          <p className="text-sm text-namsan-text-muted mt-2">
            Buat akun Admin / Pengajar baru
          </p>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-namsan-text mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="nama_lengkap"
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-namsan-primary"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-namsan-text mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-namsan-primary"
                placeholder="Buat username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-namsan-text mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-namsan-primary"
                placeholder="********"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-namsan-text mb-1">
                Pilih Role
              </label>
              <select
                name="role"
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-namsan-primary bg-white"
              >
                <option value="ADMIN">Admin</option>
                <option value="PENGAJAR">Pengajar</option>
                <option value="SISWA">Siswa</option>
              </select>
            </div>
            
            {error && <p className="text-namsan-red text-sm text-center">{error}</p>}
            {success && <p className="text-green-600 text-sm text-center font-medium">{success}</p>}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Mendaftarkan..." : "Daftar Akun"}
            </Button>
            
            <p className="text-sm text-center text-namsan-text-muted mt-4">
              Sudah punya akun? <a href="/login" className="text-namsan-primary font-bold">Masuk di sini</a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
