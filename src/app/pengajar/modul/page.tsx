import React from "react";
import PengajarModulClient from "./PengajarModulClient";
import { getModules, getTeacherClasses } from "@/app/actions/pengajar";

export default async function PengajarModulPage() {
  const modules = await getModules();
  
  // Need classes for the dropdown when creating a new module
  const classes = await getTeacherClasses();

  return <PengajarModulClient initialModules={modules} classes={classes} />;
}
