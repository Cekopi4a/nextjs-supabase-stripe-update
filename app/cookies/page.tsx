"use client";

import { useState, useEffect } from "react";
import { Cookie, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_PREFERENCES_KEY = "fitness-app-cookie-preferences";
const COOKIE_CONSENT_KEY = "fitness-app-cookie-consent";

export default function CookiePolicyPage() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Load saved preferences
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const savePreferences = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    toast.success("Настройките за бисквитки са запазени!");
  };

  const cookieTypes = [
    {
      id: "necessary",
      title: "Необходими бисквитки",
      description: "Задължителни за функционирането на сайта",
      disabled: true,
      examples: [
        { name: "supabase-auth-token", purpose: "Автентикация на потребителя", duration: "7 дни" },
        { name: "csrf-token", purpose: "Защита срещу CSRF атаки", duration: "Сесия" },
        { name: "session-id", purpose: "Управление на сесията", duration: "24 часа" },
      ],
    },
    {
      id: "functional",
      title: "Функционални бисквитки",
      description: "Запазват вашите предпочитания",
      disabled: false,
      examples: [
        { name: "theme", purpose: "Запомня dark/light режим", duration: "1 година" },
        { name: "language", purpose: "Запазва избрания език", duration: "1 година" },
        { name: "sidebar-collapsed", purpose: "Състояние на менюто", duration: "1 година" },
      ],
    },
    {
      id: "analytics",
      title: "Аналитични бисквитки",
      description: "Помагат за подобряване на платформата",
      disabled: false,
      examples: [
        { name: "_ga", purpose: "Google Analytics - идентификация", duration: "2 години" },
        { name: "_gid", purpose: "Google Analytics - статистика", duration: "24 часа" },
        { name: "plausible_event", purpose: "Plausible Analytics", duration: "Сесия" },
      ],
    },
    {
      id: "marketing",
      title: "Маркетингови бисквитки",
      description: "За персонализирани реклами",
      disabled: false,
      examples: [
        { name: "_fbp", purpose: "Facebook Pixel", duration: "3 месеца" },
        { name: "_gcl_au", purpose: "Google Ads", duration: "3 месеца" },
        { name: "retargeting", purpose: "Ретаргетинг кампании", duration: "30 дни" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Cookie className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">
                  Политика за бисквитки
                </h1>
                <p className="text-muted-foreground">
                  Последна актуализация: {new Date().toLocaleDateString("bg-BG")}
                </p>
              </div>
            </div>
          </div>

          {/* Introduction */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Какво са бисквитки?
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Бисквитките (cookies) са малки текстови файлове, които се съхраняват на вашето устройство, когато
              посещавате уебсайт. Те помагат на сайта да запомни информация за вашето посещение, като предпочитания,
              език и други настройки.
            </p>
            <p className="text-foreground/90 leading-relaxed">
              Използваме бисквитки за подобряване на вашето изживяване и функционалността на Fitness Training App.
            </p>
          </section>

          {/* Cookie Preferences Settings */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Управление на бисквитките</CardTitle>
              <CardDescription>
                Изберете какви видове бисквитки желаете да разрешите
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {cookieTypes.map((type) => (
                <div key={type.id} className="space-y-3 pb-4 border-b last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <Label className="text-base font-semibold">
                        {type.title}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {type.description}
                      </p>
                    </div>
                    <Switch
                      checked={preferences[type.id as keyof CookiePreferences]}
                      disabled={type.disabled}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, [type.id]: checked })
                      }
                      className="ml-4"
                    />
                  </div>
                </div>
              ))}

              <Button onClick={savePreferences} className="w-full">
                Запази настройките
              </Button>
            </CardContent>
          </Card>

          {/* Types of Cookies */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">
              Видове бисквитки, които използваме
            </h2>

            {cookieTypes.map((type) => (
              <Card key={type.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {type.title}
                    {type.id === "necessary" && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Задължителни
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {type.examples.map((example, index) => (
                      <div
                        key={index}
                        className="bg-muted/50 rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                            {example.name}
                          </code>
                          <span className="text-xs text-muted-foreground">
                            {example.duration}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/80">
                          {example.purpose}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* How to Control Cookies */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Как да контролирате бисквитките
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Можете да контролирате и управлявате бисквитките по следните начини:
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    В нашата платформа
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80">
                    Използвайте настройките по-горе на тази страница за управление на вашите предпочитания.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    През браузъра
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80">
                    Повечето браузъри позволяват блокиране или изтриване на бисквитки през настройките.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <p className="text-sm text-foreground/90">
                <strong>Внимание:</strong> Блокирането на всички бисквитки може да повлияе на функционалността
                на платформата. Някои функции може да не работят правилно.
              </p>
            </div>
          </section>

          {/* Browser Settings */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Настройки в браузъри
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Линкове към инструкции за управление на бисквитки в популярни браузъри:
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <p className="font-semibold text-foreground">Google Chrome</p>
                <p className="text-sm text-muted-foreground">
                  Как да управлявате бисквитки в Chrome
                </p>
              </a>

              <a
                href="https://support.mozilla.org/bg/kb/biskvitki-informaciya-koqto-saitovete-zapamqtvat"
                target="_blank"
                rel="noopener noreferrer"
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <p className="font-semibold text-foreground">Mozilla Firefox</p>
                <p className="text-sm text-muted-foreground">
                  Управление на бисквитки във Firefox
                </p>
              </a>

              <a
                href="https://support.apple.com/bg-bg/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <p className="font-semibold text-foreground">Safari</p>
                <p className="text-sm text-muted-foreground">
                  Управление на бисквитки в Safari
                </p>
              </a>

              <a
                href="https://support.microsoft.com/bg-bg/microsoft-edge"
                target="_blank"
                rel="noopener noreferrer"
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <p className="font-semibold text-foreground">Microsoft Edge</p>
                <p className="text-sm text-muted-foreground">
                  Управление на бисквитки в Edge
                </p>
              </a>
            </div>
          </section>

          {/* Third Party Cookies */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Бисквитки от трети страни
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Някои бисквитки се поставят от външни услуги, които се появяват на нашите страници:
            </p>

            <div className="space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Google Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80 mb-2">
                    Анализ на използването на сайта с анонимни данни.
                  </p>
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Политика за поверителност на Google →
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Stripe</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80 mb-2">
                    Обработка на плащания и превенция на измами.
                  </p>
                  <a
                    href="https://stripe.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Политика за поверителност на Stripe →
                  </a>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Updates */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Актуализации на политиката
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Можем да актуализираме тази политика периодично, за да отразим промени в използваните бисквитки
              или в законодателството. Последната дата на актуализация е посочена в началото на документа.
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Въпроси и контакт
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              При въпроси относно нашата политика за бисквитки, моля свържете се с нас:
            </p>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-foreground/90">
                Email: <a href="mailto:privacy@fitnessapp.com" className="text-primary hover:underline">
                  privacy@fitnessapp.com
                </a>
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="pt-8 border-t">
            <p className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} Fitness Training App. Всички права запазени.
            </p>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Тази политика е в съответствие с GDPR и ePrivacy Directive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
