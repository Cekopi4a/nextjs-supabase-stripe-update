-- Run this SQL in your Supabase SQL Editor to create the exercises table

-- Drop table if it exists (be careful with this in production)
DROP TABLE IF EXISTS exercises CASCADE;

-- Create the exercises table for free-exercise-db integration
CREATE TABLE exercises (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  force VARCHAR(50), -- pull, push, static, can be null
  level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'expert')),
  mechanic VARCHAR(20), -- compound, isolation, can be null  
  equipment VARCHAR(100) NOT NULL,
  primary_muscles TEXT[] NOT NULL DEFAULT '{}',
  secondary_muscles TEXT[] NOT NULL DEFAULT '{}',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  category VARCHAR(50) NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}', -- will contain full URLs to images
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster searching and filtering
CREATE INDEX idx_exercises_name ON exercises USING gin(to_tsvector('english', name));
CREATE INDEX idx_exercises_level ON exercises(level);
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_equipment ON exercises(equipment);
CREATE INDEX idx_exercises_primary_muscles ON exercises USING gin(primary_muscles);
CREATE INDEX idx_exercises_secondary_muscles ON exercises USING gin(secondary_muscles);
CREATE INDEX idx_exercises_force ON exercises(force) WHERE force IS NOT NULL;
CREATE INDEX idx_exercises_mechanic ON exercises(mechanic) WHERE mechanic IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated read" ON exercises;
DROP POLICY IF EXISTS "Allow authenticated insert" ON exercises; 
DROP POLICY IF EXISTS "Allow authenticated update" ON exercises;

-- All authenticated users can read exercises
CREATE POLICY "Allow authenticated read" ON exercises 
  FOR SELECT TO authenticated USING (true);

-- Trainers can insert exercises (if we want custom exercises in the future)
CREATE POLICY "Allow authenticated insert" ON exercises 
  FOR INSERT TO authenticated WITH CHECK (true);

-- Trainers can update exercises
CREATE POLICY "Allow authenticated update" ON exercises 
  FOR UPDATE TO authenticated USING (true);

-- Function for automatically updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS update_exercises_updated_at ON exercises;

-- Trigger for automatically updating updated_at
CREATE TRIGGER update_exercises_updated_at 
  BEFORE UPDATE ON exercises 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function for searching exercises with filters
CREATE OR REPLACE FUNCTION search_exercises(
    search_term TEXT DEFAULT NULL,
    filter_level VARCHAR DEFAULT NULL,
    filter_category VARCHAR DEFAULT NULL,
    filter_equipment VARCHAR DEFAULT NULL,
    filter_primary_muscle VARCHAR DEFAULT NULL,
    limit_count INTEGER DEFAULT 50
)
RETURNS SETOF exercises AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM exercises e
    WHERE 
        (search_term IS NULL OR e.name ILIKE '%' || search_term || '%')
        AND (filter_level IS NULL OR e.level = filter_level)
        AND (filter_category IS NULL OR e.category = filter_category)
        AND (filter_equipment IS NULL OR e.equipment = filter_equipment)
        AND (filter_primary_muscle IS NULL OR filter_primary_muscle = ANY(e.primary_muscles))
    ORDER BY e.name
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Verify table creation
SELECT 'Exercises table created successfully!' as status;
SELECT COUNT(*) as initial_count FROM exercises;