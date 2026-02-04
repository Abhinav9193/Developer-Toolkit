"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/CopyButton";

export default function Base64Page() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");

    const encode = () => {
        try {
            setOutput(btoa(input));
        } catch (e) {
            setOutput("Error encoding");
        }
    };

    const decode = () => {
        try {
            setOutput(atob(input));
        } catch (e) {
            setOutput("Error decoding");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Base64 Converter</h1>
            <Card className="glass-card">
                <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                        <h3 className="font-medium">Input</h3>
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="font-mono min-h-[150px]"
                        />
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={encode} className="flex-1">Encode</Button>
                        <Button onClick={decode} variant="secondary" className="flex-1">Decode</Button>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium">Output</h3>
                            <CopyButton text={output} />
                        </div>
                        <Textarea
                            value={output}
                            readOnly
                            className="font-mono min-h-[150px] bg-black/20"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
