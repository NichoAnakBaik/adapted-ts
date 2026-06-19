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

  const newMessage = await prisma.forumMessage.create({
    data: {
      forum_id: forumId,
      user_id: session.user.id,
      message: message.trim()
    },
    include: { 
      forum: { include: { class: { include: { enrollments: true } } } },
      user: true
    }
  });

  const { createNotificationsForUsers } = await import("./notification");
  const studentIds = newMessage.forum.class.enrollments.map(e => e.student_id);
  const teacherId = newMessage.forum.class.teacher_id;
  const allUserIds = [...studentIds];
  if (teacherId) allUserIds.push(teacherId);
  const recipients = allUserIds.filter(id => id !== session.user.id);
  
  if (recipients.length > 0) {
    const linkPath = session.user.role === "SISWA" 
      ? `/siswa/forum/${newMessage.forum.class_id}` 
      : session.user.role === "PENGAJAR"
        ? `/pengajar/forum/${newMessage.forum.class_id}`
        : `/admin/forum/${newMessage.forum.class_id}`;
        
    await createNotificationsForUsers(
      recipients,
      "Pesan Forum Baru",
      `${newMessage.user.nama_lengkap} baru saja memposting di forum ${newMessage.forum.class.name}.`,
      linkPath
    );
  }

  return { success: true };
}
