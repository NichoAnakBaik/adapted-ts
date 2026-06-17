"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

// Basic authorization check
async function checkAdminAuth() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }
}

export async function getDashboardStats() {
  await checkAdminAuth();
  
  const [totalSiswa, totalPengajar, totalKelas] = await Promise.all([
    prisma.user.count({ where: { role: "SISWA" } }),
    prisma.user.count({ where: { role: "PENGAJAR" } }),
    prisma.class.count(),
  ]);

  return { totalSiswa, totalPengajar, totalKelas };
}
