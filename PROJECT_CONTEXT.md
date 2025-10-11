# 🏋️ Fitness App - Project Context

## 📋 Основна информация

**Име:** Next.js Supabase Fitness Training Platform  
**Цел:** SaaS платформа за персонални треньори за управление на клиенти, тренировъчни програми и хранителни планове  
**Target Audience:** Персонални треньори и фитнес специалисти  

### Ключови функционалности
- **Управление на клиенти**: Треньорите добавят клиенти чрез имейл или покани
- **Тренировъчни програми**: Създаване и редактиране на персонализирани програми
- **Workout Builder**: Drag & drop конструктор за тренировки с календарен интерфейс
- **Exercise Library**: Библиотека с упражнения (общи + персонални на треньора)
- **Хранителни планове**: Планиране на хранене с макроси и калории
- **Food Library**: Библиотека с храни и макронутриенти
- **Recipe Management**: Управление на рецепти
- **Календарна система**: Проследяване на тренировки и хранене по дати
- **Цели и напредък**: Клиентите задават цели и следят напредъка си
- **Body Measurements**: Проследяване на тегло и измервания
- **Progress Photos**: Качване и съхранение на снимки за напредък
- **Real-time Chat**: Мгновена комуникация между треньори и клиенти
- **Notifications System**: Система за известия и уведомления
- **Analytics Dashboard**: Статистики и анализи за треньорите
- **Subscription планове**: Free, Pro, Beast нива за треньори

## 🏗️ Технически стак

### Core Technologies
- **Framework:** Next.js 15.2.4 (App Router)
- **Language:** TypeScript 5.8.2
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth + Update.dev
- **Billing:** Stripe + Update.dev
- **Styling:** Tailwind CSS 4.0.13
- **UI Components:** Radix UI + shadcn/ui

### Ключови библиотеки
- `@supabase/supabase-js` - Database client
- `@updatedev/js` - Auth & billing integration
- `@dnd-kit/*` - Drag & drop functionality
- `lucide-react` - Icons
- `next-themes` - Theme management
- `resend` - Email service
- `@react-email/components` - Email templates
- `sonner` - Toast notifications
- `lodash` - Utility functions
- `@hookform/resolvers` - Form validation
- `zod` - Schema validation

## 👥 Потребителски роли

### Треньор (Trainer)
- Създава и управлява клиенти
- Създава тренировъчни програми с Workout Builder
- Добавя собствени упражнения в Exercise Library
- Планира хранителни режими
- Създава рецепти и храни
- Проследява напредъка на клиентите
- Комуникира с клиенти чрез real-time chat
- Вижда аналитики и статистики
- Управлява subscription планове

### Клиент (Client)
- Получава покани от треньори
- Следва зададени програми
- Отчита напредък (тегло, измервания, снимки)
- Задава лични цели
- Проследява тренировки и хранене
- Комуникира с треньора чрез real-time chat
- Получава уведомления за нови програми
- Вижда дневен dashboard с напредък

## 🗄️ База данни - Основни таблици

### Потребители и роли
- `profiles` - Потребителски профили (треньори и клиенти)
- `trainer_clients` - Връзки между треньори и клиенти

### Тренировки
- `workout_programs` - Тренировъчни програми
- `workout_sessions` - Индивидуални тренировки
- `exercises` - Упражнения
- `workout_exercises` - Упражнения в програми

### Хранене
- `nutrition_plans` - Хранителни планове
- `nutrition_plan_meals` - Ястия в плановете
- `nutrition_plan_meal_items` - Храни в ястията
- `food_items` - База данни с храни
- `daily_meals` - Дневни храни за клиенти

### Цели и напредък
- `client_goals` - Цели на клиентите
- `body_measurements` - Измервания (тегло, etc.)
- `progress_photos` - Снимки за напредък (Supabase Storage)

### Chat и комуникация
- `conversations` - Разговори между треньори и клиенти
- `messages` - Съобщения в чата
- `notifications` - Система за уведомления

### Рецепти и храни
- `recipes` - Рецепти създадени от треньори
- `recipe_ingredients` - Съставки на рецептите

## 📁 Архитектура на проекта

### Структура на папките
```
app/
├── (auth)/              # Auth pages (sign-in, sign-up)
├── api/                 # API routes
│   ├── clients/         # Client management
│   ├── exercises/       # Exercise management
│   ├── nutrition-plans/ # Nutrition planning
│   ├── daily-meals/     # Daily meal tracking
│   └── ...
├── auth/                # Auth callbacks
├── protected/           # Protected pages requiring authentication
│   ├── clients/         # Client management (trainer)
│   │   └── [clientId]/  # Individual client pages
│   ├── programs/        # Training programs
│   ├── nutrition/       # Nutrition plans
│   ├── nutrition-plans/ # Nutrition plan builder
│   ├── calendar/        # Calendar functionality
│   ├── workouts/        # Client workout view
│   ├── workout-builder/ # Workout builder tool
│   ├── exercises/       # Exercise library
│   ├── foods/           # Food library
│   ├── recipes/         # Recipe management
│   ├── goals/           # Client goals and progress
│   ├── chat/            # Real-time messaging
│   ├── notifications/   # Notifications system
│   ├── analytics/       # Analytics dashboard
│   └── ...
├── join/               # Invitation handling
└── layout.tsx          # Root layout
```

