-- Fix RLS policies to avoid infinite recursion
-- Solution: Use security definer functions to bypass RLS checks

-- Create helper function to check if user is in conversation (bypasses RLS)
CREATE OR REPLACE FUNCTION is_conversation_participant(
  conversation_uuid uuid,
  user_uuid uuid
) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conversation_uuid
      AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants CASCADE;
DROP POLICY IF EXISTS "Users can add participants" ON conversation_participants CASCADE;
DROP POLICY IF EXISTS "Admins can remove participants" ON conversation_participants CASCADE;
DROP POLICY IF EXISTS "Users can add themselves to conversations" ON conversation_participants CASCADE;
DROP POLICY IF EXISTS "Users can add others if they are admin" ON conversation_participants CASCADE;
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants CASCADE;
DROP POLICY IF EXISTS "Authenticated users can join conversations" ON conversation_participants CASCADE;
DROP POLICY IF EXISTS "Users can leave conversations" ON conversation_participants CASCADE;

DROP POLICY IF EXISTS "Users can view their conversations" ON conversations CASCADE;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations CASCADE;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON conversations CASCADE;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON chat_messages CASCADE;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON chat_messages CASCADE;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages CASCADE;
DROP POLICY IF EXISTS "Users can delete their own messages" ON chat_messages CASCADE;

-- Simple policies using the helper function (no recursion!)

-- Conversation participants policies
CREATE POLICY "Users can view conversation participants"
  ON conversation_participants FOR SELECT
  USING (
    -- User is viewing themselves OR they're in the conversation
    user_id = auth.uid() 
    OR 
    is_conversation_participant(conversation_id, auth.uid())
  );

CREATE POLICY "Authenticated users can join conversations"
  ON conversation_participants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can leave conversations"
  ON conversation_participants FOR DELETE
  USING (user_id = auth.uid());

-- Conversations policies
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (is_conversation_participant(id, auth.uid()));

CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Chat messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON chat_messages FOR SELECT
  USING (is_conversation_participant(conversation_id, auth.uid()));

CREATE POLICY "Users can send messages to their conversations"
  ON chat_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() 
    AND 
    is_conversation_participant(conversation_id, auth.uid())
  );

CREATE POLICY "Users can update their own messages"
  ON chat_messages FOR UPDATE
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON chat_messages FOR DELETE
  USING (sender_id = auth.uid());

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_conversation_participant(uuid, uuid) TO authenticated;

-- Comments
COMMENT ON FUNCTION is_conversation_participant IS 'Check if user is participant in conversation (bypasses RLS)';
COMMENT ON POLICY "Users can view conversation participants" ON conversation_participants 
  IS 'Users can see participants in conversations they belong to';
COMMENT ON POLICY "Users can view their conversations" ON conversations 
  IS 'Users can only see conversations they are part of';
COMMENT ON POLICY "Users can view messages in their conversations" ON chat_messages 
  IS 'Users can view messages in conversations they participate in';
