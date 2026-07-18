import React from "react";
import SiswaUjianClient from "../../SiswaUjianClient";
import { getAvailableFinalExams } from "@/app/actions/siswa";
import { prisma } from "@/lib/prisma";

export default async function SiswaUjianKelasPage({ params }: { params: Promise<{ class_id: string }> }) {
  const resolvedParams = await params;
  
  // Fetch only final exams for this specific class
  const allExams = await getAvailableFinalExams();
  const classExams = allExams.filter(ex => ex.class_id === resolvedParams.class_id);
  
  const classData = await prisma.class.findUnique({
    where: { id: resolvedParams.class_id },
    select: { name: true }
  });

  return <SiswaUjianClient exams={classExams} className={classData?.name} />;
}
