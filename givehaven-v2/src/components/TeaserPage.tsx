"use client";

import { motion } from "framer-motion";

interface TeaserPageProps {
    onEnter: () => void;
}

export default function TeaserPage({ onEnter }: TeaserPageProps) {
    return (
        <motion.div
            className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
            style={{ backgroundColor: "#F8FAFC" }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
        >
            {/* Ambient Background Blurs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Teal blur - top left */}
                <motion.div
                    className="ambient-blur ambient-teal w-[600px] h-[600px] -top-40 -left-40"
                    style={{ position: "absolute" }}
                    animate={{
                        x: [0, 50, -30, 0],
                        y: [0, -30, 40, 0],
                        scale: [1, 1.1, 0.9, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                {/* Yellow blur - bottom right */}
                <motion.div
                    className="ambient-blur ambient-yellow w-[500px] h-[500px] -bottom-32 -right-32"
                    style={{ position: "absolute" }}
                    animate={{
                        x: [0, -40, 30, 0],
                        y: [0, 40, -30, 0],
                        scale: [1, 0.95, 1.05, 1],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                {/* Coral blur - center right */}
                <motion.div
                    className="ambient-blur ambient-coral w-[400px] h-[400px] top-1/3 -right-20"
                    style={{ position: "absolute" }}
                    animate={{
                        x: [0, -20, 30, 0],
                        y: [0, 30, -20, 0],
                        scale: [1, 1.08, 0.92, 1],
                    }}
                    transition={{
                        duration: 22,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>

            {/* Logo Container */}
            <motion.div
                className="w-[90%] max-w-[900px] text-center select-none relative z-10"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
            >
                {/* Brand Text */}
                <h1
                    className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight px-4"
                    style={{
                        fontFamily: "'Poppins', sans-serif",
                        color: "#1E293B",
                        letterSpacing: "-2px",
                    }}
                >
                    Ndakita Group
                </h1>

                {/* Slogan */}
                <motion.p
                    className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] mt-2 px-4"
                    style={{
                        fontFamily: "'Poppins', sans-serif",
                        color: "#64748B",
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    Build. Grow. Give.
                </motion.p>

                {/* What's Cooking Button */}
                <motion.button
                    onClick={onEnter}
                    className="mt-8 md:mt-10 px-6 py-3 md:px-8 md:py-4 border-2 font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] text-xs md:text-sm transition-all duration-300 rounded-lg"
                    style={{
                        fontFamily: "'Poppins', sans-serif",
                        color: "#0D9488",
                        borderColor: "#0D9488",
                        backgroundColor: "transparent",
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    whileHover={{
                        scale: 1.02,
                        backgroundColor: "#0D9488",
                        color: "#ffffff",
                    }}
                    whileTap={{ scale: 0.98 }}
                >
                    What&apos;s Cooking!
                </motion.button>
            </motion.div>

            {/* Footer */}
            <motion.footer
                className="absolute bottom-12 text-xs font-bold uppercase tracking-[0.4em]"
                style={{
                    fontFamily: "'Poppins', sans-serif",
                    color: "#94A3B8",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
            >
                © 2025 NDAKITA GROUP
            </motion.footer>
        </motion.div>
    );
}
