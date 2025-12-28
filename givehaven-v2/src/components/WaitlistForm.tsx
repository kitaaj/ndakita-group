"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { useState, useCallback } from "react";
import TurnstileWidget from "./TurnstileWidget";

interface WaitlistFormProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function WaitlistForm({ isOpen, onClose }: WaitlistFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [turnstileError, setTurnstileError] = useState(false);

    const handleTurnstileVerify = useCallback((token: string) => {
        setTurnstileToken(token);
        setTurnstileError(false);
    }, []);

    const handleTurnstileError = useCallback(() => {
        setTurnstileToken(null);
        setTurnstileError(true);
    }, []);

    const handleTurnstileExpire = useCallback(() => {
        setTurnstileToken(null);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check Turnstile verification
        if (!turnstileToken) {
            setTurnstileError(true);
            return;
        }

        try {
            const formId = process.env.NEXT_PUBLIC_FORMSPREE_ID;
            if (!formId) {

                alert("Configuration Error: Form ID missing.");
                return;
            }
            const response = await fetch(`https://formspree.io/f/${formId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    ...formData,
                    "cf-turnstile-response": turnstileToken,
                })
            });

            if (response.ok) {
                setIsSubmitted(true);
                setTimeout(() => {
                    setIsSubmitted(false);
                    onClose();
                    setFormData({ name: "", email: "", message: "" });
                    setTurnstileToken(null);
                }, 3000);
            } else {
                const data = await response.json();

                if (data.errors) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    alert("Error: " + data.errors.map((e: any) => e.message).join(", "));
                }
            }
        } catch {

            alert("Network error. Please try again.");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Modal */}
                    <motion.div
                        className="relative w-full max-w-md p-6 md:p-8 rounded-3xl border border-white/30 bg-brand-pink-deep/60 shadow-2xl backdrop-blur-xl overflow-hidden"

                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>

                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 -translate-x-[100%] animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                        {isSubmitted ? (
                            <motion.div
                                className="text-center py-8"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    You&apos;re In! 🎉
                                </h3>
                                <p className="text-white/80">
                                    We&apos;ll be in touch soon.
                                </p>
                            </motion.div>
                        ) : (
                            <>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 font-serif">
                                    Join the Movement
                                </h2>
                                <p className="text-white/80 mb-6 text-sm">
                                    Be the first to know when GiveHaven launches.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Your Name"
                                            required
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                            className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="email"
                                            placeholder="Your Email"
                                            required
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({ ...formData, email: e.target.value })
                                            }
                                            className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <textarea
                                            placeholder="Let us know your thoughts (optional)..."
                                            rows={3}
                                            value={formData.message}
                                            onChange={(e) =>
                                                setFormData({ ...formData, message: e.target.value })
                                            }
                                            className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all resize-none"
                                        />
                                    </div>

                                    {/* Turnstile Widget */}
                                    <div className="flex flex-col items-center gap-2">
                                        <TurnstileWidget
                                            onVerify={handleTurnstileVerify}
                                            onError={handleTurnstileError}
                                            onExpire={handleTurnstileExpire}
                                            theme="dark"
                                        />
                                        {turnstileError && (
                                            <div className="flex items-center gap-2 text-red-300 text-sm">
                                                <AlertCircle size={14} />
                                                <span>Please complete the verification</span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!turnstileToken}
                                        className="w-full py-4 bg-white text-brand-pink-deep font-bold rounded-xl text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        Count Me In!
                                    </button>
                                </form>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
