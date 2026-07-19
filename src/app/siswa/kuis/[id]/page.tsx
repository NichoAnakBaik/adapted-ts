import React from "react";
import SiswaKuisAttemptClient from "./SiswaKuisAttemptClient";
import { getExamToTake } from "@/app/actions/siswa";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export default async function SiswaKuisAttemptPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams?: Promise<{ retake?: string }> }) {
  const { id } = await params;
  
  const resolvedSearchParams = searchParams ? await searchParams : { retake: 'false' };
  const isRetake = resolvedSearchParams.retake === 'true';

  const session = await getSession();
  if (session && session.user.id) {
    const existingAttempt = await prisma.examAttempt.findFirst({
      where: { exam_id: id, student_id: session.user.id },
      orderBy: { created_at: 'desc' }
    });
    
    // Only redirect if they have an attempt AND they are not explicitly retaking
    if (existingAttempt && !isRetake) {
      redirect(`/siswa/kuis/${id}/hasil`);
    }
  }
  const exam = await getExamToTake(id);
  
  if (!exam) {
    notFound();
  }

  return <SiswaKuisAttemptClient exam={exam} />;
}
