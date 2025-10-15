import { signInAction } from "@/app/actions";
import AuthSubmitButton from "@/components/auth-submit-button";
import GoogleAuthButton from "@/components/google-auth-button";
import { FormMessage, Message } from "@/components/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Activity, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function SignIn(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left side - Form */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3">
            <Dumbbell className="h-5 w-5" />
          </div>
          Fitness Training
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-4">
            <p className="text-lg leading-relaxed">
              &ldquo;Тази платформа промени начина, по който управлявам клиентите си.
              Всичко е на едно място - тренировки, хранене и прогрес.&rdquo;
            </p>
            <footer className="text-sm opacity-80">Мария Иванова - Персонален треньор</footer>
          </blockquote>

          <div className="grid grid-cols-3 gap-4 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Users className="h-5 w-5 mb-2" />
              <div className="text-2xl font-bold">2K+</div>
              <div className="text-xs opacity-80">Треньори</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Activity className="h-5 w-5 mb-2" />
              <div className="text-2xl font-bold">50K+</div>
              <div className="text-xs opacity-80">Тренировки</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <TrendingUp className="h-5 w-5 mb-2" />
              <div className="text-2xl font-bold">95%</div>
              <div className="text-xs opacity-80">Успеваемост</div>
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
              Добре дошли отново
            </h1>
            <p className="text-sm text-muted-foreground">
              Въведете имейла си за да влезете в акаунта си
            </p>
          </div>

          <div className="grid gap-6">
            <GoogleAuthButton mode="sign-in" />

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

            <form action={signInAction}>
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Парола</Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm underline-offset-4 hover:underline text-muted-foreground"
                    >
                      Забравена парола?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <FormMessage message={searchParams} />
                <AuthSubmitButton />
              </div>
            </form>
          </div>

          <p className="px-8 text-center text-sm text-muted-foreground">
            Нямате акаунт?{" "}
            <Link
              href="/sign-up"
              className="underline underline-offset-4 hover:text-primary"
            >
              Регистрирайте се
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
