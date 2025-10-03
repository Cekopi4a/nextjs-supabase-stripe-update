-- Таблица за храни (расширена версия на food_items)
CREATE TABLE foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  barcode VARCHAR(50),
  calories_per_100g INTEGER NOT NULL,
  protein_per_100g DECIMAL(5,2) DEFAULT 0,
  carbs_per_100g DECIMAL(5,2) DEFAULT 0,
  fat_per_100g DECIMAL(5,2) DEFAULT 0,
  fiber_per_100g DECIMAL(5,2) DEFAULT 0,
  sugar_per_100g DECIMAL(5,2) DEFAULT 0,
  sodium_per_100g DECIMAL(5,2) DEFAULT 0,
  category VARCHAR(100) DEFAULT 'other' CHECK (category IN ('protein', 'carbs', 'fats', 'vegetables', 'fruits', 'dairy', 'beverages', 'snacks', 'grains', 'legumes')),
  allergens TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекси за оптимизация
CREATE INDEX idx_foods_category ON foods(category);
CREATE INDEX idx_foods_created_by ON foods(created_by);
CREATE INDEX idx_foods_name ON foods(name);
CREATE INDEX idx_foods_barcode ON foods(barcode);
CREATE INDEX idx_foods_search ON foods USING gin(to_tsvector('bulgarian', name));

-- RLS (Row Level Security) политики
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

-- Политики за foods
CREATE POLICY "Всички могат да виждат глобални храни" ON foods
  FOR SELECT USING (created_by IS NULL);

CREATE POLICY "Треньори могат да виждат своите храни" ON foods
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Клиенти могат да виждат храни от своя треньор" ON foods
  FOR SELECT USING (
    created_by IN (
      SELECT trainer_id 
      FROM trainer_clients 
      WHERE client_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Треньори могат да създават храни" ON foods
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Треньори могат да редактират своите храни" ON foods
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Треньори могат да изтриват своите храни" ON foods
  FOR DELETE USING (created_by = auth.uid());

-- Вмъкване на базови храни (глобални)
INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, category, created_by) VALUES
-- Месо и риба
('Пилешко гърди', 165, 31.0, 0, 3.6, 'protein', NULL),
('Говеждо месо', 250, 26.0, 0, 15.0, 'protein', NULL),
('Свинско месо', 242, 27.0, 0, 14.0, 'protein', NULL),
('Сьомга', 208, 25.4, 0, 12.4, 'protein', NULL),
('Тунец', 144, 30.0, 0, 1.0, 'protein', NULL),

-- Млечни продукти
('Кисело мляко 2%', 60, 4.3, 4.7, 2.0, 'dairy', NULL),
('Сирене извара', 98, 11.0, 4.0, 4.0, 'dairy', NULL),
('Яйца', 155, 13.0, 1.1, 11.0, 'protein', NULL),

-- Зеленчуци
('Броколи', 34, 2.8, 7.0, 0.4, 'vegetables', NULL),
('Спанак', 23, 2.9, 3.6, 0.4, 'vegetables', NULL),
('Морков', 41, 0.9, 9.6, 0.2, 'vegetables', NULL),
('Домати', 18, 0.9, 3.9, 0.2, 'vegetables', NULL),

-- Плодове
('Ябълка', 52, 0.3, 14.0, 0.2, 'fruits', NULL),
('Банан', 89, 1.1, 23.0, 0.3, 'fruits', NULL),
('Портокал', 47, 0.9, 12.0, 0.1, 'fruits', NULL),
('Авокадо', 160, 2.0, 8.5, 14.7, 'fruits', NULL),

-- Житни храни
('Овесени ядки', 389, 16.9, 66.3, 6.9, 'grains', NULL),
('Бял ориз', 365, 7.1, 80.0, 0.7, 'grains', NULL),
('Кафяв ориз', 370, 7.9, 77.2, 2.9, 'grains', NULL),
('Хляб пълнозърнест', 247, 13.0, 41.0, 4.2, 'grains', NULL),

-- Бобови
('Леща', 353, 25.8, 60.1, 1.1, 'legumes', NULL),
('Фасул', 347, 21.0, 63.0, 1.2, 'legumes', NULL),

-- Ядки и семена
('Бадеми', 579, 21.2, 21.6, 49.9, 'fats', NULL),
('Орехи', 654, 15.2, 13.7, 65.2, 'fats', NULL),

-- Мазнини
('Зехтин', 884, 0, 0, 100.0, 'fats', NULL),

-- Допълнителни популярни български храни
('Кашкавал', 394, 25.0, 0.7, 32.0, 'dairy', NULL),
('Сирене', 264, 17.0, 2.0, 21.0, 'dairy', NULL),
('Айран', 36, 1.7, 4.0, 1.5, 'dairy', NULL),
('Краставица', 16, 0.7, 4.0, 0.1, 'vegetables', NULL),
('Чушки', 20, 1.9, 4.6, 0.2, 'vegetables', NULL),
('Лук', 40, 1.1, 9.3, 0.1, 'vegetables', NULL),
('Чесън', 149, 6.4, 33.1, 0.5, 'vegetables', NULL),
('Картофи', 77, 2.0, 17.5, 0.1, 'vegetables', NULL),
('Грах', 81, 5.4, 14.5, 0.4, 'legumes', NULL),
('Боб', 127, 8.7, 23.0, 0.5, 'legumes', NULL),
('Царевица', 86, 3.3, 19.0, 1.4, 'grains', NULL),
('Паста интегрална', 124, 5.0, 25.0, 1.1, 'grains', NULL),
('Мед', 304, 0.3, 82.4, 0, 'carbs', NULL),
('Сусам', 573, 17.7, 23.4, 49.7, 'fats', NULL),
('Слънчогледово семе', 584, 20.8, 20.0, 51.5, 'fats', NULL);
