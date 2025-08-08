import { signUpAction } from "@/app/actions";
import AuthSubmitButton from "@/components/auth-submit-button";
import { FormMessage, Message } from "@/components/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dumbbell, Check } from "lucide-react";
import Link from "next/link";

export default async function SignUp(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  const features = [
    "Персонализирани тренировъчни програми",
    "Проследяване на прогреса",
    "Професионални треньори",
    "Мобилно приложение"
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left side - Features */}
          <div className="hidden lg:block">
            <div className="space-y-6">
              <div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Започнете своето fitness пътуване
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Присъединете се към хиляди хора, които вече постигат своите цели с нашата платформа.
                </p>
              </div>
              
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right side - Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Card className="p-8 bg-white shadow-lg">
              
              {/* Mobile header */}
              <div className="text-center mb-8 lg:hidden">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Създайте акаунт</h1>
                <p className="text-gray-600">
                  Регистрирайте се безплатно и започнете още днес
                </p>
              </div>

              {/* Form */}
              <form className="space-y-4" action={signUpAction}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Имейл адрес
                  </Label>
                  <Input 
                    id="email"
                    name="email" 
                    type="email"
                    placeholder="name@example.com" 
                    required 
                    className="w-full h-11"
                    autoComplete="email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Парола
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Създайте сигурна парола"
                    required
                    className="w-full h-11"
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-gray-500">
                    Паролата трябва да съдържа поне 8 символа
                  </p>
                </div>

                <div className="pt-2">
                  <AuthSubmitButton />
                </div>
                
                <FormMessage message={searchParams} />
              </form>

              {/* Terms */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 leading-relaxed">
                  С регистрацията вие се съгласявате с нашите{" "}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                    Условия за ползване
                  </Link>{" "}
                  и{" "}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                    Политика за поверителност
                  </Link>
                </p>
              </div>

              {/* Sign in link */}
              <div className="mt-8 text-center border-t pt-6">
                <p className="text-sm text-gray-600">
                  Вече имате акаунт?{" "}
                  <Link 
                    className="text-blue-600 hover:text-blue-500 font-medium" 
                    href="/sign-in"
                  >
                    Влезте тук
                  </Link>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
