"use client";

import React from "react";
import { ClipboardList, LayoutDashboard } from "lucide-react";
import ClassIndexClient, { ClassData } from "@/components/ClassIndexClient";

export default function PengajarKuisIndexClient({ classes }: { classes: ClassData[] }) {
  return (
    <ClassIndexClient 
      title="Pilih Kelas untuk Kuis"
      subtitle="Pilih kelas di bawah ini untuk melihat dan membuat kuis."
      headerIcon="ClipboardList"
      cardIcon="LayoutDashboard"
      countLabel="Kuis"
      countIcon="ClipboardList"
      actionLabel="Kelola Kuis"
      basePath="/pengajar/kuis/kelas"
      classes={classes}
      emptyMessage="Tidak ada kelas yang ditemukan."
      themeColor="orange"
    />
  );
}
