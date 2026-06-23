import React from "react";
import SiswaKelasClient from "./SiswaKelasClient";
import { getStudentClasses } from "@/app/actions/siswa";

export default async function SiswaKelasPage() {
  const classes = await getStudentClasses();
  return <SiswaKelasClient classes={classes} />;
}
