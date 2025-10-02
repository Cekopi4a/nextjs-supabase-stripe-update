import { signUpAction } from "@/app/actions";
import AuthSubmitButton from "@/components/auth-submit-button";
import GoogleAuthButton from "@/components/google-auth-button";
import { FormMessage, Message } from "@/components/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Zap, Shield, BarChart3 } from "lucide-react";
import Link from "next/link";

export default async function SignUp(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  const features = [
    { icon: Zap, text: "Персонализирани тренировъчни програми" },
    { icon: BarChart3, text: "Детайлно проследяване на прогрес" },
    { icon: Shield, text: "Професионални хранителни планове" },
  ];

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left side - Visual */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3">
            <Dumbbell className="h-5 w-5" />
          </div>
          Fitness Training
        </div>
        <div className="relative z-20 mt-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-4">
              Започнете своето fitness пътуване днес
            </h2>
            <p className="text-lg opacity-90 leading-relaxed">
              Присъединете се към хиляди треньори, които вече използват най-модерната платформа
              за управление на клиенти и програми.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-base leading-relaxed">{feature.text}</span>
                </div>
              );
            })}
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <p className="text-sm leading-relaxed mb-3">
              &ldquo;Невероятна платформа! Сега мога да управлявам всичките си клиенти
              на едно място и да им давам най-добрите програми.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-semibold">
                ГП
              </div>
              <div>
                <div className="font-medium">Георги Петров</div>
                <div className="text-xs opacity-80">Сертифициран треньор</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="lg:hidden w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Създайте акаунт
            </h1>
            <p className="text-sm text-muted-foreground">
              Въведете имейла си за да започнете безплатно
            </p>
          </div>

          <div className="grid gap-6">
            <GoogleAuthButton mode="sign-up" />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Или продължете с
                </span>
              </div>
            </div>

            <form action={signUpAction}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">
                    Имейл
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Парола</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Минимум 8 символа"
                  />
                </div>
                <FormMessage message={searchParams} />
                <AuthSubmitButton />
              </div>
            </form>

            <p className="px-8 text-center text-xs text-muted-foreground">
              С регистрацията вие се съгласявате с нашите{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Условия за ползване
              </Link>{" "}
              и{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Политика за поверителност
              </Link>
              .
            </p>
          </div>

          <p className="px-8 text-center text-sm text-muted-foreground">
            Вече имате акаунт?{" "}
            <Link
              href="/sign-in"
              className="underline underline-offset-4 hover:text-primary"
            >
              Влезте
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
