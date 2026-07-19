"use client";

import React from "react";
import { GraduationCap, LayoutDashboard, ClipboardList } from "lucide-react";
import ClassIndexClient, { ClassData } from "@/components/ClassIndexClient";

export default function PengajarUjianIndexClient({ classes }: { classes: ClassData[] }) {
  return (
    <ClassIndexClient 
      title="Pilih Kelas untuk Ujian"
      subtitle="Pilih kelas di bawah ini untuk melihat dan membuat ujian akhir."
      headerIcon={GraduationCap}
      cardIcon={LayoutDashboard}
      countLabel="Ujian"
      countIcon={ClipboardList}
      actionLabel="Kelola Ujian"
      basePath="/pengajar/ujian/kelas"
      classes={classes}
      emptyMessage="Tidak ada kelas yang ditemukan."
      themeColor="orange"
    />
  );
}
