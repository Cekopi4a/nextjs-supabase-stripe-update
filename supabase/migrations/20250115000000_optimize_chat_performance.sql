-- Chat Performance Optimization Migration
-- Създава view и индекси за по-добра performance на чат системата

-- 1. Създаване на view за оптимизирани conversation заявки
CREATE OR REPLACE VIEW conversation_summary AS
SELECT 
  c.id,
  c.trainer_id,
  c.client_id,
  c.last_message_at,
  c.created_at as conversation_created_at,
  
  -- Other user info (автоматично определя кой е "другия" потребител)
  other_user.id as other_user_id,
  other_user.full_name as other_user_name,
  other_user.avatar_url as other_user_avatar,
  
  -- Last message info
  lm.content as last_message_content,
  lm.sender_id as last_message_sender,
  lm.created_at as last_message_created,
  
  -- Unread count
  COALESCE(unread.count, 0) as unread_count,
  
  -- Helper fields for easier filtering
  CASE 
    WHEN c.trainer_id = auth.uid() THEN c.client_id 
    ELSE c.trainer_id 
  END as other_user_id_calculated

FROM conversations c

-- Join с profiles за other user info
LEFT JOIN profiles other_user ON (
  other_user.id = CASE 
    WHEN c.trainer_id = auth.uid() THEN c.client_id 
    ELSE c.trainer_id 
  END
)

-- Last message subquery
LEFT JOIN LATERAL (
  SELECT content, sender_id, created_at
  FROM messages 
  WHERE conversation_id = c.id 
  ORDER BY created_at DESC 
  LIMIT 1
) lm ON true

-- Unread count subquery
LEFT JOIN LATERAL (
  SELECT COUNT(*) as count
  FROM messages 
  WHERE conversation_id = c.id 
    AND read_at IS NULL 
    AND sender_id != auth.uid()
) unread ON true

WHERE c.trainer_id = auth.uid() OR c.client_id = auth.uid();

-- 2. Функция за получаване на conversations за конкретен потребител
CREATE OR REPLACE FUNCTION get_user_conversations(user_id UUID)
RETURNS TABLE (
  id UUID,
  trainer_id UUID,
  client_id UUID,
  last_message_at TIMESTAMP WITH TIME ZONE,
  conversation_created_at TIMESTAMP WITH TIME ZONE,
  other_user_id UUID,
  other_user_name TEXT,
  other_user_avatar TEXT,
  last_message_content TEXT,
  last_message_sender UUID,
  last_message_created TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.trainer_id,
    c.client_id,
    c.last_message_at,
    c.created_at,
    
    -- Other user info
    CASE 
      WHEN c.trainer_id = user_id THEN c.client_id 
      ELSE c.trainer_id 
    END as other_user_id,
    
    other_user.full_name,
    other_user.avatar_url,
    
    -- Last message
    lm.content,
    lm.sender_id,
    lm.created_at,
    
    -- Unread count
    COALESCE(unread.count, 0)::BIGINT as unread_count

  FROM conversations c

  -- Join с profiles за other user info
  LEFT JOIN profiles other_user ON (
    other_user.id = CASE 
      WHEN c.trainer_id = user_id THEN c.client_id 
      ELSE c.trainer_id 
    END
  )

  -- Last message
  LEFT JOIN LATERAL (
    SELECT content, sender_id, created_at
    FROM messages 
    WHERE conversation_id = c.id 
    ORDER BY created_at DESC 
    LIMIT 1
  ) lm ON true

  -- Unread count
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count
    FROM messages 
    WHERE conversation_id = c.id 
      AND read_at IS NULL 
      AND sender_id != user_id
  ) unread ON true

  WHERE c.trainer_id = user_id OR c.client_id = user_id
  ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Допълнителни индекси за performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_last_message 
ON conversations(trainer_id, last_message_at DESC) 
WHERE trainer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_client_last_message 
ON conversations(client_id, last_message_at DESC) 
WHERE client_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_conversation_unread 
ON messages(conversation_id, read_at, sender_id) 
WHERE read_at IS NULL;

-- 4. RLS политики за новите функции
CREATE POLICY "Users can view their conversation summary"
ON conversations FOR SELECT
USING (
  trainer_id = auth.uid() OR 
  client_id = auth.uid()
);

-- 5. Коментари за документация
COMMENT ON VIEW conversation_summary IS 'Оптимизиран view за conversations с всички нужни данни';
COMMENT ON FUNCTION get_user_conversations(UUID) IS 'Функция за получаване на conversations за конкретен потребител с всички details';

-- 6. Grant permissions
GRANT SELECT ON conversation_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_conversations(UUID) TO authenticated;
