import React from "react";
import AdminUjianClient from "../../AdminUjianClient";
import { getAdminExams, getClasses } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminUjianKelasPage({ params }: { params: { class_id: string } }) {
  // Fetch all exams and filter by class
  const allExams = await getAdminExams();
  const classExams = allExams.filter(ex => ex.class_id === params.class_id);
  const classes = await getClasses();
  
  const classData = await prisma.class.findUnique({
    where: { id: params.class_id },
    select: { name: true }
  });

  return <AdminUjianClient initialExams={classExams} classes={classes} className={classData?.name} classId={params.class_id} />;
}
