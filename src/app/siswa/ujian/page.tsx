import React from "react";
import { GraduationCap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SiswaUjianIndexPage() {
  const session = await getSession();
  if (!session || session.user.role !== "SISWA") redirect("/?login=true");

  const enrollments = await prisma.enrollment.findMany({
    where: { student_id: session.user.id },
    include: { class: true }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold text-namsan-text mb-2">Pilih Kelas untuk Ujian</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">Pilih kelas di bawah ini untuk melihat daftar ujian yang tersedia.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          {enrollments.map((e) => (
            <Link key={e.class.id} href={`/siswa/ujian/kelas/${e.class.id}`} className="block p-6 rounded-2xl border border-gray-200 hover:border-namsan-primary hover:shadow-md transition-all group">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">{e.class.type}</span>
              </div>
              <h3 className="font-bold text-lg text-namsan-text group-hover:text-namsan-primary transition-colors">{e.class.name}</h3>
              <div className="mt-4 flex items-center gap-1 text-sm font-bold text-namsan-primary group-hover:gap-2 transition-all">
                Lihat Ujian <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
          {enrollments.length === 0 && (
            <div className="col-span-full p-6 text-center text-gray-400">Anda belum terdaftar di kelas manapun.</div>
          )}
        </div>
      </div>
    </div>
  );
}
