import Link from 'next/link';
import { Dumbbell, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-max mx-auto text-center">
        <div className="flex justify-center mb-8">
          <Dumbbell className="h-16 w-16 text-primary animate-pulse" />
        </div>

        <p className="text-base font-semibold text-primary">404</p>

        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
          Страницата не е намерена
        </h1>

        <p className="mt-6 text-base leading-7 text-muted-foreground max-w-md mx-auto">
          Съжаляваме, но не можем да намерим страницата, която търсите.
          Моля, проверете URL адреса или се върнете към начална страница.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors inline-flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Начална страница
          </Link>

          <Link
            href="/protected"
            className="text-sm font-semibold inline-flex items-center gap-2 hover:text-primary transition-colors"
          >
            <Search className="h-4 w-4" />
            Към приложението
          </Link>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Нуждаете се от помощ?{' '}
            <Link href="/contact" className="font-medium text-primary hover:text-primary/90">
              Свържете се с нас
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
