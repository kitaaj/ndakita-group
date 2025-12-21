"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Bell, Shield, Save, Check, Loader2 } from "lucide-react";
import { supabase, getCurrentUser, getCurrentSession } from "@/lib/supabase";
import Image from "next/image";

interface UserProfile {
    displayName: string;
    email: string;
    avatarUrl: string;
}

export default function SettingsPage() {
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile>({
        displayName: "",
        email: "",
        avatarUrl: "",
    });
    const [notifications, setNotifications] = useState({
        newHomes: true,
        newNeeds: true,
        pledges: true,
        completions: true,
    });

    useEffect(() => {
        async function loadUserData() {
            try {
                const session = await getCurrentSession();
                if (session?.user) {
                    // Get data from Google OAuth
                    const user = session.user;
                    const metadata = user.user_metadata;

                    setProfile({
                        displayName: metadata?.full_name || metadata?.name || user.email?.split("@")[0] || "Admin",
                        email: user.email || "",
                        avatarUrl: metadata?.avatar_url || metadata?.picture || "",
                    });

                    // Load profile from database if exists
                    if (supabase) {
                        const { data: dbProfile } = await supabase
                            .from("profiles")
                            .select("display_name, avatar_url")
                            .eq("user_id", user.id)
                            .single();

                        if (dbProfile?.display_name) {
                            setProfile(prev => ({
                                ...prev,
                                displayName: dbProfile.display_name || prev.displayName,
                            }));
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load user data:", error);
            } finally {
                setLoading(false);
            }
        }

        loadUserData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const user = await getCurrentUser();
            if (user && supabase) {
                await supabase
                    .from("profiles")
                    .update({ display_name: profile.displayName })
                    .eq("user_id", user.id);
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error("Failed to save:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin" style={{ color: "#0D9488" }} />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "#1E293B" }}>Settings</h1>
                <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                    Manage your admin preferences
                </p>
            </div>

            {/* Profile Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-6"
                style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.9)",
                    boxShadow: "0 4px 20px rgba(13, 148, 136, 0.08)",
                }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }}>
                        <User size={20} style={{ color: "#0D9488" }} />
                    </div>
                    <h2 className="font-semibold text-lg" style={{ color: "#1E293B" }}>Profile</h2>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                    {profile.avatarUrl ? (
                        <Image
                            src={profile.avatarUrl}
                            alt="Profile"
                            width={64}
                            height={64}
                            className="rounded-full"
                        />
                    ) : (
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
                            style={{ backgroundColor: "#0D9488" }}
                        >
                            {profile.displayName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <p className="font-medium" style={{ color: "#1E293B" }}>{profile.displayName}</p>
                        <p className="text-sm" style={{ color: "#64748B" }}>Profile picture from Google</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: "#64748B" }}>
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={profile.displayName}
                            onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl outline-none transition-all focus:ring-2"
                            style={{
                                backgroundColor: "rgba(248, 250, 252, 0.8)",
                                border: "1px solid rgba(13, 148, 136, 0.2)",
                                color: "#1E293B",
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: "#64748B" }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={profile.email}
                            disabled
                            className="w-full px-4 py-2.5 rounded-xl outline-none cursor-not-allowed"
                            style={{
                                backgroundColor: "rgba(226, 232, 240, 0.5)",
                                border: "1px solid rgba(13, 148, 136, 0.1)",
                                color: "#64748B",
                            }}
                        />
                        <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
                            Email is managed by Google and cannot be changed here
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Notifications Section */}
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
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(251, 191, 36, 0.1)" }}>
                        <Bell size={20} style={{ color: "#D97706" }} />
                    </div>
                    <h2 className="font-semibold text-lg" style={{ color: "#1E293B" }}>Notifications</h2>
                </div>

                <div className="space-y-4">
                    {[
                        { key: "newHomes", label: "New home registrations" },
                        { key: "newNeeds", label: "New needs posted" },
                        { key: "pledges", label: "New pledges" },
                        { key: "completions", label: "Need completions" },
                    ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: "#1E293B" }}>{item.label}</span>
                            <button
                                onClick={() =>
                                    setNotifications({
                                        ...notifications,
                                        [item.key]: !notifications[item.key as keyof typeof notifications],
                                    })
                                }
                                className="relative w-12 h-6 rounded-full transition-colors"
                                style={{
                                    backgroundColor: notifications[item.key as keyof typeof notifications]
                                        ? "#0D9488"
                                        : "#E2E8F0",
                                }}
                            >
                                <span
                                    className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
                                    style={{
                                        left: notifications[item.key as keyof typeof notifications] ? "calc(100% - 20px)" : "4px",
                                    }}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Security Section */}
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
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}>
                        <Shield size={20} style={{ color: "#EF4444" }} />
                    </div>
                    <h2 className="font-semibold text-lg" style={{ color: "#1E293B" }}>Security</h2>
                </div>

                <div className="space-y-4">
                    <div className="p-4 rounded-xl" style={{ backgroundColor: "rgba(16, 185, 129, 0.05)" }}>
                        <div className="flex items-center gap-2">
                            <Check size={16} style={{ color: "#10B981" }} />
                            <span className="text-sm font-medium" style={{ color: "#10B981" }}>
                                Google OAuth Connected
                            </span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: "#64748B" }}>
                            Signed in as {profile.email}
                        </p>
                    </div>
                    <p className="text-sm" style={{ color: "#64748B" }}>
                        Super Admin access is enabled for your account
                    </p>
                </div>
            </motion.div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                style={{
                    backgroundColor: saved ? "#10B981" : "#0D9488",
                    color: "white",
                }}
            >
                {saving ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        Saving...
                    </>
                ) : saved ? (
                    <>
                        <Check size={18} />
                        Saved!
                    </>
                ) : (
                    <>
                        <Save size={18} />
                        Save Changes
                    </>
                )}
            </button>
        </div>
    );
}
