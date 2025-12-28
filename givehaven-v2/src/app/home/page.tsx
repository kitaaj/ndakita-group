"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Package,
    Clock,
    CheckCircle,
    MessageCircle,
    Plus,
    TrendingUp,
    ArrowRight,
} from "lucide-react";
import { getMyHome, getHomeStats, getMyNeeds, type Home, type Need } from "@/lib/supabase";

interface DashboardStats {
    activeNeeds: number;
    pendingPickup: number;
    completedThisMonth: number;
    unreadMessages: number;
}

function StatCard({
    icon: Icon,
    label,
    value,
    color,
    delay = 0
}: {
    icon: typeof Package;
    label: string;
    value: number;
    color: string;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="rounded-xl p-5 border"
            style={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                borderColor: "rgba(13, 148, 136, 0.1)",
            }}
        >
            <div className="flex items-center gap-4">
                <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${color}15` }}
                >
                    <Icon size={24} style={{ color }} />
                </div>
                <div>
                    <p className="text-2xl font-bold" style={{ color: "#1E293B" }}>
                        {value}
                    </p>
                    <p className="text-sm" style={{ color: "#64748B" }}>
                        {label}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

function NeedCard({ need, delay = 0 }: { need: Need; delay?: number }) {
    const statusColors: Record<string, { bg: string; text: string }> = {
        active: { bg: "rgba(13, 148, 136, 0.1)", text: "#0D9488" },
        pending_pickup: { bg: "rgba(251, 191, 36, 0.1)", text: "#F59E0B" },
        completed: { bg: "rgba(34, 197, 94, 0.1)", text: "#22C55E" },
    };

    const urgencyColors: Record<string, { bg: string; text: string }> = {
        low: { bg: "rgba(100, 116, 139, 0.1)", text: "#64748B" },
        medium: { bg: "rgba(251, 191, 36, 0.1)", text: "#F59E0B" },
        critical: { bg: "rgba(239, 68, 68, 0.1)", text: "#EF4444" },
    };

    const colors = statusColors[need.status] || statusColors.active;
    const urgency = urgencyColors[need.urgency] || urgencyColors.medium;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.3 }}
            className="p-4 rounded-lg border flex items-center justify-between"
            style={{
                backgroundColor: "rgba(255, 255, 255, 0.6)",
                borderColor: "rgba(13, 148, 136, 0.1)",
            }}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate" style={{ color: "#1E293B" }}>
                        {need.title}
                    </h4>
                    <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                        style={{ backgroundColor: urgency.bg, color: urgency.text }}
                    >
                        {need.urgency}
                    </span>
                </div>
                <p className="text-xs capitalize" style={{ color: "#64748B" }}>
                    {need.category} • Qty: {need.quantity}
                </p>
            </div>
            <span
                className="text-xs px-3 py-1 rounded-full font-medium capitalize"
                style={{ backgroundColor: colors.bg, color: colors.text }}
            >
                {need.status.replace("_", " ")}
            </span>
        </motion.div>
    );
}

export default function HomeDashboard() {
    const [home, setHome] = useState<Home | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentNeeds, setRecentNeeds] = useState<Need[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const homeData = await getMyHome();
                if (homeData) {
                    setHome(homeData);
                    const [statsData, needsData] = await Promise.all([
                        getHomeStats(homeData.id),
                        getMyNeeds(),
                    ]);
                    setStats(statsData);
                    setRecentNeeds(needsData.slice(0, 5));
                }
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div
                    className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
                    style={{ borderColor: "#0D9488", borderTopColor: "transparent" }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#1E293B" }}>
                        Welcome back{home?.name ? `, ${home.name}` : ""}!
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                        Here&apos;s what&apos;s happening with your needs today.
                    </p>
                </div>
                {home?.verified && (
                    <Link
                        href="/home/needs/new"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90"
                        style={{ backgroundColor: "#0D9488" }}
                    >
                        <Plus size={18} />
                        Post a Need
                    </Link>
                )}
            </motion.div>

            {/* Stats Grid */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={Package}
                        label="Active Needs"
                        value={stats.activeNeeds}
                        color="#0D9488"
                        delay={0.1}
                    />
                    <StatCard
                        icon={Clock}
                        label="Pending Pickup"
                        value={stats.pendingPickup}
                        color="#F59E0B"
                        delay={0.2}
                    />
                    <StatCard
                        icon={CheckCircle}
                        label="Completed This Month"
                        value={stats.completedThisMonth}
                        color="#22C55E"
                        delay={0.3}
                    />
                    <StatCard
                        icon={MessageCircle}
                        label="Active Chats"
                        value={stats.unreadMessages}
                        color="#3B82F6"
                        delay={0.4}
                    />
                </div>
            )}

            {/* Quick Actions & Recent Needs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Needs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 rounded-xl p-6 border"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(10px)",
                        borderColor: "rgba(13, 148, 136, 0.1)",
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold" style={{ color: "#1E293B" }}>
                            Recent Needs
                        </h2>
                        <Link
                            href="/home/needs"
                            className="text-sm font-medium flex items-center gap-1 transition-opacity hover:opacity-70"
                            style={{ color: "#0D9488" }}
                        >
                            View All
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    {recentNeeds.length > 0 ? (
                        <div className="space-y-3">
                            {recentNeeds.map((need, index) => (
                                <NeedCard key={need.id} need={need} delay={0.4 + index * 0.1} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Package size={48} className="mx-auto mb-3 opacity-30" style={{ color: "#64748B" }} />
                            <p className="text-sm" style={{ color: "#64748B" }}>
                                No needs posted yet.
                            </p>
                            {home?.verified && (
                                <Link
                                    href="/home/needs/new"
                                    className="inline-flex items-center gap-2 mt-3 text-sm font-medium"
                                    style={{ color: "#0D9488" }}
                                >
                                    <Plus size={16} />
                                    Post your first need
                                </Link>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-xl p-6 border"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(10px)",
                        borderColor: "rgba(13, 148, 136, 0.1)",
                    }}
                >
                    <h2 className="font-semibold mb-4" style={{ color: "#1E293B" }}>
                        Quick Actions
                    </h2>
                    <div className="space-y-3">
                        {home?.verified ? (
                            <>
                                <Link
                                    href="/home/needs/new"
                                    className="flex items-center gap-3 p-3 rounded-lg border transition-all hover:border-teal-300"
                                    style={{ borderColor: "rgba(13, 148, 136, 0.2)" }}
                                >
                                    <div
                                        className="p-2 rounded-lg"
                                        style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }}
                                    >
                                        <Plus size={18} style={{ color: "#0D9488" }} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm" style={{ color: "#1E293B" }}>Post a Need</p>
                                        <p className="text-xs" style={{ color: "#64748B" }}>Request items from donors</p>
                                    </div>
                                </Link>
                                <Link
                                    href="/home/messages"
                                    className="flex items-center gap-3 p-3 rounded-lg border transition-all hover:border-blue-300"
                                    style={{ borderColor: "rgba(13, 148, 136, 0.2)" }}
                                >
                                    <div
                                        className="p-2 rounded-lg"
                                        style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                                    >
                                        <MessageCircle size={18} style={{ color: "#3B82F6" }} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm" style={{ color: "#1E293B" }}>Messages</p>
                                        <p className="text-xs" style={{ color: "#64748B" }}>Chat with donors</p>
                                    </div>
                                </Link>
                            </>
                        ) : (
                            <div
                                className="p-4 rounded-lg text-center"
                                style={{ backgroundColor: "rgba(251, 191, 36, 0.1)" }}
                            >
                                <Clock size={32} className="mx-auto mb-2" style={{ color: "#F59E0B" }} />
                                <p className="font-medium text-sm" style={{ color: "#92400E" }}>
                                    Awaiting Verification
                                </p>
                                <p className="text-xs mt-1" style={{ color: "#92400E" }}>
                                    You&apos;ll be able to post needs once verified.
                                </p>
                            </div>
                        )}
                        <Link
                            href="/home/profile"
                            className="flex items-center gap-3 p-3 rounded-lg border transition-all hover:border-orange-300"
                            style={{ borderColor: "rgba(13, 148, 136, 0.2)" }}
                        >
                            <div
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: "rgba(249, 115, 22, 0.1)" }}
                            >
                                <TrendingUp size={18} style={{ color: "#F97316" }} />
                            </div>
                            <div>
                                <p className="font-medium text-sm" style={{ color: "#1E293B" }}>Update Profile</p>
                                <p className="text-xs" style={{ color: "#64748B" }}>Edit your home info</p>
                            </div>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
