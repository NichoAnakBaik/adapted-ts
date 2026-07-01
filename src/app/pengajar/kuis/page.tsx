import React from "react";
import PengajarKuisIndexClient from "./PengajarKuisIndexClient";
import { getTeacherClasses } from "@/app/actions/pengajar";

export default async function PengajarKuisPage() {
  const classes = await getTeacherClasses();

  return <PengajarKuisIndexClient classes={classes} />;
}
