import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { Locale } from '@/lib/i18n-config';

// Re-export for backward compatibility with server components
export { locales, localeNames, type Locale } from '@/lib/i18n-config';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  let locale = (cookieStore.get('locale')?.value || 'en') as Locale;
  
  // Validate locale - fallback to 'en' if invalid
  const validLocales = ['en', 'tw', 'ga', 'ee', 'ha', 'dag'];
  if (!validLocales.includes(locale)) {
    locale = 'en' as Locale;
  }
  
  try {
    const messages = (await import(`../messages/${locale}.json`)).default;
    return {
      locale,
      messages: messages || {},
    };
  } catch {
    // Fallback to English if locale file fails to load
    const messages = (await import(`../messages/en.json`)).default;
    return {
      locale: 'en' as Locale,
      messages: messages || {},
    };
  }
});
