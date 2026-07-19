"use client";

import React, { useState } from "react";
import { MessageCircle, MoreHorizontal, User, Send, CheckCircle2, Trash2, Smile } from "lucide-react";
import { postMessage, deleteForumMessage, toggleForumReaction } from "@/app/actions/forum";

export default function ForumChatClient({ forumData, currentUserId, readOnly = false }: { forumData: any, currentUserId: string, readOnly?: boolean }) {
  const [messages, setMessages] = useState(forumData.messages || []);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedThreads, setExpandedThreads] = useState<string[]>([]);
  
  const [mentionState, setMentionState] = useState<{
    active: boolean;
    query: string;
    type: 'main' | 'reply';
    parentId?: string;
  } | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>, type: 'main' | 'reply', parentId?: string) => {
    const val = e.target.value;
    if (type === 'main') setNewMessage(val);
    else setReplyText(val);

    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);
    
    if (match) {
      setMentionState({ active: true, query: match[1], type, parentId });
    } else {
      setMentionState(null);
    }
  };

  const handleSelectMention = (username: string) => {
    if (!mentionState) return;
    const replacement = `@${username} `;
    
    if (mentionState.type === 'main') {
      const matchPos = newMessage.lastIndexOf(`@${mentionState.query}`);
      if (matchPos !== -1) {
        setNewMessage(newMessage.substring(0, matchPos) + replacement + newMessage.substring(matchPos + mentionState.query.length + 1));
      }
    } else {
      const matchPos = replyText.lastIndexOf(`@${mentionState.query}`);
      if (matchPos !== -1) {
        setReplyText(replyText.substring(0, matchPos) + replacement + replyText.substring(matchPos + mentionState.query.length + 1));
      }
    }
    setMentionState(null);
  };

  const filteredMembers = (forumData.members || []).filter((m: any) => 
    m.username.toLowerCase().includes(mentionState?.query.toLowerCase() || '') ||
    m.nama_lengkap.toLowerCase().includes(mentionState?.query.toLowerCase() || '')
  );


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

  const handleDelete = async (msgId: string) => {
    if (!confirm("Hapus pesan ini?")) return;
    const res = await deleteForumMessage(msgId);
    if (res.success) {
      // Optimistic delete
      setMessages((prev: any) => prev.filter((m: any) => m.id !== msgId && m.parent_id !== msgId));
    } else {
      alert(res.error || "Gagal menghapus pesan");
    }
  };

  const handleReaction = async (msgId: string, emoji: string) => {
    // Optimistic Update
    setMessages((prev: any) => prev.map((m: any) => {
      if (m.id === msgId) {
        let reactionsObj: Record<string, string[]> = {};
        if (m.reactions) {
          try { reactionsObj = JSON.parse(m.reactions); } catch (e) {}
        }
        if (!reactionsObj[emoji]) reactionsObj[emoji] = [];
        
        const idx = reactionsObj[emoji].indexOf(currentUserId);
        if (idx > -1) {
          reactionsObj[emoji].splice(idx, 1);
        } else {
          reactionsObj[emoji].push(currentUserId);
        }
        if (reactionsObj[emoji].length === 0) delete reactionsObj[emoji];
        return { ...m, reactions: JSON.stringify(reactionsObj) };
      }
      return m;
    }));

    await toggleForumReaction(msgId, emoji);
  };

  const EMOJI_LIST = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

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

    const isExpanded = expandedThreads.includes(msg.id);
    const toggleExpand = () => {
      setExpandedThreads(prev => isExpanded ? prev.filter(id => id !== msg.id) : [...prev, msg.id]);
    };

    let parsedReactions: Record<string, string[]> = {};
    if (msg.reactions) {
      try { parsedReactions = JSON.parse(msg.reactions); } catch(e) {}
    }

    return (
      <div key={msg.id} className={`flex gap-3 px-3 py-2.5 md:px-4 md:py-3 ${isUtama ? 'border-b border-gray-100 hover:bg-gray-50/50 transition-colors' : 'mt-1 border-l-2 border-gray-200 ml-3 pl-3 hover:bg-gray-50/50 rounded-r-xl'}`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-sm text-xs ${isPengajar ? 'bg-gradient-to-br from-purple-500 to-indigo-500' : 'bg-gradient-to-br from-blue-400 to-blue-600'}`}>
            {msg.user?.nama_lengkap?.charAt(0) || <User className="w-4 h-4" />}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="font-semibold text-gray-900 text-[13px] hover:underline cursor-pointer truncate max-w-[150px] md:max-w-xs">{msg.user?.nama_lengkap}</span>
            {isPengajar && <span title="Terverifikasi (Pengajar)"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" /></span>}
            <span className="text-gray-500 text-[11px] truncate max-w-[100px] md:max-w-[150px]">@{msg.user?.username || 'user'}</span>
            <span className="text-gray-400 text-xs flex-shrink-0">·</span>
            <span className="text-gray-500 text-[11px] hover:underline cursor-pointer flex-shrink-0">
              {new Date(msg.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="text-gray-800 text-[13px] leading-relaxed whitespace-pre-wrap break-words mb-1.5">
            {renderTextWithMentions(msg.message)}
          </div>

          {/* Render Reactions */}
          {Object.keys(parsedReactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {Object.entries(parsedReactions).map(([emoji, users]) => {
                const hasReacted = users.includes(currentUserId);
                return (
                  <button 
                    key={emoji}
                    onClick={() => handleReaction(msg.id, emoji)}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border transition-colors ${hasReacted ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                  >
                    <span className="text-[11px]">{emoji}</span>
                    <span className="font-medium text-[11px]">{users.length}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4 text-gray-500">
            <button 
              onClick={() => {
                setReplyingTo(replyingTo === msg.id ? null : msg.id);
                if (!expandedThreads.includes(msg.id)) {
                  setExpandedThreads(prev => [...prev, msg.id]);
                }
              }}
              className="flex items-center gap-1 text-xs hover:text-blue-500 group transition-colors"
            >
              <div className="p-1.5 rounded-full group-hover:bg-blue-50 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className={replies.length > 0 ? "font-medium" : ""}>{replies.length || ""}</span>
            </button>
            
            <div className="relative group/emoji">
              <button className="flex items-center gap-1 text-xs hover:text-yellow-500 transition-colors">
                <div className="p-1.5 rounded-full group-hover/emoji:bg-yellow-50 transition-colors">
                  <Smile className="w-4 h-4" />
                </div>
              </button>
              
              {/* WhatsApp Style Emoji Hover Menu */}
              <div className="absolute left-0 bottom-full mb-1 hidden group-hover/emoji:flex bg-white shadow-lg border border-gray-100 rounded-full px-2 py-1.5 gap-1 z-20 animate-in slide-in-from-bottom-2">
                {EMOJI_LIST.map(em => (
                  <button 
                    key={em} 
                    onClick={() => handleReaction(msg.id, em)}
                    className="hover:scale-125 transition-transform text-base p-1 leading-none"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {isMe && !readOnly && (
              <button 
                onClick={() => handleDelete(msg.id)}
                className="flex items-center gap-1 text-xs hover:text-red-500 group transition-colors ml-auto"
              >
                <div className="p-1.5 rounded-full group-hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </div>
              </button>
            )}
          </div>

          {/* Inline Reply Form */}
          {replyingTo === msg.id && !readOnly && (
            <form onSubmit={(e) => handleSend(e, msg.id)} className="mt-2 flex gap-2 items-start animate-in fade-in duration-200">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                <User className="w-3 h-3 md:w-4 md:h-4" />
              </div>
              <div className="flex-1 bg-white border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-sm">
                <div className="relative">
                  <textarea 
                    value={replyText}
                    onChange={(e) => handleTextChange(e, 'reply', msg.id)}
                    placeholder={`Balas @${msg.user?.username || 'user'}...`}
                    className="w-full p-2.5 outline-none text-sm resize-none min-h-[60px]"
                    autoFocus
                  />
                  {/* Mention Dropdown for Reply */}
                  {mentionState?.active && mentionState.type === 'reply' && mentionState.parentId === msg.id && filteredMembers.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-100 shadow-lg rounded-xl overflow-y-auto max-h-48 z-30 animate-in fade-in zoom-in-95">
                      {filteredMembers.map((member: any) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => handleSelectMention(member.username)}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left transition-colors border-b border-gray-50 last:border-0"
                        >
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                            {member.nama_lengkap.charAt(0)}
                          </div>
                          <div className="flex-1 truncate">
                            <div className="text-sm font-bold text-gray-900 truncate">{member.nama_lengkap}</div>
                            <div className="text-xs text-gray-500 truncate">@{member.username}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center px-2 pb-2">
                  <div className="text-[11px] text-gray-500 ml-1">
                    Gunakan @ untuk mention teman
                  </div>
                  <button 
                    type="submit"
                    disabled={!replyText.trim() || isSending}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 text-white font-bold py-1 px-4 rounded-full transition-colors text-xs"
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
              {!isExpanded ? (
                <button 
                  onClick={toggleExpand}
                  className="text-[13px] md:text-xs text-blue-600 font-bold hover:underline flex items-center gap-2 mt-2 py-2 px-3 bg-blue-50 rounded-xl md:bg-transparent md:p-0 md:rounded-none transition-colors"
                >
                  <MessageCircle className="w-4 h-4 md:w-3.5 md:h-3.5" />
                  Lihat {replies.length} balasan lainnya
                </button>
              ) : (
                <>
                  <button 
                    onClick={toggleExpand}
                    className="text-[13px] md:text-xs text-gray-500 font-bold hover:underline flex items-center gap-2 mt-2 mb-3 py-2 px-3 bg-gray-50 rounded-xl md:bg-transparent md:p-0 md:rounded-none transition-colors"
                  >
                    Sembunyikan balasan
                  </button>
                  {replies.map((reply: any) => renderPost(reply, true))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-5 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <h2 className="font-bold text-base text-gray-900">{forumData.forum.title}</h2>
        <MoreHorizontal className="w-4 h-4 text-gray-500 cursor-pointer" />
      </div>

      {/* Main Compose Box */}
      {!readOnly && (
        <div className="p-3 md:px-4 md:py-3 border-b border-gray-100 bg-gray-50/30">
          <form onSubmit={(e) => handleSend(e, null)} className="flex gap-3 items-start">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <div className="relative">
                <textarea 
                  value={newMessage}
                  onChange={(e) => handleTextChange(e, 'main')}
                  placeholder="Apa yang sedang terjadi di kelas ini?"
                  className="w-full text-[13px] outline-none resize-none min-h-[40px] bg-transparent text-gray-900 placeholder-gray-400 py-1"
                />
                {/* Mention Dropdown for Main Compose */}
                {mentionState?.active && mentionState.type === 'main' && filteredMembers.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 shadow-xl rounded-xl overflow-y-auto max-h-48 z-30 animate-in fade-in zoom-in-95">
                    {filteredMembers.map((member: any) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => handleSelectMention(member.username)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left transition-colors border-b border-gray-50 last:border-0"
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                          {member.nama_lengkap.charAt(0)}
                        </div>
                        <div className="flex-1 truncate">
                          <div className="text-sm font-bold text-gray-900 truncate">{member.nama_lengkap}</div>
                          <div className="text-xs text-gray-500 truncate">@{member.username}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200/50 pt-2 flex justify-between items-center mt-1">
                <div className="text-[11px] text-gray-500">
                  Gunakan @ untuk mention
                </div>
                <button 
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 text-white font-bold py-1.5 px-5 rounded-full transition-colors shadow-sm text-xs"
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
