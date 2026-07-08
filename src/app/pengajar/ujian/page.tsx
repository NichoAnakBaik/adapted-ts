import React from "react";
import PengajarUjianIndexClient from "./PengajarUjianIndexClient";
import { getTeacherClasses } from "@/app/actions/pengajar";

export default async function PengajarUjianPage() {
  const classes = await getTeacherClasses();

  return <PengajarUjianIndexClient classes={classes} />;
}
