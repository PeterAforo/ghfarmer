import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { Locale } from '@/lib/i18n-config';

// Re-export for backward compatibility with server components
export { locales, localeNames, type Locale } from '@/lib/i18n-config';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value || 'en') as Locale;
  
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
