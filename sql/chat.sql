-- Conversations table
CREATE TABLE conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation participants
CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id),
  user_id UUID REFERENCES profiles_test(id),
  PRIMARY KEY (conversation_id, user_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID REFERENCES profiles_test(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to get or create a conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
BEGIN
  -- Check if a conversation already exists
  SELECT c.id INTO conversation_id
  FROM conversations c
  JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
  JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
  WHERE cp1.user_id = user1_id AND cp2.user_id = user2_id;
  
  -- If no conversation exists, create a new one
  IF conversation_id IS NULL THEN
    INSERT INTO conversations DEFAULT VALUES RETURNING id INTO conversation_id;
    INSERT INTO conversation_participants (conversation_id, user_id) VALUES
      (conversation_id, user1_id),
      (conversation_id, user2_id);
  END IF;
  
  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get recent conversations for a user
CREATE OR REPLACE FUNCTION get_recent_conversations(user_id UUID)
RETURNS TABLE (
  conversation_id UUID,
  other_user_id UUID,
  other_user_name TEXT,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id AS conversation_id,
    p.id AS other_user_id,
    p.name AS other_user_name,
    m.content AS last_message,
    m.created_at AS last_message_time
  FROM conversations c
  JOIN conversation_participants cp ON c.id = cp.conversation_id
  JOIN profiles_test p ON cp.user_id = p.id
  LEFT JOIN LATERAL (
    SELECT content, created_at
    FROM messages
    WHERE conversation_id = c.id
    ORDER BY created_at DESC
    LIMIT 1
  ) m ON TRUE
  WHERE c.id IN (
    SELECT conversation_id
    FROM conversation_participants
    WHERE user_id = get_recent_conversations.user_id
  )
  AND p.id != get_recent_conversations.user_id
  ORDER BY m.created_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;