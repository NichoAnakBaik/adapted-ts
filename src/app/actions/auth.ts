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

  // Mock checking for dev environment if DB is empty
  let role = "SISWA";
  let userId = "mock-id-123";

  // Temporary DEV bypass based on username prefix to test dashboards
  if (username.startsWith("admin")) role = "ADMIN";
  if (username.startsWith("pengajar")) role = "PENGAJAR";

  await setSession({ id: userId, role, username });

  if (role === "ADMIN") redirect("/admin/dashboard");
  if (role === "PENGAJAR") redirect("/pengajar/dashboard");
  redirect("/siswa/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
