-- Add image_url column to foods table
ALTER TABLE foods ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN foods.image_url IS 'URL to the food image stored in Supabase Storage';
