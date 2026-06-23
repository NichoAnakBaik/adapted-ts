import React from "react";
import SiswaAbsensiClient from "./SiswaAbsensiClient";
import { getStudentClasses } from "@/app/actions/absensi";

export default async function SiswaAbsensiPage() {
  const classes = await getStudentClasses();
  return <SiswaAbsensiClient classes={classes} />;
}
