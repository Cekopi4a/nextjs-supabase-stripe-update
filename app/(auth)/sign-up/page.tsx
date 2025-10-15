"use client"

import { signUpAction } from "@/app/actions";
import AuthSubmitButton from "@/components/auth-submit-button";
import GoogleAuthButton from "@/components/google-auth-button";
import { FormMessage, Message } from "@/components/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BirthDatePicker } from "@/components/ui/birth-date-picker";
import { Dumbbell, Users, Calendar, TrendingUp, CheckCircle2, Sparkles, Award, Rocket } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function SignUp(props: {
  searchParams: Promise<Message>;
}) {
  const [searchParams, setSearchParams] = useState<Message | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);

  useEffect(() => {
    props.searchParams.then(setSearchParams);
  }, [props.searchParams]);

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left side - Hero/Branding */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          {/* Trainer-focused fitness image */}
          <img
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop"
            alt="Personal trainer background"
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
              <Rocket className="h-4 w-4 text-blue-300" />
              <span className="text-sm font-medium text-slate-100">Започнете безплатно</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-white">
              Развийте бизнеса си<br />
              <span className="text-blue-300">
                като професионален треньор
              </span>
            </h2>

            <p className="text-lg text-slate-300 leading-relaxed max-w-md">
              Присъединете се към хиляди треньори, които вече управляват клиенти, програми и хранителни планове професионално.
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-3 max-w-md">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-blue-300" />
              </div>
              <span className="text-sm text-slate-200">Неограничени клиенти и програми</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-blue-300" />
              </div>
              <span className="text-sm text-slate-200">Автоматично проследяване на прогрес</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-blue-300" />
              </div>
              <span className="text-sm text-slate-200">Календар и планиране на тренировки</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-blue-300" />
              </div>
              <span className="text-sm text-slate-200">Real-time комуникация с клиенти</span>
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
              <Calendar className="h-5 w-5 mb-2 text-blue-300" />
              <div className="text-2xl font-bold text-white">FREE</div>
              <div className="text-xs text-slate-300 mt-1">Стартов план</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all hover:scale-105">
              <TrendingUp className="h-5 w-5 mb-2 text-blue-300" />
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-xs text-slate-300 mt-1">Достъп</div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  ГП
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm leading-relaxed text-slate-200">
                  &ldquo;Невероятна платформа! Сега мога да управлявам всички мои клиенти на едно място и да им давам най-добрите програми.&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold text-white">Георги Петров</p>
                  <p className="text-xs text-slate-400">Сертифициран треньор</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="lg:p-8 flex items-center justify-center min-h-screen overflow-y-auto">
        <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[420px] px-4 py-8">
          {/* Mobile logo */}
          <div className="flex flex-col space-y-4 text-center">
            <div className="lg:hidden w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Dumbbell className="h-7 w-7 text-white" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Създайте акаунт
              </h1>
              <p className="text-base text-muted-foreground">
                Започнете безплатно като персонален треньор
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Google Sign Up Button */}
            <GoogleAuthButton mode="sign-up" />

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
            <form action={signUpAction}>
              <div className="grid gap-5">
                {/* Personal Information */}
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="full_name" className="text-sm font-medium">
                      Име и Фамилия <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      placeholder="Иван Петров"
                      type="text"
                      autoComplete="name"
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Имейл <span className="text-red-500">*</span>
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
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Телефон <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+359 88 123 4567"
                      type="tel"
                      autoComplete="tel"
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Парола <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      placeholder="Минимум 8 символа"
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Location & Additional Info */}
                <div className="space-y-4 pt-2 border-t">
                  <div className="grid gap-2">
                    <Label htmlFor="city" className="text-sm font-medium">
                      Град <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="София"
                      type="text"
                      autoComplete="address-level2"
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date_of_birth" className="text-sm font-medium">
                      Дата на раждане <span className="text-muted-foreground text-xs">(опционално)</span>
                    </Label>
                    <BirthDatePicker
                      date={dateOfBirth}
                      onDateChange={setDateOfBirth}
                    />
                    <input
                      type="hidden"
                      name="date_of_birth"
                      value={dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : ""}
                    />
                  </div>
                </div>

                {searchParams && <FormMessage message={searchParams} />}
                <AuthSubmitButton />
              </div>
            </form>

            <p className="px-4 text-center text-xs text-muted-foreground">
              С регистрацията вие се съгласявате с нашите{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary font-medium"
              >
                Условия за ползване
              </Link>{" "}
              и{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary font-medium"
              >
                Политика за поверителност
              </Link>
              .
            </p>
          </div>

          {/* Sign in link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Вече имате акаунт?{" "}
              <Link
                href="/sign-in"
                className="font-semibold text-primary hover:underline underline-offset-4"
              >
                Влезте тук
              </Link>
            </p>
          </div>

          {/* Trust badges */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Rocket className="h-3.5 w-3.5 text-blue-600" />
                <span>Бърз старт</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-blue-600" />
                <span>Безплатен план</span>
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
