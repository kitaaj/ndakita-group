"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeft,
    Package,
    AlertTriangle,
    Upload,
    X,
    Loader2,
    CheckCircle,
    Trash2,
    MessageCircle,
} from "lucide-react";
import {
    getMyNeeds,
    updateNeed,
    deleteNeed,
    completeNeed,
    uploadFile,
    type Need,
    type NeedCategory,
    type NeedUrgency
} from "@/lib/supabase";

const categories: { value: NeedCategory; label: string; icon: string }[] = [
    { value: "food", label: "Food & Nutrition", icon: "🍎" },
    { value: "clothing", label: "Clothing & Bedding", icon: "👕" },
    { value: "education", label: "Education & Books", icon: "📚" },
    { value: "health", label: "Health & Hygiene", icon: "💊" },
    { value: "infrastructure", label: "Infrastructure", icon: "🏠" },
];

const urgencyLevels: { value: NeedUrgency; label: string; color: string; description: string }[] = [
    { value: "low", label: "Low", color: "#64748B", description: "No rush, whenever available" },
    { value: "medium", label: "Medium", color: "#F59E0B", description: "Needed within a few weeks" },
    { value: "critical", label: "Critical", color: "#EF4444", description: "Urgent, needed ASAP" },
];

export default function EditNeedPage() {
    const router = useRouter();
    const params = useParams();
    const needId = params.id as string;

    const [need, setNeed] = useState<Need | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "" as NeedCategory | "",
        urgency: "medium" as NeedUrgency,
        quantity: 1,
    });

    useEffect(() => {
        async function loadNeed() {
            try {
                const needs = await getMyNeeds();
                const foundNeed = needs.find(n => n.id === needId);

                if (!foundNeed) {
                    router.push("/home/needs");
                    return;
                }

                setNeed(foundNeed);
                setFormData({
                    title: foundNeed.title,
                    description: foundNeed.description,
                    category: foundNeed.category,
                    urgency: foundNeed.urgency,
                    quantity: foundNeed.quantity,
                });
                if (foundNeed.image_url) {
                    setImagePreview(foundNeed.image_url);
                }
            } catch (error) {
                console.error("Failed to load need:", error);
                router.push("/home/needs");
            } finally {
                setIsLoading(false);
            }
        }

        loadNeed();
    }, [needId, router]);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    function removeImage() {
        setImageFile(null);
        setImagePreview(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!need) return;

        setError(null);

        if (!formData.category) {
            setError("Please select a category");
            return;
        }

        setIsSubmitting(true);

        try {
            let imageUrl = need.image_url;

            // Upload new image if provided
            if (imageFile) {
                const fileName = `needs/${Date.now()}-${imageFile.name}`;
                imageUrl = await uploadFile("images", fileName, imageFile);
            } else if (!imagePreview) {
                imageUrl = undefined;
            }

            await updateNeed(needId, {
                title: formData.title,
                description: formData.description,
                category: formData.category as NeedCategory,
                urgency: formData.urgency,
                quantity: formData.quantity,
                image_url: imageUrl,
            });

            router.push("/home/needs");
        } catch (err) {
            console.error("Failed to update need:", err);
            setError(err instanceof Error ? err.message : "Failed to update need. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete() {
        if (!need) return;
        if (!confirm("Are you sure you want to delete this need? This cannot be undone.")) return;

        setIsSubmitting(true);
        try {
            await deleteNeed(needId);
            router.push("/home/needs");
        } catch (err) {
            console.error("Failed to delete need:", err);
            setError("Failed to delete need. Only active needs can be deleted.");
            setIsSubmitting(false);
        }
    }

    async function handleComplete() {
        if (!need) return;
        if (!confirm("Mark this donation as received? This will complete the need.")) return;

        setIsSubmitting(true);
        try {
            await completeNeed(needId);
            router.push("/home/needs");
        } catch (err) {
            console.error("Failed to complete need:", err);
            setError("Failed to complete need. Please try again.");
            setIsSubmitting(false);
        }
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

    if (!need) {
        return null;
    }

    const isEditable = need.status === "active";
    const canComplete = need.status === "pending_pickup";

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-8"
            >
                <Link
                    href="/home/needs"
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: "#64748B" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(13, 148, 136, 0.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold" style={{ color: "#1E293B" }}>
                        {isEditable ? "Edit Need" : "View Need"}
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                        {isEditable
                            ? "Update the details of your need."
                            : `Status: ${need.status.replace("_", " ")}`
                        }
                    </p>
                </div>

                {/* Status Badge */}
                <div
                    className="px-3 py-1.5 rounded-full text-sm font-medium capitalize"
                    style={{
                        backgroundColor: need.status === "completed"
                            ? "rgba(34, 197, 94, 0.1)"
                            : need.status === "pending_pickup"
                                ? "rgba(251, 191, 36, 0.1)"
                                : "rgba(13, 148, 136, 0.1)",
                        color: need.status === "completed"
                            ? "#22C55E"
                            : need.status === "pending_pickup"
                                ? "#F59E0B"
                                : "#0D9488",
                    }}
                >
                    {need.status.replace("_", " ")}
                </div>
            </motion.div>

            {/* Pending Pickup Actions */}
            {canComplete && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border p-6 mb-6"
                    style={{
                        backgroundColor: "rgba(251, 191, 36, 0.1)",
                        borderColor: "rgba(251, 191, 36, 0.3)",
                    }}
                >
                    <h3 className="font-semibold mb-2" style={{ color: "#92400E" }}>
                        Donation Pending Pickup
                    </h3>
                    <p className="text-sm mb-4" style={{ color: "#92400E" }}>
                        A donor has pledged to fulfill this need. Coordinate with them via chat and mark as complete when you receive the item.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/home/messages"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
                            style={{ backgroundColor: "#3B82F6" }}
                        >
                            <MessageCircle size={16} />
                            Open Chat
                        </Link>
                        <button
                            onClick={handleComplete}
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                            style={{ backgroundColor: "#22C55E" }}
                        >
                            <CheckCircle size={16} />
                            Confirm Receipt
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Form */}
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onSubmit={handleSubmit}
                className="rounded-xl border p-6 space-y-6"
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(10px)",
                    borderColor: "rgba(13, 148, 136, 0.1)",
                }}
            >
                {/* Error Message */}
                {error && (
                    <div
                        className="flex items-center gap-3 p-4 rounded-lg border"
                        style={{
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            borderColor: "rgba(239, 68, 68, 0.3)",
                        }}
                    >
                        <AlertTriangle size={20} style={{ color: "#EF4444" }} />
                        <p className="text-sm" style={{ color: "#991B1B" }}>{error}</p>
                    </div>
                )}

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#1E293B" }}>
                        Title
                    </label>
                    <input
                        type="text"
                        required
                        disabled={!isEditable}
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            borderColor: "rgba(13, 148, 136, 0.2)",
                            color: "#1E293B",
                        }}
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#1E293B" }}>
                        Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                type="button"
                                disabled={!isEditable}
                                onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                                className="flex items-center gap-2 p-3 rounded-lg border text-left transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: formData.category === cat.value
                                        ? "rgba(13, 148, 136, 0.1)"
                                        : "rgba(255, 255, 255, 0.6)",
                                    borderColor: formData.category === cat.value
                                        ? "rgba(13, 148, 136, 0.4)"
                                        : "rgba(13, 148, 136, 0.1)",
                                }}
                            >
                                <span className="text-xl">{cat.icon}</span>
                                <span
                                    className="text-sm font-medium"
                                    style={{ color: formData.category === cat.value ? "#0D9488" : "#64748B" }}
                                >
                                    {cat.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#1E293B" }}>
                        Description
                    </label>
                    <textarea
                        required
                        rows={4}
                        disabled={!isEditable}
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all focus:ring-2 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            borderColor: "rgba(13, 148, 136, 0.2)",
                            color: "#1E293B",
                        }}
                    />
                </div>

                {/* Urgency & Quantity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Urgency */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#1E293B" }}>
                            Urgency
                        </label>
                        <div className="space-y-2">
                            {urgencyLevels.map((level) => (
                                <button
                                    key={level.value}
                                    type="button"
                                    disabled={!isEditable}
                                    onClick={() => setFormData(prev => ({ ...prev, urgency: level.value }))}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    style={{
                                        backgroundColor: formData.urgency === level.value
                                            ? `${level.color}15`
                                            : "rgba(255, 255, 255, 0.6)",
                                        borderColor: formData.urgency === level.value
                                            ? `${level.color}40`
                                            : "rgba(13, 148, 136, 0.1)",
                                    }}
                                >
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: level.color }}
                                    />
                                    <div>
                                        <p
                                            className="text-sm font-medium"
                                            style={{ color: formData.urgency === level.value ? level.color : "#64748B" }}
                                        >
                                            {level.label}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#1E293B" }}>
                            Quantity Needed
                        </label>
                        <input
                            type="number"
                            min="1"
                            disabled={!isEditable}
                            value={formData.quantity}
                            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                            className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.8)",
                                borderColor: "rgba(13, 148, 136, 0.2)",
                                color: "#1E293B",
                            }}
                        />
                    </div>
                </div>

                {/* Image */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#1E293B" }}>
                        Image
                    </label>
                    {imagePreview ? (
                        <div className="relative inline-block">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg"
                            />
                            {isEditable && (
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    ) : isEditable ? (
                        <label
                            className="flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed cursor-pointer transition-all hover:border-teal-400"
                            style={{ borderColor: "rgba(13, 148, 136, 0.3)" }}
                        >
                            <Upload size={24} style={{ color: "#64748B" }} />
                            <p className="text-sm mt-2" style={{ color: "#64748B" }}>
                                Click to upload an image
                            </p>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                    ) : (
                        <p className="text-sm" style={{ color: "#64748B" }}>No image uploaded</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-4 pt-4 border-t" style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}>
                    {isEditable && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            style={{ color: "#EF4444" }}
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    )}
                    <div className="flex items-center gap-4 ml-auto">
                        <Link
                            href="/home/needs"
                            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                            style={{ color: "#64748B" }}
                        >
                            {isEditable ? "Cancel" : "Back"}
                        </Link>
                        {isEditable && (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50"
                                style={{ backgroundColor: "#0D9488" }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Package size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </motion.form>
        </div>
    );
}
