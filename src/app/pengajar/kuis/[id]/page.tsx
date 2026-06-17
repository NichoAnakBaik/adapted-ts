import React from "react";
import PengajarKuisDetailClient from "./PengajarKuisDetailClient";
import { getExamDetails } from "@/app/actions/pengajar";
import { notFound } from "next/navigation";

export default async function PengajarKuisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = await getExamDetails(id);
  
  if (!exam) {
    notFound();
  }

  return <PengajarKuisDetailClient exam={exam} />;
}
