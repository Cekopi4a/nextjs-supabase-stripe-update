# CLAUDE.md - Fitness App Context

## 📋 Основна информация за проекта

**Име:** Fitness Training App  
**Цел:** SaaS платформа за персонални треньори за управление на клиенти, програми и хранителни планове. Треньора трябва да добавя клиенти чрез имейл или линк към него самия. Треньора трябва да създава на всеки негов клиент хранителен и тренировъчен план. Всеки клиент вижда индивидуално каква програма му е задал треньора и как трябва да се храни. Треньора може да добавя собствени храни и упражнения и трябва да може да редактира тренировките по-всяко време да прави редакций. Треньора има избор от три плана за subscription които са Free,Pro,Beast.
**Target audience:** Персонални треньори и fitness специалисти

## 🏗️ Технически стак

### Core Technologies
- **Framework:** Next.js 15.2.4 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth + Update.dev
- **Billing:** Stripe + Update.dev
- **Styling:** Tailwind CSS 4.0.13
- **UI Components:** Radix UI + shadcn/ui

### 🎨 Цветова палитра
**Активна палитра:** Професионална (Синьо-Циан)

Използваме професионална синьо-циан палитра, която вдъхва доверие, модернизъм и чистота. Подходяща за fitness приложения с професионален подход.

#### Light Mode
- **Primary:** `blue-600` / `hsl(217 91% 60%)` - основен синьо (бутони, линкове)
- **Secondary:** `cyan-500` / `hsl(189 94% 43%)` - циан акцент
- **Accent:** `sky-400` / `hsl(199 89% 48%)` - светло синьо за highlights
- **Background:** `white` / `hsl(0 0% 100%)` - бял фон
- **Foreground:** `slate-900` / `hsl(222 47% 11%)` - тъмен текст
- **Muted:** `slate-50` / `hsl(210 40% 96%)` - приглушени елементи
- **Border:** `slate-200` / `hsl(214 32% 91%)` - граници

#### Dark Mode
- **Primary:** `blue-600` / `hsl(217 91% 60%)` - основен синьо (запазен)
- **Secondary:** `cyan-500` / `hsl(189 94% 43%)` - циан акцент (запазен)
- **Accent:** `sky-400` / `hsl(199 89% 48%)` - светло синьо (запазено)
- **Background:** `slate-900` / `hsl(222 47% 11%)` - тъмен фон
- **Foreground:** `slate-50` / `hsl(210 40% 98%)` - светъл текст
- **Card:** `slate-800` / `hsl(217 33% 17%)` - карти с леко синкав тон
- **Muted:** `slate-800` / `hsl(217 33% 17%)` - приглушени елементи

#### Използване
- Бутони CTA използват `primary` (blue-600)
- Secondary действия използват `secondary` (cyan-500)
- Hover states и highlights използват `accent` (sky-400)
- Destructive actions запазват червено за consistency
- Gradients: `from-blue-600 to-cyan-500` за hero секции и важни елементи

**Файл с дефиниции:** `app/globals.css` (редове 104-177 за HSL и 239-312 за OKLCH)

### Ключови библиотеки
- `@supabase/supabase-js` - Database client
- `@updatedev/js` - Auth & billing
- `@dnd-kit/*` - Drag & drop functionality
- `lucide-react` - Icons
- `next-themes` - Theme management
- `resend` - Email service
- `sonner` - Toast notifications
- `lodash` - Utility functions
- `@react-email/*` - Email templates

## 📁 Архитектура на проекта

### Структура на папките
```
app/
├── (auth)/          # Auth pages (sign-in, sign-up)
├── api/             # API routes
├── auth/            # Auth callbacks
├── protected/       # Protected pages requiring authentication
│   ├── clients/     # Client management
│   ├── programs/    # Training programs
│   ├── nutrition/   # Nutrition plans
│   ├── nutrition-plans/ # Nutrition plan builder
│   ├── calendar/    # Calendar functionality
│   ├── exercises/   # Exercise library
│   ├── foods/       # Food library
│   ├── recipes/     # Recipe management
│   ├── workout-builder/ # Workout builder
│   ├── workouts/    # Workout management
│   ├── account/     # Account settings
│   ├── analytics/   # Analytics dashboard
│   ├── goals/       # Goal tracking
│   └── subscription/ # Subscription management
├── join/           # Invitation handling
├── pricing/        # Pricing page
├── about/          # About page
└── contact/        # Contact page
```

### Основни функционалности
1. **Client Management** - Управление на клиенти и покани
2. **Training Programs** - Създаване и управление на тренировъчни програми
3. **Workout Builder** - Конструктор на тренировки с drag & drop
4. **Exercise Library** - Библиотека с упражнения
5. **Nutrition Planning** - Хранителни планове и макроси
6. **Food Library** - Библиотека с храни и макронутриенти
7. **Recipe Management** - Управление на рецепти
8. **Calendar** - Календар за тренировки
9. **Analytics** - Статистика и анализи
10. **Goals** - Проследяване на цели
11. **Billing** - Subscription management via Stripe (Free/Pro/Beast plans)
12. **Authentication** - Multi-provider auth
13. **Account Settings** - Управление на профил и настройки

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

### Git Workflow
- **Main branch:** `main`
- **Commit format:** Описателни commit messages на английски
- **Testing:** Винаги тествай преди commit

## 🗄️ База данни и бизнес логика

### User Roles
- Trainers (основни потребители)
- Clients (поканени от треньорите)

### Ключови модели
- Users (треньори и клиенти)
- Training Programs
- Nutrition Plans
- Food Items
- Client-Trainer relationships

### Authentication Flow
- Supabase Auth за основно authentication
- Update.dev за billing и extended features
- Invitation system за клиенти

## 🎯 Claude-специфични инструкции

### Автоматични действия
- ✅ Винаги run `npm run lint` след code changes
- ✅ Винаги run `npm run build` за проверка на production готовност
- ✅ Използвай TypeScript типове винаги
- ✅ Следвай shadcn/ui patterns за UI components

### Питай преди да правиш
- ❓ Database schema changes (миграции)
- ❓ New dependencies
- ❓ Breaking changes в API
- ❓ Changes в authentication flow
- ❓ Billing/subscription logic changes

### Предпочитания
- **Communication:** Кратки, директни отговори на български
- **Code style:** Functional components, hooks, съвременни React patterns
- **Error handling:** Proper error boundaries и user feedback
- **Performance:** Оптимизирай за performance (loading states, suspense)

### Ограничения
- Не създавай нови environment variables без консултация
- Не променяй Stripe/Update.dev конфигурации
- Пази съществуващите API endpoints
- Внимавай с Supabase RLS policies

## 🚀 Environment Setup

### Required Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Update.dev
NEXT_PUBLIC_UPDATE_PUBLISHABLE_KEY=...

# Resend (Email)
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...

# Site
NEXT_PUBLIC_SITE_URL=...
```

### Development
- Port: 3001 (configured in NEXT_PUBLIC_SITE_URL)
- Hot reload enabled
- TypeScript strict mode

---

💡 **Забележка:** Това е fitness SaaS приложение за треньори. Фокусирай се на user experience, performance и data integrity при всички промени.