"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, User } from "lucide-react";
import { postMessage } from "@/app/actions/forum";
import { KoreanInput } from "./KoreanInput";

export default function ForumChatClient({ forumData, currentUserId, readOnly = false }: { forumData: any, currentUserId: string, readOnly?: boolean }) {
  const [messages, setMessages] = useState(forumData.messages || []);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const textToSend = newMessage;
    setNewMessage("");

    // Optimistic UI update
    const tempMsg = {
      id: "temp-" + Date.now(),
      message: textToSend,
      created_at: new Date().toISOString(),
      user_id: currentUserId,
      user: { nama_lengkap: "Anda", role: "..." }
    };
    setMessages((prev: any) => [...prev, tempMsg]);

    const res = await postMessage(forumData.forum.id, textToSend);
    if (!res.success) {
      alert("Gagal mengirim pesan.");
    } else {
      // Ideally we would re-fetch to get the real ID, but a page reload or full refresh works too
      window.location.reload();
    }
    setIsSending(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <User className="w-6 h-6 text-namsan-blue" />
        </div>
        <div>
          <h2 className="font-bold text-namsan-text">{forumData.forum.title}</h2>
          <p className="text-xs text-gray-500">Ruang Diskusi Kelas</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={scrollRef}>
        {messages.map((msg: any) => {
          const isMe = msg.user_id === currentUserId;
          const isPengajar = msg.user?.role === "PENGAJAR";

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {!isMe && (
                <span className="text-xs text-gray-400 mb-1 ml-1 flex items-center gap-1">
                  {msg.user?.nama_lengkap} 
                  {isPengajar && <span className="bg-purple-100 text-purple-700 px-1.5 rounded-[4px] text-[10px] font-bold">PENGAJAR</span>}
                </span>
              )}
              <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] ${
                isMe ? 'bg-namsan-primary text-namsan-dark rounded-br-none' : 
                isPengajar ? 'bg-purple-50 text-purple-900 border border-purple-100 rounded-bl-none' : 
                'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</p>
              </div>
              <span className="text-[10px] text-gray-400 mt-1">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <User className="w-12 h-12 mb-2 opacity-20" />
            <p>Belum ada diskusi. Jadilah yang pertama menyapa!</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      {!readOnly && (
        <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
          <form onSubmit={handleSend} className="flex gap-2">
            <KoreanInput 
              type="text" 
              value={newMessage}
              onValueChange={(val) => setNewMessage(val)}
              placeholder="Tulis pesan..." 
              className="flex-1 p-3 rounded-xl border border-gray-200 outline-none focus:border-namsan-primary transition-colors text-sm"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="bg-namsan-text hover:bg-namsan-text/90 disabled:opacity-50 text-white p-3 rounded-xl transition-colors flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
