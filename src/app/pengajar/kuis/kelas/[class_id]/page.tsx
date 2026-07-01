import React from "react";
import PengajarKuisClient from "../../PengajarKuisClient";
import { getQuizzesByClass, getClassDetails } from "@/app/actions/pengajar";
import { notFound } from "next/navigation";

export default async function PengajarKuisKelasPage({ params }: { params: { class_id: string } }) {
  const { class_id } = params;
  const exams = await getQuizzesByClass(class_id);
  const classData = await getClassDetails(class_id);

  if (!classData) {
    notFound();
  }

  // We pass an array of classes with just this one class, because the client component 
  // might still expect an array for the dropdown (although we'll lock it).
  const classes = [classData];

  return <PengajarKuisClient initialExams={exams} classes={classes} currentClassId={class_id} />;
}
