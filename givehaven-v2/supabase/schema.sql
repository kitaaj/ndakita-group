-- GiveHaven Database Schema
-- Version 1.0.0
-- Run this in your Supabase SQL Editor

-- ============================================
-- PROFILES TABLE
-- Links to Supabase Auth users
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('donor', 'home')) DEFAULT 'donor',
  is_super_admin BOOLEAN DEFAULT FALSE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast user lookups
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ============================================
-- HOMES TABLE
-- Public profiles for children's homes/institutions
-- ============================================
CREATE TABLE homes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  story TEXT,
  logo_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  registration_doc_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for map queries
CREATE INDEX idx_homes_location ON homes(latitude, longitude);
CREATE INDEX idx_homes_verified ON homes(verified);

-- ============================================
-- NEEDS TABLE
-- Items/resources that homes need
-- ============================================
CREATE TABLE needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID REFERENCES homes(id) ON DELETE CASCADE NOT NULL,
  category TEXT CHECK (category IN ('food', 'clothing', 'education', 'health', 'infrastructure')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'critical')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('active', 'pending_pickup', 'completed')) DEFAULT 'active',
  quantity INTEGER DEFAULT 1,
  image_url TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for filtering
CREATE INDEX idx_needs_home_id ON needs(home_id);
CREATE INDEX idx_needs_status ON needs(status);
CREATE INDEX idx_needs_category ON needs(category);
CREATE INDEX idx_needs_urgency ON needs(urgency);

-- ============================================
-- CHAT_ROOMS TABLE
-- Created when a donor pledges to fulfill a need
-- ============================================
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID REFERENCES needs(id) ON DELETE CASCADE NOT NULL,
  donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  home_id UUID REFERENCES homes(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure one room per need-donor pair
  UNIQUE(need_id, donor_id)
);

-- Indexes for room lookups
CREATE INDEX idx_chat_rooms_donor_id ON chat_rooms(donor_id);
CREATE INDEX idx_chat_rooms_home_id ON chat_rooms(home_id);
CREATE INDEX idx_chat_rooms_need_id ON chat_rooms(need_id);

-- ============================================
-- MESSAGES TABLE
-- Chat messages between donor and home
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for message listing
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- ============================================
-- ACTIVITY LOGS TABLE (for analytics)
-- ============================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('pledge', 'complete', 'cancel', 'verify', 'reject')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('need', 'home', 'chat')),
  entity_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_homes_updated_at BEFORE UPDATE ON homes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_needs_updated_at BEFORE UPDATE ON needs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
