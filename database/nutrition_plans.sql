-- Таблица за хранителни режими
CREATE TABLE nutrition_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_calories INTEGER,
  target_protein INTEGER,
  target_carbs INTEGER,
  target_fat INTEGER,
  plan_type VARCHAR(50) DEFAULT 'weight_loss' CHECK (plan_type IN ('weight_loss', 'weight_gain', 'maintenance', 'muscle_building', 'cutting')),
  is_active BOOLEAN DEFAULT true,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица за ястия/храни
CREATE TABLE food_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  calories_per_100g INTEGER NOT NULL,
  protein_per_100g DECIMAL(5,2) DEFAULT 0,
  carbs_per_100g DECIMAL(5,2) DEFAULT 0,
  fat_per_100g DECIMAL(5,2) DEFAULT 0,
  fiber_per_100g DECIMAL(5,2) DEFAULT 0,
  category VARCHAR(100) DEFAULT 'other' CHECK (category IN ('meat', 'fish', 'dairy', 'vegetables', 'fruits', 'grains', 'legumes', 'nuts', 'oils', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица за ястия в хранителните режими (дневни планове)
CREATE TABLE nutrition_plan_meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nutrition_plan_id UUID NOT NULL REFERENCES nutrition_plans(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = неделя, 6 = събота
  meal_type VARCHAR(50) NOT NULL CHECK (meal_type IN ('breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack')),
  meal_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица за храните в отделните ястия
CREATE TABLE nutrition_plan_meal_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id UUID NOT NULL REFERENCES nutrition_plan_meals(id) ON DELETE CASCADE,
  food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL, -- в грамове
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекси за оптимизация
CREATE INDEX idx_nutrition_plans_client_id ON nutrition_plans(client_id);
CREATE INDEX idx_nutrition_plans_trainer_id ON nutrition_plans(trainer_id);
CREATE INDEX idx_nutrition_plans_active ON nutrition_plans(is_active);
CREATE INDEX idx_nutrition_plan_meals_plan_id ON nutrition_plan_meals(nutrition_plan_id);
CREATE INDEX idx_nutrition_plan_meals_day ON nutrition_plan_meals(day_of_week);
CREATE INDEX idx_nutrition_plan_meal_items_meal_id ON nutrition_plan_meal_items(meal_id);
CREATE INDEX idx_food_items_category ON food_items(category);

-- RLS (Row Level Security) политики
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_plan_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_plan_meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;

-- Политики за nutrition_plans
CREATE POLICY "Треньори могат да виждат своите хранителни режими" ON nutrition_plans
  FOR SELECT USING (trainer_id = auth.uid());

CREATE POLICY "Клиенти могат да виждат своите хранителни режими" ON nutrition_plans
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Треньори могат да създават хранителни режими за своите клиенти" ON nutrition_plans
  FOR INSERT WITH CHECK (
    trainer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM trainer_clients 
      WHERE trainer_id = auth.uid() AND client_id = nutrition_plans.client_id AND status = 'active'
    )
  );

CREATE POLICY "Треньори могат да редактират своите хранителни режими" ON nutrition_plans
  FOR UPDATE USING (trainer_id = auth.uid());

CREATE POLICY "Треньори могат да изтриват своите хранителни режими" ON nutrition_plans
  FOR DELETE USING (trainer_id = auth.uid());

-- Политики за nutrition_plan_meals
CREATE POLICY "Достъп до ястията в хранителните режими" ON nutrition_plan_meals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM nutrition_plans 
      WHERE id = nutrition_plan_meals.nutrition_plan_id 
      AND (trainer_id = auth.uid() OR client_id = auth.uid())
    )
  );

-- Политики за nutrition_plan_meal_items
CREATE POLICY "Достъп до храните в ястията" ON nutrition_plan_meal_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM nutrition_plan_meals npm
      JOIN nutrition_plans np ON npm.nutrition_plan_id = np.id
      WHERE npm.id = nutrition_plan_meal_items.meal_id 
      AND (np.trainer_id = auth.uid() OR np.client_id = auth.uid())
    )
  );

-- Политики за food_items (всички могат да четат, само треньори могат да редактират)
CREATE POLICY "Всички могат да четат храни" ON food_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Само треньори могат да добавят храни" ON food_items 
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'trainer'
    )
  );
CREATE POLICY "Само треньори могат да редактират храни" ON food_items 
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'trainer'
    )
  );
CREATE POLICY "Само треньори могат да изтриват храни" ON food_items 
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'trainer'
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
CREATE TRIGGER update_nutrition_plans_updated_at 
  BEFORE UPDATE ON nutrition_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Изглед за по-лесно извличане на пълна информация за хранителните режими
CREATE VIEW nutrition_plans_detailed AS
SELECT 
    np.*,
    p1.full_name as client_name,
    p1.email as client_email,
    p2.full_name as trainer_name,
    p2.email as trainer_email,
    COUNT(DISTINCT npm.id) as total_meals,
    COUNT(DISTINCT npmi.id) as total_meal_items,
    COALESCE(SUM(fi.calories_per_100g * npmi.quantity / 100.0), 0) as calculated_daily_calories,
    COALESCE(SUM(fi.protein_per_100g * npmi.quantity / 100.0), 0) as calculated_daily_protein,
    COALESCE(SUM(fi.carbs_per_100g * npmi.quantity / 100.0), 0) as calculated_daily_carbs,
    COALESCE(SUM(fi.fat_per_100g * npmi.quantity / 100.0), 0) as calculated_daily_fat
