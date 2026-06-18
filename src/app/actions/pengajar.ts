"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { saveUploadedFile } from "@/lib/upload";

// Basic authorization check for Pengajar
async function checkPengajarAuth() {
  const session = await getSession();
  if (!session || session.user?.role !== "PENGAJAR") {
    redirect("/login");
  }
  return session;
}

// --- CLASS VIEWS ---

export async function getTeacherClasses() {
  const session = await checkPengajarAuth();
  
  return prisma.class.findMany({
    where: { teacher_id: session.user.id },
    include: {
      _count: { select: { enrollments: true, modules: true } }
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
      modules: {
        orderBy: { created_at: 'asc' }
      },
      _count: { select: { modules: true, exams: true } }
    }
  });

  return classData;
}

// --- MODULE MANAGEMENT ---

export async function getModules() {
  const session = await checkPengajarAuth();
  
  // Get modules only for classes taught by this teacher
  return prisma.module.findMany({
    where: {
      class: {
        teacher_id: session.user.id
      }
    },
    include: {
      class: { select: { name: true } }
    },
    orderBy: { created_at: 'desc' }
  });
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

export async function createModule(formData: FormData) {
  const session = await checkPengajarAuth();
  
  const class_id = formData.get("class_id") as string;
  const title = formData.get("title") as string;
  const pdf_file = formData.get("pdf_url") as File | null;
  const audio_file = formData.get("audio_url") as File | null;

  if (!class_id || !title) return { error: "Kelas dan Judul wajib diisi" };

  const pdf_url = pdf_file ? await saveUploadedFile(pdf_file, "modul_pdf") : null;
  const audio_url = audio_file ? await saveUploadedFile(audio_file, "modul_audio") : null;

  // Verify the teacher owns this class
  const classData = await prisma.class.findFirst({
    where: { id: class_id, teacher_id: session.user.id }
  });

  if (!classData) return { error: "Akses ditolak atau kelas tidak ditemukan" };

  await prisma.module.create({
    data: {
      class_id,
      title,
      pdf_url: pdf_url || null,
      audio_url: audio_url || null
    }
  });

  return { success: true };
}

export async function deleteModule(id: string) {
  const session = await checkPengajarAuth();
  
  // Check ownership
  const moduleData = await prisma.module.findUnique({
    where: { id },
    include: { class: true }
  });

  if (moduleData?.class?.teacher_id !== session.user.id) {
    return { error: "Akses ditolak" };
  }

  await prisma.module.delete({ where: { id } });
  return { success: true };
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
      exam_id, type, question_text, answer_key, audio_reference, image_url, difficulty,
      option_a, option_b, option_c, option_d
    }
  });

  return { success: true };
}
