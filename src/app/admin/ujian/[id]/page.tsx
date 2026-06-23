import React from "react";
import AdminUjianDetailClient from "./AdminUjianDetailClient";
import { getAdminExamDetails, getEligibleStudents } from "@/app/actions/admin";
import { notFound } from "next/navigation";

export default async function AdminUjianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const exam = await getAdminExamDetails(resolvedParams.id);
  const eligibleStudents = await getEligibleStudents(resolvedParams.id);

  if (!exam) {
    notFound();
  }

  return <AdminUjianDetailClient exam={exam} initialEligibleStudents={eligibleStudents} />;
}
