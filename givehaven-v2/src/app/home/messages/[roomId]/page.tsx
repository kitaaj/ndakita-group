"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeft,
    Send,
    Package,
    Clock,
    CheckCircle,
    Loader2,
    User,
    Check,
} from "lucide-react";
import {
    supabase,
    getChatRoom,
    getChatMessages,
    sendMessage,
    markMessagesAsRead,
    getMyProfile,
    confirmDonationReceipt,
    type ChatRoom,
    type Need,
    type Home,
    type Message,
    type Profile,
} from "@/lib/supabase";

type ChatWithDetails = ChatRoom & { need?: Need; home?: Home };

export default function HomeOwnerChatRoomPage() {
    const params = useParams();
    const router = useRouter();
    const [chatRoom, setChatRoom] = useState<ChatWithDetails | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [myProfile, setMyProfile] = useState<Profile | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback((instant = false) => {
        messagesEndRef.current?.scrollIntoView({ behavior: instant ? "instant" : "smooth" });
    }, []);

    const loadData = useCallback(async () => {
        if (!params.roomId) return;

        try {
            const [room, msgs, profile] = await Promise.all([
                getChatRoom(params.roomId as string),
                getChatMessages(params.roomId as string),
                getMyProfile(),
            ]);

            if (!room) {
                router.push("/home/messages");
                return;
            }

            setChatRoom(room);
            setMessages(msgs);
            setMyProfile(profile);

            await markMessagesAsRead(params.roomId as string);

            // Scroll to bottom after messages load (instant, not smooth)
            setTimeout(() => scrollToBottom(true), 100);
        } catch (error) {
            console.error("Failed to load chat:", error);
        } finally {
            setIsLoading(false);
        }
    }, [params.roomId, router, scrollToBottom]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Scroll when new messages arrive (smooth animation)
    useEffect(() => {
        if (!isLoading && messages.length > 0) {
            scrollToBottom();
        }
    }, [messages.length, scrollToBottom, isLoading]);

    // Subscribe to new messages
    useEffect(() => {
        if (!params.roomId || !supabase) return;

        const channel = supabase
            .channel(`home-room-${params.roomId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `room_id=eq.${params.roomId}`,
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    // Avoid duplicates from optimistic updates
                    setMessages((prev) => {
                        const exists = prev.some(
                            (m) => m.id === newMsg.id ||
                                (m.id.startsWith("temp-") && m.content === newMsg.content && m.sender_id === newMsg.sender_id)
                        );
                        if (exists) {
                            return prev.map((m) =>
                                m.id.startsWith("temp-") && m.content === newMsg.content && m.sender_id === newMsg.sender_id
                                    ? newMsg
                                    : m
                            );
                        }
                        return [...prev, newMsg];
                    });
                    scrollToBottom();
                    if (newMsg.sender_id !== myProfile?.id) {
                        markMessagesAsRead(params.roomId as string);
                    }
                }
            )
            .subscribe((status) => {
                console.log("Home realtime subscription status:", status);
            });

        return () => {
            supabase?.removeChannel(channel);
        };
    }, [params.roomId, myProfile?.id, scrollToBottom]);

    async function handleSend() {
        if (!newMessage.trim() || !params.roomId || !myProfile) return;

        setIsSending(true);
        const messageText = newMessage.trim();
        setNewMessage("");

        // Optimistic update - add message immediately
        const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            room_id: params.roomId as string,
            sender_id: myProfile.id,
            content: messageText,
            is_read: false,
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticMessage]);
        scrollToBottom();

        try {
            await sendMessage(params.roomId as string, messageText);
        } catch (error) {
            console.error("Failed to send message:", error);
            // Remove optimistic message and restore input on error
            setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
            setNewMessage(messageText);
        } finally {
            setIsSending(false);
        }
    }

    async function handleConfirmReceipt() {
        if (!chatRoom?.need?.id) return;

        setIsConfirming(true);
        try {
            await confirmDonationReceipt(chatRoom.need.id);
            router.push("/home/messages");
        } catch (error) {
            console.error("Failed to confirm receipt:", error);
            alert("Failed to confirm receipt. Please try again.");
        } finally {
            setIsConfirming(false);
        }
    }

    function formatTime(dateString: string) {
        return new Date(dateString).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
            });
        }
    }

    // Group messages by date
    const messagesByDate: { date: string; messages: Message[] }[] = [];
    let currentDate = "";
    messages.forEach((msg) => {
        const msgDate = new Date(msg.created_at).toDateString();
        if (msgDate !== currentDate) {
            currentDate = msgDate;
            messagesByDate.push({ date: msg.created_at, messages: [msg] });
        } else {
            messagesByDate[messagesByDate.length - 1].messages.push(msg);
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin" style={{ color: "#0D9488" }} />
            </div>
        );
    }

    if (!chatRoom) return null;

    return (
        <div className="fixed inset-0 top-16 md:top-0 md:left-[280px] flex flex-col bg-slate-50">
            {/* Chat Header */}
            <div
                className="flex-shrink-0 p-3 md:p-4"
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderBottom: "1px solid rgba(13, 148, 136, 0.1)",
                }}
            >
                <div className="flex items-center gap-3 md:gap-4">
                    <Link
                        href="/home/messages"
                        className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                    >
                        <ArrowLeft size={20} style={{ color: "#64748B" }} />
                    </Link>

                    {/* Donor Info */}
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                    >
                        <User size={20} style={{ color: "#3B82F6" }} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h1 className="font-semibold truncate" style={{ color: "#1E293B" }}>
                            Donor Chat
                        </h1>
                        {chatRoom.need && (
                            <div className="flex items-center gap-2">
                                <Package size={12} style={{ color: "#64748B" }} />
                                <span className="text-xs truncate" style={{ color: "#64748B" }}>
                                    {chatRoom.need.title}
                                </span>
                                <span
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs"
                                    style={{
                                        backgroundColor:
                                            chatRoom.need.status === "pending_pickup"
                                                ? "rgba(251, 191, 36, 0.15)"
                                                : "rgba(34, 197, 94, 0.15)",
                                        color:
                                            chatRoom.need.status === "pending_pickup"
                                                ? "#F59E0B"
                                                : "#22C55E",
                                    }}
                                >
                                    {chatRoom.need.status === "pending_pickup" ? (
                                        <Clock size={10} />
                                    ) : (
                                        <CheckCircle size={10} />
                                    )}
                                    {chatRoom.need.status === "pending_pickup"
                                        ? "Pending"
                                        : "Complete"}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Confirm Receipt Button */}
                    {chatRoom.need?.status === "pending_pickup" && (
                        <button
                            onClick={handleConfirmReceipt}
                            disabled={isConfirming}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
                            style={{
                                backgroundColor: "#22C55E",
                                color: "white",
                            }}
                        >
                            {isConfirming ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Check size={16} />
                            )}
                            Confirm Receipt
                        </button>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div
                className="flex-1 overflow-y-auto p-3 md:p-4"
                style={{
                    backgroundColor: "rgba(248, 250, 252, 0.5)",
                }}
            >
                {messagesByDate.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-sm" style={{ color: "#94A3B8" }}>
                            Start the conversation! Coordinate pickup/delivery details with the donor.
                        </p>
                    </div>
                ) : (
                    messagesByDate.map((group, groupIndex) => (
                        <div key={groupIndex}>
                            {/* Date Divider */}
                            <div className="flex items-center justify-center my-4">
                                <span
                                    className="px-3 py-1 rounded-full text-xs"
                                    style={{
                                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                                        color: "#94A3B8",
                                    }}
                                >
                                    {formatDate(group.date)}
                                </span>
                            </div>

                            {/* Messages */}
                            {group.messages.map((msg, msgIndex) => {
                                const isMe = msg.sender_id === myProfile?.id;
                                // Show name if first message or different sender from previous
                                const prevMsg = msgIndex > 0 ? group.messages[msgIndex - 1] : null;
                                const showName = !prevMsg || prevMsg.sender_id !== msg.sender_id;

                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex flex-col ${isMe ? "items-end" : "items-start"} mb-2`}
                                    >
                                        {showName && (
                                            <span
                                                className="text-xs mb-1 px-1"
                                                style={{ color: "#94A3B8" }}
                                            >
                                                {isMe ? (chatRoom.home?.name || "You") : "Donor"}
                                            </span>
                                        )}
                                        <div
                                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMe ? "rounded-br-md" : "rounded-bl-md"
                                                }`}
                                            style={{
                                                backgroundColor: isMe ? "#0D9488" : "white",
                                                color: isMe ? "white" : "#1E293B",
                                                boxShadow: isMe
                                                    ? "0 2px 8px rgba(13, 148, 136, 0.3)"
                                                    : "0 1px 4px rgba(0,0,0,0.05)",
                                            }}
                                        >
                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                {msg.content}
                                            </p>
                                            <p
                                                className="text-xs mt-1 text-right"
                                                style={{
                                                    color: isMe
                                                        ? "rgba(255,255,255,0.7)"
                                                        : "#94A3B8",
                                                }}
                                            >
                                                {formatTime(msg.created_at)}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div
                className="flex-shrink-0 p-3 md:p-4"
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderTop: "1px solid rgba(13, 148, 136, 0.1)",
                }}
            >
                <div className="flex items-center gap-2 md:gap-3">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        className="flex-1 px-3 md:px-4 py-2.5 md:py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                        style={{
                            backgroundColor: "#F8FAFC",
                            borderColor: "rgba(13, 148, 136, 0.2)",
                            color: "#1E293B",
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || isSending}
                        className="p-2.5 md:p-3 rounded-xl transition-all disabled:opacity-50 hover:opacity-90 flex-shrink-0"
                        style={{
                            backgroundColor: "#0D9488",
                            color: "white",
                        }}
                        aria-label="Send message"
                    >
                        {isSending ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
