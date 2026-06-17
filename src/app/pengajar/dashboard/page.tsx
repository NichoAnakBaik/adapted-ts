import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function PengajarDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-namsan-text">Pengajar Dashboard</h1>
      <p className="text-namsan-text-muted">Pantau aktivitas kelas dan performa siswa Anda.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Kelas Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium text-namsan-text">Korean Beginner A1</p>
                  <p className="text-sm text-namsan-text-muted">30 Siswa</p>
                </div>
                <Badge variant="primary">Online</Badge>
              </li>
              <li className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-namsan-text">TOPIK Preparation</p>
                  <p className="text-sm text-namsan-text-muted">15 Siswa</p>
                </div>
                <Badge variant="default">Offline</Badge>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card variant="blue">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>AI Analitik Kelas</CardTitle>
              <Badge variant="info">Insight</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-namsan-text-muted">
              Berdasarkan hasil kuis terakhir, 40% siswa di <b>Beginner A1</b> masih kesulitan pada bagian <i>Listening</i>.
              Disarankan untuk memberikan modul audio tambahan.
            </p>
            <div>
              <ProgressBar progress={60} label="Rata-rata Kelas (Speaking)" showValue />
            </div>
            <div>
              <ProgressBar progress={35} label="Rata-rata Kelas (Listening)" showValue className="text-namsan-red" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
