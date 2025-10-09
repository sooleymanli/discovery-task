'use client';

import { useEffect, useState } from 'react';
import { dictionaries } from './dictionaries';
import { DEFAULT_LOCALE, LOCALE_COOKIE, SUPPORTED_LOCALES, type SupportedLocale } from './config';

export function useLocale(): [SupportedLocale, (l: SupportedLocale) => Promise<void>] {
  // Always start with DEFAULT_LOCALE to match SSR, then sync with actual locale
  const [locale, setLocale] = useState<SupportedLocale>(DEFAULT_LOCALE);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // On mount, read the actual locale from html lang attribute (set by server)
    const actualLocale = (document.documentElement.lang as SupportedLocale) || DEFAULT_LOCALE;
    setLocale(actualLocale);
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      document.documentElement.lang = locale;
    }
  }, [locale, isClient]);

  const change = async (l: SupportedLocale) => {
    if (!SUPPORTED_LOCALES.includes(l)) return;
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
    setLocale(l);
    if (typeof window !== 'undefined') window.location.reload();
  };

  return [locale, change];
}

export function tClient(key: string, locale: SupportedLocale): string {
  return dictionaries[locale][key] ?? key;
}


