import { GoogleGenerativeAI } from "@google/generative-ai";
import stringSimilarity from "string-similarity";

export class AdaptEdAI {
  private llmModel: any;

  constructor(geminiApiKey?: string) {
    if (geminiApiKey) {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      this.llmModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    }
  }

  // ==========================================
  // 1. READING EVALUATOR (Kecepatan & Pemahaman)
  // ==========================================
  evaluateReading(
    teksSoal: string,
    durasiDetik: number,
    jawabanBenar: string,
    jawabanSiswa: string
  ): { skor: number; feedback: string } {
    const isCorrect = jawabanBenar.toLowerCase() === jawabanSiswa.toLowerCase();
    const skorJawaban = isCorrect ? 100 : 0;

    // Menghitung WPM (Words Per Minute)
    const jumlahKata = teksSoal.trim().split(/\s+/).length;
    const wpm = (jumlahKata / Math.max(durasiDetik, 1)) * 60;

    let feedback = "";
    if (skorJawaban === 100) {
      if (wpm < 50) {
        feedback =
          "Jawaban benar, namun kecepatan membacamu masih lambat. Terus berlatih membaca Hangeul ya!";
      } else {
        feedback = "Sempurna! Pemahaman dan kecepatan membacamu sangat baik.";
      }
    } else {
      feedback = "Jawaban kurang tepat. Coba baca ulang teksnya dengan lebih teliti.";
    }

    return { skor: skorJawaban, feedback };
  }

  // ==========================================
  // 2. LISTENING EVALUATOR (Fuzzy Semantic Match)
  // ==========================================
  evaluateListening(
    transkripAsli: string,
    jawabanSiswa: string
  ): { skor: number; feedback: string } {
    // Menggunakan stringSimilarity untuk menilai kemiripan teks
    const similarity = stringSimilarity.compareTwoStrings(
      transkripAsli.toLowerCase(),
      jawabanSiswa.toLowerCase()
    );
    const skorAi = Math.floor(similarity * 100);

    let feedback = "";
    if (skorAi >= 90) {
      feedback = "Luar biasa! Pendengaranmu sangat tajam.";
    } else if (skorAi >= 70) {
      feedback = "Cukup baik, ada sedikit typo/kesalahan ejaan dari yang kamu dengar.";
    } else {
      feedback = `Masih kurang tepat. Transkrip aslinya adalah: '${transkripAsli}'`;
    }

    return { skor: skorAi, feedback };
  }

  // ==========================================
  // 3. SPEAKING EVALUATOR (Dipindahkan ke Frontend Web Speech API)
  // ==========================================
  evaluateSpeaking(
    teksTerdeteksi: string,
    teksTarget: string
  ): { skor: number; feedback: string } {
    // Pada arsitektur web modern, Web Speech API berjalan di browser, 
    // lalu mengirim hasil deteksi teks ke backend. Kita bandingkan di sini.
    const similarity = stringSimilarity.compareTwoStrings(
      teksTarget.toLowerCase(),
      teksTerdeteksi.toLowerCase()
    );
    const skorAi = Math.floor(similarity * 100);

    let feedback = `AI mendeteksi kamu mengucapkan: '${teksTerdeteksi}'.`;
    if (skorAi >= 85) {
      feedback += " Pelafalan (Pronunciation) kamu sangat natural!";
    } else {
      feedback += " Perhatikan lagi intonasi dan pelafalan suku katanya.";
    }

    return { skor: skorAi, feedback };
  }

  // ==========================================
  // 4. WRITING EVALUATOR (LLM Grammar Check)
  // ==========================================
  async evaluateWriting(
    jawabanSiswa: string,
    topik: string = "Membahas kegiatan sehari-hari"
  ): Promise<{ skor: number; feedback: string }> {
    if (!this.llmModel) {
      return { skor: 0, feedback: "API Key LLM tidak dikonfigurasi." };
    }

    const prompt = `
      Kamu adalah pengajar bahasa Korea yang ketat namun suportif.
      Evaluasi tulisan bahasa Korea siswa ini dengan topik: ${topik}.
      Jawaban siswa: "${jawabanSiswa}"
      
      Berikan format balasan secara strictly seperti ini:
      SKOR: [berikan nilai 0-100 berdasarkan grammar, kosakata, dan relevansi]
      FEEDBACK: [Berikan penjelasan singkat dalam bahasa Indonesia letak kesalahannya dan bagaimana kalimat yang benarnya]
    `;

    try {
      const result = await this.llmModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parsing sederhana untuk memisahkan SKOR dan FEEDBACK
      const lines = text.split("\n");
      let skor = 0;
      let feedback = "Koreksi AI belum tersedia.";

      for (const line of lines) {
        if (line.startsWith("SKOR:")) {
          // Ekstrak angka saja
          const matches = line.match(/\d+/);
          if (matches) {
            skor = parseInt(matches[0], 10);
          }
        } else if (line.startsWith("FEEDBACK:")) {
          feedback = line.replace("FEEDBACK:", "").trim();
        }
      }

      return { skor: Math.min(skor, 100), feedback };
    } catch (e: any) {
      return { skor: 0, feedback: `Gagal terhubung ke model analisis bahasa: ${e.message}` };
    }
  }
}
