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

### Ключови библиотеки
- `@supabase/supabase-js` - Database client
- `@updatedev/js` - Auth & billing
- `@dnd-kit/*` - Drag & drop functionality
- `lucide-react` - Icons
- `next-themes` - Theme management
- `resend` - Email service

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
│   ├── calendar/    # Calendar functionality
│   └── ...
└── join/           # Invitation handling
```

### Основни функционалности
1. **Client Management** - Управление на клиенти и покани
2. **Training Programs** - Създаване и управление на тренировъчни програми
3. **Nutrition Planning** - Хранителни планове и макроси
4. **Calendar** - Календар за тренировки
5. **Billing** - Subscription management via Stripe
6. **Authentication** - Multi-provider auth

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
NEXT_PUBLIC_UPDATE_PUBLIC_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Development
- Port: 3000
- Hot reload enabled
- TypeScript strict mode

---

💡 **Забележка:** Това е fitness SaaS приложение за треньори. Фокусирай се на user experience, performance и data integrity при всички промени.