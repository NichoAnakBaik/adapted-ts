"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

// Basic authorization check
async function checkAdminAuth() {
  const session = await getSession();
  console.log("checkAdminAuth() -> session:", session);
  if (!session) {
    console.log("checkAdminAuth() -> No session, redirecting");
    redirect("/login");
  }
  if (session.user?.role !== "ADMIN") {
    console.log("checkAdminAuth() -> Role mismatch, redirecting. Expected ADMIN, got:", session.user?.role);
    redirect("/login");
  }
}

export async function getDashboardStats() {
  await checkAdminAuth();
  
  const [totalSiswa, totalPengajar, totalKelas] = await Promise.all([
    prisma.user.count({ where: { role: "SISWA" } }),
    prisma.user.count({ where: { role: "PENGAJAR" } }),
    prisma.class.count(),
  ]);

  return { totalSiswa, totalPengajar, totalKelas };
}

// --- USER MANAGEMENT ---

export async function getUsers() {
  await checkAdminAuth();
  return prisma.user.findMany({
    orderBy: { created_at: 'desc' }
  });
}

export async function deleteUser(id: string) {
  await checkAdminAuth();
  await prisma.user.delete({ where: { id } });
  return { success: true };
}
export async function adminCreateUser(formData: FormData) {
  await checkAdminAuth();
  const nama_lengkap = formData.get("nama_lengkap") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "ADMIN" | "PENGAJAR" | "SISWA";

  if (!nama_lengkap || !username || !password || !role) {
    return { error: "Semua kolom harus diisi" };
  }

  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) return { error: "Username sudah digunakan" };

  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.default.hash(password, 10);

  await prisma.user.create({
    data: { nama_lengkap, username, password: passwordHash, role },
  });

  return { success: true };
}
// --- CLASS MANAGEMENT ---

