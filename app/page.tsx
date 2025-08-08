import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dumbbell, Users, Target, BarChart3, Star, ArrowRight, Check } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Професионални треньори",
      description: "Работете с сертифицирани треньори, които ще ви помогнат да достигнете целите си"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Персонализирани програми",
      description: "Получете тренировъчни програми, адаптирани специално за вашите нужди и цели"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Проследяване на прогреса",
      description: "Визуализирайте напредъка си с детайлни графики и статистики"
    }
  ];

  const benefits = [
    "Безплатен достъп до основните функции",
    "Мобилно приложение за Android и iOS", 
    "24/7 поддръжка от нашия екип",
    "Интеграция с фитнес устройства"
  ];

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="px-4 pt-16 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Dumbbell className="h-8 w-8 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Вашето fitness пътуване 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}започва тук
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Свържете се с професионални треньори, получете персонализирани тренировъчни програми 
              и проследявайте прогреса си на едно място.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" className="px-8 py-3 text-lg h-auto" asChild>
                <Link href="/sign-up">
                  Започнете безплатно
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg h-auto" asChild>
                <Link href="/sign-in">Вече имам акаунт</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">1000+</div>
                <div className="text-sm text-gray-600">Активни потребители</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-600">Професионални треньори</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">4.9</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  Рейтинг
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Всичко необходимо за успех
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Нашата платформа предоставя всички инструменти, от които се нуждаете за постигане на целите си
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Защо да изберете нас?
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Над 1000 души вече използват нашата платформа за постигане на своите fitness цели. 
                Присъединете се към нашата общност днес!
              </p>
              
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Button size="lg" className="px-8 py-3 text-lg h-auto" asChild>
                <Link href="/sign-up">
                  Започнете безплатно
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="text-center">
                  <Dumbbell className="h-16 w-16 mx-auto mb-6 opacity-90" />
                  <h3 className="text-2xl font-bold mb-4">
                    Започнете днес
                  </h3>
                  <p className="text-blue-100 mb-6 leading-relaxed">
                    Регистрирайте се безплатно и получете достъп до всички основни функции веднага
                  </p>
                  <Button 
                    variant="secondary" 
                    className="bg-white text-blue-600 hover:bg-gray-50" 
                    asChild
                  >
                    <Link href="/sign-up">Създайте акаунт</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-24 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Готови ли сте да започнете?
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Присъединете се към хиляди хора, които вече постигат своите цели с нашата помощ
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 py-3 text-lg h-auto" asChild>
              <Link href="/sign-up">
                Започнете безплатно
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg h-auto" asChild>
              <Link href="/sign-in">Влезте в акаунта си</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
