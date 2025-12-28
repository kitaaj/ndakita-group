"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/constants/Logo";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronUp } from "lucide-react";
import { getCurrentUser, signInWithGoogle, getMyProfile } from "@/lib/supabase";
import DevModeBanner from "@/components/DevModeBanner";

const navLinks = [
    { href: "/explore", label: "Explore" },
    { href: "/impact", label: "Impact" },
    { href: "/about", label: "About" },
    { href: "/partner", label: "Get Involved" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<"admin" | "home" | "donor" | null>(null);
    const [isHomeOwner, setIsHomeOwner] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            try {
                const user = await getCurrentUser();
                setIsAuthenticated(!!user);

                if (user) {
                    const profile = await getMyProfile();
                    if (profile) {
                        if (profile.is_super_admin) {
                            setUserRole("admin");
                        } else {
                            setUserRole(profile.role);
                        }
                        setIsHomeOwner(profile.is_home_owner || false);
                    }
                }
            } catch {
                setIsAuthenticated(false);
                setUserRole(null);
                setIsHomeOwner(false);
            }
        }
        checkAuth();
    }, []);

    useEffect(() => {
        function handleScroll() {
            setIsScrolled(window.scrollY > 20);
            setShowScrollTop(window.scrollY > 400);
        }
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const isDarkPage = pathname === "/explore";
    // When transparent (not scrolled) on a dark page, use white text. Otherwise, follow default scroll logic.
    const isTransparentOnDark = !isScrolled && isDarkPage;

    // Text colors
    const brandColor = isTransparentOnDark ? "#FFFFFF" : "#1E293B"; // White or Slate-800
    const linkColorDefault = isTransparentOnDark ? "rgba(255, 255, 255, 0.7)" : "#64748B"; // White/70% or Slate-500
    const linkColorActive = isTransparentOnDark ? "#FFFFFF" : "#0D9488"; // White or Teal-600
    const mobileMenuColor = isTransparentOnDark ? "#FFFFFF" : "#1E293B";

    return (
        <>
            {/* Navbar */}
            <motion.nav
                className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
                style={{
                    backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.95)" : "transparent",
                    backdropFilter: isScrolled ? "blur(20px)" : "none",
                    borderBottom: isScrolled ? "1px solid rgba(13, 148, 136, 0.1)" : "none",
                }}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <DevModeBanner />
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <Link href="/app" className="flex items-center gap-2">
                            <Logo
                                size={40}
                                variant={isTransparentOnDark ? "light" : "dark"}
                                className="w-8 h-8 md:w-10 md:h-10"
                            />
                            <span
                                className="text-lg md:text-xl font-bold transition-colors duration-300"
                                style={{ color: brandColor }}
                            >
                                GiveHaven
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm font-medium transition-colors duration-300"
                                    style={{
                                        color: pathname === link.href ? linkColorActive : linkColorDefault,
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Desktop Auth Buttons */}
                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                href="/register-home"
                                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors border-2"
                                style={{
                                    color: isTransparentOnDark ? "#FFFFFF" : "#0D9488",
                                    borderColor: isTransparentOnDark ? "rgba(255,255,255,0.3)" : "transparent",
                                    backgroundColor: "transparent"
                                }}
                            >
                                Register Home
                            </Link>
                            {isAuthenticated ? (
                                <div className="flex items-center gap-2">
                                    {/* Show Home Dashboard if user is a home owner */}
                                    {isHomeOwner && userRole !== "admin" && (
                                        <Link
                                            href="/home"
                                            className="px-3 py-2 text-sm font-medium rounded-lg transition-all border"
                                            style={{
                                                color: isTransparentOnDark ? "#FFFFFF" : "#0D9488",
                                                borderColor: isTransparentOnDark ? "rgba(255,255,255,0.3)" : "rgba(13, 148, 136, 0.3)",
                                                backgroundColor: "transparent"
                                            }}
                                        >
                                            Home Dashboard
                                        </Link>
                                    )}
                                    {/* Main Dashboard button */}
                                    <Link
                                        href={
                                            userRole === "admin"
                                                ? "/admin"
                                                : "/donor/pledges"
                                        }
                                        className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90"
                                        style={{ backgroundColor: isTransparentOnDark ? "#FFFFFF" : "#0D9488", color: isTransparentOnDark ? "#0D9488" : "#FFFFFF" }}
                                    >
                                        {userRole === "admin" ? "Admin" : "My Pledges"}
                                    </Link>
                                </div>
                            ) : (
                                <button
                                    onClick={() => signInWithGoogle()}
                                    className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90"
                                    style={{ backgroundColor: isTransparentOnDark ? "#FFFFFF" : "#0D9488", color: isTransparentOnDark ? "#0D9488" : "#FFFFFF" }}
                                >
                                    Sign In
                                </button>
                            )}
                        </div>

                        {/* Mobile Menu Button (Right Side) */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg transition-colors"
                            style={{ color: mobileMenuColor }}
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 bg-black/30 z-40 md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                        />

                        {/* Drawer (slides from right) */}
                        <motion.div
                            className="fixed top-0 right-0 bottom-0 w-72 z-50 md:hidden"
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                backdropFilter: "blur(20px)",
                            }}
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        >
                            {/* Close button */}
                            <div className="flex justify-end p-4">
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 rounded-lg"
                                    style={{ color: "#64748B" }}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Nav Links */}
                            <div className="px-6 space-y-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block py-3 text-base font-medium border-b transition-colors"
                                        style={{
                                            color: pathname === link.href ? "#0D9488" : "#1E293B",
                                            borderColor: "rgba(13, 148, 136, 0.1)",
                                        }}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>

                            {/* Mobile Auth Buttons */}
                            <div className="px-6 mt-6 space-y-3">
                                <Link
                                    href="/register-home"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block w-full py-3 text-center text-sm font-medium rounded-lg border transition-colors"
                                    style={{
                                        color: "#0D9488",
                                        borderColor: "#0D9488",
                                    }}
                                >
                                    Register Your Home
                                </Link>
                                {isAuthenticated ? (
                                    <Link
                                        href={
                                            userRole === "admin"
                                                ? "/admin"
                                                : userRole === "home"
                                                    ? "/home"
                                                    : "/donor/pledges"
                                        }
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block w-full py-3 text-center text-sm font-medium text-white rounded-lg"
                                        style={{ backgroundColor: "#0D9488" }}
                                    >
                                        My Dashboard
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            signInWithGoogle();
                                        }}
                                        className="block w-full py-3 text-center text-sm font-medium text-white rounded-lg"
                                        style={{ backgroundColor: "#0D9488" }}
                                    >
                                        Sign In
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Scroll to Top Button */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        onClick={scrollToTop}
                        className="fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg transition-colors"
                        style={{
                            backgroundColor: "#0D9488",
                            boxShadow: "0 4px 20px rgba(13, 148, 136, 0.3)",
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Scroll to top"
                    >
                        <ChevronUp size={24} className="text-white" />
                    </motion.button>
                )}
            </AnimatePresence>
        </>
    );
}
