"use server";

import { prisma } from "@/lib/prisma";
import { setSession, clearSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  // Find user in DB
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return { error: "Username tidak ditemukan" };
  }

  // Validate password
  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    return { error: "Password salah" };
  }

  // Set session
  await setSession({ id: user.id, role: user.role, username: user.username });

  // Return redirect url
  if (user.role === "ADMIN") return { redirectUrl: "/admin/dashboard" };
  if (user.role === "PENGAJAR") return { redirectUrl: "/pengajar/dashboard" };
  return { redirectUrl: "/siswa/dashboard" };
}

export async function logoutAction() {
  await clearSession();
  redirect("/?login=true");
}

export async function signupAction(formData: FormData) {
  const nama_lengkap = formData.get("nama_lengkap") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "ADMIN" | "PENGAJAR" | "SISWA";

  if (!nama_lengkap || !username || !password || !role) {
    return { error: "Semua kolom harus diisi" };
  }

  // Check if username already exists
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    return { error: "Username sudah digunakan" };
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const newUser = await prisma.user.create({
    data: {
      nama_lengkap,
      username,
      password: passwordHash,
      role,
    },
  });

  // Automatically log them in by setting session
  await setSession({ id: newUser.id, role: newUser.role, username: newUser.username });

  let redirectUrl = "/siswa/dashboard";
  if (newUser.role === "ADMIN") redirectUrl = "/admin/dashboard";
  if (newUser.role === "PENGAJAR") redirectUrl = "/pengajar/dashboard";

  return { success: true, redirectUrl };
}
