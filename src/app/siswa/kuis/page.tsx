import React from "react";
import { ClipboardList, LayoutDashboard } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClassIndexClient from "@/components/ClassIndexClient";

export default async function SiswaKuisIndexPage() {
  const session = await getSession();
  if (!session || session.user.role !== "SISWA") redirect("/?login=true");

  const enrollments = await prisma.enrollment.findMany({
    where: { student_id: session.user.id },
    include: {
      class: {
        include: {
          _count: {
            select: { 
              exams: { where: { is_final: false } }, 
              enrollments: true 
            }
          },
          teacher: {
            select: { nama_lengkap: true }
          }
        }
      }
    }
  });

  const classes = enrollments.map(e => e.class);

  return (
    <ClassIndexClient 
      title="Pilih Kelas untuk Kuis"
      subtitle="Pilih kelas di bawah ini untuk melihat daftar kuis yang tersedia."
      headerIcon="ClipboardList"
      cardIcon="LayoutDashboard"
      countLabel="Kuis"
      countIcon="ClipboardList"
      actionLabel="Lihat Kuis"
      basePath="/siswa/kuis/kelas"
      classes={classes}
      emptyMessage="Anda belum terdaftar di kelas manapun."
      themeColor="orange"
      role="SISWA"
    />
  );
}
