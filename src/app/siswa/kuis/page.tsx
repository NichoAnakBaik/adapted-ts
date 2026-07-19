import React from "react";
import { ClipboardList, ArrowRight, LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SiswaKuisIndexPage() {
  const session = await getSession();
  if (!session || session.user.role !== "SISWA") redirect("/?login=true");

  const enrollments = await prisma.enrollment.findMany({
    where: { student_id: session.user.id },
    include: {
      class: {
        include: {
          _count: {
            select: { exams: true, enrollments: true }
          }
        }
      }
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <ClipboardList className="w-8 h-8 text-namsan-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-namsan-text">Pilih Kelas untuk Kuis</h1>
            <p className="text-sm text-namsan-text-muted">Pilih kelas di bawah ini untuk melihat daftar kuis yang tersedia.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((e) => (
          <div key={e.class.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:border-namsan-primary transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-namsan-primary">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-namsan-text group-hover:text-namsan-primary transition-colors">{e.class.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 uppercase tracking-wider">
                  {e.class.type}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <ClipboardList className="w-4 h-4 text-gray-400" />
                {e.class._count?.exams || 0} Kuis
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Users className="w-4 h-4 text-gray-400" />
                {e.class._count?.enrollments || 0} Siswa
              </div>
            </div>

            <Link href={`/siswa/kuis/kelas/${e.class.id}`} className="mt-auto w-full bg-blue-50 hover:bg-namsan-primary text-namsan-primary hover:text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
              Lihat Kuis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
        {enrollments.length === 0 && (
          <div className="col-span-full p-6 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
            Anda belum terdaftar di kelas manapun.
          </div>
        )}
      </div>
    </div>
  );
}
