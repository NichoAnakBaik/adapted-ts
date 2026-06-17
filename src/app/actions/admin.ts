"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

// Basic authorization check
async function checkAdminAuth() {
  const session = await getSession();
  console.log("checkAdminAuth() -> session:", session);
  if (!session) {
    console.log("checkAdminAuth() -> No session, redirecting");
    redirect("/login");
  }
  if (session.user?.role !== "ADMIN") {
    console.log("checkAdminAuth() -> Role mismatch, redirecting. Expected ADMIN, got:", session.user?.role);
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
