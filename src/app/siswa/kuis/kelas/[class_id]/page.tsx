import React from "react";
import SiswaKuisClient from "../../SiswaKuisClient";
import { getAvailableQuizzes } from "@/app/actions/siswa";
import { prisma } from "@/lib/prisma";

export default async function SiswaKuisKelasPage({ params }: { params: Promise<{ class_id: string }> }) {
  const resolvedParams = await params;
  
  // Fetch only quizzes for this specific class
  const allExams = await getAvailableQuizzes();
  const classExams = allExams.filter(ex => ex.class_id === resolvedParams.class_id);
  
  const classData = await prisma.class.findUnique({
    where: { id: resolvedParams.class_id },
    select: { name: true }
  });

  return <SiswaKuisClient exams={classExams} className={classData?.name} />;
}
