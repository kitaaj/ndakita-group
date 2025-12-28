"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Construction } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ImpactPage() {
    return (
        <div style={{ backgroundColor: "#F8FAFC" }}>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center px-4">
                <motion.div
                    className="text-center max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div
                        className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }}
                    >
                        <Construction size={40} style={{ color: "#0D9488" }} />
                    </div>
                    <h1
                        className="text-3xl font-bold mb-3"
                        style={{ color: "#1E293B" }}
                    >
                        Our Impact
                    </h1>
                    <p
                        className="text-base mb-6"
                        style={{ color: "#64748B" }}
                    >
                        Coming soon — Track the difference we&apos;re making together.
                        Real-time stats, stories, and transparency.
                    </p>
                    <Link
                        href="/explore"
                        className="inline-block px-6 py-3 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90"
                        style={{ backgroundColor: "#0D9488" }}
                    >
                        Explore Needs Instead
                    </Link>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
}
