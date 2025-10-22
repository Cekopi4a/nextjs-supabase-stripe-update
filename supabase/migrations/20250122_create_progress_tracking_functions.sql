-- Progress Tracking Functions Migration
-- Creates helper functions and views for comprehensive progress tracking

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Function to get client workout completion stats for a period
CREATE OR REPLACE FUNCTION get_client_workout_stats(
  p_client_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_scheduled INTEGER,
  total_completed INTEGER,
  completion_rate NUMERIC,
  current_streak INTEGER,
  best_streak INTEGER
) AS $$
DECLARE
  v_streak INTEGER := 0;
  v_max_streak INTEGER := 0;
  v_check_date DATE := CURRENT_DATE;
  v_has_workout BOOLEAN;
BEGIN
  -- Get total scheduled and completed workouts
  SELECT
    COUNT(*) FILTER (WHERE status IN ('planned', 'completed', 'skipped')),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO total_scheduled, total_completed
  FROM workout_sessions
  WHERE client_id = p_client_id
    AND scheduled_date >= CURRENT_DATE - p_days
    AND scheduled_date <= CURRENT_DATE;

  -- Calculate completion rate
  IF total_scheduled > 0 THEN
    completion_rate := (total_completed::NUMERIC / total_scheduled::NUMERIC) * 100;
  ELSE
    completion_rate := 0;
  END IF;

  -- Calculate current streak (consecutive days with completed workouts)
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM workout_sessions
      WHERE client_id = p_client_id
        AND scheduled_date = v_check_date
        AND status = 'completed'
    ) INTO v_has_workout;

    IF NOT v_has_workout THEN
      EXIT;
    END IF;

    v_streak := v_streak + 1;
    v_check_date := v_check_date - INTERVAL '1 day';
  END LOOP;

  current_streak := v_streak;

  -- Calculate best streak (you can extend this logic for all-time best streak)
  best_streak := v_streak; -- Simplified: current = best for now

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to get weight progress towards goal
CREATE OR REPLACE FUNCTION get_weight_progress(
  p_client_id UUID
)
RETURNS TABLE (
  current_weight NUMERIC,
  target_weight NUMERIC,
  start_weight NUMERIC,
  weight_change NUMERIC,
  progress_percentage NUMERIC,
  is_on_track BOOLEAN,
  goal_type TEXT
) AS $$
DECLARE
  v_weight_goal RECORD;
  v_latest_weight NUMERIC;
  v_first_weight NUMERIC;
BEGIN
  -- Get the active weight-related goal
  SELECT
    g.target_value,
    g.goal_type
  INTO v_weight_goal
  FROM client_goals g
  WHERE g.client_id = p_client_id
    AND g.is_achieved = false
    AND g.goal_type IN ('weight_loss', 'weight_gain')
  ORDER BY g.created_at DESC
  LIMIT 1;

  -- Get latest weight measurement
  SELECT weight_kg INTO v_latest_weight
  FROM body_measurements
  WHERE client_id = p_client_id
    AND weight_kg IS NOT NULL
  ORDER BY date DESC
  LIMIT 1;

  -- Get first/starting weight measurement
  SELECT weight_kg INTO v_first_weight
  FROM body_measurements
  WHERE client_id = p_client_id
    AND weight_kg IS NOT NULL
  ORDER BY date ASC
  LIMIT 1;

  current_weight := v_latest_weight;
  target_weight := v_weight_goal.target_value;
  start_weight := v_first_weight;
  goal_type := v_weight_goal.goal_type;

  -- Calculate weight change
  IF v_latest_weight IS NOT NULL AND v_first_weight IS NOT NULL THEN
    weight_change := v_latest_weight - v_first_weight;
  ELSE
    weight_change := 0;
  END IF;

  -- Calculate progress percentage
  IF v_weight_goal.target_value IS NOT NULL AND v_first_weight IS NOT NULL AND v_latest_weight IS NOT NULL THEN
    IF v_weight_goal.goal_type = 'weight_loss' THEN
      -- For weight loss: progress = (start - current) / (start - target) * 100
      IF (v_first_weight - v_weight_goal.target_value) != 0 THEN
        progress_percentage := ((v_first_weight - v_latest_weight) / (v_first_weight - v_weight_goal.target_value)) * 100;
      ELSE
        progress_percentage := 0;
      END IF;
    ELSIF v_weight_goal.goal_type = 'weight_gain' THEN
      -- For weight gain: progress = (current - start) / (target - start) * 100
      IF (v_weight_goal.target_value - v_first_weight) != 0 THEN
        progress_percentage := ((v_latest_weight - v_first_weight) / (v_weight_goal.target_value - v_first_weight)) * 100;
      ELSE
        progress_percentage := 0;
      END IF;
    ELSE
      progress_percentage := 0;
    END IF;
  ELSE
    progress_percentage := 0;
  END IF;

  -- Determine if on track (simplified: progress > 0)
  is_on_track := progress_percentage > 0 AND progress_percentage <= 100;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to get habit completion statistics
