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
    <div className="popup-overlay" role="dialog" aria-modal aria-label="Offre de bienvenue">
      <button className="popup-overlay__close-outside" onClick={close} aria-label="Fermer" />
      <div className="popup">
        <button type="button" className="popup__close" onClick={close} aria-label="Fermer">
          <CloseIcon />
        </button>

        <div className="popup__media">
          <img
            src="/images/lookbook-casquette.webp"
            alt="Tenue reda studio : haut écru, jean flare délavé et casquette bleue"
            width="788"
            height="1200"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="popup__body">
          <h2>-10% sur ta 1ère commande</h2>

          {status === 'done' ? (
            <div className="popup__code">
              <p className="popup__code-label">ton code promo</p>
              <p className="popup__code-value">{PROMO_CODE}</p>
              <p className="popup__code-hint">valable sur ta prochaine commande.</p>
            </div>
          ) : (
            <>
              <p className="popup__text">
                laisse ton e-mail, ton code promo s&rsquo;affiche juste après. simple, rapide et sans spam.
              </p>
              <form className="popup__form" onSubmit={onSubmit}>
                <input
                  type="email"
                  name="email"
                  placeholder="adresse e-mail"
                  aria-label="adresse e-mail"
                  autoComplete="email"
                  required
                />
                <button type="submit" className="btn btn--full" disabled={status === 'loading'}>
                  {status === 'loading' ? '…' : 'obtenir mes -10% maintenant'}
                </button>
                {status === 'error' && (
                  <p className="form-error" role="alert">
                    une erreur est survenue, réessayez.
                  </p>
                )}
              </form>
              <p className="popup__fineprint">pas de spam. offres exclusives et ventes privées seulement.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
