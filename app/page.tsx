"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dumbbell, Star, ArrowRight, Check, Target } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

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
      <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Content */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
                <Dumbbell className="h-4 w-4" />
                #1 Платформа за управление на фитнес клиенти
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                УПРАВЛЯВАЙТЕ КЛИЕНТИТЕ СИ С
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  {" "}FITLIFE STUDIO
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-lg">
                Уеб платформа за персонални треньори. Създавайте индивидуални програми, хранителни планове и проследявайте напредъка на всеки клиент.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button size="lg" className="px-10 py-4 text-lg h-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0" asChild>
                  <Link href="/sign-up">
                    ЗАПОЧНЕТЕ БЕЗПЛАТНО - ДО 3 КЛИЕНТА
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="px-10 py-4 text-lg h-auto border-gray-600 text-gray-300 hover:bg-gray-800" asChild>
                  <Link href="/sign-in">Вход за треньори</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-md text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-400">500+</div>
                  <div className="text-sm text-gray-400">Управлявани клиенти</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-400">100+</div>
                  <div className="text-sm text-gray-400">Активни треньори</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-400">4.8</div>
                  <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-blue-400 text-blue-400" />
                    Рейтинг
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Image */}
            <div className="relative">
              <div className="relative z-10">
                <div className="w-full h-[600px] rounded-3xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Професионална fitness зала с модерно оборудване"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover"
                    priority
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-8 left-8 text-white">
                    <h3 className="text-2xl font-bold mb-2">Управление на клиенти</h3>
                    <p className="text-gray-200">Всички клиенти на едно място с индивидуален подход</p>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-10 -right-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl" />
              <div className="absolute bottom-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl" />
            </div>
          </div>
        </div>
        
        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 320" className="w-full h-20">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Why Choose FitLife Studio */}
      <section className="px-4 py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Dumbbell className="h-4 w-4" />
                Как работи платформата
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                Всичко необходимо за успешно управление на клиентите
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Над 100 персонални треньора вече използват нашата платформа за управление на техните клиенти. Присъединете се към тях!
              </p>
              
              <Button size="lg" className="px-8 py-4 text-lg h-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600" asChild>
                <Link href="/sign-up">
                  Започнете днес
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            {/* Right Features Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="relative bg-gray-50 p-6 rounded-2xl hover:shadow-lg transition-all hover:scale-105 overflow-hidden">
                <div className="absolute inset-0">
                  <Image
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Професионален треньор"
                    fill
                    className="object-cover opacity-20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 text-white">
                    <Dumbbell className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Управление на клиенти
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Добавяйте клиенти чрез специален код или линк
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-2xl hover:shadow-lg transition-all hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 text-white">
                  <Target className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Индивидуални програми
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Създавайте персонализирани тренировки за всеки клиент
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-2xl hover:shadow-lg transition-all hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 text-white">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Хранителни планове
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Създавайте персонализирани хранителни режими
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-2xl hover:shadow-lg transition-all hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 text-white">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Проследяване на прогреса
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Клиентите въвеждат килограми, измервания и цели
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Fitness Services */}
      <section className="px-4 py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="h-4 w-4" />
              Ключови функционалности
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Всичко необходимо за управление на клиентите
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Платформата предоставя всички инструменти, които персоналните треньори се нуждаят за ефективно управление
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="relative p-8 hover:shadow-xl transition-all hover:scale-105 border-0 bg-white rounded-xl overflow-hidden">
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Персонално тренирането"
                  fill
                  className="object-cover opacity-10"
                />
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 text-white">
                  <Dumbbell className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Клиентски профили
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Всеки клиент се регистрира с специален код от треньора
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
                >
                  Научете повече
                </Button>
              </div>
            </div>
            
            <div className="relative p-8 hover:shadow-xl transition-all hover:scale-105 border-0 bg-white rounded-xl overflow-hidden">
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Групови занятия"
                  fill
                  className="object-cover opacity-10"
                />
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 text-white">
                  <Star className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Календар с тренировки
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Календар за всеки клиент с тренировки за всеки ден
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
                >
                  Научете повече
                </Button>
              </div>
            </div>
            
            <div className="p-8 hover:shadow-xl transition-all hover:scale-105 border-0 bg-white rounded-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 text-white">
                <Target className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Планер за хранене
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Интерактивен планер за създаване на хранителни режими
              </p>
              <Button 
                variant="outline" 
                className="w-full border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
              >
                Научете повече
              </Button>
            </div>
            
            <div className="p-8 hover:shadow-xl transition-all hover:scale-105 border-0 bg-white rounded-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 text-white">
                <Check className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Проследяване на напредък
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Клиентите виждат своя напредък спрямо поставените цели
              </p>
              <Button 
                variant="outline" 
                className="w-full border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
              >
                Научете повече
              </Button>
            </div>
            
            <div className="p-8 hover:shadow-xl transition-all hover:scale-105 border-0 bg-white rounded-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 text-white">
                <Dumbbell className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Управление на абонамент
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Free, Pro и Beast планове с различен брой клиенти
              </p>
              <Button 
                variant="outline" 
                className="w-full border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
              >
                Научете повече
              </Button>
            </div>
            
            <div className="p-8 hover:shadow-xl transition-all hover:scale-105 border-0 bg-white rounded-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 text-white">
                <Star className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Известия за клиенти
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Клиентите получават известия при нови програми
              </p>
              <Button 
                variant="outline" 
                className="w-full border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
              >
                Научете повече
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Target className="h-4 w-4" />
              Choose the Perfect Plan for Your Fitness Journey
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Достъпни планове за всеки
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Изберете най-подходящия план за вашите нужди и започнете трансформацията си още днес
            </p>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                <Button
                  variant={billingInterval === "monthly" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBillingInterval("monthly")}
                  className="px-6"
                >
                  Месечно
                </Button>
                <Button
                  variant={billingInterval === "yearly" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBillingInterval("yearly")}
                  className="px-6"
                >
                  Годишно
                  <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    -17%
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative p-8 ${plan.popular ? 'border-2 border-blue-500 shadow-xl scale-105' : 'border border-gray-200'} bg-white hover:shadow-lg transition-all`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Най-популярен
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-5xl font-bold text-gray-900">
                        {billingInterval === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                      </span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                    {billingInterval === "yearly" && plan.originalYearlyPrice && (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg text-gray-400 line-through">
                          {plan.originalYearlyPrice} лв/годишно
                        </span>
                        <span className="bg-green-100 text-green-600 text-sm px-2 py-1 rounded-full">
                          Спестете {parseInt(plan.originalYearlyPrice) - parseInt(plan.yearlyPrice)} лв
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className={`w-full mb-8 py-3 ${plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' : 'bg-gray-900 hover:bg-gray-800'} text-white`}
                    asChild
                  >
                    <Link href="/sign-up">
                      {plan.name === 'Free' ? 'Започнете безплатно' : 'Изберете плана'}
                    </Link>
                  </Button>
                  
                  <div className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
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
    </div>
  );
}
