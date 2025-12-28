"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Shield } from "lucide-react";
import Link from "next/link";

const CONSENT_KEY = "givehaven-cookie-consent";

type ConsentType = "all" | "essential" | null;

export default function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem(CONSENT_KEY);
        if (!consent) {
            // Small delay for better UX
            const timer = setTimeout(() => setShowBanner(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleConsent = (type: ConsentType) => {
        setIsClosing(true);
        localStorage.setItem(CONSENT_KEY, type || "essential");

        // Allow animation to complete
        setTimeout(() => {
            setShowBanner(false);
            setIsClosing(false);
        }, 300);
    };

    if (!showBanner) return null;

    return (
        <AnimatePresence>
            {!isClosing && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
                >
                    <div
                        className="max-w-4xl mx-auto rounded-2xl border p-6 md:p-8 shadow-2xl"
                        style={{
                            background: "rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(20px)",
                            borderColor: "rgba(13, 148, 136, 0.2)",
                            boxShadow: "0 -4px 30px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => handleConsent("essential")}
                            className="absolute top-4 right-4 p-2 rounded-full transition-colors hover:bg-gray-100"
                            aria-label="Close"
                        >
                            <X size={18} style={{ color: "#64748B" }} />
                        </button>

                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                            {/* Icon and Text */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }}
                                    >
                                        <Cookie size={20} style={{ color: "#0D9488" }} />
                                    </div>
                                    <h3 className="text-lg font-bold" style={{ color: "#1E293B" }}>
                                        We value your privacy
                                    </h3>
                                </div>
                                <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
                                    We use cookies to enhance your browsing experience, provide personalized content,
                                    and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
                                    Read our{" "}
                                    <Link
                                        href="/privacy"
                                        className="font-medium underline underline-offset-2 transition-colors hover:text-teal-600"
                                        style={{ color: "#0D9488" }}
                                    >
                                        Privacy Policy
                                    </Link>{" "}
                                    to learn more.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => handleConsent("essential")}
                                    className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-gray-50"
                                    style={{
                                        borderColor: "rgba(13, 148, 136, 0.3)",
                                        color: "#64748B",
                                    }}
                                >
                                    Essential Only
                                </button>
                                <button
                                    onClick={() => handleConsent("all")}
                                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                                    style={{ backgroundColor: "#0D9488" }}
                                >
                                    <Shield size={16} />
                                    Accept All
                                </button>
                            </div>
                        </div>

                        {/* Security badge */}
                        <div className="mt-4 pt-4 border-t flex items-center gap-2" style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}>
                            <div
                                className="w-5 h-5 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
                            >
                                <Shield size={12} style={{ color: "#22C55E" }} />
                            </div>
                            <span className="text-xs" style={{ color: "#94A3B8" }}>
                                Protected by Cloudflare • Your data is secure
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
