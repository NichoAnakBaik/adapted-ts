import React from "react";
import PengajarKuisClient from "./PengajarKuisClient";
import { getExams, getTeacherClasses } from "@/app/actions/pengajar";

export default async function PengajarKuisPage() {
  const exams = await getExams();
  const classes = await getTeacherClasses();

  return <PengajarKuisClient initialExams={exams} classes={classes} />;
}
