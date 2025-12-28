"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Search,
    Filter,
    Package,
    Utensils,
    Shirt,
    GraduationCap,
    Heart,
    Wrench,
    AlertTriangle,
    Loader2,
    X,
    HandHeart,
} from "lucide-react";
import NeedCard from "@/components/explore/NeedCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
    getPublicActiveNeeds,
    createPledge,
    getCurrentUser,
    signInWithGoogle,
    type PublicNeed,
    type NeedCategory,
    type NeedUrgency,
} from "@/lib/supabase";

const categories: { value: NeedCategory | "all"; label: string; icon: typeof Package }[] = [
    { value: "all", label: "All Categories", icon: Package },
    { value: "food", label: "Food", icon: Utensils },
    { value: "clothing", label: "Clothing", icon: Shirt },
    { value: "education", label: "Education", icon: GraduationCap },
    { value: "health", label: "Health", icon: Heart },
    { value: "infrastructure", label: "Infrastructure", icon: Wrench },
];

const urgencyOptions: { value: NeedUrgency | "all"; label: string }[] = [
    { value: "all", label: "All Priorities" },
    { value: "critical", label: "Urgent Only" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
];

export default function ExplorePage() {
    const router = useRouter();
    const [needs, setNeeds] = useState<PublicNeed[]>([]);
    const [filteredNeeds, setFilteredNeeds] = useState<PublicNeed[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<NeedCategory | "all">("all");
    const [urgencyFilter, setUrgencyFilter] = useState<NeedUrgency | "all">("all");
    const [pledgingNeedId, setPledgingNeedId] = useState<string | null>(null);
    const [showPledgeModal, setShowPledgeModal] = useState(false);
    const [selectedNeed, setSelectedNeed] = useState<PublicNeed | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        loadNeeds();
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const user = await getCurrentUser();
            setIsAuthenticated(!!user);
        } catch {
            setIsAuthenticated(false);
        }
    }

    async function loadNeeds() {
        try {
            const data = await getPublicActiveNeeds();
            setNeeds(data);
            setFilteredNeeds(data);
        } catch (error) {
            console.error("Failed to load needs:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        let result = needs;

        // Filter by category
        if (categoryFilter !== "all") {
            result = result.filter(n => n.category === categoryFilter);
        }

        // Filter by urgency
        if (urgencyFilter !== "all") {
            result = result.filter(n => n.urgency === urgencyFilter);
        }

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(n =>
                n.title.toLowerCase().includes(query) ||
                n.description.toLowerCase().includes(query) ||
                n.home.name.toLowerCase().includes(query)
            );
        }

        setFilteredNeeds(result);
    }, [needs, categoryFilter, urgencyFilter, searchQuery]);

    const [pledgeQuantity, setPledgeQuantity] = useState(1);

    function handlePledgeClick(needId: string) {
        const need = needs.find(n => n.id === needId);
        if (!need) return;

        setSelectedNeed(need);
        // Default pledge is 1, max is remaining
        setPledgeQuantity(1);
        setShowPledgeModal(true);
    }

    async function handleConfirmPledge() {
        if (!selectedNeed) return;

        if (!isAuthenticated) {
            // Redirect to login
            signInWithGoogle();
            return;
        }

        setPledgingNeedId(selectedNeed.id);
        try {
            const { chatRoomId } = await createPledge(selectedNeed.id, pledgeQuantity);
            setShowPledgeModal(false);
            router.push(`/donor/chat/${chatRoomId}`);
        } catch (error) {
            console.error("Failed to create pledge:", error);
            alert("Failed to claim this need. It may have already been claimed.");
        } finally {
            setPledgingNeedId(null);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F8FAFC" }}>
                <div className="text-center">
                    <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: "#0D9488" }} />
                    <p style={{ color: "#64748B" }}>Loading needs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
            <Navbar />

            {/* Hero Header */}
            <div
                className="relative overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, #0D9488 0%, #115E59 50%, #134E4A 100%)",
                }}
            >
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                    }}
                />
                <div className="max-w-7xl mx-auto px-4 py-20 sm:py-24 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                            Discover Needs, Make Impact
                        </h1>
                        <p className="text-teal-100 text-lg max-w-2xl mx-auto">
                            Browse items that children&apos;s homes need. When you have something to give,
                            connect directly with the home.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl p-4 sm:p-6"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(20px)",
                        boxShadow: "0 10px 40px rgba(13, 148, 136, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.9)",
                    }}
                >
                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <Search
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2"
                            style={{ color: "#64748B" }}
                        />
                        <input
                            type="text"
                            placeholder="Search needs or homes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                            style={{
                                backgroundColor: "#F8FAFC",
                                borderColor: "rgba(13, 148, 136, 0.2)",
                                color: "#1E293B",
                            }}
                        />
                    </div>

                    {/* Category Pills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            const isActive = categoryFilter === cat.value;
                            return (
                                <button
                                    key={cat.value}
                                    onClick={() => setCategoryFilter(cat.value)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all"
                                    style={{
                                        backgroundColor: isActive ? "rgba(13, 148, 136, 0.15)" : "rgba(248, 250, 252, 1)",
                                        color: isActive ? "#0D9488" : "#64748B",
                                        border: `1px solid ${isActive ? "rgba(13, 148, 136, 0.3)" : "rgba(13, 148, 136, 0.1)"}`,
                                    }}
                                >
                                    <Icon size={14} />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Urgency Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <Filter size={16} className="flex-shrink-0" style={{ color: "#64748B" }} />
                        <span className="text-sm flex-shrink-0" style={{ color: "#64748B" }}>Priority:</span>
                        <div className="flex gap-2 flex-shrink-0">
                            {urgencyOptions.map((opt) => {
                                const isActive = urgencyFilter === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => setUrgencyFilter(opt.value)}
                                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap"
                                        style={{
                                            backgroundColor: isActive
                                                ? opt.value === "critical" ? "rgba(239, 68, 68, 0.15)" : "rgba(13, 148, 136, 0.15)"
                                                : "transparent",
                                            color: isActive
                                                ? opt.value === "critical" ? "#EF4444" : "#0D9488"
                                                : "#94A3B8",
                                            border: `1px solid ${isActive ? (opt.value === "critical" ? "rgba(239, 68, 68, 0.3)" : "rgba(13, 148, 136, 0.3)") : "rgba(148, 163, 184, 0.3)"}`,
                                        }}
                                    >
                                        {opt.value === "critical" && <AlertTriangle size={10} className="inline mr-1" />}
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Results Count */}
            <div className="max-w-7xl mx-auto px-4 mt-8 mb-4">
                <p className="text-sm" style={{ color: "#64748B" }}>
                    Showing <strong style={{ color: "#1E293B" }}>{filteredNeeds.length}</strong> needs
                    {categoryFilter !== "all" && <> in <strong style={{ color: "#1E293B" }}>{categoryFilter}</strong></>}
                </p>
            </div>

            {/* Needs Grid */}
            <div className="max-w-7xl mx-auto px-4 pb-12">
                {filteredNeeds.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredNeeds.map((need, index) => (
                            <motion.div
                                key={need.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                            >
                                <NeedCard
                                    need={need}
                                    onPledge={handlePledgeClick}
                                    isPledging={pledgingNeedId === need.id}
                                />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16 rounded-2xl"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            border: "1px solid rgba(13, 148, 136, 0.1)",
                        }}
                    >
                        <Package size={48} className="mx-auto mb-4 opacity-30" style={{ color: "#64748B" }} />
                        <h3 className="font-medium mb-2" style={{ color: "#1E293B" }}>
                            No needs found
                        </h3>
                        <p className="text-sm" style={{ color: "#64748B" }}>
                            {searchQuery || categoryFilter !== "all" || urgencyFilter !== "all"
                                ? "Try adjusting your filters."
                                : "Check back later for new needs from verified homes."
                            }
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Pledge Confirmation Modal */}
            <AnimatePresence>
                {showPledgeModal && selectedNeed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowPledgeModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md rounded-2xl overflow-hidden"
                            style={{ backgroundColor: "white" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div
                                className="p-4 flex items-center justify-between"
                                style={{ backgroundColor: "rgba(13, 148, 136, 0.05)" }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: "rgba(249, 115, 22, 0.15)" }}
                                    >
                                        <HandHeart size={20} style={{ color: "#F97316" }} />
                                    </div>
                                    <h2 className="font-semibold" style={{ color: "#1E293B" }}>
                                        Confirm Your Pledge
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowPledgeModal(false)}
                                    className="p-2 rounded-full hover:bg-gray-100"
                                >
                                    <X size={20} style={{ color: "#64748B" }} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6">
                                <div
                                    className="rounded-xl p-4 mb-4"
                                    style={{ backgroundColor: "#F8FAFC" }}
                                >
                                    <p className="font-medium mb-1" style={{ color: "#1E293B" }}>
                                        {selectedNeed.title}
                                    </p>
                                    <p className="text-sm mb-2" style={{ color: "#64748B" }}>
                                        {selectedNeed.description}
                                    </p>
                                    <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-gray-100">
                                        <span style={{ color: "#0D9488" }}>
                                            For: {selectedNeed.home.name}
                                        </span>
                                        <span className="text-gray-500">
                                            Needed: {selectedNeed.quantity} • Remaining: {selectedNeed.quantity - (selectedNeed.fulfilled_quantity || 0)}
                                        </span>
                                    </div>
                                </div>

                                {/* Quantity Selector */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        How many can you provide?
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setPledgeQuantity(Math.max(1, pledgeQuantity - 1))}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                            disabled={pledgeQuantity <= 1}
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            max={selectedNeed.quantity - (selectedNeed.fulfilled_quantity || 0)}
                                            value={pledgeQuantity}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                const max = selectedNeed.quantity - (selectedNeed.fulfilled_quantity || 0);
                                                if (!isNaN(val)) {
                                                    setPledgeQuantity(Math.max(1, Math.min(max, val)));
                                                }
                                            }}
                                            className="flex-1 h-10 text-center border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                        />
                                        <button
                                            onClick={() => {
                                                const max = selectedNeed.quantity - (selectedNeed.fulfilled_quantity || 0);
                                                setPledgeQuantity(Math.min(max, pledgeQuantity + 1));
                                            }}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                            disabled={pledgeQuantity >= (selectedNeed.quantity - (selectedNeed.fulfilled_quantity || 0))}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <p className="text-sm mb-6" style={{ color: "#64748B" }}>
                                    By pledging, you&apos;ll be connected directly with{" "}
                                    <strong>{selectedNeed.home.name}</strong> to coordinate the donation.
                                    A chat room will be created for you.
                                </p>

                                {!isAuthenticated && (
                                    <div
                                        className="rounded-xl p-3 mb-4 flex items-center gap-3"
                                        style={{ backgroundColor: "rgba(251, 191, 36, 0.1)" }}
                                    >
                                        <AlertTriangle size={18} style={{ color: "#F59E0B" }} />
                                        <p className="text-sm" style={{ color: "#92400E" }}>
                                            You&apos;ll need to sign in to complete your pledge.
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowPledgeModal(false)}
                                        className="flex-1 py-3 rounded-xl font-medium text-sm"
                                        style={{
                                            backgroundColor: "#F1F5F9",
                                            color: "#64748B",
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmPledge}
                                        disabled={!!pledgingNeedId}
                                        className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
                                        style={{
                                            backgroundColor: "#F97316",
                                            boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
                                        }}
                                    >
                                        {pledgingNeedId ? (
                                            <Loader2 size={18} className="animate-spin mx-auto" />
                                        ) : isAuthenticated ? (
                                            "Confirm Pledge"
                                        ) : (
                                            "Sign In & Pledge"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}
