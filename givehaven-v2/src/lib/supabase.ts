import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Supabase configuration
// For Next.js, env vars must be prefixed with NEXT_PUBLIC_ to be available client-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Create client only if configured
export const supabase: SupabaseClient | null = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Helper to get supabase client with null check
function getClient(): SupabaseClient {
    if (!supabase) {
        throw new Error(
            "Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file."
        );
    }
    return supabase;
}

// ============================================
// AUTH HELPERS
// ============================================

export async function signInWithGoogle() {
    const client = getClient();
    const { data, error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    });
    return { data, error };
}

export async function signOut() {
    const client = getClient();
    const { error } = await client.auth.signOut();
    return { error };
}

export async function getCurrentUser() {
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();
    return user;
}

export async function getCurrentSession() {
    const client = getClient();
    const { data: { session } } = await client.auth.getSession();
    return session;
}

export async function isUserSuperAdmin(userId: string): Promise<boolean> {
    const client = getClient();
    const { data, error } = await client
        .from("profiles")
        .select("is_super_admin")
        .eq("user_id", userId)
        .single();

    if (error) {
        console.error("Error fetching super admin status:", error);
        return false;
    }

    return data?.is_super_admin ?? false;
}

// ============================================
// DATABASE TYPES
// ============================================

export type UserRole = "donor" | "home";

export interface Profile {
    id: string;
    user_id: string;
    role: UserRole;
    is_super_admin: boolean;
    display_name?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export type VerificationStatus = "received" | "reviewing" | "needs_documents" | "approved" | "rejected" | "pending" | "verified";

export interface Home {
    id: string;
    profile_id: string;
    name: string;
    verified: boolean;
    verification_status: VerificationStatus;
    latitude?: number;
    longitude?: number;
    address?: string;
    story?: string;
    logo_url?: string;
    contact_email?: string;
    contact_phone?: string;
    registration_doc_url?: string;
    created_at: string;
    updated_at: string;
}

export type NeedCategory = "food" | "clothing" | "education" | "health" | "infrastructure";
export type NeedUrgency = "low" | "medium" | "critical";
export type NeedStatus = "active" | "pending_pickup" | "completed";

export interface Need {
    id: string;
    home_id: string;
    category: NeedCategory;
    title: string;
    description: string;
    urgency: NeedUrgency;
    status: NeedStatus;
    quantity: number;
    image_url?: string;
    completed_at?: string;
    created_at: string;
    updated_at: string;
}

export interface ChatRoom {
    id: string;
    need_id: string;
    donor_id: string;
    home_id: string;
    is_active: boolean;
    created_at: string;
}

export interface Message {
    id: string;
    room_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

export type ActivityAction = "pledge" | "complete" | "cancel" | "verify" | "reject";
export type EntityType = "need" | "home" | "chat";

export interface ActivityLog {
    id: string;
    user_id: string;
    action: ActivityAction;
    entity_type: EntityType;
    entity_id: string;
    metadata: Record<string, unknown>;
    created_at: string;
}

// ============================================
// ADMIN DATA FETCHERS
// ============================================

export async function getAdminStats() {
    const client = getClient();
    const [
        { count: totalHomes },
        { count: verifiedHomes },
        { count: pendingHomes },
        { count: activeNeeds },
        { count: pendingPickup },
        { count: completedThisMonth },
        { count: totalDonors },
    ] = await Promise.all([
        client.from("homes").select("*", { count: "exact", head: true }),
        client.from("homes").select("*", { count: "exact", head: true }).eq("verified", true),
        client.from("homes").select("*", { count: "exact", head: true }).eq("verification_status", "pending"),
        client.from("needs").select("*", { count: "exact", head: true }).eq("status", "active"),
        client.from("needs").select("*", { count: "exact", head: true }).eq("status", "pending_pickup"),
        client.from("needs").select("*", { count: "exact", head: true })
            .eq("status", "completed")
            .gte("completed_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        client.from("profiles").select("*", { count: "exact", head: true }).eq("role", "donor"),
    ]);

    return {
        totalHomes: totalHomes ?? 0,
        verifiedHomes: verifiedHomes ?? 0,
        pendingHomes: pendingHomes ?? 0,
        activeNeeds: activeNeeds ?? 0,
        pendingPickup: pendingPickup ?? 0,
        completedThisMonth: completedThisMonth ?? 0,
        totalDonors: totalDonors ?? 0,
    };
}

export async function getPendingHomes() {
    const client = getClient();
    const { data, error } = await client
        .from("homes")
        .select("*")
        .neq("verification_status", "approved")
        .neq("verification_status", "rejected")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Home[];
}

export async function getAllHomes() {
    const client = getClient();
    const { data, error } = await client
        .from("homes")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Home[];
}

export async function verifyHome(homeId: string) {
    const client = getClient();
    const { error } = await client
        .from("homes")
        .update({ verified: true, verification_status: "verified" })
        .eq("id", homeId);

    if (error) throw error;
}

export async function rejectHome(homeId: string) {
    const client = getClient();
    const { error } = await client
        .from("homes")
        .update({ verified: false, verification_status: "rejected" })
        .eq("id", homeId);

    if (error) throw error;
}

export async function getAllNeeds() {
    const client = getClient();
    const { data, error } = await client
        .from("needs")
        .select(`
      *,
      homes (name)
    `)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}

export async function getRecentActivity(limit = 10) {
    const client = getClient();
    const { data, error } = await client
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

export async function getNeedsByCategory() {
    const client = getClient();
    const { data, error } = await client
        .from("needs")
        .select("category");

    if (error) throw error;

    const counts: Record<string, number> = {};
    data?.forEach((need) => {
        counts[need.category] = (counts[need.category] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
}
