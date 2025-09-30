-- Таблица за workout templates (готови тренировки които треньорът може да използва многократно)
CREATE TABLE IF NOT EXISTS workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  muscle_groups TEXT[] NOT NULL DEFAULT '{}',
  difficulty_level VARCHAR(20) DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  estimated_duration_minutes INTEGER DEFAULT 60,
  equipment_needed TEXT[] NOT NULL DEFAULT '{}',
  workout_type VARCHAR(50) DEFAULT 'mixed',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекси за по-бързо търсене
CREATE INDEX IF NOT EXISTS idx_workouts_trainer_id ON workouts(trainer_id);
CREATE INDEX IF NOT EXISTS idx_workouts_name ON workouts USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_workouts_difficulty ON workouts(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_workouts_type ON workouts(workout_type);

-- RLS политики
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Треньорите могат да виждат само своите workout templates
CREATE POLICY "Треньорите виждат своите workout templates" ON workouts
  FOR SELECT USING (trainer_id = auth.uid());

-- Треньорите могат да създават workout templates
CREATE POLICY "Треньорите създават workout templates" ON workouts
  FOR INSERT WITH CHECK (trainer_id = auth.uid());

-- Треньорите могат да редактират своите workout templates
CREATE POLICY "Треньорите редактират своите workout templates" ON workouts
  FOR UPDATE USING (trainer_id = auth.uid());

-- Треньорите могат да изтриват своите workout templates
CREATE POLICY "Треньорите изтриват своите workout templates" ON workouts
  FOR DELETE USING (trainer_id = auth.uid());

-- Тригер за автоматично обновяване на updated_at
CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Коментар на таблицата
COMMENT ON TABLE workouts IS 'Workout templates създадени от треньорите за многократна употреба';