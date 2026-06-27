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

export async function getStudentClasses() {
  const session = await checkAuth("SISWA");
  const enrollments = await prisma.enrollment.findMany({
    where: { student_id: session.user.id },
    include: { class: { select: { id: true, name: true, type: true } } },
    orderBy: { created_at: 'desc' }
  });
  return enrollments.map(e => e.class);
}

export async function getStudentAttendanceSessions(classId: string) {
  const session = await checkAuth("SISWA");
  
  return prisma.attendanceSession.findMany({
    where: { class_id: classId },
    include: {
      attendances: {
        where: { student_id: session.user.id }
      }
    },
    orderBy: { created_at: 'asc' }
  });
}

export async function studentMarkAttendance(sessionId: string, notes?: string) {
  const session = await checkAuth("SISWA");
  
  const existing = await prisma.attendance.findFirst({
    where: {
      student_id: session.user.id,
      session_id: sessionId,
    }
  });

  if (existing) {
    return { error: "Anda sudah melakukan absensi untuk sesi ini." };
  }

  await prisma.attendance.create({
    data: {
      student_id: session.user.id,
      session_id: sessionId,
      check_in_time: new Date(),
      status: 'PRESENT',
      notes: notes || "Hadir"
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

export async function getTeacherAttendanceSessions(classId: string) {
  await checkAuth("PENGAJAR");
  
  return prisma.attendanceSession.findMany({
    where: { class_id: classId },
    include: {
      _count: {
        select: { attendances: true }
      }
    },
    orderBy: { created_at: 'asc' }
  });
}

export async function generateAttendanceSessions(classId: string, count: number) {
  await checkAuth("PENGAJAR");
  
  const existing = await prisma.attendanceSession.count({
    where: { class_id: classId }
  });

  if (existing > 0) {
    return { error: "Sesi kelas ini sudah pernah digenerate." };
  }

  const sessions = Array.from({ length: count }).map((_, i) => ({
    class_id: classId,
    title: `Pertemuan ${i + 1}`,
  }));

  await prisma.attendanceSession.createMany({
    data: sessions
  });

  return { success: true };
}

export async function updateAttendanceSession(sessionId: string, formData: FormData) {
  await checkAuth("PENGAJAR");
  
  const dateStr = formData.get("date") as string;
  const description = formData.get("description") as string;
  const title = formData.get("title") as string;

  await prisma.attendanceSession.update({
    where: { id: sessionId },
    data: {
      title,
      description,
      date: dateStr ? new Date(dateStr) : null
    }
  });

  return { success: true };
}

export async function createSingleAttendanceSession(classId: string) {
  await checkAuth("PENGAJAR");

  const existingCount = await prisma.attendanceSession.count({
    where: { class_id: classId }
  });

  await prisma.attendanceSession.create({
    data: {
      class_id: classId,
      title: `Sesi Tambahan ${existingCount + 1}`,
    }
  });

  return { success: true };
}

export async function deleteAttendanceSession(sessionId: string) {
  await checkAuth("PENGAJAR");

  await prisma.attendanceSession.delete({
    where: { id: sessionId }
  });

  return { success: true };
}

export async function getSessionAttendances(sessionId: string) {
  // Can be called by PENGAJAR or ADMIN
  await checkAuth(); 
  
  const session = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    select: { class_id: true }
  });

  if (!session) return [];

  return prisma.attendance.findMany({
    where: { 
      session_id: sessionId,
      student: {
        enrollments: {
          some: {
            class_id: session.class_id
          }
        }
      }
    },
    include: {
      student: { select: { nama_lengkap: true, username: true } }
    },
    orderBy: { created_at: 'desc' }
  });
}

// ============================================
// ADMIN ACTIONS
// ============================================

export async function getAdminAllClasses() {
  await checkAuth("ADMIN");
  return prisma.class.findMany({
    select: { id: true, name: true },
    orderBy: { created_at: 'desc' }
  });
}

export async function getAdminAttendanceSessions(classId: string) {
  await checkAuth("ADMIN");
  return prisma.attendanceSession.findMany({
    where: { class_id: classId },
    include: {
      _count: {
        select: { attendances: true }
      }
    },
    orderBy: { created_at: 'asc' }
  });
}
