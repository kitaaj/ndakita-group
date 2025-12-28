"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function TermsPage() {
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
                    Terms of Service
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
                                Agreement to Terms
                            </h2>
                            <p className="text-base leading-relaxed" style={{ color: "#64748B" }}>
                                By accessing or using GiveHaven, you agree to be bound by these Terms of Service.
                                If you disagree with any part of these terms, you may not access the platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                Platform Description
                            </h2>
                            <p className="text-base leading-relaxed" style={{ color: "#64748B" }}>
                                GiveHaven is a platform that connects donors with verified children&apos;s homes.
                                We facilitate the pledging and donation of items that homes have identified as needs.
                                GiveHaven does not handle monetary transactions or physical items directly.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                User Accounts
                            </h2>
                            <ul className="list-disc list-inside space-y-2 text-base" style={{ color: "#64748B" }}>
                                <li>You must provide accurate and complete information when creating an account</li>
                                <li>You are responsible for maintaining the security of your account</li>
                                <li>You must notify us immediately of any unauthorized use</li>
                                <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                For Donors
                            </h2>
                            <ul className="list-disc list-inside space-y-2 text-base" style={{ color: "#64748B" }}>
                                <li>Pledges are commitments to donate items to children&apos;s homes</li>
                                <li>You agree to fulfill pledges in good faith and in a timely manner</li>
                                <li>Donated items should be in good condition and as described</li>
                                <li>Communication with homes should be respectful and appropriate</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                For Children&apos;s Homes
                            </h2>
                            <ul className="list-disc list-inside space-y-2 text-base" style={{ color: "#64748B" }}>
                                <li>You must be a legitimate, registered children&apos;s home or orphanage</li>
                                <li>All information provided must be accurate and verifiable</li>
                                <li>Needs posted should be genuine and for the benefit of children</li>
                                <li>You agree to receive and acknowledge donations appropriately</li>
                                <li>Regular updates on the status of needs are encouraged</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                Verification Process
                            </h2>
                            <p className="text-base leading-relaxed" style={{ color: "#64748B" }}>
                                All children&apos;s homes must undergo a verification process before being
                                listed on our platform. We reserve the right to request additional
                                documentation and to reject or remove homes that do not meet our standards.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                Prohibited Conduct
                            </h2>
                            <ul className="list-disc list-inside space-y-2 text-base" style={{ color: "#64748B" }}>
                                <li>Using the platform for fraudulent or deceptive purposes</li>
                                <li>Posting false or misleading information</li>
                                <li>Harassing or abusing other users</li>
                                <li>Attempting to circumvent platform security</li>
                                <li>Using the platform for any illegal activities</li>
                                <li>Using automated tools, bots, or scrapers to access the platform</li>
                                <li>Attempting to bypass security measures including bot protection</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                Cookies &amp; Data Usage
                            </h2>
                            <p className="text-base leading-relaxed mb-4" style={{ color: "#64748B" }}>
                                By using GiveHaven, you agree to:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-base" style={{ color: "#64748B" }}>
                                <li>The use of essential cookies required for platform functionality</li>
                                <li>Storage of your preferences and consent choices in your browser</li>
                                <li>Data processing as described in our Privacy Policy</li>
                            </ul>
                            <p className="text-base leading-relaxed mt-4" style={{ color: "#64748B" }}>
                                You may manage optional cookies through our cookie consent interface.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                Automated Verification
                            </h2>
                            <p className="text-base leading-relaxed" style={{ color: "#64748B" }}>
                                We use Cloudflare Turnstile and other security measures to protect our platform
                                from automated abuse and bots. By using our forms and interactive features, you
                                consent to this automated verification process. This helps ensure the security
                                and integrity of our platform for all users.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                Service Providers
                            </h2>
                            <p className="text-base leading-relaxed mb-4" style={{ color: "#64748B" }}>
                                We use trusted third-party services to operate our platform:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-base" style={{ color: "#64748B" }}>
                                <li><strong>Cloudflare:</strong> Security, performance optimization, and bot protection</li>
                                <li><strong>Supabase:</strong> Database and authentication services</li>
                                <li><strong>Netlify:</strong> Hosting and content delivery</li>
                                <li><strong>Google:</strong> Authentication services</li>
                            </ul>
                            <p className="text-base leading-relaxed mt-4" style={{ color: "#64748B" }}>
                                Your use of our platform is also subject to the terms of service of these providers.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                Limitation of Liability
                            </h2>
                            <p className="text-base leading-relaxed" style={{ color: "#64748B" }}>
                                GiveHaven serves as a connecting platform and is not responsible for the
                                actions of donors or homes. We do not guarantee the delivery, quality,
                                or condition of donated items. Users interact at their own discretion.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                Changes to Terms
                            </h2>
                            <p className="text-base leading-relaxed" style={{ color: "#64748B" }}>
                                We reserve the right to modify these terms at any time. Continued use of
                                the platform after changes constitutes acceptance of the new terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
                                Contact Us
                            </h2>
                            <p className="text-base leading-relaxed" style={{ color: "#64748B" }}>
                                If you have questions about these Terms of Service, please contact us through
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
