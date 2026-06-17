import React from "react";
import SiswaAnalitikClient from "./SiswaAnalitikClient";
import { getStudentAnalytics } from "@/app/actions/siswa";

export default async function SiswaAnalitikPage() {
  const analytics = await getStudentAnalytics();
  return <SiswaAnalitikClient data={analytics} />;
}
