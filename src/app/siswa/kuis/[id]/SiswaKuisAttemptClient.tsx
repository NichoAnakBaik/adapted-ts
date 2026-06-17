"use client";

import React, { useState } from "react";
import { ArrowLeft, Clock, CheckCircle2, PlayCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { submitExam } from "@/app/actions/siswa";
import { KoreanInput, KoreanTextarea } from "@/components/KoreanInput";

export default function SiswaKuisAttemptClient({ exam }: { exam: any }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number } | null>(null);
  const [error, setError] = useState("");

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!confirm("Apakah Anda yakin ingin mengumpulkan ujian ini? Jawaban tidak dapat diubah lagi.")) return;
    
    setIsSubmitting(true);
    setError("");
    const res = await submitExam(exam.id, answers);
    
    if (res.error) {
      setError(res.error);
      setIsSubmitting(false);
    } else if (res.success && res.score !== undefined) {
      setResult({ score: res.score });
    }
  };

  if (result) {
    return (
      <div className="max-w-3xl mx-auto mt-12 text-center space-y-6">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-namsan-text mb-2">Ujian Selesai!</h1>
          <p className="text-gray-500 mb-8">Anda telah menyelesaikan {exam.title}.</p>
          
          <div className="p-6 bg-gray-50 rounded-2xl w-full max-w-sm mb-8">
            <p className="text-sm font-bold text-namsan-text-muted tracking-wider mb-2">NILAI AKHIR</p>
            <p className={`text-6xl font-bold ${result.score >= 70 ? 'text-green-600' : 'text-orange-500'}`}>
              {result.score}
            </p>
          </div>

          <Link href="/siswa/kuis" className="bg-namsan-text hover:bg-namsan-text/90 text-white font-bold py-3 px-8 rounded-xl transition-colors">
            Kembali ke Daftar Kuis
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-namsan-text mb-1">{exam.title}</h1>
            <p className="text-namsan-text-muted text-sm">{exam.class.name}</p>
          </div>
          <div className="text-right flex items-center gap-4">
            <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl font-bold">
              <Clock className="w-5 h-5" />
              {exam.time_limit ? `${exam.time_limit} Menit` : 'Tanpa Batas Waktu'}
            </div>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Memproses..." : "Kumpulkan Ujian"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-2 font-medium">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6 pb-24">
        {exam.questions.map((q: any, index: number) => (
          <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-namsan-soft rounded-full flex items-center justify-center font-bold text-namsan-text-muted">
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="mb-4">
                <span className="text-xs font-bold text-namsan-text-muted uppercase tracking-wider">{q.type.replace('_', ' ')}</span>
                <p className="text-lg text-namsan-text font-medium mt-1 whitespace-pre-wrap">{q.question_text}</p>
              </div>
              
              {q.audio_reference && (
                <div className="mb-6">
                  <a href={q.audio_reference} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                    <PlayCircle className="w-5 h-5" /> Putar Audio Reference
                  </a>
                </div>
              )}

              {/* Answer Input based on type */}
              <div className="mt-4">
                {(q.format === 'MULTIPLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['A', 'B', 'C', 'D'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleAnswerChange(q.id, option)}
                        className={`p-4 rounded-xl border-2 text-left font-bold transition-all flex items-center gap-3 ${
                          answers[q.id] === option 
                            ? 'border-namsan-primary bg-blue-50 text-namsan-primary shadow-sm' 
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          answers[q.id] === option ? 'border-namsan-primary bg-namsan-primary text-white' : 'border-gray-300'
                        }`}>
                          <span className="text-xs">{answers[q.id] === option ? '✓' : ''}</span>
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-bold">Pilihan {option}</span>
                          {q[`option_${option.toLowerCase()}`] && (
                            <span className="text-sm font-normal text-gray-600 mt-1">
                              {q[`option_${option.toLowerCase()}`]}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : q.type === 'SPEAKING' ? (
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <p className="text-sm text-gray-500 mb-2">*(Fitur AI Voice Analysis akan diaktifkan di Tahap Akhir). Untuk saat ini, ketik "Selesai" jika Anda sudah mempraktikkan pengucapannya secara mandiri.*</p>
                    <KoreanInput 
                      type="text" 
                      placeholder="Ketik Selesai" 
                      value={answers[q.id] || ""}
                      onValueChange={(val) => handleAnswerChange(q.id, val)}
                      className="w-full p-3 border rounded-xl outline-none focus:border-namsan-primary transition-colors"
                    />
                  </div>
                ) : (
                  <KoreanTextarea 
                    rows={3}
                    placeholder="Tulis jawaban Anda di sini..."
                    value={answers[q.id] || ""}
                    onValueChange={(val) => handleAnswerChange(q.id, val)}
                    className="w-full p-4 border-2 focus:border-namsan-primary rounded-xl outline-none transition-colors"
                  />
                )}
              </div>
            </div>
          </div>
        ))}

        {exam.questions.length === 0 && (
          <div className="text-center p-8">
            <p className="text-gray-500">Kuis ini belum memiliki pertanyaan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
