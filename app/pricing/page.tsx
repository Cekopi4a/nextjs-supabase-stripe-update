"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Target, Star, Users, Zap } from "lucide-react";
import Link from "next/link";
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
      <section className="px-4 py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Target className="h-4 w-4" />
            Ценови планове
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Изберете своя 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
              {" "}перфектен план
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Започнете безплатно или изберете план, който най-добре отговаря на нуждите ви. Всички планове включват пълна поддръжка и редовни актуализации.
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

          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              14 дни безплатен тест
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Без договор
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Отменяне по всяко време
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative p-8 transition-all hover:shadow-xl ${
                  plan.popular 
                    ? 'border-2 border-blue-500 shadow-xl scale-105' 
                    : 'border border-gray-200 hover:border-gray-300'
                } bg-white`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Най-популярен
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  {/* Plan Icon */}
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    {plan.name === 'Free' && <Users className="h-8 w-8 text-gray-600" />}
                    {plan.name === 'Pro' && <Star className="h-8 w-8 text-blue-600" />}
                    {plan.name === 'Beast' && <Zap className="h-8 w-8 text-purple-600" />}
                  </div>
                  
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
                </div>
                
                <Button 
                  className={`w-full mb-8 py-3 text-white ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  asChild
                >
                  <Link href="/sign-up">
                    {plan.name === 'Free' ? 'Започнете безплатно' : 'Изберете плана'}
                  </Link>
                </Button>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                    Включено в плана:
                  </h4>
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Често задавани въпроси
            </h2>
            <p className="text-xl text-gray-600">
              Отговори на най-често срещаните въпроси относно плановете ни
            </p>
          </div>
          
          <div className="grid gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-8 bg-white border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-24 bg-gradient-to-r from-blue-500 to-purple-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Готови да започнете?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Присъединете се към хиляди професионални треньори, които вече използват нашата платформа
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-10 py-4 text-lg h-auto bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/sign-up">
                Започнете безплатно
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-10 py-4 text-lg h-auto border-white text-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/sign-in">Влезте в акаунта си</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}