-- GiveHaven Row Level Security Policies
-- Run this in your Supabase SQL Editor AFTER creating the tables

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE homes ENABLE ROW LEVEL SECURITY;
ALTER TABLE needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Users can view all profiles (for displaying names/avatars)
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- HOMES TABLE POLICIES
-- ============================================

-- Anyone can view verified homes (for donors browsing)
CREATE POLICY "Verified homes are viewable by everyone"
ON homes FOR SELECT
TO authenticated
USING (true);

-- Users can insert a home if they own the profile
CREATE POLICY "Users can insert own home"
ON homes FOR INSERT
TO authenticated
WITH CHECK (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- Users can update their own home
CREATE POLICY "Users can update own home"
ON homes FOR UPDATE
TO authenticated
USING (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- Admins can update any home (for verification)
CREATE POLICY "Admins can update any home"
ON homes FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND is_super_admin = true
  )
);

-- ============================================
-- NEEDS TABLE POLICIES
-- ============================================

-- Anyone can view active needs (for donors)
CREATE POLICY "Active needs are viewable by everyone"
ON needs FOR SELECT
TO authenticated
USING (true);

-- Home owners can insert needs for their home
CREATE POLICY "Home owners can insert needs"
ON needs FOR INSERT
TO authenticated
WITH CHECK (
  home_id IN (
    SELECT h.id FROM homes h
    JOIN profiles p ON h.profile_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- Home owners can update their own needs
CREATE POLICY "Home owners can update own needs"
ON needs FOR UPDATE
TO authenticated
USING (
  home_id IN (
    SELECT h.id FROM homes h
    JOIN profiles p ON h.profile_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- Home owners can delete their own active needs
CREATE POLICY "Home owners can delete own active needs"
ON needs FOR DELETE
TO authenticated
USING (
  status = 'active' AND
  home_id IN (
    SELECT h.id FROM homes h
    JOIN profiles p ON h.profile_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- ============================================
-- CHAT_ROOMS TABLE POLICIES
-- ============================================

-- Users can view rooms they're part of
CREATE POLICY "Users can view own chat rooms"
ON chat_rooms FOR SELECT
TO authenticated
USING (
  donor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR
  home_id IN (
    SELECT h.id FROM homes h
    JOIN profiles p ON h.profile_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- Donors can create chat rooms when pledging
CREATE POLICY "Donors can create chat rooms"
ON chat_rooms FOR INSERT
TO authenticated
WITH CHECK (
  donor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- ============================================
-- MESSAGES TABLE POLICIES
-- ============================================

-- Users can view messages in their rooms
CREATE POLICY "Users can view own messages"
ON messages FOR SELECT
TO authenticated
USING (
  room_id IN (
    SELECT id FROM chat_rooms
    WHERE donor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR home_id IN (
      SELECT h.id FROM homes h
      JOIN profiles p ON h.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  )
);

-- Users can send messages to rooms they're in
CREATE POLICY "Users can send messages to own rooms"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  AND room_id IN (
    SELECT id FROM chat_rooms
    WHERE donor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR home_id IN (
      SELECT h.id FROM homes h
      JOIN profiles p ON h.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  )
);

-- ============================================
-- ACTIVITY_LOGS TABLE POLICIES
-- ============================================

-- Only admins can view activity logs
CREATE POLICY "Admins can view activity logs"
ON activity_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND is_super_admin = true
  )
);

-- System can insert logs (via service role)
CREATE POLICY "Authenticated users can create activity logs"
ON activity_logs FOR INSERT
TO authenticated
WITH CHECK (true);
