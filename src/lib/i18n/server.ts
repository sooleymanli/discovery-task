import { cookies } from 'next/headers';
import { dictionaries } from './dictionaries';
import { DEFAULT_LOCALE, LOCALE_COOKIE, SUPPORTED_LOCALES, type SupportedLocale } from './config';

export function getServerLocale(): SupportedLocale {
  try {
    const c = cookies();
    const cookieLocale = c.get(LOCALE_COOKIE)?.value as SupportedLocale | undefined;
    if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) return cookieLocale;
  } catch {}
  return DEFAULT_LOCALE;
}

export function tServer(key: string, locale?: SupportedLocale): string {
  const l = locale ?? getServerLocale();
  return dictionaries[l][key] ?? key;
}


