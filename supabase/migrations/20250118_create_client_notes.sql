-- Client Notes Migration
-- Creates table for trainer notes about clients

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Client Notes table
-- Stores private notes that trainers write about their clients
CREATE TABLE IF NOT EXISTS client_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),

  -- Ensure unique note per trainer-client pair
  UNIQUE(trainer_id, client_id)
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_notes_trainer_id ON client_notes(trainer_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_updated_at ON client_notes(updated_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for client_notes table

-- Trainers can view their own notes for their clients
CREATE POLICY "Треньори виждат своите бележки за клиенти"
  ON client_notes
  FOR SELECT
  USING (
    trainer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM trainer_clients tc
      WHERE tc.trainer_id = auth.uid()
      AND tc.client_id = client_notes.client_id
      AND tc.status = 'active'
    )
  );

-- Trainers can create notes for their clients
CREATE POLICY "Треньори създават бележки за техни клиенти"
  ON client_notes
  FOR INSERT
  WITH CHECK (
    trainer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM trainer_clients tc
      WHERE tc.trainer_id = auth.uid()
      AND tc.client_id = client_notes.client_id
      AND tc.status = 'active'
    )
  );

-- Trainers can update their own notes
CREATE POLICY "Треньори обновяват своите бележки"
  ON client_notes
  FOR UPDATE
  USING (
    trainer_id = auth.uid()
  )
  WITH CHECK (
    trainer_id = auth.uid()
  );

-- Trainers can delete their own notes
CREATE POLICY "Треньори изтриват своите бележки"
  ON client_notes
  FOR DELETE
  USING (
    trainer_id = auth.uid()
  );

-- 5. Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_client_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger to call the function on update
CREATE TRIGGER trigger_update_client_notes_updated_at
  BEFORE UPDATE ON client_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_client_notes_updated_at();

-- 7. Comment on table
COMMENT ON TABLE client_notes IS 'Stores private notes that trainers write about their clients. Only visible to the trainer.';
