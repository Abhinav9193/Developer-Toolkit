"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/CopyButton";

export default function RegexPage() {
    const [pattern, setPattern] = useState("");
    const [flags, setFlags] = useState("gm");
    const [text, setText] = useState("");

    const [matches, setMatches] = useState<RegExpMatchArray[]>([]);

    const handleTest = () => {
        if (!pattern || !text) {
            setMatches([]);
            return;
        }
        try {
            const regex = new RegExp(pattern, flags);
            setMatches(Array.from(text.matchAll(regex)));
        } catch (e) {
            console.error(e);
            setMatches([]);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-6 h-full">
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Regex Tester</h1>
                <Card className="glass-card">
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Pattern (e.g. \d+)"
                                value={pattern}
                                onChange={(e) => setPattern(e.target.value)}
                                className="flex-1 font-mono"
                            />
                            <Input
                                placeholder="Flags"
                                value={flags}
                                onChange={(e) => setFlags(e.target.value)}
                                className="w-20 font-mono"
                            />
                        </div>
                        <Textarea
                            placeholder="Test string..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="font-mono min-h-[300px]"
                        />
                        <Button onClick={handleTest} className="w-full" variant="gradient">
                            Test Regex
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Matches ({matches.length})</h2>
                <Card className="glass-card h-[calc(100%-3rem)]">
                    <CardContent className="p-6 overflow-auto h-full">
                        {matches.length > 0 ? (
                            <div className="space-y-2">
                                {matches.map((match, i) => (
                                    <div key={i} className="p-3 bg-white/5 rounded border border-white/10">
                                        <div className="flex justify-between items-start text-xs text-gray-500 mb-1">
                                            <div>
                                                <span>Match #{i + 1}</span>
                                                <span className="ml-2">Index: {match.index}</span>
                                            </div>
                                            <CopyButton text={match[0]} className="h-6 px-2 py-0" />
                                        </div>
                                        <div className="font-mono text-green-400 break-all">
                                            {match[0]}
                                        </div>
                                        {match.length > 1 && (
                                            <div className="mt-2 pl-4 border-l border-white/10 space-y-1">
                                                {Array.from(match).slice(1).map((group, gi) => (
                                                    <div key={gi} className="text-xs">
                                                        <span className="text-gray-500">Group {gi + 1}: </span>
                                                        <span className="text-blue-300 font-mono">{group}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No matches found</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
