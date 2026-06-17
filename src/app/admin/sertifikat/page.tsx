import React from "react";
import AdminSertifikatClient from "./AdminSertifikatClient";
import { getCertificates } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminSertifikatPage() {
  const certificates = await getCertificates();
  
  const students = await prisma.user.findMany({
    where: { role: "SISWA" },
    select: { id: true, nama_lengkap: true, username: true },
    orderBy: { nama_lengkap: 'asc' }
  });

  const classes = await prisma.class.findMany({
    select: { id: true, name: true },
    orderBy: { created_at: 'desc' }
  });

  return <AdminSertifikatClient initialCertificates={certificates} students={students} classes={classes} />;
}
