import React from "react";
import SiswaKuisClient from "./SiswaKuisClient";
import { getAvailableExams } from "@/app/actions/siswa";

export default async function SiswaKuisPage() {
  const exams = await getAvailableExams();
  return <SiswaKuisClient exams={exams} />;
}
