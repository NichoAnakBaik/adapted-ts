"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

async function checkAuth(role?: string) {
  const session = await getSession();
  if (!session) redirect("/?login=true");
  if (role && session.user.role !== role) redirect("/?login=true");
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

export async function getStudentClasses() {
  const session = await checkAuth("SISWA");
  const enrollments = await prisma.enrollment.findMany({
    where: { student_id: session.user.id },
    include: { class: { select: { id: true, name: true, type: true } } },
    orderBy: { created_at: 'desc' }
  });
  return enrollments.map(e => e.class);
}

export async function studentCheckIn(classId: string) {
  const session = await checkAuth("SISWA");
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
    return { error: "Sesi sudah ada hari ini." };
  }

  await prisma.attendance.create({
    data: {
      student_id: session.user.id,
      class_id: classId,
      date: new Date(), 
      check_in_time: new Date(),
      status: 'PRESENT',
      notes: "Sesi Aktif"
    }
  });

  return { success: true };
}

export async function studentCheckOut(attendanceId: string) {
  const session = await checkAuth("SISWA");
  
  const attendance = await prisma.attendance.findFirst({
    where: { id: attendanceId, student_id: session.user.id }
  });

  if (!attendance) {
    return { error: "Sesi tidak ditemukan." };
  }

  if (attendance.check_out_time) {
    return { error: "Anda sudah melakukan Check-Out untuk sesi ini." };
  }

  await prisma.attendance.update({
    where: { id: attendanceId },
    data: { check_out_time: new Date() }
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
