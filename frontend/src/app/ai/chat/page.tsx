"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { CopyButton } from "@/components/CopyButton";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
                messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
            });

            const aiMessage: Message = { role: "assistant", content: data.result };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("Chat error", error);
            setMessages((prev) => [...prev, { role: "assistant", content: "Error communicating with AI." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <Card className="flex-1 flex flex-col glass-card border-none bg-black/40">
                <CardHeader className="border-b border-white/10 pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="w-6 h-6 text-purple-400" />
                        AI Assistant
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                <Bot className="w-12 h-12 mb-4 opacity-20" />
                                <p>Start a conversation...</p>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl p-4 ${m.role === "user"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white/10 text-gray-200"
                                        }`}
                                >
                                    {m.role === "assistant" ? (
                                        <div className="relative group">
                                            <div className="prose prose-invert prose-sm max-w-none pr-8">
                                                <ReactMarkdown>{m.content}</ReactMarkdown>
                                            </div>
                                            <CopyButton
                                                text={m.content}
                                                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-1 border-none bg-transparent hover:bg-white/10"
                                            />
                                        </div>
                                    ) : (
                                        <p>{m.content}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white/10 rounded-2xl p-4 flex gap-2 items-center">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-white/10 bg-black/20">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                sendMessage();
                            }}
                            className="flex gap-2"
                        >
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1"
                                disabled={loading}
                            />
                            <Button type="submit" disabled={loading || !input.trim()} variant="gradient">
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
