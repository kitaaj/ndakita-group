"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    Package,
    Utensils,
    Shirt,
    GraduationCap,
    Heart,
    Wrench,
    AlertTriangle,
    BadgeCheck,
    MapPin,
} from "lucide-react";
import type { PublicNeed, NeedCategory, NeedUrgency } from "@/lib/supabase";

interface NeedCardProps {
    need: PublicNeed;
    onPledge: (needId: string) => void;
    isPledging?: boolean;
}

const categoryIcons: Record<NeedCategory, typeof Package> = {
    food: Utensils,
    clothing: Shirt,
    education: GraduationCap,
    health: Heart,
    infrastructure: Wrench,
};

const categoryColors: Record<NeedCategory, string> = {
    food: "#22C55E",
    clothing: "#8B5CF6",
    education: "#3B82F6",
    health: "#EF4444",
    infrastructure: "#F59E0B",
};

const urgencyStyles: Record<NeedUrgency, { bg: string; text: string; label: string }> = {
    low: { bg: "rgba(100, 116, 139, 0.1)", text: "#64748B", label: "Low Priority" },
    medium: { bg: "rgba(251, 191, 36, 0.1)", text: "#F59E0B", label: "Medium Priority" },
    critical: { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444", label: "Urgent!" },
};

export default function NeedCard({ need, onPledge, isPledging }: NeedCardProps) {
    const CategoryIcon = categoryIcons[need.category] || Package;
    const categoryColor = categoryColors[need.category] || "#64748B";
    const urgency = urgencyStyles[need.urgency] || urgencyStyles.medium;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(13, 148, 136, 0.15)" }}
            className="rounded-2xl overflow-hidden transition-all"
            style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(13, 148, 136, 0.1)",
                boxShadow: "0 4px 20px rgba(13, 148, 136, 0.08)",
            }}
        >
            {/* Card Header with Category & Urgency */}
            <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: `${categoryColor}10` }}
            >
                <div className="flex items-center gap-2">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${categoryColor}20` }}
                    >
                        <CategoryIcon size={16} style={{ color: categoryColor }} />
                    </div>
                    <span className="text-xs font-medium capitalize" style={{ color: categoryColor }}>
                        {need.category}
                    </span>
                </div>
                {need.urgency === "critical" && (
                    <span
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: urgency.bg, color: urgency.text }}
                    >
                        <AlertTriangle size={12} />
                        Urgent
                    </span>
                )}
            </div>

            {/* Card Body */}
            <div className="p-4">
                <h3 className="font-semibold text-lg mb-1" style={{ color: "#1E293B" }}>
                    {need.title}
                </h3>
                <p className="text-sm mb-4 line-clamp-2" style={{ color: "#64748B" }}>
                    {need.description}
                </p>

                {/* Quantity Badge */}
                {need.quantity > 1 && (
                    <div className="mb-4">
                        <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: "rgba(13, 148, 136, 0.1)", color: "#0D9488" }}
                        >
                            <Package size={12} />
                            Qty: {need.quantity}
                        </span>
                    </div>
                )}

                {/* Home Info */}
                <Link
                    href={`/homes/${need.home.id}`}
                    className="flex items-center gap-3 p-2 -mx-2 rounded-xl transition-colors hover:bg-gray-50"
                >
                    <div
                        className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
                        style={{
                            backgroundColor: need.home.logo_url ? "transparent" : "rgba(13, 148, 136, 0.1)",
                        }}
                    >
                        {need.home.logo_url ? (
                            <img
                                src={need.home.logo_url}
                                alt={need.home.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-sm font-semibold" style={{ color: "#0D9488" }}>
                                {need.home.name.charAt(0)}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                            <span className="font-medium text-sm truncate" style={{ color: "#1E293B" }}>
                                {need.home.name}
                            </span>
                            {need.home.verified && (
                                <BadgeCheck size={14} style={{ color: "#0D9488" }} />
                            )}
                        </div>
                        {need.home.address && (
                            <div className="flex items-center gap-1">
                                <MapPin size={10} style={{ color: "#94A3B8" }} />
                                <span className="text-xs truncate" style={{ color: "#94A3B8" }}>
                                    {need.home.address}
                                </span>
                            </div>
                        )}
                    </div>
                </Link>
            </div>

            {/* Card Footer - Pledge Button */}
            <div className="px-4 pb-4">
                <button
                    onClick={() => onPledge(need.id)}
                    disabled={isPledging}
                    className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
                    style={{
                        backgroundColor: "#F97316",
                        color: "white",
                        boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
                    }}
                >
                    {isPledging ? "Connecting..." : "I Have This! 🎁"}
                </button>
            </div>
        </motion.div>
    );
}
