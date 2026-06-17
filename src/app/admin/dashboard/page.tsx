import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function AdminDashboardPage() {
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
            <p className="text-4xl font-bold text-namsan-primary">1,204</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Pengajar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-namsan-blue">45</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Kelas Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-namsan-text">32</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Login Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-namsan-text-muted">
            <p>Siswa A login pada 08:00 KST</p>
            <p>Pengajar B mengunggah Modul pada 07:45 KST</p>
            <p>Siswa C menyelesaikan ujian pada 07:30 KST</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
