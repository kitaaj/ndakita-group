"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2, MapPin, Calendar, Mail, Phone, FileText,
    CheckCircle, XCircle, ArrowLeft, ExternalLink, Loader2,
    ChevronDown, Check
} from "lucide-react";
import Badge, { VerificationStatus, verificationStatusLabels } from "@/components/admin/Badge";
import HomeLogo from "@/components/admin/HomeLogo";
import { supabase, type Home } from "@/lib/supabase";

// Verification workflow statuses in order
const VERIFICATION_STATUSES: VerificationStatus[] = [
    "received",
    "reviewing",
    "needs_documents",
    "approved",
    "rejected",
];

const statusDescriptions: Record<VerificationStatus, string> = {
    received: "Application received and queued for review",
    reviewing: "Admin is currently reviewing the application",
    needs_documents: "Additional documents required from home",
    approved: "Home has been verified and approved",
    rejected: "Home application has been rejected",
};

export default function HomeDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [home, setHome] = useState<Home | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Get current user on mount
    useEffect(() => {
        async function getUser() {
            if (!supabase) return;
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id || null);
        }
        getUser();
    }, []);
    useEffect(() => {
        async function loadHome() {
            if (!supabase || !params.id) return;

            try {
                const { data, error } = await supabase
                    .from("homes")
                    .select("*")
                    .eq("id", params.id)
                    .single();

                if (error) throw error;
                setHome(data as Home);
            } catch (error) {
                console.error("Failed to load home:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadHome();
    }, [params.id]);

    async function updateStatus(newStatus: VerificationStatus) {
        if (!home || !supabase) return;

        // If rejecting, show modal first
        if (newStatus === "rejected") {
            setShowRejectModal(true);
            setShowStatusDropdown(false);
            return;
        }

        setUpdating(true);
        try {
            const { error } = await supabase
                .from("homes")
                .update({
                    verification_status: newStatus,
                    verified: newStatus === "approved",
                })
                .eq("id", home.id);

            if (error) throw error;

            setHome({
                ...home,
                verification_status: newStatus,
                verified: newStatus === "approved",
            });

            // Log the activity (using 'verify' for approval, 'pledge' for other status changes)
            const { error: logError } = await supabase.from("activity_logs").insert({
                user_id: currentUserId,
                action: newStatus === "approved" ? "verify" : "pledge",
                entity_type: "home",
                entity_id: home.id,
                metadata: {
                    home_name: home.name,
                    new_status: newStatus,
                    status_label: verificationStatusLabels[newStatus]
                },
            });

            if (logError) {
                console.error("Activity log insert failed:", logError);
            }

        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setUpdating(false);
            setShowStatusDropdown(false);
        }
    }

    async function handleReject() {
        if (!home || !supabase || !rejectReason.trim()) return;

        setUpdating(true);
        try {
            const { error } = await supabase
                .from("homes")
                .update({
                    verification_status: "rejected",
                    verified: false,
                })
                .eq("id", home.id);

            if (error) throw error;

            setHome({
                ...home,
                verification_status: "rejected" as VerificationStatus,
                verified: false,
            });

            // Log rejection with reason
            await supabase.from("activity_logs").insert({
                user_id: currentUserId,
                action: "reject",
                entity_type: "home",
                entity_id: home.id,
                metadata: {
                    home_name: home.name,
                    rejection_reason: rejectReason,
                },
            });

            setShowRejectModal(false);
            setRejectReason("");
        } catch (error) {
            console.error("Failed to reject:", error);
        } finally {
            setUpdating(false);
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin" style={{ color: "#0D9488" }} />
            </div>
        );
    }

    if (!home) {
        return (
            <div className="text-center py-12">
                <Building2 size={48} className="mx-auto mb-4" style={{ color: "#94A3B8" }} />
                <h2 className="text-xl font-semibold" style={{ color: "#1E293B" }}>Home not found</h2>
                <button
                    onClick={() => router.push("/admin/homes")}
                    className="mt-4 text-sm font-medium"
                    style={{ color: "#0D9488" }}
                >
                    ← Back to homes
                </button>
            </div>
        );
    }

    const currentStatus = home.verification_status as VerificationStatus;

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Back Button */}
            <button
                onClick={() => router.push("/admin/homes")}
                className="flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: "#64748B" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#0D9488"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#64748B"}
            >
                <ArrowLeft size={16} />
                Back to Homes
            </button>

            {/* Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-6 relative"
                style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.9)",
                    boxShadow: "0 4px 20px rgba(13, 148, 136, 0.08)",
                    overflow: "visible",
                    zIndex: 40,
                }}
            >
                <div className="flex items-start gap-6">
                    {/* Logo */}
                    <HomeLogo src={home.logo_url} alt={home.name} size={100} />

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h1 className="text-2xl font-bold" style={{ color: "#1E293B" }}>{home.name}</h1>
                            <Badge variant={currentStatus}>
                                {verificationStatusLabels[currentStatus] || currentStatus}
                            </Badge>
                        </div>

                        {home.address && (
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin size={16} style={{ color: "#64748B" }} />
                                <span className="text-sm" style={{ color: "#64748B" }}>{home.address}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Calendar size={16} style={{ color: "#94A3B8" }} />
                            <span className="text-sm" style={{ color: "#94A3B8" }}>
                                Registered {formatDate(home.created_at)}
                            </span>
                        </div>
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative z-50">
                        <button
                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                            disabled={updating}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-50"
                            style={{
                                backgroundColor: "rgba(13, 148, 136, 0.1)",
                                color: "#0D9488"
                            }}
                        >
                            {updating ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <>
                                    Update Status
                                    <ChevronDown size={16} />
                                </>
                            )}
                        </button>

                        {/* Click outside overlay - must be z-30 (below dropdown z-50) */}
                        {showStatusDropdown && (
                            <div
                                className="fixed inset-0 z-30"
                                onClick={() => setShowStatusDropdown(false)}
                            />
                        )}

                        <AnimatePresence>
                            {showStatusDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-0 top-full mt-2 w-64 rounded-xl overflow-hidden z-50"
                                    style={{
                                        backgroundColor: "white",
                                        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                                        border: "1px solid rgba(13, 148, 136, 0.1)",
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {VERIFICATION_STATUSES.map((status) => (
                                        <button
                                            key={status}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updateStatus(status);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <Badge variant={status}>
                                                {verificationStatusLabels[status]}
                                            </Badge>
                                            {currentStatus === status && (
                                                <Check size={14} style={{ color: "#10B981" }} />
                                            )}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Status Description */}
                <div
                    className="mt-4 p-3 rounded-lg text-sm"
                    style={{
                        backgroundColor: "rgba(13, 148, 136, 0.03)",
                        color: "#64748B"
                    }}
                >
                    <strong>Current Status:</strong> {statusDescriptions[currentStatus] || "Unknown status"}
                </div>
            </motion.div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Story */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl p-6"
                    style={{
                        background: "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.9)",
                        boxShadow: "0 4px 20px rgba(13, 148, 136, 0.08)",
                    }}
                >
                    <h2 className="font-semibold mb-3" style={{ color: "#1E293B" }}>About</h2>
                    <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
                        {home.story || "No story provided yet."}
                    </p>
                </motion.div>

                {/* Contact Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-2xl p-6"
                    style={{
                        background: "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.9)",
                        boxShadow: "0 4px 20px rgba(13, 148, 136, 0.08)",
                    }}
                >
                    <h2 className="font-semibold mb-3" style={{ color: "#1E293B" }}>Contact Information</h2>
                    <div className="space-y-3">
                        {home.contact_email && (
                            <div className="flex items-center gap-3">
                                <Mail size={18} style={{ color: "#0D9488" }} />
                                <a
                                    href={`mailto:${home.contact_email}`}
                                    className="text-sm"
                                    style={{ color: "#0D9488" }}
                                >
                                    {home.contact_email}
                                </a>
                            </div>
                        )}
                        {home.contact_phone && (
                            <div className="flex items-center gap-3">
                                <Phone size={18} style={{ color: "#0D9488" }} />
                                <span className="text-sm" style={{ color: "#64748B" }}>{home.contact_phone}</span>
                            </div>
                        )}
                        {!home.contact_email && !home.contact_phone && (
                            <p className="text-sm" style={{ color: "#94A3B8" }}>No contact information provided.</p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Documents Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl p-6"
                style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.9)",
                    boxShadow: "0 4px 20px rgba(13, 148, 136, 0.08)",
                }}
            >
                <h2 className="font-semibold mb-4" style={{ color: "#1E293B" }}>Verification Documents</h2>

                {home.registration_doc_url ? (
                    <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: "rgba(13, 148, 136, 0.05)" }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }}>
                            <FileText size={24} style={{ color: "#0D9488" }} />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-sm" style={{ color: "#1E293B" }}>Registration Certificate</p>
                            <p className="text-xs" style={{ color: "#64748B" }}>PDF Document</p>
                        </div>
                        <a
                            href={home.registration_doc_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{ backgroundColor: "#0D9488", color: "white" }}
                        >
                            <ExternalLink size={16} />
                            View Document
                        </a>
                    </div>
                ) : (
                    <div className="text-center py-8 rounded-xl" style={{ backgroundColor: "rgba(251, 191, 36, 0.05)" }}>
                        <FileText size={32} className="mx-auto mb-2" style={{ color: "#D97706" }} />
                        <p className="text-sm font-medium" style={{ color: "#D97706" }}>No documents uploaded</p>
                        <p className="text-xs mt-1" style={{ color: "#64748B" }}>
                            This home has not uploaded any verification documents yet.
                        </p>
                    </div>
                )}
            </motion.div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowRejectModal(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md rounded-2xl p-6"
                        style={{ backgroundColor: "white" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>
                            Reject Application
                        </h2>
                        <p className="text-sm mb-4" style={{ color: "#64748B" }}>
                            Please provide a reason for rejecting {home.name}&apos;s verification request.
                            This will be visible to the home owner.
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            className="w-full p-3 rounded-xl outline-none resize-none h-32"
                            style={{
                                backgroundColor: "#F8FAFC",
                                border: "1px solid #E2E8F0",
                                color: "#1E293B",
                            }}
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="px-4 py-2 rounded-lg text-sm font-medium"
                                style={{ color: "#64748B" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || updating}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                                style={{ backgroundColor: "#EF4444", color: "white" }}
                            >
                                {updating ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : null}
                                Confirm Rejection
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
