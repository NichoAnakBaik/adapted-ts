import React from "react";
import AdminKuisClient from "../../AdminKuisClient";
import { getAdminQuizzes } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminKuisKelasPage({ params }: { params: { class_id: string } }) {
  // Fetch all quizzes and filter by class
  const allQuizzes = await getAdminQuizzes();
  const classQuizzes = allQuizzes.filter(q => q.class_id === params.class_id);
  
  const classData = await prisma.class.findUnique({
    where: { id: params.class_id },
    select: { name: true }
  });

  return <AdminKuisClient initialQuizzes={classQuizzes} className={classData?.name} classId={params.class_id} />;
}
