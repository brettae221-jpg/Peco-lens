import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, User, LogEntry } from '../types';
import { getAIChatResponse, createLogEntryFromChat } from '../services/geminiService';
import { SendIcon } from './icons/SendIcon';
import { UserIcon } from './icons/UserIcon';
import { CogIcon } from './icons/CogIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';
import MarkdownRenderer from './MarkdownRenderer';
import { PencilIcon } from './icons/PencilIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { Wrench, Database, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generate3DModel } from '../services/tripoService';

interface ActiveRecoveryProps {
    user: Omit<User, 'password'>;
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const isStepByStep = (text: string): boolean => {
    if (!text) return false;
    // Check for numbered lists (e.g., "1. Do this", "2. Do that")
    const hasNumberedList = /(^|\n)\s*\d+\.\s+/.test(text);
    // Check for bulleted lists (e.g., "- Do this", "* Do that")
    const hasBulletedList = /(^|\n)\s*[-*]\s+/.test(text);
    return hasNumberedList || hasBulletedList;
};

const ActiveRecovery: React.FC<ActiveRecoveryProps> = ({ user, messages, setMessages }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [image, setImage] = useState<{ file: File, preview: string } | null>(null);
    const [editingMessage, setEditingMessage] = useState<{ id: string, text: string } | null>(null);
    const [isLoggingPM, setIsLoggingPM] = useState<string | null>(null);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const canEdit = user.email.includes('caleb');

    const logToPM = async (msg: ChatMessage) => {
        setIsLoggingPM(msg.id);
        try {
            // Infer part details from text
            const partNameMatch = msg.text.match(/replace ([^.\n]+)/i) || msg.text.match(/check the ([^.\n]+)/i);
            const partName = partNameMatch ? partNameMatch[1].trim() : "Mechanical Component";
            
            // Generate 3D reconstruction for the PM crew
            const modelUrl = await generate3DModel(`Technical industrial 3D model of ${partName} for Sunday maintenance crew. Realism is key.`);

            await addDoc(collection(db, 'pm_items'), {
                timestamp: serverTimestamp(),
                equipmentType: 'General', // Would be better to infer from context
                partName: partName,
                issueDescription: msg.text.substring(0, 500),
                severity: 'Medium',
                loggedBy: user.email,
                status: 'Pending',
                aiReasoning: 'Automatically logged from troubleshooting session.',
                modelUrl: modelUrl
            });
            // Success indication could be added here
        } catch (err) {
            console.error("Log to PM failed:", err);
        } finally {
            setIsLoggingPM(null);
        }
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);
    
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setImage({ file, preview });
        }
    };

    const handleEditMessage = (id: string, newText: string) => {
        setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, text: newText } : msg));
        setEditingMessage(null);
    };

    const handleSend = useCallback(async () => {
        if ((!input.trim() && !image) || isLoading) return;

        const userMessage: ChatMessage = { 
            id: `user-${Date.now()}`,
            senderEmail: user.email,
            role: 'user', 
            text: input,
            timestamp: new Date().toISOString(),
            ...(image && { image: image.preview })
        };
        
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        const currentImageFile = image?.file;

        setInput('');
        setImage(null);
        setIsLoading(true);
        setError(null);

        try {
            let imagePayload: { mimeType: string, data: string } | null = null;
            if (currentImageFile) {
                const reader = new FileReader();
                const promise = new Promise<{ mimeType: string, data: string }>((resolve, reject) => {
                    reader.onload = (event) => {
                        resolve({
                            mimeType: currentImageFile.type,
                            data: event.target?.result as string,
                        });
                    };
                    reader.onerror = (error) => reject(error);
                });
                reader.readAsDataURL(currentImageFile);
                imagePayload = await promise;
            }

            const modelResponse = await getAIChatResponse(messages, currentInput, imagePayload);
            const modelMessage: ChatMessage = { 
                id: `model-${Date.now()}`, 
                senderEmail: 'ai@pecofoods.com',
                role: 'model', 
                text: modelResponse.text,
                timestamp: new Date().toISOString(),
                image: modelResponse.image 
            };
            setMessages(prev => [...prev, modelMessage]);

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
            setMessages(prev => [...prev, { id: `model-err-${Date.now()}`, senderEmail: 'ai@pecofoods.com', role: 'model', text: `Sorry, I encountered an error: ${errorMessage}`, timestamp: new Date().toISOString() }]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    }, [input, isLoading, messages, image, setMessages]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    
    return (
        <div className="flex-1 flex flex-col bg-transparent min-h-0 p-4 gap-4 h-full relative">
            {/* Chat History */}
            <div ref={chatContainerRef} className="flex-1 p-4 space-y-6 overflow-y-auto rounded-3xl glass border border-white/50 shadow-inner no-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && (
                            <div className="flex-shrink-0 h-10 w-10 rounded-2xl bg-brand-red flex items-center justify-center shadow-lg">
                                <BookOpenIcon className="h-6 w-6 text-white"/>
                            </div>
                        )}
                        <div className={`relative group max-w-2xl w-fit rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-brand-red text-white' : 'bg-white border border-slate-100'}`}>
                             {editingMessage?.id === msg.id ? (
                                <div className="w-96 p-3">
                                    <textarea
                                        value={editingMessage.text}
                                        onChange={(e) => setEditingMessage({ ...editingMessage, text: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-red outline-none transition text-sm text-slate-800"
                                        rows={Math.max(4, editingMessage.text.split('\n').length)}
                                    />
                                    <div className="flex justify-end space-x-2 mt-2">
                                        <button onClick={() => handleEditMessage(editingMessage.id, editingMessage.text)} className="bg-brand-red hover:bg-brand-red-dark text-white p-2 rounded-xl transition-all active:scale-90" aria-label="Save"><CheckIcon className="h-5 w-5"/></button>
                                        <button onClick={() => setEditingMessage(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-600 p-2 rounded-xl transition-all active:scale-90" aria-label="Cancel"><XMarkIcon className="h-5 w-5"/></button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="px-5 py-3">
                                        {msg.image && <img src={msg.image} alt={msg.role === 'user' ? "User upload" : "AI-generated image"} className="max-w-xs rounded-xl mb-3 shadow-md" />}
                                        <div className={msg.role === 'user' ? 'text-white' : 'text-slate-700'}>
                                            <MarkdownRenderer content={msg.text} />
                                        </div>
                                        {msg.role === 'model' && !editingMessage && (
                                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                                                <button 
                                                    onClick={() => logToPM(msg)}
                                                    disabled={!!isLoggingPM}
                                                    className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand-red transition-all active:scale-95"
                                                >
                                                    {isLoggingPM === msg.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Database className="h-4 w-4" />
                                                    )}
                                                    <span>{isLoggingPM === msg.id ? 'Neural Syncing...' : 'Log Fault to Sunday PM'}</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {canEdit && msg.role === 'model' && (
                                        <button 
                                            onClick={() => setEditingMessage({ id: msg.id, text: msg.text })} 
                                            className="absolute top-2 right-2 bg-slate-100/80 backdrop-blur-sm p-1.5 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-brand-red"
                                            aria-label="Edit message"
                                        >
                                            <PencilIcon className="h-4 w-4"/>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                        {msg.role === 'user' && (
                            <div className="flex-shrink-0 h-10 w-10 rounded-2xl bg-slate-200 flex items-center justify-center shadow-md">
                                <UserIcon className="h-6 w-6 text-slate-600"/>
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 h-10 w-10 rounded-2xl bg-brand-red flex items-center justify-center shadow-lg">
                            <BookOpenIcon className="h-6 w-6 text-white"/>
                        </div>
                        <div className="max-w-2xl w-fit p-4 rounded-2xl bg-white border border-slate-100 flex items-center shadow-sm">
                            <CogIcon className="h-5 w-5 animate-spin mr-3 text-brand-red" />
                            <span className="text-slate-500 font-medium">Analyzing system data...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 glass border border-white/50 rounded-3xl p-3 flex flex-col gap-2 shadow-xl">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-brand-red text-sm font-medium animate-shake">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                 {image && (
                    <div className="relative w-fit ml-2 mb-1">
                        <img src={image.preview} alt="Preview" className="h-20 w-20 object-cover rounded-xl shadow-md border-2 border-white" />
                        <button 
                            onClick={() => setImage(null)} 
                            className="absolute -top-2 -right-2 bg-brand-red rounded-full p-1 text-white shadow-lg hover:bg-brand-red-dark transition-all active:scale-90"
                            aria-label="Remove image"
                        >
                            <TrashIcon className="h-4 w-4"/>
                        </button>
                    </div>
                 )}
                <div className="flex items-end gap-2">
                    <label htmlFor="image-upload-recovery" className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 cursor-pointer transition-all active:scale-95 shadow-sm">
                        <UploadIcon className="h-6 w-6 text-slate-500" />
                        <input type='file' id="image-upload-recovery" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Describe the issue or upload a photo..."
                        className="flex-grow bg-white/80 border border-slate-200 rounded-2xl p-3.5 focus:ring-2 focus:ring-brand-red outline-none transition-all resize-none max-h-40 text-slate-800 placeholder:text-slate-400"
                        rows={1}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || (!input.trim() && !image)}
                        className="p-3.5 bg-brand-red hover:bg-brand-red-dark text-white font-bold rounded-2xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-lg shadow-brand-red/20"
                        aria-label="Send message"
                    >
                        <SendIcon className="h-6 w-6"/>
                    </button>
                </div>
            </div>
        </div>
    );
};


export default ActiveRecovery;