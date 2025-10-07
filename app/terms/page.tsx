import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Общи условия | Fitness Training App",
  description: "Общи условия за използване на Fitness Training App",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Общи условия за използване
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
              Добре дошли в Fitness Training App. Използвайки нашата платформа, вие се съгласявате с тези общи условия.
              Моля, прочетете внимателно преди да използвате услугата.
            </p>
            <p className="text-foreground/90 leading-relaxed">
              Fitness Training App е SaaS платформа, предназначена за персонални треньори за управление на клиенти,
              тренировъчни програми и хранителни планове.
            </p>
          </section>

          {/* Account Registration */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              2. Регистрация на акаунт
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              За да използвате нашата платформа, трябва да създадете акаунт. При регистрация се задължавате:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
              <li>Да предоставите точна и актуална информация</li>
              <li>Да поддържате сигурността на вашата парола</li>
              <li>Да сте на възраст минимум 18 години</li>
              <li>Да не споделяте акаунта си с трети лица</li>
              <li>Да нотифицирате незабавно за всяко неоторизирано използване</li>
            </ul>
          </section>

          {/* User Roles */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              3. Роли на потребителите
            </h2>
            <div className="space-y-3">
              <div className="border-l-4 border-primary pl-4 py-2">
                <h3 className="font-semibold text-foreground mb-1">Треньори</h3>
                <p className="text-foreground/90">
                  Треньорите могат да създават тренировъчни програми, хранителни планове, да добавят клиенти
                  и да управляват упражнения и храни.
                </p>
              </div>
              <div className="border-l-4 border-secondary pl-4 py-2">
                <h3 className="font-semibold text-foreground mb-1">Клиенти</h3>
                <p className="text-foreground/90">
                  Клиентите имат достъп до програмите, създадени специално за тях от техния треньор.
                </p>
              </div>
            </div>
          </section>

          {/* Subscription Plans */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              4. Subscription планове
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Предлагаме три нива на subscription:
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="border rounded-lg p-4 bg-card">
                <h3 className="font-semibold text-foreground mb-2">Free</h3>
                <p className="text-sm text-muted-foreground">
                  Базов достъп с ограничени функционалности
                </p>
              </div>
              <div className="border rounded-lg p-4 bg-card">
                <h3 className="font-semibold text-foreground mb-2">Pro</h3>
                <p className="text-sm text-muted-foreground">
                  Разширени възможности за професионални треньори
                </p>
              </div>
              <div className="border rounded-lg p-4 bg-card">
                <h3 className="font-semibold text-foreground mb-2">Beast</h3>
                <p className="text-sm text-muted-foreground">
                  Пълен достъп до всички функционалности
                </p>
              </div>
            </div>
            <p className="text-foreground/90 leading-relaxed mt-4">
              Плащанията се обработват чрез Stripe. Можете да отмените subscription по всяко време.
            </p>
          </section>

          {/* Acceptable Use */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              5. Приемливо използване
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              При използване на платформата се задължавате да НЕ:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
              <li>Нарушавате закони или правила</li>
              <li>Публикувате неприлично или незаконно съдържание</li>
              <li>Използвате платформата за спам или злонамерени цели</li>
              <li>Опитвате да хакнете или компрометирате системата</li>
              <li>Копирате или разпространявате съдържание без разрешение</li>
              <li>Представяте се за друго лице или организация</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              6. Интелектуална собственост
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Всички материали на платформата, включително дизайн, логота, текст и софтуер, са собственост на
              Fitness Training App или нейните лицензодатели. Запазваме всички права.
            </p>
            <p className="text-foreground/90 leading-relaxed">
              Съдържанието, което създавате (програми, планове, рецепти), остава ваша собственост, но ни предоставяте
              лиценз да го хостваме и показваме на вашите клиенти.
            </p>
          </section>

          {/* Liability */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              7. Ограничение на отговорността
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Fitness Training App се предоставя "както е". Не гарантираме непрекъснато или безгрешно функциониране.
              Не носим отговорност за:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
              <li>Загуба на данни или съдържание</li>
              <li>Непряка, случайна или последваща вреда</li>
              <li>Медицински съвети или наранявания от тренировки</li>
              <li>Действия на трети лица</li>
            </ul>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-4">
              <p className="text-sm text-foreground/90">
                <strong>Важно:</strong> Винаги консултирайте с лекар преди да започнете нова тренировъчна или хранителна програма.
                Платформата предоставя инструменти за управление, но не медицински съвети.
              </p>
            </div>
          </section>

          {/* Termination */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              8. Прекратяване
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Запазваме правото да прекратим или суспендираме вашия акаунт при нарушение на тези условия.
              Можете да изтриете акаунта си по всяко време от настройките.
            </p>
            <p className="text-foreground/90 leading-relaxed">
              При прекратяване, вашите данни могат да бъдат изтрити съгласно нашата политика за поверителност.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              9. Промени в условията
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Запазваме правото да променяме тези условия по всяко време. Ще ви уведомим за съществени промени
              чрез имейл или известие в платформата. Продължаването на използването след промените означава приемане.
            </p>
          </section>

          {/* Governing Law */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              10. Приложимо право
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Тези условия се регулират от законите на Република България. Всички спорове ще се решават в
              българските съдилища.
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              11. Контакт
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              При въпроси относно тези общи условия, моля свържете се с нас:
            </p>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-foreground/90">
                Email: <a href="mailto:support@fitnessapp.com" className="text-primary hover:underline">
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
          </div>
        </div>
      </div>
    </div>
  );
}
