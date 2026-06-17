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
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="p-2 md:p-3 bg-green-50 rounded-xl shrink-0">
          <History className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-namsan-text mb-1">Riwayat Belajar Anda</h1>
          <p className="text-xs md:text-sm text-namsan-text-muted">Lihat kembali jejak belajar, durasi pembacaan modul, dan riwayat ujian Anda.</p>
        </div>
      </div>
      <ActivityLogTable logs={logs} role="SISWA" />
    </div>
  );
}
