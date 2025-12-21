"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Package, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import Badge from "@/components/admin/Badge";
import { getAllNeeds, getNeedsByCategory } from "@/lib/supabase";

interface NeedWithHome {
    id: string;
    home_id: string;
    category: string;
    title: string;
    description: string;
    urgency: string;
    status: string;
    quantity: number;
    created_at: string;
    homes: { name: string } | null;
}

const COLORS = ["#0D9488", "#F97316", "#FBBF24", "#EC4899", "#8B5CF6"];

const categoryIcons: Record<string, string> = {
    food: "🍽️",
    clothing: "👕",
    education: "📚",
    health: "💊",
    infrastructure: "🏗️",
};

export default function NeedsPage() {
    const [needs, setNeeds] = useState<NeedWithHome[]>([]);
    const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    useEffect(() => {
        async function loadData() {
            try {
                const [needsData, categories] = await Promise.all([
                    getAllNeeds(),
                    getNeedsByCategory(),
                ]);
                setNeeds(needsData || []);
                setCategoryData(categories);
            } catch (error) {
                console.error("Failed to load needs:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const filteredNeeds = needs.filter((need) => {
        const matchesSearch =
            need.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            need.homes?.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || need.status === statusFilter;
        const matchesCategory = categoryFilter === "all" || need.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    const activeCount = needs.filter((n) => n.status === "active").length;
    const pendingCount = needs.filter((n) => n.status === "pending_pickup").length;
    const completedCount = needs.filter((n) => n.status === "completed").length;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 rounded-lg animate-pulse" style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }} />
                <div className="h-64 rounded-2xl animate-pulse" style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "#1E293B" }}>Needs Management</h1>
                <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                    Track and manage all needs posted by verified homes
                </p>
            </div>

            {/* Stats and Chart Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="lg:col-span-2 grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl text-center" style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }}>
                        <Package size={24} className="mx-auto mb-1" style={{ color: "#0D9488" }} />
                        <p className="text-xl font-bold" style={{ color: "#0D9488" }}>{activeCount}</p>
                        <p className="text-xs" style={{ color: "#64748B" }}>Active</p>
                    </div>
                    <div className="p-4 rounded-xl text-center" style={{ backgroundColor: "rgba(251, 191, 36, 0.1)" }}>
                        <Clock size={24} className="mx-auto mb-1" style={{ color: "#D97706" }} />
                        <p className="text-xl font-bold" style={{ color: "#D97706" }}>{pendingCount}</p>
                        <p className="text-xs" style={{ color: "#64748B" }}>Pending Pickup</p>
                    </div>
                    <div className="p-4 rounded-xl text-center" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}>
                        <CheckCircle size={24} className="mx-auto mb-1" style={{ color: "#10B981" }} />
                        <p className="text-xl font-bold" style={{ color: "#10B981" }}>{completedCount}</p>
                        <p className="text-xs" style={{ color: "#64748B" }}>Completed</p>
                    </div>
                </div>

                {/* Category Chart */}
                <motion.div
                    className="p-4 rounded-2xl"
                    style={{
                        background: "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.9)",
                    }}
                >
                    <h3 className="text-sm font-medium mb-2" style={{ color: "#64748B" }}>By Category</h3>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={120}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={30}
                                    outerRadius={50}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[120px] flex items-center justify-center">
                            <p className="text-sm" style={{ color: "#94A3B8" }}>No data</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
                    <input
                        type="text"
                        placeholder="Search needs or homes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            border: "1px solid rgba(13, 148, 136, 0.2)",
                            color: "#1E293B",
                        }}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl outline-none"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        border: "1px solid rgba(13, 148, 136, 0.2)",
                        color: "#1E293B",
                    }}
                >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending_pickup">Pending Pickup</option>
                    <option value="completed">Completed</option>
                </select>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl outline-none"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        border: "1px solid rgba(13, 148, 136, 0.2)",
                        color: "#1E293B",
                    }}
                >
                    <option value="all">All Categories</option>
                    <option value="food">Food</option>
                    <option value="clothing">Clothing</option>
                    <option value="education">Education</option>
                    <option value="health">Health</option>
                    <option value="infrastructure">Infrastructure</option>
                </select>
            </div>

            {/* Needs List */}
            <motion.div
                className="rounded-2xl overflow-hidden"
                style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.9)",
                    boxShadow: "0 4px 20px rgba(13, 148, 136, 0.08)",
                }}
            >
                {filteredNeeds.length === 0 ? (
                    <div className="text-center py-12">
                        <Package size={48} className="mx-auto mb-3" style={{ color: "#94A3B8" }} />
                        <p style={{ color: "#64748B" }}>No needs found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ backgroundColor: "rgba(13, 148, 136, 0.05)" }}>
                                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: "#64748B" }}>Need</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: "#64748B" }}>Home</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: "#64748B" }}>Urgency</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: "#64748B" }}>Status</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: "#64748B" }}>Posted</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}>
                                {filteredNeeds.map((need) => (
                                    <tr key={need.id} className="hover:bg-white/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{categoryIcons[need.category] || "📦"}</span>
                                                <div>
                                                    <p className="font-medium text-sm" style={{ color: "#1E293B" }}>{need.title}</p>
                                                    <p className="text-xs capitalize" style={{ color: "#94A3B8" }}>{need.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm" style={{ color: "#64748B" }}>
                                            {need.homes?.name || "Unknown"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={need.urgency as "low" | "medium" | "critical"}>
                                                {need.urgency}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={need.status === "active" ? "active" : need.status === "completed" ? "completed" : "pending"}>
                                                {need.status.replace("_", " ")}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm" style={{ color: "#94A3B8" }}>
                                            {formatDate(need.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
