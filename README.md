# 🏋️ Fitness Training Platform

<p align="center">
  <img alt="Fitness Training Platform" src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" width="600">
  <h1 align="center">Fitness Training Platform</h1>
</p>

<p align="center">
  A comprehensive SaaS platform for personal trainers to manage clients, create workout programs, and track progress—powered by <a href="https://nextjs.org/">Next.js</a>, <a href="https://supabase.com">Supabase</a>, and <a href="https://update.dev">Update</a>.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#demo"><strong>Demo</strong></a> ·
  <a href="#deploy-to-vercel"><strong>Deploy to Vercel</strong></a> ·
  <a href="#local-setup"><strong>Local Setup</strong></a> ·
  <a href="#support"><strong>Support</strong></a>
</p>

---

## ⚡ Features

### 🏋️ Fitness Management
- 👥 **Client Management** — Invite and manage clients with email invitations
- 📅 **Workout Builder** — Drag & drop workout creator with calendar integration
- 💪 **Exercise Library** — Comprehensive exercise database with custom additions
- 🍎 **Nutrition Planning** — Create and manage nutrition plans with macros
- 📊 **Progress Tracking** — Body measurements, progress photos, and goal tracking
- 📈 **Analytics Dashboard** — Statistics and insights for trainers

### 💬 Communication
- 💬 **Real-time Chat** — Instant messaging between trainers and clients
- 🔔 **Notifications** — Toast notifications and real-time alerts
- 📧 **Email System** — Automated invitations and notifications

### 💳 Business Features
- 💳 **Subscriptions** — Stripe billing with Free/Pro/Beast plans
- 🔐 **Authentication** — Multi-provider auth with Supabase
- 🔓 **Role Management** — Trainer/Client role-based access control
- ⚙️ **Full-stack Ready** — App Router, Middleware, and TypeScript

### 🎨 Modern UI/UX
- 🎨 **Beautiful Design** — Built with [Tailwind CSS](https://tailwindcss.com) and [shadcn/ui](https://ui.shadcn.com)
- 🌙 **Dark/Light Mode** — Theme switching support
- 📱 **Responsive** — Mobile-first design approach

---

## 🔗 Demo

Live demo: [nextjs-supabase-stripe-update.vercel.app](https://nextjs-supabase-stripe-update.vercel.app/)

### 🎯 Target Users
- **Personal Trainers** — Manage clients and create workout programs
- **Nutritionists** — Plan and track nutrition programs
- **Fitness Coaches** — Comprehensive client management and progress tracking
- **Yoga/Pilates Instructors** — Session planning and client communication

---

## 🚀 Deploy to Vercel

Click the button below to instantly deploy the template and set up Update and Supabase:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fupdatedotdev%2Fnextjs-supabase-stripe-update&project-name=update-nextjs-template&repository-name=update-nextjs-template&demo-title=Update%20SaaS%20Starter&demo-description=A%20Next.js%20starter%20with%20Update%20for%20auth%2C%20billing%2C%20and%20orgs&demo-url=https%3A%2F%2Fvercel-update-template.vercel.app&external-id=https%3A%2F%2Fupdate.dev)

---

## 🛠️ Local Setup

### 1. Clone the project

```bash
git clone https://github.com/updatedotdev/nextjs-supabase-stripe-update.git cd nextjs-supabase-stripe-update
```

### 2. Install dependencies

```bash
npm install
```

# or

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file based on the provided example:

```bash
cp .env.example .env.local
```

Fill in values from:

- [Update dashboard](https://update.dev)
- [Supabase project settings](https://app.supabase.com/project/_/settings/api)

```bash
NEXT_PUBLIC_UPDATE_PUBLIC_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---

## 📦 What's Included

### 🔌 Core Setup
- **Supabase Integration**: Database, auth, and real-time features
- **Update.dev Integration**: Billing and subscription management
- **TypeScript**: Full type safety throughout the application

### 🏋️ Fitness Features
- **Workout Builder**: Calendar-based workout creation with drag & drop
- **Exercise Library**: 500+ exercises with custom exercise creation
- **Nutrition Planning**: Macro tracking and meal planning
- **Progress Tracking**: Body measurements and photo progress
- **Real-time Chat**: Instant messaging with Supabase Broadcast

### 💳 Business Logic
- **Subscription Plans**: Free, Pro, Beast tiers with Stripe integration
- **Role Management**: Trainer/Client role-based access control
- **Invitation System**: Email-based client onboarding
- **Analytics**: Trainer dashboard with client statistics

### 🎨 UI Components
- **shadcn/ui**: Modern, accessible component library
- **Tailwind CSS**: Utility-first styling with custom theme
- **Dark/Light Mode**: Theme switching with next-themes
- **Responsive Design**: Mobile-first approach

---

## 🧩 Tech Stack

### Frontend
- [Next.js 15.2.4](https://nextjs.org) — React framework with App Router
- [TypeScript](https://typescriptlang.org) — Type safety and developer experience
- [Tailwind CSS 4.0.13](https://tailwindcss.com) — Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com) — Modern component library
- [Lucide React](https://lucide.dev) — Beautiful icons

### Backend & Database
- [Supabase](https://supabase.com) — PostgreSQL database with real-time features
- [Supabase Auth](https://supabase.com/auth) — Authentication and user management
- [Supabase Storage](https://supabase.com/storage) — File storage for progress photos

### Business & Billing
- [Update.dev](https://update.dev) — Subscription management
- [Stripe](https://stripe.com) — Payment processing
- [Resend](https://resend.com) — Email delivery service

### Real-time & Communication
- [Supabase Realtime](https://supabase.com/realtime) — Real-time chat and notifications
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) — Instant messaging

### Development Tools
- [ESLint](https://eslint.org) — Code linting and formatting
- [Prettier](https://prettier.io) — Code formatting
- [React Hook Form](https://react-hook-form.com) — Form management
- [Zod](https://zod.dev) — Schema validation

---

## 🚀 Getting Started

### For Personal Trainers
1. **Sign up** as a trainer
2. **Invite clients** via email
3. **Create workout programs** using the Workout Builder
4. **Plan nutrition** with macro tracking
5. **Track progress** with measurements and photos
6. **Communicate** via real-time chat

### For Clients
1. **Accept invitation** from your trainer
2. **View your programs** and nutrition plans
3. **Track your progress** with goals and measurements
4. **Communicate** with your trainer
5. **Stay motivated** with progress photos and analytics

## 🤝 Support

- 📚 [Project Documentation](PROJECT_CONTEXT.md) — Comprehensive project guide
- 💬 [Chat System Guide](CHAT_SYSTEM_README.md) — Real-time messaging documentation
- 🐛 Found a bug? [Open an issue](https://github.com/updatedotdev/nextjs-supabase-stripe-update/issues)
- 💡 Need help? Check the [Claude Context](CLAUDE.md) for development guidelines

---

## 📄 License

MIT
