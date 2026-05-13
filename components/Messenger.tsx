import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Inbox, 
  ArrowLeft,
  Search,
  MoreVertical,
  User as UserIcon,
  Send,
  Plus,
  MessageCircle,
  MessageSquare,
  Users
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  getDocs,
  serverTimestamp, 
  where,
  Timestamp,
  doc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { User, ChatMessage, DirectMessage } from '../types';

interface MessengerProps {
  user: Omit<User, 'password'>;
}

const Messenger: React.FC<MessengerProps> = ({ user }) => {
    const [view, setView] = useState<'threads' | 'chat' | 'userSelect'>('threads');
    const [threads, setThreads] = useState<DirectMessage[]>([]);
    const [selectedThread, setSelectedThread] = useState<DirectMessage | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [inputText, setInputText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch Threads
    useEffect(() => {
        const q = query(
          collection(db, 'threads'),
          where('participants', 'array-contains', user.email),
          orderBy('lastTimestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedThreads: DirectMessage[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as DirectMessage));
          setThreads(fetchedThreads);
        });

        return () => unsubscribe();
    }, [user.email]);

    // Fetch Messages for selected thread
    useEffect(() => {
        if (!selectedThread) return;

        const q = query(
          collection(db, 'threads', selectedThread.id, 'messages'),
          orderBy('timestamp', 'asc'),
          limit(100)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedMessages: ChatMessage[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp instanceof Timestamp ? doc.data().timestamp.toDate() : new Date(),
          } as ChatMessage));
          setMessages(fetchedMessages);
        });

        return () => unsubscribe();
    }, [selectedThread]);

    // Fetch All Users for selection
    const fetchUsers = async () => {
        const snap = await getDocs(collection(db, 'users'));
        const users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setAllUsers(users.filter(u => u.email !== user.email));
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputText.trim() || !selectedThread) return;

        const textToCapture = inputText;
        setInputText('');

        try {
          const msgRef = collection(db, 'threads', selectedThread.id, 'messages');
          await addDoc(msgRef, {
            senderEmail: user.email,
            senderName: user.name || user.email.split('@')[0],
            text: textToCapture,
            timestamp: serverTimestamp(),
          });

          await updateDoc(doc(db, 'threads', selectedThread.id), {
            lastMessage: textToCapture,
            lastTimestamp: serverTimestamp()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'threads');
        }
    };

    const startChat = async (targetUser: User) => {
        // Find if thread already exists
        const existing = threads.find(t => t.participants.includes(targetUser.email));
        if (existing) {
            setSelectedThread(existing);
            setView('chat');
            return;
        }

        // Create new thread
        try {
            const threadRef = await addDoc(collection(db, 'threads'), {
                participants: [user.email, targetUser.email],
                lastMessage: 'Started a new conversation',
                lastTimestamp: serverTimestamp(),
                createdAt: serverTimestamp()
            });
            setSelectedThread({
                id: threadRef.id,
                participants: [user.email, targetUser.email],
                lastMessage: 'Started a new conversation'
            });
            setView('chat');
        } catch (e) {
            console.error(e);
        }
    };

    if (view === 'userSelect') {
        return (
            <div className="h-full bg-slate-950 flex flex-col p-8 pb-32">
                <div className="flex items-center space-x-4 mb-8">
                    <button onClick={() => setView('threads')} className="p-3 bg-white/5 rounded-full text-white">
                        <ArrowLeft />
                    </button>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">New Message</h2>
                </div>
                <div className="space-y-4">
                    {allUsers.map(u => (
                        <button 
                            key={u.id}
                            onClick={() => startChat(u)}
                            className="w-full flex items-center space-x-4 p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all"
                        >
                            <div className="h-12 w-12 rounded-2xl bg-brand-red/20 flex items-center justify-center font-black text-brand-red">
                                {u.name?.[0].toUpperCase() || u.email[0].toUpperCase()}
                            </div>
                            <div className="text-left">
                                <p className="text-white font-black">{u.name || u.email.split('@')[0]}</p>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{u.appPosition || 'Technician'}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (view === 'chat' && selectedThread) {
        const otherParticipant = selectedThread.participants.find(p => p !== user.email);
        return (
            <div className="h-full bg-slate-950 flex flex-col overflow-hidden">
                <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-md shrink-0">
                    <div className="flex items-center space-x-6">
                        <button onClick={() => setView('threads')} className="p-3 bg-white/5 rounded-full text-white">
                            <ArrowLeft />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-2xl bg-brand-red flex items-center justify-center font-black text-white">
                                {otherParticipant?.[0].toUpperCase() || '?'}
                            </div>
                            <div>
                                <h3 className="text-white font-black uppercase text-lg leading-none">{otherParticipant?.split('@')[0]}</h3>
                                <div className="flex items-center space-x-1.5 mt-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none">Active Link</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="p-3 bg-white/5 rounded-full text-slate-400">
                        <MoreVertical />
                    </button>
                </div>

                <div ref={scrollRef} className="flex-1 p-8 space-y-4 overflow-y-auto no-scrollbar">
                    {messages.map((msg) => {
                        const isMe = msg.senderEmail === user.email;
                        return (
                            <motion.div 
                                key={msg.id} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[75%] p-5 rounded-[2rem] ${isMe ? 'bg-brand-red text-white' : 'bg-white/5 text-slate-200'} shadow-lg`}>
                                    <p className="text-sm font-medium">{msg.text}</p>
                                    <p className={`text-[8px] font-black uppercase tracking-widest mt-2 ${isMe ? 'text-white/60' : 'text-slate-600'}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="p-8 bg-slate-950 border-t border-white/5 flex items-center space-x-4 pb-20 md:pb-12">
                    <input 
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 h-16 bg-white/5 rounded-3xl px-8 text-white font-black outline-none border border-white/5 focus:border-brand-red/30"
                    />
                    <button 
                        onClick={handleSendMessage}
                        className="h-16 w-16 bg-brand-red rounded-3xl flex items-center justify-center text-white"
                    >
                        <Send />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-slate-950 flex flex-col p-8 pb-32 overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-12 shrink-0">
                <div>
                   <h2 className="text-5xl font-black text-white tracking-tighter uppercase">Messages</h2>
                   <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-1">Neural Messaging Protocol</p>
                </div>
                <button 
                    onClick={() => { fetchUsers(); setView('userSelect'); }}
                    className="p-4 bg-brand-red text-white rounded-3xl shadow-xl shadow-brand-red/30 active:scale-95 transition-transform"
                >
                    <Plus className="h-6 w-6" />
                </button>
            </div>

            <div className="relative mb-8">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                <input 
                    type="text" 
                    placeholder="Search neural frequencies..."
                    className="w-full h-16 bg-white/5 border border-white/5 rounded-3xl pl-16 pr-8 text-white font-bold placeholder:text-slate-700 outline-none focus:bg-white/10 transition-all"
                />
            </div>

            <div className="space-y-4">
                {threads.length === 0 && (
                    <div className="text-center py-24 opacity-20">
                        <MessageSquare className="h-16 w-16 mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em]">No Active Threads</p>
                    </div>
                )}
                {threads.map(thread => {
                    const otherUser = thread.participants.find(p => p !== user.email);
                    return (
                        <motion.button
                            key={thread.id}
                            onClick={() => { setSelectedThread(thread); setView('chat'); }}
                            className="w-full p-6 bg-white/5 border border-white/5 rounded-[2.5rem] flex items-center space-x-4 hover:bg-white/10 transition-all text-left"
                        >
                            <div className="h-16 w-16 rounded-[1.5rem] bg-brand-red flex items-center justify-center shrink-0">
                                <UserIcon className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-lg font-black text-white truncate uppercase tracking-tight">{otherUser?.split('@')[0]}</h4>
                                    <span className="text-[8px] font-black text-slate-600">
                                        {thread.lastTimestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-slate-500 font-bold text-sm truncate uppercase tracking-wide">
                                    {thread.lastMessage}
                                </p>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default Messenger;
