import Link from 'next/link';
import { Dumbbell, Mail, Facebook, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  const navigation = {
    product: [
      { name: 'Начало', href: '/' },
      { name: 'За нас', href: '/about' },
      { name: 'Цени', href: '/pricing' },
      { name: 'Контакти', href: '/contact' },
    ],
    support: [
      { name: 'Помощ', href: '#' },
      { name: 'Документация', href: '#' },
      { name: 'API', href: '#' },
      { name: 'Статус', href: '#' },
    ],
    company: [
      { name: 'За нас', href: '/about' },
      { name: 'Блог', href: '#' },
      { name: 'Кариери', href: '#' },
      { name: 'Партньори', href: '#' },
    ],
    legal: [
      { name: 'Поверителност', href: '/privacy' },
      { name: 'Условия', href: '/terms' },
      { name: 'Бисквитки', href: '/cookies' },
      { name: 'Лицензи', href: '#' },
    ],
    social: [
      {
        name: 'Facebook',
        href: '#',
        icon: Facebook,
      },
      {
        name: 'Instagram',
        href: '#',
        icon: Instagram,
      },
      {
        name: 'LinkedIn',
        href: '#',
        icon: Linkedin,
      },
      {
        name: 'Email',
        href: 'mailto:info@fitlife.bg',
        icon: Mail,
      },
    ],
  };

  return (
    <footer className="bg-background border-t" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-2">
              <Dumbbell className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">FitLife Studio</span>
            </Link>
            <p className="text-sm leading-6 text-muted-foreground">
              Най-добрата платформа за персонални треньори и техните клиенти.
              Управлявайте тренировки, хранителни планове и следете прогреса на едно място.
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6">Продукт</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.product.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6">Поддръжка</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.support.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6">Компания</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6">Правни</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} FitLife Studio. Всички права запазени.
          </p>
        </div>
      </div>
    </footer>
  );
}
