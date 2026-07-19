import React from "react";
import PengajarUjianIndexClient from "./PengajarUjianIndexClient";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PengajarUjianPage() {
  const session = await getSession();
  if (!session || session.user.role !== "PENGAJAR") redirect("/?login=true");

  const classes = await prisma.class.findMany({
    where: { teacher_id: session.user.id },
    include: {
      _count: { 
        select: { 
          enrollments: true, 
          exams: {
            where: { is_final: true }
          }
        } 
      }
    },
    orderBy: { created_at: 'desc' }
  });

  return <PengajarUjianIndexClient classes={classes} />;
}
