import React from "react";
import ActivityLogTable from "@/components/ActivityLogTable";
import { getActivityLogs } from "@/app/actions/logs";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ActivitySquare } from "lucide-react";

export default async function PengajarAktivitasPage() {
  const session = await getSession();
  if (!session || session.user.role !== "PENGAJAR") redirect("/?login=true");

  const logs = await getActivityLogs("PENGAJAR");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-purple-50 rounded-xl">
          <ActivitySquare className="w-8 h-8 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-namsan-text mb-1">Aktivitas Siswa</h1>
          <p className="text-namsan-text-muted">Pantau jejak belajar dan ujian dari seluruh siswa di kelas Anda.</p>
        </div>
      </div>
      <ActivityLogTable logs={logs} role="PENGAJAR" />
    </div>
  );
}
