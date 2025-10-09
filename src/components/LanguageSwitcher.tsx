'use client';

import { useLocale } from '@/lib/i18n/client';

export function LanguageSwitcher() {
  const [locale, setLocale] = useLocale();

  return (
    <label className="inline-flex items-center text-sm">
      <span className="sr-only">Language</span>
      <select
        className="rounded-md border border-cyan-200 bg-white px-2 py-1 text-gray-700 hover:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-200"
        value={locale}
        onChange={(e) => setLocale(e.target.value as any)}
      >
        <option value="az">AZ</option>
        <option value="en">EN</option>
        <option value="ru">RU</option>
      </select>
    </label>
  );
}


