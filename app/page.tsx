import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dumbbell, Star, ArrowRight, Check, Target } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {

  const testimonials = [
    {
      name: "Мария Петрова",
      role: "Фитнес ентусиаст",
      content: "FitLife Studio промени живота ми! За 6 месеца свалих 15 кг и се чувствам невероятно.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616c6e1e6d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Георги Иванов",
      role: "Бизнесмен",
      content: "Професионалните треньори и гъвкавите часове са идеални за моя график.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Анна Димитрова",
      role: "Студентка",
      content: "Групповите занятия са невероятни! Отлична атмосфера и мотивация.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "0",
      period: "лв/месечно",
      description: "Перфектно за започващи",
      features: [
        "Достъп до основни функции",
        "1 клиент",
        "Базови програми",
        "Email поддръжка"
      ],
      popular: false
    },
    {
      name: "Pro",
      price: "49",
      period: "лв/месечно",
      description: "За професионални треньори",
      features: [
        "Неограничени клиенти",
        "Персонализирани програми",
        "Хранителни планове",
        "Приоритетна поддръжка",
        "Аналитика и отчети"
      ],
      popular: true
    },
    {
      name: "Beast",
      price: "99",
      period: "лв/месечно",
      description: "За фитнес студия",
      features: [
        "Всички Pro функции",
        "Многоезична поддръжка",
        "API достъп",
        "Custom брандинг",
        "Dedicated поддръжка"
      ],
      popular: false
    }
  ];

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Content */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
                <Dumbbell className="h-4 w-4" />
                #1 Fitness Platform в България
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                TRANSFORM YOUR LIFE WITH
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  {" "}FITLIFE STUDIO
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-lg">
                Професионални треньори, персонализирани програми и модерно оборудване. Започнете трансформацията си днес!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button size="lg" className="px-10 py-4 text-lg h-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0" asChild>
                  <Link href="/sign-up">
                    ЗАПОЧНЕТЕ БЕЗПЛАТНО
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="px-10 py-4 text-lg h-auto border-gray-600 text-gray-300 hover:bg-gray-800" asChild>
                  <Link href="/sign-in">Вход</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-md text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-400">1000+</div>
                  <div className="text-sm text-gray-400">Активни клиенти</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-400">50+</div>
                  <div className="text-sm text-gray-400">Експерт треньори</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-400">4.9</div>
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
                    <h3 className="text-2xl font-bold mb-2">Професионално оборудване</h3>
                    <p className="text-gray-200">Най-новите фитнес уреди и технологии</p>
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
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Dumbbell className="h-4 w-4" />
                Защо да изберете FitLife Studio
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                Най-добрите резултати с професионален подход
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Над 1000 души вече постигнаха своите fitness цели с нашата помощ. Присъединете се към успешната ни общност!
              </p>
              
              <Button size="lg" className="px-8 py-4 text-lg h-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" asChild>
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
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 text-white">
                    <Dumbbell className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Сертифицирани треньори
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Работете с професионални треньори с международни сертификати
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-2xl hover:shadow-lg transition-all hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 text-white">
                  <Target className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Персонализиран подход
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Индивидуални програми, адаптирани точно за вашите цели
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-2xl hover:shadow-lg transition-all hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 text-white">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Гъвкави часове
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Тренирайте когато ви е удобно - 24/7 достъп до залата
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-2xl hover:shadow-lg transition-all hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 text-white">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Проследяване на прогреса
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Детайлна статистика и анализ на вашето развитие
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
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="h-4 w-4" />
              Premium Fitness Services
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Всичко необходимо за вашия успех
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Предлагаме пълна гама от професионални fitness услуги, адаптирани за всички нива и цели
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
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 text-white">
                  <Dumbbell className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Персонално тренирането
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Индивидуални тренировки с професионален треньор
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
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
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 text-white">
                  <Star className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Групови занятия
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Енергични групови тренировки за всички нива
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
                >
                  Научете повече
                </Button>
              </div>
            </div>
            
            <div className="p-8 hover:shadow-xl transition-all hover:scale-105 border-0 bg-white rounded-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 text-white">
                <Target className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Хранителни консултации
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Персонализирани хранителни планове и съвети
              </p>
              <Button 
                variant="outline" 
                className="w-full border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
              >
                Научете повече
              </Button>
            </div>
            
            <div className="p-8 hover:shadow-xl transition-all hover:scale-105 border-0 bg-white rounded-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 text-white">
                <Check className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Кардио зона
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Модерни кардио уреди за ефективно горене на калории
              </p>
              <Button 
                variant="outline" 
                className="w-full border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
              >
                Научете повече
              </Button>
            </div>
            
            <div className="p-8 hover:shadow-xl transition-all hover:scale-105 border-0 bg-white rounded-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 text-white">
                <Dumbbell className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Силова зона
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Професионални уреди за силови тренировки
              </p>
              <Button 
                variant="outline" 
                className="w-full border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
              >
                Научете повече
              </Button>
            </div>
            
            <div className="p-8 hover:shadow-xl transition-all hover:scale-105 border-0 bg-white rounded-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 text-white">
                <Star className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Възстановяване
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Сауна, масажи и рехабилитационни услуги
              </p>
              <Button 
                variant="outline" 
                className="w-full border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
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
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Изберете най-подходящия план за вашите нужди и започнете трансформацията си още днес
            </p>
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
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
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
              Real Videos, Real Transformations
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Какво казват нашите клиенти
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Историите на успех от нашата общност говорят сами за себе си
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
            Take the First Step Towards a Better You
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Присъединете се към хиляди хора, които вече постигат своите цели с FitLife Studio
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-10 py-4 text-lg h-auto bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/sign-up">
                ЗАПОЧНЕТЕ БЕЗПЛАТНО
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-10 py-4 text-lg h-auto border-white text-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/sign-in">Вход в акаунта</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
