import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getClassForum } from "@/app/actions/forum";
import ForumChatClient from "@/components/ForumChatClient";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

export default async function AdminClassForumPage({ params }: { params: Promise<{ class_id: string }> }) {
  const { class_id } = await params;
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const forumData = await getClassForum(class_id);
  if (!forumData) notFound();

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-4 flex-shrink-0 space-y-4">
        <Link href="/admin/forum" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-namsan-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Forum
        </Link>
        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-xl border border-yellow-100 text-sm font-bold text-center">
          Mode Pemantauan Admin (Akses Tulis Dinonaktifkan)
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ForumChatClient forumData={forumData} currentUserId={session.user.id} readOnly={true} />
      </div>
    </div>
  );
}
