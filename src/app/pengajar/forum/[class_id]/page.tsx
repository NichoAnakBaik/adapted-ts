import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getClassForum } from "@/app/actions/forum";
import ForumChatClient from "@/components/ForumChatClient";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function PengajarClassForumPage({ params }: { params: Promise<{ class_id: string }> }) {
  const { class_id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  // Verify ownership
  const classData = await prisma.class.findUnique({
    where: { id: class_id }
  });

  if (classData?.teacher_id !== session.user.id) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-8 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center">
        Akses Ditolak. Anda bukan pengajar kelas ini.
      </div>
    );
  }

  const forumData = await getClassForum(class_id);
  if (!forumData) notFound();

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-4 flex-shrink-0 space-y-4">
        <Link href="/pengajar/forum" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-namsan-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali Pilih Kelas
        </Link>
      </div>
      <div className="flex-1 min-h-0">
        <ForumChatClient forumData={forumData} currentUserId={session.user.id} />
      </div>
    </div>
  );
}
