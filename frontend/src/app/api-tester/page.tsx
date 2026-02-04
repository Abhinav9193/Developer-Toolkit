"use client";

import { useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/CopyButton";

export default function ApiTesterPage() {
    const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/todos/1");
    const [method, setMethod] = useState("GET");
    const [body, setBody] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<number | null>(null);

    const handleSend = async () => {
        setLoading(true);
        setResponse("");
        setStatus(null);
        try {
            const res = await axios({
                url,
                method,
                data: body ? JSON.parse(body) : undefined,
                validateStatus: () => true // Don't throw on error status
            });
            setStatus(res.status);
            setResponse(JSON.stringify(res.data, null, 2));
        } catch (error: any) {
            setResponse(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid md:grid-cols-3 gap-6 h-full">
            <div className="md:col-span-1 space-y-6">
                <h1 className="text-2xl font-bold">API Tester</h1>
                <Card className="glass-card">
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label>Method</Label>
                            <select
                                className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm"
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>URL</Label>
                            <Input value={url} onChange={(e) => setUrl(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Body (JSON)</Label>
                            <Textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="font-mono min-h-[150px]"
                                disabled={method === "GET"}
                            />
                        </div>
                        <Button onClick={handleSend} disabled={loading} className="w-full" variant="gradient">
                            {loading ? "Sending..." : "Send Request"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="md:col-span-2">
                <Card className="glass-card h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-4">
                            <CardTitle>Response</CardTitle>
                            {status && (
                                <span className={`px-2 py-1 rounded text-xs font-bold ${status < 300 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    Status: {status}
                                </span>
                            )}
                        </div>
                        <CopyButton text={response} />
                    </CardHeader>
                    <CardContent className="flex-1 p-0 bg-black/20 overflow-hidden">
                        <pre className="w-full h-full p-6 overflow-auto font-mono text-sm text-blue-300">
                            {response}
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
