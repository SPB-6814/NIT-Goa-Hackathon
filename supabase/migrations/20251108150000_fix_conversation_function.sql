-- Fix the get_or_create_direct_conversation function
-- The issue was ambiguous column reference 'conversation_id'

DROP FUNCTION IF EXISTS get_or_create_direct_conversation(uuid, uuid);

CREATE OR REPLACE FUNCTION get_or_create_direct_conversation(
  user1_id uuid,
  user2_id uuid
) RETURNS uuid AS $$
DECLARE
  conversation_id uuid;
BEGIN
  -- Check if conversation already exists
  -- Fixed: Properly qualify conversation_id with table alias
  SELECT c.id INTO conversation_id
  FROM conversations c
  WHERE c.type = 'direct'
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp1
      WHERE cp1.conversation_id = c.id AND cp1.user_id = user1_id
    )
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp2
      WHERE cp2.conversation_id = c.id AND cp2.user_id = user2_id
    )
    AND (
      SELECT COUNT(*) FROM conversation_participants cp3
      WHERE cp3.conversation_id = c.id
    ) = 2
  LIMIT 1;

  -- If not exists, create it
  IF conversation_id IS NULL THEN
    INSERT INTO conversations (type)
    VALUES ('direct')
    RETURNING id INTO conversation_id;

    -- Add both participants
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES 
      (conversation_id, user1_id),
      (conversation_id, user2_id);
  END IF;

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_or_create_direct_conversation(uuid, uuid) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_or_create_direct_conversation IS 'Creates or retrieves a direct conversation between two users';
