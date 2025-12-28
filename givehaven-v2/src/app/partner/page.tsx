"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Heart, Users, Mail, MessageSquare, Send, CheckCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PartnerPage() {
    const [contactForm, setContactForm] = useState({ name: "", email: "", organization: "", message: "" });
    const [feedbackForm, setFeedbackForm] = useState({ name: "", email: "", feedback: "" });
    const [contactSubmitted, setContactSubmitted] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [contactLoading, setContactLoading] = useState(false);
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setContactLoading(true);
        try {
            const formId = process.env.NEXT_PUBLIC_PARTNER_FORM_ID;
            if (!formId) {
                alert("Configuration Error: Form ID missing.");
                return;
            }
            const response = await fetch(`https://formspree.io/f/${formId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({ ...contactForm, type: "partnership_inquiry" })
            });
            if (response.ok) {
                setContactSubmitted(true);
                setContactForm({ name: "", email: "", organization: "", message: "" });
            }
        } catch {
            alert("Error submitting form. Please try again.");
        } finally {
            setContactLoading(false);
        }
    };

    const handleFeedbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedbackLoading(true);
        try {
            const formId = process.env.NEXT_PUBLIC_PARTNER_FORM_ID;
            if (!formId) {
                alert("Configuration Error: Form ID missing.");
                return;
            }
            const response = await fetch(`https://formspree.io/f/${formId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({ ...feedbackForm, type: "feedback" })
            });
            if (response.ok) {
                setFeedbackSubmitted(true);
                setFeedbackForm({ name: "", email: "", feedback: "" });
            }
        } catch {
            alert("Error submitting feedback. Please try again.");
        } finally {
            setFeedbackLoading(false);
        }
    };

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
                    Get Involved
                </motion.h1>
                <motion.p
                    className="text-lg md:text-xl max-w-2xl mx-auto"
                    style={{ color: "#64748B" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    Join us in making a difference. Whether you&apos;re a business,
                    organization, or individual — there&apos;s a way to partner.
                </motion.p>
            </div>

            {/* Partnership Types */}
            <div className="max-w-4xl mx-auto px-4 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: Building2,
                            title: "Corporate Partners",
                            desc: "Sponsor needs, organize drives, or provide matching donations.",
                        },
                        {
                            icon: Users,
                            title: "NGOs & Charities",
                            desc: "Collaborate to extend our reach and support more homes.",
                        },
                        {
                            icon: Heart,
                            title: "Volunteers",
                            desc: "Help with verification, logistics, or platform development.",
                        },
                    ].map((type, index) => (
                        <motion.div
                            key={type.title}
                            className="rounded-xl p-6 text-center"
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.8)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid rgba(13, 148, 136, 0.1)",
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                        >
                            <div
                                className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4"
                                style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }}
                            >
                                <type.icon size={28} style={{ color: "#0D9488" }} />
                            </div>
                            <h3
                                className="font-semibold mb-2"
                                style={{ color: "#1E293B" }}
                            >
                                {type.title}
                            </h3>
                            <p
                                className="text-sm"
                                style={{ color: "#64748B" }}
                            >
                                {type.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Form Cards */}
            <div className="max-w-5xl mx-auto px-4 pb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Get In Touch Card */}
                    <motion.div
                        className="rounded-2xl p-8"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(13, 148, 136, 0.1)",
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                            style={{ backgroundColor: "rgba(249, 115, 22, 0.1)" }}
                        >
                            <Mail size={28} style={{ color: "#F97316" }} />
                        </div>
                        <h2
                            className="text-xl font-bold mb-2"
                            style={{ color: "#1E293B" }}
                        >
                            Get In Touch
                        </h2>
                        <p
                            className="text-sm mb-6"
                            style={{ color: "#64748B" }}
                        >
                            Interested in partnering? Let us know how we can work together.
                        </p>

                        {contactSubmitted ? (
                            <div className="text-center py-8">
                                <CheckCircle size={48} style={{ color: "#10B981" }} className="mx-auto mb-4" />
                                <p className="font-semibold" style={{ color: "#1E293B" }}>Thank you!</p>
                                <p className="text-sm" style={{ color: "#64748B" }}>We&apos;ll get back to you soon.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleContactSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    required
                                    value={contactForm.name}
                                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    style={{ borderColor: "rgba(13, 148, 136, 0.2)" }}
                                />
                                <input
                                    type="email"
                                    placeholder="Your Email"
                                    required
                                    value={contactForm.email}
                                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    style={{ borderColor: "rgba(13, 148, 136, 0.2)" }}
                                />
                                <input
                                    type="text"
                                    placeholder="Organization (optional)"
                                    value={contactForm.organization}
                                    onChange={(e) => setContactForm({ ...contactForm, organization: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    style={{ borderColor: "rgba(13, 148, 136, 0.2)" }}
                                />
                                <textarea
                                    placeholder="How would you like to partner?"
                                    required
                                    rows={3}
                                    value={contactForm.message}
                                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                                    style={{ borderColor: "rgba(13, 148, 136, 0.2)" }}
                                />
                                <button
                                    type="submit"
                                    disabled={contactLoading}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
                                    style={{ backgroundColor: "#0D9488" }}
                                >
                                    {contactLoading ? "Sending..." : <>Send Message <Send size={16} /></>}
                                </button>
                            </form>
                        )}
                    </motion.div>

                    {/* Feedback Card */}
                    <motion.div
                        className="rounded-2xl p-8"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(13, 148, 136, 0.1)",
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                            style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                        >
                            <MessageSquare size={28} style={{ color: "#3B82F6" }} />
                        </div>
                        <h2
                            className="text-xl font-bold mb-2"
                            style={{ color: "#1E293B" }}
                        >
                            Share Your Feedback
                        </h2>
                        <p
                            className="text-sm mb-6"
                            style={{ color: "#64748B" }}
                        >
                            Have suggestions or ideas? We&apos;d love to hear from you!
                        </p>

                        {feedbackSubmitted ? (
                            <div className="text-center py-8">
                                <CheckCircle size={48} style={{ color: "#10B981" }} className="mx-auto mb-4" />
                                <p className="font-semibold" style={{ color: "#1E293B" }}>Feedback received!</p>
                                <p className="text-sm" style={{ color: "#64748B" }}>Thank you for helping us improve.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Your Name (optional)"
                                    value={feedbackForm.name}
                                    onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ borderColor: "rgba(59, 130, 246, 0.2)" }}
                                />
                                <input
                                    type="email"
                                    placeholder="Your Email (optional)"
                                    value={feedbackForm.email}
                                    onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ borderColor: "rgba(59, 130, 246, 0.2)" }}
                                />
                                <textarea
                                    placeholder="Share your thoughts, suggestions, or feedback..."
                                    required
                                    rows={4}
                                    value={feedbackForm.feedback}
                                    onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    style={{ borderColor: "rgba(59, 130, 246, 0.2)" }}
                                />
                                <button
                                    type="submit"
                                    disabled={feedbackLoading}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
                                    style={{ backgroundColor: "#3B82F6" }}
                                >
                                    {feedbackLoading ? "Sending..." : <>Submit Feedback <Send size={16} /></>}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

