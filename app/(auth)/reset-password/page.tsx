import { resetPasswordAction } from "@/app/actions";
import AuthSubmitButton from "@/components/auth-submit-button";
import { FormMessage, Message } from "@/components/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="p-8 bg-white shadow-lg">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Нова парола</h1>
            <p className="text-gray-600">
              Въведете новата си парола за да завършите процеса
            </p>
          </div>

          <form className="space-y-4" action={resetPasswordAction}>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Нова парола
              </Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Въведете новата парола"
                required
                className="w-full h-11"
                autoComplete="new-password"
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Потвърдете паролата
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Потвърдете новата парола"
                required
                className="w-full h-11"
                autoComplete="new-password"
                minLength={6}
              />
            </div>

            <div className="text-xs text-gray-500 mt-2">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span>Минимум 6 символа</span>
              </div>
            </div>

            <div className="pt-2">
              <AuthSubmitButton loadingText="Запазва..." />
            </div>

            <FormMessage message={searchParams} />
          </form>
        </Card>
      </div>
    </div>
  );
}