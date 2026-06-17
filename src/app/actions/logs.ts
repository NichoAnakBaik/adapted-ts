"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getActivityLogs(targetRole: "ADMIN" | "PENGAJAR" | "SISWA") {
  const session = await getSession();
  if (!session) return [];

  const userId = session.user.id;

  try {
    if (targetRole === "ADMIN" && session.user.role === "ADMIN") {
      // Admin sees everything
      return await prisma.studentActivityLog.findMany({
        include: {
          student: { select: { nama_lengkap: true, username: true } }
        },
        orderBy: { created_at: 'desc' },
        take: 100 // Limit to last 100 logs
      });
    }

    if (targetRole === "PENGAJAR" && session.user.role === "PENGAJAR") {
      // Pengajar sees logs from students enrolled in their classes
      const teacherClasses = await prisma.class.findMany({
        where: { teacher_id: userId },
        include: { enrollments: true }
      });
      const studentIds = teacherClasses.flatMap(c => c.enrollments.map(e => e.student_id));

      return await prisma.studentActivityLog.findMany({
        where: { student_id: { in: studentIds } },
        include: {
          student: { select: { nama_lengkap: true, username: true } }
        },
        orderBy: { created_at: 'desc' },
        take: 100
      });
    }

    if (targetRole === "SISWA" && session.user.role === "SISWA") {
      // Siswa sees their own logs
      return await prisma.studentActivityLog.findMany({
        where: { student_id: userId },
        include: {
          student: { select: { nama_lengkap: true, username: true } }
        },
        orderBy: { created_at: 'desc' },
        take: 100
      });
    }

    return [];
  } catch (error) {
    console.error("Failed to get activity logs:", error);
    return [];
  }
}
