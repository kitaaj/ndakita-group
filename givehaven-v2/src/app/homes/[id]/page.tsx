"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeft,
    BadgeCheck,
    MapPin,
    Loader2,
    Building2,
    Package,
    X,
    HandHeart,
    AlertTriangle,
} from "lucide-react";
import NeedCard from "@/components/explore/NeedCard";
import {
    getPublicHomeProfile,
    getPublicHomeNeeds,
    getCurrentUser,
    signInWithGoogle,
    createPledge,
    type Home,
    type Need,
    type PublicNeed,
} from "@/lib/supabase";

export default function PublicHomeProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [home, setHome] = useState<Home | null>(null);
    const [needs, setNeeds] = useState<Need[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showPledgeModal, setShowPledgeModal] = useState(false);
    const [selectedNeed, setSelectedNeed] = useState<PublicNeed | null>(null);
    const [pledgingNeedId, setPledgingNeedId] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            if (!params.id) return;

            try {
                const [homeData, needsData, user] = await Promise.all([
                    getPublicHomeProfile(params.id as string),
                    getPublicHomeNeeds(params.id as string),
                    getCurrentUser(),
                ]);
                setHome(homeData);
                setNeeds(needsData);
                setIsAuthenticated(!!user);
            } catch (error) {
                console.error("Failed to load home:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, [params.id]);

    // Convert needs to PublicNeed format for NeedCard
    const publicNeeds: PublicNeed[] = home
        ? needs.map(need => ({
            ...need,
            home: {
                id: home.id,
                name: home.name,
                logo_url: home.logo_url,
                address: home.address,
                verified: home.verified,
            },
        }))
        : [];

    function handlePledgeClick(needId: string) {
        const need = publicNeeds.find(n => n.id === needId);
        if (!need) return;
        setSelectedNeed(need);
        setShowPledgeModal(true);
    }

    async function handleConfirmPledge() {
        if (!selectedNeed) return;

        if (!isAuthenticated) {
            signInWithGoogle();
            return;
        }

        setPledgingNeedId(selectedNeed.id);
        try {
            const { chatRoomId } = await createPledge(selectedNeed.id);
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
                <Loader2 size={32} className="animate-spin" style={{ color: "#0D9488" }} />
            </div>
        );
    }

    if (!home) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F8FAFC" }}>
                <div className="text-center">
                    <Building2 size={48} className="mx-auto mb-4 opacity-30" style={{ color: "#64748B" }} />
                    <h2 className="text-xl font-semibold mb-2" style={{ color: "#1E293B" }}>
                        Home Not Found
                    </h2>
                    <p className="text-sm mb-4" style={{ color: "#64748B" }}>
                        This home doesn&apos;t exist or isn&apos;t verified yet.
                    </p>
                    <Link
                        href="/explore"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                        style={{ backgroundColor: "#0D9488", color: "white" }}
                    >
                        <ArrowLeft size={16} />
                        Back to Explore
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
            {/* Cover Banner */}
            <div
                className="h-48 sm:h-64 relative"
                style={{
                    background: home.cover_image_url
                        ? `url(${home.cover_image_url}) center/cover`
                        : "linear-gradient(135deg, #0D9488 0%, #115E59 50%, #134E4A 100%)",
                }}
            >
                {!home.cover_image_url && (
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                        }}
                    />
                )}
                {/* Back Button */}
                <Link
                    href="/explore"
                    className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        color: "#1E293B",
                        backdropFilter: "blur(10px)",
                    }}
                >
                    <ArrowLeft size={16} />
                    Explore
                </Link>
            </div>

            {/* Profile Content */}
            <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10 pb-12">
                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-6 mb-8"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(20px)",
                        boxShadow: "0 10px 40px rgba(13, 148, 136, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.9)",
                    }}
                >
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                        {/* Logo */}
                        <div
                            className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                            style={{
                                backgroundColor: home.logo_url ? "white" : "rgba(13, 148, 136, 0.1)",
                                border: "4px solid white",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                        >
                            {home.logo_url ? (
                                <img
                                    src={home.logo_url}
                                    alt={home.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Building2 size={40} style={{ color: "#0D9488" }} />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-bold" style={{ color: "#1E293B" }}>
                                    {home.name}
                                </h1>
                                {home.verified && (
                                    <BadgeCheck size={24} style={{ color: "#0D9488" }} />
                                )}
                            </div>

                            {home.address && (
                                <div className="flex items-center gap-1 mb-3">
                                    <MapPin size={14} style={{ color: "#64748B" }} />
                                    <span className="text-sm" style={{ color: "#64748B" }}>
                                        {home.address}
                                    </span>
                                </div>
                            )}

                            {home.story && (
                                <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
                                    {home.story}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Active Needs Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Package size={20} style={{ color: "#0D9488" }} />
                        <h2 className="text-lg font-semibold" style={{ color: "#1E293B" }}>
                            Current Needs ({needs.length})
                        </h2>
                    </div>

                    {publicNeeds.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {publicNeeds.map((need, index) => (
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
                        <div
                            className="rounded-xl p-8 text-center"
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.8)",
                                border: "1px solid rgba(13, 148, 136, 0.1)",
                            }}
                        >
                            <Package size={40} className="mx-auto mb-3 opacity-30" style={{ color: "#64748B" }} />
                            <p className="text-sm" style={{ color: "#64748B" }}>
                                No active needs at the moment. Check back later!
                            </p>
                        </div>
                    )}
                </motion.div>
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
                                    aria-label="Close modal"
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
                                    <p className="text-xs" style={{ color: "#0D9488" }}>
                                        For: {selectedNeed.home.name}
                                    </p>
                                </div>

                                <p className="text-sm mb-6" style={{ color: "#64748B" }}>
                                    By pledging, you&apos;ll be connected directly with{" "}
                                    <strong>{selectedNeed.home.name}</strong> to coordinate the donation.
                                    A chat room will be created for you to discuss pickup/delivery details.
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
        </div>
    );
}
