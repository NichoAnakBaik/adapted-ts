import React from "react";
import AdminKuisDetailClient from "./AdminKuisDetailClient";
import { getAdminExamDetails } from "@/app/actions/admin";
import { notFound } from "next/navigation";

export default async function AdminKuisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const exam = await getAdminExamDetails(resolvedParams.id);

  if (!exam) {
    notFound();
  }

  return <AdminKuisDetailClient exam={exam} />;
}
