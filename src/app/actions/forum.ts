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

export async function postMessage(forumId: string, message: string, parentId?: string) {
  const session = await getSession();
  if (!session || !message.trim()) return { error: "Pesan tidak valid" };

  const newMessage = await prisma.forumMessage.create({
    data: {
      forum_id: forumId,
      user_id: session.user.id,
      message: message.trim(),
      ...(parentId ? { parent: { connect: { id: parentId } } } : {}),
    },
    include: { 
      forum: { include: { class: { include: { enrollments: true } } } },
      user: true
    }
  });

  const { createNotificationsForUsers } = await import("./notification");
  
  // Base recipients: everyone in class except sender
  const studentIds = newMessage.forum.class.enrollments.map((e: any) => e.student_id);
  const teacherId = newMessage.forum.class.teacher_id;
  const allUserIds = [...studentIds];
  if (teacherId) allUserIds.push(teacherId);
  const recipients = allUserIds.filter(id => id !== session.user.id);
  
  const linkPath = session.user.role === "SISWA" 
      ? `/siswa/forum/${newMessage.forum.class_id}` 
      : session.user.role === "PENGAJAR"
        ? `/pengajar/forum/${newMessage.forum.class_id}`
        : `/admin/forum/${newMessage.forum.class_id}`;

  // Extract Mentions using regex
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const matches = [...message.matchAll(mentionRegex)];
  const mentionedUsernames = matches.map(m => m[1]);

  if (mentionedUsernames.length > 0) {
    const mentionedUsers = await prisma.user.findMany({
      where: { username: { in: mentionedUsernames } }
    });
    
    const mentionedUserIds = mentionedUsers.map(u => u.id).filter(id => id !== session.user.id);
    
    if (mentionedUserIds.length > 0) {
      await createNotificationsForUsers(
        mentionedUserIds,
        "Seseorang menyebut Anda",
        `${newMessage.user.nama_lengkap} menyebut Anda dalam sebuah kiriman di forum ${newMessage.forum.class.name}.`,
        linkPath
      );
      // Remove mentioned users from general recipients so they don't get double notification
      for (const id of mentionedUserIds) {
        const index = recipients.indexOf(id);
        if (index > -1) recipients.splice(index, 1);
      }
    }
  }

  // Send general notification
  if (recipients.length > 0 && !parentId) {
    await createNotificationsForUsers(
      recipients,
      "Pesan Forum Baru",
      `${newMessage.user.nama_lengkap} membuat kiriman baru di forum ${newMessage.forum.class.name}.`,
      linkPath
    );
  } else if (recipients.length > 0 && parentId) {
    // If it's a reply, maybe only notify the parent author + mentions?
    // For now, we just notify the parent author if they are in the class
    const parentMsg = await prisma.forumMessage.findUnique({ where: { id: parentId } });
    if (parentMsg && parentMsg.user_id !== session.user.id) {
      await createNotificationsForUsers(
        [parentMsg.user_id],
        "Balasan Baru",
        `${newMessage.user.nama_lengkap} membalas kiriman Anda di forum ${newMessage.forum.class.name}.`,
        linkPath
      );
    }
  }

  return { success: true };
}
