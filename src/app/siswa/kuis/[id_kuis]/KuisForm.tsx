'use client';

import { useState } from 'react';
import { submitKuis } from '@/app/actions/kuis';

export default function KuisForm({ kuis, soalList }: { kuis: any, soalList: any[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitKuis(kuis.id_kuis, answers);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      alert('Terjadi kesalahan saat mengirim kuis.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">{kuis.judul_kuis}</h1>
        <p className="text-gray-600 mt-2">{kuis.deskripsi}</p>
        <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-semibold">
          Waktu Pengerjaan: {kuis.waktu_menit} Menit
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {soalList.map((soal, index) => (
          <div key={soal.id_soal} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              <span className="text-blue-600 mr-2">{index + 1}.</span> {soal.pertanyaan}
            </h3>
            
            {soal.tipe_soal === 'listening' && soal.file_audio && (
              <div className="mb-4">
                <audio controls className="w-full max-w-md">
                  <source src={`/uploads/${soal.file_audio}`} type="audio/mpeg" />
                  Browser Anda tidak mendukung audio.
                </audio>
              </div>
            )}

            <textarea
              className="w-full mt-2 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 hover:bg-white"
              rows={4}
              placeholder="Tulis jawaban Anda di sini..."
              value={answers[soal.id_soal] || ''}
              onChange={(e) => setAnswers({...answers, [soal.id_soal]: e.target.value})}
              required
            ></textarea>
            
            <div className="mt-4 flex justify-end">
              <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wider">
                Tipe: {soal.tipe_soal}
              </span>
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1 hover:shadow-xl'
            }`}
          >
            {isSubmitting ? 'Menganalisis Jawaban (AI)...' : 'Kirim Jawaban & Dapatkan Nilai'}
          </button>
        </div>
      </form>
    </div>
  );
}
