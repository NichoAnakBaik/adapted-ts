import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { getDashboardStats } from "@/app/actions/admin";

export default async function AdminDashboardPage() {
  const { totalSiswa, totalPengajar, totalKelas } = await getDashboardStats();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-namsan-text">Admin Dashboard</h1>
      <p className="text-namsan-text-muted">Monitoring data dan aktivitas platform AdapteEd.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-namsan-primary">{totalSiswa}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Pengajar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-namsan-blue">{totalPengajar}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Kelas Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-namsan-text">{totalKelas}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Login Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-namsan-text-muted">
            <p>Fitur integrasi Logbook segera hadir...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
