"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface GlassHeroProps {
    onJoinClick?: () => void;
}

export default function GlassHero({ onJoinClick }: GlassHeroProps) {
    return (
        <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4">
            {/* Ambient Background Blurs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                {/* Teal blur - top right */}
                <motion.div
                    className="ambient-blur ambient-teal w-[700px] h-[700px] -top-48 -right-48"
                    style={{ position: "absolute" }}
                    animate={{
                        x: [0, -40, 30, 0],
                        y: [0, 30, -40, 0],
                        scale: [1, 1.08, 0.95, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                {/* Yellow blur - bottom left */}
                <motion.div
                    className="ambient-blur ambient-yellow w-[600px] h-[600px] -bottom-40 -left-40"
                    style={{ position: "absolute" }}
                    animate={{
                        x: [0, 50, -30, 0],
                        y: [0, -30, 50, 0],
                        scale: [1, 0.92, 1.1, 1],
                    }}
                    transition={{
                        duration: 22,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                {/* Coral blur - center */}
                <motion.div
                    className="ambient-blur ambient-coral w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ position: "absolute" }}
                    animate={{
                        scale: [1, 1.15, 0.9, 1],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative p-6 md:p-16 lg:p-20 rounded-3xl max-w-4xl w-full overflow-hidden"
                style={{
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    background: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.9)",
                    boxShadow: "0 8px 32px rgba(13, 148, 136, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                }}
            >
                {/* Shimmer Effect */}
                <div
                    className="absolute inset-0 -translate-x-[100%] animate-[shimmer_3s_infinite] pointer-events-none"
                    style={{
                        background: "linear-gradient(to right, transparent, rgba(13, 148, 136, 0.08), transparent)",
                    }}
                />

                <motion.h1
                    className="text-4xl sm:text-6xl md:text-8xl font-serif font-bold mb-4 md:mb-6 tracking-tight"
                    style={{ color: "#1E293B" }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    Give Haven
                </motion.h1>

                <motion.p
                    className="text-lg md:text-2xl font-sans max-w-2xl mx-auto mb-10 leading-relaxed font-semibold"
                    style={{ color: "#1E293B" }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    Make your kindness count where it matters most.
                    <br />
                    <span
                        className="text-sm md:text-lg font-normal block mt-2"
                        style={{ color: "#64748B" }}
                    >
                        Transparency, dignity, and impact in every donation.
                    </span>
                </motion.p>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    <button
                        onClick={onJoinClick}
                        className="group relative px-8 py-4 font-bold rounded-full text-lg overflow-hidden transition-all hover:scale-105 active:scale-95"
                        style={{
                            backgroundColor: "#F97316",
                            color: "white",
                            boxShadow: "0 4px 14px rgba(249, 115, 22, 0.4)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#EA580C";
                            e.currentTarget.style.boxShadow = "0 6px 20px rgba(249, 115, 22, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#F97316";
                            e.currentTarget.style.boxShadow = "0 4px 14px rgba(249, 115, 22, 0.4)";
                        }}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Join the Movement <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                </motion.div>
            </motion.div>
        </section>
    );
}
