import React from "react";
import SiswaHasilClient from "./SiswaHasilClient";
import { getExamAttemptDetails } from "@/app/actions/siswa";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export default async function SiswaHasilKuisPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams?: Promise<{ attemptId?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  
  const attempt = await getExamAttemptDetails(resolvedParams.id, resolvedSearchParams.attemptId);
  
  if (!attempt) {
    return notFound();
  }

  const session = await getSession();
  const allAttempts = await prisma.examAttempt.findMany({
    where: { exam_id: resolvedParams.id, student_id: session?.user?.id },
    orderBy: { created_at: 'desc' },
    select: { id: true, created_at: true, total_score: true }
  });

  return <SiswaHasilClient attempt={attempt} allAttempts={allAttempts} />;
}
