import {createContext, useContext, useMemo, type ReactNode} from 'react';
import {DICTIONARIES, type TranslationKey} from './dictionary';
import {DEFAULT_LOCALE, type Locale} from './locale';

export {DEFAULT_LOCALE, LOCALES, isLocale, localeCookie, localeFromRequest, shopifyLanguage} from './locale';
export type {Locale} from './locale';
export type {TranslationKey} from './dictionary';

/** Values substituted into a string's {placeholders}. */
export type TranslationValues = Record<string, string | number>;

export type Translate = (
  key: TranslationKey,
  values?: TranslationValues,
) => string;

type I18nValue = {locale: Locale; t: Translate};

const I18nContext = createContext<I18nValue | null>(null);

/**
 * Fills `{name}` placeholders. Left as plain string interpolation rather than
 * anything cleverer: every string here is authored in this repo, so there is
 * no untrusted input to escape, and the output goes through React, which
 * escapes it anyway.
 */
function format(template: string, values?: TranslationValues): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const value = useMemo<I18nValue>(() => {
    const dictionary = DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
    return {
      locale,
      t: (key, values) => format(dictionary[key] ?? key, values),
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * The hook every component uses.
 *
 * Falls back to English rather than throwing when no provider is above it:
 * a missing provider should never be able to blank out a page, and an English
 * word is a visible, reportable bug rather than a white screen.
 */
export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (value) return value;

  const dictionary = DICTIONARIES[DEFAULT_LOCALE];
  return {
    locale: DEFAULT_LOCALE,
    t: (key, values) => format(dictionary[key] ?? key, values),
  };
}

/** Shorthand for the common case. */
export function useT(): Translate {
  return useI18n().t;
}
