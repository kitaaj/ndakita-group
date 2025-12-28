"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, Users, Shield, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AboutPage() {
    return (
        <div
            className="min-h-screen"
            style={{ backgroundColor: "#F8FAFC" }}
        >
            <Navbar />

            {/* Hero */}
            <div className="max-w-4xl mx-auto px-4 pt-24 pb-16 text-center">
                <motion.h1
                    className="text-4xl md:text-5xl font-bold mb-4"
                    style={{ color: "#1E293B" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    About GiveHaven
                </motion.h1>
                <motion.p
                    className="max-w-2xl mx-auto"
                    style={{ color: "#64748B" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <span className="text-xl md:text-2xl font-semibold block mb-2" style={{ color: "#0D9488" }}>
                        Connecting Hearts to Homes
                    </span>
                    <span className="text-base md:text-lg font-normal">
                        A platform that bridges the gap between generous donors and children&apos;s homes in need.
                    </span>
                </motion.p>
            </div>

            {/* Mission Section */}
            <div className="max-w-4xl mx-auto px-4 pb-16">
                <motion.div
                    className="rounded-2xl p-8 md:p-12"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(13, 148, 136, 0.1)",
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2
                        className="text-2xl font-bold mb-4"
                        style={{ color: "#1E293B" }}
                    >
                        Our Mission
                    </h2>
                    <p
                        className="text-base leading-relaxed mb-6"
                        style={{ color: "#64748B" }}
                    >
                        GiveHaven eliminates the barriers between people who want to help
                        and children&apos;s homes that need support. We believe that giving
                        should be direct, transparent, and meaningful.
                    </p>
                    <p
                        className="text-base leading-relaxed"
                        style={{ color: "#64748B" }}
                    >
                        By connecting donors directly with verified homes, we ensure that
                        every contribution makes a real, tangible difference in the lives
                        of children.
                    </p>
                </motion.div>
            </div>

            {/* Values Grid */}
            <div className="max-w-4xl mx-auto px-4 pb-16">
                <h2
                    className="text-2xl font-bold mb-8 text-center"
                    style={{ color: "#1E293B" }}
                >
                    What We Stand For
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        {
                            icon: Shield,
                            title: "Trust & Verification",
                            desc: "Every home is verified before joining our platform.",
                        },
                        {
                            icon: Users,
                            title: "Direct Connection",
                            desc: "Donors connect directly with homes — no middlemen.",
                        },
                        {
                            icon: Sparkles,
                            title: "Transparency",
                            desc: "See exactly where your donations go and the impact they make.",
                        },
                        {
                            icon: Heart,
                            title: "Dignity",
                            desc: "Every child deserves care, support, and opportunity.",
                        },
                    ].map((value, index) => (
                        <motion.div
                            key={value.title}
                            className="rounded-xl p-6"
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                border: "1px solid rgba(13, 148, 136, 0.1)",
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                        >
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                                style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }}
                            >
                                <value.icon size={24} style={{ color: "#0D9488" }} />
                            </div>
                            <h3
                                className="font-semibold mb-2"
                                style={{ color: "#1E293B" }}
                            >
                                {value.title}
                            </h3>
                            <p
                                className="text-sm"
                                style={{ color: "#64748B" }}
                            >
                                {value.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Ndakita Group
            <div className="max-w-4xl mx-auto px-4 pb-24">
                <motion.div
                    className="text-center rounded-2xl p-8"
                    style={{
                        backgroundColor: "rgba(13, 148, 136, 0.05)",
                        border: "1px solid rgba(13, 148, 136, 0.1)",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <p
                        className="text-sm font-medium mb-2"
                        style={{ color: "#64748B" }}
                    >
                        A project of
                    </p>
                    <h3
                        className="text-xl font-bold"
                        style={{ color: "#0D9488" }}
                    >
                        Ndakita Group International
                    </h3>
                    <p
                        className="text-sm mt-2"
                        style={{ color: "#64748B" }}
                    >
                        Build. Grow. Give.
                    </p>
                </motion.div>
            </div> */}

            {/* CTA */}
            <div className="max-w-4xl mx-auto px-4 pb-24 text-center">
                <Link
                    href="/explore"
                    className="inline-block px-8 py-4 text-base font-semibold text-white rounded-xl transition-all hover:opacity-90"
                    style={{
                        backgroundColor: "#F97316",
                        boxShadow: "0 4px 20px rgba(249, 115, 22, 0.3)",
                    }}
                >
                    Start Making an Impact
                </Link>
            </div>

            <Footer />
        </div>
    );
}
