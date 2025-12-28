"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    MessageCircle,
    Gift,
    User,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import {
    getCurrentUser,
    signOut,
    getMyProfile,
    getDonorUnreadCount,
    type Profile,
} from "@/lib/supabase";

const navItems = [
    { href: "/explore", label: "Explore", icon: Search, showBadge: false },
    { href: "/donor/chat", label: "My Chats", icon: MessageCircle, showBadge: true },
    { href: "/donor/pledges", label: "My Pledges", icon: Gift, showBadge: false },
];

export default function DonorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadProfile = useCallback(async () => {
        try {
            const user = await getCurrentUser();
            if (!user) {
                router.push("/login?redirect=/donor/chat");
                return;
            }
            setUserEmail(user.email || null);
            setAvatarUrl(user.user_metadata?.avatar_url || user.user_metadata?.picture || null);

            const profileData = await getMyProfile();
            setProfile(profileData);
        } catch (error) {
            console.error("Failed to load profile:", error);
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    const loadUnreadCount = useCallback(async () => {
        try {
            const count = await getDonorUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error("Failed to load unread count:", error);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    useEffect(() => {
        loadUnreadCount();
        // Refresh count every 30 seconds
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [loadUnreadCount]);

    // Refresh unread count when path changes (e.g., after viewing messages)
    useEffect(() => {
        loadUnreadCount();
    }, [pathname, loadUnreadCount]);

    async function handleSignOut() {
        await signOut();
        router.push("/app");
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F8FAFC" }}>
                <div
                    className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
                    style={{ borderColor: "#0D9488", borderTopColor: "transparent" }}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex overflow-x-hidden" style={{ backgroundColor: "#F8FAFC" }}>
            {/* Desktop Sidebar */}
            <aside
                className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-30"
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    borderRight: "1px solid rgba(13, 148, 136, 0.1)",
                }}
            >
                {/* Logo */}
                <div className="p-6">
                    <Link href="/app" className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }}
                        >
                            <Gift size={22} style={{ color: "#0D9488" }} />
                        </div>
                        <span className="font-bold text-xl" style={{ color: "#1E293B" }}>
                            GiveHaven
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        const badgeCount = item.showBadge ? unreadCount : 0;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all"
                                style={{
                                    backgroundColor: isActive ? "rgba(13, 148, 136, 0.1)" : "transparent",
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
                                            backgroundColor: "#EF4444",
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

                {/* User Profile Section */}
                <div className="p-4 border-t" style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}>
                    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "rgba(13, 148, 136, 0.05)" }}>
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: "rgba(13, 148, 136, 0.15)" }}
                        >
                            {(profile?.avatar_url || avatarUrl) ? (
                                <Image
                                    src={profile?.avatar_url || avatarUrl || ""}
                                    alt="Profile"
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                    unoptimized
                                />
                            ) : null}
                            <User size={18} style={{ color: "#0D9488" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate" style={{ color: "#1E293B" }}>
                                {profile?.display_name || userEmail?.split("@")[0] || "Donor"}
                            </p>
                            <p className="text-xs truncate" style={{ color: "#64748B" }}>
                                {userEmail}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 mt-2 rounded-xl text-sm font-medium transition-all hover:bg-red-50"
                        style={{ color: "#EF4444" }}
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header
                className="md:hidden fixed top-0 left-0 right-0 z-40"
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid rgba(13, 148, 136, 0.1)",
                }}
            >
                <div className="flex items-center justify-between px-4 h-16">
                    <Link href="/app" className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }}
                        >
                            <Gift size={18} style={{ color: "#0D9488" }} />
                        </div>
                        <span className="font-bold text-lg" style={{ color: "#1E293B" }}>
                            GiveHaven
                        </span>
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-lg"
                        style={{ color: "#64748B" }}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
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
                            style={{
                                backgroundColor: "white",
                            }}
                        >
                            {/* Mobile Menu Content */}
                            <div className="flex flex-col h-full">
                                <div className="p-4 border-b" style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}>
                                    <div className="flex items-center justify-between">
                                        <Link href="/app" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Gift size={24} style={{ color: "#0D9488" }} />
                                            <span className="font-bold text-lg" style={{ color: "#1E293B" }}>GiveHaven</span>
                                        </Link>
                                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2" aria-label="Close menu">
                                            <X size={24} style={{ color: "#64748B" }} />
                                        </button>
                                    </div>
                                </div>

                                <nav className="flex-1 p-4 space-y-2">
                                    {navItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                                        const badgeCount = item.showBadge ? unreadCount : 0;
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
                                                            backgroundColor: "#EF4444",
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

                                <div className="p-4 border-t" style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}>
                                    <div className="flex items-center gap-3 p-3 rounded-xl mb-2" style={{ backgroundColor: "rgba(13, 148, 136, 0.05)" }}>
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                                            style={{ backgroundColor: "rgba(13, 148, 136, 0.15)" }}
                                        >
                                            {(profile?.avatar_url || avatarUrl) ? (
                                                <Image
                                                    src={profile?.avatar_url || avatarUrl || ""}
                                                    alt="Profile"
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover"
                                                    unoptimized
                                                />
                                            ) : null}
                                            <User size={18} style={{ color: "#0D9488" }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate" style={{ color: "#1E293B" }}>
                                                {profile?.display_name || "Donor"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-red-50"
                                        style={{ color: "#EF4444" }}
                                    >
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 overflow-x-hidden">
                <div className="pt-16 md:pt-0 min-h-screen overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}
