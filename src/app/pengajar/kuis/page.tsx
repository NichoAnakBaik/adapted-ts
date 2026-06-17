import React from "react";
import PengajarKuisClient from "./PengajarKuisClient";
import { getQuizzes, getTeacherClasses } from "@/app/actions/pengajar";

export default async function PengajarKuisPage() {
  const exams = await getQuizzes();
  const classes = await getTeacherClasses();

  return <PengajarKuisClient initialExams={exams} classes={classes} />;
}
