"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Clock, CheckCircle2, PlayCircle, AlertCircle, ArrowRight, Mic, Square, Timer, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { submitExam } from "@/app/actions/siswa";
import { KoreanInput, KoreanTextarea } from "@/components/KoreanInput";
import { AudioPlayer } from "@/components/AudioPlayer";

export default function SiswaKuisAttemptClient({ exam }: { exam: any }) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  
  // Data tracking
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({});
  const [audioBlobs, setAudioBlobs] = useState<Record<string, Blob>>({});
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number } | null>(null);
  const [error, setError] = useState("");

  // Timer logic for the current question
  const [startTime, setStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Set initial start time on mount
  useEffect(() => {
    setStartTime(Date.now());
    if (exam.time_limit) {
      setTimeLeft(exam.time_limit * 60);
    }
  }, [exam.time_limit]);

  // Timer Countdown Effect
  useEffect(() => {
    if (timeLeft === null || isSubmitting || result) return;

    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isSubmitting, result]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Speaking recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Use refs to avoid stale closures in the timer's auto-submit
  const answersRef = useRef(answers);
  const audioBlobsRef = useRef(audioBlobs);
  const timeSpentRef = useRef(timeSpent);
  
  useEffect(() => {
    answersRef.current = answers;
    audioBlobsRef.current = audioBlobs;
    timeSpentRef.current = timeSpent;
  }, [answers, audioBlobs, timeSpent]);

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

  const jumpToQuestion = (index: number) => {
    if (index >= 0 && index < exam.questions.length && index !== currentQIndex) {
      recordTimeSpent();
      setCurrentQIndex(index);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const chunkType = chunks[0]?.type;
        const mimeType = chunkType || mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(chunks, { type: mimeType });
        const qId = exam.questions[currentQIndex].id;
        
        setAudioBlobs(prev => ({ ...prev, [qId]: audioBlob }));
        setAudioUrls(prev => ({ ...prev, [qId]: URL.createObjectURL(audioBlob) }));

        // Auto-fill answer text to indicate recorded
        setAnswers(prev => ({ ...prev, [qId]: "Recorded Audio" }));
        
        // Safely stop tracks after the recorder has fully stopped processing
        stream.getTracks().forEach(track => track.stop());
      };

      // Start with timeslice to ensure proper file headers and duration metadata
      mediaRecorder.start(250);
      setIsRecording(true);
    } catch (err) {
      setError("Gagal mengakses mikrofon. Pastikan Anda telah memberikan izin.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (isAutoSubmit: boolean = false) => {
    if (!isAutoSubmit && !confirm("Apakah Anda yakin ingin mengumpulkan ujian ini? Jawaban tidak dapat diubah lagi.")) return;
    
    // Record time for the final question before submitting
    recordTimeSpent();
    
    setIsSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("exam_id", exam.id);

    // Prepare JSON for answers and time
    const answersData: any = {};
    exam.questions.forEach((q: any) => {
      let finalTime = timeSpentRef.current[q.id] || 0;
      if (q.id === exam.questions[currentQIndex].id) {
        finalTime += Math.floor((Date.now() - startTime) / 1000);
      }

      answersData[q.id] = {
        student_answer: answersRef.current[q.id] || "",
        time_spent_seconds: finalTime
      };
      
      if (audioBlobsRef.current[q.id]) {
        answersData[q.id].has_audio = true;
      }
    });

    for (const q of exam.questions) {
      if (audioBlobsRef.current[q.id]) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(audioBlobsRef.current[q.id]);
        });
        const base64 = await base64Promise;
        formData.append(`audio_b64_${q.id}`, base64);
      }
    }

    formData.append("answers_json", JSON.stringify(answersData));

    try {
      const res = await submitExam(formData);
      
      if (res.error) {
        setError(res.error);
        setIsSubmitting(false);
      } else if (res.success && res.score !== undefined) {
        setResult({ score: res.score });
      }
    } catch (err: any) {
      setError(err.message || "Gagal mengumpulkan kuis. Pastikan server aktif dan ukuran file tidak terlalu besar.");
      setIsSubmitting(false);
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
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors ${
          timeLeft !== null && timeLeft <= 60 
            ? 'bg-red-50 text-red-600 animate-pulse' 
            : 'bg-orange-50 text-orange-600'
        }`}>
          {timeLeft !== null ? (
            <>
              <Timer className="w-5 h-5" />
              <span className="font-mono text-lg tracking-wider">{formatTime(timeLeft)}</span>
            </>
          ) : (
            <>
              <Clock className="w-5 h-5" />
              <span>Tanpa Batas Waktu</span>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-2 font-medium">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Main Content Area */}
        <div className="flex-1 w-full space-y-6">

      {/* Question Card with Animation */}
      <div 
        key={currentQ.id} // Re-render triggers animation
        className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4 fade-in duration-500"
      >
        <div className="mb-6">
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-wider shadow-sm ${
            currentQ.type === 'READING' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
            currentQ.type === 'LISTENING' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
            currentQ.type === 'SPEAKING' ? 'bg-green-50 text-green-700 border border-green-100' :
            'bg-orange-50 text-orange-700 border border-orange-100'
          }`}>
            {currentQ.type}
          </span>
          <p className="text-xl md:text-2xl text-namsan-text font-medium whitespace-pre-wrap leading-relaxed">
            {currentQ.question_text}
          </p>
        </div>

        {/* Media Attachments */}
        {currentQ.image_url && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 shadow-sm transition-transform hover:scale-[1.01] duration-300">
            <img src={currentQ.image_url} alt="Ilustrasi Soal" className="w-full object-contain max-h-[400px]" />
          </div>
        )}

        {currentQ.audio_reference && (
          <div className="mb-8 bg-gradient-to-br from-purple-50 to-blue-50 p-5 rounded-2xl border border-purple-100 shadow-inner">
            <span className="text-sm font-bold text-purple-800 flex items-center gap-2 mb-3">
              <PlayCircle className="w-5 h-5 animate-pulse" /> Putar Audio Pendengaran
            </span>
            <AudioPlayer src={currentQ.audio_reference} />
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
                  className={`relative p-5 rounded-2xl border-2 text-left font-bold transition-all duration-200 flex items-start gap-4 overflow-hidden group ${
                    answers[currentQ.id] === option 
                      ? 'border-namsan-primary bg-namsan-soft text-namsan-primary shadow-md scale-[1.02]' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors ${
                    answers[currentQ.id] === option ? 'border-namsan-primary bg-namsan-primary text-white' : 'border-gray-300 group-hover:border-gray-400'
                  }`}>
                    <span className="text-sm">{answers[currentQ.id] === option ? '✓' : ''}</span>
                  </div>
                  <div className="flex flex-col text-left relative z-10">
                    <span className="font-bold mb-1">Pilihan {option}</span>
                    {currentQ[`option_${option.toLowerCase()}`] && (
                      <span className={`text-sm font-normal ${answers[currentQ.id] === option ? 'text-namsan-primary/80' : 'text-gray-500'}`}>
                        {currentQ[`option_${option.toLowerCase()}`]}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : currentQ.type === 'SPEAKING' ? (
            <div className="p-8 bg-gradient-to-b from-green-50 to-white border border-green-100 rounded-3xl flex flex-col items-center text-center shadow-inner relative overflow-hidden">
              {/* Decorative background circle */}
              {isRecording && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="w-48 h-48 bg-red-400 rounded-full animate-ping"></div>
                </div>
              )}
              
              <div className="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 transition-transform hover:scale-105">
                <Mic className={`w-10 h-10 transition-colors duration-300 ${isRecording ? 'text-red-500 animate-pulse' : 'text-green-600'}`} />
              </div>
              <div className="relative z-10">
                <p className="font-bold text-xl text-green-900 mb-2">
                  {isRecording ? "Sedang Merekam..." : "Perekam Suara AI"}
                </p>
                <p className="text-sm text-green-700 mb-6 max-w-sm mx-auto">
                  {isRecording ? "Berbicaralah dengan jelas. Tekan hentikan jika sudah selesai." : "Tekan tombol di bawah untuk mulai merekam pelafalan Anda."}
                </p>
                
                {isRecording ? (
                  <button onClick={stopRecording} className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-2xl flex items-center gap-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 mx-auto">
                    <Square className="w-5 h-5 fill-current" /> Hentikan Rekaman
                  </button>
                ) : (
                  <button onClick={startRecording} className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-bold py-3 px-8 rounded-2xl flex items-center gap-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 mx-auto">
                    <Mic className="w-5 h-5" /> Mulai Rekam Sekarang
                  </button>
                )}
              </div>

              {audioBlobs[currentQ.id] && !isRecording && (
                <div className="mt-8 p-5 bg-white rounded-2xl shadow-md w-full max-w-md border border-gray-100 relative z-10 animate-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <p className="text-sm font-bold text-gray-800">Rekaman Tersimpan</p>
                  </div>
                  <audio key={audioUrls[currentQ.id] || "new"} controls src={audioUrls[currentQ.id] || ""} className="w-full h-10 outline-none" />
                  {audioBlobs[currentQ.id] && (
                    <p className="text-xs text-gray-400 mt-1">Ukuran file: {Math.round(audioBlobs[currentQ.id].size / 1024)} KB</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="relative group">
              <KoreanTextarea 
                rows={5}
                placeholder="Ketik teks atau esai jawaban Anda di sini..."
                value={answers[currentQ.id] || ""}
                onValueChange={(val) => handleAnswerChange(currentQ.id, val)}
                className="w-full p-5 bg-gray-50/50 border-2 border-gray-200 focus:border-namsan-primary focus:bg-white rounded-2xl outline-none transition-all duration-300 text-lg shadow-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button 
          onClick={handlePrev}
          disabled={currentQIndex === 0 || isSubmitting}
          className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 px-6 md:px-8 rounded-2xl border border-gray-200 flex items-center gap-2 transition-all duration-200 disabled:opacity-50 hover:shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" /> <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        {currentQIndex === exam.questions.length - 1 ? (
          <button 
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-namsan-text to-gray-800 hover:from-gray-800 hover:to-black text-white font-bold py-3.5 px-8 md:px-10 rounded-2xl flex items-center gap-2 transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-xl hover:-translate-y-0.5"
          >
            {isSubmitting ? "Memproses..." : "Kumpulkan Ujian"} <CheckCircle2 className="w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-namsan-primary to-[#ffcf6b] hover:from-[#ffcf6b] hover:to-[#ffb732] text-namsan-dark font-bold py-3.5 px-6 md:px-8 rounded-2xl flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <span className="hidden sm:inline">Selanjutnya</span> <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
        </div>

        {/* Navigator Grid Panel */}
        <div className="w-full lg:w-80 shrink-0 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 lg:sticky lg:top-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-namsan-primary" /> Navigasi Soal
          </h3>
          
          <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-2 md:gap-3">
            {exam.questions.map((q: any, index: number) => {
              const isCurrent = index === currentQIndex;
              const isAnswered = answers[q.id] && answers[q.id].trim() !== "";
              return (
                <button
                  key={q.id}
                  onClick={() => jumpToQuestion(index)}
                  className={`relative w-full aspect-square rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-200 
                    ${isCurrent ? 'ring-4 ring-blue-200 ring-offset-1 scale-105 z-10' : 'hover:scale-105 hover:shadow-sm'}
                    ${isAnswered 
                      ? 'bg-namsan-primary text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }
                  `}
                >
                  {index + 1}
                  {isCurrent && <div className="absolute -bottom-1 w-4 h-1 bg-blue-500 rounded-full" />}
                </button>
              );
            })}
          </div>
          
          <div className="mt-6 space-y-3 text-xs md:text-sm text-gray-600 font-medium bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-md bg-namsan-primary shadow-sm"></div> Sudah Dijawab
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-md bg-gray-100 border border-gray-200"></div> Belum Dijawab
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-md border-4 border-blue-200 flex items-center justify-center">
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
              </div> 
              Posisi Saat Ini
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
