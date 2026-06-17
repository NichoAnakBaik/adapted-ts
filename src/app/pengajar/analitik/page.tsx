import React from "react";
import PengajarAnalitikClient from "./PengajarAnalitikClient";
import { getTeacherAnalytics } from "@/app/actions/pengajar";

export default async function PengajarAnalitikPage() {
  const analyticsData = await getTeacherAnalytics();
  return <PengajarAnalitikClient data={analyticsData} />;
}
