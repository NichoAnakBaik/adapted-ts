"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

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

export async function createModule(formData: FormData) {
  const session = await checkPengajarAuth();
  
  const class_id = formData.get("class_id") as string;
  const title = formData.get("title") as string;
  const pdf_url = formData.get("pdf_url") as string;
  const audio_url = formData.get("audio_url") as string;

  if (!class_id || !title) return { error: "Kelas dan Judul wajib diisi" };

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

export async function getExams() {
  const session = await checkPengajarAuth();
  
  return prisma.exam.findMany({
    where: {
      class: { teacher_id: session.user.id }
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
      questions: { orderBy: { created_at: 'asc' } }
    }
  });

  if (exam?.class?.teacher_id !== session.user.id) return null;
  return exam;
}

export async function createQuestion(formData: FormData) {
  const session = await checkPengajarAuth();
  const exam_id = formData.get("exam_id") as string;
  const type = formData.get("type") as any; // "SPEAKING" | "LISTENING" | "MULTIPLE_CHOICE"
  const question_text = formData.get("question_text") as string;
  const answer_key = formData.get("answer_key") as string;
  const audio_reference = formData.get("audio_reference") as string;
  const difficulty = parseInt(formData.get("difficulty") as string) || 1;
  const option_a = formData.get("option_a") as string | null;
  const option_b = formData.get("option_b") as string | null;
  const option_c = formData.get("option_c") as string | null;
  const option_d = formData.get("option_d") as string | null;

  if (!exam_id || !type || !question_text) return { error: "Data soal tidak lengkap" };

  const exam = await prisma.exam.findUnique({ where: { id: exam_id }, include: { class: true } });
  if (exam?.class?.teacher_id !== session.user.id) return { error: "Akses ditolak" };

  await prisma.question.create({
    data: { 
      exam_id, type, question_text, answer_key, audio_reference, difficulty,
      option_a, option_b, option_c, option_d
    }
  });

  return { success: true };
}
