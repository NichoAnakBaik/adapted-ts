import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";

export default function SiswaDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-namsan-text">Annyeonghaseyo, Siswa! 👋</h1>
          <p className="text-namsan-text-muted">Mari lanjutkan perjalanan belajarmu hari ini.</p>
        </div>
        <Badge variant="primary" className="text-lg py-1 px-3">Beginner A1</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="highlight">
            <CardHeader>
              <CardTitle>Pelajaran Selanjutnya</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-namsan-text-muted mb-4">
                Kamu berhenti di <b>Modul 3: Cara Membaca Hangeul Gabungan</b>.
              </p>
              <Button variant="primary">Lanjutkan Belajar</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress Keseluruhan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProgressBar progress={45} label="Korean Beginner A1" showValue />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-namsan-bg-alt rounded-lg text-center">
                  <p className="text-3xl font-bold text-namsan-text">12</p>
                  <p className="text-sm text-namsan-text-muted">Modul Selesai</p>
                </div>
                <div className="p-4 bg-namsan-bg-alt rounded-lg text-center">
                  <p className="text-3xl font-bold text-namsan-text">4</p>
                  <p className="text-sm text-namsan-text-muted">Kuis Dikerjakan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="blue">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>AI Feedback</CardTitle>
                <Badge variant="info">New</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-namsan-text-muted mb-4">
                Berdasarkan hasil kuis terakhirmu, akurasi <b>Writing</b> kamu sangat baik (90%), namun <b>Listening</b> perlu ditingkatkan (60%).
              </p>
              <Button variant="secondary" size="sm" fullWidth>
                Lihat Rekomendasi Modul Audio
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="primary">🎯 First Quiz</Badge>
                <Badge variant="primary">🔥 3-Days Streak</Badge>
                <Badge variant="default" className="opacity-50">🏆 Hangeul Master</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
