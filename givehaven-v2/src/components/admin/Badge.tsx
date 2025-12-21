// Verification status types
export type VerificationStatus =
    | "received"
    | "reviewing"
    | "needs_documents"
    | "approved"
    | "rejected";

interface BadgeProps {
    variant: VerificationStatus | "active" | "completed" | "critical" | "medium" | "low" | "pending" | "verified" | "pending_pickup";
    children: React.ReactNode;
}

const variantStyles: Record<string, { bg: string; text: string }> = {
    // Verification statuses
    received: { bg: "rgba(100, 116, 139, 0.1)", text: "#64748B" },
    reviewing: { bg: "rgba(59, 130, 246, 0.1)", text: "#2563EB" },
    needs_documents: { bg: "rgba(251, 191, 36, 0.1)", text: "#D97706" },
    approved: { bg: "rgba(16, 185, 129, 0.1)", text: "#059669" },
    rejected: { bg: "rgba(239, 68, 68, 0.1)", text: "#DC2626" },

    // Legacy/general statuses
    verified: { bg: "rgba(16, 185, 129, 0.1)", text: "#059669" },
    pending: { bg: "rgba(251, 191, 36, 0.1)", text: "#D97706" },
    active: { bg: "rgba(13, 148, 136, 0.1)", text: "#0D9488" },
    completed: { bg: "rgba(16, 185, 129, 0.1)", text: "#059669" },
    pending_pickup: { bg: "rgba(249, 115, 22, 0.1)", text: "#EA580C" },

    // Priority levels
    critical: { bg: "rgba(239, 68, 68, 0.1)", text: "#DC2626" },
    medium: { bg: "rgba(251, 191, 36, 0.1)", text: "#D97706" },
    low: { bg: "rgba(100, 116, 139, 0.1)", text: "#64748B" },
};

// Human-readable labels for verification statuses
export const verificationStatusLabels: Record<VerificationStatus, string> = {
    received: "Received",
    reviewing: "Under Review",
    needs_documents: "More Docs Needed",
    approved: "Approved",
    rejected: "Rejected",
};

export default function Badge({ variant, children }: BadgeProps) {
    const styles = variantStyles[variant] || variantStyles.pending;

    return (
        <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
            style={{ backgroundColor: styles.bg, color: styles.text }}
        >
            {children}
        </span>
    );
}
