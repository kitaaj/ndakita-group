-- Add fulfilled_quantity to needs table (defaults to 0)
ALTER TABLE needs 
ADD COLUMN fulfilled_quantity INTEGER DEFAULT 0;

-- Add quantity to chat_rooms table (to track pledge amount per donor)
ALTER TABLE chat_rooms 
ADD COLUMN quantity INTEGER;

-- Add is_home_owner flag to profiles (allows dual roles: donor + home owner)
ALTER TABLE profiles 
ADD COLUMN is_home_owner BOOLEAN DEFAULT FALSE;
