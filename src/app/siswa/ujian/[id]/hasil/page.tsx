import React from "react";
import SiswaHasilClient from "@/app/siswa/kuis/[id]/hasil/SiswaHasilClient";
import { getExamAttemptDetails } from "@/app/actions/siswa";
import { notFound } from "next/navigation";

export default async function SiswaHasilUjianPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const attempt = await getExamAttemptDetails(resolvedParams.id);
  
  if (!attempt) {
    return notFound();
  }

  return <SiswaHasilClient attempt={attempt} />;
}
