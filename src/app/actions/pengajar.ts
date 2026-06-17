"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

// Basic authorization check for Pengajar
async function checkPengajarAuth() {
  const session = await getSession();
  if (!session || session.user?.role !== "PENGAJAR") {
    redirect("/login");
  }
  return session;
}

// --- CLASS VIEWS ---

export async function getTeacherClasses() {
  const session = await checkPengajarAuth();
  
  return prisma.class.findMany({
    where: { teacher_id: session.user.id },
    include: {
      _count: { select: { enrollments: true, modules: true } }
    },
    orderBy: { created_at: 'desc' }
  });
}

// --- MODULE MANAGEMENT ---

export async function getModules() {
  const session = await checkPengajarAuth();
  
  // Get modules only for classes taught by this teacher
  return prisma.module.findMany({
    where: {
      class: {
        teacher_id: session.user.id
      }
    },
    include: {
      class: { select: { name: true } }
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function createModule(formData: FormData) {
  const session = await checkPengajarAuth();
  
  const class_id = formData.get("class_id") as string;
  const title = formData.get("title") as string;
  const pdf_url = formData.get("pdf_url") as string;
  const audio_url = formData.get("audio_url") as string;

  if (!class_id || !title) return { error: "Kelas dan Judul wajib diisi" };

  // Verify the teacher owns this class
  const classData = await prisma.class.findFirst({
    where: { id: class_id, teacher_id: session.user.id }
  });

  if (!classData) return { error: "Akses ditolak atau kelas tidak ditemukan" };

  await prisma.module.create({
    data: {
      class_id,
      title,
      pdf_url: pdf_url || null,
      audio_url: audio_url || null
    }
  });

  return { success: true };
}

export async function deleteModule(id: string) {
  const session = await checkPengajarAuth();
  
  // Check ownership
  const moduleData = await prisma.module.findUnique({
    where: { id },
    include: { class: true }
  });

  if (moduleData?.class?.teacher_id !== session.user.id) {
    return { error: "Akses ditolak" };
  }

  await prisma.module.delete({ where: { id } });
  return { success: true };
}
