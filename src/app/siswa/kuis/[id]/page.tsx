import React from "react";
import SiswaKuisAttemptClient from "./SiswaKuisAttemptClient";
import { getExamToTake } from "@/app/actions/siswa";
import { notFound } from "next/navigation";

export default async function SiswaKuisAttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = await getExamToTake(id);
  
  if (!exam) {
    notFound();
  }

  return <SiswaKuisAttemptClient exam={exam} />;
}