CREATE OR REPLACE FUNCTION get_habit_completion_stats(
  p_client_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_habits INTEGER,
  total_logs INTEGER,
  completed_logs INTEGER,
  completion_rate NUMERIC,
  today_completion_rate NUMERIC
) AS $$
BEGIN
  -- Get total active habits
  SELECT COUNT(*) INTO total_habits
  FROM client_habits
  WHERE client_id = p_client_id
    AND is_active = true;

  -- Get total logs and completed logs for the period
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE completed = true)
  INTO total_logs, completed_logs
  FROM habit_logs
  WHERE client_id = p_client_id
    AND log_date >= CURRENT_DATE - p_days
    AND log_date <= CURRENT_DATE;

  -- Calculate overall completion rate
  IF total_logs > 0 THEN
    completion_rate := (completed_logs::NUMERIC / total_logs::NUMERIC) * 100;
  ELSE
    completion_rate := 0;
  END IF;

  -- Calculate today's completion rate
  IF total_habits > 0 THEN
    SELECT
      (COUNT(*) FILTER (WHERE completed = true)::NUMERIC / total_habits::NUMERIC) * 100
    INTO today_completion_rate
    FROM habit_logs
    WHERE client_id = p_client_id
      AND log_date = CURRENT_DATE;

    IF today_completion_rate IS NULL THEN
      today_completion_rate := 0;
    END IF;
  ELSE
    today_completion_rate := 0;
  END IF;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function to get body measurement trends
CREATE OR REPLACE FUNCTION get_measurement_trends(
  p_client_id UUID,
  p_days INTEGER DEFAULT 90
)
RETURNS TABLE (
  measurement_date DATE,
  weight_kg NUMERIC,
  waist_cm NUMERIC,
  chest_cm NUMERIC,
  hips_cm NUMERIC,
  body_fat_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bm.date as measurement_date,
    bm.weight_kg,
    bm.waist_cm,
    bm.chest_cm,
    bm.hips_cm,
    bm.body_fat_percentage
  FROM body_measurements bm
  WHERE bm.client_id = p_client_id
    AND bm.date >= CURRENT_DATE - p_days
  ORDER BY bm.date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create a view for comprehensive client progress
CREATE OR REPLACE VIEW client_progress_summary AS
SELECT
  p.id as client_id,
  p.full_name,
  p.email,

  -- Latest measurements
  (SELECT weight_kg FROM body_measurements WHERE client_id = p.id AND weight_kg IS NOT NULL ORDER BY date DESC LIMIT 1) as current_weight,
  (SELECT date FROM body_measurements WHERE client_id = p.id AND weight_kg IS NOT NULL ORDER BY date DESC LIMIT 1) as last_weight_date,

  -- Active goals count
  (SELECT COUNT(*) FROM client_goals WHERE client_id = p.id AND is_achieved = false) as active_goals_count,

  -- Workout stats (last 30 days)
  (SELECT COUNT(*) FROM workout_sessions WHERE client_id = p.id AND scheduled_date >= CURRENT_DATE - 30 AND status = 'completed') as workouts_completed_30d,
  (SELECT COUNT(*) FROM workout_sessions WHERE client_id = p.id AND scheduled_date >= CURRENT_DATE - 30) as workouts_scheduled_30d,

  -- Habit stats
  (SELECT COUNT(*) FROM client_habits WHERE client_id = p.id AND is_active = true) as active_habits_count,

  -- Last activity
  GREATEST(
    (SELECT MAX(updated_at) FROM client_goals WHERE client_id = p.id),
    (SELECT MAX(date) FROM body_measurements WHERE client_id = p.id),
    (SELECT MAX(updated_at) FROM habit_logs WHERE client_id = p.id)
  ) as last_activity_date

FROM profiles p
WHERE p.role = 'client';

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION get_client_workout_stats(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_weight_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_habit_completion_stats(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_measurement_trends(UUID, INTEGER) TO authenticated;
GRANT SELECT ON client_progress_summary TO authenticated;

-- 7. Comments for documentation
COMMENT ON FUNCTION get_client_workout_stats IS 'Returns workout completion statistics for a client over a specified period';
COMMENT ON FUNCTION get_weight_progress IS 'Returns weight progress towards goal including percentage and on-track status';
COMMENT ON FUNCTION get_habit_completion_stats IS 'Returns habit completion statistics for a client over a specified period';
COMMENT ON FUNCTION get_measurement_trends IS 'Returns body measurement trends over time for charting';
COMMENT ON VIEW client_progress_summary IS 'Comprehensive view of client progress across all metrics';
