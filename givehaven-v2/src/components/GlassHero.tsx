"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface GlassHeroProps {
    onJoinClick?: () => void;
}

export default function GlassHero({ onJoinClick }: GlassHeroProps) {
    return (
        <section className="relative z-10 min-h-screen flex flex-col items-center justify-center bg-brand-pink-deep/30 text-center px-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative p-6 md:p-20 rounded-3xl max-w-4xl w-full border border-white/20 shadow-2xl backdrop-blur-xl overflow-hidden bg-brand-pink-deep"
            >
                {/* Shimmer Effect - darker to match */}
                <div className="absolute inset-0 -translate-x-[100%] animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                <motion.h1
                    className="text-4xl sm:text-6xl md:text-8xl font-serif font-bold text-gradient mb-4 md:mb-6 tracking-tight"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    Give Haven
                </motion.h1>

                <motion.p
                    className="text-lg md:text-2xl font-sans text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed font-semibold drop-shadow-sm"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    Make your kindness count where it matters most.
                    <br />
                    <span className="text-sm md:text-lg font-normal text-white/75 block mt-2">
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
                        className="group relative px-8 py-4 bg-brand-dark text-black font-bold rounded-full text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-white/50"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Join the Movement <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                </motion.div>
            </motion.div>
        </section>
    );
}
