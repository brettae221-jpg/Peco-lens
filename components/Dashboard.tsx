import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Share2, 
  MessageCircle, 
  User as UserIcon,
  CheckCircle2,
  Trophy,
  Zap,
  Wrench,
  LogIn,
  MoreHorizontal,
  PlusCircle,
  LucideIcon
} from 'lucide-react';
import { AppMode, User, NewsPost } from '../types';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit, addDoc, serverTimestamp } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

interface DashboardProps {
  user: User;
  onNavigate: (mode: AppMode) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [statusText, setStatusText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'news_feed'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as NewsPost));
      setPosts(newPosts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'news_feed');
    });
    return () => unsubscribe();
  }, []);

  const handlePostStatus = async () => {
    if (!statusText.trim()) return;
    try {
      setIsPosting(true);
      await addDoc(collection(db, 'news_feed'), {
        userId: user.id || 'unknown',
        userEmail: user.email,
        userName: user.name || user.username || 'Collaborator',
        type: 'status_update',
        textContent: statusText,
        timestamp: serverTimestamp(),
        likes: []
      });
      setStatusText('');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'news_feed');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string, currentLikes: string[] = []) => {
    try {
      const { updateDoc, doc: fireDoc } = await import('firebase/firestore');
      const postRef = fireDoc(db, 'news_feed', postId);
      const isLiked = currentLikes?.includes(user.id);
      const newLikes = isLiked 
        ? currentLikes.filter(id => id !== user.id)
        : [...(currentLikes || []), user.id];
      
      await updateDoc(postRef, {
        likes: newLikes
      });
    } catch (e) {
      console.error("Failed to toggle like", e);
    }
  };

  const getIconForType = (type: NewsPost['type']): LucideIcon => {
    switch (type) {
      case 'training_complete': return CheckCircle2;
      case 'test_complete': return Trophy;
      case 'ai_chat_shared': return Zap;
      case 'pm_logged': return Wrench;
      case 'new_login': return LogIn;
      case 'status_update': return MessageCircle;
      case 'feature_update': return PlusCircle;
      default: return MessageCircle;
    }
  };

  const getColorForType = (type: NewsPost['type']) => {
    switch (type) {
      case 'training_complete': return 'text-emerald-500';
      case 'test_complete': return 'text-amber-500';
      case 'ai_chat_shared': return 'text-indigo-500';
      case 'pm_logged': return 'text-brand-red';
      case 'new_login': return 'text-blue-500';
      case 'status_update': return 'text-slate-400';
      case 'feature_update': return 'text-purple-500';
      default: return 'text-slate-400';
    }
  };

  const stories = [
    { name: 'Your Connect', online: true, color: 'bg-brand-red' },
    { name: 'Facility A', online: true, color: 'bg-emerald-500' },
    { name: 'Shift B', online: false, color: 'bg-blue-500' },
    { name: 'AI Node', online: true, color: 'bg-indigo-500' },
    { name: 'Maintenance', online: true, color: 'bg-orange-500' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-y-auto hide-scrollbar pb-32">
      {/* Feed Header */}
      <div className="px-8 pt-12 pb-8 sticky top-0 bg-slate-950/80 backdrop-blur-xl z-20 border-b border-white/5 flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-1">
            Global <span className="text-brand-red">Feed</span>
          </h2>
          <div className="flex items-center space-x-4">
            <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest flex items-center">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
              Synchronized Neural Activity
            </p>
            <button 
              onClick={() => onNavigate(AppMode.NewsFeed)}
              className="px-4 py-1.5 bg-brand-red/10 border border-brand-red/20 rounded-full text-[8px] font-black text-brand-red uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all shadow-lg"
            >
              Full Broadcasts
            </button>
          </div>
        </div>
        <div className="flex -space-x-2">
            {[1,2,3].map(i => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">
                    {String.fromCharCode(64+i)}
                </div>
            ))}
            <div className="h-8 w-8 rounded-full border-2 border-slate-950 bg-brand-red flex items-center justify-center text-[10px] font-black text-white">
                +8
            </div>
        </div>
      </div>

      <div className="px-6 space-y-8 max-w-2xl mx-auto w-full pt-8">
        
        {/* Stories Section (FB Style) */}
        <div className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar">
            {stories.map((story, i) => (
                <div key={i} className="shrink-0 flex flex-col items-center space-y-2">
                    <div className={`h-20 w-20 rounded-[2rem] p-1 border-2 ${story.online ? 'border-brand-red' : 'border-slate-800'}`}>
                        <div className={`h-full w-full rounded-[1.7rem] ${story.color} flex items-center justify-center text-white font-black text-xl shadow-inner`}>
                            {story.name[0]}
                        </div>
                    </div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{story.name}</span>
                </div>
            ))}
        </div>

        {/* Post Box */}
        <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
           <div className="flex items-start space-x-4">
              <div className="h-10 w-10 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-slate-400 border border-white/5">
                 {user.name?.[0].toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <div className="flex-1">
                 <textarea 
                   value={statusText}
                   onChange={(e) => setStatusText(e.target.value)}
                   placeholder={`What's on your mind, ${user.name || 'Technician'}?`}
                   className="w-full bg-transparent border-none text-white font-black text-lg placeholder:text-slate-700 resize-none focus:outline-none min-h-[100px] py-1"
                 />
              </div>
           </div>
           <div className="flex items-center justify-between mt-4 pt-6 border-t border-white/5">
              <div className="flex space-x-4">
                 <button className="p-2 text-slate-500 hover:text-white transition-colors">
                    <Share2 className="h-5 w-5" />
                 </button>
              </div>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handlePostStatus}
                disabled={!statusText.trim()}
                className="bg-brand-red text-white font-black text-[10px] uppercase tracking-widest px-8 py-3 rounded-full shadow-lg shadow-brand-red/20 disabled:opacity-30 disabled:grayscale"
              >
                 Broadcast
              </motion.button>
           </div>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          <AnimatePresence>
            {posts.map((post, idx) => {
              const Icon = getIconForType(post.type);
              const colorClass = getColorForType(post.type);
              
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-white/10 transition-all duration-300 shadow-xl group/card"
                >
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                         <div className="h-12 w-12 rounded-[1.2rem] bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center font-black text-white shrink-0 border border-white/10 shadow-lg">
                             {post.userName?.[0].toUpperCase() || '?'}
                         </div>
                         <div>
                            <h4 className="text-white font-black text-sm tracking-tight group-hover/card:text-brand-red transition-colors">{post.userName}</h4>
                            <div className="flex items-center space-x-2">
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
                                   {post.timestamp instanceof Date ? post.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                </p>
                                <span className="h-0.5 w-0.5 rounded-full bg-slate-700" />
                                <span className="text-[8px] font-black text-slate-700 uppercase">Facility Sync</span>
                            </div>
                         </div>
                      </div>
                      <button className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center text-slate-600 hover:text-white transition-colors opacity-0 group-hover/card:opacity-100">
                         <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-5">
                       <div className="flex items-start space-x-3">
                          <div className={`mt-1 p-2 rounded-lg bg-white/5 flex-shrink-0 ${colorClass}`}>
                             <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                             <p className="text-slate-300 text-sm leading-relaxed">
                                <span className="font-black text-white mr-2">{post.userName}</span>
                                {post.type === 'status_update' ? '' : post.textContent}
                             </p>
                          </div>
                       </div>
                       
                       {post.type === 'status_update' && (
                         <div className="relative">
                            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-brand-red/30 rounded-full" />
                            <p className="text-xl font-medium text-white/95 leading-relaxed pl-2 tracking-tight">
                                {post.textContent}
                            </p>
                         </div>
                       )}

                       {post.metadata?.testScore !== undefined && (
                         <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl mt-4">
                            <div className="flex items-center justify-between">
                               <div>
                                  <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1">Neural Proficiency Score</p>
                                  <p className="text-2xl font-black text-white">{post.metadata.testScore}%</p>
                               </div>
                               <Trophy className="h-8 w-8 text-amber-500" />
                            </div>
                         </div>
                       )}
                    </div>

                    <div className="flex items-center space-x-8 mt-10 pt-6 border-t border-white/5">
                       <button 
                         onClick={() => handleLike(post.id, post.likes)}
                         className={`flex items-center space-x-2 transition-colors group ${post.likes?.includes(user.id) ? 'text-brand-red' : 'text-slate-500 hover:text-brand-red'}`}
                       >
                          <Heart className={`h-5 w-5 ${post.likes?.includes(user.id) ? 'fill-brand-red' : 'group-hover:fill-brand-red'}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{post.likes?.length || 0}</span>
                       </button>
                       <button className="flex items-center space-x-2 text-slate-500 hover:text-blue-500 transition-colors">
                          <MessageCircle className="h-5 w-5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Neural Link</span>
                       </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
