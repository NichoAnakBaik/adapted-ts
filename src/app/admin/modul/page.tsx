import React from "react";
import AdminModulClient from "./AdminModulClient";
import { getAdminModules, getClasses } from "@/app/actions/admin";

export default async function AdminModulPage() {
  const modules = await getAdminModules();
  const classes = await getClasses();

  return <AdminModulClient initialModules={modules} classes={classes} />;
}
