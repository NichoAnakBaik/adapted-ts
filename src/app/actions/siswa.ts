"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { AdaptEdAI } from "@/lib/aiEvaluator";
import { redirect } from "next/navigation";
import { saveUploadedFile, saveBase64File } from "@/lib/upload";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import stringSimilarity from "string-similarity";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

  // Calculate Attendance Rate for diligence analysis
  const attendances = await prisma.attendance.findMany({
    where: { student_id: userId }
  });
  const presentCount = attendances.filter((a: any) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendanceRate = attendances.length > 0 ? Math.round((presentCount / attendances.length) * 100) : 0;
  const totalAttendances = attendances.length;

  // 4. ML Engine: Calculate Mastery and Weak Points
  const attempts = await prisma.examAttempt.findMany({
    where: { student_id: userId },
    include: { question_attempts: { include: { question: true } } }
  });

  let totalScoreSum = 0;
  let totalAttempts = 0;
  const scoresByType: Record<string, { totalScore: number, count: number }> = {};

  attempts.forEach((attempt: any) => {
    totalScoreSum += (attempt.total_score || 0);
    totalAttempts += 1;

    attempt.question_attempts.forEach((qa: any) => {
      const t = qa.question.type;
      if (!scoresByType[t]) scoresByType[t] = { totalScore: 0, count: 0 };
      scoresByType[t].totalScore += (qa.score || 0);
      scoresByType[t].count += 1;
    });
  });

  const masteryPercentage = totalAttempts > 0 ? Math.round(totalScoreSum / totalAttempts) : 0;

  let weakType = "SPEAKING"; // fallback
  let lowestAvg = Infinity;
  
  const masteryLevels = {
    SPEAKING: 0,
    LISTENING: 0,
    READING: 0,
    WRITING: 0
  };

  for (const [t, data] of Object.entries(scoresByType)) {
    const avg = Math.round((data.totalScore / data.count) * 10); // scale to 100% since max score is 10
    
    // WRITING includes ESSAY
    if (t === "SPEAKING") masteryLevels.SPEAKING = avg;
    if (t === "LISTENING") masteryLevels.LISTENING = avg;
    if (t === "READING" || t === "MULTIPLE_CHOICE") masteryLevels.READING = avg; // Approximation
    if (t === "ESSAY") masteryLevels.WRITING = avg;

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
  if (totalAttempts > 0 || totalAttendances > 0) {
    
    // Fetch recent mistaken multiple choice questions to give AI context
    const recentMistakes = await prisma.questionAttempt.findMany({
      where: {
        exam_attempt: { student_id: session.user.id },
        score: 0,
        question: { type: "MULTIPLE_CHOICE" }
      },
      include: {
        question: true
      },
      orderBy: { id: 'desc' },
      take: 3
    });

    let mistakesContext = "";
    if (recentMistakes.length > 0) {
      mistakesContext = "\n- Analisis Kesalahan Terbaru (Pilihan Ganda):\n";
      recentMistakes.forEach((m, idx) => {
        const q = m.question;
        mistakesContext += `  ${idx+1}. Soal: ${q.question_text}\n`;
        mistakesContext += `     Pilihan: A. ${q.option_a}, B. ${q.option_b}, C. ${q.option_c}, D. ${q.option_d}\n`;
        mistakesContext += `     Jawaban Benar: ${q.answer_key}\n`;
        mistakesContext += `     Jawaban Siswa (Salah): ${m.student_answer || "Tidak menjawab"}\n`;
      });
    }

      const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
          Kamu adalah teman belajar dan asisten AI bahasa Korea untuk siswa bernama ${session.user.username}.
          Berikut adalah performa terkininya:
          - Nilai Rata-rata Kuis: ${masteryPercentage}%
          - Kehadiran (Absensi): ${attendanceRate}% (dari ${totalAttendances} sesi)
          - Kelemahan Utama: ${weakPointName}
          - Total Kuis Selesai: ${totalAttempts}${mistakesContext}
          
          Buatlah 3-4 kalimat rekomendasi belajar yang SANGAT KASUAL, gaul, asyik, dan suportif (layaknya teman atau mentor gaul). 
          Instruksi Khusus:
          1. Evaluasi kerajinan siswa dari Absensi dan Total Kuis secara natural (jangan kaku). Kalau rajin puji dengan antusias, kalau jarang absen/kuis berikan semangat yang relate.
          2. Selipkan tips singkat dan fleksibel untuk mengatasi kelemahannya di ${weakPointName}. Jika ada Analisis Kesalahan Terbaru, berikan feedback spesifik kenapa jawaban siswa salah dan apa konteks materi yang benar dari soal tersebut.
          3. Gunakan bahasa Indonesia santai (aku/kamu, boleh pakai singkatan wajar) dan sertakan 1-2 emoji biar hidup! Jangan terlihat seperti robot.
        `;
        const result = await model.generateContent(prompt);
        mlRecommendation = result.response.text().trim();
      } catch (e) {
        console.error("Gemini Recommendation Error:", e);
        // Fallback
        mlRecommendation = `Performa belajarmu stabil dengan nilai rata-rata ${masteryPercentage}%. AI merekomendasikan kamu untuk membaca ulang materi terkait **${weakPointName}** sebelum mengambil ujian akhir.`;
      }
    } else {
      mlRecommendation = `Performa belajarmu stabil. Sistem mendeteksi adanya kelemahan minor pada bagian **${weakPointName}**. AI merekomendasikan kamu untuk membaca ulang materi terkait sebelum mengambil ujian akhir.`;
    }
  }

  return {
    nama_lengkap: session.user.nama_lengkap,
    completedModules,
    durationMinutes,
    activeClass: activeEnrollment?.class,
    masteryPercentage,
    weakPointName,
    mlRecommendation,
    masteryLevels
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
        orderBy: { created_at: 'desc' },
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
        orderBy: { created_at: 'desc' },
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

  const answersData: Record<string, { student_answer: string, time_spent_seconds: number, has_audio?: boolean }> = JSON.parse(answersJsonString);

  // Fetch actual questions with answer_key to grade
  const questions = await prisma.question.findMany({
    where: { exam_id: examId }
  });

  const exam = await prisma.exam.findUnique({ 
    where: { id: examId },
    include: { class: true }
  });

  let totalScore = 0;
  let autoGradedQuestions = 0;
  const pendingTranscriptions: { question_id: string, answer_key: string | null, audio_url: string, audioB64?: string | null }[] = [];

  const questionAttemptData = await Promise.all(questions.map(async (q) => {
    const data = answersData[q.id] || { student_answer: "", time_spent_seconds: 0, has_audio: false };
    const studentAnswer = data.student_answer;
    const timeSpent = data.time_spent_seconds;
    let score = 0;
    let ai_feedback = null;
    
    // Instead of File, we get the base64 string
    const audioB64 = formData.get(`audio_b64_${q.id}`) as string | null;
    
    let audio_url = null;
    if (audioB64) {
      try {
        const publicUrl = await saveBase64File(audioB64, "student_speaking");
        if (publicUrl) {
          audio_url = publicUrl;
        }
      } catch (err) {
        console.error("Failed to decode and save base64 audio to Supabase:", err);
      }
    }

    let transcript = null;
    
    // Auto grading AI (Dynamic & Multi-modal)
    const ai = new AdaptEdAI(process.env.GEMINI_API_KEY || "");
    
    // Prepare question data with base64 image if exists
    let image_base64 = undefined;
    if (q.image_url) {
      try {
        const response = await fetch(q.image_url);
        const arrayBuffer = await response.arrayBuffer();
        image_base64 = Buffer.from(arrayBuffer).toString('base64');
      } catch (e) {
        console.error("Gagal mendownload gambar untuk evaluasi AI:", e);
      }
    }

    let audio_reference_base64 = undefined;
    if (q.audio_reference) {
      try {
        let arrayBuffer: ArrayBuffer;
        if (q.audio_reference.startsWith('/uploads/')) {
          const localPath = path.join(process.cwd(), "public", q.audio_reference);
          const fileBuffer = await fs.readFile(localPath);
          arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
        } else {
          const fullAudioUrl = q.audio_reference.startsWith('http') 
            ? q.audio_reference 
            : (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000") + q.audio_reference;
          const response = await fetch(fullAudioUrl);
          arrayBuffer = await response.arrayBuffer();
        }
        audio_reference_base64 = Buffer.from(arrayBuffer).toString('base64');
      } catch (e) {
        console.error("Gagal mendownload audio soal untuk evaluasi AI:", e);
      }
    }

    if (q.type === "MULTIPLE_CHOICE" || q.format === "MULTIPLE_CHOICE") {
      // Tentukan benar/salah secara statis terlebih dahulu
      const isCorrect = q.answer_key && studentAnswer.trim().toLowerCase() === q.answer_key.trim().toLowerCase();
      score = isCorrect ? 10 : 0;
      
      // Panggil AI untuk memberikan penjelasan edukatif dan rekomendasi
      const evalResult = await ai.evaluateQuestionDynamic({ ...q, image_base64, audio_reference_base64 }, studentAnswer);
      ai_feedback = evalResult.feedback;
    } else if (q.type === "SPEAKING") {
      if (audioB64 || data.has_audio) {
        score = 0; // pending
        transcript = "[Sedang diproses oleh AI...]";
        ai_feedback = "AI sedang melakukan analisis transkripsi audio Anda. Hasil akan segera tersedia di latar belakang.";
      } else {
        score = 0;
        ai_feedback = "AI Error: Suara tidak terdeteksi. Pastikan mikrofon Anda berfungsi dengan baik.";
      }
    } else {
      // ESSAY, WRITING, LISTENING, READING yang berupa teks
      const evalResult = await ai.evaluateQuestionDynamic({ ...q, image_base64, audio_reference_base64 }, studentAnswer);
      score = evalResult.skor;
      ai_feedback = evalResult.feedback;
    }

    totalScore += score;
    autoGradedQuestions++;

    if (audio_url === null && data.has_audio) {
       ai_feedback = "AI Error: Gagal menyimpan rekaman suara ke server.";
       score = 0;
    } else if (q.type === "SPEAKING" && audio_url) {
       pendingTranscriptions.push({ question_id: q.id, answer_key: q.answer_key, audio_url, audioB64 });
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

  const createdAttempt = await prisma.examAttempt.create({
    data: {
      exam_id: examId,
      student_id: session.user.id,
      total_score: finalScorePercentage,
      end_time: new Date(),
      question_attempts: {
        create: questionAttemptData
      }
    },
    include: {
      question_attempts: true
    }
  });

  // Launch background task if there are pending transcriptions
  if (pendingTranscriptions.length > 0) {
    // Fire and forget
    processAudioTranscriptionBackground(createdAttempt.id, pendingTranscriptions, createdAttempt.question_attempts).catch(err => {
      console.error("Background transcription failed:", err);
    });
  }

  // Record Activity Log
  try {
    const isQuiz = !exam?.is_final;
    let durationSeconds = 0;
    
    // Calculate total time spent from answers
    Object.values(answersData).forEach(ans => {
      if (ans.time_spent_seconds) durationSeconds += ans.time_spent_seconds;
    });

    if (durationSeconds === 0) {
      durationSeconds = Math.floor((new Date().getTime() - new Date(createdAttempt.start_time).getTime()) / 1000) || 60;
    }

    await prisma.studentActivityLog.create({
      data: {
        student_id: session.user.id,
        action_type: isQuiz ? "QUIZ_ATTEMPT" : "EXAM_ATTEMPT",
        duration: durationSeconds > 0 ? durationSeconds : null,
        metadata: JSON.stringify({
          examId: examId,
          examTitle: exam?.title,
          classId: exam?.class_id,
          className: exam?.class?.name,
          score: finalScorePercentage
        })
      }
    });
  } catch (logErr) {
    console.error("Failed to log activity:", logErr);
  }

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

export async function getExamAttemptDetails(examId: string, attemptId?: string) {
  const session = await checkSiswaAuth();
  
  const attempt = await prisma.examAttempt.findFirst({
    where: { 
      exam_id: examId, 
      student_id: session.user.id,
      ...(attemptId ? { id: attemptId } : {})
    },
    orderBy: { created_at: 'desc' },
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

  // --- USER-BASED COLLABORATIVE FILTERING ---
  // Find similar students to recommend modules they succeeded in
  let recommendedModule = "Lanjutkan modul reguler Anda";
  if (attempts.length > 0) {
    const studentAvgScore = attempts.reduce((acc, curr) => acc + (curr.total_score || 0), 0) / attempts.length;
    
    // Find all other students' attempts
    const allOtherAttempts = await prisma.examAttempt.findMany({
      where: { student_id: { not: session.user.id } },
      include: { exam: { select: { title: true } } }
    });

    // Group by student to find their average
    const otherStudentStats: Record<string, { totalScore: number, count: number, exams: Set<string> }> = {};
    allOtherAttempts.forEach(a => {
      if (!otherStudentStats[a.student_id]) otherStudentStats[a.student_id] = { totalScore: 0, count: 0, exams: new Set() };
      otherStudentStats[a.student_id].totalScore += (a.total_score || 0);
      otherStudentStats[a.student_id].count += 1;
      otherStudentStats[a.student_id].exams.add(a.exam.title);
    });

    // Find the most similar student (Euclidean distance on average score)
    let mostSimilarStudentId = null;
    let minDiff = Infinity;
    for (const [sid, stat] of Object.entries(otherStudentStats)) {
      const avg = stat.totalScore / stat.count;
      const diff = Math.abs(avg - studentAvgScore);
      if (diff < minDiff) {
        minDiff = diff;
        mostSimilarStudentId = sid;
      }
    }

    // Recommend an exam taken by the similar student that the current student hasn't taken
    if (mostSimilarStudentId) {
      const similarStudentExams = Array.from(otherStudentStats[mostSimilarStudentId].exams);
      const myExams = new Set(attempts.map(a => a.exam.title));
      const newExams = similarStudentExams.filter(e => !myExams.has(e));
      if (newExams.length > 0) {
        recommendedModule = newExams[0]; // Recommend the first one found
      }
    }
  }

  let aiReport = "";
  if (attempts.length > 0) {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const prompt = `
          Kamu adalah AI Penasihat Akademik (Mentor) Namsan Korean Course untuk siswa bernama ${session.user.nama_lengkap}.
          Tugasmu adalah menganalisis data belajarnya dan menyajikan laporan akademik dalam format Markdown yang indah, rapi, dan mudah dibaca.
          
          Data Siswa:
          - Total Kuis Dikerjakan: ${attempts.length}
          - Tingkat Kehadiran: ${attendanceRate}%
          - Total Waktu Belajar: ${totalDurationHours} Jam
          - Waktu Belajar Favorit: ${timePreference}
          - Rekomendasi Collaborative Filtering: "${recommendedModule}"

          Buatlah laporan komprehensif dengan struktur berikut:
          1. **Ringkasan Performa**: Paragraf pembuka yang hangat dan memotivasi.
          2. **Analisis Pola Belajar**: Evaluasi dedikasi belajar mereka berdasarkan kehadiran dan durasi.
          3. **Peta Jalan Belajar (Roadmap)**: Berikan 3 langkah konkret apa yang harus mereka pelajari selanjutnya. (Sebutkan rekomendasi modul dari sistem Collaborative Filtering kami: ${recommendedModule}).
          
          Gunakan bahasa Indonesia yang profesional namun tetap asyik dan tidak kaku. Gunakan emoji secukupnya. Jangan gunakan heading 1 (#), maksimal heading 2 (##) atau 3 (###).
        `;
        const result = await model.generateContent(prompt);
        aiReport = result.response.text();
      } catch (e) {
        console.error("AI Analytics Error:", e);
        aiReport = "Gagal memuat analisis AI saat ini. Silakan coba beberapa saat lagi.";
      }
    }
  }

  return { attempts, recommendations, patterns, aiReport };
}

// Background Task for Audio Transcription


async function processAudioTranscriptionBackground(
  attemptId: string, 
  pendingTranscriptions: { question_id: string, answer_key: string | null, audio_url: string, audioB64?: string | null }[],
  createdQuestionAttempts: any[]
) {
  for (const pending of pendingTranscriptions) {
    // 1. Find the question attempt id
    const qa = createdQuestionAttempts.find(q => q.question_id === pending.question_id);
    if (!qa) continue;

    // Tambahkan delay kecil (2 detik) antar request untuk mencegah rate-limit Gemini API jika ada multiple file
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      let base64Audio = "";

      if (pending.audioB64) {
        // Extract raw base64 if it has data URI prefix
        const b64Index = pending.audioB64.indexOf(";base64,");
        if (b64Index !== -1) {
          base64Audio = pending.audioB64.substring(b64Index + 8);
        } else {
          base64Audio = pending.audioB64;
        }
      } else {
        // Fallback: Read audio file from URL or local file system if base64 is not provided
        let arrayBuffer: ArrayBuffer;
        if (pending.audio_url.startsWith('/uploads/')) {
          const localPath = path.join(process.cwd(), "public", pending.audio_url);
          const fileBuffer = await fs.readFile(localPath);
          arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
        } else {
          const fullAudioUrl = pending.audio_url.startsWith('http') 
            ? pending.audio_url 
            : (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000") + pending.audio_url;
          
          const audioRes = await fetch(fullAudioUrl);
          if (!audioRes.ok) {
            throw new Error(`Failed to fetch audio from URL: ${fullAudioUrl}`);
          }
          arrayBuffer = await audioRes.arrayBuffer();
        }
        base64Audio = Buffer.from(arrayBuffer).toString("base64");
      }

      let transcriptText = "";
      let isSuccess = false;

      // 3. Call Gemini API for Transcription
      // HuggingFace (Whisper) api-inference.huggingface.co diblokir/tidak bisa diakses dari server ini (ENOTFOUND).
      // Oleh karena itu kita menggunakan Gemini Flash Latest yang sudah mendukung audio secara native.
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (geminiApiKey) {
        try {
          const genAI = new GoogleGenerativeAI(geminiApiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
          
          const result = await model.generateContent([
            {
              inlineData: {
                data: base64Audio,
                mimeType: "audio/webm" 
              }
            },
            { text: "Tolong transkripsi audio ini secara akurat. Jika audio TIDAK mengandung bahasa Korea atau bukan bahasa Korea sama sekali, kembalikan HANYA teks: '[BUKAN_KOREA]'. Jika bahasa Korea, hanya berikan teks hasil transkripsinya saja dalam Hangeul, tanpa tambahan kata-kata lain dan tanpa menerjemahkan." }
          ]);
          
          const text = result.response.text();
          if (text) {
            transcriptText = text.trim();
            isSuccess = true;
          }
        } catch (e) {
          console.error("Gemini Audio Transcription Error:", e);
        }
      } else {
        console.warn("GEMINI_API_KEY is missing in environment variables.");
      }

      // 4. Grade the transcription
      let score = 0;
      let ai_feedback = "";
      
      if (isSuccess && transcriptText) {
        if (transcriptText.includes("[BUKAN_KOREA]")) {
          score = 0;
          ai_feedback = "AI Speech Analysis: Suara terdeteksi bukan bahasa Korea atau tidak jelas. Harap gunakan bahasa Korea.";
          transcriptText = "[Bukan bahasa Korea]";
        } else {
          // Fetch question data to pass to dynamic evaluator
          const questionData = await prisma.question.findUnique({ where: { id: pending.question_id } });
          
          if (questionData) {
            const ai = new AdaptEdAI(process.env.GEMINI_API_KEY || "");
            const evalResult = await ai.evaluateQuestionDynamic(questionData, transcriptText);
            
            score = evalResult.skor;
            ai_feedback = evalResult.feedback;
          } else {
            // Fallback if question not found
            score = 8;
            ai_feedback = "AI Speech Analysis: Transkripsi berhasil, namun data soal tidak ditemukan untuk dievaluasi lebih lanjut.";
          }
          transcriptText = `[AI Transcript] ${transcriptText}`;
        }
      } else {
        // Fallback if API fails
        score = 0;
        ai_feedback = "AI Error: Gagal memproses transkripsi suara (API Error/Timeout).";
        transcriptText = "[Transkripsi gagal]";
      }

      // 5. Update QuestionAttempt in DB
      await prisma.questionAttempt.update({
        where: { id: qa.id },
        data: {
          score,
          ai_feedback,
          transcript: transcriptText
        }
      });
      
    } catch (err) {
      console.error("Error processing transcription for question", pending.question_id, err);
      // Ensure the DB is updated to prevent infinite "Sedang diproses" loop
      try {
        await prisma.questionAttempt.update({
          where: { id: qa.id },
          data: {
            score: 0,
            ai_feedback: "AI Error: Gagal memproses transkripsi suara (Sistem sibuk atau file tidak valid).",
            transcript: "[Transkripsi gagal]"
          }
        });
      } catch (dbErr) {
        console.error("Failed to update DB with transcription error state:", dbErr);
      }
    }
  }

  // 6. Recalculate Total Score for the Exam Attempt
  try {
    const allAttempts = await prisma.questionAttempt.findMany({
      where: { exam_attempt_id: attemptId }
    });
    const totalAchieved = allAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
    const maxPossible = allAttempts.length * 10;
    const finalScore = maxPossible > 0 ? Math.round((totalAchieved / maxPossible) * 100) : 0;

    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: { total_score: finalScore }
    });
  } catch (err) {
    console.error("Error recalculating total score", err);
  }
}
