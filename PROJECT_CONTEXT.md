# 🏋️ Fitness App - Project Context

## 📋 Основна информация

**Име:** Next.js Supabase Fitness Training Platform  
**Цел:** SaaS платформа за персонални треньори за управление на клиенти, тренировъчни програми и хранителни планове  
**Target Audience:** Персонални треньори и фитнес специалисти  

### Ключови функционалности
- **Управление на клиенти**: Треньорите добавят клиенти чрез имейл или покани
- **Тренировъчни програми**: Създаване и редактиране на персонализирани програми
- **Хранителни планове**: Планиране на хранене с макроси и калории
- **Календарна система**: Проследяване на тренировки и хранене по дати
- **Цели и напредък**: Клиентите задават цели и следят напредъка си
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

## 👥 Потребителски роли

### Треньор (Trainer)
- Създава и управлява клиенти
- Създава тренировъчни програми
- Планира хранителни режими
- Проследява напредъка на клиентите
- Управлява subscription планове

### Клиент (Client)
- Получава покани от треньори
- Следва зададени програми
- Отчита напредък (тегло, снимки)
- Задава лични цели
- Проследява тренировки и хранене

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
│   ├── calendar/        # Calendar functionality
│   ├── workouts/        # Client workout view
│   ├── goals/           # Client goals and progress
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
- `/api/nutrition-plans` - Хранителни планове
- `/api/daily-meals` - Дневни храни
- `/api/send-invitation` - Изпращане на покани
- `/api/accept-invitation` - Приемане на покани

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
- Добавена функционалност за цели и напредък
- Поправени проблеми с дати в календарите
- Добавени страници за проследяване на напредък
- Подобрена синхронизация между dashboard и календари

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
