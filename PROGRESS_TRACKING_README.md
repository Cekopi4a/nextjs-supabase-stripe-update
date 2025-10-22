# Progress Tracking System - Система за проследяване на напредъка

## 📊 Общ преглед

Системата за проследяване на напредъка е нова функционалност, която позволява на клиентите и треньорите да визуализират прогреса по всички ключови метрики на едно място.

## ✨ Основни функционалности

### 1. 📈 Графики и визуализации

#### **График за тегло**
- Проследяване на теглото във времето с линеен график
- Визуализация на целевото тегло (пунктирана линия)
- Прогрес бар към целта (автоматично изчисляване)
- Автоматично разпознаване дали клиентът отслабва или качва маса
- Индикатор "On track" за показване дали е на правилния път

#### **График за тренировки**
- Bar chart показващ планирани vs изпълнени тренировки по дни
- Визуализация на workout completion rate
- Streak counter - поредни дни с тренировки

#### **График за навици**
- Area chart за проценти изпълнение на навиците
- Дневна визуализация на прогреса

#### **График за телесни измервания**
- Линеен график с талия, гръдна обиколка, ханш
- Възможност за проследяване на всички измервания

### 2. 🎯 Summary Cards

Четири ключови статистики в горната част на страницата:

1. **Workout Streak** 🔥
   - Поредни дни с тренировки
   - Рекорд streak
   - Badge "On fire!" при streak >= 7 дни

2. **Workout Completion** 💪
   - Изпълнени/Планирани тренировки
   - Процент изпълнение
   - Progress bar

3. **Weight Progress** ⚖️
   - Текущо тегло vs целево тегло
   - Промяна в теглото (с индикатор нагоре/надолу)
   - "On track" badge

4. **Habit Completion** ✅
   - Изпълнени навици
   - Процент изпълнение
   - Progress bar

### 3. 🎛️ Филтриране по период

Dropdown за избор на времеви период:
- Последните 7 дни
- Последните 30 дни
- Последните 90 дни
- Последните 6 месеца

### 4. 🎯 Активни цели

Секция със списък на всички активни цели:
- Заглавие и описание
- Краен срок (badge)
- Целева стойност и единица

## 🗄️ Database структура

### Нови функции (PostgreSQL)

#### `get_client_workout_stats(p_client_id, p_days)`
Връща статистики за тренировките:
- `total_scheduled` - брой планирани тренировки
- `total_completed` - брой изпълнени тренировки
- `completion_rate` - процент изпълнение
- `current_streak` - текущ streak
- `best_streak` - най-добър streak

#### `get_weight_progress(p_client_id)`
Връща прогрес с теглото:
- `current_weight` - текущо тегло
- `target_weight` - целево тегло
- `start_weight` - начално тегло
- `weight_change` - промяна в теглото
- `progress_percentage` - процент прогрес към целта
- `is_on_track` - дали е на правилния път
- `goal_type` - тип цел (weight_loss/weight_gain)

#### `get_habit_completion_stats(p_client_id, p_days)`
Връща статистики за навиците:
- `total_habits` - брой активни навици
- `total_logs` - брой логове
- `completed_logs` - брой изпълнени логове
- `completion_rate` - процент изпълнение
- `today_completion_rate` - процент изпълнение днес

#### `get_measurement_trends(p_client_id, p_days)`
Връща телесни измервания за графики:
- `measurement_date` - дата
- `weight_kg` - тегло
- `waist_cm` - талия
- `chest_cm` - гръдна обиколка
- `hips_cm` - ханш
- `body_fat_percentage` - процент мазнини

### View: `client_progress_summary`
Обединен изглед на напредъка на клиентите за бързи справки.

## 🔌 API Endpoints

### `GET /api/progress-stats`

**Query параметри:**
- `clientId` (optional) - ID на клиента (по подразбиране текущия потребител)
- `days` (optional) - брой дни назад (по подразбиране 30)

**Response:**
```typescript
{
  success: true,
  data: {
    workoutStats: { ... },
    weightProgress: { ... },
    habitStats: { ... },
    workoutChartData: [ ... ],
    habitChartData: [ ... ],
    measurementTrends: [ ... ],
    activeGoals: [ ... ]
  }
}
```

**Permissions:**
- Клиентите виждат само своя прогрес
- Треньорите виждат прогреса на техните клиенти
- Автоматична проверка на правата на достъп

## 📁 Файлове

### Frontend
- [`app/protected/progress/page.tsx`](app/protected/progress/page.tsx) - Главната страница
- [`components/left-sidebar.tsx`](components/left-sidebar.tsx) - Добавен navigation link

### Backend
- [`app/api/progress-stats/route.ts`](app/api/progress-stats/route.ts) - API endpoint
- [`supabase/migrations/20250122_create_progress_tracking_functions.sql`](supabase/migrations/20250122_create_progress_tracking_functions.sql) - Database миграция

## 🎨 UI/UX особености

### Responsive дизайн
- Мобилна оптимизация
- Адаптивни графики (Recharts ResponsiveContainer)
- Grid layout с Tailwind CSS

### Цветова схема
- **Workout Streak**: Orange (🔥)
- **Workout Completion**: Blue (💪)
- **Weight Progress**: Green (⚖️)
- **Habit Completion**: Purple (✅)

### Визуални индикатори
- Progress bars за процентно изпълнение
- Badges за streaks и статуси
- Icons (Lucide React) за всяка секция
- Gradient backgrounds за важни секции

## 🚀 Как да използваш

### За клиенти
1. Отиди в "Напредък" от sidebar-а
2. Виж всички свои метрики на едно място
3. Филтрирай по период (7/30/90/180 дни)
4. Следи графиките си

### За треньори
1. Отиди в "Моят напредък" от sidebar-а
2. Виж собствения си прогрес
3. Или отвори профила на клиент и виж неговия прогрес

## 📊 Charting библиотека

Използваме **Recharts** (v2.x) за визуализациите:
- `LineChart` - за тегло и измервания
- `BarChart` - за тренировки
- `AreaChart` - за навици

## 🔐 Security

- RLS (Row Level Security) на database ниво
- API проверки за permissions
- Клиентите виждат само своя прогрес
- Треньорите виждат само прогреса на техните клиенти

## 📝 Бележки

### Автоматично детектиране на цел
Системата автоматично разпознава дали клиентът:
- **Отслабва** (weight_loss) - показва progress като намаление на теглото
- **Качва маса** (weight_gain) - показва progress като увеличение на теглото

### "On Track" логика
Клиентът е "on track" когато:
- Има прогрес над 0%
- Прогресът е под 100%
- Движи се в правилната посока (нагоре или надолу) според целта

### Streak калкулация
- Изчислява се от последните consecutive дни с изпълнени тренировки
- Не се брои днес ако още няма тренировка
- Прекъсва се при липса на тренировка

## 🎯 Бъдещи подобрения

Възможни разширения:
- Export на прогреса в PDF
- Сравнение с предходни периоди
- Прогнози за постигане на цели
- Social sharing на постижения
- Notifications при постигане на milestones

## 💡 Tips

- За най-добри резултати, клиентите трябва да:
  - Записват тегло редовно (поне 1 път седмично)
  - Отбелязват тренировките си като "completed"
  - Следят навиците си daily
  - Задават ясни цели

---

**Създадено:** 2025-01-22
**Версия:** 1.0
**Статус:** ✅ Production Ready
