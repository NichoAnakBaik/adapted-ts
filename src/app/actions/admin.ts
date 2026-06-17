"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

// Basic authorization check
async function checkAdminAuth() {
  const session = await getSession();
  console.log("checkAdminAuth() -> session:", session);
  if (!session) {
    console.log("checkAdminAuth() -> No session, redirecting");
    redirect("/login");
  }
  if (session.user?.role !== "ADMIN") {
    console.log("checkAdminAuth() -> Role mismatch, redirecting. Expected ADMIN, got:", session.user?.role);
    redirect("/login");
  }
}

export async function getDashboardStats() {
  await checkAdminAuth();
  
  const [totalSiswa, totalPengajar, totalKelas] = await Promise.all([
    prisma.user.count({ where: { role: "SISWA" } }),
    prisma.user.count({ where: { role: "PENGAJAR" } }),
    prisma.class.count(),
  ]);

  return { totalSiswa, totalPengajar, totalKelas };
}

// --- USER MANAGEMENT ---

export async function getUsers() {
  await checkAdminAuth();
  return prisma.user.findMany({
    orderBy: { created_at: 'desc' }
  });
}

export async function deleteUser(id: string) {
  await checkAdminAuth();
  await prisma.user.delete({ where: { id } });
  return { success: true };
}
export async function adminCreateUser(formData: FormData) {
  await checkAdminAuth();
  const nama_lengkap = formData.get("nama_lengkap") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "ADMIN" | "PENGAJAR" | "SISWA";

  if (!nama_lengkap || !username || !password || !role) {
    return { error: "Semua kolom harus diisi" };
  }

  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) return { error: "Username sudah digunakan" };

  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.default.hash(password, 10);

  await prisma.user.create({
    data: { nama_lengkap, username, password: passwordHash, role },
  });

  return { success: true };
}
// --- CLASS MANAGEMENT ---

export async function getClasses() {
  await checkAdminAuth();
  return prisma.class.findMany({
    include: {
      teacher: { select: { nama_lengkap: true } },
      _count: { select: { enrollments: true } }
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function createClass(formData: FormData) {
  await checkAdminAuth();
  const name = formData.get("name") as string;
  const type = formData.get("type") as "ONLINE" | "OFFLINE";
  const schedule = formData.get("schedule") as string;
  const meeting_link = formData.get("meeting_link") as string;

  if (!name || !type) return { error: "Nama kelas dan tipe wajib diisi" };

  await prisma.class.create({
    data: { name, type, schedule, meeting_link: meeting_link || null }
  });
  return { success: true };
}

export async function deleteClass(id: string) {
  await checkAdminAuth();
  await prisma.class.delete({ where: { id } });
  return { success: true };
}

export async function assignTeacher(classId: string, teacherId: string | null) {
  await checkAdminAuth();
  await prisma.class.update({
    where: { id: classId },
    data: { teacher_id: teacherId }
  });
  return { success: true };
}

// --- ENROLLMENT MANAGEMENT ---

export async function enrollStudent(classId: string, studentId: string) {
  await checkAdminAuth();
  try {
    await prisma.enrollment.create({
      data: { class_id: classId, student_id: studentId }
    });
    return { success: true };
  } catch (e) {
    return { error: "Siswa sudah terdaftar di kelas ini" };
  }
}

export async function unenrollStudent(enrollmentId: string) {
  await checkAdminAuth();
  await prisma.enrollment.delete({ where: { id: enrollmentId } });
  return { success: true };
}
