-- GiveHaven Mock Data
-- Run this in Supabase SQL Editor to populate test data

-- ============================================
-- MOCK HOMES
-- ============================================

-- Drop the foreign key constraint temporarily
ALTER TABLE homes DROP CONSTRAINT IF EXISTS homes_profile_id_fkey;

-- Insert mock homes
INSERT INTO homes (id, profile_id, name, verified, verification_status, address, story, logo_url, contact_email, created_at)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'Sunshine Children''s Home',
    true,
    'verified',
    'Westlands, Nairobi',
    'Founded in 2010, we provide care for 45 children aged 3-18 who have lost their parents.',
    'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=200&h=200&fit=crop',
    'sunshine@example.com',
    now() - interval '60 days'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000002',
    'Hope House Foundation',
    true,
    'verified',
    'Karen, Nairobi',
    'A loving home for 30 orphaned children. We focus on education and holistic development.',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=200&h=200&fit=crop',
    'hope@example.com',
    now() - interval '45 days'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000003',
    'Rainbow Kids Center',
    false,
    'pending',
    'Kilimani, Nairobi',
    'New center dedicated to providing shelter and education for street children.',
    'https://images.unsplash.com/photo-1594708767771-a7502b9ab29e?w=200&h=200&fit=crop',
    'rainbow@example.com',
    now() - interval '5 days'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  verified = EXCLUDED.verified,
  verification_status = EXCLUDED.verification_status,
  logo_url = EXCLUDED.logo_url;

-- ============================================
-- MOCK NEEDS
-- ============================================

INSERT INTO needs (id, home_id, category, title, description, urgency, status, quantity, created_at, completed_at)
VALUES
  -- Active needs
  (
    'aaaa1111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'food',
    'Monthly Rice Supply',
    'We need 50kg bags of rice to feed our 45 children for the month.',
    'critical',
    'active',
    5,
    now() - interval '3 days',
    null
  ),
  (
    'aaaa2222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'education',
    'School Textbooks',
    'Mathematics and English textbooks for Form 1-4 students.',
    'medium',
    'active',
    20,
    now() - interval '7 days',
    null
  ),
  (
    'aaaa3333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'clothing',
    'Winter Blankets',
    'Warm blankets for the cold season approaching.',
    'medium',
    'active',
    30,
    now() - interval '2 days',
    null
  ),
  (
    'aaaa4444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222222',
    'health',
    'First Aid Supplies',
    'Basic medical supplies: bandages, antiseptic, thermometers.',
    'low',
    'active',
    1,
    now() - interval '10 days',
    null
  ),
  -- Pending pickup
  (
    'aaaa5555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'food',
    'Cooking Oil',
    'Vegetable cooking oil for the kitchen.',
    'medium',
    'pending_pickup',
    10,
    now() - interval '14 days',
    null
  ),
  -- Completed needs
  (
    'aaaa6666-6666-6666-6666-666666666666',
    '11111111-1111-1111-1111-111111111111',
    'education',
    'School Uniforms',
    'Uniforms for 20 new students joining this term.',
    'critical',
    'completed',
    20,
    now() - interval '30 days',
    now() - interval '20 days'
  ),
  (
    'aaaa7777-7777-7777-7777-777777777777',
    '22222222-2222-2222-2222-222222222222',
    'infrastructure',
    'Classroom Desks',
    'New desks for the study room.',
    'medium',
    'completed',
    15,
    now() - interval '45 days',
    now() - interval '35 days'
  ),
  (
    'aaaa8888-8888-8888-8888-888888888888',
    '11111111-1111-1111-1111-111111111111',
    'food',
    'Milk for Children',
    'Fresh milk for breakfast program.',
    'medium',
    'completed',
    50,
    now() - interval '20 days',
    now() - interval '15 days'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  completed_at = EXCLUDED.completed_at;

-- ============================================
-- MOCK ACTIVITY LOGS
-- ============================================

-- Drop foreign key temporarily
ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;

INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, metadata, created_at)
VALUES
  (gen_random_uuid(), null, 'verify', 'home', '11111111-1111-1111-1111-111111111111', '{"home_name": "Sunshine Children''s Home"}', now() - interval '55 days'),
  (gen_random_uuid(), null, 'verify', 'home', '22222222-2222-2222-2222-222222222222', '{"home_name": "Hope House Foundation"}', now() - interval '40 days'),
  (gen_random_uuid(), null, 'pledge', 'need', 'aaaa5555-5555-5555-5555-555555555555', '{"need_title": "Cooking Oil", "donor": "Sarah Chen"}', now() - interval '7 days'),
  (gen_random_uuid(), null, 'pledge', 'need', 'aaaa6666-6666-6666-6666-666666666666', '{"need_title": "School Uniforms", "donor": "James Mwangi"}', now() - interval '25 days'),
  (gen_random_uuid(), null, 'pledge', 'need', 'aaaa7777-7777-7777-7777-777777777777', '{"need_title": "Classroom Desks", "donor": "Amina Hassan"}', now() - interval '40 days'),
  (gen_random_uuid(), null, 'pledge', 'need', 'aaaa8888-8888-8888-8888-888888888888', '{"need_title": "Milk for Children", "donor": "David Okonkwo"}', now() - interval '18 days'),
  (gen_random_uuid(), null, 'complete', 'need', 'aaaa6666-6666-6666-6666-666666666666', '{"need_title": "School Uniforms"}', now() - interval '20 days'),
  (gen_random_uuid(), null, 'complete', 'need', 'aaaa7777-7777-7777-7777-777777777777', '{"need_title": "Classroom Desks"}', now() - interval '35 days'),
  (gen_random_uuid(), null, 'complete', 'need', 'aaaa8888-8888-8888-8888-888888888888', '{"need_title": "Milk for Children"}', now() - interval '15 days');

-- Done! Created 3 homes, 8 needs, 9 activity logs
