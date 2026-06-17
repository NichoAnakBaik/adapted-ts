import React from "react";
import AdminUjianClient from "./AdminUjianClient";
import { getAdminExams, getClasses } from "@/app/actions/admin";

export default async function AdminUjianPage() {
  const exams = await getAdminExams();
  const classes = await getClasses();

  return <AdminUjianClient initialExams={exams} classes={classes} />;
}
