export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const COOKIE_CONSENT_KEY = "fitness-app-cookie-consent";
export const COOKIE_PREFERENCES_KEY = "fitness-app-cookie-preferences";

export const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
};

/**
 * Get current cookie preferences from localStorage
 */
export function getCookiePreferences(): CookiePreferences {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  try {
    const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Error reading cookie preferences:", error);
  }

  return DEFAULT_PREFERENCES;
}

/**
 * Save cookie preferences to localStorage
 */
export function saveCookiePreferences(preferences: CookiePreferences): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));

    // Trigger custom event for other components to react
    window.dispatchEvent(new CustomEvent("cookiePreferencesChanged", { detail: preferences }));
  } catch (error) {
    console.error("Error saving cookie preferences:", error);
  }
}

/**
 * Check if user has given consent
 */
export function hasGivenConsent(): boolean {
  if (typeof window === "undefined") return false;

  return localStorage.getItem(COOKIE_CONSENT_KEY) === "true";
}

/**
 * Check if a specific cookie type is enabled
 */
export function isCookieTypeEnabled(type: keyof CookiePreferences): boolean {
  const preferences = getCookiePreferences();
  return preferences[type];
}

/**
 * Initialize analytics based on preferences
 */
export function initializeAnalytics(): void {
  if (!isCookieTypeEnabled("analytics")) {
    return;
  }

  // TODO: Initialize Google Analytics, Plausible, or other analytics
  if (typeof window !== "undefined" && (window as any).gtag) {
    console.log("Analytics initialized");
    // (window as any).gtag("consent", "update", {
    //   analytics_storage: "granted",
    // });
  }
}

/**
 * Initialize marketing cookies based on preferences
 */
export function initializeMarketing(): void {
  if (!isCookieTypeEnabled("marketing")) {
    return;
  }

  // TODO: Initialize Facebook Pixel, Google Ads, etc.
  if (typeof window !== "undefined") {
    console.log("Marketing cookies initialized");
    // Facebook Pixel initialization
    // Google Ads initialization
  }
}

/**
 * Apply all cookie preferences
 */
export function applyCookiePreferences(): void {
  if (!hasGivenConsent()) {
    return;
  }

  initializeAnalytics();
  initializeMarketing();
}

/**
 * Reset all cookie preferences
 */
export function resetCookiePreferences(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(COOKIE_CONSENT_KEY);
  localStorage.removeItem(COOKIE_PREFERENCES_KEY);

  window.dispatchEvent(new Event("cookiePreferencesReset"));
}
