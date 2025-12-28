"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
    Gift,
    Package,
    Clock,
    CheckCircle,
    Loader2,
    Building2,
    BadgeCheck,
    MessageCircle,
    Search,
    CircleDashed,
} from "lucide-react";
import {
    getMyDonorChats,
    type ChatRoom,
    type Need,
    type Home,
} from "@/lib/supabase";

type ChatWithDetails = ChatRoom & {
    need?: Need;
    home?: Home;
};

export default function MyPledgesPage() {
    const [pledges, setPledges] = useState<ChatWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

    const loadPledges = useCallback(async () => {
        try {
            const chats = await getMyDonorChats();
            setPledges(chats as ChatWithDetails[]);
        } catch (error) {
            console.error("Failed to load pledges:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPledges();
    }, [loadPledges]);

    const filteredPledges = pledges.filter((p) => {
        if (filter === "all") return true;
        if (filter === "pending") return p.need?.status === "pending_pickup" || p.need?.status === "active";
        if (filter === "completed") return p.need?.status === "completed";
        return true;
    });

    const pendingCount = pledges.filter((p) => p.need?.status === "pending_pickup" || p.need?.status === "active").length;
    const completedCount = pledges.filter((p) => p.need?.status === "completed").length;

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin" style={{ color: "#0D9488" }} />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto overflow-hidden">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-2xl font-bold mb-1" style={{ color: "#1E293B" }}>
                    My Pledges
                </h1>
                <p className="text-sm" style={{ color: "#64748B" }}>
                    Track your donation pledges and their status.
                </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6"
            >
                <div
                    className="p-4 rounded-xl"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        border: "1px solid rgba(13, 148, 136, 0.1)",
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }}
                        >
                            <Gift size={20} style={{ color: "#0D9488" }} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold" style={{ color: "#1E293B" }}>
                                {pledges.length}
                            </p>
                            <p className="text-xs" style={{ color: "#64748B" }}>
                                Total Pledges
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className="p-4 rounded-xl"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        border: "1px solid rgba(251, 191, 36, 0.2)",
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "rgba(251, 191, 36, 0.1)" }}
                        >
                            <Clock size={20} style={{ color: "#F59E0B" }} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold" style={{ color: "#1E293B" }}>
                                {pendingCount}
                            </p>
                            <p className="text-xs" style={{ color: "#64748B" }}>
                                Pending
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className="p-4 rounded-xl"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        border: "1px solid rgba(34, 197, 94, 0.2)",
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
                        >
                            <CheckCircle size={20} style={{ color: "#22C55E" }} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold" style={{ color: "#1E293B" }}>
                                {completedCount}
                            </p>
                            <p className="text-xs" style={{ color: "#64748B" }}>
                                Completed
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex gap-2 mb-6"
            >
                {[
                    { key: "all", label: "All" },
                    { key: "pending", label: "Pending" },
                    { key: "completed", label: "Completed" },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key as typeof filter)}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                            backgroundColor:
                                filter === tab.key ? "rgba(13, 148, 136, 0.1)" : "rgba(255, 255, 255, 0.8)",
                            color: filter === tab.key ? "#0D9488" : "#64748B",
                            border: `1px solid ${filter === tab.key ? "rgba(13, 148, 136, 0.2)" : "rgba(13, 148, 136, 0.1)"}`,
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </motion.div>

            {/* Pledges List */}
            {filteredPledges.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                >
                    {filteredPledges.map((pledge, index) => (
                        <motion.div
                            key={pledge.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.05 }}
                            className="rounded-xl overflow-hidden"
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                border: "1px solid rgba(13, 148, 136, 0.1)",
                            }}
                        >
                            <div className="p-3 md:p-4">
                                <div className="flex items-start gap-3">
                                    {/* Home Logo */}
                                    <div
                                        className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                                        style={{
                                            backgroundColor: pledge.home?.logo_url
                                                ? "white"
                                                : "rgba(13, 148, 136, 0.1)",
                                        }}
                                    >
                                        {pledge.home?.logo_url ? (
                                            <Image
                                                src={pledge.home.logo_url}
                                                alt={pledge.home.name}
                                                width={48}
                                                height={48}
                                                className="w-full h-full object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <Building2 size={20} style={{ color: "#0D9488" }} />
                                        )}
                                    </div>

                                    {/* Pledge Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="mb-1">
                                            <h3 className="font-semibold text-sm md:text-base line-clamp-2" style={{ color: "#1E293B" }}>
                                                {pledge.need?.title || "Unknown Need"}
                                            </h3>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs flex-shrink-0"
                                                style={{
                                                    backgroundColor:
                                                        pledge.need?.status === "pending_pickup"
                                                            ? "rgba(251, 191, 36, 0.15)"
                                                            : pledge.need?.status === "active"
                                                                ? "rgba(59, 130, 246, 0.15)"
                                                                : "rgba(34, 197, 94, 0.15)",
                                                    color:
                                                        pledge.need?.status === "pending_pickup"
                                                            ? "#F59E0B"
                                                            : pledge.need?.status === "active"
                                                                ? "#3B82F6"
                                                                : "#22C55E",
                                                }}
                                            >
                                                {pledge.need?.status === "pending_pickup" ? (
                                                    <Clock size={10} />
                                                ) : pledge.need?.status === "active" ? (
                                                    <CircleDashed size={10} />
                                                ) : (
                                                    <CheckCircle size={10} />
                                                )}
                                                <span className="hidden sm:inline">
                                                    {pledge.need?.status === "pending_pickup"
                                                        ? "Pending Pickup"
                                                        : pledge.need?.status === "active"
                                                            ? "Active"
                                                            : "Completed"}
                                                </span>
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1 mb-1">
                                            {pledge.home?.verified && (
                                                <BadgeCheck size={12} style={{ color: "#0D9488" }} />
                                            )}
                                            <span className="text-xs md:text-sm truncate" style={{ color: "#64748B" }}>
                                                {pledge.home?.name || "Unknown Home"}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs" style={{ color: "#94A3B8" }}>
                                            <span className="flex items-center gap-1">
                                                <Package size={10} />
                                                {pledge.need?.category}
                                            </span>
                                            <span className="hidden sm:inline">•</span>
                                            <span className="hidden sm:inline">{formatDate(pledge.created_at)}</span>
                                        </div>
                                    </div>

                                    {/* Chat Button - Desktop */}
                                    <Link
                                        href={`/donor/chat/${pledge.id}`}
                                        className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90 flex-shrink-0"
                                        style={{
                                            backgroundColor: "rgba(13, 148, 136, 0.1)",
                                            color: "#0D9488",
                                        }}
                                    >
                                        <MessageCircle size={16} />
                                        Chat
                                    </Link>
                                </div>

                                {/* Chat Button - Mobile */}
                                <Link
                                    href={`/donor/chat/${pledge.id}`}
                                    className="md:hidden flex items-center justify-center gap-2 mt-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full"
                                    style={{
                                        backgroundColor: "rgba(13, 148, 136, 0.1)",
                                        color: "#0D9488",
                                    }}
                                >
                                    <MessageCircle size={16} />
                                    Chat with Home
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl p-8 md:p-12 text-center"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        border: "1px solid rgba(13, 148, 136, 0.1)",
                    }}
                >
                    <Gift size={48} className="mx-auto mb-4 opacity-30" style={{ color: "#64748B" }} />
                    <h3 className="font-medium mb-2" style={{ color: "#1E293B" }}>
                        {filter === "all" ? "No pledges yet" : `No ${filter} pledges`}
                    </h3>
                    <p className="text-sm mb-4" style={{ color: "#64748B" }}>
                        {filter === "all"
                            ? "Start making a difference by pledging to fulfill a need from a children's home."
                            : `You don't have any ${filter} pledges at the moment.`}
                    </p>
                    <Link
                        href="/explore"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                        style={{
                            backgroundColor: "#0D9488",
                            color: "white",
                        }}
                    >
                        <Search size={16} />
                        Explore Needs
                    </Link>
                </motion.div>
            )}
        </div>
    );
}
