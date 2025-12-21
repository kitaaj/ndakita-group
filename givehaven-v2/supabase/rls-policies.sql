-- GiveHaven Row Level Security Policies
-- Version 1.0.0
-- Run this AFTER schema.sql in your Supabase SQL Editor

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
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile (includes is_super_admin check)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- New users can insert their profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- NOTE: Removed "Super admins can view all profiles" policy
-- It caused infinite recursion when checking is_super_admin
-- Super admin access to other profiles should use service role key instead


-- ============================================
-- HOMES POLICIES
-- ============================================

-- Anyone can view verified homes
CREATE POLICY "Anyone can view verified homes"
  ON homes FOR SELECT
  USING (verified = TRUE);

-- Home owners can view their own home (even if not verified)
CREATE POLICY "Owners can view own home"
  ON homes FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Home owners can update their own home
CREATE POLICY "Owners can update own home"
  ON homes FOR UPDATE
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Home role users can insert homes
CREATE POLICY "Home users can create homes"
  ON homes FOR INSERT
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'home'
    )
  );

-- Super admins can do anything with homes
CREATE POLICY "Super admins full access to homes"
  ON homes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_super_admin = TRUE
    )
  );

-- ============================================
-- NEEDS POLICIES
-- ============================================

-- Anyone can view active needs from verified homes
CREATE POLICY "Anyone can view active needs"
  ON needs FOR SELECT
  USING (
    status = 'active' AND
    home_id IN (SELECT id FROM homes WHERE verified = TRUE)
  );

-- Donors can view needs they've pledged for
CREATE POLICY "Donors can view pledged needs"
  ON needs FOR SELECT
  USING (
    id IN (
      SELECT need_id FROM chat_rooms
      WHERE donor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- Home owners can view/create/update their own needs
CREATE POLICY "Homes can view own needs"
  ON needs FOR SELECT
  USING (
    home_id IN (
      SELECT id FROM homes WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Homes can create own needs"
  ON needs FOR INSERT
  WITH CHECK (
    home_id IN (
      SELECT id FROM homes WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'home'
      )
    )
  );

CREATE POLICY "Homes can update own needs"
  ON needs FOR UPDATE
  USING (
    home_id IN (
      SELECT id FROM homes WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Super admins full access
CREATE POLICY "Super admins full access to needs"
  ON needs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_super_admin = TRUE
    )
  );

-- ============================================
-- CHAT_ROOMS POLICIES
-- ============================================

-- Participants can view their chat rooms
CREATE POLICY "Participants can view chat rooms"
  ON chat_rooms FOR SELECT
  USING (
    donor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    home_id IN (
      SELECT id FROM homes WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Donors can create chat rooms (pledge)
CREATE POLICY "Donors can create chat rooms"
  ON chat_rooms FOR INSERT
  WITH CHECK (
    donor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'donor')
  );

-- ============================================
-- MESSAGES POLICIES
-- ============================================

-- Only chat participants can view messages
CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT
  USING (
    room_id IN (
      SELECT id FROM chat_rooms
      WHERE donor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
         OR home_id IN (
              SELECT id FROM homes WHERE profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
              )
            )
    )
  );

-- Chat participants can send messages
CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) AND
    room_id IN (
      SELECT id FROM chat_rooms
      WHERE donor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
         OR home_id IN (
              SELECT id FROM homes WHERE profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
              )
            )
    )
  );

-- ============================================
-- ACTIVITY_LOGS POLICIES
-- ============================================

-- Users can view their own activity
CREATE POLICY "Users can view own activity"
  ON activity_logs FOR SELECT
  USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- System/triggers can insert logs
CREATE POLICY "System can insert logs"
  ON activity_logs FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Super admins can view all activity
CREATE POLICY "Super admins can view all activity"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_super_admin = TRUE
    )
  );
