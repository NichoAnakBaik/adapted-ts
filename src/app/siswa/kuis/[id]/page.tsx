import React from "react";
import SiswaKuisAttemptClient from "./SiswaKuisAttemptClient";
import { getExamToTake } from "@/app/actions/siswa";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export default async function SiswaKuisAttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const session = await getSession();
  if (session && session.user.id) {
    const existingAttempt = await prisma.examAttempt.findFirst({
      where: { exam_id: id, student_id: session.user.id }
    });
    
    if (existingAttempt) {
      redirect(`/siswa/kuis/${id}/hasil`);
    }
  }
  const exam = await getExamToTake(id);
  
  if (!exam) {
    notFound();
  }

  return <SiswaKuisAttemptClient exam={exam} />;
}
