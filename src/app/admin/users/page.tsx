import React from "react";
import UserManagementClient from "./UserManagementClient";
import { getUsers } from "@/app/actions/admin";

export default async function AdminUsersPage() {
  const users = await getUsers();

  return <UserManagementClient initialUsers={users} />;
}
