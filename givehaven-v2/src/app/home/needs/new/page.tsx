"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeft,
    Package,
    AlertTriangle,
    Upload,
    X,
    Loader2,
} from "lucide-react";
import { createNeed, uploadFile, type NeedCategory, type NeedUrgency } from "@/lib/supabase";

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

export default function NewNeedPage() {
    const router = useRouter();
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
        setError(null);

        if (!formData.category) {
            setError("Please select a category");
            return;
        }

        setIsSubmitting(true);

        try {
            let imageUrl: string | undefined;

            // Upload image if provided
            if (imageFile) {
                const fileName = `needs/${Date.now()}-${imageFile.name}`;
                imageUrl = await uploadFile("images", fileName, imageFile);
            }

            await createNeed({
                home_id: "", // Will be set by the function
                title: formData.title,
                description: formData.description,
                category: formData.category as NeedCategory,
                urgency: formData.urgency,
                quantity: formData.quantity,
                image_url: imageUrl,
            });

            router.push("/home/needs");
        } catch (err) {
            console.error("Failed to create need:", err);
            setError(err instanceof Error ? err.message : "Failed to create need. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

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
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#1E293B" }}>
                        Post a New Need
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                        Describe what your home needs and donors will help.
                    </p>
                </div>
            </motion.div>

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
                        Title *
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="e.g., Winter Blankets for 20 Children"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all focus:ring-2"
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
                        Category *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                                className="flex items-center gap-2 p-3 rounded-lg border text-left transition-all"
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
                        Description *
                    </label>
                    <textarea
                        required
                        rows={4}
                        placeholder="Provide details about what you need, why it's needed, and any specific requirements..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all focus:ring-2 resize-none"
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
                                    onClick={() => setFormData(prev => ({ ...prev, urgency: level.value }))}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all"
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
                                        <p className="text-xs" style={{ color: "#94A3B8" }}>
                                            {level.description}
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
                            value={formData.quantity}
                            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                            className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all focus:ring-2"
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.8)",
                                borderColor: "rgba(13, 148, 136, 0.2)",
                                color: "#1E293B",
                            }}
                        />
                        <p className="text-xs mt-2" style={{ color: "#64748B" }}>
                            How many items do you need?
                        </p>
                    </div>
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#1E293B" }}>
                        Image (Optional)
                    </label>
                    {imagePreview ? (
                        <div className="relative inline-block">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
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
                    )}
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t" style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}>
                    <Link
                        href="/home/needs"
                        className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        style={{ color: "#64748B" }}
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: "#0D9488" }}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Posting...
                            </>
                        ) : (
                            <>
                                <Package size={18} />
                                Post Need
                            </>
                        )}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
