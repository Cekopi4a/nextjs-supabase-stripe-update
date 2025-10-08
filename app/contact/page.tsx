"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Footer from "@/components/footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    setIsSubmitting(false);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 3000);
  };

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
            <MessageSquare className="h-4 w-4" />
            Свържете се с нас
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] text-gray-900 dark:text-white">
            КАК МОЖЕМ ДА
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600">
              ПОМОГНЕМ?
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto font-medium">
            Нашият екип е на разположение да отговори на всички ваши въпроси
            и да ви помогне да започнете с FitLife Studio.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative px-4 py-24 bg-gradient-to-br from-white via-blue-50/20 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 dark:from-blue-600/10 dark:to-cyan-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-0 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 dark:from-cyan-600/10 dark:to-blue-600/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-8">Пратете ни съобщение</h2>
              
              {isSubmitted ? (
                <Card className="p-10 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-300 dark:border-green-700 shadow-xl">
                  <div className="text-center">
                    <CheckCircle className="h-20 w-20 text-green-600 dark:text-green-400 mx-auto mb-6 animate-bounce" />
                    <h3 className="text-2xl font-black text-green-800 dark:text-green-300 mb-3">Благодарим ви!</h3>
                    <p className="text-lg text-green-700 dark:text-green-400 font-medium">
                      Вашето съобщение беше изпратено успешно. Очаквайте отговор в рамките на 24 часа.
                    </p>
                  </div>
                </Card>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                        Пълно име *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full"
                        placeholder="Въведете вашето име"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                        Email адрес *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full"
                        placeholder="Вашият email адрес"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject" className="text-sm font-medium text-gray-700 mb-2 block">
                      Относно *
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full"
                      placeholder="Какъв е поводът за контакт?"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message" className="text-sm font-medium text-gray-700 mb-2 block">
                      Съобщение *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full resize-none"
                      placeholder="Опишете подробно вашия въпрос или съобщение..."
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-6 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Изпращане...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Изпрати съобщение
                      </>
                    )}
                  </Button>
                  
                  <p className="text-sm text-gray-500 text-center">
                    * Означава задължителни полета
                  </p>
                </form>
              )}
            </div>
            
            {/* Contact Info */}
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-8">Как да ни намерите</h2>
              
              <div className="space-y-6">
                <Card className="group p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-800">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Email</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-2 font-medium">Свържете се с нас по всяко време</p>
                      <a href="mailto:support@fitlifestudio.bg" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold">
                        support@fitlifestudio.bg
                      </a>
                    </div>
                  </div>
                </Card>

                <Card className="group p-6 border border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-800">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">Телефон</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-2 font-medium">Обадете ни се в работно време</p>
                      <a href="tel:+359888123456" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold">
                        +359 888 123 456
                      </a>
                    </div>
                  </div>
                </Card>

                <Card className="group p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-800">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Офис</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-2 font-medium">Посетете ни в София</p>
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        бул. Витоша 123<br />
                        1000 София, България
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="group p-6 border border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-800">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">Работно време</h3>
                      <div className="space-y-1 text-gray-600 dark:text-gray-300 font-medium">
                        <p>Понеделник - Петък: 9:00 - 18:00</p>
                        <p>Събота: 10:00 - 16:00</p>
                        <p>Неделя: Почивен ден</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            
            {/* Quick Contact & FAQ */}
            <div>
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Бърз контакт</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Общ въпрос</p>
                      <p className="text-sm text-gray-600">Обикновен отговор в рамките на 2-4 часа</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
                    <Phone className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Спешни въпроси</p>
                      <p className="text-sm text-gray-600">Обадете ни се за моментален отговор</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                    <Mail className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Техническа поддръжка</p>
                      <p className="text-sm text-gray-600">Подробни отговори в рамките на 24ч</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Преди да ни пишете</h3>
              
              <div className="space-y-4">
                <Card className="p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Как да започна с платформата?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Просто се регистрирайте с email адрес - няма нужда от кредитна карта.
                  </p>
                </Card>
                
                <Card className="p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Имате ли техническа поддръжка?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Да, пълна поддръжка през целия работен ден.
                  </p>
                </Card>
                
                <Card className="p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Мога ли да импортирам данни от друга платформа?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Да, предлагаме услуги за миграция от популярни fitness платформи.
                  </p>
                </Card>
                
                <Card className="p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Имате ли мобилно приложение?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Да, iOS и Android приложения са включени в Pro и Beast плановете.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-24 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Нуждаете се от помощ?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed font-medium">
            Нашият екип е готов да ви помогне с всякакви въпроси или проблеми
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-10 py-6 text-lg font-bold h-auto bg-white text-blue-600 hover:bg-gray-100 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" asChild>
              <Link href="/sign-up">
                Започнете безплатно
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-10 py-6 text-lg font-bold h-auto border-2 border-white text-white hover:bg-white hover:text-blue-600 rounded-xl shadow-lg transition-all duration-300 hover:scale-105" asChild>
              <Link href="/pricing">Вижте цените</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}