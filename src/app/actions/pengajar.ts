"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { saveUploadedFile } from "@/lib/upload";

// Basic authorization check for Pengajar
async function checkPengajarAuth() {
  const session = await getSession();
  if (!session || session.user?.role !== "PENGAJAR") {
    redirect("/?login=true");
  }
  return session;
}

// --- CLASS VIEWS ---

export async function getTeacherDashboardStats() {
  const session = await checkPengajarAuth();
  const teacherId = session.user.id;

  const activeClassesCount = await prisma.class.count({
    where: { teacher_id: teacherId }
  });

  const students = await prisma.enrollment.findMany({
    where: { class: { teacher_id: teacherId } },
    select: { student_id: true }
  });
  const uniqueStudentsCount = new Set(students.map(s => s.student_id)).size;

  const examsCount = await prisma.exam.count({
    where: { class: { teacher_id: teacherId } }
  });

  // ML Engine: Aggregate weak points
  const questionAttempts = await prisma.questionAttempt.findMany({
    where: {
      exam_attempt: {
        exam: { class: { teacher_id: teacherId } }
      }
    },
    include: { question: { select: { type: true } } }
  });

  let weakType = "SPEAKING"; // fallback
  if (questionAttempts.length > 0) {
    const scoresByType: Record<string, { totalScore: number, count: number }> = {};
    questionAttempts.forEach(qa => {
      const t = qa.question.type;
      if (!scoresByType[t]) scoresByType[t] = { totalScore: 0, count: 0 };
      scoresByType[t].totalScore += (qa.score || 0);
      scoresByType[t].count += 1;
    });

    let lowestAvg = Infinity;
    for (const [t, data] of Object.entries(scoresByType)) {
      const avg = data.totalScore / data.count;
      if (avg < lowestAvg) {
        lowestAvg = avg;
        weakType = t;
      }
    }
  }

  // Generate Recommendation text based on weakType
  const typeLabels: Record<string, string> = {
    "SPEAKING": "Berbicara (Speaking)",
    "LISTENING": "Mendengarkan (Listening)",
    "WRITING": "Menulis (Writing)",
    "READING": "Membaca (Reading)",
    "MULTIPLE_CHOICE": "Pilihan Ganda Dasar"
  };

  const weakPointName = typeLabels[weakType] || weakType;
  
  let recommendationText = `Sistem AI belum dapat mendeteksi pola karena data masih sedikit.`;
  if (questionAttempts.length > 0) {
    recommendationText = `Berdasarkan hasil analisis AI pada seluruh kuis terbaru, sebagian besar siswa Anda paling banyak kehilangan poin pada bagian **${weakPointName}**. AI merekomendasikan Anda untuk menambahkan sesi latihan khusus atau mengunggah modul tambahan terkait ${weakPointName} untuk meningkatkan retensi siswa.`;
  }

  return {
    teacherName: session.user.username,
    activeClassesCount,
    uniqueStudentsCount,
    examsCount,
    mlRecommendation: recommendationText
  };
}
export async function getTeacherClasses() {
  const session = await checkPengajarAuth();
  
  return prisma.class.findMany({
    where: { teacher_id: session.user.id },
    include: {
      _count: { select: { enrollments: true, exams: true } }
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function getClassDetails(id: string) {
  const session = await checkPengajarAuth();
  
  const classData = await prisma.class.findUnique({
    where: { id, teacher_id: session.user.id },
    include: {
      enrollments: {
        include: {
          student: {
            select: { id: true, nama_lengkap: true, username: true, created_at: true }
          }
        },
        orderBy: { created_at: 'desc' }
      },
      _count: { select: { exams: true } }
    }
  });

  return classData;
}

export async function updateMeetingLink(classId: string, meeting_link: string) {
  const session = await checkPengajarAuth();
  
  const classData = await prisma.class.findFirst({
    where: { id: classId, teacher_id: session.user.id }
  });

  if (!classData) return { error: "Akses ditolak atau kelas tidak ditemukan" };
  if (classData.type !== "ONLINE") return { error: "Link meeting hanya untuk kelas online" };

  await prisma.class.update({
    where: { id: classId },
    data: { meeting_link }
  });

  return { success: true };
}

export async function getTeacherAnalytics() {
  const session = await checkPengajarAuth();

  // Get all exams that belong to this teacher's classes
  const attempts = await prisma.examAttempt.findMany({
    where: {
      exam: {
        class: {
          teacher_id: session.user.id
        }
      }
    },
    include: {
      student: { select: { nama_lengkap: true, username: true } },
      exam: { select: { title: true, class: { select: { name: true } } } }
    },
    orderBy: { end_time: 'desc' }
  });

  // Get ML recommendations for students in this teacher's classes
  const recommendations = await prisma.recommendationHistory.findMany({
    where: {
      student: {
        enrollments: {
          some: {
            class: {
              teacher_id: session.user.id
            }
          }
        }
      }
    },
    include: {
      student: { select: { nama_lengkap: true } }
    },
    orderBy: { created_at: 'desc' },
    take: 20
  });

  // Group scores by student to find struggling students
  const studentStats: Record<string, { id: string, name: string, totalScore: number, attemptsCount: number, class: string }> = {};
  
  attempts.forEach(attempt => {
    if (!studentStats[attempt.student_id]) {
      studentStats[attempt.student_id] = {
        id: attempt.student_id,
        name: attempt.student.nama_lengkap,
        totalScore: 0,
        attemptsCount: 0,
        class: attempt.exam.class.name
      };
    }
    studentStats[attempt.student_id].totalScore += (attempt.total_score || 0);
    studentStats[attempt.student_id].attemptsCount += 1;
  });

  const performanceList = Object.values(studentStats).map(stat => ({
    id: stat.id,
    name: stat.name,
    class: stat.class,
    average: stat.attemptsCount > 0 ? Math.round(stat.totalScore / stat.attemptsCount) : 0,
    attemptsCount: stat.attemptsCount
  }));

  // Sort by average score ascending (lowest first)
  performanceList.sort((a, b) => a.average - b.average);

  return { 
    attempts, 
    recommendations, 
    performanceList 
  };
}

// --- EXAM MANAGEMENT ---

export async function getQuizzes() {
  const session = await checkPengajarAuth();
  
  return prisma.exam.findMany({
    where: {
      class: { teacher_id: session.user.id },
      is_final: false
    },
    include: {
      class: { select: { name: true } },
      _count: { select: { questions: true, exam_attempts: true } }
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function getFinalExams() {
  const session = await checkPengajarAuth();
  
  return prisma.exam.findMany({
    where: {
      class: { teacher_id: session.user.id },
      is_final: true
    },
    include: {
      class: { select: { name: true } },
      _count: { select: { questions: true, exam_attempts: true } }
    },
    orderBy: { created_at: 'desc' }
  });
}


export async function createExam(formData: FormData) {
  const session = await checkPengajarAuth();
  
  const class_id = formData.get("class_id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const time_limit = parseInt(formData.get("time_limit") as string) || null;
  const is_final = formData.get("is_final") === "true";

  if (!class_id || !title) return { error: "Kelas dan Judul wajib diisi" };

  const classData = await prisma.class.findFirst({
    where: { id: class_id, teacher_id: session.user.id }
  });

  if (!classData) return { error: "Akses ditolak" };

  await prisma.exam.create({
    data: { class_id, title, description, time_limit, is_final }
  });

  return { success: true };
}

export async function toggleExamPublish(id: string, is_published: boolean) {
  const session = await checkPengajarAuth();
  // verify ownership
  const exam = await prisma.exam.findUnique({ where: { id }, include: { class: true } });
  if (exam?.class?.teacher_id !== session.user.id) return { error: "Akses ditolak" };

  await prisma.exam.update({ where: { id }, data: { is_published } });
  return { success: true };
}

export async function getExamDetails(id: string) {
  const session = await checkPengajarAuth();
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      class: true,
      questions: { orderBy: { created_at: 'asc' } },
      exam_attempts: {
        include: {
          student: {
            select: { id: true, nama_lengkap: true, username: true }
          }
        },
        orderBy: { created_at: 'desc' }
      }
    }
  });

  if (exam?.class?.teacher_id !== session.user.id) return null;
  return exam;
}

export async function createQuestion(formData: FormData) {
  const session = await checkPengajarAuth();
  const exam_id = formData.get("exam_id") as string;
  const type = formData.get("type") as any; // "SPEAKING" | "LISTENING" | "WRITING" | "READING"
  const format = formData.get("format") as string || "ESSAY";
  const question_text = formData.get("question_text") as string;
  const answer_key = formData.get("answer_key") as string;
  const audio_file = formData.get("audio_reference") as File | null;
  const image_file = formData.get("image_url") as File | null;
  const difficulty = parseInt(formData.get("difficulty") as string) || 1;
  const option_a = formData.get("option_a") as string | null;
  const option_b = formData.get("option_b") as string | null;
  const option_c = formData.get("option_c") as string | null;
  const option_d = formData.get("option_d") as string | null;

  if (!exam_id || !type || !question_text) return { error: "Data soal tidak lengkap" };

  const exam = await prisma.exam.findUnique({ where: { id: exam_id }, include: { class: true } });
  if (exam?.class?.teacher_id !== session.user.id) return { error: "Akses ditolak" };

  const audio_reference = audio_file ? await saveUploadedFile(audio_file, "kuis_audio") : null;
  const image_url = image_file ? await saveUploadedFile(image_file, "kuis_image") : null;

  await prisma.question.create({
    data: { 
      exam_id, type, format, question_text, answer_key, audio_reference, image_url, difficulty,
      option_a, option_b, option_c, option_d
    }
  });

  return { success: true };
}
