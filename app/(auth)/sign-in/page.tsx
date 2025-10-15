import { signInAction } from "@/app/actions";
import AuthSubmitButton from "@/components/auth-submit-button";
import GoogleAuthButton from "@/components/google-auth-button";
import { FormMessage, Message } from "@/components/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Activity, Users, TrendingUp, Sparkles, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";

export default async function SignIn(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left side - Hero/Branding */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          {/* You can replace this URL with your own image */}
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
            alt="Fitness background"
            className="w-full h-full object-cover opacity-40"
          />
          {/* Soft gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/85 to-slate-800/90" />
        </div>

        {/* Subtle animated background orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-20 -left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        {/* Logo section */}
        <div className="relative z-20 flex items-center text-lg font-medium">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3 border border-white/20 shadow-lg hover:scale-110 transition-transform">
            <Dumbbell className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Fitness Training</span>
        </div>

        {/* Main content */}
        <div className="relative z-20 mt-auto space-y-8">
          {/* Headline */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Sparkles className="h-4 w-4 text-blue-300" />
              <span className="text-sm font-medium text-slate-100">Професионално решение</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-white">
              Управлявайте бизнеса си<br />
              <span className="text-blue-300">
                лесно и ефективно
              </span>
            </h2>

            <p className="text-lg text-slate-300 leading-relaxed max-w-md">
              Всичко необходимо за управление на клиенти, тренировки и хранителни планове на едно място.
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-3 max-w-md">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-blue-300" />
              </div>
              <span className="text-sm text-slate-200">Персонализирани тренировъчни програми</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-blue-300" />
              </div>
              <span className="text-sm text-slate-200">Хранителни планове и макроси</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-blue-300" />
              </div>
              <span className="text-sm text-slate-200">Real-time комуникация с клиенти</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-blue-300" />
              </div>
              <span className="text-sm text-slate-200">Проследяване на прогрес и цели</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 pt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all hover:scale-105">
              <Users className="h-5 w-5 mb-2 text-blue-300" />
              <div className="text-2xl font-bold text-white">2K+</div>
              <div className="text-xs text-slate-300 mt-1">Треньори</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all hover:scale-105">
              <Activity className="h-5 w-5 mb-2 text-blue-300" />
              <div className="text-2xl font-bold text-white">50K+</div>
              <div className="text-xs text-slate-300 mt-1">Тренировки</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all hover:scale-105">
              <TrendingUp className="h-5 w-5 mb-2 text-blue-300" />
              <div className="text-2xl font-bold text-white">95%</div>
              <div className="text-xs text-slate-300 mt-1">Успеваемост</div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  МИ
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm leading-relaxed text-slate-200">
                  &ldquo;Тази платформа промени начина, по който управлявам клиентите си. Всичко е на едно място - тренировки, хранене и прогрес.&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold text-white">Мария Иванова</p>
                  <p className="text-xs text-slate-400">Персонален треньор</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="lg:p-8 flex items-center justify-center min-h-screen">
        <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[420px] px-4">
          {/* Mobile logo */}
          <div className="flex flex-col space-y-4 text-center">
            <div className="lg:hidden w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Dumbbell className="h-7 w-7 text-white" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Добре дошли отново
              </h1>
              <p className="text-base text-muted-foreground">
                Влезте в акаунта си за да продължите
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Google Sign In Button */}
            <GoogleAuthButton mode="sign-in" />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-muted-foreground font-medium">
                  Или с имейл
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form action={signInAction}>
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Имейл адрес
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="ivan@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    required
                    className="h-11"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Парола
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-primary hover:underline underline-offset-4"
                    >
                      Забравена парола?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="h-11"
                  />
                </div>
                <FormMessage message={searchParams} />
                <AuthSubmitButton />
              </div>
            </form>
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground">
            Нямате акаунт?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-primary hover:underline underline-offset-4"
            >
              Регистрирайте се безплатно
            </Link>
          </p>

          {/* Trust badges */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-blue-600" />
                <span>Бърз старт</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                <span>Сигурно</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Професионално</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
