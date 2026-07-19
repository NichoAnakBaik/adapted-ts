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
          student: { 
            select: { 
              nama_lengkap: true, 
              username: true,
              enrollments: { include: { class: { select: { name: true } } } }
            } 
          }
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
      const classIds = teacherClasses.map(c => c.id);

      const allLogs = await prisma.studentActivityLog.findMany({
        where: { student_id: { in: studentIds } },
        include: {
          student: { 
            select: { 
              nama_lengkap: true, 
              username: true,
              enrollments: { include: { class: { select: { name: true } } } }
            } 
          }
        },
        orderBy: { created_at: 'desc' },
        take: 300 // Ambil lebih banyak untuk difilter di memory
      });

      // Filter: Hanya tampilkan log yang classId-nya milik pengajar ini, 
      // atau log global (tanpa classId) dari siswa yang diajarnya.
      const importantActions = ["QUIZ_ATTEMPT", "EXAM_ATTEMPT", "FORUM_PARTICIPATION", "MODULE_ACCESS", "ATTENDANCE_MARKED"];
      const filteredLogs = allLogs.filter(log => {
        // Jangan tampilkan log umum (LOGIN/LOGOUT) untuk pengajar, karena kurang relevan
        if (log.action_type === "LOGIN" || log.action_type === "LOGOUT") return false;

        try {
          const meta = log.metadata ? JSON.parse(log.metadata) : {};
          if (meta.classId) {
            return classIds.includes(meta.classId);
          }
          
          // Jika tidak ada classId, tapi action-nya penting dan siswa tersebut 
          // merupakan murid dari pengajar ini, kita tampilkan saja.
          return importantActions.includes(log.action_type);
        } catch (e) {
          return importantActions.includes(log.action_type);
        }
      });

      return filteredLogs.slice(0, 100);
    }

    if (targetRole === "SISWA" && session.user.role === "SISWA") {
      // Siswa sees their own logs
      return await prisma.studentActivityLog.findMany({
        where: { student_id: userId },
        include: {
          student: { 
            select: { 
              nama_lengkap: true, 
              username: true,
              enrollments: { include: { class: { select: { name: true } } } }
            } 
          }
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
