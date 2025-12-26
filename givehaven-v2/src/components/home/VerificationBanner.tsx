"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Clock,
    FileText,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Upload,
    X,
    PartyPopper
} from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

type VerificationStatus = "pending" | "reviewing" | "needs_documents" | "verified" | "rejected" | "approved";

interface VerificationBannerProps {
    status: string;
    onDismiss?: () => void;
}

const statusConfig: Record<VerificationStatus, {
    icon: typeof Clock;
    title: string;
    message: string;
    bgColor: string;
    borderColor: string;
    iconColor: string;
    textColor: string;
    showAction?: boolean;
    actionLabel?: string;
    dismissible?: boolean;
    celebrate?: boolean;
}> = {
    pending: {
        icon: Clock,
        title: "Verification Pending",
        message: "Your registration is being reviewed by our team. This usually takes 1-2 business days.",
        bgColor: "rgba(251, 191, 36, 0.1)",
        borderColor: "rgba(251, 191, 36, 0.3)",
        iconColor: "#F59E0B",
        textColor: "#92400E",
        dismissible: true,
    },
    reviewing: {
        icon: FileText,
        title: "Documents Under Review",
        message: "We're reviewing your submitted documents. You'll be notified once the review is complete.",
        bgColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgba(59, 130, 246, 0.3)",
        iconColor: "#3B82F6",
        textColor: "#1E40AF",
        dismissible: true,
    },
    needs_documents: {
        icon: AlertTriangle,
        title: "Additional Documents Required",
        message: "Please upload the required verification documents to complete your registration.",
        bgColor: "rgba(249, 115, 22, 0.1)",
        borderColor: "rgba(249, 115, 22, 0.3)",
        iconColor: "#F97316",
        textColor: "#C2410C",
        showAction: true,
        actionLabel: "Upload Documents",
    },
    verified: {
        icon: CheckCircle,
        title: "Verified Home",
        message: "Your home is verified.",
        bgColor: "rgba(13, 148, 136, 0.15)",
        borderColor: "rgba(13, 148, 136, 0.4)",
        iconColor: "#0D9488",
        textColor: "#065F46",
        dismissible: true,
        celebrate: true,
    },
    approved: {
        icon: PartyPopper,
        title: "🎉 Congratulations! Your Home is Approved!",
        message: "You can now post needs and connect with donors. Welcome to GiveHaven!",
        bgColor: "rgba(13, 148, 136, 0.15)",
        borderColor: "rgba(13, 148, 136, 0.4)",
        iconColor: "#0D9488",
        textColor: "#065F46",
        dismissible: true,
        celebrate: true,
    },
    rejected: {
        icon: XCircle,
        title: "Verification Rejected",
        message: "Unfortunately, your verification was not approved. Please contact support for more information.",
        bgColor: "rgba(239, 68, 68, 0.1)",
        borderColor: "rgba(239, 68, 68, 0.3)",
        iconColor: "#EF4444",
        textColor: "#991B1B",
        showAction: true,
        actionLabel: "Contact Support",
    },
};

export default function VerificationBanner({ status, onDismiss }: VerificationBannerProps) {
    // Initialize dismissed state from localStorage (runs once on mount)
    const [dismissed, setDismissed] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(`banner_dismissed_${status}`) === 'true';
    });

    const hasCelebratedRef = useRef(false);

    // Default config for unknown statuses
    const defaultConfig = {
        icon: Clock,
        title: "Status: " + status,
        message: "Your verification status is being processed.",
        bgColor: "rgba(100, 116, 139, 0.1)",
        borderColor: "rgba(100, 116, 139, 0.3)",
        iconColor: "#64748B",
        textColor: "#475569",
        dismissible: true,
        showAction: false,
        actionLabel: undefined as string | undefined,
        celebrate: false,
    };

    const config = (status in statusConfig)
        ? statusConfig[status as VerificationStatus]
        : defaultConfig;
    const Icon = config.icon;

    // Trigger confetti for approved/verified status
    useEffect(() => {
        if ((status === "verified" || status === "approved") && config.celebrate && !hasCelebratedRef.current) {
            hasCelebratedRef.current = true;
            // Fire confetti
            const duration = 3 * 1000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#0D9488', '#14B8A6', '#5EEAD4', '#F59E0B', '#FCD34D']
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#0D9488', '#14B8A6', '#5EEAD4', '#F59E0B', '#FCD34D']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [status, config.celebrate]);

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem(`banner_dismissed_${status}`, 'true');
        onDismiss?.();
    };

    if (dismissed) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-xl p-4 mb-6 border relative"
                style={{
                    backgroundColor: config.bgColor,
                    borderColor: config.borderColor,
                }}
            >
                {/* Dismiss button */}
                {config.dismissible && (
                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 p-1 rounded-full transition-colors hover:bg-black/10"
                        style={{ color: config.textColor }}
                    >
                        <X size={16} />
                    </button>
                )}

                <div className="flex items-start gap-4 pr-6">
                    <div
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: `${config.iconColor}20` }}
                    >
                        <Icon size={24} style={{ color: config.iconColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3
                            className="font-semibold text-sm mb-1"
                            style={{ color: config.textColor }}
                        >
                            {config.title}
                        </h3>
                        <p
                            className="text-sm opacity-90"
                            style={{ color: config.textColor }}
                        >
                            {config.message}
                        </p>
                    </div>
                    {config.showAction && (
                        <div className="flex-shrink-0">
                            {status === "needs_documents" ? (
                                <Link
                                    href="/home/profile"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                                    style={{ backgroundColor: config.iconColor }}
                                >
                                    <Upload size={16} />
                                    {config.actionLabel}
                                </Link>
                            ) : (
                                <a
                                    href="mailto:support@givehaven.org"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                                    style={{ backgroundColor: config.iconColor }}
                                >
                                    {config.actionLabel}
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
