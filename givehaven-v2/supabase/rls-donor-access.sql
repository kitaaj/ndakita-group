-- ============================================
-- RLS Policies for Donor Access
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- First, ensure RLS is enabled on all tables
ALTER TABLE needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE homes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- NEEDS: Read policies
-- ============================================

DROP POLICY IF EXISTS "Anyone can read active needs from verified homes" ON needs;
DROP POLICY IF EXISTS "Donors can read active needs from verified homes" ON needs;

-- Anyone (incl. anonymous) can read active needs from verified homes
CREATE POLICY "Anyone can read active needs from verified homes" ON needs
    FOR SELECT
    USING (
        status = 'active' 
        AND EXISTS (
            SELECT 1 FROM homes 
            WHERE homes.id = needs.home_id 
            AND homes.verified = true 
            AND (homes.account_status = 'active' OR homes.account_status IS NULL)
        )
    );

-- Home owners can read all their own needs (any status)
DROP POLICY IF EXISTS "Home owners can read their own needs" ON needs;
CREATE POLICY "Home owners can read their own needs" ON needs
    FOR SELECT
    USING (
        home_id IN (
            SELECT id FROM homes 
            WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- ============================================
-- NEEDS: Update policies for pledging
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can update need status for pledging" ON needs;
DROP POLICY IF EXISTS "Donors can update need status when pledging" ON needs;

-- Authenticated users can update active needs to pending_pickup (for pledging)
CREATE POLICY "Authenticated users can pledge on active needs" ON needs
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL
        AND status = 'active'
    )
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND status IN ('active', 'pending_pickup')
    );

-- Home owners can update their own needs (for marking complete, etc.)
DROP POLICY IF EXISTS "Home owners can update their own needs" ON needs;
CREATE POLICY "Home owners can update their own needs" ON needs
    FOR UPDATE
    USING (
        home_id IN (
            SELECT id FROM homes 
            WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- ============================================
-- HOMES: Public read access
-- ============================================

DROP POLICY IF EXISTS "Anyone can read verified homes" ON homes;

CREATE POLICY "Anyone can read verified homes" ON homes
    FOR SELECT
    USING (verified = true AND (account_status = 'active' OR account_status IS NULL));

-- Home owners can read their own home (any status)
DROP POLICY IF EXISTS "Home owners can read their own home" ON homes;
CREATE POLICY "Home owners can read their own home" ON homes
    FOR SELECT
    USING (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ============================================
-- CHAT_ROOMS: Create and read
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can create chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Donors can insert chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can read their own chat rooms" ON chat_rooms;

-- Authenticated users can create chat rooms (when pledging)
CREATE POLICY "Authenticated users can create chat rooms" ON chat_rooms
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND donor_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Users can read chat rooms where they are the donor OR the home owner
CREATE POLICY "Users can read their own chat rooms" ON chat_rooms
    FOR SELECT
    USING (
        donor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR home_id IN (SELECT id FROM homes WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
    );

-- ============================================
-- MESSAGES: Read, write, update
-- ============================================

DROP POLICY IF EXISTS "Users can read messages in their chat rooms" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their chat rooms" ON messages;
DROP POLICY IF EXISTS "Users can update read status of messages" ON messages;

-- Users can read messages in chat rooms they belong to
CREATE POLICY "Users can read messages in their chat rooms" ON messages
    FOR SELECT
    USING (
        room_id IN (
            SELECT id FROM chat_rooms 
            WHERE donor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            OR home_id IN (SELECT id FROM homes WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
        )
    );

-- Users can send messages in chat rooms they belong to
CREATE POLICY "Users can insert messages in their chat rooms" ON messages
    FOR INSERT
    WITH CHECK (
        room_id IN (
            SELECT id FROM chat_rooms 
            WHERE donor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            OR home_id IN (SELECT id FROM homes WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
        )
        AND sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can mark messages as read
CREATE POLICY "Users can update read status of messages" ON messages
    FOR UPDATE
    USING (
        room_id IN (
            SELECT id FROM chat_rooms 
            WHERE donor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            OR home_id IN (SELECT id FROM homes WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
        )
    );

-- ============================================
-- PROFILES: Create and read
-- ============================================

DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read any profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON profiles;

-- Allow users to create their own profile
CREATE POLICY "Users can create their own profile" ON profiles
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Allow reading profiles (needed for chat participant info)
CREATE POLICY "Authenticated users can read profiles" ON profiles
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- ============================================
-- ACTIVITY_LOGS: Insert only
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own activity logs" ON activity_logs;

CREATE POLICY "Users can insert their own activity logs" ON activity_logs
    FOR INSERT
    WITH CHECK (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );
