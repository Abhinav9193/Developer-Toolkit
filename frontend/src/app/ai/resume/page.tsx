"use client";

import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { CopyButton } from "@/components/CopyButton";

export default function ResumePage() {
    const [text, setText] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/ai/resume`, { text });
            setResult(data.result);
        } catch (error) {
            console.error(error);
            setResult("Error analyzing resume.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                    <User className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Resume Analyzer</h1>
                    <p className="text-gray-400">Get AI-powered scores and improvement suggestions</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card h-[600px] flex flex-col">
                    <CardHeader>
                        <CardTitle>Resume Content</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <Textarea
                            placeholder="Paste resume text here..."
                            className="flex-1 resize-none font-mono text-sm"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <Button
                            onClick={handleAnalyze}
                            disabled={loading || !text.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? "Analyzing..." : "Analyze Resume"}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="glass-card h-[600px] flex flex-col border-blue-500/20">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-blue-400">Analysis Result</CardTitle>
                        <CopyButton text={result} />
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto bg-black/20 rounded-xl m-6 mt-0 p-4">
                        {loading ? (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                                <div className="h-4 bg-white/10 rounded w-1/2"></div>
                                <div className="h-4 bg-white/10 rounded w-5/6"></div>
                            </div>
                        ) : result ? (
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown>{result}</ReactMarkdown>
                            </div>
                        ) : (
                            <p className="text-gray-600 italic text-center mt-20">
                                Analysis will appear here...
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
