import {redirect} from 'react-router';
import type {Route} from './+types/locale';
import {isLocale, localeCookie} from '~/lib/i18n/locale';

/**
 * Switches language and returns the visitor to the page they were on.
 *
 * A POST rather than a link, because it changes stored state. The page to come
 * back to is sent along in the form, and checked before use: a `redirectTo`
 * that isn't a path on this site is dropped in favour of the homepage, so the
 * switcher can't be turned into an open redirect by a crafted URL.
 */
export async function action({request}: Route.ActionArgs) {
  const formData = await request.formData();
  const locale = String(formData.get('locale') ?? '');
  const redirectTo = String(formData.get('redirectTo') ?? '/');

  const safePath =
    redirectTo.startsWith('/') && !redirectTo.startsWith('//')
      ? redirectTo
      : '/';

  if (!isLocale(locale)) {
    return redirect(safePath);
  }

  return redirect(safePath, {
    headers: {'Set-Cookie': localeCookie(locale)},
  });
}

/** Nothing renders here; a stray GET goes home. */
export async function loader() {
  return redirect('/');
}
