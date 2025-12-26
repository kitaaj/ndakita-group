"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    MessageCircle,
    Package,
    User,
    Clock,
    ChevronRight,
} from "lucide-react";
import { getMyHomeChatRooms, type ChatRoom, type Need, type Profile } from "@/lib/supabase";

interface ChatRoomWithDetails extends ChatRoom {
    needs?: Need;
    profiles?: Profile;
}

export default function MessagesPage() {
    const [chatRooms, setChatRooms] = useState<ChatRoomWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadChatRooms() {
            try {
                const rooms = await getMyHomeChatRooms();
                setChatRooms(rooms as ChatRoomWithDetails[]);
            } catch (error) {
                console.error("Failed to load chat rooms:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadChatRooms();
    }, []);

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

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
            >
                <h1 className="text-2xl font-bold" style={{ color: "#1E293B" }}>
                    Messages
                </h1>
                <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                    Coordinate with donors about pickups and deliveries.
                </p>
            </motion.div>

            {/* Chat List */}
            {chatRooms.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-xl border overflow-hidden"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(10px)",
                        borderColor: "rgba(13, 148, 136, 0.1)",
                    }}
                >
                    {chatRooms.map((room, index) => (
                        <Link
                            key={room.id}
                            href={`/home/messages/${room.id}`}
                            className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50 border-b last:border-b-0"
                            style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}
                        >
                            {/* Donor Avatar */}
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                                style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                            >
                                {room.profiles?.avatar_url && room.profiles.avatar_url.trim() !== "" ? (
                                    <img
                                        src={room.profiles.avatar_url}
                                        alt={room.profiles.display_name || "Donor"}
                                        className="w-12 h-12 rounded-full object-cover"
                                        onError={(e) => {
                                            // Hide broken image and show fallback
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />
                                ) : null}
                                {/* Fallback icon - always rendered but overlapped by image when valid */}
                                <User size={24} style={{ color: "#3B82F6" }} />
                            </div>

                            {/* Chat Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-medium text-sm truncate" style={{ color: "#1E293B" }}>
                                        {room.profiles?.display_name || "Anonymous Donor"}
                                    </h3>
                                    <span className="text-xs flex-shrink-0" style={{ color: "#64748B" }}>
                                        {formatDate(room.created_at)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Package size={14} style={{ color: "#64748B" }} />
                                    <p className="text-sm truncate" style={{ color: "#64748B" }}>
                                        {room.needs?.title || "Unknown Need"}
                                    </p>
                                </div>
                            </div>

                            <ChevronRight size={20} style={{ color: "#94A3B8" }} />
                        </Link>
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-xl border p-12 text-center"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        borderColor: "rgba(13, 148, 136, 0.1)",
                    }}
                >
                    <MessageCircle size={48} className="mx-auto mb-4 opacity-30" style={{ color: "#64748B" }} />
                    <h3 className="font-medium mb-2" style={{ color: "#1E293B" }}>
                        No messages yet
                    </h3>
                    <p className="text-sm mb-4" style={{ color: "#64748B" }}>
                        When donors pledge to fulfill your needs, you'll be able to chat with them here.
                    </p>
                    <Link
                        href="/home/needs"
                        className="inline-flex items-center gap-2 text-sm font-medium"
                        style={{ color: "#0D9488" }}
                    >
                        <Package size={16} />
                        View Your Needs
                    </Link>
                </motion.div>
            )}

            {/* Info Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border p-6"
                style={{
                    backgroundColor: "rgba(59, 130, 246, 0.05)",
                    borderColor: "rgba(59, 130, 246, 0.2)",
                }}
            >
                <div className="flex items-start gap-4">
                    <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                    >
                        <Clock size={20} style={{ color: "#3B82F6" }} />
                    </div>
                    <div>
                        <h4 className="font-medium text-sm mb-1" style={{ color: "#1E40AF" }}>
                            How messaging works
                        </h4>
                        <p className="text-sm" style={{ color: "#1E40AF" }}>
                            When a donor pledges to fulfill one of your needs, a chat room is automatically created.
                            Use this to coordinate pickup times and locations. Once you receive the donation,
                            mark the need as complete from the need details page.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
