// Shared i18n configuration - safe to import in client components

export const locales = ['en', 'tw', 'ga', 'ee', 'ha', 'dag'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  tw: 'Twi',
  ga: 'Ga',
  ee: 'Ewe',
  ha: 'Hausa',
  dag: 'Dagbani',
};
