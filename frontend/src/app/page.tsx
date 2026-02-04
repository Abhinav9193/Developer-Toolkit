"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";
import { motion } from "framer-motion";
import { Activity, Code, Database, Zap, BookOpen, ExternalLink, Calendar } from "lucide-react";

interface DashboardData {
    totalSnippets: number;
    systemStatus: string;
    databaseSize: string;
    usageHistory: { name: string; developers: number }[];
    articles: { title: string; summary: string; date: string; imageUrl: string }[];
}

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get("/api/dashboard/stats");
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50"></div>
                    <p className="text-gray-400 font-medium">Loading ecosystem stats...</p>
                </div>
            </div>
        );
    }

    const stats = [
        { title: "Total API Calls", value: "12,345", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
        { title: "Snippets Stored", value: data?.totalSnippets.toString() || "0", icon: Code, color: "text-blue-500", bg: "bg-blue-500/10" },
        { title: "Database Size", value: data?.databaseSize || "0 GB", icon: Database, color: "text-green-500", bg: "bg-green-500/10" },
        { title: "System Health", value: data?.systemStatus || "Offline", icon: Activity, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    ];

    return (
        <div className="space-y-10 pb-10">
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="glass-card border-none hover:bg-white/5 transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-semibold tracking-wider text-gray-400 uppercase">{stat.title}</CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white">{stat.value}</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Growth Chart */}
                <motion.div
                    className="lg:col-span-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="glass-card border-none h-full shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <Activity className="w-5 h-5 text-blue-500" />
                                Growth of Web Developers (Millions)
                            </CardTitle>
                            <p className="text-sm text-gray-500">Global population of professional web developers over time.</p>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data?.usageHistory}>
                                        <defs>
                                            <linearGradient id="colorDev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#6b7280"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            stroke="#6b7280"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${value}M`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#111827",
                                                border: "1px solid #ffffff10",
                                                borderRadius: "12px"
                                            }}
                                            itemStyle={{ color: "#3b82f6" }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="developers"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorDev)"
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Latest Resources */}
                <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-purple-500" />
                            Latest Ecosystem News
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {data?.articles.map((article, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + idx * 0.1 }}
                            >
                                <Card className="glass-card border-none hover:ring-1 hover:ring-white/10 transition-all cursor-pointer group group overflow-hidden">
                                    <div className="h-24 w-full relative overflow-hidden hidden sm:block">
                                        <img
                                            src={article.imageUrl}
                                            alt={article.title}
                                            className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    </div>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono uppercase tracking-tighter mb-2">
                                            <Calendar className="w-3 h-3" />
                                            {article.date}
                                        </div>
                                        <h4 className="font-bold text-sm text-gray-200 group-hover:text-blue-400 transition-colors line-clamp-1 mb-1">
                                            {article.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                            {article.summary}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
