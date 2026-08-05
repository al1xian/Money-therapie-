import {useEffect, useState} from 'react';
import {CloseIcon} from '~/components/Icons';
import {lockScroll, unlockScroll} from '~/lib/scrollLock';

const STORAGE_KEY = 'reda-studio-newsletter-seen';

/**
 * The key used before the pop-up became once-per-visitor. Still honoured on
 * read: someone who had already subscribed back then must not be asked again
 * just because the flag was renamed.
 */
const LEGACY_STORAGE_KEY = 'reda-studio-newsletter-subscribed';

/**
 * The same flag, as a cookie.
 *
 * Two records of one fact, on purpose — they are evicted under different
 * rules, and either one is enough to keep the pop-up away. It matters most on
 * Safari, where script-written localStorage is capped at seven days of
 * inactivity: a visitor who dismissed the pop-up and came back a fortnight
 * later would otherwise see it again.
 */
const COOKIE_NAME = 'reda_newsletter_seen';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const PROMO_CODE = 'REDA10';
const OPEN_DELAY_MS = 1200;

/**
 * Welcome pop-up offering -10% in exchange for an email address.
 *
 * Shown **once per visitor**: the flag is written the moment it opens and
 * again when it closes, so it never comes back — whether the visitor
 * subscribed, dismissed it, or simply ignored it. (It used to reappear at
 * every visit until someone subscribed.) It is recorded twice, in localStorage
 * and in a one-year cookie, because browsers evict the two under different
 * rules; only clearing the browser's site data resets both.
 *
 * Posts through the same real /newsletter endpoint as the footer sign-up
 * (Shopify's own customer form), so every address lands in the store's
 * customer list — see docs/emails-newsletter.md. The promo code only appears
 * once that submission actually succeeds.
 */
/*
 * localStorage throws outright when a browser has storage blocked — Safari's
 * private mode being the classic case. An unguarded read here would take the
 * whole page down over a marketing pop-up, so every access fails soft: the
 * visitor simply gets shown the offer.
 */
function hasCookie(): boolean {
  try {
    return document.cookie
      .split(';')
      .some((entry) => entry.trim().startsWith(`${COOKIE_NAME}=`));
  } catch {
    return false;
  }
}

function hasStorageFlag(): boolean {
  try {
    return (
      window.localStorage.getItem(STORAGE_KEY) !== null ||
      window.localStorage.getItem(LEGACY_STORAGE_KEY) !== null
    );
  } catch {
    return false;
  }
}

/** Either record is enough — the pop-up has been shown before. */
function alreadySeen(): boolean {
  return hasCookie() || hasStorageFlag();
}

/**
 * Writes both records. Called when the pop-up opens and again when it closes:
 * the second write costs nothing and covers the case where the first one was
 * refused — a storage quota, a permission that changed mid-visit.
 */
function markSeen() {
  try {
    window.localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Nothing to do — the cookie below is the other half of the belt.
  }

  try {
    document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  } catch {
    // Nothing to do: without storage the offer can't be remembered.
  }
}

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  useEffect(() => {
    if (alreadySeen()) return;
    const timer = setTimeout(() => {
      // Marked as seen on opening, not on closing: a visitor who navigates
      // away with it still on screen doesn't get it again either.
      markSeen();
      setOpen(true);
    }, OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    document.addEventListener('keydown', (event) => event.key === 'Escape' && close(), {signal: controller.signal});

    // Shared with the cart, search and menu drawers — see app/lib/scrollLock.ts
    // for why locking the page must not be allowed to resize it.
    lockScroll();

    return () => {
      controller.abort();
      unlockScroll();
    };
  }, [open]);

  function close() {
    // Written again here, not only on opening: closing is the moment the
    // visitor is most explicit about not wanting it, and a second write covers
    // a first one that silently failed.
    markSeen();
    setOpen(false);
  }

  async function submit(form: HTMLFormElement) {
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
    if (!email) return;

    setStatus('loading');
    try {
      const body = new URLSearchParams({
        form_type: 'customer',
        utf8: '✓',
        'contact[email]': email,
        // Tagged as coming from the pop-up so the two sign-up points can be
        // told apart in the store's customer list.
        source: 'popup',
      });
      const res = await fetch('/newsletter', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: body.toString(),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(event.currentTarget);
  }

  if (!open) return null;

  return (
    <div className="popup-overlay" role="dialog" aria-modal aria-label="Welcome offer">
      <button className="popup-overlay__close-outside" onClick={close} aria-label="Close" />
      <div className="popup">
        <button type="button" className="popup__close" onClick={close} aria-label="Close">
          <CloseIcon />
        </button>

        <div className="popup__media">
          <img
            src="/images/lookbook-casquette.webp"
            alt="reda studio outfit: ecru top, washed flare jeans and blue cap"
            width="788"
            height="1200"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="popup__body">
          <h2>-10% off your first order</h2>

          {status === 'done' ? (
            <div className="popup__code">
              <p className="popup__code-label">your promo code</p>
              <p className="popup__code-value">{PROMO_CODE}</p>
              <p className="popup__code-hint">valid on your next order.</p>
            </div>
          ) : (
            <>
              <p className="popup__text">
                leave your email and your promo code appears right after. quick, simple, no spam.
              </p>
              <form className="popup__form" onSubmit={onSubmit}>
                <input
                  type="email"
                  name="email"
                  placeholder="email address"
                  aria-label="email address"
                  autoComplete="email"
                  required
                />
                <button type="submit" className="btn btn--full" disabled={status === 'loading'}>
                  {status === 'loading' ? '…' : 'get my -10% now'}
                </button>
                {status === 'error' && (
                  <p className="form-error" role="alert">
                    something went wrong, please try again.
                  </p>
                )}
              </form>
              <p className="popup__fineprint">no spam. exclusive offers and private sales only.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
