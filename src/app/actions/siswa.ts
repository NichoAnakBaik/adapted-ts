"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

// Basic authorization check for Siswa
async function checkSiswaAuth() {
  const session = await getSession();
  if (!session || session.user?.role !== "SISWA") {
    redirect("/login");
  }
  return session;
}

// --- STUDENT MODULES ---

export async function getStudentModules() {
  const session = await checkSiswaAuth();
  
  // Find all classes the student is enrolled in
  const enrollments = await prisma.enrollment.findMany({
    where: { student_id: session.user.id },
    select: { class_id: true }
  });

  const classIds = enrollments.map(e => e.class_id);

  // Fetch all modules belonging to those classes
  return prisma.module.findMany({
    where: {
      class_id: { in: classIds }
    },
    include: {
      class: { select: { name: true, teacher: { select: { nama_lengkap: true } } } }
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function getDashboardStats() {
  const session = await checkSiswaAuth();
  const userId = session.user.id;

  // 1. Modul Lulus
  const completedModules = await prisma.learningProgress.count({
    where: { student_id: userId, is_completed: true }
  });

  // 2. Durasi Belajar (sum of duration in activity logs)
  const activityLogs = await prisma.studentActivityLog.aggregate({
    where: { student_id: userId },
    _sum: { duration: true }
  });
  const totalDurationSeconds = activityLogs._sum.duration || 0;
  const durationMinutes = Math.floor(totalDurationSeconds / 60);

  // 3. Active Class details
  const activeEnrollment = await prisma.enrollment.findFirst({
    where: { student_id: userId },
    include: { class: true },
    orderBy: { created_at: 'desc' }
  });

  return {
    nama_lengkap: session.user.username, // Using username as fallback if nama_lengkap is not in session
    completedModules,
    durationMinutes,
    activeClass: activeEnrollment?.class || null
  };
}
