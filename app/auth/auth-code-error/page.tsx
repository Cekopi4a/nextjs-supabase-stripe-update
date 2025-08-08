import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Dumbbell } from "lucide-react";
import Link from "next/link";

export default function AuthCodeError() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="p-8 bg-white shadow-lg text-center">
          {/* Logo and header */}
          <div className="mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Грешка при влизане
            </h1>
            <p className="text-gray-600">
              Възникна проблем при влизането ви в системата. Моля опитайте отново.
            </p>
          </div>

          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/sign-in">
                Опитай отново
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                Начална страница
              </Link>
            </Button>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            Ако проблемът продължава, моля свържете се с поддръжката.
          </div>
        </Card>
      </div>
    </div>
  );
}