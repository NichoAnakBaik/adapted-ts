"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getUserNotifications() {
  const session = await getSession();
  if (!session) return { error: "Not authorized" };

  const notifications = await prisma.notification.findMany({
    where: { user_id: session.user.id },
    orderBy: { created_at: 'desc' },
    take: 50, // Get the latest 50 notifications
  });

  return { notifications };
}

export async function markNotificationAsRead(id: string) {
  const session = await getSession();
  if (!session) return { error: "Not authorized" };

  await prisma.notification.update({
    where: { id },
    data: { is_read: true },
  });

  return { success: true };
}

export async function createNotification(userId: string, title: string, message: string, link?: string) {
  await prisma.notification.create({
    data: {
      user_id: userId,
      title,
      message,
      link,
    },
  });
}

// Utility to notify multiple users at once (e.g. all students in a class)
export async function createNotificationsForUsers(userIds: string[], title: string, message: string, link?: string) {
  if (!userIds.length) return;
  
  const notifications = userIds.map(id => ({
    user_id: id,
    title,
    message,
    link,
  }));

  await prisma.notification.createMany({
    data: notifications,
  });
}
