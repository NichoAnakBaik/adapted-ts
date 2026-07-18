"use client";

import React, { useState } from "react";
import { deletePengajarQuestion } from "@/app/actions/pengajar";

export default function KelolaSoalClient({ initialKuis, initialSoalList }: { initialKuis: any, initialSoalList: any[] }) {
  const [soalList, setSoalList] = useState(initialSoalList);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus soal ini?")) return;
    
    setIsDeleting(id);
    const res = await deletePengajarQuestion(id);
    if (res.success) {
      setSoalList(prev => prev.filter(s => s.id !== id));
    } else {
      alert(res.error || "Gagal menghapus soal");
    }
    setIsDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Soal AI</h1>
          <p className="text-gray-500 mt-1">Kuis: {initialKuis?.title}</p>
        </div>
        <button 
          onClick={() => alert("Fitur tambah soal interaktif belum diimplementasikan di versi ini")} 
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + Tambah Soal Baru
        </button>
      </div>

      <div className="space-y-4">
        {soalList.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-100 text-gray-500">
            Belum ada soal untuk kuis ini.
          </div>
        ) : (
          soalList.map((soal, index) => (
            <div key={soal.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-start">
                 <h3 className="font-bold text-gray-900">{index + 1}. {soal.question_text}</h3>
                 <span className="bg-gray-100 px-2 py-1 text-xs rounded text-gray-600 uppercase tracking-widest">{soal.type}</span>
               </div>
               <div className="mt-4 p-4 bg-green-50 text-green-900 rounded-lg text-sm">
                  <span className="font-bold mr-2">Kunci Jawaban:</span> 
                  {soal.answer_key || 'Pengecekan AI'}
               </div>
               <div className="mt-4 flex justify-end space-x-3">
                  <button 
                    onClick={() => alert("Fitur edit soal interaktif belum diimplementasikan")} 
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Edit Soal
                  </button>
                  <button 
                    onClick={() => handleDelete(soal.id)}
                    disabled={isDeleting === soal.id}
                    className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    {isDeleting === soal.id ? "Menghapus..." : "Hapus"}
                  </button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
