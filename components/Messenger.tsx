import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Inbox, 
  Bell, 
  Rss, 
  ArrowLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  Search,
  MoreVertical,
  User as UserIcon,
  Send
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { User, ChatMessage } from '../types';

interface MessengerProps {
  user: Omit<User, 'password'>;
}

const Messenger: React.FC<MessengerProps> = ({ user }) => {
    const [view, setView] = useState<MessengerView>('menu');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const menuItems = [
      { id: 'inbox', name: 'Inbox', icon: Inbox, color: 'bg-blue-600', submenus: ['Direct Messages', 'Group Chat', 'Archived', 'Search'] },
      { id: 'alerts', name: 'Alerts', icon: Bell, color: 'bg-brand-red', submenus: ['Critical Fail', 'Warning Low', 'System Status', 'Mute All'] },
      { id: 'broadcasts', name: 'Broadcasts', icon: Rss, color: 'bg-emerald-500', submenus: ['New Directive', 'Shift Handover', 'Admin Logs', 'Pin Post'] },
    ];

    type MessengerView = 'menu' | 'inbox' | 'alerts' | 'broadcasts';

    useEffect(() => {
        if (view === 'menu') return;

        const collectionName = view === 'inbox' ? 'messages' : (view === 'alerts' ? 'alerts' : 'broadcasts');
        const q = query(
          collection(db, collectionName),
          orderBy('timestamp', 'asc'),
          limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedMessages: ChatMessage[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            fetchedMessages.push({
              id: doc.id,
              senderEmail: data.senderEmail,
              senderName: data.senderName,
              text: data.text,
              timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
            });
          });
          setMessages(fetchedMessages);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, collectionName);
        });

        return () => unsubscribe();
    }, [view]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const collectionName = view === 'inbox' ? 'messages' : (view === 'alerts' ? 'alerts' : 'broadcasts');
        const textToCapture = inputText;
        setInputText('');

        try {
          await addDoc(collection(db, collectionName), {
            senderEmail: user.email,
            senderName: user.username || user.name || user.email.split('@')[0],
            text: textToCapture,
            timestamp: serverTimestamp(),
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, collectionName);
        }
    };

    if (view !== 'menu') {
      const activeItem = menuItems.find(i => i.id === view)!;
      return (
        <div className="h-full bg-slate-950 flex flex-col overflow-hidden">
          <div className="p-8 flex items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-md shrink-0">
            <div className="flex items-center space-x-6">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setView('menu')} className="p-3 bg-white/5 rounded-full text-white border border-white/5">
                <ArrowLeft className="h-6 w-6" />
              </motion.button>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">{activeItem.name}</h2>
                <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Neural Communication Network</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
               <motion.button whileTap={{ scale: 0.9 }} className="p-3 bg-white/5 rounded-full text-white border border-white/5"><Search className="h-5 w-5" /></motion.button>
               <motion.button whileTap={{ scale: 0.9 }} className="p-3 bg-white/5 rounded-full text-white border border-white/5"><MoreVertical className="h-5 w-5" /></motion.button>
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md px-8 py-4 flex space-x-4 overflow-x-auto hide-scrollbar border-b border-white/5 shrink-0">
            {activeItem.submenus.map(sub => (
              <button key={sub} className="flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 text-slate-500 border border-white/5 hover:text-white transition-all">
                {sub}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
             <div ref={scrollRef} className="flex-1 p-8 space-y-4 overflow-y-auto no-scrollbar">
                {messages.length === 0 && (
                   <div className="text-center py-20 opacity-20">
                      <p className="text-[10px] font-black uppercase tracking-[0.5em]">Awaiting Uplink...</p>
                   </div>
                )}
                {messages.map((msg, i) => {
                  const isMe = msg.senderEmail === user.email;
                  return (
                    <motion.div 
                      key={msg.id} 
                      initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-start space-x-4 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}
                    >
                      <div className={`h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0 border border-white/5 ${isMe ? 'bg-brand-red/20' : ''}`}>
                        <UserIcon className={`h-6 w-6 ${isMe ? 'text-brand-red' : 'text-slate-600'}`} />
                      </div>
                      <div className={`max-w-[80%] p-6 rounded-[2rem] border ${isMe ? 'bg-brand-red text-white border-brand-red shadow-xl shadow-brand-red/20' : 'bg-white/5 text-slate-200 border-white/5'}`}>
                         <div className="flex items-center justify-between mb-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest">{msg.senderName || msg.senderEmail.split('@')[0]}</h4>
                            <span className="text-[8px] font-black opacity-40 ml-4">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                         <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                      </div>
                    </motion.div>
                  );
                })}
             </div>
             
             <div className="p-8 bg-slate-900/40 backdrop-blur-md border-t border-white/5 shrink-0 flex items-center space-x-4 pb-20 md:pb-8">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="INPUT NEURAL PACKET..."
                  className="flex-1 h-20 bg-white/5 rounded-[2rem] border border-white/5 px-10 text-white font-black uppercase tracking-widest placeholder:text-slate-700 outline-none focus:border-white/20 transition-all"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="h-20 w-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50"
                  id="send-message-btn"
                >
                   <Send className="h-8 w-8" />
                </button>
             </div>
          </div>
        </div>
      );
    }

    return (
        <div className="h-full bg-slate-950 flex flex-col p-8 pb-32 overflow-y-auto no-scrollbar">
            <div className="mb-12">
               <h2 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase tracking-tight">Shift <span className="text-emerald-500">Comm</span></h2>
               <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Encrypted Data Transmission Layer</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {menuItems.map(item => (
                    <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setView(item.id as MessengerView)}
                        className="group relative bg-white/5 border border-white/5 p-10 rounded-[3rem] flex flex-col items-start text-left hover:bg-white/10 transition-all shadow-2xl overflow-hidden"
                    >
                        <div className={`p-6 rounded-[2rem] ${item.color} mb-8 shadow-lg shadow-black/40 group-hover:scale-110 transition-transform`}>
                            <item.icon className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-4">{item.name}</h3>
                        
                        <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-auto group-hover:text-white transition-all">
                            <span>Access Channel</span>
                            <ArrowRight className="ml-3 h-4 w-4 transform group-hover:translate-x-2 transition-transform" />
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default Messenger;
