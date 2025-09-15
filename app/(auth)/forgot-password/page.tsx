import { forgotPasswordAction } from "@/app/actions";
import AuthSubmitButton from "@/components/auth-submit-button";
import { FormMessage, Message } from "@/components/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dumbbell, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="p-8 bg-white shadow-lg">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Забравена парола</h1>
            <p className="text-gray-600">
              Въведете вашия имейл адрес и ще ви изпратим линк за смяна на паролата
            </p>
          </div>

          <form className="space-y-4" action={forgotPasswordAction}>
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

            <div className="pt-2">
              <AuthSubmitButton loadingText="Изпраща..." />
            </div>

            <FormMessage message={searchParams} />
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/sign-in"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Обратно към влизане
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}