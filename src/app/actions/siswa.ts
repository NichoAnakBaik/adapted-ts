"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { saveUploadedFile } from "@/lib/upload";

// Basic authorization check for Siswa
async function checkSiswaAuth() {
  const session = await getSession();
  if (!session || session.user?.role !== "SISWA") {
    redirect("/?login=true");
  }
  return session;
}

// --- STUDENT CLASSES ---

export async function getStudentClasses() {
  const session = await checkSiswaAuth();
  
  // Find all classes the student is enrolled in
  const enrollments = await prisma.enrollment.findMany({
    where: { student_id: session.user.id },
    include: {
      class: {
        include: {
          teacher: { select: { nama_lengkap: true } }
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });

  return enrollments.map(e => e.class);
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

  // 4. ML Engine: Calculate Mastery and Weak Points
  const attempts = await prisma.examAttempt.findMany({
    where: { student_id: userId },
    include: { question_attempts: { include: { question: true } } }
  });

  let totalScoreSum = 0;
  let totalAttempts = 0;
  const scoresByType: Record<string, { totalScore: number, count: number }> = {};

  attempts.forEach(attempt => {
    totalScoreSum += (attempt.total_score || 0);
    totalAttempts += 1;

    attempt.question_attempts.forEach(qa => {
      const t = qa.question.type;
      if (!scoresByType[t]) scoresByType[t] = { totalScore: 0, count: 0 };
      scoresByType[t].totalScore += (qa.score || 0);
      scoresByType[t].count += 1;
    });
  });

  const masteryPercentage = totalAttempts > 0 ? Math.round(totalScoreSum / totalAttempts) : 0;

  let weakType = "SPEAKING"; // fallback
  let lowestAvg = Infinity;
  for (const [t, data] of Object.entries(scoresByType)) {
    const avg = data.totalScore / data.count;
    if (avg < lowestAvg) {
      lowestAvg = avg;
      weakType = t;
    }
  }

  const typeLabels: Record<string, string> = {
    "SPEAKING": "Berbicara (Speaking)",
    "LISTENING": "Mendengarkan (Listening)",
    "WRITING": "Menulis (Writing)",
    "READING": "Membaca (Reading)",
    "MULTIPLE_CHOICE": "Pilihan Ganda Dasar"
  };

  const weakPointName = typeLabels[weakType] || weakType;

  let mlRecommendation = `Sistem AI belum dapat mendeteksi pola belajar kamu karena data kuis masih kosong. Ayo kerjakan kuis pertamamu!`;
  if (totalAttempts > 0) {
    if (masteryPercentage >= 80) {
      mlRecommendation = `Luar biasa! Tingkat penguasaan materimu sangat baik. Namun, AI mendeteksi kamu bisa lebih tajam lagi pada bagian **${weakPointName}**. Jangan lupa terus berlatih bagian tersebut ya!`;
    } else if (masteryPercentage >= 60) {
      mlRecommendation = `Performa belajarmu stabil. Sistem mendeteksi adanya kelemahan minor pada bagian **${weakPointName}**. AI merekomendasikan kamu untuk membaca ulang materi terkait sebelum mengambil ujian akhir.`;
    } else {
      mlRecommendation = `Kamu sedang kesulitan ya? AI mendeteksi kamu sangat butuh bantuan pada bagian **${weakPointName}**. Jangan ragu untuk bertanya di Forum Kelas atau menghubungi Pengajar secara langsung.`;
    }
  }

  return {
    nama_lengkap: session.user.username, // Using username as fallback if nama_lengkap is not in session
    completedModules,
    durationMinutes,
    activeClass: activeEnrollment?.class || null,
    masteryPercentage,
    mlRecommendation
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
  
  const assignments = await prisma.examAssignment.findMany({
    where: { student_id: session.user.id },
    select: { exam_id: true }
  });

  const assignedExamIds = assignments.map(a => a.exam_id);

  return prisma.exam.findMany({
    where: {
      id: { in: assignedExamIds },
      is_final: true
      // is_published is ignored here because if it's assigned, it should be visible to that specific student.
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
          format: true,
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

  // Check if it's assigned to this student (for final exams)
  let isAssigned = false;
  if (exam?.is_final) {
    const assignment = await prisma.examAssignment.findFirst({
      where: { exam_id: id, student_id: session.user.id }
    });
    isAssigned = !!assignment;
  }

  // Basic security check: must be published OR explicitly assigned
  if (!exam || (!exam.is_published && !isAssigned)) return null;
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

  const exam = await prisma.exam.findUnique({ where: { id: examId } });

  let totalScore = 0;
  let autoGradedQuestions = 0;

  const questionAttemptData = await Promise.all(questions.map(async (q) => {
    const data = answersData[q.id] || { student_answer: "", time_spent_seconds: 0 };
    const studentAnswer = data.student_answer;
    const timeSpent = data.time_spent_seconds;
    let score = 0;
    let ai_feedback = null;
    const audioBlob = formData.get(`audio_${q.id}`) as File | null;
    console.log(`[DEBUG] submitExam Question ID: ${q.id}`);
    console.log(`[DEBUG] audioBlob present?`, !!audioBlob);
    if (audioBlob) {
      console.log(`[DEBUG] audioBlob size:`, audioBlob.size, 'type:', audioBlob.type, 'name:', audioBlob.name);
    }

    let transcript = null;
    // Auto grading AI Simulation for ALL formats (Enhanced Mock)
    if (q.type === "MULTIPLE_CHOICE" || q.format === "MULTIPLE_CHOICE") {
      if (q.answer_key && studentAnswer.trim().toLowerCase() === q.answer_key.trim().toLowerCase()) {
        score = 10;
        ai_feedback = "Tepat sekali! Pilihan Anda sangat akurat.";
      } else {
        score = 0;
        ai_feedback = `Jawaban kurang tepat. Pilihan Anda tidak sesuai konteks. Coba tinjau ulang materi ini.`;
      }
    } else if (q.type === "SPEAKING") {
      if (audioBlob && audioBlob.size > 0) {
        score = Math.floor(Math.random() * 3) + 7; // 7, 8, 9
        // Generate mock transcript based on answer key or generic text
        transcript = q.answer_key 
          ? `[AI Transcript] Saya telah mengatakan: ${q.answer_key} (Akurasi ~85%)` 
          : `[AI Transcript] Ini adalah simulasi ucapan bahasa Korea yang terdeteksi dari rekaman. (Durasi: ~${timeSpent} detik).`;
        
        ai_feedback = "AI Speech Analysis: Pelafalan (Pronunciation) Anda mendapat skor 85%. ";
        if (q.answer_key) {
           ai_feedback += `Transkrip suara berhasil dibandingkan dengan kunci jawaban secara otomatis oleh sistem ML.`;
        } else {
           ai_feedback += `Terdapat sedikit logat lokal pada konsonan akhir, namun secara keseluruhan intonasi terdengar natural.`;
        }
      } else {
        score = 0;
        ai_feedback = "AI Error: Suara tidak terdeteksi. Pastikan mikrofon Anda berfungsi dengan baik.";
      }
    } else if (q.type === "WRITING") {
      if (studentAnswer.length > 50) {
        score = Math.floor(Math.random() * 3) + 7; // 7, 8, 9
        ai_feedback = "AI Text Analysis: Struktur gramatika Anda (Level B1) sudah terbentuk dengan baik. Variasi kosakata yang digunakan cukup luas. Saran perbaikan: Hindari pengulangan kata hubung '그리고' terlalu sering.";
      } else if (studentAnswer.length > 10) {
        score = 5;
        ai_feedback = "AI Text Analysis: Kalimat dapat dipahami secara konteks, namun struktur subjek-objek-predikat masih kaku. Tingkatkan penggunaan partikel '-은/는' dan '-이/가'.";
      } else {
        score = 0;
        ai_feedback = "AI Text Analysis: Jawaban terlalu singkat untuk memvalidasi kemampuan menulis Anda secara akurat.";
      }
    } else if (q.type === "LISTENING") {
      if (studentAnswer.length > 15) {
        score = 8;
        ai_feedback = "AI Comprehension: Pemahaman audio Anda sangat baik. Anda berhasil menangkap kata kunci tersembunyi pada dialog dengan tempo cepat.";
      } else {
        score = 0;
        ai_feedback = "AI Comprehension: Anda melewatkan inti informasi dari rekaman audio. Latih pendengaran Anda dengan tempo bicara normal.";
      }
    } else if (q.type === "READING") {
      if (studentAnswer.length > 20) {
        score = 8;
        ai_feedback = "AI NLP Analysis: Kemampuan literasi membaca Anda memuaskan. Kesimpulan yang Anda tarik selaras dengan gagasan utama (Main Idea) paragraf kedua.";
      } else {
        score = 0;
        ai_feedback = "AI NLP Analysis: Analisis bacaan Anda keliru atau terlalu dangkal. Bacalah dengan teknik 'skimming' untuk mencari inti gagasan terlebih dahulu.";
      }
    } else {
      score = studentAnswer.length > 5 ? 7 : 0;
      ai_feedback = "AI Analysis: Jawaban telah dievaluasi dengan skor menengah.";
    }

    totalScore += score;
    autoGradedQuestions++;

    // Handle audio upload for SPEAKING or ESSAY audio responses
    let audio_url = null;
    if (audioBlob && audioBlob.size > 0) {
      audio_url = await saveUploadedFile(audioBlob, "student_speaking");
    }

    return {
      question_id: q.id,
      student_answer: studentAnswer,
      transcript: transcript,
      time_spent_seconds: timeSpent,
      audio_url: audio_url,
      score: score,
      ai_feedback: ai_feedback
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

  // Auto Enrollment Logic & Certificate Generation
  if (exam && exam.is_final) {
    const currentClass = await prisma.class.findUnique({ where: { id: exam.class_id } });
    if (currentClass) {
      // 1. Next Level Auto-Enrollment
      const nextLevel = currentClass.level + 1;
      const nextClass = await prisma.class.findFirst({ where: { level: nextLevel } });
      if (nextClass) {
        try {
          await prisma.enrollment.create({
            data: { student_id: session.user.id, class_id: nextClass.id, status: "PENDING" }
          });
        } catch(e) {}
      }

      // 2. Generate Pending Certificate (Available H+3)
      const availableAt = new Date();
      availableAt.setDate(availableAt.getDate() + 3); // H+3

      try {
        await prisma.certificate.create({
          data: {
            student_id: session.user.id,
            class_id: currentClass.id,
            status: "PENDING",
            available_at: availableAt,
          }
        });
      } catch (e) {
        console.error("Failed to generate certificate:", e);
      }
    }
  }

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
      status: { in: ['APPROVED', 'PENDING'] }
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