### Компоненти
```
components/
├── fitness/            # Fitness-specific components
│   ├── client-dashboard.tsx
│   └── trainer-dashboard.tsx
├── program-creation/   # Program creation workflow
├── calendar/           # Calendar components
├── ui/                 # Reusable UI components
└── ...
```

## 🔧 Development правила

### Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm start` - Start production server

### Code Style
- **TypeScript строго типизиране**
- **ESLint конфигурация** - Next.js + React Hooks правила
- **Naming conventions:**
  - Components: PascalCase
  - Files: kebab-case за pages, camelCase за components
  - API routes: kebab-case
- **Folder structure:** Feature-based organization

### Date Handling
- Използвай `dateToLocalDateString()` от `utils/date-utils.ts`
- НЕ използвай `toISOString().split('T')[0]` (проблеми с timezone)
- Всички дати се форматират в локално време

## 🔗 Ключови страници и функционалности

### Треньорски интерфейс
- `/protected/clients` - Списък с клиенти
- `/protected/clients/[clientId]` - Профил на клиент
- `/protected/clients/[clientId]/calendar` - Календар тренировки
- `/protected/clients/[clientId]/nutrition` - Хранителни планове
- `/protected/clients/[clientId]/progress` - Напредък на клиент
- `/protected/programs` - Тренировъчни програми
- `/protected/nutrition` - Хранителни планове

### Клиентски интерфейс
- `/protected` - Главна страница (dashboard)
- `/protected/workouts` - Мои тренировки
- `/protected/nutrition` - Моето хранене
- `/protected/goals` - Мои цели и напредък
- `/protected/calendar` - Календар тренировки

### API Endpoints
- `/api/clients` - Управление на клиенти
- `/api/exercises` - Управление на упражнения
- `/api/exercises/search` - Търсене в упражнения
- `/api/nutrition-plans` - Хранителни планове
- `/api/daily-meals` - Дневни храни
- `/api/recipes` - Управление на рецепти
- `/api/foods` - Управление на храни
- `/api/food-items` - Библиотека с храни
- `/api/send-invitation` - Изпращане на покани
- `/api/accept-invitation` - Приемане на покани
- `/api/chat/conversations` - Chat разговори
- `/api/chat/messages` - Chat съобщения
- `/api/notifications` - Система за уведомления
- `/api/body-measurements` - Измервания на тялото
- `/api/body-photos` - Снимки за напредък
- `/api/goals` - Цели на клиентите
- `/api/dashboard/today-workouts` - Дневни тренировки

## 🔐 Authentication & Authorization

### Flow
1. Потребител се регистрира/влиза (Google Auth или email)
2. Създава се профил в `profiles` таблицата
3. Роля се определя: `trainer` или `client`
4. RLS (Row Level Security) контролира достъпа

### Security
- Supabase RLS политики за всички таблици
- Middleware проверява authentication
- API routes проверяват user permissions

## 📧 Email & Notifications

### Invitation System
- Треньори изпращат покани чрез имейл
- Клиенти получават токен за присъединяване
- Автоматично създаване на връзка `trainer_clients`

### Email Templates
- `invitation-email.tsx` - Покана за присъединяване
- Използва Resend за изпращане

### Real-time Notifications
- Система за уведомления с Supabase Realtime
- Toast notifications с Sonner
- Push notifications за важни събития
- Chat notifications за нови съобщения

## 💳 Subscription & Billing

### Plans
- **Free** - Ограничени клиенти
- **Pro** - Повече клиенти и функции
- **Beast** - Пълни възможности

### Integration
- Stripe за плащания
- Update.dev за subscription management

## 🎨 UI/UX Guidelines

### Design System
- Tailwind CSS за стилизиране
- shadcn/ui компоненти
- Lucide React икони
- Responsive design

### Themes
- Light/Dark mode поддръжка
- next-themes за управление

## 🐛 Често срещани проблеми

### Date Issues
- **Проблем:** Дати се показват с +1/-1 ден
- **Решение:** Използвай `dateToLocalDateString()` вместо `toISOString().split('T')[0]`

### Authentication
- **Проблем:** Потребители не могат да достъпят страници
- **Решение:** Провери RLS политики и middleware

### File Uploads
- **Проблем:** Снимки не се качват
- **Решение:** Провери Supabase Storage bucket permissions

## 📝 Development Notes

### Recent Changes
- ✅ Добавена функционалност за цели и напредък
- ✅ Поправени проблеми с дати в календарите
- ✅ Добавени страници за проследяване на напредък
- ✅ Подобрена синхронизация между dashboard и календари
- ✅ Реализирана real-time chat система с Supabase Broadcast
- ✅ Добавена система за уведомления
- ✅ Създаден Workout Builder с drag & drop интерфейс
- ✅ Разширена Exercise Library с търсене и филтриране
- ✅ Добавена Food Library и Recipe Management
- ✅ Реализирана система за body measurements и progress photos
- ✅ Добавен Analytics Dashboard за треньори
- ✅ Подобрен клиентски dashboard с дневна статистика

### TODO
- [ ] Subscription plan enforcement
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Push notifications
- [ ] Advanced reporting

## 🔗 External Services

### Supabase
- Database: PostgreSQL
- Auth: User management
- Storage: File uploads (progress photos)
- RLS: Row Level Security

### Stripe
- Payment processing
- Subscription management
- Webhook handling

### Resend
- Email delivery
- Template management

---

**Последно обновяване:** Декември 2024  
**Версия:** 0.1.1  
**Статус:** В активна разработка
