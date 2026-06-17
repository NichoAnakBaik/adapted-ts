import React from "react";
import PengajarUjianClient from "./PengajarUjianClient";
import { getFinalExams } from "@/app/actions/pengajar";

export default async function PengajarUjianPage() {
  const exams = await getFinalExams();
  return <PengajarUjianClient exams={exams} />;
}
