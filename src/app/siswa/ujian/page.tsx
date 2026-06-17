import React from "react";
import SiswaUjianClient from "./SiswaUjianClient";
import { getAvailableFinalExams } from "@/app/actions/siswa";

export default async function SiswaUjianPage() {
  const exams = await getAvailableFinalExams();
  return <SiswaUjianClient exams={exams} />;
}
