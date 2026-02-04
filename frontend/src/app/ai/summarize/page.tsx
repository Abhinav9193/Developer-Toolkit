"use client";

import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";

export default function SummarizePage() {
    const [text, setText] = useState("");
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSummarize = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/ai/summarize`, { text });
            setSummary(data.result);
        } catch (error) {
            console.error(error);
            setSummary("Error generating summary.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Brain className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">AI Summarizer</h1>
                    <p className="text-gray-400">Condense long text into concise summaries</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card h-[500px] flex flex-col">
                    <CardHeader>
                        <CardTitle>Input Text</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <Textarea
                            placeholder="Paste your text here..."
                            className="flex-1 resize-none font-mono text-sm"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <Button
                            onClick={handleSummarize}
                            disabled={loading || !text.trim()}
                            variant="gradient"
                            className="w-full"
                        >
                            {loading ? "Summarizing..." : "Summarize"}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="glass-card h-[500px] flex flex-col border-purple-500/20">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-purple-400">Summary</CardTitle>
                        <CopyButton text={summary} />
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto bg-black/20 rounded-xl m-6 mt-0 p-4">
                        {loading ? (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                                <div className="h-4 bg-white/10 rounded w-1/2"></div>
                                <div className="h-4 bg-white/10 rounded w-5/6"></div>
                            </div>
                        ) : summary ? (
                            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{summary}</p>
                        ) : (
                            <p className="text-gray-600 italic text-center mt-20">
                                Summary will appear here...
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
