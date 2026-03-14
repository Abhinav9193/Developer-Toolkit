"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Snippet {
    id: number;
    title: string;
    language: string;
    code: string;
}

const API_URL = "/api/snippets";

export default function SnippetsPage() {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({ title: "", language: "", code: "" });
    const [copiedId, setCopiedId] = useState<number | null>(null);

    useEffect(() => {
        fetchSnippets();
    }, []);

    const fetchSnippets = async () => {
        try {
            const { data } = await api.get(API_URL);
            setSnippets(data);
        } catch (error) {
            console.error("Failed to fetch snippets", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const { data } = await api.post(API_URL, formData);
            setSnippets([...snippets, data]);
            setFormData({ title: "", language: "", code: "" });
        } catch (error) {
            console.error("Failed to create snippet", error);
            setError("Failed to save snippet. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`${API_URL}/${id}`);
            setSnippets(snippets.filter((s) => s.id !== id));
        } catch (error) {
            console.error("Failed to delete snippet", error);
        }
    };

    const handleCopy = (code: string, id: number) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            {/* List Section */}
            <div className="lg:col-span-2 space-y-4">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                    Saved Snippets
                </h2>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid gap-4">
                            <AnimatePresence>
                                {snippets.map((snippet) => (
                                    <motion.div
                                        key={snippet.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        layout
                                    >
                                        <Card className="group relative overflow-hidden glass-card hover:border-primary/50 transition-colors">
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-center">
                                                    <CardTitle className="text-lg font-semibold">{snippet.title}</CardTitle>
                                                    <span className="text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                                                        {snippet.language}
                                                    </span>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="relative group/code">
                                                    <pre className="p-4 rounded-lg bg-black/40 overflow-x-auto text-sm font-mono text-gray-300 border border-white/5 scrollbar-hide">
                                                        {snippet.code}
                                                    </pre>
                                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="secondary"
                                                            size="icon"
                                                            className="h-8 w-8 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10"
                                                            onClick={() => handleCopy(snippet.code, snippet.id)}
                                                        >
                                                            {copiedId === snippet.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            size="icon"
                                                            className="h-8 w-8 bg-black/60 hover:bg-red-500/20 hover:text-red-400 backdrop-blur-md border border-white/10"
                                                            onClick={() => handleDelete(snippet.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {snippets.length === 0 && (
                                <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10">
                                    <p className="text-gray-400">No snippets found. Create your first one!</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Form Section */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">New Snippet</h2>
                <Card className="glass-card sticky top-6">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. React UseEffect"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Language</Label>
                                <Input
                                    value={formData.language}
                                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                    placeholder="e.g. TypeScript"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Code</Label>
                                <Textarea
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="Paste code here..."
                                    className="font-mono min-h-[200px]"
                                    required
                                />
                            </div>
                            {error && (
                                <p className="text-red-500 text-xs text-center">{error}</p>
                            )}
                            <Button type="submit" className="w-full" variant="gradient" disabled={submitting}>
                                {submitting ? "Saving..." : "Save Snippet"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
