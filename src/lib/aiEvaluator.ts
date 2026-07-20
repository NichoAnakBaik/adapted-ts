import { GoogleGenerativeAI } from "@google/generative-ai";
import stringSimilarity from "string-similarity";

export class AdaptEdAI {
  private llmModel: any;
  private visionModel: any;

  constructor(geminiApiKey?: string) {
    if (geminiApiKey) {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      // Menggunakan gemini-flash-latest karena model terbaru mendukung multimodal
      this.llmModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      this.visionModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    }
  }

  // ==========================================
  // 0. DYNAMIC MULTI-MODAL EVALUATOR (NEW)
  // ==========================================
  async evaluateQuestionDynamic(
    questionData: any,
    studentAnswer: string
  ): Promise<{ skor: number; feedback: string }> {
    if (!this.llmModel) {
      return { skor: 0, feedback: "API Key LLM tidak dikonfigurasi." };
    }

    // Default response on error or empty
    if (!studentAnswer || studentAnswer.trim() === "") {
      return { skor: 0, feedback: "Jawaban kosong, tidak ada yang bisa dievaluasi." };
    }

    const prompt = `
      Kamu adalah pengajar bahasa Korea yang ketat, ahli, dan suportif.
      Evaluasi jawaban siswa berdasarkan detail soal berikut:
      
      - Teks Soal: ${questionData.question_text || "Tidak ada teks"}
      - Tipe Soal: ${questionData.type} (MULTIPLE_CHOICE / ESSAY / READING / LISTENING / SPEAKING)
      - Kunci Jawaban Resmi: ${questionData.answer_key || "Tidak tersedia"}
      - Jawaban Siswa: "${studentAnswer}"

      Jika ada gambar yang terlampir pada konteks ini, pertimbangkan gambar tersebut sebagai bagian dari soal.
      
      Aturan Penilaian (SKOR 0-10):
      1. Jika tipe soal adalah ESSAY / WRITING, nilai berdasarkan akurasi grammar, konteks kalimat, dan ejaan.
      2. Jika tipe soal adalah Pilihan Ganda (MULTIPLE_CHOICE):
         - Jika jawaban SALAH (SKOR 0), jelaskan secara detail mengapa pilihan tersebut salah dan apa alasan dari jawaban yang benar.
         - Jika jawaban BENAR (SKOR 10), jangan hanya bilang "akurat". Jelaskan secara edukatif MENGAPA jawaban itu benar untuk menguatkan pemahaman.
      4. Jika ada file audio yang terlampir pada konteks ini (sebagai audio reference soal), DENGARKAN secara cermat dan evaluasi apakah jawaban/transkripsi siswa memiliki kemiripan arti, struktur, dan konteks dengan apa yang diucapkan dalam audio tersebut. Jika jawaban siswa melenceng jauh dari audio soal, jelaskan kesalahannya berdasarkan apa yang sebenarnya diucapkan dalam audio.
      
      GAYA BAHASA & STRUKTUR:
      - Gunakan bahasa yang santai, ramah, dan tidak kaku (seperti tutor asyik yang sedang ngobrol dengan muridnya, gunakan sapaan santai).
      - Di bagian akhir penjelasan, SELALU berikan 1-2 kalimat rekomendasi topik materi yang relevan dengan konteks soal/jawaban agar siswa tahu apa yang perlu dipelajari atau di-review selanjutnya.

      Berikan format balasan SECARA STRICT dalam bentuk JSON (tanpa tag \`\`\`json):
      {
        "skor": [angka 0-10, mewakili bobot kebenaran],
        "feedback": "[Penjelasan santai dan asyik, penjelasan mengapa benar/salah, ditutup dengan rekomendasi materi yang relevan]"
      }
    `;

    try {
      let result;
      const contentParts: any[] = [{ text: prompt }];

      // Jika ada gambar (berupa base64 string dari server)
      if (questionData.image_base64) {
        contentParts.push({
          inlineData: {
            data: questionData.image_base64,
            mimeType: "image/jpeg" // Asumsikan jpeg/png bisa diparsing otomatis
          }
        });
      }
      
      // Jika ada referensi audio soal (berupa base64 string)
      if (questionData.audio_reference_base64) {
        contentParts.push({
          inlineData: {
            data: questionData.audio_reference_base64,
            mimeType: "audio/webm" // Format audio default web
          }
        });
      }

      result = await this.llmModel.generateContent(contentParts);
      const response = await result.response;
      let text = response.text().trim();
      
      let parsed;
      try {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          parsed = JSON.parse(text);
        }
      } catch (parseErr) {
        throw new Error("Format balasan AI tidak valid JSON.");
      }
      
      // Normalisasi skor (0-10) -> diubah ke basis pengali sesuai kebutuhan backend
      // Di backend biasanya per soal = 10 poin maksimum.
      let finalSkor = Number(parsed.skor);
      if (isNaN(finalSkor)) finalSkor = 0;
      if (finalSkor > 10) finalSkor = 10; // Capping
      if (finalSkor < 0) finalSkor = 0;

      return { skor: finalSkor, feedback: parsed.feedback || "Evaluasi selesai." };
    } catch (error: any) {
      console.error("AI Evaluation Error:", error);
      
      const errMsg = error.message || "";
      if (errMsg.includes("429") || errMsg.includes("Too Many Requests") || errMsg.includes("quota")) {
        return {
          skor: 0,
          feedback: "Mohon maaf, sistem AI sedang penuh/sibuk (Limit Akses Tercapai). Harap tunggu sekitar 15-30 detik sebelum mencoba soal berikutnya.",
        };
      }

      return {
        skor: 0,
        feedback: "Gagal terhubung ke model analisis AI. Sistem sedang mengalami kendala jaringan.",
      };
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
