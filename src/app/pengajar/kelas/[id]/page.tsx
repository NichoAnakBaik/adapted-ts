import React from "react";
import { getClassDetails } from "@/app/actions/pengajar";
import PengajarKelasDetailClient from "./PengajarKelasDetailClient";
import { redirect } from "next/navigation";

export default async function KelasDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const classData = await getClassDetails(resolvedParams.id);
  
  if (!classData) {
    redirect("/pengajar/kelas");
  }

  return <PengajarKelasDetailClient classData={classData} />;
}
