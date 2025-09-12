"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
      <section className="px-4 py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <MessageSquare className="h-4 w-4" />
            Свържете се с нас
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Как можем да
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
              {" "}помогнем?
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Нашият екип е на разположение да отговори на всички ваши въпроси 
            и да ви помогне да започнете с FitLife Studio.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Пратете ни съобщение</h2>
              
              {isSubmitted ? (
                <Card className="p-8 bg-green-50 border-green-200">
                  <div className="text-center">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-800 mb-2">Благодарим ви!</h3>
                    <p className="text-green-700">
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
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3"
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
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Как да ни намерите</h2>
              
              <div className="space-y-6">
                <Card className="p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
                      <p className="text-gray-600 mb-2">Свържете се с нас по всяко време</p>
                      <a href="mailto:support@fitlifestudio.bg" className="text-blue-600 hover:text-blue-700 font-medium">
                        support@fitlifestudio.bg
                      </a>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Телефон</h3>
                      <p className="text-gray-600 mb-2">Обадете ни се в работно време</p>
                      <a href="tel:+359888123456" className="text-blue-600 hover:text-blue-700 font-medium">
                        +359 888 123 456
                      </a>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Офис</h3>
                      <p className="text-gray-600 mb-2">Посетете ни в София</p>
                      <p className="text-gray-800">
                        бул. Витоша 123<br />
                        1000 София, България
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Работно време</h3>
                      <div className="space-y-1 text-gray-600">
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
      <section className="px-4 py-24 bg-gradient-to-r from-blue-500 to-purple-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Нуждаете се от помощ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Нашият екип е готов да ви помогне с всякакви въпроси или проблеми
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 py-3 bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/sign-up">
                Започнете безплатно
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/pricing">Вижте цените</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}