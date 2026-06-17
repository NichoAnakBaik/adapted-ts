import React from "react";
import ProfileSettingsClient from "@/components/ProfileSettingsClient";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function SiswaPengaturanPage() {
  const session = await getSession();
  if (!session || session.user.role !== "SISWA") redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { nama_lengkap: true, username: true }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-namsan-text mb-1">Pengaturan Akun</h1>
        <p className="text-namsan-text-muted">Kelola informasi profil dan keamanan akun Anda.</p>
      </div>
      <ProfileSettingsClient user={user} />
    </div>
  );
}
