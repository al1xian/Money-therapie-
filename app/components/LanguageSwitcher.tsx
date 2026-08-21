import {useLocation, useSubmit} from 'react-router';
import {useI18n, LOCALES, type Locale} from '~/lib/i18n';

const LABELS: Record<Locale, string> = {en: 'EN', fr: 'FR'};

/**
 * EN / FR.
 *
 * Lives in the settings block (menu drawer and footer), not in the header bar
 * — see `LocalePreferences` in app/components/Header.tsx.
 *
 * Submits to /locale, which stores the choice and redirects straight back to
 * the page the visitor is on — so switching language never costs them their
 * place. It is a form rather than a link because it writes a cookie, and a
 * link that changes state is a link a browser or a crawler may follow on its
 * own.
 *
 * It works without JavaScript: the same form posts and the same redirect
 * comes back. `useSubmit` only saves a click.
 */
export function LanguageSwitcher() {
  const {locale, t} = useI18n();
  const location = useLocation();
  const submit = useSubmit();

  const redirectTo = `${location.pathname}${location.search}`;

  return (
    <form
      method="post"
      action="/locale"
      className="lang-switch"
      aria-label={t('nav.language')}
      onSubmit={(event) => {
        event.preventDefault();
        void submit(event.currentTarget);
      }}
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />
      {LOCALES.map((code) => (
        <button
          key={code}
          type="submit"
          name="locale"
          value={code}
          className="lang-switch__option"
          // The current language is announced, not just styled — the visual
          // difference alone says nothing to a screen reader.
          aria-current={code === locale ? 'true' : undefined}
          data-active={code === locale ? 'true' : undefined}
        >
          {LABELS[code]}
        </button>
      ))}
    </form>
  );
}
