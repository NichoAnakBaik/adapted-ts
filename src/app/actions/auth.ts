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
  redirect("/login");
}
