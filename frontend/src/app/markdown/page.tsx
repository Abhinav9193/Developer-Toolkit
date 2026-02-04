"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { CopyButton } from "@/components/CopyButton";

export default function MarkdownPage() {
    const [markdown, setMarkdown] = useState("# Hello World\n\nStart typing markdown...");

    return (
        <div className="h-[calc(100vh-100px)] grid md:grid-cols-2 gap-6">
            <Card className="glass-card flex flex-col">
                <CardHeader>
                    <CardTitle>Editor</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                    <Textarea
                        value={markdown}
                        onChange={(e) => setMarkdown(e.target.value)}
                        className="w-full h-full resize-none border-0 rounded-none bg-transparent p-6 focus-visible:ring-0 font-mono"
                    />
                </CardContent>
            </Card>

            <Card className="glass-card flex flex-col border-green-500/20">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-green-400">Preview</CardTitle>
                    <CopyButton text={markdown} />
                </CardHeader>
                <CardContent className="flex-1 overflow-auto bg-black/20 p-6 prose prose-invert max-w-none">
                    <ReactMarkdown>{markdown}</ReactMarkdown>
                </CardContent>
            </Card>
        </div>
    );
}
