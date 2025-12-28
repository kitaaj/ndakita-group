"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    MessageCircle,
    Package,
    Clock,
    Loader2,
    ChevronRight,
    Building2,
    CheckCircle,
    CircleDashed,
} from "lucide-react";
import {
    getMyDonorChats,
    type ChatRoom,
    type Need,
    type Home,
} from "@/lib/supabase";

type ChatWithDetails = ChatRoom & { need?: Need; home?: Home };

export default function DonorChatsPage() {
    const [chats, setChats] = useState<ChatWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadChats() {
            try {
                const data = await getMyDonorChats();
                setChats(data);
            } catch (error) {
                console.error("Failed to load chats:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadChats();
    }, []);

    const [activeTab, setActiveTab] = useState<"active" | "archived">("active");

    const filteredChats = chats.filter(chat => {
        // Strict whitelist for Active tab:
        // Must be active AND need status must be active or pending_pickup
        const isActiveState = chat.is_active && (chat.need?.status === "active" || chat.need?.status === "pending_pickup");

        if (activeTab === "active") return isActiveState;
        return !isActiveState; // Everything else goes to archive (completed, cancelled, closed)
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        } else if (diffDays === 1) {
            return "Yesterday";
        } else if (diffDays < 7) {
            return date.toLocaleDateString("en-US", { weekday: "short" });
        } else {
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin" style={{ color: "#0D9488" }} />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-2xl font-bold mb-1" style={{ color: "#1E293B" }}>
                    My Conversations
                </h1>
                <p className="text-sm" style={{ color: "#64748B" }}>
                    Chat with homes to coordinate your donations.
                </p>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-100">
                <button
                    onClick={() => setActiveTab("active")}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === "active" ? "text-teal-600" : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Active
                    {activeTab === "active" && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"
                        />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("archived")}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === "archived" ? "text-teal-600" : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Past Pledges
                    {activeTab === "archived" && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"
                        />
                    )}
                </button>
            </div>

            {/* Chat List */}
            {filteredChats.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                >
                    {filteredChats.map((chat, index) => (
                        <motion.div
                            key={chat.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                href={`/donor/chat/${chat.id}`}
                                className="block rounded-xl p-4 transition-all hover:shadow-lg"
                                style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                                    border: "1px solid rgba(13, 148, 136, 0.1)",
                                    boxShadow: "0 2px 8px rgba(13, 148, 136, 0.05)",
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Home Logo */}
                                    <div
                                        className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                                        style={{
                                            backgroundColor: chat.home?.logo_url
                                                ? "white"
                                                : "rgba(13, 148, 136, 0.1)",
                                        }}
                                    >
                                        {chat.home?.logo_url ? (
                                            <Image
                                                src={chat.home.logo_url}
                                                alt={chat.home.name}
                                                width={48}
                                                height={48}
                                                className="w-full h-full object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <Building2 size={24} style={{ color: "#0D9488" }} />
                                        )}
                                    </div>

                                    {/* Chat Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold truncate" style={{ color: "#1E293B" }}>
                                                {chat.home?.name || "Unknown Home"}
                                            </h3>
                                            <span className="text-xs" style={{ color: "#94A3B8" }}>
                                                {formatDate(chat.created_at)}
                                            </span>
                                        </div>

                                        {/* Need Info */}
                                        {chat.need && (
                                            <div className="flex items-center gap-2">
                                                <Package size={14} style={{ color: "#0D9488" }} />
                                                <span
                                                    className="text-sm truncate"
                                                    style={{ color: "#64748B" }}
                                                >
                                                    {chat.need.title}
                                                </span>
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                                                style={{
                                                    backgroundColor: chat.need?.status === "pending_pickup"
                                                        ? "rgba(251, 191, 36, 0.15)"
                                                        : chat.need?.status === "active"
                                                            ? "rgba(59, 130, 246, 0.15)"
                                                            : "rgba(34, 197, 94, 0.15)",
                                                    color: chat.need?.status === "pending_pickup"
                                                        ? "#F59E0B"
                                                        : chat.need?.status === "active"
                                                            ? "#3B82F6"
                                                            : "#22C55E",
                                                }}
                                            >
                                                {chat.need?.status === "pending_pickup" ? (
                                                    <Clock size={10} />
                                                ) : chat.need?.status === "active" ? (
                                                    <CircleDashed size={10} />
                                                ) : (
                                                    <CheckCircle size={10} />
                                                )}
                                                {chat.need?.status === "pending_pickup"
                                                    ? "Pending Pickup"
                                                    : chat.need?.status === "active"
                                                        ? "Active"
                                                        : "Completed"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    <ChevronRight size={20} style={{ color: "#94A3B8" }} />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-12 text-center"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        border: "1px solid rgba(13, 148, 136, 0.1)",
                    }}
                >
                    <MessageCircle
                        size={48}
                        className="mx-auto mb-4 opacity-30"
                        style={{ color: "#64748B" }}
                    />
                    <h3 className="font-medium mb-2" style={{ color: "#1E293B" }}>
                        No conversations yet
                    </h3>
                    <p className="text-sm mb-6" style={{ color: "#64748B" }}>
                        When you pledge to fulfill a need, a chat will be created
                        to coordinate with the home.
                    </p>
                    <Link
                        href="/explore"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                        style={{
                            backgroundColor: "#0D9488",
                            color: "white",
                            boxShadow: "0 4px 12px rgba(13, 148, 136, 0.2)",
                        }}
                    >
                        Explore Needs
                    </Link>
                </motion.div>
            )}
        </div>
    );
}
