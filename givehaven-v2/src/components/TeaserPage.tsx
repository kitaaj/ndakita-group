"use client";

import { motion } from "framer-motion";

interface TeaserPageProps {
    onEnter: () => void;
}

export default function TeaserPage({ onEnter }: TeaserPageProps) {
    return (
        <motion.div
            className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
            style={{ backgroundColor: "#F5D6D0" }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
        >
            {/* Logo Container */}
            <motion.div
                className="w-[90%] max-w-[900px] text-center select-none"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
            >
                {/* Brand Text */}
                <h1
                    className="text-6xl md:text-8xl font-black tracking-tight"
                    style={{
                        fontFamily: "'Poppins', sans-serif",
                        color: "#1a1a1a",
                        letterSpacing: "-2px",
                    }}
                >
                    Ndakita Group
                </h1>

                {/* Slogan */}
                <motion.p
                    className="text-sm md:text-base font-bold uppercase tracking-[0.3em] opacity-60 mt-2"
                    style={{
                        fontFamily: "'Poppins', sans-serif",
                        color: "#1a1a1a",
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.6, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    Build. Grow. Give.
                </motion.p>

                {/* What's Cooking Button */}
                <motion.button
                    onClick={onEnter}
                    className="mt-10 px-8 py-4 border-2 border-[#1a1a1a] font-bold uppercase tracking-[0.2em] text-sm transition-all duration-300 hover:bg-[#1a1a1a] hover:text-[#F5D6D0] active:scale-95"
                    style={{
                        fontFamily: "'Poppins', sans-serif",
                        color: "#1a1a1a",
                        backgroundColor: "transparent",
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    whileHover={{ scale: 1.02 }}
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
                    color: "rgba(0, 0, 0, 0.3)",
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
