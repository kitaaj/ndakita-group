"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/constants/Logo";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Home,
    Package,
    Users,
    Activity,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
} from "lucide-react";

interface SidebarProps {
    onSignOut: () => void;
}

const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Overview" },
    { href: "/admin/homes", icon: Home, label: "Homes" },
    { href: "/admin/needs", icon: Package, label: "Needs" },
    { href: "/admin/donors", icon: Users, label: "Donors" },
    { href: "/admin/logs", icon: Activity, label: "Activity Logs" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar({ onSignOut }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <motion.aside
            className="h-screen flex flex-col border-r sticky top-0 self-start"
            style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                borderColor: "rgba(13, 148, 136, 0.1)",
            }}
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.2 }}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b" style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                        >
                            <Logo size={32} variant="dark" className="w-8 h-8" />
                            <span className="font-bold text-lg" style={{ color: "#1E293B" }}>GiveHaven</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: "#64748B" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(13, 148, 136, 0.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/admin" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
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
                        </Link>
                    );
                })}
            </nav>

            {/* Sign Out */}
            <div className="p-2 border-t" style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}>
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