export async function getClasses() {
  await checkAdminAuth();
  return prisma.class.findMany({
    include: {
      teacher: { select: { nama_lengkap: true } },
      _count: { select: { enrollments: true } }
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function getClassDetails(id: string) {
  await checkAdminAuth();
  return prisma.class.findUnique({
    where: { id },
    include: {
      teacher: true,
      enrollments: {
        include: { student: true }
      }
    }
  });
}

export async function createClass(formData: FormData) {
  await checkAdminAuth();
  const name = formData.get("name") as string;
  const type = formData.get("type") as "ONLINE" | "OFFLINE";
  const schedule = formData.get("schedule") as string;
  const meeting_link = formData.get("meeting_link") as string;

  if (!name || !type) return { error: "Nama kelas dan tipe wajib diisi" };

  await prisma.class.create({
    data: { name, type, schedule, meeting_link: meeting_link || null }
  });
  return { success: true };
}

export async function deleteClass(id: string) {
  await checkAdminAuth();
  await prisma.class.delete({ where: { id } });
  return { success: true };
}

export async function assignTeacher(classId: string, teacherId: string | null) {
  await checkAdminAuth();
  await prisma.class.update({
    where: { id: classId },
    data: { teacher_id: teacherId }
  });
  return { success: true };
}

// --- ENROLLMENT MANAGEMENT ---

export async function enrollStudent(classId: string, studentId: string) {
  await checkAdminAuth();
  try {
    await prisma.enrollment.create({
      data: { class_id: classId, student_id: studentId }
    });
    return { success: true };
  } catch (e) {
    return { error: "Siswa sudah terdaftar di kelas ini" };
  }
}

export async function unenrollStudent(enrollmentId: string) {
  await checkAdminAuth();
  await prisma.enrollment.delete({ where: { id: enrollmentId } });
  return { success: true };
}

// --- CERTIFICATE MANAGEMENT ---

export async function getCertificates() {
  await checkAdminAuth();
  return prisma.certificate.findMany({
    include: {
      student: { select: { nama_lengkap: true, username: true } },
      class: { select: { name: true } }
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function createOrUpdateCertificate(formData: FormData) {
  await checkAdminAuth();
  const id = formData.get("id") as string;
  const student_id = formData.get("student_id") as string;
  const class_id = formData.get("class_id") as string;
  const file_url = formData.get("file_url") as string;
  const status = formData.get("status") as "PENDING" | "APPROVED" | "REJECTED";

  if (id) {
    // Update existing
    await prisma.certificate.update({
      where: { id },
      data: { file_url, status }
    });
  } else {
    // Create new
    if (!student_id || !class_id || !file_url) return { error: "Data tidak lengkap" };
    await prisma.certificate.create({
      data: { student_id, class_id, file_url, status }
    });
  }
  return { success: true };
}

export async function deleteCertificate(id: string) {
  await checkAdminAuth();
  await prisma.certificate.delete({ where: { id } });
  return { success: true };
}

// --- MODULE MANAGEMENT (ADMIN) ---

export async function getAdminModules() {
  await checkAdminAuth();
  return prisma.module.findMany({
    include: { class: { select: { name: true } } },
    orderBy: { created_at: 'desc' }
  });
}

export async function createAdminModule(formData: FormData) {
  await checkAdminAuth();
  const class_id = formData.get("class_id") as string;
  const title = formData.get("title") as string;
  const pdf_url = formData.get("pdf_url") as string;
  const audio_url = formData.get("audio_url") as string;

  if (!class_id || !title) return { error: "Kelas dan Judul wajib diisi" };

  await prisma.module.create({
    data: { class_id, title, pdf_url: pdf_url || null, audio_url: audio_url || null }
  });
  return { success: true };
}

export async function deleteAdminModule(id: string) {
  await checkAdminAuth();
  await prisma.module.delete({ where: { id } });
  return { success: true };
}

// --- KUIS & UJIAN MANAGEMENT (ADMIN) ---

export async function getAdminQuizzes() {
  await checkAdminAuth();
  return prisma.exam.findMany({
    where: { is_final: false },
    include: {
      class: { select: { name: true, teacher: { select: { nama_lengkap: true } } } },
      _count: { select: { questions: true, exam_attempts: true } }
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function getAdminExams() {
  await checkAdminAuth();
  return prisma.exam.findMany({
    where: { is_final: true },
    include: {
      class: { select: { name: true, teacher: { select: { nama_lengkap: true } } } },
      _count: { select: { questions: true, exam_attempts: true } }
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function createAdminExam(formData: FormData) {
  await checkAdminAuth();
  const class_id = formData.get("class_id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const time_limit = parseInt(formData.get("time_limit") as string) || null;
  const is_final = true;

  if (!class_id || !title) return { error: "Kelas dan Judul wajib diisi" };

  await prisma.exam.create({
    data: { class_id, title, description, time_limit, is_final, is_published: false }
  });
  return { success: true };
}

export async function deleteAdminExam(id: string) {
  await checkAdminAuth();
  await prisma.exam.delete({ where: { id } });
  return { success: true };
}

export async function toggleAdminExamPublish(id: string, is_published: boolean) {
  await checkAdminAuth();
  await prisma.exam.update({ where: { id }, data: { is_published } });
  return { success: true };
}

export async function getAdminExamDetails(id: string) {
  await checkAdminAuth();
  return prisma.exam.findUnique({
    where: { id },
    include: {
      class: true,
      questions: { orderBy: { created_at: 'asc' } }
    }
  });
}

export async function createAdminQuestion(formData: FormData) {
  await checkAdminAuth();
  const exam_id = formData.get("exam_id") as string;
  const type = formData.get("type") as "SPEAKING" | "LISTENING" | "WRITING" | "READING";
  const question_text = formData.get("question_text") as string;
  const answer_key = formData.get("answer_key") as string;
  const audio_reference = formData.get("audio_reference") as string;
  const difficulty = parseInt(formData.get("difficulty") as string) || 1;

  if (!exam_id || !type || !question_text) return { error: "Data soal tidak lengkap" };

  await prisma.question.create({
    data: { exam_id, type, question_text, answer_key, audio_reference, difficulty }
  });
  return { success: true };
}

export async function deleteAdminQuestion(id: string) {
  await checkAdminAuth();
  await prisma.question.delete({ where: { id } });
  return { success: true };
}
