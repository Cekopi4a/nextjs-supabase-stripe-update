import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Target, Users, Award, Heart, Dumbbell, Star, CheckCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="flex-1">
      {/* Header Section */}
      <section className="px-4 py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Heart className="h-4 w-4" />
            За FitLife Studio
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Нашата 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
              {" "}мисия
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Ние създаваме най-добрата платформа за персонални треньори и fitness специалисти, 
            за да помогнем на хиляди хора да постигнат своите здравословни цели.
          </p>
        </div>
      </section>

      {/* Main Story Section */}
      <section className="px-4 py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            {/* Left Content */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Нашата история</h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                FitLife Studio започна като мечта на група fitness ентусиасти и технологични експерти, 
                които искаха да революционизират начина, по който персоналните треньори работят със своите клиенти.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                В днешния дигитален свят, ние вярваме че всеки заслужава достъп до качествено fitness 
                консултиране и персонализирани тренировъчни програми. Нашата платформа обединява най-добрите 
                практики от fitness индустрията с модерните технологии.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Днес повече от 1000 треньора използват нашата платформа за управление на своите клиенти, 
                програми и бизнес процеси.
              </p>
            </div>
            
            {/* Right Image */}
            <div className="relative">
              <div className="w-full h-[400px] rounded-3xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Професионален треньор с клиент"
                  width={800}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute top-8 -left-8 w-20 h-20 bg-blue-500/20 rounded-full blur-xl" />
              <div className="absolute bottom-8 -right-8 w-32 h-32 bg-purple-500/20 rounded-full blur-xl" />
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Активни треньори</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">5000+</div>
              <div className="text-gray-600">Доволни клиенти</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50000+</div>
              <div className="text-gray-600">Тренировки</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">4.9</div>
              <div className="text-gray-600 flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-blue-400 text-blue-400" />
                Рейтинг
              </div>
            </div>
          </div>
          
          {/* Values Section */}
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Нашите ценности</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ценностите ни определят начина, по който работим и взаимодействаме с нашата общност
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-8 border border-gray-200 hover:shadow-lg transition-shadow text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Професионализъм</h4>
              <p className="text-gray-600 leading-relaxed">
                Предоставяме най-добрите инструменти и подкрепа за професионални треньори
              </p>
            </Card>
            
            <Card className="p-8 border border-gray-200 hover:shadow-lg transition-shadow text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Общност</h4>
              <p className="text-gray-600 leading-relaxed">
                Изграждаме силна и подкрепяща общност от треньори и клиенти
              </p>
            </Card>
            
            <Card className="p-8 border border-gray-200 hover:shadow-lg transition-shadow text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Качество</h4>
              <p className="text-gray-600 leading-relaxed">
                Никога не правим компромиси с качеството на нашите услуги и продукти
              </p>
            </Card>
            
            <Card className="p-8 border border-gray-200 hover:shadow-lg transition-shadow text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Грижа</h4>
              <p className="text-gray-600 leading-relaxed">
                Грижим се за всеки потребител и неговото личностно и професионално развитие
              </p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Mission Section */}
      <section className="px-4 py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Dumbbell className="h-4 w-4" />
            Нашата мисия
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Правим fitness достъпно за всеки
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed mb-12">
            Нашата мисия е да създадем най-интуитивната и ефективна платформа за персонални треньори, 
            която им позволява да се фокусират върху това, което правят най-добре - да помагат на хората 
            да постигат своите fitness цели.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Лесно за използване</h3>
              <p className="text-gray-600 text-center">
                Интуитивен интерфейс, който всеки може да научи за минути
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Растеж на бизнеса</h3>
              <p className="text-gray-600 text-center">
                Инструменти, които помагат на треньорите да развият своя бизнес
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Подкрепа 24/7</h3>
              <p className="text-gray-600 text-center">
                Винаги сме тук, когато имате нужда от помощ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="px-4 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Нашият екип</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Срещнете се с хората зад FitLife Studio - страстни професионалисти от света на фитнеса и технологиите
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 text-center border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                  alt="Иван Петров"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Иван Петров</h3>
              <p className="text-blue-600 mb-4">Основател и CEO</p>
              <p className="text-gray-600 text-sm">
                Сертифициран персонален треньор с над 10 години опит и страст към технологиите
              </p>
            </Card>
            
            <Card className="p-8 text-center border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1494790108755-2616c6e1e6d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                  alt="Мария Георгиева"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Мария Георгиева</h3>
              <p className="text-blue-600 mb-4">Главен фитнес консултант</p>
              <p className="text-gray-600 text-sm">
                Магистър по кинезиология и експерт по хранене с международни сертификати
              </p>
            </Card>
            
            <Card className="p-8 text-center border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                  alt="Георги Стоянов"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Георги Стоянов</h3>
              <p className="text-blue-600 mb-4">Главен разработчик</p>
              <p className="text-gray-600 text-sm">
                Софтуерен инженер с опит в създаването на мобилни и уеб приложения
              </p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="px-4 py-24 bg-gradient-to-r from-blue-500 to-purple-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Готови да се присъедините към нас?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Започнете своето пътешествие с FitLife Studio днес и открийте защо хиляди треньори ни избират
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-10 py-4 text-lg h-auto bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/sign-up">
                Започнете безплатно
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-10 py-4 text-lg h-auto border-white text-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/contact">Свържете се с нас</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}