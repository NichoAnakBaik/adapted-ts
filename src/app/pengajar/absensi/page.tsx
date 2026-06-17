import React from "react";
import PengajarAbsensiClient from "./PengajarAbsensiClient";
import { getClassesForTeacher } from "@/app/actions/absensi";

export default async function PengajarAbsensiPage() {
  const classes = await getClassesForTeacher();
  return <PengajarAbsensiClient classes={classes} />;
}
