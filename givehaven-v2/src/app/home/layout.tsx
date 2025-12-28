"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    User,
    Package,
    MessageCircle,
    LogOut,
    Home,
    BadgeCheck,
    Menu,
    X,
} from "lucide-react";
import HomeSidebar from "@/components/home/HomeSidebar";
import VerificationBanner from "@/components/home/VerificationBanner";
import { getCurrentSession, signOut, getMyHome, getHomeUnreadCount, getHomePendingPledgesCount, type Home as HomeType } from "@/lib/supabase";

const navItems = [
    { href: "/home", icon: LayoutDashboard, label: "Dashboard", badgeKey: null },
    { href: "/home/profile", icon: User, label: "Profile", badgeKey: null },
    { href: "/home/needs", icon: Package, label: "My Needs", badgeKey: "pledges" },
    { href: "/home/messages", icon: MessageCircle, label: "Messages", badgeKey: "messages" },
];

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [home, setHome] = useState<HomeType | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pendingPledgesCount, setPendingPledgesCount] = useState(0);

    useEffect(() => {
        async function checkAuth() {
            try {
                const session = await getCurrentSession();

                if (!session) {
                    router.push("/login");
                    return;
                }

                // Check if user has a home profile
                const homeData = await getMyHome();

                if (!homeData) {
                    router.push("/register-home");
                    return;
                }

                if (!homeData.verified && homeData.verification_status !== "approved") {
                    // Could redirect to a "pending" page, but for now just show layout with pending banner
                    // setPendingVerification(true);
                }

                setHome(homeData);
                setIsAuthorized(true);
            } catch (error) {
                console.error("Auth check failed:", error);
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        }

        checkAuth();
    }, [router]);

    useEffect(() => {
        async function loadCounts() {
            try {
                const [unread, pledges] = await Promise.all([
                    getHomeUnreadCount(),
                    getHomePendingPledgesCount(),
                ]);
                setUnreadCount(unread);
                setPendingPledgesCount(pledges);
            } catch (error) {
                console.error("Failed to load counts:", error);
            }
        }

        if (isAuthorized) {
            loadCounts();
            const interval = setInterval(loadCounts, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthorized, pathname]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/app");
    };

    const getBadgeCount = (badgeKey: string | null) => {
        if (badgeKey === "messages") return unreadCount;
        if (badgeKey === "pledges") return pendingPledgesCount;
        return 0;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F8FAFC" }}>
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
                        style={{ borderColor: "#0D9488", borderTopColor: "transparent" }}
                    />
                    <p className="text-sm font-medium" style={{ color: "#64748B" }}>
                        Loading your dashboard...
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    const isVerified = home?.verification_status === "verified" || home?.verification_status === "approved";

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: "#F8FAFC" }}>
            {/* Desktop Sidebar - hidden on mobile */}
            <div className="hidden md:block">
                <HomeSidebar
                    onSignOut={handleSignOut}
                    homeName={home?.name}
                    logoUrl={home?.logo_url}
                    isVerified={isVerified}
                />
            </div>

            {/* Mobile Header */}
            <header
                className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-4"
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid rgba(13, 148, 136, 0.1)",
                }}
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        {home?.logo_url ? (
                            <Image
                                src={home.logo_url}
                                alt={home?.name || "Home"}
                                width={36}
                                height={36}
                                className="w-9 h-9 rounded-full object-cover"
                                unoptimized
                            />
                        ) : (
                            <div
                                className="w-9 h-9 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }}
                            >
                                <Home size={18} style={{ color: "#0D9488" }} />
                            </div>
                        )}
                        {isVerified && (
                            <div
                                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: "#0D9488" }}
                            >
                                <BadgeCheck size={12} className="text-white" fill="#0D9488" stroke="white" strokeWidth={2.5} />
                            </div>
                        )}
                    </div>
                    <span className="font-semibold text-sm" style={{ color: "#1E293B" }}>
                        {home?.name || "Home Portal"}
                    </span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg"
                    style={{ color: "#64748B" }}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="md:hidden fixed inset-0 bg-black/30 z-40"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="md:hidden fixed inset-y-0 left-0 w-72 z-50"
                            style={{ backgroundColor: "white" }}
                        >
                            <div className="flex flex-col h-full">
                                {/* Header */}
                                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}>
                                    <div className="flex items-center gap-2">
                                        <Home size={20} style={{ color: "#0D9488" }} />
                                        <span className="font-bold" style={{ color: "#1E293B" }}>Home Portal</span>
                                    </div>
                                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2" aria-label="Close menu">
                                        <X size={20} style={{ color: "#64748B" }} />
                                    </button>
                                </div>

                                {/* Navigation */}
                                <nav className="flex-1 p-4 space-y-2">
                                    {navItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = pathname === item.href ||
                                            (item.href !== "/home" && pathname.startsWith(item.href));
                                        const badgeCount = getBadgeCount(item.badgeKey);

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all"
                                                style={{
                                                    backgroundColor: isActive ? "rgba(13, 148, 136, 0.1)" : "rgba(248, 250, 252, 1)",
                                                    color: isActive ? "#0D9488" : "#64748B",
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon size={20} />
                                                    {item.label}
                                                </div>
                                                {badgeCount > 0 && (
                                                    <span
                                                        className="min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-full text-xs font-bold"
                                                        style={{
                                                            backgroundColor: item.badgeKey === "messages" ? "#EF4444" : "#F59E0B",
                                                            color: "white",
                                                        }}
                                                    >
                                                        {badgeCount > 99 ? "99+" : badgeCount}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </nav>

                                {/* Footer */}
                                <div className="p-4 border-t space-y-2" style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}>
                                    <Link
                                        href="/app"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                                        style={{ color: "#64748B", backgroundColor: "rgba(248, 250, 252, 1)" }}
                                    >
                                        <Home size={20} />
                                        Back to Site
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                                        style={{ color: "#EF4444", backgroundColor: "rgba(239, 68, 68, 0.05)" }}
                                    >
                                        <LogOut size={20} />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-4 pt-20 md:p-6 lg:p-8 md:pt-6">
                    {/* Verification Banner - only show for non-verified statuses */}
                    {home && !isVerified && (
                        <VerificationBanner
                            status={home.verification_status}
                        />
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
}
