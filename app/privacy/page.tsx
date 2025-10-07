import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика за поверителност | Fitness Training App",
  description: "Политика за поверителност и защита на данните на Fitness Training App",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Политика за поверителност
            </h1>
            <p className="text-muted-foreground">
              Последна актуализация: {new Date().toLocaleDateString("bg-BG")}
            </p>
          </div>

          {/* Introduction */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              1. Въведение
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Във Fitness Training App поверителността ви е важна за нас. Тази политика обяснява как събираме,
              използваме и защитаваме вашите лични данни.
            </p>
            <p className="text-foreground/90 leading-relaxed">
              Използвайки нашата платформа, вие се съгласявате с практиките, описани в тази политика.
            </p>
          </section>

          {/* Data Collection */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              2. Събирани данни
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Събираме следните видове информация:
            </p>

            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4 py-2">
                <h3 className="font-semibold text-foreground mb-2">Лична информация</h3>
                <ul className="list-disc list-inside space-y-1 text-foreground/90 ml-4">
                  <li>Име и имейл адрес</li>
                  <li>Профилна снимка (опционално)</li>
                  <li>Платежна информация (обработена чрез Stripe)</li>
                </ul>
              </div>

              <div className="border-l-4 border-secondary pl-4 py-2">
                <h3 className="font-semibold text-foreground mb-2">Фитнес данни</h3>
                <ul className="list-disc list-inside space-y-1 text-foreground/90 ml-4">
                  <li>Тренировъчни програми и упражнения</li>
                  <li>Хранителни планове и макроси</li>
                  <li>Цели и прогрес</li>
                  <li>Календар с тренировки</li>
                </ul>
              </div>

              <div className="border-l-4 border-accent pl-4 py-2">
                <h3 className="font-semibold text-foreground mb-2">Техническа информация</h3>
                <ul className="list-disc list-inside space-y-1 text-foreground/90 ml-4">
                  <li>IP адрес</li>
                  <li>Тип браузър и устройство</li>
                  <li>Cookies и данни за използване</li>
                  <li>Данни за грешки и performance</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Data */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              3. Как използваме данните
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Вашите данни се използват за:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
              <li>Предоставяне и подобряване на услугата</li>
              <li>Създаване и управление на вашия акаунт</li>
              <li>Обработка на плащания чрез Stripe</li>
              <li>Комуникация с вас (нотификации, поддръжка)</li>
              <li>Анализ и подобрение на платформата</li>
              <li>Спазване на законови изисквания</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              4. Споделяне на данни
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Вашите лични данни НЕ се продават на трети лица. Споделяме данни само с:
            </p>

            <div className="space-y-3">
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">🔐 Доставчици на услуги</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90 ml-4">
                  <li><strong>Supabase</strong> - хостинг на база данни</li>
                  <li><strong>Stripe</strong> - обработка на плащания</li>
                  <li><strong>Resend</strong> - имейл услуги</li>
                  <li><strong>Update.dev</strong> - автентикация и billing</li>
                </ul>
              </div>

              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">👥 Вашият треньор/клиенти</h3>
                <p className="text-sm text-foreground/90">
                  Ако сте клиент, вашият треньор има достъп до данните, които създава за вас (програми, планове).
                  Ако сте треньор, вашите клиенти виждат програмите, които създавате за тях.
                </p>
              </div>

              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">⚖️ Законови изисквания</h3>
                <p className="text-sm text-foreground/90">
                  При правни изисквания или за защита на правата ни, можем да споделим данни със съответните власти.
                </p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              5. Сигурност на данните
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Използваме индустриални стандарти за защита на вашите данни:
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm font-semibold text-foreground mb-1">🔒 Криптиране</p>
                <p className="text-sm text-foreground/80">
                  SSL/TLS криптиране на данните при предаване
                </p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm font-semibold text-foreground mb-1">🛡️ Защита на паролите</p>
                <p className="text-sm text-foreground/80">
                  Хеширане на пароли с модерни алгоритми
                </p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm font-semibold text-foreground mb-1">🔐 Контрол на достъпа</p>
                <p className="text-sm text-foreground/80">
                  Row Level Security (RLS) в базата данни
                </p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm font-semibold text-foreground mb-1">📊 Мониторинг</p>
                <p className="text-sm text-foreground/80">
                  Постоянно наблюдение за сигурност
                </p>
              </div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-4">
              <p className="text-sm text-foreground/90">
                <strong>Важно:</strong> Никоя система не е 100% сигурна. Препоръчваме силни пароли и двуфакторна автентикация.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              6. Cookies и проследяване
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Използваме cookies за:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
              <li>Запазване на сесията ви (автентикация)</li>
              <li>Запомняне на предпочитанията ви (тема, език)</li>
              <li>Анализ на използването (анонимни данни)</li>
            </ul>
            <p className="text-foreground/90 leading-relaxed mt-3">
              Можете да контролирате cookies чрез настройките на браузъра си.
            </p>
          </section>

          {/* Your Rights */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              7. Вашите права (GDPR)
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Съгласно GDPR (General Data Protection Regulation), имате право на:
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="border rounded-lg p-4">
                <p className="font-semibold text-foreground mb-1">📋 Достъп</p>
                <p className="text-sm text-foreground/80">
                  Да поискате копие на вашите данни
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="font-semibold text-foreground mb-1">✏️ Коригиране</p>
                <p className="text-sm text-foreground/80">
                  Да поправите неточна информация
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="font-semibold text-foreground mb-1">🗑️ Изтриване</p>
                <p className="text-sm text-foreground/80">
                  Да изтриете вашите данни (right to be forgotten)
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="font-semibold text-foreground mb-1">📤 Преносимост</p>
                <p className="text-sm text-foreground/80">
                  Да експортирате вашите данни
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="font-semibold text-foreground mb-1">🚫 Възражение</p>
                <p className="text-sm text-foreground/80">
                  Да се противопоставите на обработка
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="font-semibold text-foreground mb-1">⏸️ Ограничаване</p>
                <p className="text-sm text-foreground/80">
                  Да ограничите обработката на данни
                </p>
              </div>
            </div>
            <p className="text-foreground/90 leading-relaxed mt-4">
              За да упражните тези права, свържете се с нас на{" "}
              <a href="mailto:privacy@fitnessapp.com" className="text-primary hover:underline">
                privacy@fitnessapp.com
              </a>
            </p>
          </section>

          {/* Data Retention */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              8. Съхранение на данни
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Съхраняваме вашите данни докато:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
              <li>Вашият акаунт е активен</li>
              <li>Е необходимо за предоставяне на услугата</li>
              <li>Изисква се от законодателството (напр. данни за плащания)</li>
            </ul>
            <p className="text-foreground/90 leading-relaxed mt-3">
              При изтриване на акаунт, данните се премахват в рамките на 30 дни, освен ако не са необходими
              за правни цели.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              9. Поверителност на деца
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Услугата ни не е предназначена за лица под 18 години. Ако научим, че сме събрали данни от
              ненавършило пълнолетие лице, ще ги изтрием незабавно.
            </p>
          </section>

          {/* International Transfers */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              10. Международни трансфери
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Вашите данни могат да се обработват в сървъри извън Европейския съюз. Гарантираме, че всички
              трансфери спазват GDPR изискванията и използват подходящи защитни мерки.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              11. Промени в политиката
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Можем да актуализираме тази политика периодично. Ще ви уведомим за съществени промени чрез
              имейл или известие в платформата. Препоръчваме да преглеждате политиката редовно.
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              12. Контакт за поверителност
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              При въпроси относно тази политика или вашите данни:
            </p>
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="text-foreground/90">
                <strong>Email за поверителност:</strong>{" "}
                <a href="mailto:privacy@fitnessapp.com" className="text-primary hover:underline">
                  privacy@fitnessapp.com
                </a>
              </p>
              <p className="text-foreground/90">
                <strong>Обща поддръжка:</strong>{" "}
                <a href="mailto:support@fitnessapp.com" className="text-primary hover:underline">
                  support@fitnessapp.com
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
              Тази политика е в съответствие с GDPR и българското законодателство за защита на личните данни.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
