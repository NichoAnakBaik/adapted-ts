"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { saveUploadedFile, saveBase64File } from "@/lib/upload";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";


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
    where: { 
      class: { teacher_id: teacherId },
      is_final: false
    }
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
  
  // Calculate average attendance for all students in teacher's classes
  const attendances = await prisma.attendance.findMany({
    where: { session: { class: { teacher_id: teacherId } } }
  });
  const presentCount = attendances.filter((a: any) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const globalAttendanceRate = attendances.length > 0 ? Math.round((presentCount / attendances.length) * 100) : 0;
  
  let recommendationText = `Sistem AI belum dapat mendeteksi pola karena data masih sedikit.`;
  if (questionAttempts.length > 0 || attendances.length > 0) {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
          Kamu adalah asisten AI penasihat akademik (mentor pengajar) untuk Pengajar bahasa Korea bernama ${session.user.username}.
          Berikut adalah performa murid-murid di seluruh kelasnya:
          - Total Murid: ${uniqueStudentsCount}
          - Rata-rata Kehadiran Murid (Absensi): ${globalAttendanceRate}%
          - Total Kuis yang Dikelola: ${examsCount}
          - Titik terlemah mayoritas murid: ${weakPointName}
          
          Buatlah 2-3 kalimat rekomendasi pengajaran yang SANGAT KASUAL, fleksibel, namun tetap informatif layaknya rekan kerja sesama guru (ngobrol santai). 
          Instruksi Khusus:
          1. Beri masukan tentang tingkat kehadiran/kerajinan murid. Jika rendah, sarankan cara seru meningkatkannya; jika tinggi, apresiasi kinerjanya.
          2. Selipkan ide asyik atau out-of-the-box untuk membantu murid menutupi kelemahan di bagian ${weakPointName}.
          3. Gunakan bahasa Indonesia santai (boleh pakai kata sapaan akrab, singkatan wajar) dan sertakan 1-2 emoji agar tidak kaku!
        `;
        const result = await model.generateContent(prompt);
        recommendationText = result.response.text().trim();
      } catch (e) {
        console.error("Gemini Teacher Recommendation Error:", e);
        // Fallback
        recommendationText = `Berdasarkan hasil analisis AI pada seluruh kuis terbaru, sebagian besar siswa Anda paling banyak kehilangan poin pada bagian **${weakPointName}**. Tingkat kehadiran rata-rata adalah ${globalAttendanceRate}%. AI merekomendasikan Anda untuk menambahkan sesi latihan khusus terkait ${weakPointName}.`;
      }
    } else {
      recommendationText = `Berdasarkan hasil analisis AI pada seluruh kuis terbaru, sebagian besar siswa Anda paling banyak kehilangan poin pada bagian **${weakPointName}**. Tingkat kehadiran rata-rata adalah ${globalAttendanceRate}%. AI merekomendasikan Anda untuk menambahkan sesi latihan khusus terkait ${weakPointName}.`;
    }
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
      _count: { 
        select: { 
          enrollments: true, 
          exams: {
            where: { is_final: false }
          }
        } 
      }
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
      _count: { select: { exams: { where: { is_final: false } } } }
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

export async function updateModuleLink(classId: string, module_link: string) {
  const session = await checkPengajarAuth();
  
  const classData = await prisma.class.findFirst({
    where: { id: classId, teacher_id: session.user.id }
  });

  if (!classData) return { error: "Akses ditolak atau kelas tidak ditemukan" };

  await prisma.class.update({
    where: { id: classId },
    data: { module_link }
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

export async function getQuizzesByClass(classId: string) {
  const session = await checkPengajarAuth();
  
  return prisma.exam.findMany({
    where: {
      class_id: classId,
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

export async function getFinalExamsByClass(classId: string) {
  const session = await checkPengajarAuth();
  
  return prisma.exam.findMany({
    where: {
      class_id: classId,
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

  // Notify Admins
  const { createNotificationsForUsers } = await import("./notification");
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  if (admins.length > 0) {
    const adminIds = admins.map(a => a.id);
    await createNotificationsForUsers(
      adminIds,
      "Kuis Baru Diunggah",
      `Pengajar telah membuat kuis baru "${title}" di kelas ${classData.name}.`,
      is_final ? `/admin/ujian` : `/admin/kuis`
    );
  }

  return { success: true };
}

export async function toggleExamPublish(id: string, is_published: boolean) {
  const session = await checkPengajarAuth();
  // verify ownership
  const exam = await prisma.exam.findUnique({ where: { id }, include: { class: { include: { enrollments: true } } } });
  if (exam?.class?.teacher_id !== session.user.id) return { error: "Akses ditolak" };

  await prisma.exam.update({ where: { id }, data: { is_published } });
  
  if (is_published && exam && exam.class) {
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

export async function updateExam(formData: FormData) {
  const session = await checkPengajarAuth();
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const time_limit = formData.get("time_limit") as string;

  if (!id || !title) return { error: "Data kuis tidak lengkap" };

  const exam = await prisma.exam.findUnique({ where: { id }, include: { class: true } });
  if (exam?.class?.teacher_id !== session.user.id) return { error: "Akses ditolak" };

  await prisma.exam.update({
    where: { id },
    data: { 
      title, 
      description,
      time_limit: time_limit ? parseInt(time_limit) : null
    }
  });

  return { success: true };
}

export async function deleteExam(id: string) {
  const session = await checkPengajarAuth();
  const exam = await prisma.exam.findUnique({ where: { id }, include: { class: true } });
  if (exam?.class?.teacher_id !== session.user.id) return { error: "Akses ditolak" };

  await prisma.exam.delete({ where: { id } });
  return { success: true };
}

export async function deletePengajarQuestion(id: string) {
  const session = await checkPengajarAuth();
  const question = await prisma.question.findUnique({ 
    where: { id },
    include: { exam: { include: { class: true } } }
  });
  
  if (!question || question.exam?.class?.teacher_id !== session.user.id) {
    return { error: "Akses ditolak" };
  }

  await prisma.question.delete({ where: { id } });
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
          },
          question_attempts: { include: { question: true } }
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
  const difficulty = parseInt(formData.get("difficulty") as string) || 1;
  
  const option_a = formData.get("option_a") as string | null;
  const option_b = formData.get("option_b") as string | null;
  const option_c = formData.get("option_c") as string | null;
  const option_d = formData.get("option_d") as string | null;

  if (!exam_id || !type || !question_text) return { error: "Data soal tidak lengkap" };

  const exam = await prisma.exam.findUnique({ where: { id: exam_id }, include: { class: true } });
  if (exam?.class?.teacher_id !== session.user.id) return { error: "Akses ditolak" };

  try {
    let audio_reference = null;
    const existing_audio = formData.get("existing_audio_reference") as string | null;
    const audio_input = formData.get("audio_reference") as string | null;
    
    if (audio_input && audio_input.trim() !== "") {
      audio_reference = audio_input.trim();
    } else if (existing_audio) {
      audio_reference = existing_audio;
    }
    
    let image_url = null;
    const existing_image = formData.get("existing_image_url") as string | null;
    const image_file = formData.get("image_url") as File | null;
    if (image_file && image_file.size > 0) {
      image_url = await saveUploadedFile(image_file, "kuis_image");
    } else if (existing_image) {
      image_url = existing_image;
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

export async function updateQuestion(formData: FormData) {
  const session = await checkPengajarAuth();
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

  const question = await prisma.question.findUnique({ where: { id }, include: { exam: { include: { class: true } } } });
  if (question?.exam?.class?.teacher_id !== session.user.id) return { error: "Akses ditolak" };

  const updateData: any = {
    format, question_text, answer_key, difficulty,
    option_a, option_b, option_c, option_d
  };

  try {
    const remove_audio = formData.get("remove_audio") === "true";
    const existing_audio = formData.get("existing_audio_reference") as string | null;
    const audio_input = formData.get("audio_reference") as string | null;
    
    if (remove_audio) {
      updateData.audio_reference = null;
    } else if (audio_input && audio_input.trim() !== "") {
      updateData.audio_reference = audio_input.trim();
    } else if (existing_audio) {
      updateData.audio_reference = existing_audio;
    }
    
    const remove_image = formData.get("remove_image") === "true";
    const existing_image = formData.get("existing_image_url") as string | null;
    const image_file = formData.get("image_url") as File | null;
    if (remove_image) {
      updateData.image_url = null;
    } else if (image_file && image_file.size > 0) {
      const url = await saveUploadedFile(image_file, "kuis_image");
      if (url) updateData.image_url = url;
    } else if (existing_image) {
      updateData.image_url = existing_image;
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


export async function deleteQuestion(questionId: string) {
  try {
    const session = await checkPengajarAuth();
    
    // Verify the question belongs to an exam owned by the teacher
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { exam: { include: { class: true } } }
    });

    if (!question || question.exam.class.teacher_id !== session.user.id) {
      return { error: "Unauthorized or Question not found" };
    }

    await prisma.question.delete({
      where: { id: questionId }
    });

    return { success: true };
  } catch (error: any) {
    console.error("deleteQuestion error:", error);
    return { error: error.message };
  }
}

