import React from "react";
import ClassManagementClient from "./ClassManagementClient";
import { getClasses } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminClassPage() {
  const classes = await getClasses();
  
  // We need to pass the list of teachers so Admin can assign them to classes
  const teachers = await prisma.user.findMany({
    where: { role: "PENGAJAR" },
    select: { id: true, nama_lengkap: true }
  });

  const students = await prisma.user.findMany({
    where: { role: "SISWA" },
    select: { id: true, nama_lengkap: true }
  });

  return <ClassManagementClient initialClasses={classes} teachers={teachers} students={students} />;
}
