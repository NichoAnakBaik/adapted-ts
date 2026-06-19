import React from "react";
import PengajarModulGlobalClient from "./PengajarModulGlobalClient";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export default async function PengajarModulPage() {
  const session = await getSession();
  
  // Ambil semua modul yang terkait dengan kelas yang diajarkan pengajar ini
  const modules = await prisma.module.findMany({
    where: {
      class: {
        teacher_id: session?.user?.id
      }
    },
    include: {
      class: { select: { name: true } }
    },
    orderBy: { created_at: 'desc' }
  });

  return <PengajarModulGlobalClient modules={modules} />;
}
