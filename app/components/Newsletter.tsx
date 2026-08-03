import {useState} from 'react';

/**
 * Newsletter sign-up. Posts to the Shopify customer form endpoint (the same
 * one the native theme uses) so no extra backend is required. Falls back to
 * a friendly message if the request fails.
 */
export function Newsletter() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

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
      <p>sign up for early access to new drops.</p>
      <p>−10% off your first order.</p>

      {status === 'done' ? (
        <p className="newsletter__success">thank you &mdash; you&rsquo;re in.</p>
      ) : (
        <form className="newsletter__form" onSubmit={onSubmit}>
          <input
            type="text"
            name="firstName"
            placeholder="first name (optional)"
            autoComplete="given-name"
            aria-label="first name"
          />
          <input
            type="email"
            name="email"
            placeholder="email"
            required
            autoComplete="email"
            aria-label="email"
          />
          <button type="submit" className="btn" disabled={status === 'loading'}>
            {status === 'loading' ? '…' : 'sign up'}
          </button>
          {status === 'error' && (
            <p className="form-error" role="alert" style={{width: '100%'}}>
              something went wrong, please try again.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
