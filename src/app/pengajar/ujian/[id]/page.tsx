import React from "react";
import { getExamDetails } from "@/app/actions/pengajar";
import PengajarUjianDetailClient from "./PengajarUjianDetailClient";
import { redirect } from "next/navigation";

export default async function UjianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const exam = await getExamDetails(resolvedParams.id);
  
  if (!exam) {
    redirect("/pengajar/ujian");
  }

  return <PengajarUjianDetailClient exam={exam} />;
}
