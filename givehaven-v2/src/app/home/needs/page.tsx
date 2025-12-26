"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Plus,
    Search,
    Filter,
    Package,
    Trash2,
    Edit,
    CheckCircle,
    Clock,
    AlertTriangle,
} from "lucide-react";
import { getMyHome, getMyNeeds, deleteNeed, type Home, type Need } from "@/lib/supabase";

type FilterStatus = "all" | "active" | "pending_pickup" | "completed";

export default function NeedsPage() {
    const [home, setHome] = useState<Home | null>(null);
    const [needs, setNeeds] = useState<Need[]>([]);
    const [filteredNeeds, setFilteredNeeds] = useState<Need[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [homeData, needsData] = await Promise.all([
                getMyHome(),
                getMyNeeds(),
            ]);
            setHome(homeData);
            setNeeds(needsData);
            setFilteredNeeds(needsData);
        } catch (error) {
            console.error("Failed to load needs:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        let result = needs;

        // Filter by status
        if (statusFilter !== "all") {
            result = result.filter(n => n.status === statusFilter);
        }

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(n =>
                n.title.toLowerCase().includes(query) ||
                n.description.toLowerCase().includes(query) ||
                n.category.toLowerCase().includes(query)
            );
        }

        setFilteredNeeds(result);
    }, [needs, statusFilter, searchQuery]);

    async function handleDelete(needId: string) {
        if (!confirm("Are you sure you want to delete this need?")) return;

        setDeletingId(needId);
        try {
            await deleteNeed(needId);
            setNeeds(prev => prev.filter(n => n.id !== needId));
        } catch (error) {
            console.error("Failed to delete need:", error);
            alert("Failed to delete need. Only active needs can be deleted.");
        } finally {
            setDeletingId(null);
        }
    }

    const statusColors: Record<string, { bg: string; text: string; icon: typeof Package }> = {
        active: { bg: "rgba(13, 148, 136, 0.1)", text: "#0D9488", icon: Package },
        pending_pickup: { bg: "rgba(251, 191, 36, 0.1)", text: "#F59E0B", icon: Clock },
        completed: { bg: "rgba(34, 197, 94, 0.1)", text: "#22C55E", icon: CheckCircle },
    };

    const urgencyColors: Record<string, { bg: string; text: string }> = {
        low: { bg: "rgba(100, 116, 139, 0.1)", text: "#64748B" },
        medium: { bg: "rgba(251, 191, 36, 0.1)", text: "#F59E0B" },
        critical: { bg: "rgba(239, 68, 68, 0.1)", text: "#EF4444" },
    };

    const statusCounts = {
        all: needs.length,
        active: needs.filter(n => n.status === "active").length,
        pending_pickup: needs.filter(n => n.status === "pending_pickup").length,
        completed: needs.filter(n => n.status === "completed").length,
    };

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
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#1E293B" }}>
                        My Needs
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                        Manage your item requests and track donations.
                    </p>
                </div>
                {home?.verified && (
                    <Link
                        href="/home/needs/new"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90"
                        style={{ backgroundColor: "#0D9488" }}
                    >
                        <Plus size={18} />
                        Post New Need
                    </Link>
                )}
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-4"
            >
                {/* Search */}
                <div className="relative flex-1">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: "#64748B" }}
                    />
                    <input
                        type="text"
                        placeholder="Search needs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-all focus:ring-2"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            borderColor: "rgba(13, 148, 136, 0.2)",
                            color: "#1E293B",
                        }}
                    />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <Filter size={18} style={{ color: "#64748B" }} />
                    {(["all", "active", "pending_pickup", "completed"] as FilterStatus[]).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                            style={{
                                backgroundColor: statusFilter === status
                                    ? "rgba(13, 148, 136, 0.15)"
                                    : "rgba(255, 255, 255, 0.6)",
                                color: statusFilter === status ? "#0D9488" : "#64748B",
                                border: `1px solid ${statusFilter === status ? "rgba(13, 148, 136, 0.3)" : "rgba(13, 148, 136, 0.1)"}`,
                            }}
                        >
                            {status === "all" ? "All" : status.replace("_", " ")} ({statusCounts[status]})
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Needs List */}
            {filteredNeeds.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl border overflow-hidden"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(10px)",
                        borderColor: "rgba(13, 148, 136, 0.1)",
                    }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ backgroundColor: "rgba(13, 148, 136, 0.05)" }}>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: "#64748B" }}>
                                        Need
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: "#64748B" }}>
                                        Category
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: "#64748B" }}>
                                        Urgency
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: "#64748B" }}>
                                        Status
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: "#64748B" }}>
                                        Qty
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase" style={{ color: "#64748B" }}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredNeeds.map((need, index) => {
                                    const status = statusColors[need.status] || statusColors.active;
                                    const urgency = urgencyColors[need.urgency] || urgencyColors.medium;
                                    const StatusIcon = status.icon;

                                    return (
                                        <motion.tr
                                            key={need.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + index * 0.03 }}
                                            className="border-t"
                                            style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}
                                        >
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-sm" style={{ color: "#1E293B" }}>
                                                        {need.title}
                                                    </p>
                                                    <p className="text-xs truncate max-w-xs" style={{ color: "#64748B" }}>
                                                        {need.description}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm capitalize" style={{ color: "#64748B" }}>
                                                    {need.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium capitalize"
                                                    style={{ backgroundColor: urgency.bg, color: urgency.text }}
                                                >
                                                    {need.urgency === "critical" && <AlertTriangle size={12} />}
                                                    {need.urgency}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium capitalize"
                                                    style={{ backgroundColor: status.bg, color: status.text }}
                                                >
                                                    <StatusIcon size={12} />
                                                    {need.status.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm" style={{ color: "#64748B" }}>
                                                    {need.quantity}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/home/needs/${need.id}`}
                                                        className="p-2 rounded-lg transition-colors"
                                                        style={{ color: "#64748B" }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(13, 148, 136, 0.1)"}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                                    >
                                                        <Edit size={16} />
                                                    </Link>
                                                    {need.status === "active" && (
                                                        <button
                                                            onClick={() => handleDelete(need.id)}
                                                            disabled={deletingId === need.id}
                                                            className="p-2 rounded-lg transition-colors disabled:opacity-50"
                                                            style={{ color: "#EF4444" }}
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)"}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl border p-12 text-center"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        borderColor: "rgba(13, 148, 136, 0.1)",
                    }}
                >
                    <Package size={48} className="mx-auto mb-4 opacity-30" style={{ color: "#64748B" }} />
                    <h3 className="font-medium mb-2" style={{ color: "#1E293B" }}>
                        {searchQuery || statusFilter !== "all" ? "No needs match your filters" : "No needs posted yet"}
                    </h3>
                    <p className="text-sm mb-4" style={{ color: "#64748B" }}>
                        {searchQuery || statusFilter !== "all"
                            ? "Try adjusting your search or filters."
                            : "Start by posting your first need to connect with donors."
                        }
                    </p>
                    {home?.verified && !searchQuery && statusFilter === "all" && (
                        <Link
                            href="/home/needs/new"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
                            style={{ backgroundColor: "#0D9488" }}
                        >
                            <Plus size={16} />
                            Post Your First Need
                        </Link>
                    )}
                </motion.div>
            )}
        </div>
    );
}