FROM nutrition_plans np
LEFT JOIN profiles p1 ON np.client_id = p1.id
LEFT JOIN profiles p2 ON np.trainer_id = p2.id
LEFT JOIN nutrition_plan_meals npm ON np.id = npm.nutrition_plan_id
LEFT JOIN nutrition_plan_meal_items npmi ON npm.id = npmi.meal_id
LEFT JOIN food_items fi ON npmi.food_item_id = fi.id
GROUP BY np.id, p1.id, p2.id;

-- Функция за изчисляване на дневните макроси за конкретен ден от седмицата
CREATE OR REPLACE FUNCTION get_daily_macros(plan_id UUID, day_of_week_param INTEGER)
RETURNS TABLE (
    total_calories DECIMAL,
    total_protein DECIMAL,
    total_carbs DECIMAL,
    total_fat DECIMAL,
    total_fiber DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(fi.calories_per_100g * npmi.quantity / 100.0), 0)::DECIMAL as total_calories,
        COALESCE(SUM(fi.protein_per_100g * npmi.quantity / 100.0), 0)::DECIMAL as total_protein,
        COALESCE(SUM(fi.carbs_per_100g * npmi.quantity / 100.0), 0)::DECIMAL as total_carbs,
        COALESCE(SUM(fi.fat_per_100g * npmi.quantity / 100.0), 0)::DECIMAL as total_fat,
        COALESCE(SUM(fi.fiber_per_100g * npmi.quantity / 100.0), 0)::DECIMAL as total_fiber
    FROM nutrition_plan_meals npm
    JOIN nutrition_plan_meal_items npmi ON npm.id = npmi.meal_id
    JOIN food_items fi ON npmi.food_item_id = fi.id
    WHERE npm.nutrition_plan_id = plan_id 
    AND npm.day_of_week = day_of_week_param;
END;
$$ LANGUAGE plpgsql;

-- Вмъкване на базови храни
INSERT INTO food_items (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, category) VALUES
-- Месо и риба
('Пилешко гърди', 165, 31.0, 0, 3.6, 'meat'),
('Говеждо месо', 250, 26.0, 0, 15.0, 'meat'),
('Свинско месо', 242, 27.0, 0, 14.0, 'meat'),
('Сьомга', 208, 25.4, 0, 12.4, 'fish'),
('Тунец', 144, 30.0, 0, 1.0, 'fish'),

-- Млечни продукти
('Кисело мляко 2%', 60, 4.3, 4.7, 2.0, 'dairy'),
('Сирене извара', 98, 11.0, 4.0, 4.0, 'dairy'),
('Яйца', 155, 13.0, 1.1, 11.0, 'dairy'),

-- Зеленчуци
('Броколи', 34, 2.8, 7.0, 0.4, 'vegetables'),
('Спанак', 23, 2.9, 3.6, 0.4, 'vegetables'),
('Морков', 41, 0.9, 9.6, 0.2, 'vegetables'),
('Домати', 18, 0.9, 3.9, 0.2, 'vegetables'),

-- Плодове
('Ябълка', 52, 0.3, 14.0, 0.2, 'fruits'),
('Банан', 89, 1.1, 23.0, 0.3, 'fruits'),
('Портокал', 47, 0.9, 12.0, 0.1, 'fruits'),

-- Житни храни
('Овесени ядки', 389, 16.9, 66.3, 6.9, 'grains'),
('Бял ориз', 365, 7.1, 80.0, 0.7, 'grains'),
('Кафяв ориз', 370, 7.9, 77.2, 2.9, 'grains'),
('Хляб пълнозърнест', 247, 13.0, 41.0, 4.2, 'grains'),

-- Бобови
('Леща', 353, 25.8, 60.1, 1.1, 'legumes'),
('Фасул', 347, 21.0, 63.0, 1.2, 'legumes'),

-- Ядки и семена
('Бадеми', 579, 21.2, 21.6, 49.9, 'nuts'),
('Орехи', 654, 15.2, 13.7, 65.2, 'nuts'),

-- Мазнини
('Зехтин', 884, 0, 0, 100.0, 'oils'),
('Авокадо', 160, 2.0, 8.5, 14.7, 'fruits'),

-- Допълнителни популярни български храни
('Кашкавал', 394, 25.0, 0.7, 32.0, 'dairy'),
('Сирене', 264, 17.0, 2.0, 21.0, 'dairy'),
('Айран', 36, 1.7, 4.0, 1.5, 'dairy'),
('Краставица', 16, 0.7, 4.0, 0.1, 'vegetables'),
('Чушки', 20, 1.9, 4.6, 0.2, 'vegetables'),
('Лук', 40, 1.1, 9.3, 0.1, 'vegetables'),
('Чесън', 149, 6.4, 33.1, 0.5, 'vegetables'),
('Картофи', 77, 2.0, 17.5, 0.1, 'vegetables'),
('Грах', 81, 5.4, 14.5, 0.4, 'legumes'),
('Боб', 127, 8.7, 23.0, 0.5, 'legumes'),
('Царевица', 86, 3.3, 19.0, 1.4, 'grains'),
('Паста интегрална', 124, 5.0, 25.0, 1.1, 'grains'),
('Мед', 304, 0.3, 82.4, 0, 'other'),
('Сусам', 573, 17.7, 23.4, 49.7, 'nuts'),
('Слънчогледово семе', 584, 20.8, 20.0, 51.5, 'nuts');

-- Индекс за пълнотекстово търсене на храни
CREATE INDEX idx_food_items_search ON food_items USING gin(to_tsvector('bulgarian', name));