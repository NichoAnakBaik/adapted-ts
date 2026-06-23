import React from "react";
import AdminAbsensiClient from "./AdminAbsensiClient";
import { getAdminAllClasses } from "@/app/actions/absensi";

export default async function AdminAbsensiPage() {
  const classes = await getAdminAllClasses();
  return <AdminAbsensiClient classes={classes} />;
}
