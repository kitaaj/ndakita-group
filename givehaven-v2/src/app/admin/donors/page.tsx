"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Trophy, TrendingUp, Heart } from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import { supabase } from "@/lib/supabase";

interface DonorStats {
    id: string;
    display_name: string;
    total_pledges: number;
    completed_pledges: number;
    success_rate: number;
    last_active: string | null;
}

export default function DonorsPage() {
    const [donors, setDonors] = useState<DonorStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalDonors, setTotalDonors] = useState(0);
    const [activeDonors, setActiveDonors] = useState(0);
    const [totalPledges, setTotalPledges] = useState(0);

    useEffect(() => {
        async function loadData() {
            try {
                // Get donor profiles
                const { data: profiles, count } = await supabase
                    .from("profiles")
                    .select("*", { count: "exact" })
                    .eq("role", "donor");

                setTotalDonors(count ?? 0);

                // Get chat rooms (pledges) with completion status
                const { data: chatRooms } = await supabase
                    .from("chat_rooms")
                    .select(`
            id,
            donor_id,
            created_at,
            needs (status)
          `);

                setTotalPledges(chatRooms?.length ?? 0);

                // Calculate donor stats
                const donorMap = new Map<string, { pledges: number; completed: number; lastActive: string | null }>();

                chatRooms?.forEach((room: { donor_id: string; created_at: string; needs: { status: string } | null }) => {
                    const existing = donorMap.get(room.donor_id) || { pledges: 0, completed: 0, lastActive: null };
                    existing.pledges += 1;
                    if (room.needs?.status === "completed") {
                        existing.completed += 1;
                    }
                    if (!existing.lastActive || room.created_at > existing.lastActive) {
                        existing.lastActive = room.created_at;
                    }
                    donorMap.set(room.donor_id, existing);
                });

                // Merge with profile data
                const donorStats: DonorStats[] = (profiles || []).map((profile) => {
                    const stats = donorMap.get(profile.id) || { pledges: 0, completed: 0, lastActive: null };
                    return {
                        id: profile.id,
                        display_name: profile.display_name || "Anonymous Donor",
                        total_pledges: stats.pledges,
                        completed_pledges: stats.completed,
                        success_rate: stats.pledges > 0 ? Math.round((stats.completed / stats.pledges) * 100) : 0,
                        last_active: stats.lastActive,
                    };
                });

                // Sort by completed pledges
                donorStats.sort((a, b) => b.completed_pledges - a.completed_pledges);
                setDonors(donorStats);

                // Count active donors (with at least 1 pledge)
                setActiveDonors(donorStats.filter((d) => d.total_pledges > 0).length);
            } catch (error) {
                console.error("Failed to load donors:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Never";
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const topDonors = donors.filter((d) => d.completed_pledges > 0).slice(0, 5);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 rounded-lg animate-pulse" style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }} />
                <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "#1E293B" }}>Donor Analytics</h1>
                <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                    Track donor engagement and impact across the platform
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard title="Total Donors" value={totalDonors} icon={Users} color="teal" />
                <StatsCard title="Active Donors" value={activeDonors} icon={TrendingUp} color="coral" />
                <StatsCard title="Total Pledges" value={totalPledges} icon={Heart} color="yellow" />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Impact Leaderboard */}
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
                    <div className="flex items-center gap-2 mb-4">
                        <Trophy size={20} style={{ color: "#FBBF24" }} />
                        <h2 className="font-semibold text-lg" style={{ color: "#1E293B" }}>Impact Leaderboard</h2>
                    </div>

                    {topDonors.length === 0 ? (
                        <div className="text-center py-8">
                            <Trophy size={40} className="mx-auto mb-2" style={{ color: "#D4D4D4" }} />
                            <p className="text-sm" style={{ color: "#64748B" }}>No completed pledges yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {topDonors.map((donor, index) => (
                                <div
                                    key={donor.id}
                                    className="flex items-center gap-4 p-3 rounded-xl"
                                    style={{
                                        backgroundColor: index === 0
                                            ? "rgba(251, 191, 36, 0.1)"
                                            : index === 1
                                                ? "rgba(148, 163, 184, 0.1)"
                                                : index === 2
                                                    ? "rgba(180, 83, 9, 0.1)"
                                                    : "transparent",
                                    }}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                                        style={{
                                            backgroundColor: index === 0 ? "#FBBF24" : index === 1 ? "#94A3B8" : index === 2 ? "#B45309" : "#E2E8F0",
                                            color: index < 3 ? "white" : "#64748B",
                                        }}
                                    >
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate" style={{ color: "#1E293B" }}>
                                            {donor.display_name}
                                        </p>
                                        <p className="text-xs" style={{ color: "#64748B" }}>
                                            {donor.completed_pledges} fulfilled
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold" style={{ color: "#0D9488" }}>
                                            {donor.success_rate}%
                                        </p>
                                        <p className="text-xs" style={{ color: "#94A3B8" }}>success</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* All Donors Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl overflow-hidden"
                    style={{
                        background: "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.9)",
                        boxShadow: "0 4px 20px rgba(13, 148, 136, 0.08)",
                    }}
                >
                    <div className="p-4 border-b" style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}>
                        <h2 className="font-semibold" style={{ color: "#1E293B" }}>All Donors</h2>
                    </div>
                    <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                        <table className="w-full">
                            <thead className="sticky top-0" style={{ backgroundColor: "rgba(248, 250, 252, 0.95)" }}>
                                <tr>
                                    <th className="text-left px-4 py-2 text-xs font-medium" style={{ color: "#64748B" }}>Donor</th>
                                    <th className="text-center px-4 py-2 text-xs font-medium" style={{ color: "#64748B" }}>Pledges</th>
                                    <th className="text-center px-4 py-2 text-xs font-medium" style={{ color: "#64748B" }}>Completed</th>
                                    <th className="text-center px-4 py-2 text-xs font-medium" style={{ color: "#64748B" }}>Rate</th>
                                    <th className="text-right px-4 py-2 text-xs font-medium" style={{ color: "#64748B" }}>Last Active</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: "rgba(13, 148, 136, 0.05)" }}>
                                {donors.map((donor) => (
                                    <tr key={donor.id} className="hover:bg-white/50">
                                        <td className="px-4 py-3 text-sm font-medium" style={{ color: "#1E293B" }}>
                                            {donor.display_name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-center" style={{ color: "#64748B" }}>
                                            {donor.total_pledges}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-center" style={{ color: "#10B981" }}>
                                            {donor.completed_pledges}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-center" style={{ color: "#64748B" }}>
                                            {donor.success_rate}%
                                        </td>
                                        <td className="px-4 py-3 text-xs text-right" style={{ color: "#94A3B8" }}>
                                            {formatDate(donor.last_active)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
