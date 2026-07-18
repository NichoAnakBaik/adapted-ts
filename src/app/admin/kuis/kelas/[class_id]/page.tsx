import React from "react";
import AdminKuisClient from "../../AdminKuisClient";
import { getAdminQuizzes } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminKuisKelasPage({ params }: { params: Promise<{ class_id: string }> }) {
  const resolvedParams = await params;
  
  // Fetch all quizzes and filter by class
  const allQuizzes = await getAdminQuizzes();
  const classQuizzes = allQuizzes.filter(q => q.class_id === resolvedParams.class_id);
  
  const classData = await prisma.class.findUnique({
    where: { id: resolvedParams.class_id },
    select: { name: true }
  });

  return <AdminKuisClient initialQuizzes={classQuizzes} className={classData?.name} classId={resolvedParams.class_id} />;
}
