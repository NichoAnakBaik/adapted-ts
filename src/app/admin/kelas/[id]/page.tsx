import React from "react";
import ClassDetailClient from "./ClassDetailClient";
import { getClassDetails } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function AdminClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const classData = await getClassDetails(id);
  
  if (!classData) {
    notFound();
  }

  // We need to pass the list of teachers so Admin can assign them to classes
  const teachers = await prisma.user.findMany({
    where: { role: "PENGAJAR" },
    select: { id: true, nama_lengkap: true, username: true }
  });

  const students = await prisma.user.findMany({
    where: { role: "SISWA" },
    select: { id: true, nama_lengkap: true, username: true },
    orderBy: { nama_lengkap: 'asc' }
  });

  return <ClassDetailClient classData={classData} teachers={teachers} allStudents={students} />;
}
