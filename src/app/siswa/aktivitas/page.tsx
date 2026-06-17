import React from "react";
import ActivityLogTable from "@/components/ActivityLogTable";
import { getActivityLogs } from "@/app/actions/logs";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { History } from "lucide-react";

export default async function SiswaAktivitasPage() {
  const session = await getSession();
  if (!session || session.user.role !== "SISWA") redirect("/login");

  const logs = await getActivityLogs("SISWA");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-green-50 rounded-xl">
          <History className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-namsan-text mb-1">Riwayat Belajar Anda</h1>
          <p className="text-namsan-text-muted">Lihat kembali jejak belajar, durasi pembacaan modul, dan riwayat ujian Anda.</p>
        </div>
      </div>
      <ActivityLogTable logs={logs} role="SISWA" />
    </div>
  );
}
