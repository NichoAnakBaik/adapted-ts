import React from "react";
export const dynamic = 'force-dynamic';
import PengajarAnalitikClient from "./PengajarAnalitikClient";
import { getTeacherAnalytics } from "@/app/actions/pengajar";

export default async function PengajarAnalitikPage() {
  const analyticsData = await getTeacherAnalytics();
  return <PengajarAnalitikClient data={analyticsData} />;
}
