"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, Settings } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_KEY = "fitness-app-cookie-consent";
const COOKIE_PREFERENCES_KEY = "fitness-app-cookie-preferences";

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);

    // Apply preferences (e.g., initialize analytics if enabled)
    applyPreferences(prefs);
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
  };

  const acceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    savePreferences(necessaryOnly);
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  const applyPreferences = (prefs: CookiePreferences) => {
    // TODO: Initialize analytics tools based on preferences
    if (prefs.analytics) {
      // Initialize Google Analytics, Plausible, etc.
      console.log("Analytics enabled");
    }
    if (prefs.marketing) {
      // Initialize marketing pixels
      console.log("Marketing cookies enabled");
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg animate-in slide-in-from-bottom-5">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Cookie className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="font-semibold text-foreground">
                  Използваме бисквитки (Cookies)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Използваме бисквитки за подобряване на вашето изживяване, анализ на трафика и персонализирани функции.{" "}
                  <Link href="/cookies" className="text-primary hover:underline">
                    Научете повече
                  </Link>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Настройки
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={acceptNecessary}
              >
                Само необходими
              </Button>
              <Button
                size="sm"
                onClick={acceptAll}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Приемам всички
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              Настройки за бисквитки
            </DialogTitle>
            <DialogDescription>
              Изберете какви видове бисквитки желаете да разрешите. Можете да промените тези настройки по всяко време.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Necessary Cookies */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <Label className="text-base font-semibold">
                    Необходими бисквитки
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Тези бисквитки са задължителни за функционирането на сайта. Включват сесия, автентикация и основни настройки.
                  </p>
                </div>
                <Switch
                  checked={preferences.necessary}
                  disabled
                  className="ml-4"
                />
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                <strong>Примери:</strong> Сесия, автентикация, CSRF защита
              </div>
            </div>

            {/* Functional Cookies */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <Label className="text-base font-semibold">
                    Функционални бисквитки
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Запазват вашите предпочитания като тема (dark/light mode), език и други персонализации.
                  </p>
                </div>
                <Switch
                  checked={preferences.functional}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, functional: checked })
                  }
                  className="ml-4"
                />
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                <strong>Примери:</strong> Тема (dark/light), език, размер на шрифт
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <Label className="text-base font-semibold">
                    Аналитични бисквитки
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Помагат ни да разберем как използвате платформата и да подобрим нейната функционалност. Данните са анонимни.
                  </p>
                </div>
                <Switch
                  checked={preferences.analytics}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, analytics: checked })
                  }
                  className="ml-4"
                />
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                <strong>Примери:</strong> Google Analytics, Plausible, Посетени страници, време на сайта
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <Label className="text-base font-semibold">
                    Маркетингови бисквитки
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Използват се за показване на релевантни реклами и маркетингови съобщения.
                  </p>
                </div>
                <Switch
                  checked={preferences.marketing}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, marketing: checked })
                  }
                  className="ml-4"
                />
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                <strong>Примери:</strong> Facebook Pixel, Google Ads, Retargeting
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={acceptNecessary}
            >
              Само необходими
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSettings(false)}
              >
                Отказ
              </Button>
              <Button onClick={saveCustomPreferences}>
                Запази настройките
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2">
            Можете да промените тези настройки по всяко време от{" "}
            <Link href="/cookies" className="text-primary hover:underline">
              страницата за бисквитки
            </Link>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
