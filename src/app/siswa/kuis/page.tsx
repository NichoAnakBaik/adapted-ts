import React from "react";
import SiswaKuisClient from "./SiswaKuisClient";
import { getAvailableQuizzes } from "@/app/actions/siswa";

export default async function SiswaKuisPage() {
  const exams = await getAvailableQuizzes();
  return <SiswaKuisClient exams={exams} />;
}
