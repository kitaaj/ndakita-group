"use client";

import Link from "next/link";
import { Logo } from "@/constants/Logo";
import { Heart } from "lucide-react";

const quickLinks = [
    { href: "/explore", label: "Explore Needs" },
    { href: "/register-home", label: "Register Your Home" },
    { href: "/about", label: "About Us" },
    { href: "/partner", label: "Get Involved" },
];

const legalLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
];

export default function Footer() {
    return (
        <footer
            className="relative overflow-hidden"
            style={{ backgroundColor: "#F8FAFC" }}
        >
            {/* Top gradient line */}
            <div
                className="h-1 w-full"
                style={{
                    background: "linear-gradient(90deg, #0D9488 0%, #F97316 50%, #0D9488 100%)",
                }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link href="/app" className="flex items-center gap-2">
                            <Logo
                                size={40}
                                variant="dark"
                                className="w-10 h-10"
                            />
                            <span
                                className="text-xl font-bold"
                                style={{ color: "#1E293B" }}
                            >
                                GiveHaven
                            </span>
                        </Link>
                        <p
                            className="text-sm leading-relaxed"
                            style={{ color: "#64748B" }}
                        >
                            Connecting Hearts to Homes. Bridging the gap between
                            those who want to give and those who need it most.
                        </p>
                        <p
                            className="text-xs font-medium"
                            style={{ color: "#94A3B8" }}
                        >
                            A project of{" "}
                            <span style={{ color: "#0D9488" }}>
                                Ndakita Group International
                            </span>
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3
                            className="text-sm font-semibold uppercase tracking-wider mb-4"
                            style={{ color: "#1E293B" }}
                        >
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm transition-colors hover:underline"
                                        style={{ color: "#64748B" }}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact / Legal */}
                    <div>
                        <h3
                            className="text-sm font-semibold uppercase tracking-wider mb-4"
                            style={{ color: "#1E293B" }}
                        >
                            Connect With Us
                        </h3>
                        <p
                            className="text-sm mb-4"
                            style={{ color: "#64748B" }}
                        >
                            Have questions, ideas, or want to partner with us?
                        </p>
                        <Link
                            href="/partner"
                            className="inline-block px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                            style={{
                                backgroundColor: "rgba(13, 148, 136, 0.1)",
                                color: "#0D9488",
                            }}
                        >
                            Connect With Us
                        </Link>

                        {/* Legal Links */}
                        <div className="mt-6 pt-4 border-t" style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}>
                            <ul className="flex gap-4">
                                {legalLinks.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-xs transition-colors hover:underline"
                                            style={{ color: "#94A3B8" }}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div
                    className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
                    style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}
                >
                    <p
                        className="text-xs"
                        style={{ color: "#94A3B8" }}
                    >
                        © {new Date().getFullYear()} GiveHaven. All rights reserved.
                    </p>
                    <p
                        className="text-xs flex items-center gap-1"
                        style={{ color: "#94A3B8" }}
                    >
                        Made with <Heart size={12} style={{ color: "#F97316" }} fill="#F97316" /> for those in need
                    </p>
                </div>
            </div>
        </footer>
    );
}
