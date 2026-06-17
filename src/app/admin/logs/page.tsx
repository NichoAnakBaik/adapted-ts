import React from "react";
import ActivityLogTable from "@/components/ActivityLogTable";
import { getActivityLogs } from "@/app/actions/logs";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default async function AdminLogsPage() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const logs = await getActivityLogs("ADMIN");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-50 rounded-xl">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-namsan-text mb-1">Log Sistem Terpadu</h1>
          <p className="text-namsan-text-muted">Pantau seluruh riwayat aktivitas siswa dari semua kelas di Namsan Korean Course.</p>
        </div>
      </div>
      <ActivityLogTable logs={logs} role="ADMIN" />
    </div>
  );
}
