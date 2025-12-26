"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    User,
    Package,
    MessageCircle,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Home,
    BadgeCheck,
} from "lucide-react";
import { getHomeUnreadCount, getHomePendingPledgesCount } from "@/lib/supabase";

interface HomeSidebarProps {
    onSignOut: () => void;
    homeName?: string;
    logoUrl?: string;
    isVerified?: boolean;
}

const navItems = [
    { href: "/home", icon: LayoutDashboard, label: "Dashboard", badgeKey: null },
    { href: "/home/profile", icon: User, label: "Profile", badgeKey: null },
    { href: "/home/needs", icon: Package, label: "My Needs", badgeKey: "pledges" },
    { href: "/home/messages", icon: MessageCircle, label: "Messages", badgeKey: "messages" },
];

export default function HomeSidebar({ onSignOut, homeName, logoUrl, isVerified }: HomeSidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const [unreadCount, setUnreadCount] = useState(0);
    const [pendingPledgesCount, setPendingPledgesCount] = useState(0);

    const loadCounts = useCallback(async () => {
        try {
            const [unread, pledges] = await Promise.all([
                getHomeUnreadCount(),
                getHomePendingPledgesCount(),
            ]);
            setUnreadCount(unread);
            setPendingPledgesCount(pledges);
        } catch (error) {
            console.error("Failed to load notification counts:", error);
        }
    }, []);

    useEffect(() => {
        loadCounts();
        // Refresh counts every 30 seconds
        const interval = setInterval(loadCounts, 30000);
        return () => clearInterval(interval);
    }, [loadCounts]);

    // Refresh when path changes
    useEffect(() => {
        loadCounts();
    }, [pathname, loadCounts]);

    const getBadgeCount = (badgeKey: string | null) => {
        if (badgeKey === "messages") return unreadCount;
        if (badgeKey === "pledges") return pendingPledgesCount;
        return 0;
    };

    return (
        <motion.aside
            className="h-screen flex flex-col border-r sticky top-0 self-start"
            style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                borderColor: "rgba(13, 148, 136, 0.1)",
            }}
            animate={{ width: collapsed ? 72 : 280 }}
            transition={{ duration: 0.2 }}
        >
            {/* Logo/Home Header */}
            <div className="h-20 flex items-center justify-between px-4 border-b" style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3 overflow-hidden"
                        >
                            <div className="relative">
                                {logoUrl ? (
                                    <img
                                        src={logoUrl}
                                        alt={homeName || "Home"}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }}
                                    >
                                        <Home size={20} style={{ color: "#0D9488" }} />
                                    </div>
                                )}
                                {/* Verified Badge - like Instagram/Twitter */}
                                {isVerified && (
                                    <div
                                        className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: "#0D9488" }}
                                        title="Verified Home"
                                    >
                                        <BadgeCheck size={14} className="text-white" fill="#0D9488" stroke="white" strokeWidth={2.5} />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1">
                                    <span
                                        className="font-semibold text-sm truncate"
                                        style={{ color: "#1E293B" }}
                                    >
                                        {homeName || "My Home"}
                                    </span>
                                </div>
                                <span
                                    className="text-xs"
                                    style={{ color: "#64748B" }}
                                >
                                    {isVerified ? "Verified Home" : "Home Portal"}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {collapsed && (
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto"
                        style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }}
                    >
                        <Home size={20} style={{ color: "#0D9488" }} />
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-lg transition-colors flex-shrink-0"
                    style={{ color: "#64748B" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(13, 148, 136, 0.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/home" && pathname.startsWith(item.href));
                    const badgeCount = getBadgeCount(item.badgeKey);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all"
                            style={{
                                backgroundColor: isActive ? "rgba(13, 148, 136, 0.1)" : "transparent",
                                color: isActive ? "#0D9488" : "#64748B",
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) e.currentTarget.style.backgroundColor = "rgba(13, 148, 136, 0.05)";
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} />
                                <AnimatePresence>
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="font-medium text-sm"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                            {/* Badge */}
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

            {/* Back to Main & Sign Out */}
            <div className="p-2 border-t space-y-1" style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}>
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full"
                    style={{ color: "#64748B" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(13, 148, 136, 0.05)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                    <Home size={20} />
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="font-medium text-sm"
                            >
                                Back to Site
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
                <button
                    onClick={onSignOut}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full"
                    style={{ color: "#EF4444" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                    <LogOut size={20} />
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="font-medium text-sm"
                            >
                                Sign Out
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.aside>
    );
}
