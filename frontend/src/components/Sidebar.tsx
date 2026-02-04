"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    FileJson,
    Terminal,
    FileText,
    Hash,
    Network,
    BookOpen,
    Brain,
    User,
    MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const routes = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/json", label: "JSON Converter", icon: FileJson },
    { href: "/regex", label: "Regex Tester", icon: Terminal },
    { href: "/markdown", label: "Markdown Preview", icon: FileText },
    { href: "/base64", label: "Base64 Converter", icon: Hash },
    { href: "/api-tester", label: "API Tester", icon: Network },
    { href: "/snippets", label: "Snippets", icon: BookOpen },
    { href: "/ai/summarize", label: "AI Summarizer", icon: Brain },
    { href: "/ai/resume", label: "Resume Analyzer", icon: User },
    { href: "/ai/chat", label: "AI Chat", icon: MessageSquare },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r border-white/10 bg-black/20 backdrop-blur-xl h-screen flex flex-col glass">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                    DevToolkit
                </h1>
            </div>
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {routes.map((route) => {
                    const isActive = pathname === route.href;
                    return (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-white/10 text-white shadow-lg"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <route.icon className="w-5 h-5 z-10" />
                            <span className="font-medium z-10">{route.label}</span>
                        </Link>
                    );
                })}
            </nav>

        </aside>
    );
}
