import React from "react";
import SiswaModulClient from "./SiswaModulClient";
import { getStudentModules } from "@/app/actions/siswa";

export default async function SiswaModulPage() {
  const modules = await getStudentModules();
  return <SiswaModulClient modules={modules} />;
}
