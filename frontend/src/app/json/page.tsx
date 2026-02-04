"use client";

import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileJson, Sparkles, AlertCircle } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";

export default function JsonConverterPage() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const convertToJson = async () => {
        if (!input.trim()) return;
        setLoading(true);
        setError("");
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/ai/convert-to-json`, { text: input });

            // Try to parse it to ensure it's valid JSON for formatting
            try {
                const parsed = JSON.parse(data.result);
                setOutput(JSON.stringify(parsed, null, 2));
            } catch (e) {
                // If AI returns markdown blocks, extract content
                let content = data.result;
                const match = content.match(/```json\n([\s\S]*?)\n```/);
                if (match) {
                    try {
                        const parsedMatch = JSON.parse(match[1]);
                        setOutput(JSON.stringify(parsedMatch, null, 2));
                    } catch (e2) {
                        setOutput(match[1]);
                    }
                } else {
                    setOutput(content);
                }
            }
        } catch (error) {
            console.error(error);
            setError("Failed to convert text to JSON.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] grid md:grid-cols-2 gap-6">
            <Card className="glass-card flex flex-col border-none shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-600/20 to-transparent border-b border-white/5">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        Random Text Input
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 relative">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full h-full resize-none border-0 bg-transparent p-6 focus-visible:ring-0 font-medium text-gray-200 placeholder:text-gray-600"
                        placeholder="Paste random text, names, data, or unstructured info here. AI will convert it into a perfect JSON structure..."
                    />
                    <div className="absolute bottom-6 right-6">
                        <Button
                            onClick={convertToJson}
                            disabled={loading || !input.trim()}
                            className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 gap-2"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                            ) : (
                                <FileJson className="w-4 h-4" />
                            )}
                            {loading ? "Converting..." : "Convert to JSON"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="glass-card flex flex-col border-none shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-l from-purple-600/20 to-transparent border-b border-white/5 flex flex-row justify-between items-center">
                    <CardTitle className="text-xl font-bold text-gray-100">JSON Output</CardTitle>
                    <CopyButton text={output} className="border-none bg-white/5 hover:bg-white/10" />
                </CardHeader>
                <CardContent className="flex-1 p-0 bg-black/40 relative">
                    {error ? (
                        <div className="flex flex-col items-center justify-center h-full text-red-400 gap-2 p-6 text-center">
                            <AlertCircle className="w-10 h-10" />
                            <p>{error}</p>
                        </div>
                    ) : output ? (
                        <pre className="w-full h-full p-6 overflow-auto font-mono text-sm text-green-400 selection:bg-green-500/20">
                            {output}
                        </pre>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-600 italic p-6 text-center">
                            <FileJson className="w-12 h-12 mb-4 opacity-10" />
                            <p>AI generated JSON will appear here...</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
