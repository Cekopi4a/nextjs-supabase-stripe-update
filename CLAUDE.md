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
- `@hookform/resolvers` - Form validation
- `zod` - Schema validation
- `react-hook-form` - Form management

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
│   ├── goals/       # Goal tracking & progress
│   ├── chat/        # Real-time messaging
│   ├── notifications/ # Notifications system
│   └── subscription/ # Subscription management
├── join/           # Invitation handling
├── pricing/        # Pricing page
├── about/          # About page
└── contact/        # Contact page
```

### Основни функционалности
1. **Client Management** - Управление на клиенти и покани
2. **Training Programs** - Създаване и управление на тренировъчни програми
3. **Workout Builder** - Конструктор на тренировки с календарен интерфейс
4. **Exercise Library** - Библиотека с 800+ упражнения (общи + персонални)
5. **Nutrition Planning** - Хранителни планове и макроси
6. **Food Library** - Библиотека с храни и макронутриенти
7. **Recipe Management** - Управление на рецепти
8. **Calendar** - Календар за тренировки с inline editing
9. **Analytics Dashboard** - Статистика и анализи за треньори
10. **Goals & Progress** - Проследяване на цели и напредък
11. **Body Measurements** - Проследяване на тегло и всякакви измервания
12. **Progress Photos** - Качване и съхранение на снимки
13. **Real-time Chat** - Мгновена комуникация между треньори и клиенти
14. **Notifications System** - Система за уведомления и известия
15. **Billing** - Subscription management via Stripe (Free/Pro/Beast plans)
16. **Authentication** - Multi-provider auth
17. **Account Settings** - Управление на профил и настройки
18. **Google Calendar Integration** - Синхронизация с Google Calendar
19. **Export Functionality** - Export на програми в PDF, Excel, CSV формати

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
- Training Programs & Workouts
- Exercise Library (общи + персонални)
- Nutrition Plans & Recipes
- Food Items & Ingredients
- Body Measurements & Progress Photos
- Chat Conversations & Messages
- Notifications
- Client-Trainer relationships (1 клиент = 1 треньор)

### Authentication Flow
- Supabase Auth за основно authentication
- Update.dev за billing и extended features
- Invitation system за клиенти (чрез имейл или уникален линк)

## 🎯 Ключови характеристики на платформата

### Top 5 функционалности
1. **Управление на клиенти** - Централизирано управление на до 3/6/неограничени клиенти (според план)
2. **Тренировъчни програми** - Създаване на програми с 800+ упражнения, календарно планиране, проследяване
3. **Хранителни планове** - Автоматично изчисляване на макроси, библиотека с храни и рецепти
4. **Прогрес tracking** - Проследяване на цели, тегло, всякакви измервания, progress photos
5. **Комуникация** - Вграден real-time чат за директна връзка треньор-клиент

### Най-голям решен проблем
**От хаос към централизация:**
- ❌ **ПРЕДИ:** Комуникация през WhatsApp/Viber, програми в Excel/Google Sheets/Notion/хвърчащи листчета, липса на проследяване, губене на време
- ✅ **СЕГА:** Всичко на едно място - една централизирана платформа за всички аспекти на работата с клиенти

### Use Cases по аудитория
- **Персонални треньори:** Създаване на тренировъчни програми, управление на клиенти, проследяване на прогрес
- **Нутриционисти:** Изготвяне на хранителни планове, автоматично изчисляване на макроси, библиотека с храни
- **Йога/Пилатес инструктори:** Планиране на сесии, календар, собствени упражнения
- **Фитнес коучове:** Цялостно управление - тренировки + хранене + цели + аналитика

### Client Experience - какво вижда клиентът
Когато клиент влезе в платформата, вижда:
1. **Тренировки за деня** - програма за днешната тренировка
2. **Хранене за деня** - какво трябва да яде днес
3. **Прогрес към целта** - визуализация на напредък
4. **Мотивиращи цитати** - вдъхновение и motivation
5. **Комуникация** - директен чат с треньора
6. **История** - предишни тренировки, измервания, снимки

### Резултати и ползи за треньори
- ⏱️ **Спестяване на време:** 10+ часа седмично благодарение на автоматизация и централизация
- 💰 **Повече клиенти = повече печалба:** Управлявайте повече клиенти едновременно без хаос
- 🎯 **Централизирано управление:** Всички клиенти, програми, комуникация на едно място
- 😊 **Удовлетворени клиенти:** Професионална платформа вместо PDF файлове и WhatsApp
- 📊 **Проследяване на напредък:** Виждате кой какво е тренирал и ял
- 🚀 **Улеснена работа:** Лесно създаване и редактиране на програми

### Уникални features (конкурентно предимство)
- 📅 **Google Calendar интеграция** - Синхронизация на тренировки с Google Calendar
- 📤 **Export функционалност** - Export на програми в PDF, Excel, CSV формати
- 💬 **Вграден real-time чат** - Комуникация без WhatsApp/Viber
- 🏋️ **800+ упражнения** - Огромна библиотека с упражнения
- 🍎 **Автоматични макроси** - Автоматично изчисляване на калории и макронутриенти
- 🎯 **Всичко на едно място** - Единна платформа за всички аспекти
- 📱 **Web-based** - Работи на всички устройства без инсталация

### Технически бележки
- ❌ **Засега БЕЗ drag & drop** - Планирано за бъдеща версия
- 👤 **1 клиент = 1 треньор** - Клиентите не се споделят между треньори
- 📏 **Всякакви измервания** - Тегло, обиколки (гърди, талия, бедра, ръце, крака и др.)
- 🏋️ **800+ упражнения** - Богата библиотека с упражнения
- 🔄 **Real-time sync** - Промените се синхронизират автоматично за клиентите

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

# Optional: Stripe (if using direct integration)
STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
```

### Development
- Port: 3001 (configured in NEXT_PUBLIC_SITE_URL)
- Hot reload enabled
- TypeScript strict mode

## 🆕 Ново в проекта (Декември 2024)

### Реализирани функционалности:
- ✅ **Real-time Chat System** - Мгновена комуникация с Supabase Broadcast
- ✅ **Workout Builder** - Конструктор на тренировки с календарен интерфейс
- ✅ **Exercise Library** - Разширена библиотека с 800+ упражнения, търсене и филтриране
- ✅ **Food & Recipe Management** - Пълна система за храни и рецепти
- ✅ **Progress Tracking** - Body measurements и progress photos
- ✅ **Analytics Dashboard** - Статистики за треньори
- ✅ **Notifications System** - Toast и real-time уведомления
- ✅ **Enhanced Client Dashboard** - Подобрен дневен dashboard с тренировки, хранене и прогрес
- ✅ **Google Calendar Integration** - Синхронизация с Google Calendar
- ✅ **Export Functionality** - Export на програми в множество формати

### Ключови файлове за разбиране:
- `CHAT_SYSTEM_README.md` - Документация за chat системата
- `app/protected/goals/page.tsx` - Goals и progress tracking
- `components/chat/` - Chat компоненти
- `app/protected/workout-builder/` - Workout builder
- `app/api/chat/` - Chat API endpoints

---

💡 **Забележка:** Това е fitness SaaS приложение за треньори. Фокусирай се на user experience, performance и data integrity при всички промени.