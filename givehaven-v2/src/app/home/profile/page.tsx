"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
    User,
    MapPin,
    Phone,
    Mail,
    FileText,
    Loader2,
    CheckCircle,
    AlertTriangle,
    Pencil,
    Check,
    X,
    BadgeCheck,
    Calendar,
    Camera,
} from "lucide-react";
import { getMyHome, updateMyHome, uploadFile, type Home } from "@/lib/supabase";

// Editable Field Component - WhatsApp style
function EditableField({
    label,
    value,
    field,
    icon: Icon,
    placeholder,
    multiline = false,
    onSave,
}: {
    label: string;
    value: string;
    field: string;
    icon?: typeof User;
    placeholder?: string;
    multiline?: boolean;
    onSave: (field: string, value: string) => Promise<void>;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    useEffect(() => {
        setEditValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = async () => {
        if (editValue === value) {
            setIsEditing(false);
            return;
        }
        setIsSaving(true);
        try {
            await onSave(field, editValue);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditValue(value);
        setIsEditing(false);
    };

    return (
        <div className="py-4 border-b" style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}>
            <div className="flex items-center gap-2 mb-1">
                {Icon && <Icon size={14} style={{ color: "#64748B" }} />}
                <span className="text-xs font-medium" style={{ color: "#64748B" }}>
                    {label}
                </span>
            </div>

            {isEditing ? (
                <div className="flex items-start gap-2 mt-2">
                    {multiline ? (
                        <textarea
                            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder={placeholder}
                            rows={3}
                            className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2"
                            style={{
                                borderColor: "#0D9488",
                                color: "#1E293B",
                            }}
                        />
                    ) : (
                        <input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder={placeholder}
                            className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2"
                            style={{
                                borderColor: "#0D9488",
                                color: "#1E293B",
                            }}
                        />
                    )}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="p-2 rounded-full transition-colors hover:bg-teal-50"
                        style={{ color: "#0D9488" }}
                        aria-label="Save"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="p-2 rounded-full transition-colors hover:bg-red-50"
                        style={{ color: "#EF4444" }}
                        aria-label="Cancel"
                    >
                        <X size={18} />
                    </button>
                </div>
            ) : (
                <div
                    className="flex items-center justify-between group cursor-pointer"
                    onClick={() => setIsEditing(true)}
                >
                    <p
                        className="text-sm"
                        style={{ color: value ? "#1E293B" : "#94A3B8" }}
                    >
                        {value || placeholder || "Not set"}
                    </p>
                    <button
                        type="button"
                        className="p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: "#64748B" }}
                        aria-label="Edit"
                    >
                        <Pencil size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default function ProfilePage() {
    const [home, setHome] = useState<Home | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);

    const isVerified = home?.verified || home?.verification_status === "approved" || home?.verification_status === "verified";

    async function loadHome() {
        try {
            const homeData = await getMyHome();
            if (homeData) {
                setHome(homeData);
                if (homeData.logo_url) {
                    setLogoPreview(homeData.logo_url);
                }
                if (homeData.cover_image_url) {
                    setCoverPreview(homeData.cover_image_url);
                }
            }
        } catch (error) {
            console.error("Failed to load home:", error);
        } finally {
            setIsLoading(false);
        }
    }


    useEffect(() => {
        loadHome();
    }, []);

    async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            setIsUploadingLogo(true);
            try {
                const fileName = `logos/${Date.now()}-${file.name}`;
                const logoUrl = await uploadFile("images", fileName, file);
                await updateMyHome({ logo_url: logoUrl });
                setHome(prev => prev ? { ...prev, logo_url: logoUrl } : null);
                setSuccessMessage("Profile photo updated!");
                setTimeout(() => setSuccessMessage(null), 3000);
            } catch (err) {
                console.error("Failed to upload logo:", err);
                setError("Failed to upload photo");
            } finally {
                setIsUploadingLogo(false);
            }
        }
    }

    async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            setIsUploadingCover(true);
            try {
                const fileName = `covers/${Date.now()}-${file.name}`;
                const coverUrl = await uploadFile("images", fileName, file);
                await updateMyHome({ cover_image_url: coverUrl });
                setHome(prev => prev ? { ...prev, cover_image_url: coverUrl } : null);
                setSuccessMessage("Cover image updated!");
                setTimeout(() => setSuccessMessage(null), 3000);
            } catch (err) {
                console.error("Failed to upload cover:", err);
                setError("Failed to upload cover image");
            } finally {
                setIsUploadingCover(false);
            }
        }
    }

    async function handleFieldSave(field: string, value: string) {
        try {
            await updateMyHome({ [field]: value });
            setHome(prev => prev ? { ...prev, [field]: value } : null);
            setSuccessMessage("Saved!");
            setTimeout(() => setSuccessMessage(null), 2000);
        } catch (err) {
            console.error("Failed to update:", err);
            throw err;
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
        });
    };

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

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Verification Pending Banner - only show for non-verified */}
            {!isVerified && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border p-4"
                    style={{
                        backgroundColor: "rgba(251, 191, 36, 0.1)",
                        borderColor: "rgba(251, 191, 36, 0.3)",
                    }}
                >
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={24} style={{ color: "#F59E0B" }} />
                        <div>
                            <h3 className="font-semibold text-sm" style={{ color: "#92400E" }}>
                                Verification Pending
                            </h3>
                            <p className="text-xs" style={{ color: "#92400E" }}>
                                Your verification is under review. This usually takes 1-2 business days.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Success/Error Messages */}
            {successMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
                >
                    <CheckCircle size={18} style={{ color: "#22C55E" }} />
                    <p className="text-sm" style={{ color: "#166534" }}>{successMessage}</p>
                </motion.div>
            )}

            {error && (
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}>
                    <AlertTriangle size={18} style={{ color: "#EF4444" }} />
                    <p className="text-sm" style={{ color: "#991B1B" }}>{error}</p>
                </div>
            )}

            {/* Twitter-Style Profile Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl overflow-hidden relative"
                style={{
                    background: "white",
                    border: "1px solid rgba(13, 148, 136, 0.1)",
                    boxShadow: "0 4px 20px rgba(13, 148, 136, 0.08)",
                }}
            >
                {/* Cover Image - Uploadable */}
                <label className="block h-32 relative cursor-pointer group">
                    {coverPreview ? (
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${coverPreview})` }}
                        />
                    ) : (
                        <div
                            className="w-full h-full"
                            style={{
                                background: "linear-gradient(135deg, #0D9488 0%, #115E59 50%, #134E4A 100%)",
                            }}
                        >
                            {/* Decorative pattern */}
                            <div
                                className="absolute inset-0 opacity-10"
                                style={{
                                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                                }}
                            />
                        </div>
                    )}
                    {/* Hover overlay for cover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {isUploadingCover ? (
                            <Loader2 size={24} className="text-white animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2 text-white">
                                <Camera size={20} />
                                <span className="text-sm font-medium">Change cover</span>
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverChange}
                    />
                </label>

                {/* Profile Photo - Absolutely positioned overlapping cover */}
                <div className="relative px-6">
                    <label className="absolute -top-12 left-6 cursor-pointer group">
                        <div
                            className="w-24 h-24 rounded-full border-4 overflow-hidden"
                            style={{ borderColor: "white", backgroundColor: "white" }}
                        >
                            {logoPreview ? (
                                <div className="w-full h-full relative">
                                    <Image
                                        src={logoPreview}
                                        alt="Profile"
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-cover"
                                        unoptimized
                                    />
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-full">
                                        {isUploadingLogo ? (
                                            <Loader2 size={20} className="text-white animate-spin" />
                                        ) : (
                                            <Camera size={20} className="text-white" />
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="w-full h-full flex flex-col items-center justify-center transition-colors group-hover:bg-teal-100"
                                    style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }}
                                >
                                    <User size={32} style={{ color: "#0D9488" }} />
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoChange}
                        />
                    </label>

                    {/* Spacer for profile photo */}
                    <div className="h-14" />

                    {/* Name and Verification Badge */}
                    <div className="mt-2">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold" style={{ color: "#1E293B" }}>
                                {home?.name || "Your Home"}
                            </h1>
                            {isVerified && (
                                <BadgeCheck size={20} style={{ color: "#0D9488" }} />
                            )}
                        </div>
                    </div>

                    {/* Info Row - Location & Joined Date */}
                    <div className="flex items-center gap-4 mt-2 flex-wrap text-sm" style={{ color: "#64748B" }}>
                        {home?.address && (
                            <div className="flex items-center gap-1">
                                <MapPin size={14} />
                                <span>{home.address}</span>
                            </div>
                        )}
                        {home?.created_at && (
                            <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>Joined {formatDate(home.created_at)}</span>
                            </div>
                        )}
                    </div>

                    {/* Bio/Story section */}
                    {home?.story && (
                        <p className="mt-3 text-sm pb-6" style={{ color: "#1E293B" }}>
                            {home.story}
                        </p>
                    )}
                    {!home?.story && <div className="pb-6" />}
                </div>
            </motion.div>

            {/* Editable Details Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border overflow-hidden"
                style={{
                    backgroundColor: "white",
                    borderColor: "rgba(13, 148, 136, 0.1)",
                }}
            >
                <div className="px-6 pt-4">
                    <h2 className="font-semibold" style={{ color: "#1E293B" }}>Profile Details</h2>
                    <p className="text-xs" style={{ color: "#64748B" }}>Click any field to edit</p>
                </div>

                <div className="px-6">
                    <EditableField
                        label="Home Name"
                        value={home?.name || ""}
                        field="name"
                        placeholder="Enter your home name"
                        onSave={handleFieldSave}
                    />

                    <EditableField
                        label="Address"
                        value={home?.address || ""}
                        field="address"
                        icon={MapPin}
                        placeholder="e.g., 123 Main Street, Nairobi, Kenya"
                        onSave={handleFieldSave}
                    />

                    <EditableField
                        label="Contact Email"
                        value={home?.contact_email || ""}
                        field="contact_email"
                        icon={Mail}
                        placeholder="contact@example.com"
                        onSave={handleFieldSave}
                    />

                    <EditableField
                        label="Contact Phone"
                        value={home?.contact_phone || ""}
                        field="contact_phone"
                        icon={Phone}
                        placeholder="+254 712 345 678"
                        onSave={handleFieldSave}
                    />

                    <EditableField
                        label="About Your Home"
                        value={home?.story || ""}
                        field="story"
                        placeholder="Tell donors about your home, mission, and the children you serve..."
                        multiline
                        onSave={handleFieldSave}
                    />
                </div>

                {/* Verification Document Section */}
                <div className="p-6 border-t" style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}>
                    <div className="flex items-center gap-2 mb-2">
                        <FileText size={14} style={{ color: "#64748B" }} />
                        <span className="text-xs font-medium" style={{ color: "#64748B" }}>
                            Verification Document
                        </span>
                    </div>
                    {home?.registration_doc_url ? (
                        <div
                            className="flex items-center gap-2 px-3 py-2 rounded-lg w-fit"
                            style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }}
                        >
                            <FileText size={14} style={{ color: "#0D9488" }} />
                            <span className="text-sm" style={{ color: "#0D9488" }}>
                                Document uploaded
                            </span>
                            <CheckCircle size={12} style={{ color: "#0D9488" }} />
                        </div>
                    ) : (
                        <p className="text-sm" style={{ color: "#94A3B8" }}>
                            No document uploaded yet.
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
