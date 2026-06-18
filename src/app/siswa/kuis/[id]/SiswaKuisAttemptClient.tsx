"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Clock, CheckCircle2, PlayCircle, AlertCircle, ArrowRight, Mic, Square } from "lucide-react";
import Link from "next/link";
import { submitExam } from "@/app/actions/siswa";
import { KoreanInput, KoreanTextarea } from "@/components/KoreanInput";

export default function SiswaKuisAttemptClient({ exam }: { exam: any }) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  
  // Data tracking
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({});
  const [audioBlobs, setAudioBlobs] = useState<Record<string, Blob>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number } | null>(null);
  const [error, setError] = useState("");

  // Timer logic for the current question
  const [startTime, setStartTime] = useState<number>(0);

  // Set initial start time on mount
  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  // Speaking recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const recordTimeSpent = () => {
    if (startTime === 0) return;
    const qId = exam.questions[currentQIndex]?.id;
    if (!qId) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    setTimeSpent(prev => ({
      ...prev,
      [qId]: (prev[qId] || 0) + elapsed
    }));
    setStartTime(Date.now());
  };

  const handleNext = () => {
    if (currentQIndex < exam.questions.length - 1) {
      recordTimeSpent();
      setCurrentQIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      recordTimeSpent();
      setCurrentQIndex(prev => prev - 1);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const qId = exam.questions[currentQIndex].id;
        setAudioBlobs(prev => ({ ...prev, [qId]: audioBlob }));
        // Auto-fill answer text to indicate recorded
        setAnswers(prev => ({ ...prev, [qId]: "Recorded Audio" }));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError("Gagal mengakses mikrofon. Pastikan Anda telah memberikan izin.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks to release microphone
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!confirm("Apakah Anda yakin ingin mengumpulkan ujian ini? Jawaban tidak dapat diubah lagi.")) return;
    
    // Record time for the final question before submitting
    recordTimeSpent();
    
    setIsSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("exam_id", exam.id);

    // Prepare JSON for answers and time
    const answersData: any = {};
    exam.questions.forEach((q: any) => {
      // Re-calculate the final time for the current question specifically just to be safe
      let finalTime = timeSpent[q.id] || 0;
      if (q.id === exam.questions[currentQIndex].id) {
        finalTime += Math.floor((Date.now() - startTime) / 1000);
      }

      answersData[q.id] = {
        student_answer: answers[q.id] || "",
        time_spent_seconds: finalTime
      };
      
      if (audioBlobs[q.id]) {
        formData.append(`audio_${q.id}`, audioBlobs[q.id], `recording_${q.id}.webm`);
      }
    });

    formData.append("answers_json", JSON.stringify(answersData));

    const res = await submitExam(formData);
    
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

          <Link href={exam.is_final ? "/siswa/ujian" : "/siswa/kuis"} className="bg-namsan-text hover:bg-namsan-text/90 text-white font-bold py-3 px-8 rounded-xl transition-colors">
            Kembali ke Daftar {exam.is_final ? 'Ujian' : 'Kuis'}
          </Link>
        </div>
      </div>
    );
  }

  if (!exam.questions || exam.questions.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Kuis ini belum memiliki pertanyaan.</p>
      </div>
    );
  }

  const currentQ = exam.questions[currentQIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-namsan-text mb-1">{exam.title}</h1>
          <p className="text-namsan-text-muted text-sm">{exam.class.name}</p>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl font-bold">
          <Clock className="w-5 h-5" />
          {exam.time_limit ? `${exam.time_limit} Menit` : 'Tanpa Batas Waktu'}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-2 font-medium">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Progress */}
      <div className="flex items-center justify-between px-2 text-sm font-bold text-namsan-text-muted">
        <span>Soal {currentQIndex + 1} dari {exam.questions.length}</span>
        <span>
          Terjawab: {Object.keys(answers).filter(k => answers[k] !== "").length} / {exam.questions.length}
        </span>
      </div>

      {/* Question Card */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider ${
            currentQ.type === 'READING' ? 'bg-blue-100 text-blue-700' :
            currentQ.type === 'LISTENING' ? 'bg-purple-100 text-purple-700' :
            currentQ.type === 'SPEAKING' ? 'bg-green-100 text-green-700' :
            'bg-orange-100 text-orange-700'
          }`}>
            {currentQ.type}
          </span>
          <p className="text-xl md:text-2xl text-namsan-text font-medium whitespace-pre-wrap leading-relaxed">
            {currentQ.question_text}
          </p>
        </div>

        {/* Media Attachments */}
        {currentQ.image_url && (
          <div className="mb-6">
            <img src={currentQ.image_url} alt="Ilustrasi Soal" className="max-w-full md:max-w-lg rounded-xl border border-gray-200" />
          </div>
        )}

        {currentQ.audio_reference && (
          <div className="mb-8 bg-purple-50 p-4 rounded-xl border border-purple-100">
            <span className="text-sm font-bold text-purple-800 flex items-center gap-2 mb-2"><PlayCircle className="w-5 h-5" /> Putar Audio</span>
            <audio controls src={currentQ.audio_reference} className="w-full h-12" />
          </div>
        )}

        {/* Answer Inputs */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          {(currentQ.format === 'MULTIPLE_CHOICE' || currentQ.type === 'MULTIPLE_CHOICE') ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['A', 'B', 'C', 'D'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleAnswerChange(currentQ.id, option)}
                  className={`p-4 rounded-xl border-2 text-left font-bold transition-all flex items-start gap-3 ${
                    answers[currentQ.id] === option 
                      ? 'border-namsan-primary bg-namsan-soft text-namsan-primary shadow-sm' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    answers[currentQ.id] === option ? 'border-namsan-primary bg-namsan-primary text-white' : 'border-gray-300'
                  }`}>
                    <span className="text-xs">{answers[currentQ.id] === option ? '✓' : ''}</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold mb-1">Pilihan {option}</span>
                    {currentQ[`option_${option.toLowerCase()}`] && (
                      <span className="text-sm font-normal text-gray-700">
                        {currentQ[`option_${option.toLowerCase()}`]}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : currentQ.type === 'SPEAKING' ? (
            <div className="p-6 bg-green-50 border border-green-100 rounded-2xl flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Mic className={`w-8 h-8 ${isRecording ? 'text-red-500 animate-pulse' : 'text-green-600'}`} />
              </div>
              <div>
                <p className="font-bold text-green-900 mb-1">Perekam Suara</p>
                <p className="text-sm text-green-700 mb-4">Tekan tombol di bawah untuk mulai merekam jawaban Anda.</p>
                
                {isRecording ? (
                  <button onClick={stopRecording} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors mx-auto">
                    <Square className="w-5 h-5 fill-current" /> Hentikan Rekaman
                  </button>
                ) : (
                  <button onClick={startRecording} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors mx-auto">
                    <Mic className="w-5 h-5" /> Mulai Rekam
                  </button>
                )}
              </div>

              {audioBlobs[currentQ.id] && !isRecording && (
                <div className="mt-4 p-4 bg-white rounded-xl shadow-sm w-full max-w-md">
                  <p className="text-sm font-bold text-gray-700 mb-2">Hasil Rekaman:</p>
                  <audio controls src={URL.createObjectURL(audioBlobs[currentQ.id])} className="w-full h-10" />
                </div>
              )}
            </div>
          ) : (
            <KoreanTextarea 
              rows={4}
              placeholder="Ketik teks atau esai jawaban Anda di sini..."
              value={answers[currentQ.id] || ""}
              onValueChange={(val) => handleAnswerChange(currentQ.id, val)}
              className="w-full p-4 border-2 border-gray-200 focus:border-namsan-primary rounded-xl outline-none transition-colors text-lg"
            />
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button 
          onClick={handlePrev}
          disabled={currentQIndex === 0 || isSubmitting}
          className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-xl border border-gray-200 flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" /> Sebelumnya
        </button>

        {currentQIndex === exam.questions.length - 1 ? (
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-namsan-text hover:bg-namsan-text/90 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
          >
            {isSubmitting ? "Memproses..." : "Kumpulkan Ujian"} <CheckCircle2 className="w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
          >
            Selanjutnya <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
