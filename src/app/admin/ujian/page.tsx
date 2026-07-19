import React from "react";
import { GraduationCap, LayoutDashboard, ClipboardList } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClassIndexClient from "@/components/ClassIndexClient";

export default async function AdminUjianIndexPage() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/?login=true");

  const classes = await prisma.class.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      _count: {
        select: { exams: true, enrollments: true }
      }
    }
  });

  return (
    <ClassIndexClient 
      title="Pilih Kelas untuk Ujian"
      subtitle="Pilih kelas di bawah ini untuk melihat ujian akhir yang tersedia pada kelas tersebut."
      headerIcon="GraduationCap"
      cardIcon="LayoutDashboard"
      countLabel="Ujian"
      countIcon="ClipboardList"
      actionLabel="Pantau Ujian"
      basePath="/admin/ujian/kelas"
      classes={classes}
      emptyMessage="Belum ada kelas yang terdaftar."
      themeColor="yellow"
    />
  );
}
