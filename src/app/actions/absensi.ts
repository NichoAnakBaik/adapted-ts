"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

  // Ambil data sesi kelas untuk notifikasi ke pengajar
  const attSession = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    include: { class: true }
  });

  if (attSession && attSession.class.teacher_id) {
    const { createNotification } = await import("./notification");
    await createNotification(
      attSession.class.teacher_id,
      "Absensi Diisi",
      `${session.user.nama_lengkap} telah mengisi absensi untuk ${attSession.title} di kelas ${attSession.class.name}.`,
      `/pengajar/absensi` // Atau link spesifik jika ada
    );
  }

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

  const session = await prisma.attendanceSession.update({
    where: { id: sessionId },
    data: {
      title,
      description,
      date: dateStr ? new Date(dateStr) : null
    },
    include: { class: { include: { enrollments: true } } }
  });

  // Notifikasi ke siswa bahwa sesi telah diupdate/dibuka
  const studentIds = session.class.enrollments.map((e: any) => e.student_id);
  if (studentIds.length > 0) {
    const { createNotificationsForUsers } = await import("./notification");
    await createNotificationsForUsers(
      studentIds,
      "Absensi Dibuka",
      `Sesi absensi untuk ${session.title} di kelas ${session.class.name} telah dibuka/diperbarui. Silakan isi kehadiran Anda.`,
      `/siswa/absensi`
    );
  }

  // AI Quiz Generation logic
  if (description && description.length > 10) {
    const examTitle = `Latihan Harian: ${title}`;
    const existingExam = await prisma.exam.findFirst({
      where: {
        class_id: session.class_id,
        title: examTitle
      }
    });

    if (!existingExam) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        
        const prompt = `Anda adalah guru bahasa Korea ahli. Berdasarkan deskripsi materi pertemuan berikut ini: "${description}"\n\nBuatkan 5 soal latihan tingkat dasar yang relevan dengan materi tersebut untuk menguji pemahaman siswa.\n\nSyarat penting:\n1. Variasikan tipe soal (field "type") sesuai kecocokan materi, gunakan salah satu dari: "READING", "WRITING", "SPEAKING", "LISTENING", atau "MULTIPLE_CHOICE".\n2. Walaupun tipe soal bervariasi, pastikan format menjawabnya tetap berupa pilihan ganda (A, B, C, D).\n3. Anda WAJIB merespons HANYA dengan JSON murni (array of objects), tanpa markdown, tanpa penjelasan lain.\n\nFormat output harus sama persis seperti ini:\n[\n  {\n    "type": "READING",\n    "question_text": "Apa arti kata X?",\n    "option_a": "A",\n    "option_b": "B",\n    "option_c": "C",\n    "option_d": "D",\n    "answer_key": "A"\n  }\n]`;

        const result = await model.generateContent(prompt);
        let text = result.response.text();
        
        // Robust extraction: Find the first '[' and last ']'
        const startIndex = text.indexOf('[');
        const endIndex = text.lastIndexOf(']');
        
        if (startIndex !== -1 && endIndex !== -1) {
          text = text.substring(startIndex, endIndex + 1);
          const questionsArray = JSON.parse(text);

          if (Array.isArray(questionsArray) && questionsArray.length > 0) {
          const newExam = await prisma.exam.create({
            data: {
              class_id: session.class_id,
              title: examTitle,
              description: `Latihan otomatis berdasarkan materi absensi: ${description}`,
              is_published: true,
              is_final: false,
              questions: {
                create: questionsArray.slice(0, 5).map((q: any) => {
                  let qType = "READING";
                  if (q.type && ["READING", "WRITING", "SPEAKING", "LISTENING", "MULTIPLE_CHOICE"].includes(q.type.toUpperCase())) {
                    qType = q.type.toUpperCase();
                  }
                  return {
                    type: qType as any,
                    format: "MULTIPLE_CHOICE",
                    question_text: q.question_text || "Pertanyaan",
                    option_a: q.option_a || "A",
                    option_b: q.option_b || "B",
                    option_c: q.option_c || "C",
                    option_d: q.option_d || "D",
                    answer_key: q.answer_key || "A",
                    difficulty: 2
                  };
                })
              }
            }
          });
          
          // Notifikasi Kuis AI baru ke siswa
          if (studentIds.length > 0) {
            const { createNotificationsForUsers } = await import("./notification");
            await createNotificationsForUsers(
              studentIds,
              "Kuis Baru (AI)",
              `Kuis latihan harian baru "${examTitle}" telah dibuat secara otomatis untuk kelas ${session.class.name}.`,
              `/siswa/ujian`
            );
          }
          return { success: true, quizGenerated: true };
          } else {
            console.error("AI returned malformed or empty array:", text);
          }
        } else {
          console.error("Could not find JSON array in AI response:", text);
        }
      } catch (error) {
        console.error("Failed to generate AI quiz from attendance:", error);
      }
    } else {
      // Quiz already exists
      return { success: true, quizGenerated: false, reason: 'exists' };
    }
  }

  return { success: true, quizGenerated: false };
}

export async function createSingleAttendanceSession(classId: string) {
  await checkAuth("PENGAJAR");

  const existingCount = await prisma.attendanceSession.count({
    where: { class_id: classId }
  });

  const newSession = await prisma.attendanceSession.create({
    data: {
      class_id: classId,
      title: `Sesi Tambahan ${existingCount + 1}`,
    },
    include: { class: { include: { enrollments: true } } }
  });

  const studentIds = newSession.class.enrollments.map((e: any) => e.student_id);
  if (studentIds.length > 0) {
    const { createNotificationsForUsers } = await import("./notification");
    await createNotificationsForUsers(
      studentIds,
      "Sesi Absensi Baru",
      `Pengajar telah membuat sesi absensi baru "${newSession.title}" untuk kelas ${newSession.class.name}.`,
      `/siswa/absensi`
    );
  }

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
