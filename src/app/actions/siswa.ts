"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { saveUploadedFile } from "@/lib/upload";

// Basic authorization check for Siswa
async function checkSiswaAuth() {
  const session = await getSession();
  if (!session || session.user?.role !== "SISWA") {
    redirect("/login");
  }
  return session;
}

// --- STUDENT MODULES ---

export async function getStudentModules() {
  const session = await checkSiswaAuth();
  
  // Find all classes the student is enrolled in
  const enrollments = await prisma.enrollment.findMany({
    where: { student_id: session.user.id },
    select: { class_id: true }
  });

  const classIds = enrollments.map(e => e.class_id);

  // Fetch all modules belonging to those classes
  return prisma.module.findMany({
    where: {
      class_id: { in: classIds }
    },
    include: {
      class: { select: { name: true, teacher: { select: { nama_lengkap: true } } } }
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function getDashboardStats() {
  const session = await checkSiswaAuth();
  const userId = session.user.id;

  // 1. Modul Lulus
  const completedModules = await prisma.learningProgress.count({
    where: { student_id: userId, is_completed: true }
  });

  // 2. Durasi Belajar (sum of duration in activity logs)
  const activityLogs = await prisma.studentActivityLog.aggregate({
    where: { student_id: userId },
    _sum: { duration: true }
  });
  const totalDurationSeconds = activityLogs._sum.duration || 0;
  const durationMinutes = Math.floor(totalDurationSeconds / 60);

  // 3. Active Class details
  const activeEnrollment = await prisma.enrollment.findFirst({
    where: { student_id: userId },
    include: { class: true },
    orderBy: { created_at: 'desc' }
  });

  return {
    nama_lengkap: session.user.username, // Using username as fallback if nama_lengkap is not in session
    completedModules,
    durationMinutes,
    activeClass: activeEnrollment?.class || null
  };
}

// --- STUDENT EXAMS ---

export async function getAvailableQuizzes() {
  const session = await checkSiswaAuth();
  
  const enrollments = await prisma.enrollment.findMany({
    where: { student_id: session.user.id },
    select: { class_id: true }
  });

  const classIds = enrollments.map(e => e.class_id);

  return prisma.exam.findMany({
    where: {
      class_id: { in: classIds },
      is_published: true,
      is_final: false
    },
    include: {
      class: { select: { name: true, teacher: { select: { nama_lengkap: true } } } },
      _count: { select: { questions: true } },
      exam_attempts: {
        where: { student_id: session.user.id },
        include: { question_attempts: true }
      }
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function getAvailableFinalExams() {
  const session = await checkSiswaAuth();
  
  const enrollments = await prisma.enrollment.findMany({
    where: { student_id: session.user.id },
    select: { class_id: true }
  });

  const classIds = enrollments.map(e => e.class_id);

  return prisma.exam.findMany({
    where: {
      class_id: { in: classIds },
      is_published: true,
      is_final: true
    },
    include: {
      class: { select: { name: true, teacher: { select: { nama_lengkap: true } } } },
      _count: { select: { questions: true } },
      exam_attempts: {
        where: { student_id: session.user.id },
        include: { question_attempts: true }
      }
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function getExamToTake(id: string) {
  const session = await checkSiswaAuth();
  
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      class: { select: { name: true } },
      questions: {
        select: {
          id: true,
          type: true,
          question_text: true,
          audio_reference: true,
          image_url: true,
          difficulty: true,
          option_a: true,
          option_b: true,
          option_c: true,
          option_d: true
          // Purposefully NOT selecting answer_key!
        },
        orderBy: { created_at: 'asc' }
      }
    }
  });

  // Basic security check (ideally verify enrollment too)
  if (!exam || !exam.is_published) return null;
  return exam;
}

export async function submitExam(formData: FormData) {
  const session = await checkSiswaAuth();
  
  const examId = formData.get("exam_id") as string;
  const answersJsonString = formData.get("answers_json") as string;
  if (!examId || !answersJsonString) return { error: "Data tidak lengkap." };

  const answersData: Record<string, { student_answer: string, time_spent_seconds: number }> = JSON.parse(answersJsonString);

  // Prevent duplicate submissions
  const existingAttempt = await prisma.examAttempt.findFirst({
    where: { exam_id: examId, student_id: session.user.id }
  });

  if (existingAttempt) {
    return { error: "Anda sudah mengerjakan ujian ini." };
  }

  // Fetch actual questions with answer_key to grade
  const questions = await prisma.question.findMany({
    where: { exam_id: examId }
  });

  let totalScore = 0;
  let autoGradedQuestions = 0;

  const questionAttemptData = await Promise.all(questions.map(async (q) => {
    const data = answersData[q.id] || { student_answer: "", time_spent_seconds: 0 };
    const studentAnswer = data.student_answer;
    const timeSpent = data.time_spent_seconds;
    let score = 0;

    // Auto grading ONLY for MULTIPLE_CHOICE format
    if (q.format === "MULTIPLE_CHOICE") {
      autoGradedQuestions++;
      if (q.answer_key && studentAnswer.trim().toLowerCase() === q.answer_key.trim().toLowerCase()) {
        score = 10;
        totalScore += score;
      }
    }

    // Handle audio upload for SPEAKING or ESSAY audio responses
    let audio_url = null;
    const audioBlob = formData.get(`audio_${q.id}`) as File | null;
    if (audioBlob) {
      audio_url = await saveUploadedFile(audioBlob, "student_speaking");
    }

    return {
      question_id: q.id,
      student_answer: studentAnswer,
      time_spent_seconds: timeSpent,
      audio_url: audio_url,
      score: score
    };
  }));

  // Calculate percentage based only on auto-graded questions if there are any
  const maxScore = autoGradedQuestions > 0 ? autoGradedQuestions * 10 : questions.length * 10;
  const finalScorePercentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  await prisma.examAttempt.create({
    data: {
      exam_id: examId,
      student_id: session.user.id,
      total_score: finalScorePercentage,
      end_time: new Date(),
      question_attempts: {
        create: questionAttemptData
      }
    }
  });

  return { success: true, score: finalScorePercentage };
}

export async function getExamAttemptDetails(examId: string) {
  const session = await checkSiswaAuth();
  
  const attempt = await prisma.examAttempt.findFirst({
    where: { exam_id: examId, student_id: session.user.id },
    include: {
      exam: {
        include: {
          class: true,
          questions: { orderBy: { created_at: 'asc' } }
        }
      },
      question_attempts: {
        include: { question: true }
      }
    }
  });

  if (!attempt) return null;
  return attempt;
}
export async function getStudentCertificates() {
  const session = await checkSiswaAuth();
  
  return prisma.certificate.findMany({
    where: { 
      student_id: session.user.id,
      status: 'APPROVED'
    },
    include: {
      class: { select: { name: true, type: true, teacher: { select: { nama_lengkap: true } } } }
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function getStudentAnalytics() {
  const session = await checkSiswaAuth();
  
  const attempts = await prisma.examAttempt.findMany({
    where: { student_id: session.user.id },
    include: { exam: { select: { title: true, is_final: true } } },
    orderBy: { end_time: 'asc' }
  });

  const recommendations = await prisma.recommendationHistory.findMany({
    where: { student_id: session.user.id },
    orderBy: { created_at: 'desc' },
    take: 5
  });

  // Fetch Attendance for Attendance Rate
  const attendances = await prisma.attendance.findMany({
    where: { student_id: session.user.id }
  });
  
  // Fetch Activity Logs for study patterns
  const activities = await prisma.studentActivityLog.findMany({
    where: { student_id: session.user.id },
    orderBy: { created_at: 'desc' }
  });

  // Calculate learning patterns
  const presentCount = attendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendanceRate = attendances.length > 0 ? Math.round((presentCount / attendances.length) * 100) : 0;

  // Total Study Duration (from MODULE_ACCESS activities)
  const totalDurationSeconds = activities.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const totalDurationHours = (totalDurationSeconds / 3600).toFixed(1);

  // Preferred Study Time
  let timePreference = "Belum terdeteksi";
  if (activities.length > 0) {
    let morning = 0; // 5-12
    let afternoon = 0; // 12-18
    let evening = 0; // 18-24
    let night = 0; // 0-5

    activities.forEach(act => {
      const hour = new Date(act.created_at).getHours();
      if (hour >= 5 && hour < 12) morning++;
      else if (hour >= 12 && hour < 18) afternoon++;
      else if (hour >= 18 && hour <= 23) evening++;
      else night++;
    });

    const max = Math.max(morning, afternoon, evening, night);
    if (max === evening) timePreference = "Malam Hari (18:00 - 23:59)";
    else if (max === morning) timePreference = "Pagi Hari (05:00 - 11:59)";
    else if (max === afternoon) timePreference = "Siang/Sore (12:00 - 17:59)";
    else if (max === night) timePreference = "Dini Hari (00:00 - 04:59)";
  }

  const patterns = {
    attendanceRate,
    totalDurationHours,
    timePreference
  };

  return { attempts, recommendations, patterns };
}
