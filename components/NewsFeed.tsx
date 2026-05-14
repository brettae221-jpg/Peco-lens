import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Megaphone, 
  MessageSquare, 
  Settings, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ThumbsUp, 
  Share2,
  MoreHorizontal,
  User as UserIcon,
  Activity,
  Award
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '../types';

interface FeedItem {
  id: string;
  type: string;
  userName: string;
  userEmail: string;
  textContent: string;
  timestamp: any;
  likes: string[];
  metadata?: any;
}

interface NewsFeedProps {
  user: User;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ user }) => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'news_feed'), 
      orderBy('timestamp', 'desc'), 
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feedData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FeedItem[];
      setItems(feedData);
    });

    return () => unsubscribe();
  }, []);

  const handlePost = async () => {
    if (!newPost.trim() || isPosting) return;
    setIsPosting(true);
    try {
      await addDoc(collection(db, 'news_feed'), {
        userId: user.id,
        userEmail: user.email,
        userName: user.name || user.username || 'Facility Member',
        type: 'announcement',
        textContent: newPost,
        timestamp: serverTimestamp(),
        likes: []
      });
      setNewPost('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsPosting(false);
    }
  };

  const getTimeLabel = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full bg-slate-950 flex flex-col overflow-hidden">
      <div className="p-8 border-b border-white/5 shrink-0 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Facility <span className="text-brand-red">Pulse</span></h2>
            <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Shared Intelligence Stream</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Network Online</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 pb-32">
        {/* Post Box */}
        <div className="bg-white/5 border border-white/5 rounded-[3rem] p-8 space-y-6 shadow-2xl">
          <div className="flex items-start space-x-4">
            <div className="h-12 w-12 rounded-2xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center shrink-0">
              <UserIcon className="h-6 w-6 text-brand-red" />
            </div>
            <textarea
              className="flex-1 bg-transparent border-none text-white text-lg font-medium placeholder:text-slate-800 outline-none resize-none min-h-[100px] py-2"
              placeholder={`Broadcast update, ${user.name || 'Engineer'}...`}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex space-x-2">
               <button className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"><MessageSquare className="h-5 w-5" /></button>
               <button className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"><Zap className="h-5 w-5" /></button>
            </div>
            <button
              onClick={handlePost}
              disabled={!newPost.trim() || isPosting}
              className="px-8 py-3 bg-brand-red rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all disabled:opacity-40"
            >
              {isPosting ? 'BROADCASTING...' : 'POST_BROADCAST'}
            </button>
          </div>
        </div>

        {/* Feed List */}
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/5 border border-white/5 rounded-[3rem] p-8 space-y-6 relative group overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border border-white/10 ${
                    item.type === 'alert' ? 'bg-brand-red/10 text-brand-red shadow-[0_0_20px_rgba(225,29,72,0.2)]' : 
                    item.type === 'achievement' ? 'bg-emerald-500/10 text-emerald-500' :
                    'bg-slate-900 text-slate-500'
                  }`}>
                    {item.type === 'alert' ? <AlertTriangle className="h-7 w-7" /> : 
                     item.type === 'achievement' ? <Award className="h-7 w-7" /> :
                     item.type === 'repair' ? <Activity className="h-7 w-7" /> :
                     <Megaphone className="h-7 w-7" />}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white uppercase tracking-tight leading-tight">{item.userName || 'Facility Member'}</h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-[10px] font-black text-brand-red uppercase tracking-widest">{item.type}</span>
                      <span className="h-1 w-1 bg-slate-800 rounded-full" />
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{getTimeLabel(item.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <button className="p-3 bg-white/5 rounded-xl text-slate-700 opacity-0 group-hover:opacity-100 transition-all">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              <div className="pl-18">
                <p className="text-slate-300 text-lg font-medium leading-relaxed italic">
                  "{item.textContent}"
                </p>
                
                {item.metadata?.courseTitle && (
                  <div className="mt-4 flex items-center space-x-3">
                    <span className="px-4 py-1.5 bg-slate-900 border border-white/10 rounded-full text-[9px] font-black text-brand-red uppercase tracking-widest">
                       COURSE: {item.metadata.courseTitle}
                    </span>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center space-x-8">
                  <button 
                    onClick={async () => {
                      const newLikes = item.likes?.includes(user.id) 
                        ? item.likes.filter(id => id !== user.id)
                        : [...(item.likes || []), user.id];
                      await updateDoc(doc(db, 'news_feed', item.id), { likes: newLikes });
                    }}
                    className={`flex items-center space-x-2 transition-colors ${item.likes?.includes(user.id) ? 'text-emerald-500' : 'text-slate-600 hover:text-emerald-500'}`}
                  >
                    <ThumbsUp className={`h-5 w-5 ${item.likes?.includes(user.id) ? 'fill-emerald-500' : ''}`} />
                    <span className="text-[10px] font-black">{item.likes?.length || 0}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-slate-600 hover:text-brand-red transition-colors">
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-[10px] font-black underline uppercase tracking-tighter">Neural Link</span>
                  </button>
                  <button className="flex items-center space-x-2 text-slate-600 hover:text-blue-500 transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {item.type === 'alert' && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 blur-[50px] -z-10" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && (
          <div className="text-center py-32 opacity-20">
            <Activity className="h-20 w-20 mx-auto mb-6 animate-pulse" />
            <p className="font-black uppercase tracking-[0.5em] text-[12px]">No Neural Activity in the Pulse Stream</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
