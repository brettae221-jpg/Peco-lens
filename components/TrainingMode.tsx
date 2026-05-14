import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  BookOpen, 
  Map, 
  ShieldCheck, 
  FileText, 
  ArrowLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  Activity,
  Award,
  Clock,
  CheckCircle2,
  Lock,
  Play,
  Loader2,
  AlertCircle,
  Trophy,
  BrainCircuit,
  Zap,
  Target
} from 'lucide-react';
import { generateTrainingCourse, generateTrainingTest } from '../services/geminiService';
import { TrainingCourse, TrainingTest, TestResult, User } from '../types';
import Markdown from 'react-markdown';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';

type TrainingView = 'menu' | 'beginner' | 'moderate' | 'advanced' | 'expert' | 'test' | 'records' | 'topic' | 'result';

interface TrainingModeProps {
    user: User;
}

const TrainingMode: React.FC<TrainingModeProps> = ({ user }) => {
    const [view, setView] = useState<TrainingView>('menu');
    const [course, setCourse] = useState<TrainingCourse | null>(null);
    const [test, setTest] = useState<TrainingTest | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTopic, setActiveTopic] = useState<{ moduleTitle: string, topic: any } | null>(null);
    
    // Test logic
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [userAnswers, setUserAnswers] = useState<number[]>([]);
    const [testScore, setTestScore] = useState<number | null>(null);

    // Records
    const [results, setResults] = useState<TestResult[]>([]);
    const [teamResults, setTeamResults] = useState<TestResult[]>([]);
    const [recordTab, setRecordTab] = useState<'mine' | 'team'>('mine');

    const views = [
      { id: 'beginner', name: 'Beginner', level: 'Beginner', icon: BookOpen, color: 'bg-emerald-500', desc: 'Core Fundamentals' },
      { id: 'moderate', name: 'Moderate', level: 'Moderate', icon: Zap, color: 'bg-yellow-500', desc: 'Daily Operations' },
      { id: 'advanced', name: 'Advanced', level: 'Advanced', icon: BrainCircuit, color: 'bg-brand-red', desc: 'Deep Diagnostics' },
      { id: 'expert', name: 'Expert', level: 'Expert', icon: Trophy, color: 'bg-purple-600', desc: 'System Master' },
    ];

    useEffect(() => {
        if (view === 'records') {
            fetchResults();
            if (user.role === 'Admin') fetchTeamResults();
        }
    }, [view]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'test_results'), 
                where('userId', '==', user.id),
                orderBy('timestamp', 'desc')
            );
            const snap = await getDocs(q);
            setResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TestResult[]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamResults = async () => {
        try {
            const q = query(
                collection(db, 'test_results'), 
                orderBy('timestamp', 'desc')
            );
            const snap = await getDocs(q);
            setTeamResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TestResult[]);
        } catch (err) {
            console.error(err);
        }
    };

    const loadCourse = async (level: any) => {
      setLoading(true);
      setError(null);
      setView(level.toLowerCase() as TrainingView);
      try {
        const result = await generateTrainingCourse(level);
        setCourse(result);
      } catch (err: any) {
        setError(err.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    const startTest = async () => {
        if (!course) return;
        setLoading(true);
        setError(null);
        try {
            const generatedTest = await generateTrainingTest(course);
            setTest(generatedTest);
            setCurrentQuestionIdx(0);
            setUserAnswers([]);
            setView('test');
        } catch (err: any) {
            setError(err.message || 'Failed to generate test');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (optionIdx: number) => {
        const newAnswers = [...userAnswers, optionIdx];
        setUserAnswers(newAnswers);

        if (currentQuestionIdx < test!.questions.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
        } else {
            // Finish test
            let score = 0;
            test!.questions.forEach((q, i) => {
                if (q.correctIndex === newAnswers[i]) score++;
            });
            const percentage = Math.round((score / test!.questions.length) * 100);
            setTestScore(score);
            setView('result');

            // Save result
            const resultData: Omit<TestResult, 'id'> = {
                userId: user.id || 'unknown',
                userEmail: user.email,
                testId: `test-${Date.now()}`,
                testTitle: test!.courseTitle,
                score,
                totalQuestions: test!.questions.length,
                percentage,
                timestamp: serverTimestamp(),
                difficulty: test!.level
            };
            await addDoc(collection(db, 'test_results'), resultData);

            // Post to feed
            await addDoc(collection(db, 'news_feed'), {
                userId: user.id || 'unknown',
                userName: user.name || user.username || 'System Student',
                userEmail: user.email,
                type: 'test_complete',
                textContent: `has conquered the "${test!.courseTitle}" test with a score of ${percentage}%. Certification tier updated.`,
                metadata: {
                    courseTitle: test!.courseTitle,
                    testScore: percentage
                },
                timestamp: serverTimestamp(),
                likes: []
            });
        }
    };

    if (view === 'result') {
        const score = testScore || 0;
        const total = test?.questions.length || 10;
        const percent = Math.round((score / total) * 100);
        
        return (
            <div className="h-full bg-slate-950 flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in duration-500">
                <div className={`p-10 rounded-[3rem] ${percent >= 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-red/10 text-brand-red'} border border-current/20 flex flex-col items-center`}>
                    {percent >= 80 ? <Trophy className="h-16 w-16 mb-4" /> : <AlertCircle className="h-16 w-16 mb-4" />}
                    <h2 className="text-6xl font-black tracking-tighter mb-2">{percent}%</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest">{percent >= 80 ? 'Test Passed - Skill Unlocked' : 'Test Failed - Needs Review'}</p>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">{test?.courseTitle}</h3>
                    <p className="text-slate-500 font-medium">Neural verification complete. Result broadcast to facility feed.</p>
                </div>
                <button onClick={() => setView('menu')} className="px-12 py-4 bg-white/5 border border-white/5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all">Return to Hub</button>
            </div>
        );
    }

    if (view === 'test' && test) {
        const q = test.questions[currentQuestionIdx];
        return (
            <div className="h-full bg-slate-950 flex flex-col overflow-hidden">
                <div className="p-8 flex items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-md text-white">
                    <div className="flex items-center space-x-6">
                        <h2 className="text-2xl font-black uppercase tracking-tight">System Test: {test.level}</h2>
                        <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-slate-500 tracking-widest">
                            Q {currentQuestionIdx + 1} / {test.questions.length}
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-12 no-scrollbar pb-32">
                    <div className="max-w-3xl mx-auto space-y-12">
                        <h3 className="text-3xl font-black text-white leading-tight tracking-tight">{q.question}</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {q.options.map((opt, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleAnswer(i)}
                                    className="p-8 text-left bg-white/5 border border-white/5 rounded-[2rem] hover:bg-white/10 hover:border-brand-red/50 transition-all group"
                                >
                                    <div className="flex items-center space-x-6">
                                        <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-600 font-black group-hover:bg-brand-red group-hover:text-white transition-colors uppercase">
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                        <p className="text-lg font-bold text-slate-300 group-hover:text-white transition-colors">{opt}</p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'topic' && activeTopic) {
      return (
        <div className="h-full bg-slate-950 flex flex-col overflow-hidden">
          <div className="p-8 flex items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-md text-white">
             <div className="flex items-center space-x-6">
                <button onClick={() => setView(course?.level.toLowerCase() as TrainingView)} className="p-3 bg-white/5 rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                   <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{activeTopic.moduleTitle}</h3>
                   <h2 className="text-2xl font-black uppercase tracking-tight">{activeTopic.topic.topicTitle}</h2>
                </div>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-12 no-scrollbar pb-32">
             <div className="max-w-3xl mx-auto prose prose-invert prose-slate">
                <Markdown>{activeTopic.topic.content}</Markdown>
             </div>
          </div>
        </div>
      );
    }

    if (['beginner', 'moderate', 'advanced', 'expert'].includes(view)) {
      const activeItem = views.find(v => v.id === view)!;
      return (
        <div className="h-full bg-slate-950 flex flex-col overflow-hidden">
          <div className="p-8 flex items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-md shrink-0 text-white">
            <div className="flex items-center space-x-6">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setView('menu')} className="p-3 bg-white/5 rounded-full border border-white/5">
                <ArrowLeft className="h-6 w-6" />
              </motion.button>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{activeItem.name} Route</h2>
                <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Neural Knowledge Transfer Active</p>
              </div>
            </div>
            {course && !loading && (
                <button 
                  onClick={startTest}
                  className="px-6 py-3 bg-brand-red rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-3 shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
                >
                    <Target className="h-4 w-4" />
                    <span>Attempt System Test</span>
                </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-10 no-scrollbar pb-32 text-white">
             {loading ? (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                   <Loader2 className="h-12 w-12 animate-spin mb-6" />
                   <p className="font-black uppercase tracking-widest text-xs">Generating Neural Pathways...</p>
                </div>
             ) : error ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                   <AlertCircle className="h-16 w-16 text-brand-red mb-6" />
                   <h3 className="text-2xl font-black uppercase mb-4">Transmission Error</h3>
                   <p className="text-slate-400 mb-8 max-w-md">{error}</p>
                   <button onClick={() => setView('menu')} className="px-8 py-4 bg-white/5 border border-white/5 rounded-2xl font-black uppercase text-xs tracking-widest">Return to Academy</button>
                </div>
             ) : course ? (
                <div className="max-w-5xl mx-auto space-y-12">
                   <div className="bg-white/5 rounded-[3rem] p-12 border border-white/5">
                      <h3 className="text-5xl font-black tracking-tighter mb-4 text-white uppercase">{course.title}</h3>
                      <p className="text-slate-400 font-medium text-lg max-w-2xl leading-relaxed">{course.description}</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {course.modules.map((module, mIdx) => (
                         <div key={mIdx} className="space-y-6">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] sticky top-0 bg-slate-950/80 backdrop-blur py-4 z-10">{module.moduleTitle}</h4>
                            <div className="space-y-3">
                               {module.topics.map((topic, tIdx) => (
                                  <button 
                                    key={tIdx} 
                                    onClick={() => {
                                      setActiveTopic({ moduleTitle: module.moduleTitle, topic });
                                      setView('topic');
                                    }}
                                    className="w-full text-left p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group flex items-center justify-between"
                                  >
                                     <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:bg-white/10 group-hover:text-white transition-colors">
                                           {tIdx + 1}
                                        </div>
                                        <p className="text-sm font-black uppercase tracking-tight text-white">{topic.topicTitle}</p>
                                     </div>
                                     <ArrowRight className="h-4 w-4 text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                  </button>
                               ))}
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             ) : null}
          </div>
        </div>
      );
    }

    if (view === 'records') {
        return (
            <div className="h-full bg-slate-950 flex flex-col overflow-hidden">
                <div className="p-8 flex items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-md shrink-0 text-white">
                    <div className="flex items-center space-x-6">
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setView('menu')} className="p-3 bg-white/5 rounded-full border border-white/5">
                            <ArrowLeft className="h-6 w-6" />
                        </motion.button>
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">Training Records</h2>
                            <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Historical Skill Verification</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 no-scrollbar pb-32">
                    {user.role === 'Admin' && (
                        <div className="max-w-4xl mx-auto mb-8 flex p-2 bg-white/5 rounded-2xl border border-white/5">
                            <button 
                                onClick={() => setRecordTab('mine')}
                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${recordTab === 'mine' ? 'bg-brand-red text-white' : 'text-slate-500'}`}
                            >
                                My Performance
                            </button>
                            <button 
                                onClick={() => setRecordTab('team')}
                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${recordTab === 'team' ? 'bg-brand-red text-white' : 'text-slate-500'}`}
                            >
                                Team Overview
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 text-brand-red animate-spin" /></div>
                    ) : (recordTab === 'mine' ? results : teamResults).length === 0 ? (
                        <div className="text-center p-20 opacity-40">
                            <FileText className="h-20 w-20 mx-auto mb-6 text-slate-600" />
                            <p className="font-black uppercase tracking-widest text-xs">No transcripts detected on this terminal.</p>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-4">
                            {(recordTab === 'mine' ? results : teamResults).map((res) => (
                                <div key={res.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
                                    <div className="flex items-center space-x-6">
                                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${res.percentage >= 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-red/10 text-brand-red'}`}>
                                            <span className="text-xl font-black">{res.percentage}%</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{res.difficulty} LEVEL</span>
                                                <span className="text-slate-800">•</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                    {res.userEmail}
                                                </span>
                                            </div>
                                            <h4 className="text-xl font-black text-white uppercase tracking-tight">{res.testTitle}</h4>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{res.score} / {res.totalQuestions} CORRECT</span>
                                        <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${res.percentage}%` }}
                                                className={`h-full ${res.percentage >= 80 ? 'bg-emerald-500' : 'bg-brand-red'}`} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-slate-950 flex flex-col p-8 pb-32 overflow-y-auto no-scrollbar">
            <div className="mb-12 flex items-end justify-between">
                <div>
                    <h2 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase tracking-tight">System <span className="text-brand-red">Curriculum</span></h2>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Knowledge Base Expansion Layers</p>
                </div>
                <button 
                  onClick={() => setView('records')}
                  className="bg-white/5 border border-white/5 px-6 py-3 rounded-2xl flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                >
                    <FileText className="h-4 w-4" />
                    <span>Transcripts</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {views.map(item => (
                    <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => loadCourse(item.level)}
                        className="group relative bg-white/5 border border-white/5 p-8 rounded-[3rem] flex flex-col items-center text-center hover:bg-brand-red/5 hover:border-brand-red/20 transition-all shadow-2xl overflow-hidden"
                    >
                        <div className={`p-6 rounded-[2rem] ${item.color} mb-6 shadow-lg shadow-black/40 group-hover:scale-110 transition-transform`}>
                            <item.icon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-2">{item.name}</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">{item.desc}</p>
                        
                        <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-auto group-hover:text-brand-red transition-all">
                            <span>Open Route</span>
                            <ArrowRight className="ml-2 h-3 w-3 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default TrainingMode;
