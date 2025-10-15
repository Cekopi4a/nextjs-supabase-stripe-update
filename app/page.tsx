"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dumbbell, Star, ArrowRight, Check, Target, Plus, Minus, Users, Calendar, TrendingUp, Clock, DollarSign } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Footer from "@/components/footer";
import HeroShowcase from "@/components/landing/HeroShowcase";

export default function Home() {

  const targetAudience = [
    {
      title: "Персонални треньори",
      description: "Управлявайте клиенти професионално",
      badge: "800+ упражнения",
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      features: [
        "Управление на до 6+ клиента",
        "Тренировъчни програми с календар",
        "800+ упражнения в библиотека",
        "Real-time чат с клиенти",
        "Проследяване на прогрес и измервания",
        "Export в PDF/Excel формат"
      ]
    },
    {
      title: "Нутриционисти",
      description: "Създавайте хранителни планове лесно",
      badge: "Авто макроси",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      features: [
        "Изготвяне на хранителни планове",
        "Автоматично изчисляване на макроси",
        "Библиотека с храни и рецепти",
        "Проследяване на хранене",
        "Персонализирани препоръки",
        "Контрол на калории и макронутриенти"
      ]
    },
    {
      title: "Йога и Пилатес инструктори",
      description: "Планирайте сесии ефективно",
      badge: "Google Calendar",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      features: [
        "Планиране на сесии в календар",
        "Добавяне на собствени упражнения",
        "Следене на присъствие",
        "Комуникация през чат",
        "Google Calendar интеграция",
        "Мотивиращи цитати за клиенти"
      ]
    },
    {
      title: "Фитнес коучове",
      description: "Всичко на едно място",
      badge: "Всичко в 1",
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      features: [
        "Цялостно управление на клиенти",
        "Тренировки + хранене + цели",
        "Analytics и статистики",
        "Export на програми",
        "Спестяване на 10+ часа седмично",
        "Централизирана платформа"
      ]
    }
  ];

  const testimonials = [
    {
      name: "Мартин Стефанов",
      role: "Персонален треньор",
      content: "Управлявам всичките си клиенти лесно. Създавам програми и планове за хранене бързо и ефективно.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Анна Георгиева",
      role: "Нутриционист",
      content: "Платформата ми позволява лесно да управлявам хранителните планове на клиентите ми. Спестявам часове работа всеки ден.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616c6e1e6d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Елена Иванова",
      role: "Йога инструктор",
      content: "Идеална платформа за планиране на сесиите ми. Клиентите винаги знаят какво ги очаква и виждат прогреса си.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
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
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Fitness trainer working"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          {/* Gradient overlays for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/85 to-blue-900/90 dark:from-black/95 dark:via-black/85 dark:to-blue-950/90"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/50 dark:to-black/50"></div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 pt-32 pb-24 min-h-screen flex items-center">
          <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
            {/* Left Content */}
            <div className="z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-semibold mb-8 shadow-2xl">
                <Dumbbell className="h-4 w-4" />
                Станете по-добрата версия на себе си
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] text-white drop-shadow-2xl">
                ПОСТИГНЕТЕ ВАШАТА
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 animate-gradient drop-shadow-lg">
                  МЕЧТАНА ФОРМА
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-100 mb-10 leading-relaxed max-w-xl font-medium drop-shadow-lg">
                Персонализирани програми и професионална подкрепа за трансформиране към най-добрата версия на себе си.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <Button
                  size="lg"
                  className="px-8 py-6 text-base font-bold h-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white border-0 rounded-2xl shadow-2xl hover:shadow-[0_20px_60px_rgba(59,130,246,0.5)] transition-all duration-300 hover:scale-105 hover:-translate-y-1"
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
                  className="px-8 py-6 text-base font-bold h-auto border-2 border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-blue-600 hover:border-white rounded-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-2xl"
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
                  <div className="text-4xl md:text-5xl font-black text-white drop-shadow-lg mb-1 group-hover:scale-110 transition-transform">80</div>
                  <div className="text-sm text-gray-200 font-semibold uppercase tracking-wider drop-shadow-md">Тренировъчни<br />програми</div>
                </div>
                <div className="text-left group cursor-default">
                  <div className="text-4xl md:text-5xl font-black text-white drop-shadow-lg mb-1 group-hover:scale-110 transition-transform">872+</div>
                  <div className="text-sm text-gray-200 font-semibold uppercase tracking-wider drop-shadow-md">Активни<br />клиенти</div>
                </div>
                <div className="text-left group cursor-default">
                  <div className="text-4xl md:text-5xl font-black text-white drop-shadow-lg mb-1 group-hover:scale-110 transition-transform">120+</div>
                  <div className="text-sm text-gray-200 font-semibold uppercase tracking-wider drop-shadow-md">Професионални<br />треньори</div>
                </div>
              </div>
            </div>

            {/* Hero Showcase - Right Side */}
            <HeroShowcase />
          </div>
        </div>

      </section>

      {/* Target Audience Section */}
      <section className="relative px-4 py-24 bg-white dark:bg-gray-900 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-cyan-400/5 dark:from-blue-600/5 dark:to-cyan-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-400/5 to-blue-400/5 dark:from-cyan-600/5 dark:to-blue-600/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-950/50 dark:to-cyan-950/50 text-blue-700 dark:text-blue-300 px-5 py-2.5 rounded-full text-sm font-semibold mb-6 border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
              <Users className="h-4 w-4" />
              За кого е платформата
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
              Създадено специално за <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">фитнес професионалисти</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium">
              Независимо от специализацията ви, нашата платформа ще ви помогне да управлявате клиентите си ефективно
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {targetAudience.map((audience, index) => {
              // Define unique colors for each card
              const cardColors = [
                {
                  // Треньори - Blue/Cyan
                  badge: 'from-blue-600 to-cyan-500',
                  back: 'from-blue-600 via-blue-700 to-cyan-600',
                  check: 'text-cyan-300',
                  hint: 'text-blue-300',
                  mobile: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800',
                  mobileCheck: 'text-blue-600 dark:text-blue-400'
                },
                {
                  // Нутриционисти - Green/Emerald
                  badge: 'from-green-600 to-emerald-500',
                  back: 'from-green-600 via-emerald-600 to-teal-600',
                  check: 'text-emerald-300',
                  hint: 'text-green-300',
                  mobile: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800',
                  mobileCheck: 'text-green-600 dark:text-green-400'
                },
                {
                  // Йога/Пилатес - Purple/Pink
                  badge: 'from-purple-600 to-pink-500',
                  back: 'from-purple-600 via-fuchsia-600 to-pink-600',
                  check: 'text-pink-300',
                  hint: 'text-purple-300',
                  mobile: 'from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800',
                  mobileCheck: 'text-purple-600 dark:text-purple-400'
                },
                {
                  // Фитнес коучове - Orange/Red
                  badge: 'from-orange-600 to-red-500',
                  back: 'from-orange-600 via-red-600 to-rose-600',
                  check: 'text-orange-300',
                  hint: 'text-orange-300',
                  mobile: 'from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800',
                  mobileCheck: 'text-orange-600 dark:text-orange-400'
                }
              ];

              const colors = cardColors[index];

              return (
                <div
                  key={index}
                  className="group relative h-[400px] [perspective:1000px] cursor-default"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="relative h-full w-full transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                    {/* Front of card */}
                    <div className="absolute inset-0 h-full w-full rounded-2xl [backface-visibility:hidden]">
                      <div className="relative h-full overflow-hidden rounded-2xl shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
                        <Image
                          src={audience.image}
                          alt={audience.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>

                        {/* Badge */}
                        <div className="absolute top-4 right-4">
                          <span className={`inline-block bg-gradient-to-r ${colors.badge} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg`}>
                            {audience.badge}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-xl font-bold text-white mb-2">{audience.title}</h3>
                          <p className="text-gray-200 text-sm leading-relaxed">{audience.description}</p>

                          {/* Hover hint - only visible on desktop */}
                          <div className={`hidden md:block mt-4 ${colors.hint} text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity`}>
                            Задръжте курсора за повече →
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Back of card */}
                    <div className="absolute inset-0 h-full w-full rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <div className={`h-full w-full rounded-2xl bg-gradient-to-br ${colors.back} p-6 shadow-2xl flex flex-col justify-center`}>
                        <h3 className="text-xl font-bold text-white mb-6 text-center">{audience.title}</h3>
                        <ul className="space-y-3">
                          {audience.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start gap-2 text-white">
                              <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${colors.check}`} />
                              <span className="text-sm leading-relaxed">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Mobile: Show features below card */}
                  <div className={`md:hidden mt-4 bg-gradient-to-br ${colors.mobile} rounded-xl p-4 border`}>
                    <ul className="space-y-2">
                      {audience.features.slice(0, 3).map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${colors.mobileCheck}`} />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-4 py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/5 to-cyan-400/5 dark:from-blue-600/5 dark:to-cyan-600/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-950/50 dark:to-cyan-950/50 text-blue-700 dark:text-blue-300 px-5 py-2.5 rounded-full text-sm font-semibold mb-6 border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
              <Star className="h-4 w-4" />
              Функционалности
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
              Всичко което ви трябва на <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">едно място</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium">
              Мощни инструменти за ефективно управление на клиенти, програми и хранителни планове
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="group relative p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center mb-5 text-white shadow-lg group-hover:scale-110 transition-transform">
                <Calendar className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Индивидуални тренировъчни и хранителни планове
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                Създавайте персонализирани програми за всеки клиент с календар за лесно проследяване
              </p>
            </div>

            {/* Card 2 */}
            <div className="group relative p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-5 text-white shadow-lg group-hover:scale-110 transition-transform">
                <Dumbbell className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Богата библиотека с упражнения и храни
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                Достъп до обширна база данни с упражнения, храни и готови рецепти
              </p>
            </div>

            {/* Card 3 */}
            <div className="group relative p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center mb-5 text-white shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Следене на макроси
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                Автоматично изчисляване и проследяване на макронутриенти за всеки план
              </p>
            </div>

            {/* Card 4 */}
            <div className="group relative p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-5 text-white shadow-lg group-hover:scale-110 transition-transform">
                <Plus className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Създаване на собствено съдържание
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                Добавяйте собствени тренировки, упражнения, храни и рецепти
              </p>
            </div>

            {/* Card 5 */}
            <div className="group relative p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center mb-5 text-white shadow-lg group-hover:scale-110 transition-transform">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Задаване и следене на цели
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                Определяйте цели за клиентите и проследявайте постигането им
              </p>
            </div>

            {/* Card 6 */}
            <div className="group relative p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-5 text-white shadow-lg group-hover:scale-110 transition-transform">
                <Check className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Детайлно проследяване на напредъка
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                Клиентите могат да записват тегло, измервания и постижения
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* From Chaos to Order Section */}
      <section className="relative px-4 py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/5 to-cyan-400/5 dark:from-blue-600/5 dark:to-cyan-600/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-950/50 dark:to-cyan-950/50 text-blue-700 dark:text-blue-300 px-5 py-2.5 rounded-full text-sm font-semibold mb-6 border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
              <TrendingUp className="h-4 w-4" />
              Трансформацията
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
              От хаос към <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">организация и контрол</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium">
              Вижте как платформата трансформира начина, по който работите с клиенти
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* LEFT: Problems */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                  ❌
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                  Познати проблеми?
                </h3>
              </div>

              <div className="group bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-6 rounded-2xl border-2 border-red-200 dark:border-red-800 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💬</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Комуникационен хаос
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      WhatsApp, Viber, SMS - всичко разпръснато. Губите важни съобщения и време в търсене.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-6 rounded-2xl border-2 border-red-200 dark:border-red-800 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📄</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Хаос с програми
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      Excel, Google Sheets, Notion, хвърчащи листчета. Прекарвате часове в организация и актуализация.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-6 rounded-2xl border-2 border-red-200 dark:border-red-800 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📊</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Липса на проследяване
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      Не знаете кой какво е тренирал и ял. Трудно е да видите напредък и да реагирате навреме.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-6 rounded-2xl border-2 border-red-200 dark:border-red-800 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">⏰</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Губене на време
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      5-10 часа седмично за организация, ръчно създаване на планове и комуникация с клиенти.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-6 rounded-2xl border-2 border-red-200 dark:border-red-800 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">👎</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Непрофесионално впечатление
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      PDF файлове и WhatsApp съобщения вместо модерна професионална дигитална платформа.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Solutions */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                  ✅
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                  С нашата платформа
                </h3>
              </div>

              <div className="group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 rounded-2xl border-2 border-green-200 dark:border-green-800 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Централизирана комуникация
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      Вграден real-time чат на едно място. Цялата комуникация с клиенти организирана и достъпна.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 rounded-2xl border-2 border-green-200 dark:border-green-800 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Всичко на едно място
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      Тренировки, хранене, прогрес, календар, комуникация - единна платформа за всички аспекти.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 rounded-2xl border-2 border-green-200 dark:border-green-800 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Автоматично проследяване
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      Виждате какво прави всеки клиент в реално време. Пълна визуализация на напредък и цели.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 rounded-2xl border-2 border-green-200 dark:border-green-800 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Спестете 10+ часа седмично
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      Автоматизация и централизация освобождават време за това, което наистина е важно - вашите клиенти.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 rounded-2xl border-2 border-green-200 dark:border-green-800 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                    <Star className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Професионален имидж
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      Модерна платформа впечатлява клиентите. Удовлетворени клиенти = повече препоръки = повече печалба.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <div className="inline-flex flex-col items-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-8 rounded-3xl border border-blue-200 dark:border-blue-800 shadow-xl">
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mb-4">
                10+ часа
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-2">
                средно спестени седмично
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md">
                Повече време за клиенти = повече клиенти = повече приходи
              </p>
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
      <section className="relative px-4 py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 dark:from-blue-600/10 dark:to-cyan-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 dark:from-cyan-600/10 dark:to-blue-600/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-950/50 dark:to-cyan-950/50 text-blue-700 dark:text-blue-300 px-5 py-2.5 rounded-full text-sm font-semibold mb-6 border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
              <Star className="h-4 w-4" />
              Отзиви от професионалисти
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
              Доверени от <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">фитнес експерти</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium">
              Вижте как различни видове треньори и инструктори използват нашата платформа
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden group">
                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-full blur-2xl group-hover:from-blue-400/20 group-hover:to-cyan-400/20 dark:group-hover:from-blue-600/30 dark:group-hover:to-cyan-600/30 transition-all"></div>

                <div className="relative text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-blue-600 dark:fill-blue-400 text-blue-600 dark:text-blue-400" />
                    ))}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed text-base">
                    &quot;{testimonial.content}&quot;
                  </p>

                  <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-4 border-blue-100 dark:border-blue-900 shadow-lg">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h4 className="text-gray-900 dark:text-white font-bold text-lg mb-1">{testimonial.name}</h4>
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold">{testimonial.role}</p>
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
      <section className="relative px-4 py-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Gym Background"
            fill
            className="object-cover"
            priority={false}
          />
          {/* Dark overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-800/90 to-cyan-900/95"></div>
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-semibold mb-8 border border-white/30 shadow-lg">
            <Dumbbell className="h-4 w-4" />
            Започнете днес
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Започнете да управлявате клиентите си професионално
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed font-medium max-w-3xl mx-auto">
            Присъединете се към стотици треньори, които вече използват нашата платформа за управление на клиентите си
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-10 py-6 text-lg font-bold h-auto bg-white text-blue-600 hover:bg-blue-50 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105" asChild>
              <Link href="/sign-up">
                ЗАПОЧНЕТЕ БЕЗПЛАТНО - ДО 3 КЛИЕНТА
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-10 py-6 text-lg font-bold h-auto border-2 border-white text-white hover:bg-white hover:text-blue-600 rounded-xl shadow-xl backdrop-blur-sm bg-white/10 transition-all duration-300 hover:scale-105" asChild>
              <Link href="/sign-in">Вход за треньори</Link>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="mt-16 pt-10 border-t border-white/20">
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-white mb-2">872+</div>
                <div className="text-sm text-blue-200 font-semibold">Активни клиенти</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-white mb-2">120+</div>
                <div className="text-sm text-blue-200 font-semibold">Професионални треньори</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-white mb-2">4.9★</div>
                <div className="text-sm text-blue-200 font-semibold">Средна оценка</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
