import {useEffect, useState} from 'react';
import {CloseIcon} from '~/components/Icons';

const STORAGE_KEY = 'reda-studio-newsletter-seen';
const PROMO_CODE = 'REDA10';
const OPEN_DELAY_MS = 1200;

/**
 * Welcome pop-up offering -10% in exchange for an email address.
 *
 * Shown **once per visitor**: the localStorage flag is written the moment it
 * opens, so it never comes back — whether the visitor subscribed, closed it,
 * or simply ignored it. (It used to reappear at every visit until someone
 * subscribed.) Clearing the browser's site data is what resets it.
 *
 * Posts through the same real /newsletter endpoint as the footer sign-up
 * (Shopify's own customer form), so every address lands in the store's
 * customer list — see docs/emails-newsletter.md. The promo code only appears
 * once that submission actually succeeds.
 */
/*
 * localStorage throws outright when a browser has storage blocked — Safari's
 * private mode being the classic case. An unguarded read here would take the
 * whole page down over a marketing pop-up, so both accesses fail soft: the
 * visitor simply gets shown the offer.
 */
function alreadySeen(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(STORAGE_KEY, '1');
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

    /*
     * Locking the page while the dialog is up must not resize anything.
     * `overflow: hidden` removes the scrollbar, and on a desktop browser that
     * hands ~15px back to the layout: the whole site widens as the pop-up
     * appears and snaps back as it closes. So the exact width the scrollbar
     * occupied is measured and held open — on the body for the page, and on
     * the fixed header, which is positioned against the viewport and would
     * otherwise drift out of line with the content underneath it.
     */
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--scrollbar-lock', `${gap}px`);
    document.body.classList.add('is-scroll-locked');

    return () => {
      controller.abort();
      document.body.classList.remove('is-scroll-locked');
      document.documentElement.style.removeProperty('--scrollbar-lock');
    };
  }, [open]);

  function close() {
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
