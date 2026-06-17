"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { loginAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.redirectUrl) {
      router.push(result.redirectUrl);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-namsan-bg p-4">
      <Card className="w-full max-w-md shadow-lg border-namsan-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-namsan-text">
            Masuk ke <span className="text-namsan-primary">AdapteEd</span>
          </CardTitle>
          <p className="text-sm text-namsan-text-muted mt-2">
            Platform Pembelajaran Bahasa Korea Interaktif
          </p>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-namsan-text mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-namsan-primary"
                placeholder="Gunakan admin, pengajar, atau siswa"
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
            
            {error && (
              <p className="text-namsan-red text-sm text-center">{error}</p>
            )}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </Button>
            
            <p className="text-xs text-center text-namsan-text-muted mt-4">
              Tip Dev: Login dengan username awalan <b>admin</b>, <b>pengajar</b>, atau <b>siswa</b> untuk masuk ke Dashboard masing-masing.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
