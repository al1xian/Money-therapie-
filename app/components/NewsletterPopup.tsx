import {useEffect, useState} from 'react';
import {CloseIcon} from '~/components/Icons';

const STORAGE_KEY = 'reda-studio-newsletter-subscribed';
const PROMO_CODE = 'REDA10';
const OPEN_DELAY_MS = 1200;

/**
 * Welcome pop-up offering -10% in exchange for an email address.
 *
 * Shown at every visit *until the visitor actually subscribes*. The
 * localStorage flag is written only on a successful submission, never on a
 * simple close — someone who dismisses it still sees the offer next time,
 * while a subscriber is never asked again.
 *
 * Posts through the same real /newsletter endpoint as the footer sign-up
 * (Shopify's own customer form), so every address lands in the store's
 * customer list — see docs/emails-newsletter.md. The promo code only appears
 * once that submission actually succeeds.
 */
export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    document.addEventListener('keydown', (event) => event.key === 'Escape' && close(), {signal: controller.signal});
    document.body.style.overflow = 'hidden';
    return () => {
      controller.abort();
      document.body.style.overflow = '';
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
      // Only a real subscription silences the pop-up for good.
      if (res.ok) window.localStorage.setItem(STORAGE_KEY, '1');
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
