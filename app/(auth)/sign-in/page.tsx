import { signInAction } from "@/app/actions";
import AuthSubmitButton from "@/components/auth-submit-button";
import GoogleAuthButton from "@/components/google-auth-button";
import { FormMessage, Message } from "@/components/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import Link from "next/link";

export default async function SignIn(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="p-8 bg-white shadow-lg">
          {/* Logo and header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Добре дошли отново</h1>
            <p className="text-gray-600">
              Влезте в своя акаунт за да продължите
            </p>
          </div>

          {/* Google Auth */}
          <div className="mb-6">
            <GoogleAuthButton mode="sign-in" />
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-500 bg-white">или</span>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" action={signInAction}>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Парола
                </Label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  Забравена парола?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Въведете паролата си"
                required
                className="w-full h-11"
                autoComplete="current-password"
              />
            </div>

            <div className="pt-2">
              <AuthSubmitButton />
            </div>
            
            <FormMessage message={searchParams} />
          </form>

          {/* Sign up link */}
          <div className="mt-8 text-center border-t pt-6">
            <p className="text-sm text-gray-600">
              Нямате акаунт?{" "}
              <Link 
                className="text-blue-600 hover:text-blue-500 font-medium" 
                href="/sign-up"
              >
                Регистрирайте се тук
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
