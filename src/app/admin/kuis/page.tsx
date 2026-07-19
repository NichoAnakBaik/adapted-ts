import React from "react";
import { ClipboardList, LayoutDashboard } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClassIndexClient from "@/components/ClassIndexClient";

export default async function AdminKuisIndexPage() {
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
      title="Pilih Kelas untuk Kuis"
      subtitle="Pilih kelas di bawah ini untuk melihat kuis yang tersedia pada kelas tersebut."
      headerIcon="ClipboardList"
      cardIcon="LayoutDashboard"
      countLabel="Kuis"
      countIcon="ClipboardList"
      actionLabel="Pantau Kuis"
      basePath="/admin/kuis/kelas"
      classes={classes}
      emptyMessage="Belum ada kelas yang terdaftar."
      themeColor="indigo"
    />
  );
}
