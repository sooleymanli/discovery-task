import { cookies } from 'next/headers';
import { dictionaries } from './dictionaries';
import { DEFAULT_LOCALE, LOCALE_COOKIE, SUPPORTED_LOCALES, type SupportedLocale } from './config';

export async function getServerLocale(): Promise<SupportedLocale> {
  try {
    const c = await cookies();
    const cookieLocale = c.get(LOCALE_COOKIE)?.value as SupportedLocale | undefined;
    if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) return cookieLocale;
  } catch {}
  return DEFAULT_LOCALE;
}

export async function tServer(key: string, locale?: SupportedLocale): Promise<string> {
  const l = locale ?? await getServerLocale();
  return dictionaries[l][key] ?? key;
}


