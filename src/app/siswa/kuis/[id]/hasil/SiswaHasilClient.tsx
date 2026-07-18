"use client";

import React from "react";
import { ArrowLeft, CheckCircle2, XCircle, BrainCircuit, MessageSquareText, PlayCircle } from "lucide-react";
import Link from "next/link";

export default function SiswaHasilClient({ attempt, hideBackLink }: { attempt: any, hideBackLink?: boolean }) {
  const { exam, question_attempts } = attempt;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-namsan-soft rounded-bl-full -z-10 opacity-50"></div>
        
        {!hideBackLink && (
          <Link href={exam.is_final ? "/siswa/ujian" : "/siswa/kuis"} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-namsan-primary mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
        )}
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-namsan-text mb-2">Hasil: {exam.title}</h1>
            <p className="text-sm text-gray-500">Waktu penyelesaian: {new Date(attempt.end_time || attempt.created_at).toLocaleString('id-ID')}</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100 min-w-[120px]">
            <span className="block text-xs font-bold text-gray-500 mb-1">SKOR AKHIR</span>
            <span className={`text-4xl font-black ${attempt.total_score >= 70 ? 'text-green-500' : 'text-orange-500'}`}>
              {attempt.total_score}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-namsan-text">Detail Pengerjaan</h2>
        
        {exam.questions.map((q: any, index: number) => {
          const qa = question_attempts.find((a: any) => a.question_id === q.id);
          const studentAnswer = qa?.student_answer || "-";
          const isCorrect = q.answer_key ? studentAnswer.trim().toLowerCase() === q.answer_key.trim().toLowerCase() : null;

          return (
            <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-namsan-soft rounded-full flex items-center justify-center font-bold text-namsan-text-muted">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="mb-4">
                    <span className="text-xs font-bold text-namsan-text-muted uppercase tracking-wider">{q.type.replace('_', ' ')}</span>
                    <p className="text-lg text-namsan-text font-medium mt-1 whitespace-pre-wrap">{q.question_text}</p>
                  </div>
                  
                  {q.image_url && (
                    <div className="mb-4">
                      <img src={q.image_url} alt="Soal Image" className="max-w-md rounded-xl border border-gray-200 shadow-sm" />
                    </div>
                  )}

                  {q.audio_reference && (
                    <div className="mb-4 bg-blue-50 p-4 rounded-xl">
                      <span className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-2"><PlayCircle className="w-5 h-5" /> Audio Listening</span>
                      <audio controls src={q.audio_reference} className="w-full max-w-md h-10" />
                    </div>
                  )}

                  {q.type === 'MULTIPLE_CHOICE' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {['A', 'B', 'C', 'D'].map((opt) => {
                        const isStudentChoice = studentAnswer.toUpperCase() === opt;
                        const isCorrectChoice = q.answer_key?.toUpperCase() === opt;
                        
                        let optStyle = "border-gray-200 text-gray-600";
                        if (isCorrectChoice) optStyle = "border-green-500 bg-green-50 text-green-700 font-bold";
                        else if (isStudentChoice && !isCorrectChoice) optStyle = "border-red-400 bg-red-50 text-red-600 line-through opacity-70";

                        return (
                          <div key={opt} className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col ${optStyle}`}>
                            <span className="font-bold">Pilihan {opt}</span>
                            {q[`option_${opt.toLowerCase()}`] && (
                              <span className="text-sm mt-1">
                                {q[`option_${opt.toLowerCase()}`]}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.type !== 'MULTIPLE_CHOICE' && (
                    <div className="space-y-3 mb-4">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-500 block mb-1">JAWABAN KAMU</span>
                        
                        {qa?.audio_url && (
                          <div className="mt-2 mb-3">
                            <span className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-2"><PlayCircle className="w-4 h-4" /> Audio Jawaban Anda</span>
                            <audio controls src={qa.audio_url} className="w-full max-w-md h-10" />
                          </div>
                        )}

                        {qa?.transcript ? (
                          <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg">
                            <span className="text-xs font-bold text-indigo-700 block mb-1">TRANSKRIP AI (Speech-to-Text)</span>
                            <p className="font-medium text-gray-800 italic">"{qa.transcript}"</p>
                          </div>
                        ) : (
                           <p className="font-medium text-namsan-text">{studentAnswer}</p>
                        )}
                      </div>
                      {q.answer_key && (
                        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                          <span className="text-xs font-bold text-green-700 block mb-1">KUNCI JAWABAN</span>
                          <p className="font-medium text-green-800">{q.answer_key}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {isCorrect !== null && q.type === 'MULTIPLE_CHOICE' && (
                    <div className={`mt-2 flex items-center gap-2 font-bold text-sm ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                      {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      {isCorrect ? 'Benar (+10)' : 'Salah (0)'}
                    </div>
                  )}

                  {/* AI Recommendations / Insights */}
                  <div className="mt-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 flex gap-4 items-start relative overflow-hidden shadow-sm">
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-2xl opacity-50 -z-10"></div>
                    <div className="mt-1 flex-shrink-0 text-indigo-600 bg-white p-2 rounded-xl shadow-sm border border-indigo-50">
                      <BrainCircuit className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-extrabold text-indigo-900 flex items-center gap-2 mb-1.5">
                        ✨ Rekomendasi AI
                      </span>
                      <p className="text-sm text-indigo-950/80 leading-relaxed font-medium">
                        {qa?.ai_feedback ? qa.ai_feedback : (
                          isCorrect === true ? 
                            "Kerja bagus! Analisis kami menunjukkan pemahaman Anda pada konsep ini sudah sangat solid. Teruskan performa luar biasa ini ke materi berikutnya." :
                          isCorrect === false ?
                            "Anda tampaknya melewatkan detail penting pada soal ini. AI merekomendasikan Anda untuk kembali membuka Modul terkait dan berlatih mengenali pola serupa." :
                          q.type === 'SPEAKING' ?
                            "Rekaman suara Anda telah disimpan. AI sedang menganalisis intonasi dan pelafalan Anda. Pengajar juga akan memberikan penilaian komprehensif segera." :
                          q.type === 'WRITING' ?
                            "Esai Anda sedang dalam antrean evaluasi. AI merekomendasikan Anda untuk terus membaca teks bahasa Korea agar struktur kalimat Anda semakin natural." :
                            "Jawaban Anda sedang dievaluasi. Pastikan Anda rutin mereview kosakata baru setiap harinya."
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
