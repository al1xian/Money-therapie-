import {useState} from 'react';
import {useT} from '~/lib/i18n';

/**
 * Newsletter sign-up. Posts to the Shopify customer form endpoint (the same
 * one the native theme uses) so no extra backend is required. Falls back to
 * a friendly message if the request fails.
 */
export function Newsletter() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const t = useT();

  async function submit(form: HTMLFormElement) {
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
    if (!email) return;

    setStatus('loading');
    try {
      const body = new URLSearchParams({
        form_type: 'customer',
        utf8: '✓',
        'contact[email]': email,
        // Tagged as coming from the footer so the two sign-up points can be
        // told apart in the store's customer list.
        source: 'footer',
      });
      const res = await fetch('/newsletter', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: body.toString(),
      });
      setStatus(res.ok ? 'done' : 'error');
      if (res.ok) form.reset();
    } catch {
      setStatus('error');
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(event.currentTarget);
  }

  return (
    <div className="newsletter">
      <p>{t('news.pitch1')}</p>
      <p>{t('news.pitch2')}</p>

      {status === 'done' ? (
        <p className="newsletter__success">{t('news.thanks')}</p>
      ) : (
        <form className="newsletter__form" onSubmit={onSubmit}>
          <input
            type="text"
            name="firstName"
            placeholder={t('news.firstName')}
            autoComplete="given-name"
            aria-label={t('news.firstNameLabel')}
          />
          <input
            type="email"
            name="email"
            placeholder={t('news.placeholder')}
            required
            autoComplete="email"
            aria-label={t('news.emailLabel')}
          />
          <button type="submit" className="btn" disabled={status === 'loading'}>
            {status === 'loading' ? '…' : t('news.subscribe')}
          </button>
          {status === 'error' && (
            <p className="form-error" role="alert" style={{width: '100%'}}>
              {t('news.error')}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
