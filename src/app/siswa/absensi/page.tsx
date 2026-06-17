import React from "react";
import SiswaAbsensiClient from "./SiswaAbsensiClient";
import { getStudentAttendanceHistory, getStudentActiveClass } from "@/app/actions/absensi";

export default async function SiswaAbsensiPage() {
  const history = await getStudentAttendanceHistory();
  const activeClass = await getStudentActiveClass();

  return <SiswaAbsensiClient history={history} activeClass={activeClass} />;
}
