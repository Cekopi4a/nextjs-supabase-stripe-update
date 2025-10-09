-- Chat System Migration
-- Creates tables for real-time messaging between trainers and clients

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Conversations table
-- Stores conversations between trainer and client
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),

  -- Ensure unique conversations between trainer and client
  UNIQUE(trainer_id, client_id)
);

-- 2. Messages table
-- Stores individual messages in conversations
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),

  -- Ensure content is not empty
  CHECK (length(trim(content)) > 0)
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_trainer_id ON conversations(trainer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at) WHERE read_at IS NULL;

-- 4. Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for conversations table

-- Trainers can view conversations with their clients
CREATE POLICY "Треньори виждат разговори с техни клиенти"
  ON conversations
  FOR SELECT
  USING (
    trainer_id = auth.uid()
    OR
    (client_id = auth.uid() AND EXISTS (
      SELECT 1 FROM trainer_clients tc
      WHERE tc.trainer_id = conversations.trainer_id
      AND tc.client_id = auth.uid()
      AND tc.status = 'active'
    ))
  );

-- Trainers can create conversations with their clients
CREATE POLICY "Треньори създават разговори с техни клиенти"
  ON conversations
  FOR INSERT
  WITH CHECK (
    trainer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM trainer_clients tc
      WHERE tc.trainer_id = auth.uid()
      AND tc.client_id = conversations.client_id
      AND tc.status = 'active'
    )
  );

-- Update conversation (for last_message_at)
CREATE POLICY "Участници обновяват разговори"
  ON conversations
  FOR UPDATE
  USING (
    trainer_id = auth.uid()
    OR
    client_id = auth.uid()
  );

-- 6. RLS Policies for messages table

-- Users can view messages in their conversations
CREATE POLICY "Потребители виждат съобщения в техни разговори"
  ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.trainer_id = auth.uid() OR c.client_id = auth.uid())
    )
  );

-- Users can send messages in their conversations
CREATE POLICY "Потребители изпращат съобщения в техни разговори"
  ON messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.trainer_id = auth.uid() OR c.client_id = auth.uid())
    )
  );

-- Users can update their own messages (for read receipts)
CREATE POLICY "Потребители обновяват съобщения в техни разговори"
  ON messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.trainer_id = auth.uid() OR c.client_id = auth.uid())
    )
  );

-- 7. Function to update last_message_at when new message is sent
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger to automatically update last_message_at
CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- 9. Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_count(user_id UUID)
RETURNS TABLE (
  conversation_id UUID,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.conversation_id,
    COUNT(*)::BIGINT as unread_count
  FROM messages m
  INNER JOIN conversations c ON c.id = m.conversation_id
  WHERE
    m.sender_id != user_id
    AND m.read_at IS NULL
    AND (c.trainer_id = user_id OR c.client_id = user_id)
  GROUP BY m.conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Enable Realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- 11. Comments for documentation
COMMENT ON TABLE conversations IS 'Stores conversations between trainers and clients';
COMMENT ON TABLE messages IS 'Stores individual messages in conversations';
COMMENT ON COLUMN conversations.trainer_id IS 'ID of the trainer in the conversation';
COMMENT ON COLUMN conversations.client_id IS 'ID of the client in the conversation';
COMMENT ON COLUMN conversations.last_message_at IS 'Timestamp of the last message in the conversation';
COMMENT ON COLUMN messages.conversation_id IS 'ID of the conversation this message belongs to';
COMMENT ON COLUMN messages.sender_id IS 'ID of the user who sent the message';
COMMENT ON COLUMN messages.content IS 'Text content of the message';
COMMENT ON COLUMN messages.read_at IS 'Timestamp when the message was read (NULL if unread)';
