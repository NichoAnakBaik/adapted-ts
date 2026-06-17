"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

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
          difficulty: true
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

export async function submitExam(examId: string, answers: Record<string, string>) {
  const session = await checkSiswaAuth();
  
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
  const maxScore = questions.length * 10; // Simple scoring: 10 points per question

  const questionAttemptData = questions.map(q => {
    const studentAnswer = answers[q.id] || "";
    let score = 0;

    // Auto grading if answer_key exists
    if (q.answer_key && studentAnswer.trim().toLowerCase() === q.answer_key.trim().toLowerCase()) {
      score = 10;
      totalScore += score;
    }

    return {
      question_id: q.id,
      student_answer: studentAnswer,
      score: score
    };
  });

  // Calculate percentage
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
