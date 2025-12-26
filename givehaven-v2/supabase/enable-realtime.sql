-- ============================================
-- Enable Supabase Realtime for messages table
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable realtime for the messages table
-- This allows the chat to receive messages in real-time without refreshing

-- Method 1: Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- If the above fails because the table is already added, it's fine.
-- The key is to make sure the 'messages' table is part of the publication.

-- You can verify by running:
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
