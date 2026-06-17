"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthenticated" };

  const id = session.user.id;
  const nama_lengkap = formData.get("nama_lengkap") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!nama_lengkap || !username) {
    return { error: "Nama Lengkap dan Username wajib diisi" };
  }

  // Check if username is taken by someone else
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser && existingUser.id !== id) {
    return { error: "Username sudah digunakan oleh orang lain" };
  }

  const updateData: any = { nama_lengkap, username };

  if (password) {
    if (password.length < 6) return { error: "Password minimal 6 karakter" };
    updateData.password = await bcrypt.hash(password, 10);
  }

  await prisma.user.update({
    where: { id },
    data: updateData
  });

  return { success: true };
}

export async function getUserProfile() {
  const session = await getSession();
  if (!session) return null;

  return await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { nama_lengkap: true, username: true }
  });
}
