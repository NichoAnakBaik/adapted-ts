import React from "react";
import AdminKuisClient from "./AdminKuisClient";
import { getAdminQuizzes } from "@/app/actions/admin";

export default async function AdminKuisPage() {
  const quizzes = await getAdminQuizzes();
  return <AdminKuisClient initialQuizzes={quizzes} />;
}
