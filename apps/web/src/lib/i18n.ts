/**
 * Minimal i18n scaffold.
 *
 * Korean is the only locale shipping today; this file exists so the
 * migration to English / Japanese is a mechanical one-page-at-a-time
 * refactor instead of a rewrite.
 *
 * Pattern:
 *   1. Add a new key to `DICT.ko` (below).
 *   2. Use it in a component:  const t = useT(); ... {t('signin.cta')}
 *   3. When a second locale is needed, copy `DICT.ko` to `DICT.en`,
 *      translate the values, and expose a locale switcher at the
 *      layout level that writes `document.documentElement.lang` +
 *      persists the choice.
 *
 * Not in scope of this scaffold:
 *   - Auto-detect from Accept-Language (trivial once we add more
 *     than one locale — see https://nextjs.org/docs/app/building-your-application/routing/internationalization)
 *   - Server-component rendering (our current surfaces are all client
 *     components once you reach a translated string)
 *   - Pluralisation / ICU MessageFormat. The app's copy is short,
 *     imperative, and doesn't need plural forms. Revisit when we do.
 */

import { createContext, useContext } from 'react';

export type Locale = 'ko' | 'en';

export const DEFAULT_LOCALE: Locale = 'ko';

// Flat key → string so greps like `rg 'signin.email.sent'` find every
// call site and every translation in one shot.
type KoDict = typeof KO_STRINGS;
const KO_STRINGS = {
  'signin.email.label': '이메일',
  'signin.email.placeholder': 'you@example.com',
  'signin.email.submit': '이메일로 로그인 링크 받기',
  'signin.email.sending': '보내는 중…',
  'signin.email.sent.title': '메일 전송 완료',
  'signin.email.sent.body': '로 로그인 링크를 보냈어요. 이메일의 링크를 누르면 로그인됩니다.',
} as const;

export type MessageKey = keyof KoDict;

// English entries default to Korean until translated — keeps types
// stable across locales so we never render `undefined` as "missing".
const EN_STRINGS: KoDict = { ...KO_STRINGS };

const DICT: Record<Locale, KoDict> = {
  ko: KO_STRINGS,
  en: EN_STRINGS,
};

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);
export const LocaleProvider = LocaleContext.Provider;

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function t(key: MessageKey, locale: Locale = DEFAULT_LOCALE): string {
  return DICT[locale][key];
}

export function useT(): (key: MessageKey) => string {
  const locale = useLocale();
  return (key) => DICT[locale][key];
}
