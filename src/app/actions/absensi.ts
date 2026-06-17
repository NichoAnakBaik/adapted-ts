"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

async function checkAuth(role?: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (role && session.user.role !== role) redirect("/login");
  return session;
}

// ============================================
// SISWA ACTIONS
// ============================================

export async function getStudentAttendanceHistory() {
  const session = await checkAuth("SISWA");
  
  return prisma.attendance.findMany({
    where: { student_id: session.user.id },
    include: {
      class: { select: { name: true } }
    },
    orderBy: { date: 'desc' }
  });
}

export async function getStudentActiveClass() {
  const session = await checkAuth("SISWA");
  const enrollment = await prisma.enrollment.findFirst({
    where: { student_id: session.user.id },
    include: { class: { select: { id: true, name: true, type: true } } },
    orderBy: { created_at: 'desc' }
  });
  return enrollment?.class || null;
}

export async function studentCheckIn(classId: string) {
  const session = await checkAuth("SISWA");
  
  // Normalize today's date to midnight for unique constraints (if we want to limit 1 per day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if already checked in today
  const existing = await prisma.attendance.findFirst({
    where: {
      student_id: session.user.id,
      class_id: classId,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  });

  if (existing) {
    return { error: "Anda sudah melakukan presensi hari ini." };
  }

  await prisma.attendance.create({
    data: {
      student_id: session.user.id,
      class_id: classId,
      date: new Date(), // Exact time for display
      status: 'PRESENT',
      notes: "Hadir mandiri via Siswa Panel"
    }
  });

  return { success: true };
}

// ============================================
// PENGAJAR ACTIONS
// ============================================

export async function getClassesForTeacher() {
  const session = await checkAuth("PENGAJAR");
  return prisma.class.findMany({
    where: { teacher_id: session.user.id },
    select: { id: true, name: true }
  });
}

export async function getClassAttendanceForTeacher(classId: string, dateStr: string) {
  await checkAuth("PENGAJAR");
  
  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);
  const nextDate = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

  return prisma.attendance.findMany({
    where: {
      class_id: classId,
      date: {
        gte: targetDate,
        lt: nextDate
      }
    },
    include: {
      student: { select: { nama_lengkap: true, username: true } }
    },
    orderBy: { date: 'asc' }
  });
}
