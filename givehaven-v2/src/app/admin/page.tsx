"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home, Package, Users, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import StatsCard from "@/components/admin/StatsCard";
import Badge from "@/components/admin/Badge";
import { getAdminStats, getRecentActivity, getPendingHomes, type ActivityLog, type Home as HomeType } from "@/lib/supabase";

interface DashboardStats {
    totalHomes: number;
    verifiedHomes: number;
    pendingHomes: number;
    activeNeeds: number;
    pendingPickup: number;
    completedThisMonth: number;
    totalDonors: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
    const [pendingHomes, setPendingHomes] = useState<HomeType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [statsData, activityData, homesData] = await Promise.all([
                    getAdminStats(),
                    getRecentActivity(10),
                    getPendingHomes(),
                ]);
                setStats(statsData);
                setRecentActivity(activityData || []);
                setPendingHomes(homesData || []);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getActionLabel = (log: ActivityLog) => {
        // Check if metadata has status_label (for status changes)
        if (log.metadata?.status_label) {
            return `Status: ${log.metadata.status_label}`;
        }

        const labels: Record<string, string> = {
            pledge: "New Pledge",
            complete: "Need Fulfilled",
            cancel: "Pledge Cancelled",
            verify: "Home Verified",
            reject: "Home Rejected",
        };
        return labels[log.action] || log.action;
    };

    const getActionColor = (action: string) => {
        const colors: Record<string, string> = {
            pledge: "#0D9488",
            complete: "#10B981",
            cancel: "#EF4444",
            verify: "#10B981",
            reject: "#EF4444",
        };
        return colors[action] || "#64748B";
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 rounded-lg animate-pulse" style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "#1E293B" }}>Dashboard Overview</h1>
                <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                    Welcome back! Here&apos;s what&apos;s happening on your platform.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Homes"
                    value={stats?.totalHomes ?? 0}
                    icon={Home}
                    color="teal"
                />
                <StatsCard
                    title="Active Needs"
                    value={stats?.activeNeeds ?? 0}
                    icon={Package}
                    color="coral"
                />
                <StatsCard
                    title="Total Donors"
                    value={stats?.totalDonors ?? 0}
                    icon={Users}
                    color="yellow"
                />
                <StatsCard
                    title="Completed This Month"
                    value={stats?.completedThisMonth ?? 0}
                    icon={CheckCircle}
                    color="teal"
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Verifications */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-6"
                    style={{
                        background: "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.9)",
                        boxShadow: "0 4px 20px rgba(13, 148, 136, 0.08)",
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-lg" style={{ color: "#1E293B" }}>
                            Pending Verifications
                        </h2>
                        {(stats?.pendingHomes ?? 0) > 0 && (
                            <Badge variant="pending">{stats?.pendingHomes} pending</Badge>
                        )}
                    </div>

                    {pendingHomes.length === 0 ? (
                        <div className="text-center py-8">
                            <CheckCircle size={40} style={{ color: "#10B981" }} className="mx-auto mb-2" />
                            <p className="text-sm" style={{ color: "#64748B" }}>All caught up! No pending verifications.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingHomes.slice(0, 3).map((home) => (
                                <div
                                    key={home.id}
                                    className="flex items-center justify-between p-3 rounded-xl"
                                    style={{ backgroundColor: "rgba(251, 191, 36, 0.05)" }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(251, 191, 36, 0.2)" }}>
                                            <Clock size={20} style={{ color: "#D97706" }} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm" style={{ color: "#1E293B" }}>{home.name}</p>
                                            <p className="text-xs" style={{ color: "#64748B" }}>{formatDate(home.created_at)}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/admin/homes/${home.id}`}
                                        className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                                        style={{ color: "#0D9488", backgroundColor: "rgba(13, 148, 136, 0.1)" }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(13, 148, 136, 0.2)"}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(13, 148, 136, 0.1)"}
                                    >
                                        Review
                                    </Link>
                                </div>
                            ))}
                            {pendingHomes.length > 3 && (
                                <Link
                                    href="/admin/homes?status=pending"
                                    className="block text-center text-sm font-medium py-2"
                                    style={{ color: "#0D9488" }}
                                >
                                    View all {pendingHomes.length} pending →
                                </Link>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl p-6"
                    style={{
                        background: "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.9)",
                        boxShadow: "0 4px 20px rgba(13, 148, 136, 0.08)",
                    }}
                >
                    <h2 className="font-semibold text-lg mb-4" style={{ color: "#1E293B" }}>
                        Recent Activity
                    </h2>

                    {recentActivity.length === 0 ? (
                        <div className="text-center py-8">
                            <AlertTriangle size={40} style={{ color: "#D97706" }} className="mx-auto mb-2" />
                            <p className="text-sm" style={{ color: "#64748B" }}>No recent activity. Platform just started!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentActivity.slice(0, 5).map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-center gap-3 py-2 border-b last:border-b-0"
                                    style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}
                                >
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: getActionColor(activity.action) }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: "#1E293B" }}>
                                            {getActionLabel(activity)}
                                        </p>
                                        <p className="text-xs" style={{ color: "#64748B" }}>
                                            {formatDate(activity.created_at)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <Link
                                href="/admin/logs"
                                className="block text-center text-sm font-medium py-2"
                                style={{ color: "#0D9488" }}
                            >
                                View all activity →
                            </Link>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-xl" style={{ backgroundColor: "rgba(13, 148, 136, 0.05)" }}>
                    <p className="text-2xl font-bold" style={{ color: "#0D9488" }}>{stats?.verifiedHomes ?? 0}</p>
                    <p className="text-xs" style={{ color: "#64748B" }}>Verified Homes</p>
                </div>
                <div className="text-center p-4 rounded-xl" style={{ backgroundColor: "rgba(251, 191, 36, 0.05)" }}>
                    <p className="text-2xl font-bold" style={{ color: "#D97706" }}>{stats?.pendingHomes ?? 0}</p>
                    <p className="text-xs" style={{ color: "#64748B" }}>Pending Verification</p>
                </div>
                <div className="text-center p-4 rounded-xl" style={{ backgroundColor: "rgba(249, 115, 22, 0.05)" }}>
                    <p className="text-2xl font-bold" style={{ color: "#F97316" }}>{stats?.pendingPickup ?? 0}</p>
                    <p className="text-xs" style={{ color: "#64748B" }}>Pending Pickup</p>
                </div>
                <div className="text-center p-4 rounded-xl" style={{ backgroundColor: "rgba(16, 185, 129, 0.05)" }}>
                    <p className="text-2xl font-bold" style={{ color: "#10B981" }}>{stats?.activeNeeds ?? 0}</p>
                    <p className="text-xs" style={{ color: "#64748B" }}>Active Needs</p>
                </div>
            </div>
        </div>
    );
}
