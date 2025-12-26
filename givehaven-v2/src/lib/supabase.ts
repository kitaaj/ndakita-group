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

export type AccountStatus = "active" | "suspended" | "banned";

export interface Home {
    id: string;
    profile_id: string;
    name: string;
    verified: boolean;
    verification_status: VerificationStatus;
    account_status?: AccountStatus;
    latitude?: number;
    longitude?: number;
    address?: string;
    story?: string;
    logo_url?: string;
    cover_image_url?: string;
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

    // Count pending homes (received, reviewing, needs_documents)
    const { count: pendingHomesCount } = await client
        .from("homes")
        .select("*", { count: "exact", head: true })
        .in("verification_status", ["received", "reviewing", "needs_documents"]);

    const [
        { count: totalHomes },
        { count: verifiedHomes },
        { count: activeNeeds },
        { count: pendingPickup },
        { count: completedThisMonth },
        { count: totalDonors },
    ] = await Promise.all([
        client.from("homes").select("*", { count: "exact", head: true }),
        client.from("homes").select("*", { count: "exact", head: true }).eq("verification_status", "approved"),
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
        pendingHomes: pendingHomesCount ?? 0,
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

// ============================================
// HOME OWNER HELPERS
// ============================================

export interface CreateHomeData {
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    story?: string;
    contact_email?: string;
    contact_phone?: string;
    logo_url?: string;
    registration_doc_url?: string;
}

export type UpdateHomeData = Partial<CreateHomeData>;

export interface CreateNeedData {
    home_id: string;
    category: NeedCategory;
    title: string;
    description: string;
    urgency?: NeedUrgency;
    quantity?: number;
    image_url?: string;
}

export interface UpdateNeedData extends Partial<Omit<CreateNeedData, 'home_id'>> {
    status?: NeedStatus;
}

// Get the current user's home profile
export async function getMyHome(): Promise<Home | null> {
    const client = getClient();
    const user = await getCurrentUser();

    if (!user) return null;

    // First get the profile
    const { data: profile, error: profileError } = await client
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (profileError || !profile) return null;

    // Then get the home linked to this profile
    const { data: home, error: homeError } = await client
        .from("homes")
        .select("*")
        .eq("profile_id", profile.id)
        .single();

    if (homeError) return null;
    return home as Home;
}

// Get the current user's profile
export async function getMyProfile(): Promise<Profile | null> {
    const client = getClient();
    const user = await getCurrentUser();

    if (!user) return null;

    const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (error) return null;
    return data as Profile;
}

// Create a new home
export async function createHome(data: CreateHomeData): Promise<Home> {
    const client = getClient();
    const user = await getCurrentUser();

    if (!user) throw new Error("Not authenticated");

    console.log("createHome - user id:", user.id);

    // Try to get profile
    let profile = await getMyProfile();

    // If no profile exists, create one
    if (!profile) {
        console.log("createHome - No profile found, creating one...");
        const { data: newProfile, error: profileError } = await client
            .from("profiles")
            .insert({
                user_id: user.id,
                role: "home",
                display_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Home User",
                avatar_url: user.user_metadata?.avatar_url,
            })
            .select()
            .single();

        if (profileError) {
            console.error("createHome - Failed to create profile:", profileError);
            throw new Error(`Failed to create profile: ${profileError.message}`);
        }
        profile = newProfile as Profile;
        console.log("createHome - Created profile:", profile.id);
    }

    console.log("createHome - Using profile id:", profile.id);

    const { data: home, error } = await client
        .from("homes")
        .insert({
            ...data,
            profile_id: profile.id,
            verification_status: "pending",
            verified: false,
        })
        .select()
        .single();

    if (error) {
        console.error("createHome - Failed to insert home:", error);
        throw error;
    }

    // Update profile role to 'home'
    await client
        .from("profiles")
        .update({ role: "home" })
        .eq("id", profile.id);

    return home as Home;
}

// Update home profile
export async function updateMyHome(data: UpdateHomeData): Promise<void> {
    const client = getClient();
    const home = await getMyHome();

    if (!home) throw new Error("No home found");

    const { error } = await client
        .from("homes")
        .update(data)
        .eq("id", home.id);

    if (error) throw error;
}

// Get needs for the current home
export async function getMyNeeds(): Promise<Need[]> {
    const client = getClient();
    const home = await getMyHome();

    if (!home) return [];

    const { data, error } = await client
        .from("needs")
        .select("*")
        .eq("home_id", home.id)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Need[];
}

// Create a new need
export async function createNeed(data: CreateNeedData): Promise<Need> {
    const client = getClient();
    const home = await getMyHome();

    if (!home) throw new Error("No home found");
    if (!home.verified) throw new Error("Home must be verified to create needs");

    const { data: need, error } = await client
        .from("needs")
        .insert({
            ...data,
            home_id: home.id,
            status: "active",
        })
        .select()
        .single();

    if (error) throw error;

    // Log activity
    const profile = await getMyProfile();
    if (profile) {
        await client.from("activity_logs").insert({
            user_id: profile.id,
            action: "pledge",
            entity_type: "need",
            entity_id: need.id,
            metadata: { title: need.title, category: need.category },
        });
    }

    return need as Need;
}

// Update a need
export async function updateNeed(needId: string, data: UpdateNeedData): Promise<void> {
    const client = getClient();
    const home = await getMyHome();

    if (!home) throw new Error("No home found");

    const { error } = await client
        .from("needs")
        .update(data)
        .eq("id", needId)
        .eq("home_id", home.id);

    if (error) throw error;
}

// Delete a need (only if active)
export async function deleteNeed(needId: string): Promise<void> {
    const client = getClient();
    const home = await getMyHome();

    if (!home) throw new Error("No home found");

    const { error } = await client
        .from("needs")
        .delete()
        .eq("id", needId)
        .eq("home_id", home.id)
        .eq("status", "active");

    if (error) throw error;
}

// Mark need as completed
export async function completeNeed(needId: string): Promise<void> {
    const client = getClient();
    const home = await getMyHome();

    if (!home) throw new Error("No home found");

    const { error } = await client
        .from("needs")
        .update({
            status: "completed",
            completed_at: new Date().toISOString(),
        })
        .eq("id", needId)
        .eq("home_id", home.id);

    if (error) throw error;

    // Log activity
    const profile = await getMyProfile();
    if (profile) {
        await client.from("activity_logs").insert({
            user_id: profile.id,
            action: "complete",
            entity_type: "need",
            entity_id: needId,
            metadata: {},
        });
    }
}

// Get chat rooms for the current home
export async function getMyHomeChatRooms(): Promise<(ChatRoom & { need?: Need; donor_profile?: Profile })[]> {
    const client = getClient();
    const home = await getMyHome();

    if (!home) return [];

    const { data, error } = await client
        .from("chat_rooms")
        .select(`
            *,
            needs (*),
            profiles!chat_rooms_donor_id_fkey (*)
        `)
        .eq("home_id", home.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as (ChatRoom & { need?: Need; donor_profile?: Profile })[];
}

// Upload file to Supabase Storage
// For private buckets (like 'documents'), stores the path for later signed URL generation
// For public buckets (like 'images'), returns the public URL
export async function uploadFile(bucket: string, path: string, file: File): Promise<string> {
    const client = getClient();

    const { error } = await client.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

    if (error) throw error;

    // For private buckets, return a special format that we can use to generate signed URLs
    if (bucket === 'documents') {
        // Return in format: "bucket:path" so we can parse it later for signed URL
        return `${bucket}:${path}`;
    }

    // For public buckets, return the public URL
    const { data } = client.storage
        .from(bucket)
        .getPublicUrl(path);

    return data.publicUrl;
}

// Get a signed URL for accessing private files (expires in 10 minutes)
export async function getSignedUrl(storedPath: string, expiresInSeconds: number = 600): Promise<string | null> {
    const client = getClient();

    // Check if it's a bucket:path format
    if (storedPath.includes(':') && !storedPath.startsWith('http')) {
        const [bucket, path] = storedPath.split(':');
        const { data, error } = await client.storage
            .from(bucket)
            .createSignedUrl(path, expiresInSeconds);

        if (error) {
            console.error('Failed to create signed URL:', error);
            return null;
        }
        return data.signedUrl;
    }

    // If it's already a full URL (legacy or public bucket), return as-is
    if (storedPath.startsWith('http')) {
        // For old public URLs, try to extract bucket and path to create signed URL
        const match = storedPath.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
        if (match) {
            const [, bucket, path] = match;
            const { data, error } = await client.storage
                .from(bucket)
                .createSignedUrl(path, expiresInSeconds);

            if (error) {
                console.error('Failed to create signed URL from public URL:', error);
                return storedPath; // Fall back to original URL
            }
            return data.signedUrl;
        }
        return storedPath;
    }

    return null;
}

// Get home stats for dashboard
export async function getHomeStats(homeId: string) {
    const client = getClient();

    const [
        { count: activeNeeds },
        { count: pendingPickup },
        { count: completedThisMonth },
        { count: unreadMessages },
    ] = await Promise.all([
        client.from("needs").select("*", { count: "exact", head: true })
            .eq("home_id", homeId).eq("status", "active"),
        client.from("needs").select("*", { count: "exact", head: true })
            .eq("home_id", homeId).eq("status", "pending_pickup"),
        client.from("needs").select("*", { count: "exact", head: true })
            .eq("home_id", homeId).eq("status", "completed")
            .gte("completed_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        client.from("chat_rooms")
            .select("id", { count: "exact", head: true })
            .eq("home_id", homeId)
            .eq("is_active", true),
    ]);

    return {
        activeNeeds: activeNeeds ?? 0,
        pendingPickup: pendingPickup ?? 0,
        completedThisMonth: completedThisMonth ?? 0,
        unreadMessages: unreadMessages ?? 0,
    };
}

// ============================================
// DONOR HELPERS (Public-Facing)
// ============================================

export interface PublicNeed extends Need {
    home: Pick<Home, 'id' | 'name' | 'logo_url' | 'address' | 'verified'>;
}

// Get all active needs from verified homes (for explore page)
export async function getPublicActiveNeeds(): Promise<PublicNeed[]> {
    const client = getClient();

    const { data, error } = await client
        .from("needs")
        .select(`
            *,
            homes!inner (id, name, logo_url, address, verified)
        `)
        .eq("status", "active")
        .eq("homes.verified", true)
        .order("urgency", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
        ...item,
        home: item.homes,
    })) as PublicNeed[];
}

// Get a specific home's public profile
export async function getPublicHomeProfile(homeId: string): Promise<Home | null> {
    const client = getClient();

    const { data, error } = await client
        .from("homes")
        .select("*")
        .eq("id", homeId)
        .eq("verified", true)
        .single();

    if (error) return null;
    return data as Home;
}

// Get active needs for a specific home (public view)
export async function getPublicHomeNeeds(homeId: string): Promise<Need[]> {
    const client = getClient();

    const { data, error } = await client
        .from("needs")
        .select("*")
        .eq("home_id", homeId)
        .eq("status", "active")
        .order("urgency", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Need[];
}

// Create a pledge (donor claims a need)
export async function createPledge(needId: string): Promise<{ chatRoomId: string }> {
    const client = getClient();
    const user = await getCurrentUser();

    if (!user) throw new Error("Not authenticated");

    // Get or create donor profile
    let profile = await getMyProfile();
    if (!profile) {
        const { data: newProfile, error: profileError } = await client
            .from("profiles")
            .insert({
                user_id: user.id,
                role: "donor",
                display_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Donor",
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
            })
            .select()
            .single();

        if (profileError) throw new Error(`Failed to create profile: ${profileError.message}`);
        profile = newProfile as Profile;
    } else if (!profile.avatar_url && (user.user_metadata?.avatar_url || user.user_metadata?.picture)) {
        // Update existing profile with Google avatar if missing
        await client
            .from("profiles")
            .update({
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
                display_name: profile.display_name || user.user_metadata?.full_name || user.email?.split("@")[0],
            })
            .eq("id", profile.id);
        profile.avatar_url = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    }

    // Get the need to find the home_id
    const { data: need, error: needError } = await client
        .from("needs")
        .select("*, homes!inner(id)")
        .eq("id", needId)
        .eq("status", "active")
        .single();

    if (needError || !need) throw new Error("Need not found or already claimed");

    // Update need status to pending_pickup
    const { error: updateError } = await client
        .from("needs")
        .update({ status: "pending_pickup" })
        .eq("id", needId);

    if (updateError) throw updateError;

    // Create the chat room
    const { data: chatRoom, error: chatError } = await client
        .from("chat_rooms")
        .insert({
            need_id: needId,
            donor_id: profile.id,
            home_id: need.homes.id,
            is_active: true,
        })
        .select()
        .single();

    if (chatError) {
        await client.from("needs").update({ status: "active" }).eq("id", needId);
        throw chatError;
    }

    // Log the pledge activity
    await client.from("activity_logs").insert({
        user_id: profile.id,
        action: "pledge",
        entity_type: "need",
        entity_id: needId,
        metadata: { need_title: need.title, chat_room_id: chatRoom.id },
    });

    return { chatRoomId: chatRoom.id };
}

// Get donor's active chat rooms
export async function getMyDonorChats(): Promise<(ChatRoom & { need?: Need; home?: Home })[]> {
    const client = getClient();
    const profile = await getMyProfile();

    if (!profile) return [];

    const { data, error } = await client
        .from("chat_rooms")
        .select(`*, needs (*), homes (*)`)
        .eq("donor_id", profile.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
        ...item,
        need: item.needs,
        home: item.homes,
    })) as (ChatRoom & { need?: Need; home?: Home })[];
}

// Get messages for a chat room
export async function getChatMessages(roomId: string): Promise<Message[]> {
    const client = getClient();

    const { data, error } = await client
        .from("messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data as Message[];
}

// Send a message in a chat room
export async function sendMessage(roomId: string, content: string): Promise<Message> {
    const client = getClient();
    const profile = await getMyProfile();

    if (!profile) throw new Error("Not authenticated");

    const { data, error } = await client
        .from("messages")
        .insert({ room_id: roomId, sender_id: profile.id, content })
        .select()
        .single();

    if (error) throw error;
    return data as Message;
}

// Mark messages as read in a chat room
export async function markMessagesAsRead(roomId: string): Promise<void> {
    const client = getClient();
    const profile = await getMyProfile();

    if (!profile) return;

    const { error } = await client
        .from("messages")
        .update({ is_read: true })
        .eq("room_id", roomId)
        .neq("sender_id", profile.id);

    if (error) throw error;
}

// Get a specific chat room with details
export async function getChatRoom(roomId: string): Promise<(ChatRoom & { need?: Need; home?: Home }) | null> {
    const client = getClient();

    const { data, error } = await client
        .from("chat_rooms")
        .select(`*, needs (*), homes (*)`)
        .eq("id", roomId)
        .single();

    if (error) return null;
    return { ...data, need: data.needs, home: data.homes } as ChatRoom & { need?: Need; home?: Home };
}

// Confirm receipt of donation (called by home owner)
export async function confirmDonationReceipt(needId: string): Promise<void> {
    const client = getClient();
    const home = await getMyHome();

    if (!home) throw new Error("Not authenticated as home");

    const { error } = await client
        .from("needs")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", needId)
        .eq("home_id", home.id);

    if (error) throw error;

    await client.from("chat_rooms").update({ is_active: false }).eq("need_id", needId);

    const profile = await getMyProfile();
    if (profile) {
        await client.from("activity_logs").insert({
            user_id: profile.id,
            action: "complete",
            entity_type: "need",
            entity_id: needId,
            metadata: {},
        });
    }
}

// ============================================
// NOTIFICATION BADGE HELPERS
// ============================================

// Get unread message count for a donor (across all their chat rooms)
export async function getDonorUnreadCount(): Promise<number> {
    const client = getClient();
    const profile = await getMyProfile();
    if (!profile) return 0;

    // Get all chat rooms where the donor is the donor_id
    const { data: rooms, error: roomsError } = await client
        .from("chat_rooms")
        .select("id")
        .eq("donor_id", profile.id)
        .eq("is_active", true);

    if (roomsError || !rooms || rooms.length === 0) return 0;

    const roomIds = rooms.map((r) => r.id);

    // Count unread messages in those rooms (messages not sent by this user and not read)
    const { count, error } = await client
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("room_id", roomIds)
        .neq("sender_id", profile.id)
        .eq("is_read", false);

    if (error) return 0;
    return count || 0;
}

// Get unread message count for a home owner (across all their home's chat rooms)
export async function getHomeUnreadCount(): Promise<number> {
    const client = getClient();
    const home = await getMyHome();
    if (!home) return 0;

    const profile = await getMyProfile();
    if (!profile) return 0;

    // Get all chat rooms for this home
    const { data: rooms, error: roomsError } = await client
        .from("chat_rooms")
        .select("id")
        .eq("home_id", home.id)
        .eq("is_active", true);

    if (roomsError || !rooms || rooms.length === 0) return 0;

    const roomIds = rooms.map((r) => r.id);

    // Count unread messages in those rooms (messages not sent by this user and not read)
    const { count, error } = await client
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("room_id", roomIds)
        .neq("sender_id", profile.id)
        .eq("is_read", false);

    if (error) return 0;
    return count || 0;
}

// Get pending pledges count for a home owner (needs in pending_pickup status)
export async function getHomePendingPledgesCount(): Promise<number> {
    const client = getClient();
    const home = await getMyHome();
    if (!home) return 0;

    const { count, error } = await client
        .from("needs")
        .select("*", { count: "exact", head: true })
        .eq("home_id", home.id)
        .eq("status", "pending_pickup");

    if (error) return 0;
    return count || 0;
}
