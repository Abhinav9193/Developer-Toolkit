import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Developer Toolkit",
    description: "A modern developer utility suite",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={inter.className + " flex min-h-screen bg-background text-foreground overflow-hidden"}>
                <Sidebar />
                <main className="flex-1 overflow-auto p-6 md:p-8 lg:p-10 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-transparent pointer-events-none -z-10" />
                    {children}
                </main>
            </body>
        </html>
    );
}
