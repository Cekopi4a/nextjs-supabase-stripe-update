"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Target, Star, Users, Zap, Dumbbell, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Footer from "@/components/footer";

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");

  const pricingPlans = [
    {
      name: "Free",
      monthlyPrice: "0",
      yearlyPrice: "0",
      period: billingInterval === "monthly" ? "лв/месечно" : "лв/годишно",
      description: "Перфектно за започващи треньори",
      features: [
        "Достъп до основни функции",
        "1 клиент максимум",
        "Базови тренировъчни програми",
        "Email поддръжка",
        "Основни отчети"
      ],
      popular: false,
      color: "gray"
    },
    {
      name: "Pro",
      monthlyPrice: "49",
      yearlyPrice: "490",
      period: billingInterval === "monthly" ? "лв/месечно" : "лв/годишно",
      originalYearlyPrice: "588",
      description: "За професионални треньори",
      features: [
        "Неограничени клиенти",
        "Персонализирани програми",
        "Хранителни планове",
        "Приоритетна поддръжка",
        "Детайлна аналитика",
        "Календар за тренировки",
        "Прогрес на клиентите",
        "Мобилно приложение"
      ],
      popular: true,
      color: "blue"
    },
    {
      name: "Beast",
      monthlyPrice: "99",
      yearlyPrice: "990",
      period: billingInterval === "monthly" ? "лв/месечно" : "лв/годишно",
      originalYearlyPrice: "1188",
      description: "За фитнес студия и големи екипи",
      features: [
        "Всички Pro функции",
        "Многоезична поддръжка",
        "API достъп за интеграции",
        "Custom брандинг",
        "Dedicated поддръжка",
        "Неограничени треньори",
        "Advanced аналитика",
        "Бял етикет решение"
      ],
      popular: false,
      color: "purple"
    }
  ];

  const faqs = [
    {
      question: "Мога ли да сменя плана по всяко време?",
      answer: "Да, можете да надградите или смените плана си по всяко време. Промените влизат в сила веднага и се таксуват пропорционално."
    },
    {
      question: "Има ли безплатен пробен период?",
      answer: "Free планът е напълно безплатен завинаги. Pro и Beast плановете имат 14-дневен безплатен пробен период."
    },
    {
      question: "Какви методи за плащане приемате?",
      answer: "Приемаме всички основни кредитни карти (Visa, MasterCard, American Express) и банкови преводи."
    },
    {
      question: "Мога ли да отменя абонамента си?",
      answer: "Да, можете да отмените абонамента си по всяко време от настройките на профила. Няма скрити такси или санкции."
    }
  ];

  return (
    <div className="flex-1">
      {/* Header Section */}
      <section className="relative px-4 py-32 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-black overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-cyan-400/30 to-blue-400/30 dark:from-cyan-600/20 dark:to-blue-600/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-950/50 dark:to-cyan-950/50 text-blue-700 dark:text-blue-300 px-5 py-2.5 rounded-full text-sm font-semibold mb-8 border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
            <Target className="h-4 w-4" />
            Ценови планове
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] text-gray-900 dark:text-white">
            ИЗБЕРЕТЕ ВАШИЯ
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600">
              ПЕРФЕКТЕН ПЛАН
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto font-medium">
            Започнете безплатно или изберете план, който най-добре отговаря на нуждите ви. Всички планове включват пълна поддръжка и редовни актуализации.
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-10">
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

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="font-medium">14 дни безплатен тест</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="font-medium">Без договор</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="font-medium">Отменяне по всяко време</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative px-4 py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 dark:from-blue-600/10 dark:to-cyan-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 dark:from-cyan-600/10 dark:to-blue-600/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
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

          <div className="grid gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
                ЗАПОЧНЕТЕ БЕЗПЛАТНО
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