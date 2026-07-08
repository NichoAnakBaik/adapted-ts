import React from "react";
import PengajarUjianClient from "../../PengajarUjianClient";
import { getFinalExamsByClass, getClassDetails } from "@/app/actions/pengajar";
import { notFound } from "next/navigation";

export default async function PengajarUjianKelasPage({ params }: { params: Promise<{ class_id: string }> }) {
  const { class_id } = await params;
  const exams = await getFinalExamsByClass(class_id);
  const classData = await getClassDetails(class_id);

  if (!classData) {
    notFound();
  }

  const classes = [classData];

  return <PengajarUjianClient exams={exams} currentClassId={class_id} classes={classes} />;
}
