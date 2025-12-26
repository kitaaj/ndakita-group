"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Building2, MapPin, Calendar, CheckCircle, XCircle, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import Badge from "@/components/admin/Badge";
import HomeLogo from "@/components/admin/HomeLogo";
import { getAllHomes, type Home } from "@/lib/supabase";

export default function HomesPage() {
    const [homes, setHomes] = useState<Home[]>([]);
    const [filteredHomes, setFilteredHomes] = useState<Home[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    useEffect(() => {
        loadHomes();
    }, []);

    useEffect(() => {
        filterHomes();
    }, [homes, searchQuery, statusFilter]);

    async function loadHomes() {
        try {
            const data = await getAllHomes();
            setHomes(data);
        } catch (error) {
            console.error("Failed to load homes:", error);
        } finally {
            setIsLoading(false);
        }
    }

    function filterHomes() {
        let filtered = [...homes];

        if (searchQuery) {
            filtered = filtered.filter(
                (home) =>
                    home.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    home.address?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statusFilter === "pending") {
            // Pending includes: received, reviewing, needs_documents
            filtered = filtered.filter((home) =>
                home.verification_status === "received" ||
                home.verification_status === "reviewing" ||
                home.verification_status === "needs_documents"
            );
        } else if (statusFilter === "approved") {
            filtered = filtered.filter((home) => home.verification_status === "approved" || home.verified);
        } else if (statusFilter !== "all") {
            filtered = filtered.filter((home) => home.verification_status === statusFilter);
        }

        setFilteredHomes(filtered);
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Pending = received, reviewing, needs_documents (not yet approved/rejected)
    const pendingCount = homes.filter((h) =>
        h.verification_status === "received" ||
        h.verification_status === "reviewing" ||
        h.verification_status === "needs_documents"
    ).length;
    const verifiedCount = homes.filter((h) => h.verification_status === "approved" || h.verified).length;
    const rejectedCount = homes.filter((h) => h.verification_status === "rejected").length;

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#1E293B" }}>Homes Management</h1>
                    <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                        Verify and manage children&apos;s homes on the platform
                    </p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                <button
                    onClick={() => setStatusFilter(statusFilter === "pending" ? "all" : "pending")}
                    className={`p-4 rounded-xl text-center transition-all ${statusFilter === "pending" ? "ring-2 ring-amber-400" : ""}`}
                    style={{ backgroundColor: "rgba(251, 191, 36, 0.1)" }}
                >
                    <Clock size={24} className="mx-auto mb-1" style={{ color: "#D97706" }} />
                    <p className="text-xl font-bold" style={{ color: "#D97706" }}>{pendingCount}</p>
                    <p className="text-xs" style={{ color: "#64748B" }}>Pending</p>
                </button>
                <button
                    onClick={() => setStatusFilter(statusFilter === "approved" ? "all" : "approved")}
                    className={`p-4 rounded-xl text-center transition-all ${statusFilter === "approved" ? "ring-2 ring-emerald-400" : ""}`}
                    style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}
                >
                    <CheckCircle size={24} className="mx-auto mb-1" style={{ color: "#10B981" }} />
                    <p className="text-xl font-bold" style={{ color: "#10B981" }}>{verifiedCount}</p>
                    <p className="text-xs" style={{ color: "#64748B" }}>Verified</p>
                </button>
                <button
                    onClick={() => setStatusFilter(statusFilter === "rejected" ? "all" : "rejected")}
                    className={`p-4 rounded-xl text-center transition-all ${statusFilter === "rejected" ? "ring-2 ring-red-400" : ""}`}
                    style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                >
                    <XCircle size={24} className="mx-auto mb-1" style={{ color: "#EF4444" }} />
                    <p className="text-xl font-bold" style={{ color: "#EF4444" }}>{rejectedCount}</p>
                    <p className="text-xs" style={{ color: "#64748B" }}>Rejected</p>
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
                <input
                    type="text"
                    placeholder="Search homes by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none transition-all"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        border: "1px solid rgba(13, 148, 136, 0.2)",
                        color: "#1E293B",
                    }}
                />
            </div>

            {/* Homes List */}
            <motion.div
                className="rounded-2xl overflow-hidden"
                style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.9)",
                    boxShadow: "0 4px 20px rgba(13, 148, 136, 0.08)",
                }}
            >
                {filteredHomes.length === 0 ? (
                    <div className="text-center py-12">
                        <Building2 size={48} className="mx-auto mb-3" style={{ color: "#94A3B8" }} />
                        <p style={{ color: "#64748B" }}>
                            {searchQuery || statusFilter !== "all"
                                ? "No homes match your filters"
                                : "No homes registered yet"}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y" style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}>
                        <AnimatePresence>
                            {filteredHomes.map((home, index) => (
                                <motion.div
                                    key={home.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link
                                        href={`/admin/homes/${home.id}`}
                                        className="flex items-center p-4 hover:bg-white/50 transition-colors group"
                                    >
                                        {/* Logo */}
                                        <HomeLogo src={home.logo_url} alt={home.name} size={56} />

                                        {/* Info */}
                                        <div className="ml-4 flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold truncate" style={{ color: "#1E293B" }}>
                                                    {home.name}
                                                </h3>
                                                <Badge variant={home.verification_status}>
                                                    {home.verification_status}
                                                </Badge>
                                            </div>
                                            {home.address && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <MapPin size={14} style={{ color: "#94A3B8" }} />
                                                    <span className="text-sm truncate" style={{ color: "#64748B" }}>
                                                        {home.address}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1 mt-1">
                                                <Calendar size={14} style={{ color: "#94A3B8" }} />
                                                <span className="text-sm" style={{ color: "#94A3B8" }}>
                                                    Registered {formatDate(home.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <ChevronRight
                                            size={20}
                                            className="flex-shrink-0 transition-transform group-hover:translate-x-1"
                                            style={{ color: "#94A3B8" }}
                                        />
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
