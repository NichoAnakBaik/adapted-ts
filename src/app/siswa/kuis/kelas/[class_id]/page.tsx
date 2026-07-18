import React from "react";
import SiswaKuisClient from "../../SiswaKuisClient";
import { getAvailableQuizzes } from "@/app/actions/siswa";
import { prisma } from "@/lib/prisma";

export default async function SiswaKuisKelasPage({ params }: { params: { class_id: string } }) {
  // Fetch only quizzes for this specific class
  const allExams = await getAvailableQuizzes();
  const classExams = allExams.filter(ex => ex.class_id === params.class_id);
  
  const classData = await prisma.class.findUnique({
    where: { id: params.class_id },
    select: { name: true }
  });

  return <SiswaKuisClient exams={classExams} className={classData?.name} />;
}
