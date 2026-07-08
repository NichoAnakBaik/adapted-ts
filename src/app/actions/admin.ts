"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { saveUploadedFile, saveBase64File } from "@/lib/upload";

// Basic authorization check
async function checkAdminAuth() {
  const session = await getSession();
  console.log("checkAdminAuth() -> session:", session);
  if (!session) {
    console.log("checkAdminAuth() -> No session, redirecting");
    redirect("/?login=true");
  }
  if (session.user?.role !== "ADMIN") {
    console.log("checkAdminAuth() -> Role mismatch, redirecting. Expected ADMIN, got:", session.user?.role);
    redirect("/?login=true");
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

export async function adminUpdateUser(formData: FormData) {
  await checkAdminAuth();
  const id = formData.get("id") as string;
  const nama_lengkap = formData.get("nama_lengkap") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "ADMIN" | "PENGAJAR" | "SISWA";

  if (!id || !nama_lengkap || !username || !role) {
    return { error: "Semua kolom wajib diisi kecuali password" };
  }

  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser && existingUser.id !== id) return { error: "Username sudah digunakan oleh akun lain" };

  const updateData: any = { nama_lengkap, username, role };

  if (password && password.trim() !== "") {
    const bcrypt = await import("bcryptjs");
    updateData.password = await bcrypt.default.hash(password, 10);
  }

  await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return { success: true };
}

export async function resetUserPassword(id: string) {
  await checkAdminAuth();
  const bcrypt = await import("bcryptjs");
  const defaultPassword = await bcrypt.default.hash("123456", 10);
  
  await prisma.user.update({
    where: { id },
    data: { password: defaultPassword }
  });
  
  return { success: true, message: "Password berhasil direset menjadi: 123456" };
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
  const levelStr = formData.get("level") as string;
  const level = levelStr ? parseInt(levelStr) : 1;
  const type = formData.get("type") as "ONLINE" | "OFFLINE";
  const schedule = formData.get("schedule") as string;
  const meeting_link = formData.get("meeting_link") as string;
  const module_link = formData.get("module_link") as string;

  if (!name || !type || !module_link) return { error: "Nama kelas, tipe, dan Link Modul wajib diisi" };

  await prisma.class.create({
    data: { name, level, type, schedule, meeting_link: meeting_link || null, module_link: module_link }
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

export async function deleteMeetingLink(classId: string) {
  await checkAdminAuth();
  await prisma.class.update({
    where: { id: classId },
    data: { meeting_link: null }
  });
  return { success: true };
}

export async function updateModuleLink(classId: string, link: string) {
  await checkAdminAuth();
  await prisma.class.update({
    where: { id: classId },
    data: { module_link: link }
  });
  return { success: true };
}

export async function deleteModuleLink(classId: string) {
  await checkAdminAuth();
  await prisma.class.update({
    where: { id: classId },
    data: { module_link: null }
  });
  return { success: true };
}

// --- ENROLLMENT MANAGEMENT ---

export async function enrollStudent(classId: string, studentId: string) {
  await checkAdminAuth();
  try {
    const classData = await prisma.class.findUnique({ where: { id: classId } });
    await prisma.enrollment.create({
      data: { class_id: classId, student_id: studentId }
    });
    
    if (classData) {
      const { createNotification } = await import("./notification");
      await createNotification(
        studentId,
        "Pengingat Kelas Baru",
        `Anda telah didaftarkan ke kelas "${classData.name}". Segera cek jadwal dan materi pembelajaran Anda.`,
        `/siswa/kelas`
      );
    }
    
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

export async function updateEnrollmentStatus(enrollmentId: string, status: string) {
  await checkAdminAuth();
  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { status }
  });
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
  const file_url_input = formData.get("file_url") as File | string | null;
  const status = formData.get("status") as "PENDING" | "APPROVED" | "REJECTED";

  let file_url = "";
  if (file_url_input instanceof File) {
    const uploadedUrl = await saveUploadedFile(file_url_input, "certificates");
    if (uploadedUrl) file_url = uploadedUrl;
  } else if (typeof file_url_input === "string") {
    file_url = file_url_input;
  }

  if (id) {
    // Update existing
    await prisma.certificate.update({
      where: { id },
      data: { file_url: file_url || undefined, status }
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
  
  const exam = await prisma.exam.update({ 
    where: { id }, 
    data: { is_published },
    include: { class: { include: { enrollments: true } } }
  });

  if (is_published) {
    const { createNotificationsForUsers } = await import("./notification");
    const studentIds = exam.class.enrollments.map(e => e.student_id);
    
    if (studentIds.length > 0) {
      await createNotificationsForUsers(
        studentIds,
        exam.is_final ? "Ujian Baru Diterbitkan" : "Kuis Baru Diterbitkan",
        `${exam.is_final ? "Ujian" : "Kuis"} "${exam.title}" untuk kelas ${exam.class.name} sekarang sudah bisa dikerjakan.`,
        exam.is_final ? `/siswa/ujian` : `/siswa/kuis`
      );
    }
  }

  return { success: true };
}

export async function getAdminExamDetails(id: string) {
  await checkAdminAuth();
  return prisma.exam.findUnique({
    where: { id },
    include: {
      class: true,
      questions: { orderBy: { created_at: 'asc' } },
      exam_assignments: {
        include: { student: { select: { id: true, nama_lengkap: true, username: true } } }
      },
      exam_attempts: {
        include: {
          student: { select: { nama_lengkap: true, username: true } },
          question_attempts: { include: { question: true } }
        },
        orderBy: { start_time: 'desc' }
      }
    }
  });
}

// --- EXAM ASSIGNMENT MANAGEMENT ---

export async function getEligibleStudents(examId: string) {
  await checkAdminAuth();
  
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      class: {
        include: {
          enrollments: { include: { student: { select: { id: true, nama_lengkap: true, username: true } } } },
          attendance_sessions: { include: { attendances: true } }
        }
      },
      exam_assignments: true
    }
  });

  if (!exam) return [];

  const totalSessions = exam.class.attendance_sessions.length;
  const assignments = exam.exam_assignments.map(a => a.student_id);

  const eligibleStudents = exam.class.enrollments.map(enrol => {
    const studentId = enrol.student_id;
    let presentCount = 0;
    
    exam.class.attendance_sessions.forEach(session => {
      const att = session.attendances.find(a => a.student_id === studentId);
      if (att && (att.status === 'PRESENT' || att.status === 'LATE')) {
        presentCount++;
      }
    });

    const attendanceRate = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 100;
    const isAssigned = assignments.includes(studentId);

    return {
      student: enrol.student,
      attendanceRate,
      presentCount,
      totalSessions,
      isAssigned
    };
  });

  return eligibleStudents;
}

export async function assignExamToStudent(examId: string, studentId: string) {
  const session = await checkAdminAuth();
  // Return early if session is voided. Although checkAdminAuth redirects, just to be safe.
  
  const currentSession = await getSession();
  
  try {
    await prisma.examAssignment.create({
      data: {
        exam_id: examId,
        student_id: studentId,
        assigned_by: currentSession?.user?.id
      }
    });
    // Auto-publish the exam so students can see it immediately
    await prisma.exam.update({
      where: { id: examId },
      data: { is_published: true }
    });
    return { success: true };
  } catch (e) {
    return { error: "Siswa sudah di-assign." };
  }
}

export async function assignAllEligibleStudents(examId: string) {
  const session = await getSession();
  await checkAdminAuth();

  const eligibleStudents = await getEligibleStudents(examId);
  const toAssign = eligibleStudents.filter(s => s.attendanceRate >= 75 && !s.isAssigned);

  if (toAssign.length === 0) return { error: "Tidak ada siswa tambahan yang memenuhi syarat (>=75%)." };

  const data = toAssign.map(s => ({
    exam_id: examId,
    student_id: s.student.id,
    assigned_by: session?.user?.id
  }));

  await prisma.examAssignment.createMany({
    data,
    skipDuplicates: true
  });

  // Auto-publish the exam so students can see it immediately
  await prisma.exam.update({
    where: { id: examId },
    data: { is_published: true }
  });

  return { success: true, count: toAssign.length };
}

export async function createAdminQuestion(formData: FormData) {
  await checkAdminAuth();
  const exam_id = formData.get("exam_id") as string;
  const type = formData.get("type") as "SPEAKING" | "LISTENING" | "WRITING" | "READING";
  const format = formData.get("format") as string || "ESSAY";
  const question_text = formData.get("question_text") as string;
  const answer_key = formData.get("answer_key") as string;
  const difficulty = parseInt(formData.get("difficulty") as string) || 1;
  const option_a = formData.get("option_a") as string | null;
  const option_b = formData.get("option_b") as string | null;
  const option_c = formData.get("option_c") as string | null;
  const option_d = formData.get("option_d") as string | null;

  if (!exam_id || !type || !question_text) return { error: "Data soal tidak lengkap" };

  try {
    let audio_reference = null;
    const audio_file = formData.get("audio_reference") as File | null;
    if (audio_file && audio_file.size > 0) {
      audio_reference = await saveUploadedFile(audio_file, "ujian_audio");
    }

    let image_url = null;
    const image_file = formData.get("image_url") as File | null;
    if (image_file && image_file.size > 0) {
      image_url = await saveUploadedFile(image_file, "ujian_image");
    }

    await prisma.question.create({
      data: { 
        exam_id, type, format, question_text, answer_key, audio_reference, image_url, difficulty,
        option_a, option_b, option_c, option_d
      }
    });
  } catch (err: any) {
    return { error: err.message || "Gagal menyimpan file ke server." };
  }
  return { success: true };
}

export async function deleteAdminQuestion(id: string) {
  await checkAdminAuth();
  await prisma.question.delete({ where: { id } });
  return { success: true };
}

export async function updateAdminQuestion(formData: FormData) {
  await checkAdminAuth();
  const id = formData.get("id") as string;
  const format = formData.get("format") as string || "ESSAY";
  const question_text = formData.get("question_text") as string;
  const answer_key = formData.get("answer_key") as string;
  const difficulty = parseInt(formData.get("difficulty") as string) || 1;
  const option_a = formData.get("option_a") as string | null;
  const option_b = formData.get("option_b") as string | null;
  const option_c = formData.get("option_c") as string | null;
  const option_d = formData.get("option_d") as string | null;

  if (!id || !question_text) return { error: "Data soal tidak lengkap" };

  const updateData: any = {
    format, question_text, answer_key, difficulty,
    option_a, option_b, option_c, option_d
  };

  try {
    const audio_file = formData.get("audio_reference") as File | null;
    if (audio_file && audio_file.size > 0) {
      const url = await saveUploadedFile(audio_file, "ujian_audio");
      updateData.audio_reference = url;
    }

    const image_file = formData.get("image_url") as File | null;
    if (image_file && image_file.size > 0) {
      const url = await saveUploadedFile(image_file, "ujian_image");
      updateData.image_url = url;
    }

    await prisma.question.update({
      where: { id },
      data: updateData
    });
  } catch (err: any) {
    return { error: err.message || "Gagal menyimpan perubahan soal ke server." };
  }

  return { success: true };
}
