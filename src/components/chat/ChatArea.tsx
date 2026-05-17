import React, { useState, useEffect, useRef } from 'react';
import { Hash, Image as ImageIcon, Loader2, Reply, Smile, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { db } from '../../firebase/config';
import { ref, onValue, push, serverTimestamp, query, orderByChild, limitToLast, set, remove } from 'firebase/database';
import { uploadToCloudinary } from '../../lib/cloudinary';

interface Message {
  id: string;
  text: string;
  imageUrl?: string;
  userId: string;
  userName: string;
  userPhoto: string;
  createdAt: number;
  nameColor?: string;
  vipTier?: string;
  replyTo?: {
    userName: string;
    text: string;
    id: string;
  };
}

export default function ChatArea() {
  const { activeChannelId, user } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [replyTo, setReplyTo] = useState<{ userName: string; text: string; id: string } | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!activeChannelId) return;

    const messagesRef = query(ref(db, `messages/${activeChannelId}`), orderByChild('createdAt'), limitToLast(50));
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).filter(m => m.createdAt).sort((a, b) => a.createdAt - b.createdAt);
        setMessages(messageList);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [activeChannelId]);

  // Typing indicator listener
  useEffect(() => {
    if (!activeChannelId) return;
    const typingRef = ref(db, `typing/${activeChannelId}`);
    
    const unsub = onValue(typingRef, (snap) => {
      const data = snap.val() || {};
      const users = Object.keys(data).filter(uid => uid !== user?.uid && Date.now() - data[uid] < 4000);
      setTypingUsers(users.map(uid => data[uid + '_name'] || 'Someone'));
    });
    
    return () => unsub();
  }, [activeChannelId, user?.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const updateTyping = (isTyping: boolean) => {
    if (!activeChannelId || !user) return;
    const typingRef = ref(db, `typing/${activeChannelId}/${user.uid}`);
    if (isTyping) {
      set(typingRef, Date.now());
      set(ref(db, `typing/${activeChannelId}/${user.uid}_name`), user.displayName);
    } else {
      remove(typingRef);
      remove(ref(db, `typing/${activeChannelId}/${user.uid}_name`));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeChannelId || isUploading) return;

    const text = newMessage;
    setNewMessage('');

    try {
      const { vipTier, nameColor } = useAppStore.getState().user || {};
      await push(ref(db, `messages/${activeChannelId}`), {
        text,
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        nameColor: nameColor || '#ffffff',
        vipTier: vipTier || 'free',
        replyTo: replyTo || null,
        createdAt: serverTimestamp(),
      });
      setReplyTo(null);
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !activeChannelId) return;

    if (useAppStore.getState().vipTier === 'free') {
      alert("Image sharing is only available for VIP members.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(file, 'image');
      await push(ref(db, `messages/${activeChannelId}`), {
        text: '',
        imageUrl,
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error uploading image", error);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#06080A] p-4 gap-3 relative min-w-0 h-full overflow-hidden">
      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 opacity-50 h-full">
            <Hash className="w-12 h-12 text-indigo-500 mb-2" />
            <p className="text-slate-400 text-sm">Start the conversation in #{activeChannelId}</p>
          </div>
        )}
        
        {messages.map((msg, idx) => {
          const showHeader = idx === 0 || messages[idx - 1].userId !== msg.userId || (msg.createdAt - messages[idx - 1].createdAt > 120000);
          const isMe = msg.userId === user?.uid;
          
          return (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={msg.id} 
              className={cn(
                "group relative px-2 py-1 rounded-lg transition-colors hover:bg-white/[0.02]",
                showHeader ? "mt-4" : "mt-0"
              )}
            >
              {msg.replyTo && (
                <div className="flex items-center gap-2 mb-1 pl-4 opacity-50 relative">
                  <div className="absolute left-1 top-2 bottom-0 w-3 border-l-2 border-t-2 border-white/10 rounded-tl-lg"></div>
                  <Reply className="w-2.5 h-2.5" />
                  <span className="text-[10px] font-bold text-slate-400">Replying to {msg.replyTo.userName}:</span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[200px] italic">"{msg.replyTo.text}"</span>
                </div>
              )}

              <div className="flex gap-3 items-start">
                {showHeader ? (
                   <div className="w-9 h-9 rounded-xl bg-slate-800 shrink-0 border border-white/5 overflow-hidden shadow-lg mt-0.5">
                      <img src={msg.userPhoto || ''} alt="avatar" className="w-full h-full object-cover" />
                   </div>
                ) : (
                   <div className="w-9 shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-mono text-slate-600">{new Date(msg.createdAt).getHours()}:{new Date(msg.createdAt).getMinutes().toString().padStart(2, '0')}</span>
                   </div>
                )}
                <div className="flex-1 min-w-0">
                   {showHeader && (
                      <div className="flex items-baseline gap-2 mb-0.5">
                         <span 
                           className="text-xs font-black tracking-tight" 
                           style={{ color: msg.nameColor || '#cbd5e1' }}
                         >
                           {msg.userName}
                         </span>
                         {msg.vipTier && msg.vipTier !== 'free' && (
                           <span className="text-[8px] font-black uppercase text-amber-400 bg-amber-400/10 px-1 rounded border border-amber-400/20 leading-none py-0.5">VIP</span>
                         )}
                         <span className="text-[9px] text-slate-500 font-medium">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                   )}
                   <div className="flex flex-col gap-1 items-start">
                      {msg.text && (
                        <p className={cn("text-xs leading-relaxed break-words", isMe ? 'text-white' : 'text-slate-300')}>{msg.text}</p>
                      )}
                      {msg.imageUrl && (
                        <div className="max-w-xs mt-1 rounded-xl overflow-hidden border border-white/10 shrink-0 shadow-2xl">
                          <img src={msg.imageUrl} alt="Uploaded content" className="w-full h-auto object-cover max-h-80" loading="lazy" />
                        </div>
                      )}
                   </div>
                </div>

                {/* Message Actions */}
                <div className="absolute top-1 right-2 hidden group-hover:flex items-center gap-1 bg-[#151921] border border-white/10 rounded-lg p-0.5 shadow-xl animate-in fade-in scale-in duration-100">
                    <button onClick={() => setReplyTo({ userName: msg.userName, text: msg.text || 'Image', id: msg.id })} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors cursor-pointer" title="Reply">
                       <Reply className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors cursor-pointer" title="Reactions">
                       <Smile className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors cursor-pointer">
                       <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                </div>
              </div>
            </motion.div>
          );
        })}
        {isUploading && (
          <div className="flex gap-3 items-center">
            <span className="w-20 shrink-0"></span>
            <div className="flex gap-2 items-center text-xs text-slate-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <Loader2 className="w-3 h-3 animate-spin text-indigo-400" /> Uploading image...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-4 py-2 bg-white/5 border-l-4 border-indigo-500 rounded-lg mx-2 flex justify-between items-center"
          >
             <div className="flex items-center gap-2">
                <Reply className="w-3 h-3 text-indigo-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Replying to {replyTo.userName}</span>
             </div>
             <button onClick={() => setReplyTo(null)} className="text-slate-500 hover:text-white">
                <Hash className="w-3 h-3 rotate-45" />
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 text-[10px] text-slate-400 italic">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Message Input Container (Bottom Bento) */}
      <div className="mt-auto flex gap-2 shrink-0">
        <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
          <div className="flex-1 bg-white/5 rounded-2xl flex items-center px-4 border border-white/10 group focus-within:border-indigo-500/50 focus-within:bg-white/10 transition-colors">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                updateTyping(true);
                if (typingTimeout.current) clearTimeout(typingTimeout.current);
                typingTimeout.current = setTimeout(() => updateTyping(false), 2000);
              }}
              onBlur={() => updateTyping(false)}
              placeholder={`Message #${activeChannelId}`}
              disabled={isUploading}
              className="bg-transparent text-xs text-white w-full py-3 outline-none placeholder-slate-500 disabled:opacity-50"
            />
            <div className="flex gap-2 text-slate-500 group-focus-within:text-slate-400 transition-colors">
              <button 
                type="button" 
                className="hover:text-indigo-400 transition-colors cursor-pointer disabled:opacity-50" 
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                title="Upload Image"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageUpload} 
              />
              <button type="button" className="hover:text-indigo-400 transition-colors cursor-pointer disabled:opacity-50" disabled={isUploading}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={!newMessage.trim() || isUploading}
            className="w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white disabled:opacity-50 disabled:bg-slate-800 transition-colors cursor-pointer hover:bg-indigo-500 active:scale-95 duration-200 shadow-lg shadow-indigo-600/20"
          >
            <svg className="w-5 h-5 -rotate-90 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
