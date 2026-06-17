import React from "react";
import SiswaSertifikatClient from "./SiswaSertifikatClient";
import { getStudentCertificates } from "@/app/actions/siswa";

export default async function SiswaSertifikatPage() {
  const certificates = await getStudentCertificates();
  return <SiswaSertifikatClient certificates={certificates} />;
}
