# Cookie Consent System - Документация

## 📋 Преглед

Цялостна система за управление на бисквитки (cookies) съгласно GDPR и ePrivacy Directive.

## 🎯 Компоненти

### 1. Cookie Consent Banner
**Файл:** `components/cookie-consent-banner.tsx`

Интерактивен banner, който се показва при първо посещение на сайта.

**Функции:**
- Показва се автоматично ако потребителят не е дал съгласие
- 3 бутона за избор:
  - "Само необходими" - минималните необходими cookies
  - "Настройки" - детайлни настройки
  - "Приемам всички" - всички видове cookies
- Съхранява предпочитанията в `localStorage`

**Използване:**
```tsx
import CookieConsentBanner from "@/components/cookie-consent-banner";

// Вече е интегриран в app/layout.tsx
<CookieConsentBanner />
```

### 2. Cookie Policy Page
**Файл:** `app/cookies/page.tsx`

Пълна страница с информация за бисквитките и управление на настройките.

**Секции:**
- Какво са бисквитки
- Видове бисквитки (Необходими, Функционални, Аналитични, Маркетингови)
- Управление на настройките
- Как да контролирате бисквитки в браузъра
- Бисквитки от трети страни (Google Analytics, Stripe)

**URL:** `/cookies`

### 3. Cookie Consent Utils
**Файл:** `utils/cookie-consent.ts`

Utility функции за работа с cookie preferences.

**Функции:**
```typescript
// Взимане на текущи настройки
getCookiePreferences(): CookiePreferences

// Запазване на настройки
saveCookiePreferences(preferences: CookiePreferences): void

// Проверка дали има съгласие
hasGivenConsent(): boolean

// Проверка дали определен тип е разрешен
isCookieTypeEnabled(type: 'necessary' | 'functional' | 'analytics' | 'marketing'): boolean

// Инициализация на analytics
initializeAnalytics(): void

// Инициализация на маркетинг
initializeMarketing(): void

// Приложи всички настройки
applyCookiePreferences(): void

// Нулиране на настройки
resetCookiePreferences(): void
```

## 🔧 Типове бисквитки

### 1. Необходими (Necessary) - Задължителни
- Сесия и автентикация
- CSRF защита
- Основни функции на сайта
- **НЕ МОГАТ** да бъдат изключени

### 2. Функционални (Functional)
- Dark/Light тема
- Избор на език
- Размер на шрифт
- Други предпочитания

### 3. Аналитични (Analytics)
- Google Analytics
- Plausible
- Статистика за използване
- Данните са анонимни

### 4. Маркетингови (Marketing)
- Facebook Pixel
- Google Ads
- Retargeting кампании

## 📦 LocalStorage Keys

```typescript
// Съгласие дадено
"fitness-app-cookie-consent" = "true"

// Настройки
"fitness-app-cookie-preferences" = {
  necessary: true,
  functional: boolean,
  analytics: boolean,
  marketing: boolean
}
```

## 🎨 Интеграция

### В Layout
```tsx
// app/layout.tsx
import CookieConsentBanner from "@/components/cookie-consent-banner";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
```

### В Footer
```tsx
// components/footer.tsx
legal: [
  { name: 'Поверителност', href: '/privacy' },
  { name: 'Условия', href: '/terms' },
  { name: 'Бисквитки', href: '/cookies' }, // ✅ Добавен
]
```

## 🔗 Линкове

- **Cookie Policy:** `/cookies`
- **Privacy Policy:** `/privacy` (актуализирана с cookie информация)
- **Terms of Service:** `/terms`

## 📱 События (Events)

Системата излъчва custom events за реакция на промени:

```typescript
// При промяна на настройки
window.addEventListener('cookiePreferencesChanged', (event) => {
  const preferences = event.detail;
  console.log('Preferences changed:', preferences);
});

// При нулиране
window.addEventListener('cookiePreferencesReset', () => {
  console.log('Preferences reset');
});
```

## 🚀 Как да добавите Analytics

### Google Analytics

1. Добавете GA script в `app/layout.tsx`:
```tsx
{isCookieTypeEnabled('analytics') && (
  <Script
    src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
    strategy="afterInteractive"
  />
)}
```

2. Актуализирайте `initializeAnalytics()` в `utils/cookie-consent.ts`:
```typescript
export function initializeAnalytics(): void {
  if (!isCookieTypeEnabled("analytics")) return;

  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("consent", "update", {
      analytics_storage: "granted",
    });
  }
}
```

### Plausible Analytics

```tsx
{isCookieTypeEnabled('analytics') && (
  <Script
    defer
    data-domain="yourdomain.com"
    src="https://plausible.io/js/script.js"
  />
)}
```

## ⚖️ GDPR Compliance

### Задължителни елементи ✅
- ✅ Clear consent (ясно съгласие)
- ✅ Granular control (детайлен контрол)
- ✅ Easy to withdraw (лесно оттегляне)
- ✅ Information transparency (прозрачна информация)
- ✅ No pre-checked boxes (без предварително маркирани)
- ✅ Easy access to settings (лесен достъп до настройки)

### Best Practices
1. Banner се показва преди analytics cookies
2. Необходимите cookies работят винаги
3. Потребителят може да промени настройките по всяко време
4. Линк към cookie policy е навсякъде видим
5. Настройките се запазват локално

## 🛠️ Тестване

1. Изтрийте localStorage
2. Презаредете страницата
3. Трябва да видите cookie banner
4. Тествайте всички бутони
5. Проверете localStorage след всеки избор
6. Отидете на `/cookies` и променете настройките

## 📝 TODO (Future Improvements)

- [ ] Server-side tracking на consent (optional)
- [ ] Cookie scanning tool
- [ ] A/B testing за consent rates
- [ ] Статистика колко хора приемат кои cookies
- [ ] Multi-language support за cookie banner

---

💡 **Забележка:** Системата е готова за production и напълно GDPR compliant!
