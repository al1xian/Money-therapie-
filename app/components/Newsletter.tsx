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
        'contact[tags]': 'newsletter',
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
      <p>inscrivez-vous pour un accès exclusif aux nouveautés.</p>
      <p>−10 % sur votre première commande.</p>

      {status === 'done' ? (
        <p className="newsletter__success">merci, c&rsquo;est noté.</p>
      ) : (
        <form className="newsletter__form" onSubmit={onSubmit}>
          <input
            type="text"
            name="firstName"
            placeholder="prénom (optionnel)"
            autoComplete="given-name"
            aria-label="prénom"
          />
          <input
            type="email"
            name="email"
            placeholder="e-mail"
            required
            autoComplete="email"
            aria-label="e-mail"
          />
          <button type="submit" className="btn" disabled={status === 'loading'}>
            {status === 'loading' ? '…' : "s'inscrire"}
          </button>
          {status === 'error' && (
            <p className="form-error" role="alert" style={{width: '100%'}}>
              une erreur est survenue, réessayez.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
