import React from "react";
import SiswaAbsensiClient from "./SiswaAbsensiClient";
import { getStudentAttendanceHistory, getStudentClasses } from "@/app/actions/absensi";

export default async function SiswaAbsensiPage() {
  const history = await getStudentAttendanceHistory();
  const classes = await getStudentClasses();

  return <SiswaAbsensiClient history={history} classes={classes} />;
}
