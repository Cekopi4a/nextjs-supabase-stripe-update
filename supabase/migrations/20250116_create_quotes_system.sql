-- Migration: Create Motivational Quotes System
-- Description: System for daily motivational quotes shown on dashboards

-- ============================================================================
-- TABLE: motivational_quotes
-- ============================================================================
-- Stores all available motivational quotes
CREATE TABLE IF NOT EXISTS motivational_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_text TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: user_daily_quotes
-- ============================================================================
-- Tracks which quote each user has seen on which day
CREATE TABLE IF NOT EXISTS user_daily_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quote_id UUID NOT NULL REFERENCES motivational_quotes(id) ON DELETE CASCADE,
  shown_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one quote per day per user
  UNIQUE(user_id, shown_date)
);

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Index for fast lookup of quotes by active status
CREATE INDEX IF NOT EXISTS idx_motivational_quotes_active
  ON motivational_quotes(is_active)
  WHERE is_active = true;

-- Index for fast lookup of user's daily quotes
CREATE INDEX IF NOT EXISTS idx_user_daily_quotes_user_date
  ON user_daily_quotes(user_id, shown_date DESC);

-- Index for finding recently shown quotes for a user
CREATE INDEX IF NOT EXISTS idx_user_daily_quotes_user_id
  ON user_daily_quotes(user_id, shown_date DESC);

-- Index for quote_id lookups
CREATE INDEX IF NOT EXISTS idx_user_daily_quotes_quote_id
  ON user_daily_quotes(quote_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_motivational_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER motivational_quotes_updated_at
  BEFORE UPDATE ON motivational_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_motivational_quotes_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE motivational_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_quotes ENABLE ROW LEVEL SECURITY;

-- motivational_quotes policies
-- Everyone can read active quotes
CREATE POLICY "Anyone can read active quotes"
  ON motivational_quotes
  FOR SELECT
  USING (is_active = true);

-- Only admins can insert/update/delete quotes
CREATE POLICY "Only admins can manage quotes"
  ON motivational_quotes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- user_daily_quotes policies
-- Users can read their own daily quotes
CREATE POLICY "Users can read their own daily quotes"
  ON user_daily_quotes
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own daily quotes
CREATE POLICY "Users can insert their own daily quotes"
  ON user_daily_quotes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can see all daily quotes
CREATE POLICY "Admins can see all daily quotes"
  ON user_daily_quotes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to get or create today's quote for a user
CREATE OR REPLACE FUNCTION get_daily_quote(p_user_id UUID)
RETURNS TABLE (
  quote_id UUID,
  quote_text TEXT,
  author VARCHAR(255)
) AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_existing_quote_id UUID;
  v_new_quote_id UUID;
BEGIN
  -- Check if user already has a quote for today
  SELECT udq.quote_id INTO v_existing_quote_id
  FROM user_daily_quotes udq
  WHERE udq.user_id = p_user_id
    AND udq.shown_date = v_today;

  IF v_existing_quote_id IS NOT NULL THEN
    -- Return existing quote
    RETURN QUERY
    SELECT mq.id, mq.quote_text, mq.author
    FROM motivational_quotes mq
    WHERE mq.id = v_existing_quote_id;
  ELSE
    -- Select a random quote that hasn't been shown recently (last 30 days)
    SELECT mq.id INTO v_new_quote_id
    FROM motivational_quotes mq
    WHERE mq.is_active = true
      AND mq.id NOT IN (
        SELECT udq2.quote_id
        FROM user_daily_quotes udq2
        WHERE udq2.user_id = p_user_id
          AND udq2.shown_date > (CURRENT_DATE - INTERVAL '30 days')
      )
    ORDER BY RANDOM()
    LIMIT 1;

    -- If no quote found (all quotes shown in last 30 days), pick any random active quote
    IF v_new_quote_id IS NULL THEN
      SELECT mq.id INTO v_new_quote_id
      FROM motivational_quotes mq
      WHERE mq.is_active = true
      ORDER BY RANDOM()
      LIMIT 1;
    END IF;

    -- Insert the new daily quote record
    IF v_new_quote_id IS NOT NULL THEN
      INSERT INTO user_daily_quotes (user_id, quote_id, shown_date)
      VALUES (p_user_id, v_new_quote_id, v_today)
      ON CONFLICT (user_id, shown_date) DO NOTHING;

      -- Return the new quote
      RETURN QUERY
      SELECT mq.id, mq.quote_text, mq.author
      FROM motivational_quotes mq
      WHERE mq.id = v_new_quote_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_daily_quote(UUID) TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE motivational_quotes IS 'Stores motivational quotes to display on dashboards';
COMMENT ON TABLE user_daily_quotes IS 'Tracks which quote each user sees each day (one per day)';
COMMENT ON FUNCTION get_daily_quote(UUID) IS 'Gets or creates a daily quote for a user, ensuring uniqueness and variety';
