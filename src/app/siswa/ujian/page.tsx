import React from "react";
import { GraduationCap, LayoutDashboard, ClipboardList } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClassIndexClient from "@/components/ClassIndexClient";

export default async function SiswaUjianIndexPage() {
  const session = await getSession();
  if (!session || session.user.role !== "SISWA") redirect("/?login=true");

  const enrollments = await prisma.enrollment.findMany({
    where: { student_id: session.user.id },
    include: {
      class: {
        include: {
          _count: {
            select: { exams: true, enrollments: true }
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
      title="Pilih Kelas untuk Ujian"
      subtitle="Pilih kelas di bawah ini untuk melihat daftar ujian yang tersedia."
      headerIcon="GraduationCap"
      cardIcon="LayoutDashboard"
      countLabel="Ujian"
      countIcon="ClipboardList"
      actionLabel="Lihat Ujian"
      basePath="/siswa/ujian/kelas"
      classes={classes}
      emptyMessage="Anda belum terdaftar di kelas manapun."
      themeColor="orange"
      role="SISWA"
    />
  );
}
