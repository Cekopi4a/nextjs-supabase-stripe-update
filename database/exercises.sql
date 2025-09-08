-- Таблица за упражнения от free-exercise-db
CREATE TABLE exercises (
  id VARCHAR(255) PRIMARY KEY, -- използваме оригиналното ID от JSON-а
  name VARCHAR(255) NOT NULL,
  force VARCHAR(50), -- pull, push, static, може да е null
  level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'expert')),
  mechanic VARCHAR(20), -- compound, isolation, може да е null
  equipment VARCHAR(100) NOT NULL,
  primary_muscles TEXT[] NOT NULL DEFAULT '{}',
  secondary_muscles TEXT[] NOT NULL DEFAULT '{}',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  category VARCHAR(50) NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}', -- ще съдържа пълни URL-и към изображенията
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекси за по-бързо търсене и филтриране
CREATE INDEX idx_exercises_name ON exercises USING gin(to_tsvector('english', name));
CREATE INDEX idx_exercises_level ON exercises(level);
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_equipment ON exercises(equipment);
CREATE INDEX idx_exercises_primary_muscles ON exercises USING gin(primary_muscles);
CREATE INDEX idx_exercises_secondary_muscles ON exercises USING gin(secondary_muscles);
CREATE INDEX idx_exercises_force ON exercises(force) WHERE force IS NOT NULL;
CREATE INDEX idx_exercises_mechanic ON exercises(mechanic) WHERE mechanic IS NOT NULL;

-- RLS (Row Level Security) политики
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Всички authenticated потребители могат да четат упражненията
CREATE POLICY "Всички могат да четат упражнения" ON exercises 
  FOR SELECT TO authenticated USING (true);

-- Само треньори могат да добавят/редактират упражнения (ако искаме custom упражнения в бъдеще)
CREATE POLICY "Само треньори могат да добавят упражнения" ON exercises 
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'trainer'
    )
  );

CREATE POLICY "Само треньори могат да редактират упражнения" ON exercises 
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'trainer'
    )
  );

-- Таблица за workout програми (ако не съществува вече)
-- Тази таблица свързва треньори, клиенти и тренировъчни програми
CREATE TABLE IF NOT EXISTS workout_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_weeks INTEGER DEFAULT 12,
  difficulty_level VARCHAR(20) DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'expert')),
  program_type VARCHAR(50) DEFAULT 'strength' CHECK (program_type IN ('strength', 'cardio', 'hybrid', 'bodybuilding', 'powerlifting', 'crossfit')),
  is_active BOOLEAN DEFAULT true,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица за дневните тренировки в програмата
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES workout_programs(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = неделя, 6 = събота
  session_name VARCHAR(255) NOT NULL, -- напр. "Push Day", "Leg Day", "Upper Body"
  session_order INTEGER DEFAULT 1,
  rest_between_sets INTEGER DEFAULT 60, -- секунди почивка между серии
  estimated_duration INTEGER DEFAULT 60, -- минути за цялата тренировка
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица за упражненията в конкретна тренировка
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id VARCHAR(255) NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  exercise_order INTEGER NOT NULL DEFAULT 1, -- ред на изпълнение в тренировката
  sets INTEGER NOT NULL DEFAULT 3,
  reps_min INTEGER, -- минимален брой повторения (за диапазон)
  reps_max INTEGER, -- максимален брой повторения
  reps INTEGER, -- фиксиран брой повторения (ако не е диапазон)
  weight_kg DECIMAL(5,2), -- тегло в килограми
  rest_seconds INTEGER DEFAULT 60, -- почивка след упражнението
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10), -- Rate of Perceived Exertion
  notes TEXT, -- бележки за изпълнение
  is_superset BOOLEAN DEFAULT false, -- дали е част от суперсет
  superset_group INTEGER, -- групиране на суперсет упражнения
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекси за workout таблиците
CREATE INDEX IF NOT EXISTS idx_workout_programs_trainer_id ON workout_programs(trainer_id);
CREATE INDEX IF NOT EXISTS idx_workout_programs_client_id ON workout_programs(client_id);
CREATE INDEX IF NOT EXISTS idx_workout_programs_active ON workout_programs(is_active);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_program_id ON workout_sessions(program_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_day ON workout_sessions(day_of_week);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_session_id ON workout_exercises(session_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_id ON workout_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_order ON workout_exercises(exercise_order);

-- RLS политики за workout таблиците
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

-- Политики за workout_programs
CREATE POLICY "Треньори могат да виждат своите програми" ON workout_programs
  FOR SELECT USING (trainer_id = auth.uid());

CREATE POLICY "Клиенти могат да виждат своите програми" ON workout_programs
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Треньори могат да създават програми за своите клиенти" ON workout_programs
  FOR INSERT WITH CHECK (
    trainer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM trainer_clients 
      WHERE trainer_id = auth.uid() AND client_id = workout_programs.client_id AND status = 'active'
    )
  );

CREATE POLICY "Треньори могат да редактират своите програми" ON workout_programs
  FOR UPDATE USING (trainer_id = auth.uid());

CREATE POLICY "Треньори могат да изтриват своите програми" ON workout_programs
  FOR DELETE USING (trainer_id = auth.uid());

-- Политики за workout_sessions
CREATE POLICY "Достъп до тренировки в програмите" ON workout_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workout_programs 
      WHERE id = workout_sessions.program_id 
      AND (trainer_id = auth.uid() OR client_id = auth.uid())
    )
  );

-- Политики за workout_exercises
CREATE POLICY "Достъп до упражнения в тренировките" ON workout_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workout_sessions ws
      JOIN workout_programs wp ON ws.program_id = wp.id
      WHERE ws.id = workout_exercises.session_id 
      AND (wp.trainer_id = auth.uid() OR wp.client_id = auth.uid())
    )
  );

-- Функция за автоматично обновяване на updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Тригери за автоматично обновяване на updated_at
CREATE TRIGGER update_exercises_updated_at 
  BEFORE UPDATE ON exercises 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_programs_updated_at 
  BEFORE UPDATE ON workout_programs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Полезен изглед за пълна информация за програмите
CREATE VIEW workout_programs_detailed AS
SELECT 
    wp.*,
    p1.full_name as client_name,
    p1.email as client_email,
    p2.full_name as trainer_name,
    p2.email as trainer_email,
    COUNT(DISTINCT ws.id) as total_sessions,
    COUNT(DISTINCT we.id) as total_exercises,
    AVG(ws.estimated_duration) as avg_session_duration
FROM workout_programs wp
LEFT JOIN profiles p1 ON wp.client_id = p1.id
LEFT JOIN profiles p2 ON wp.trainer_id = p2.id
LEFT JOIN workout_sessions ws ON wp.id = ws.program_id
LEFT JOIN workout_exercises we ON ws.id = we.session_id
GROUP BY wp.id, p1.id, p2.id;

-- Функция за търсене на упражнения с филтри
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