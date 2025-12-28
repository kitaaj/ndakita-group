"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PrivacyPage() {
    return (
        <div
            className="min-h-screen"
            style={{ backgroundColor: "#F8FAFC" }}
        >
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
                <motion.h1
                    className="text-4xl md:text-5xl font-bold mb-4 text-center"
                    style={{ color: "#1E293B" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Privacy Policy
                </motion.h1>
                <motion.p
                    className="text-center text-sm mb-12"
                    style={{ color: "#94A3B8" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    Last updated: December 2025
                </motion.p>

                <motion.div
                    className="prose prose-slate max-w-none"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div
                        className="rounded-2xl p-8 md:p-12 space-y-8"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(13, 148, 136, 0.1)",
                        }}
                    >
                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                Introduction
                            </h2>
                            <p className="text-base leading-relaxed" style={{ color: "#64748B" }}>
                                GiveHaven (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
                                This Privacy Policy explains how we collect, use, disclose, and safeguard your
                                information when you use our platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                Information We Collect
                            </h2>
                            <p className="text-base leading-relaxed mb-4" style={{ color: "#64748B" }}>
                                We collect information you provide directly to us, including:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-base" style={{ color: "#64748B" }}>
                                <li>Account information (name, email address, profile photo)</li>
                                <li>For children&apos;s homes: organization details, location, verification documents</li>
                                <li>Donation and pledge history</li>
                                <li>Messages and communications on our platform</li>
                                <li>Feedback and correspondence you send to us</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                How We Use Your Information
                            </h2>
                            <ul className="list-disc list-inside space-y-2 text-base" style={{ color: "#64748B" }}>
                                <li>To facilitate connections between donors and children&apos;s homes</li>
                                <li>To verify and approve children&apos;s homes on our platform</li>
                                <li>To process and track donations and pledges</li>
                                <li>To send you updates about your donations and platform activity</li>
                                <li>To improve our services and user experience</li>
                                <li>To prevent fraud and ensure platform security</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                Information Sharing
                            </h2>
                            <p className="text-base leading-relaxed" style={{ color: "#64748B" }}>
                                We do not sell your personal information. We may share your information with:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-base mt-4" style={{ color: "#64748B" }}>
                                <li>Children&apos;s homes (for donors: only your display name and donation details)</li>
                                <li>Service providers who assist in operating our platform</li>
                                <li>Legal authorities when required by law</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                Data Security
                            </h2>
                            <p className="text-base leading-relaxed" style={{ color: "#64748B" }}>
                                We implement appropriate security measures to protect your personal information.
                                However, no method of transmission over the Internet is 100% secure, and we
                                cannot guarantee absolute security.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                Cookies &amp; Local Storage
                            </h2>
                            <p className="text-base leading-relaxed mb-4" style={{ color: "#64748B" }}>
                                We use cookies and local storage to enhance your experience on our platform:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-base" style={{ color: "#64748B" }}>
                                <li><strong>Essential Cookies:</strong> Required for authentication and core platform functionality</li>
                                <li><strong>Preference Cookies:</strong> Remember your settings and consent choices</li>
                                <li><strong>Security Cookies:</strong> Help protect against fraud and abuse</li>
                            </ul>
                            <p className="text-base leading-relaxed mt-4" style={{ color: "#64748B" }}>
                                You can manage your cookie preferences at any time. Essential cookies cannot be disabled
                                as they are necessary for the platform to function properly.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                Third-Party Services
                            </h2>
                            <p className="text-base leading-relaxed mb-4" style={{ color: "#64748B" }}>
                                We use trusted third-party services to operate our platform:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-base" style={{ color: "#64748B" }}>
                                <li><strong>Cloudflare:</strong> Security, performance, and bot protection (Turnstile verification)</li>
                                <li><strong>Supabase:</strong> Authentication and database services</li>
                                <li><strong>Netlify:</strong> Website hosting and deployment</li>
                                <li><strong>Google:</strong> OAuth authentication for sign-in</li>
                            </ul>
                            <p className="text-base leading-relaxed mt-4" style={{ color: "#64748B" }}>
                                These services may collect and process data according to their own privacy policies.
                                We recommend reviewing their respective privacy policies for more information.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                Data Retention
                            </h2>
                            <p className="text-base leading-relaxed" style={{ color: "#64748B" }}>
                                We retain your personal information for as long as your account is active or as needed
                                to provide our services. Cookie consent preferences are stored for 12 months. You may
                                request deletion of your data at any time by contacting us.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                International Data Transfers
                            </h2>
                            <p className="text-base leading-relaxed" style={{ color: "#64748B" }}>
                                Your data may be processed by our third-party service providers in countries outside
                                your country of residence. We ensure appropriate safeguards are in place to protect
                                your information in accordance with applicable data protection laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                Your Rights
                            </h2>
                            <p className="text-base leading-relaxed" style={{ color: "#64748B" }}>
                                You have the right to access, update, or delete your personal information.
                                You can do this through your account settings or by contacting us directly.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                Contact Us
                            </h2>
                            <p className="text-base leading-relaxed" style={{ color: "#64748B" }}>
                                If you have questions about this Privacy Policy, please contact us through
                                our <a href="/partner" className="font-medium" style={{ color: "#0D9488" }}>Get Involved</a> page.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>

            <Footer />
        </div>
    );
}
