"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dumbbell, Star, ArrowRight, Check, Target, Plus, Minus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Footer from "@/components/footer";

export default function Home() {

  const testimonials = [
    {
      name: "Мартин Стефанов",
      role: "Персонален треньор",
      content: "Управлявам всичките си клиенти лесно. Създавам програми и планове за хранене бързо и ефективно.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Петя Николова", 
      role: "Клиент",
      content: "Имам всичко на едно място - програмата ми, хранителния план и проследяване на напредъка.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616c6e1e6d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Александър Димитров",
      role: "Фитнес треньор",
      content: "Платформата ми спестява часове работа. Клиентите ми са доволни от персонализирания подход.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    }
  ];

  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Как мога да започна да използвам платформата?",
      answer: "Регистрирайте се безплатно като треньор и започнете да добавяте до 3 клиента веднага. Процесът е бърз и лесен - просто създайте акаунт, добавете информация за вашите клиенти и започнете да създавате персонализирани програми."
    },
    {
      question: "Как клиентите ми получават достъп до програмите?",
      answer: "Всеки клиент получава уникален код или линк от вас. След регистрация в платформата с този код, те автоматично се свързват с вашия профил и виждат всички програми и хранителни планове, които сте създали за тях."
    },
    {
      question: "Мога ли да редактирам програмите след създаването им?",
      answer: "Да, можете да редактирате всички програми и хранителни планове по всяко време. Промените се актуализират автоматично за вашите клиенти и те получават известие за промените."
    },
    {
      question: "Какво включва Free планът?",
      answer: "Free планът ви позволява да управлявате до 3 клиента с основни тренировъчни програми и хранителни планове. Това е перфектно за треньори, които започват или имат малък брой клиенти."
    },
    {
      question: "Как мога да надградя плана си?",
      answer: "Можете да надградите плана си по всяко време от секцията Абонамент в профила си. Промените влизат в сила веднага и можете да добавите повече клиенти незабавно."
    },
    {
      question: "Има ли мобилно приложение?",
      answer: "В момента платформата е уеб-базирана и работи отлично на всички устройства - компютър, таблет и телефон. Работим върху нативно мобилно приложение, което скоро ще бъде налично."
    },
    {
      question: "Как функционира календарът за тренировки?",
      answer: "Всеки клиент има персонален календар, където вие можете да насрочите тренировки за всеки ден. Клиентите виждат какво трябва да тренират всеки ден и могат да отбелязват завършените тренировки."
    },
    {
      question: "Мога ли да добавям собствени упражнения и храни?",
      answer: "Да! Платформата ви позволява да създавате собствени упражнения с описания, снимки и видеа, както и да добавяте персонализирани храни с техните макронутриенти."
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      monthlyPrice: "0",
      yearlyPrice: "0",
      period: billingInterval === "monthly" ? "лв/месечно" : "лв/годишно",
      description: "Перфектно за започващи треньори",
      features: [
        "До 3 клиента",
        "Основни тренировъчни програми",
        "Базови хранителни планове",
        "Календар за всеки клиент",
        "Email поддръжка"
      ],
      popular: false
    },
    {
      name: "Pro",
      monthlyPrice: "49",
      yearlyPrice: "490",
      period: billingInterval === "monthly" ? "лв/месечно" : "лв/годишно",
      originalYearlyPrice: "588",
      description: "За професионални треньори",
      features: [
        "До 6 клиента",
        "Детайлни тренировъчни програми",
        "Персонализирани хранителни планове",
        "Проследяване на напредъка",
        "Известия за клиенти",
        "Приоритетна поддръжка"
      ],
      popular: true
    },
    {
      name: "Beast",
      monthlyPrice: "99",
      yearlyPrice: "990",
      period: billingInterval === "monthly" ? "лв/месечно" : "лв/годишно",
      originalYearlyPrice: "1188",
      description: "За фитнес студия и експерти",
      features: [
        "Неограничени клиенти",
        "Всички Pro функции",
        "Детайлна аналитика",
        "Брандинг опции",
        "API достъп",
        "24/7 поддръжка"
      ],
      popular: false
    }
  ];

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-black overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-cyan-400/30 to-blue-400/30 dark:from-cyan-600/20 dark:to-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-300/10 to-cyan-300/10 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 pt-32 pb-24 min-h-screen flex items-center">
          <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
            {/* Left Content */}
            <div className="z-10">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-950/50 dark:to-cyan-950/50 text-blue-700 dark:text-blue-300 px-5 py-2.5 rounded-full text-sm font-semibold mb-8 border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
                <Dumbbell className="h-4 w-4" />
                Станете по-добрата версия на себе си
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] text-gray-900 dark:text-white">
                ПОСТИГНЕТЕ ВАШАТА
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 animate-gradient">
                  МЕЧТАНА ФОРМА
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-xl font-medium">
                Персонализирани програми и професионална подкрепа за трансформиране към най-добрата версия на себе си.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <Button
                  size="lg"
                  className="px-8 py-6 text-base font-bold h-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white border-0 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                  asChild
                >
                  <Link href="/sign-up">
                    Започнете сега
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-base font-bold h-auto border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-600 dark:hover:border-blue-600 rounded-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg"
                  asChild
                >
                  <Link href="#demo">
                    <span className="mr-2">▶</span>
                    Демо тренировка
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-xl">
                <div className="text-left group cursor-default">
                  <div className="text-4xl md:text-5xl font-black bg-gradient-to-br from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform">80</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider">Тренировъчни<br />програми</div>
                </div>
                <div className="text-left group cursor-default">
                  <div className="text-4xl md:text-5xl font-black bg-gradient-to-br from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform">872+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider">Активни<br />клиенти</div>
                </div>
                <div className="text-left group cursor-default">
                  <div className="text-4xl md:text-5xl font-black bg-gradient-to-br from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform">120+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider">Професионални<br />треньори</div>
                </div>
              </div>
            </div>

            {/* Right Cards */}
            <div className="relative hidden lg:block h-[600px]">
              {/* Trainer Image Card - централна */}
              <div className="absolute top-1/2 -translate-y-1/2 right-10 w-80 h-[420px] bg-white dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-float">
                <Image
                  src="https://media.istockphoto.com/id/1401908975/photo/gym-man-and-phone-mockup-with-fitness-app-for-workout-tracking-health-data-or-exercise.jpg?s=612x612&w=0&k=20&c=FZGq8dx_CPY8L0DqCI8FJlE2qzUnFQGvMqq7mNEeZjw="
                  alt="Треньор с мобилно приложение"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="text-white font-bold text-lg mb-1">Управлявайте клиенти</div>
                  <div className="text-gray-200 text-sm">Всичко на едно място</div>
                </div>
              </div>

              {/* Heart Rate Card */}
              <div className="absolute top-0 right-0 w-64 bg-white dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl animate-float hover:scale-105 transition-transform" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Сърдечен ритъм</div>
                  </div>
                </div>
                <div className="text-4xl font-black text-gray-900 dark:text-white mb-1">145 <span className="text-xl text-gray-500 dark:text-gray-400">bpm</span></div>
              </div>

              {/* Calories Card */}
              <div className="absolute bottom-0 right-20 w-72 bg-white dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl animate-float hover:scale-105 transition-transform" style={{ animationDelay: '0.5s' }}>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-2">Изгорени калории днес</div>
                <div className="text-3xl font-black text-gray-900 dark:text-white mb-4">420 <span className="text-lg text-gray-500 dark:text-gray-400">cal</span></div>
                <div className="flex gap-1.5 h-20 items-end">
                  <div className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-lg shadow-lg" style={{ height: '60%' }}></div>
                  <div className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-lg shadow-lg" style={{ height: '80%' }}></div>
                  <div className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-lg shadow-lg" style={{ height: '45%' }}></div>
                  <div className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-lg shadow-lg" style={{ height: '90%' }}></div>
                  <div className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-lg shadow-lg" style={{ height: '70%' }}></div>
                  <div className="w-full bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-lg shadow-lg opacity-60" style={{ height: '50%' }}></div>
                </div>
              </div>

              {/* Decorative gradient blobs */}
              <div className="absolute top-20 right-0 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 dark:from-blue-500/20 dark:to-cyan-500/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 dark:from-cyan-500/20 dark:to-blue-500/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
      </section>

      {/* Why Choose FitLife Studio */}
      <section className="relative px-4 py-24 bg-gradient-to-br from-white via-blue-50/20 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 dark:from-blue-600/10 dark:to-cyan-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-0 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 dark:from-cyan-600/10 dark:to-blue-600/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-950/50 dark:to-cyan-950/50 text-blue-700 dark:text-blue-300 px-5 py-2.5 rounded-full text-sm font-semibold mb-6 border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
                <Dumbbell className="h-4 w-4" />
                Как работи платформата
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                Всичко необходимо за <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">успешно управление</span> на клиентите
              </h2>

              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed font-medium">
                Над 100 персонални треньора вече използват нашата платформа за управление на техните клиенти. Присъединете се към тях!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button
                  size="lg"
                  className="px-8 py-6 text-base font-bold h-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                  asChild
                >
                  <Link href="/sign-up">
                    Започнете днес
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-base font-bold h-auto border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg"
                  asChild
                >
                  <Link href="/about">
                    Научете повече
                  </Link>
                </Button>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-black bg-gradient-to-br from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-1">500+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Клиенти</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-black bg-gradient-to-br from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-1">100+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Треньори</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-black bg-gradient-to-br from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-1">4.8★</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Рейтинг</div>
                </div>
              </div>
            </div>

            {/* Right Features Grid */}
            <div className="grid grid-cols-2 gap-5 order-1 lg:order-2">
              <div className="group relative bg-white dark:bg-gray-800 p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Dumbbell className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Управление на клиенти
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Добавяйте клиенти чрез специален код или линк
                </p>
              </div>

              <div className="group relative bg-white dark:bg-gray-800 p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 mt-8">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Target className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  Индивидуални програми
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Създавайте персонализирани тренировки за всеки клиент
                </p>
              </div>

              <div className="group relative bg-white dark:bg-gray-800 p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Star className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Хранителни планове
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Създавайте персонализирани хранителни режими
                </p>
              </div>

              <div className="group relative bg-white dark:bg-gray-800 p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 mt-8">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Check className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  Проследяване на прогреса
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Клиентите въвеждат килограми, измервания и цели
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Fitness Services */}
      <section className="relative px-4 py-24 bg-white dark:bg-gray-900 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/5 to-cyan-400/5 dark:from-blue-600/5 dark:to-cyan-600/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-950/50 dark:to-cyan-950/50 text-blue-700 dark:text-blue-300 px-5 py-2.5 rounded-full text-sm font-semibold mb-6 border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
              <Star className="h-4 w-4" />
              Ключови функционалности
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
              Мощни инструменти за <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">професионалисти</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium">
              Всичко необходимо за ефективно управление на клиенти на едно място
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="group relative p-8 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-950/20 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-2xl group-hover:from-blue-400/20 transition-all"></div>

              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mb-5 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Dumbbell className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Клиентски профили
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-sm">
                  Всеки клиент се регистрира с уникален код от треньора и получава персонализиран достъп
                </p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold text-sm group-hover:gap-2 transition-all">
                  Научете повече
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative p-8 bg-gradient-to-br from-white to-cyan-50/30 dark:from-gray-800 dark:to-cyan-950/20 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-2xl group-hover:from-cyan-400/20 transition-all"></div>

              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-5 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  Календар с тренировки
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-sm">
                  Персонален календар за всеки клиент с детайлни тренировки за всеки ден
                </p>
                <div className="flex items-center text-cyan-600 dark:text-cyan-400 font-semibold text-sm group-hover:gap-2 transition-all">
                  Научете повече
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative p-8 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-950/20 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-2xl group-hover:from-blue-400/20 transition-all"></div>

              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mb-5 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Target className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Планер за хранене
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-sm">
                  Интерактивен планер за създаване на персонализирани хранителни режими
                </p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold text-sm group-hover:gap-2 transition-all">
                  Научете повече
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="group relative p-8 bg-gradient-to-br from-white to-cyan-50/30 dark:from-gray-800 dark:to-cyan-950/20 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-2xl group-hover:from-cyan-400/20 transition-all"></div>

              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-5 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  Проследяване на напредък
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-sm">
                  Клиентите виждат своя напредък в реално време спрямо поставените цели
                </p>
                <div className="flex items-center text-cyan-600 dark:text-cyan-400 font-semibold text-sm group-hover:gap-2 transition-all">
                  Научете повече
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Card 5 */}
            <div className="group relative p-8 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-950/20 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-2xl group-hover:from-blue-400/20 transition-all"></div>

              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mb-5 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Dumbbell className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Управление на абонамент
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-sm">
                  Избор между Free, Pro и Beast планове с различен брой клиенти
                </p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold text-sm group-hover:gap-2 transition-all">
                  Научете повече
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Card 6 */}
            <div className="group relative p-8 bg-gradient-to-br from-white to-cyan-50/30 dark:from-gray-800 dark:to-cyan-950/20 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-2xl group-hover:from-cyan-400/20 transition-all"></div>

              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-5 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  Известия за клиенти
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-sm">
                  Автоматични известия при нови програми, планове и актуализации
                </p>
                <div className="flex items-center text-cyan-600 dark:text-cyan-400 font-semibold text-sm group-hover:gap-2 transition-all">
                  Научете повече
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative px-4 py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 dark:from-blue-600/10 dark:to-cyan-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 dark:from-cyan-600/10 dark:to-blue-600/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-950/50 dark:to-cyan-950/50 text-blue-700 dark:text-blue-300 px-5 py-2.5 rounded-full text-sm font-semibold mb-6 border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
              <Target className="h-4 w-4" />
              Изберете перфектния план за вас
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
              Прозрачни и достъпни <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">цени</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 font-medium">
              Започнете с безплатния план и надградете, когато сте готови
            </p>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
              <div className="bg-white dark:bg-gray-800 p-1.5 rounded-2xl flex gap-1 shadow-lg border border-gray-200 dark:border-gray-700">
                <Button
                  variant={billingInterval === "monthly" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBillingInterval("monthly")}
                  className={`px-8 py-2.5 rounded-xl font-semibold transition-all ${
                    billingInterval === "monthly"
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Месечно
                </Button>
                <Button
                  variant={billingInterval === "yearly" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBillingInterval("yearly")}
                  className={`px-8 py-2.5 rounded-xl font-semibold transition-all ${
                    billingInterval === "yearly"
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Годишно
                  <span className="ml-2 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                    -17%
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-3xl transition-all duration-300 ${
                  plan.popular
                    ? 'transform scale-105 md:scale-110 z-10'
                    : 'hover:scale-105'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl">
                      ⭐ Най-популярен
                    </span>
                  </div>
                )}

                <Card className={`relative h-full p-8 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950/30 border-2 border-blue-500 shadow-2xl'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl'
                } transition-all duration-300`}>

                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
                      plan.popular
                        ? 'bg-gradient-to-br from-blue-600 to-cyan-500'
                        : 'bg-gradient-to-br from-gray-700 to-gray-600'
                    }`}>
                      <span className="text-3xl font-black text-white">
                        {plan.name === 'Free' ? '🆓' : plan.name === 'Pro' ? '⚡' : '👑'}
                      </span>
                    </div>

                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3">{plan.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 font-medium mb-6">{plan.description}</p>

                    <div className="mb-6">
                      <div className="flex items-end justify-center gap-1 mb-2">
                        <span className={`text-6xl font-black ${
                          plan.popular
                            ? 'bg-gradient-to-br from-blue-600 to-cyan-500 bg-clip-text text-transparent'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {billingInterval === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-lg font-semibold mb-2">лв</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {billingInterval === "monthly" ? 'на месец' : 'на година'}
                      </p>
                      {billingInterval === "yearly" && plan.originalYearlyPrice && (
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                            {plan.originalYearlyPrice} лв
                          </span>
                          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-3 py-1 rounded-full font-bold">
                            Спестете {parseInt(plan.originalYearlyPrice) - parseInt(plan.yearlyPrice)} лв
                          </span>
                        </div>
                      )}
                    </div>

                    <Button
                      className={`w-full py-6 text-base font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white'
                          : 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white'
                      }`}
                      asChild
                    >
                      <Link href="/sign-up">
                        {plan.name === 'Free' ? '🚀 Започнете безплатно' : '✨ Изберете плана'}
                      </Link>
                    </Button>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3 group">
                        <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          plan.popular
                            ? 'bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 group-hover:scale-110'
                            : 'bg-green-100 dark:bg-green-900/30 group-hover:scale-110'
                        }`}>
                          <Check className={`h-4 w-4 ${
                            plan.popular
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-green-600 dark:text-green-400'
                          } font-bold`} />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {/* Additional info */}
          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Всички планове включват 14-дневна гаранция за връщане на парите 💯
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="h-4 w-4" />
              Отзиви от треньори и клиенти
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Какво казват потребителите на платформата
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Вижте как нашата платформа помага на треньорите да управляват клиентите си по-ефективно
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8 bg-gray-800 border-gray-700 hover:shadow-xl transition-all hover:scale-105">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-blue-400 text-blue-400" />
                    ))}
                  </div>

                  <p className="text-gray-300 mb-6 italic leading-relaxed">
                    &quot;{testimonial.content}&quot;
                  </p>

                  <div className="w-16 h-16 rounded-full mx-auto mb-4 overflow-hidden">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h4 className="text-white font-bold mb-1">{testimonial.name}</h4>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-24 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-950/50 dark:to-cyan-950/50 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200/50 dark:border-blue-800/50">
              <Target className="h-4 w-4" />
              Често задавани въпроси
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Имате въпроси? Ние имаме отговори
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Разгледайте най-често задаваните въпроси за платформата
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 dark:hover:from-blue-950/30 dark:hover:to-cyan-950/30 transition-all duration-200 group"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-8 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 flex items-center justify-center group-hover:from-blue-200 group-hover:to-cyan-200 dark:group-hover:from-blue-800 dark:group-hover:to-cyan-800 transition-all duration-200">
                    {openFaqIndex === index ? (
                      <Minus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-5 pt-2">
                    <div className="h-px bg-gradient-to-r from-blue-100 via-cyan-100 to-transparent dark:from-blue-900/50 dark:via-cyan-900/50 mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Имате друг въпрос?
            </p>
            <Button
              variant="outline"
              size="lg"
              className="border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950/30 dark:hover:to-cyan-950/30 font-medium rounded-xl"
              asChild
            >
              <Link href="/contact">Свържете се с нас</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 py-24 bg-gradient-to-r from-blue-500 to-purple-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Започнете да управлявате клиентите си професионално
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Присъединете се към стотици треньори, които вече използват нашата платформа за управление на клиентите си
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-10 py-4 text-lg h-auto bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/sign-up">
                ЗАПОЧНЕТЕ БЕЗПЛАТНО - ДО 3 КЛИЕНТА
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-10 py-4 text-lg h-auto border-white text-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/sign-in">Вход за треньори</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
