-- ============================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================
-- This trigger automatically creates a profile entry
-- when a new user signs up via Google OAuth (or any auth method)

-- 1. Create the function that handles new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url, role, is_super_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    'donor',
    false
  )
  ON CONFLICT (user_id) DO NOTHING; -- Skip if profile already exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing trigger if it exists (safe to run multiple times)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- VERIFY IT WORKS
-- ============================================
-- After running this, sign in with Google and check:
-- SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5;
