"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getClassForum(classId: string) {
  const session = await getSession();
  if (!session) return null;

  // Find or create the default forum for this class
  let forum = await prisma.forum.findFirst({
    where: { class_id: classId }
  });

  if (!forum) {
    forum = await prisma.forum.create({
      data: { class_id: classId, title: "General Discussion" }
    });
  }

  // Fetch messages with user details
  const messages = await prisma.forumMessage.findMany({
    where: { forum_id: forum.id },
    include: {
      user: { select: { nama_lengkap: true, role: true, username: true } }
    },
    orderBy: { created_at: 'asc' }
  });

  return { forum, messages };
}

export async function postMessage(forumId: string, message: string) {
  const session = await getSession();
  if (!session || !message.trim()) return { error: "Pesan tidak valid" };

  await prisma.forumMessage.create({
    data: {
      forum_id: forumId,
      user_id: session.user.id,
      message: message.trim()
    }
  });

  return { success: true };
}
