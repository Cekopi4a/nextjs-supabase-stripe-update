-- Добавяне на admin роля и админски функционалности
-- Първо обновяваме profiles таблицата за да поддържа admin роля
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'client'
CHECK (role IN ('client', 'trainer', 'admin'));

-- Обновяваме съществуващите записи да имат роля базирана на user_type
UPDATE profiles
SET role = CASE
  WHEN user_type = 'trainer' THEN 'trainer'
  ELSE 'client'
END
WHERE role IS NULL OR role = 'client';

-- Създаваме таблица за админски конфигурации
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Създаваме таблица за системни статистики (кеширане)
CREATE TABLE IF NOT EXISTS system_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_type VARCHAR(100) NOT NULL,
  stat_value JSONB NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекси
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_stats_type ON system_stats(stat_type);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- RLS политики за админските таблици
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_stats ENABLE ROW LEVEL SECURITY;

-- Само админи могат да управляват настройките
CREATE POLICY "Само админи могат да четат настройки" ON admin_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Само админи могат да управляват настройки" ON admin_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Само админи могат да четат статистиките
CREATE POLICY "Само админи могат да четат статистики" ON system_stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Само админи могат да управляват статистики" ON system_stats
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Обновяваме существующите RLS политики да включват админите
-- Админите могат да виждат всичко

-- Функция за проверка дали потребителят е админ
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Изглед за админски статистики
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
  'trainers' as stat_type,
  COUNT(*) as value,
  'Общо треньори' as label
FROM profiles WHERE role = 'trainer'
UNION ALL
SELECT
  'clients' as stat_type,
  COUNT(*) as value,
  'Общо клиенти' as label
FROM profiles WHERE role = 'client'
UNION ALL
SELECT
  'active_subscriptions' as stat_type,
  COUNT(*) as value,
  'Активни абонаменти' as label
FROM trainer_subscriptions
WHERE status = 'active'
UNION ALL
SELECT
  'total_programs' as stat_type,
  COUNT(*) as value,
  'Общо програми' as label
FROM workout_programs
UNION ALL
SELECT
  'total_nutrition_plans' as stat_type,
  COUNT(*) as value,
  'Общо хранителни планове' as label
FROM nutrition_plans;

-- Функция за получаване на месечни приходи по планове
CREATE OR REPLACE FUNCTION get_monthly_revenue_by_plan(months_back INTEGER DEFAULT 6)
RETURNS TABLE (
  month_year TEXT,
  free_count INTEGER,
  pro_count INTEGER,
  beast_count INTEGER,
  pro_revenue DECIMAL,
  beast_revenue DECIMAL,
  total_revenue DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(DATE_TRUNC('month', ts.created_at), 'YYYY-MM') as month_year,
    COUNT(CASE WHEN ts.plan_type = 'free' THEN 1 END)::INTEGER as free_count,
    COUNT(CASE WHEN ts.plan_type = 'pro' THEN 1 END)::INTEGER as pro_count,
    COUNT(CASE WHEN ts.plan_type = 'beast' THEN 1 END)::INTEGER as beast_count,
    (COUNT(CASE WHEN ts.plan_type = 'pro' THEN 1 END) * 29.99)::DECIMAL as pro_revenue,
    (COUNT(CASE WHEN ts.plan_type = 'beast' THEN 1 END) * 59.99)::DECIMAL as beast_revenue,
    ((COUNT(CASE WHEN ts.plan_type = 'pro' THEN 1 END) * 29.99) +
     (COUNT(CASE WHEN ts.plan_type = 'beast' THEN 1 END) * 59.99))::DECIMAL as total_revenue
  FROM trainer_subscriptions ts
  WHERE ts.created_at >= (CURRENT_DATE - INTERVAL '1 month' * months_back)
    AND ts.status = 'active'
  GROUP BY DATE_TRUNC('month', ts.created_at)
  ORDER BY month_year DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция за получаване на топ треньори по клиенти
CREATE OR REPLACE FUNCTION get_top_trainers_by_clients(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  trainer_id UUID,
  trainer_name TEXT,
  trainer_email TEXT,
  client_count INTEGER,
  plan_type TEXT,
  subscription_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as trainer_id,
    p.full_name as trainer_name,
    p.email as trainer_email,
    COUNT(tc.client_id)::INTEGER as client_count,
    COALESCE(ts.plan_type, 'free') as plan_type,
    COALESCE(ts.status, 'inactive') as subscription_status
  FROM profiles p
  LEFT JOIN trainer_clients tc ON p.id = tc.trainer_id AND tc.status = 'active'
  LEFT JOIN trainer_subscriptions ts ON p.id = ts.trainer_id AND ts.status = 'active'
  WHERE p.role = 'trainer'
  GROUP BY p.id, p.full_name, p.email, ts.plan_type, ts.status
  ORDER BY client_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Вмъкване на някои базови админски настройки
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
('subscription_prices', '{"free": 0, "pro": 29.99, "beast": 59.99}', 'Цени на абонаментните планове'),
('max_clients_per_plan', '{"free": 3, "pro": 15, "beast": 100}', 'Максимален брой клиенти по план'),
('system_maintenance', '{"enabled": false, "message": ""}', 'Настройки за поддръжка на системата')
ON CONFLICT (setting_key) DO NOTHING;

-- Тригери за обновяване на updated_at
CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();