"use client";

import React, { useState } from "react";
import { MessageCircle, Heart, Repeat2, Share, MoreHorizontal, User, Send, CheckCircle2 } from "lucide-react";
import { postMessage } from "@/app/actions/forum";

export default function ForumChatClient({ forumData, currentUserId, readOnly = false }: { forumData: any, currentUserId: string, readOnly?: boolean }) {
  const [messages, setMessages] = useState(forumData.messages || []);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleSend = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    const textToSend = parentId ? replyText : newMessage;
    if (!textToSend.trim() || isSending) return;

    setIsSending(true);
    if (parentId) {
      setReplyText("");
    } else {
      setNewMessage("");
    }

    // Optimistic Update
    const tempMsg = {
      id: "temp-" + Date.now(),
      message: textToSend,
      created_at: new Date().toISOString(),
      user_id: currentUserId,
      parent_id: parentId,
      user: { nama_lengkap: "Anda", username: "anda", role: "..." }
    };
    setMessages((prev: any) => [...prev, tempMsg]);

    const res = await postMessage(forumData.forum.id, textToSend, parentId || undefined);
    if (!res.success) {
      alert("Gagal mengirim pesan.");
    } else {
      window.location.reload();
    }
    setIsSending(false);
    setReplyingTo(null);
  };

  const renderTextWithMentions = (text: string) => {
    const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-blue-500 font-bold hover:underline cursor-pointer">{part}</span>;
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  const rootMessages = messages.filter((m: any) => !m.parent_id);

  const renderPost = (msg: any, isReply = false) => {
    const isMe = msg.user_id === currentUserId;
    const isPengajar = msg.user?.role === "PENGAJAR";
    const isUtama = !isReply;
    const replies = messages.filter((m: any) => m.parent_id === msg.id);

    return (
      <div key={msg.id} className={`flex gap-3 md:gap-4 p-4 md:p-5 ${isUtama ? 'border-b border-gray-100 hover:bg-gray-50/50 transition-colors' : 'mt-2 border-l-2 border-gray-200 ml-2 md:ml-4 pl-4 hover:bg-gray-50/50 rounded-r-xl'}`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${isPengajar ? 'bg-gradient-to-br from-purple-500 to-indigo-500' : 'bg-gradient-to-br from-blue-400 to-blue-600'}`}>
            {msg.user?.nama_lengkap?.charAt(0) || <User className="w-5 h-5" />}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 md:gap-2 mb-1 flex-wrap">
            <span className="font-bold text-gray-900 text-sm md:text-base hover:underline cursor-pointer truncate max-w-[150px] md:max-w-xs">{msg.user?.nama_lengkap}</span>
            {isPengajar && <span title="Terverifikasi (Pengajar)"><CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" /></span>}
            <span className="text-gray-500 text-xs md:text-sm truncate max-w-[100px] md:max-w-[150px]">@{msg.user?.username || 'user'}</span>
            <span className="text-gray-400 text-xs md:text-sm flex-shrink-0">·</span>
            <span className="text-gray-500 text-xs md:text-sm hover:underline cursor-pointer flex-shrink-0">
              {new Date(msg.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="text-gray-800 text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words mb-3">
            {renderTextWithMentions(msg.message)}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-6 md:gap-8 text-gray-500">
            <button 
              onClick={() => setReplyingTo(replyingTo === msg.id ? null : msg.id)}
              className="flex items-center gap-1.5 text-xs md:text-sm hover:text-blue-500 group transition-colors"
            >
              <div className="p-1.5 md:p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <span className={replies.length > 0 ? "font-medium" : ""}>{replies.length || ""}</span>
            </button>
            <button className="flex items-center gap-1.5 text-xs md:text-sm hover:text-green-500 group transition-colors">
              <div className="p-1.5 md:p-2 rounded-full group-hover:bg-green-50 transition-colors">
                <Repeat2 className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </button>
            <button className="flex items-center gap-1.5 text-xs md:text-sm hover:text-red-500 group transition-colors">
              <div className="p-1.5 md:p-2 rounded-full group-hover:bg-red-50 transition-colors">
                <Heart className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </button>
            <button className="flex items-center gap-1.5 text-xs md:text-sm hover:text-blue-500 group transition-colors">
              <div className="p-1.5 md:p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                <Share className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </button>
          </div>

          {/* Inline Reply Form */}
          {replyingTo === msg.id && !readOnly && (
            <form onSubmit={(e) => handleSend(e, msg.id)} className="mt-3 flex gap-2 md:gap-3 items-start animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-sm">
                <textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Balas @${msg.user?.username || 'user'}...`}
                  className="w-full p-3 md:p-4 outline-none text-sm md:text-base resize-none min-h-[80px]"
                  autoFocus
                />
                <div className="flex justify-between items-center px-2 pb-2">
                  <div className="text-xs text-blue-500 px-2 cursor-pointer font-medium hover:underline">
                    Gunakan @ untuk _mention_ teman
                  </div>
                  <button 
                    type="submit"
                    disabled={!replyText.trim() || isSending}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 text-white font-bold py-1.5 px-4 md:px-5 rounded-full transition-colors text-sm"
                  >
                    Balas
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Render Replies (Nested Threads) */}
          {replies.length > 0 && (
            <div className="mt-2">
              {replies.map((reply: any) => renderPost(reply, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <h2 className="font-bold text-lg md:text-xl text-gray-900">{forumData.forum.title}</h2>
        <MoreHorizontal className="w-5 h-5 text-gray-500 cursor-pointer" />
      </div>

      {/* Main Compose Box */}
      {!readOnly && (
        <div className="p-4 md:p-6 border-b-8 border-gray-100">
          <form onSubmit={(e) => handleSend(e, null)} className="flex gap-3 md:gap-4 items-start">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <textarea 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Apa yang sedang terjadi di kelas ini?"
                className="w-full text-base md:text-lg lg:text-xl outline-none resize-none min-h-[60px] md:min-h-[80px] bg-transparent text-gray-900 placeholder-gray-400"
              />
              <div className="border-t border-gray-100 pt-3 mt-2 flex justify-between items-center">
                <div className="text-xs md:text-sm text-blue-500 font-medium bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  Gunakan @ untuk _mention_
                </div>
                <button 
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 text-white font-bold py-2 md:py-2.5 px-6 md:px-8 rounded-full transition-colors shadow-sm text-sm md:text-base"
                >
                  {isSending ? "Memposting..." : "Posting"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Feed Area */}
      <div className="flex-1 overflow-y-auto">
        {rootMessages.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-lg font-bold mb-2">Belum ada diskusi</p>
            <p className="text-sm">Jadilah yang pertama untuk memulai percakapan di kelas ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rootMessages.map((msg: any) => renderPost(msg))}
          </div>
        )}
      </div>
    </div>
  );
}
