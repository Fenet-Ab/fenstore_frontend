"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2, User } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export default function FloatingSupportChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const { isLoggedIn } = useAuth();
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        if (!isLoggedIn) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://fenstore-backend-1.onrender.com/api/support/messages", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Error fetching support messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-support-chat', handleOpen);
        return () => window.removeEventListener('open-support-chat', handleOpen);
    }, []);

    useEffect(() => {
        let interval: any;
        if (isOpen && isLoggedIn) {
            fetchMessages();
            // Simple polling every 5 seconds for "real-time" feel
            interval = setInterval(fetchMessages, 5000);
        }
        return () => clearInterval(interval);
    }, [isOpen, isLoggedIn]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !isLoggedIn) return;

        setSending(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://fenstore-backend-1.onrender.com/api/support/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ message: newMessage })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages([...messages, data]);
                setNewMessage("");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    if (!isLoggedIn) return null;

    return (
        <div className="fixed bottom-8 right-8 z-[100]">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-[#1A1A1A] p-6 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center">
                                <MessageCircle className="w-6 h-6 text-black" />
                            </div>
                            <div>
                                <h3 className="font-black italic tracking-tight text-sm uppercase">Support Sanctuary</h3>
                                <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest">Always Active</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/10 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 custom-scrollbar"
                    >
                        {loading ? (
                            <div className="flex justify-center items-center h-full">
                                <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-10 opacity-50">
                                <MessageCircle size={40} className="mx-auto mb-4 text-[#D4AF37]" />
                                <p className="text-sm font-bold italic">How can we assist your journey today?</p>
                            </div>
                        ) : (
                            messages.map((m, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${m.isAdmin ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-bold ${m.isAdmin
                                        ? 'bg-white border border-gray-100 text-black rounded-bl-none shadow-sm'
                                        : 'bg-[#1A1A1A] text-white rounded-br-none shadow-lg'
                                        }`}>
                                        {m.message}
                                        <p className={`text-[10px] mt-1 font-bold ${m.isAdmin ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Input Footer */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your inquiry..."
                            className="flex-1 bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm text-black font-bold focus:outline-none focus:bg-white focus:border-[#D4AF37]/30 transition-all"
                        />
                        <button
                            disabled={sending || !newMessage.trim()}
                            className="bg-[#D4AF37] text-black p-3 rounded-xl hover:bg-black hover:text-[#D4AF37] transition-all disabled:opacity-50 shadow-lg shadow-[#D4AF37]/20"
                        >
                            {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all transform active:scale-90 ${isOpen ? 'bg-black text-[#D4AF37]' : 'bg-[#D4AF37] text-black hover:scale-110'
                    }`}
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.05);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
