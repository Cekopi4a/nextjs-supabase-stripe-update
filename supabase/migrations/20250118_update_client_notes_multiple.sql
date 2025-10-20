-- Update Client Notes Migration
-- Remove UNIQUE constraint to allow multiple notes per client

-- Drop the unique constraint
ALTER TABLE client_notes DROP CONSTRAINT IF EXISTS client_notes_trainer_id_client_id_key;

-- Add title field for note organization
ALTER TABLE client_notes ADD COLUMN IF NOT EXISTS title TEXT;

-- Update comment
COMMENT ON TABLE client_notes IS 'Stores private notes that trainers write about their clients. Multiple notes per client allowed. Only visible to the trainer.';
