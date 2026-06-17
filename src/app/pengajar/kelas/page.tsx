import React from "react";
import PengajarKelasClient from "./PengajarKelasClient";
import { getTeacherClasses } from "@/app/actions/pengajar";

export default async function PengajarKelasPage() {
  const classes = await getTeacherClasses();
  return <PengajarKelasClient classes={classes} />;
}
