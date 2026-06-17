'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { AdaptEdAI } from '@/lib/aiEvaluator';
import { redirect } from 'next/navigation';

export async function submitKuis(id_kuis: number, answers: Record<string, string>) {
  const session = await getSession();
  if (!session || session.role !== 'siswa') throw new Error('Unauthorized');

  const ai = new AdaptEdAI(process.env.GEMINI_API_KEY);
  
  // Get all soal for this kuis
  const soalList = await prisma.soalKuis.findMany({
    where: { id_kuis }
  });

  let totalSkor = 0;
  const jumlahSoal = soalList.length;
  if (jumlahSoal === 0) return { error: "Kuis kosong" };

  for (const soal of soalList) {
    const jawabanSiswaStr = answers[soal.id_soal.toString()] || "";
    let skor_ai = 0;
    let feedback_ai = "";

    if (soal.tipe_soal === 'reading') {
      const wpmDefault = 60; // Assuming 60 seconds reading duration for simplicity if no timer logic is attached per question
      const evalRes = ai.evaluateReading(soal.pertanyaan || "", wpmDefault, soal.jawaban_benar || "", jawabanSiswaStr);
      skor_ai = evalRes.skor;
      feedback_ai = evalRes.feedback;
    } 
    else if (soal.tipe_soal === 'listening') {
      const evalRes = ai.evaluateListening(soal.jawaban_benar || "", jawabanSiswaStr);
      skor_ai = evalRes.skor;
      feedback_ai = evalRes.feedback;
    }
    else if (soal.tipe_soal === 'writing') {
      const evalRes = await ai.evaluateWriting(jawabanSiswaStr, soal.pertanyaan || "");
      skor_ai = evalRes.skor;
      feedback_ai = evalRes.feedback;
    }

    // Save jawaban
    await prisma.jawabanSiswa.create({
      data: {
        id_siswa: session.user_id,
        id_soal: soal.id_soal,
        jawaban: jawabanSiswaStr,
        skor_ai,
        feedback_ai
      }
    });

    totalSkor += skor_ai;
  }

  const rataRata = Math.round(totalSkor / jumlahSoal);
  const status = rataRata >= 75 ? 'Lulus' : 'Gagal';

  await prisma.nilaiKuis.create({
    data: {
      id_kuis,
      id_siswa: session.user_id,
      skor: rataRata,
      status,
      waktu_selesai: new Date()
    }
  });

  // Check if passed, give certificate
  if (status === 'Lulus') {
    const kuis = await prisma.kuis.findUnique({ where: { id_kuis } });
    if (kuis) {
      await prisma.sertifikat.create({
        data: {
          id_siswa: session.user_id,
          id_kelas: kuis.id_kelas,
          nama_sertifikat: `Sertifikat Kompetensi: ${kuis.judul_kuis}`,
          tanggal_keluar: new Date(),
          status_approve: true
        }
      });
    }
  }

  redirect(`/siswa/kuis/${id_kuis}/hasil`);
}
