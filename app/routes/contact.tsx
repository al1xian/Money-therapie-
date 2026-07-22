import {Form, useActionData, useNavigation} from 'react-router';
import type {Route} from './+types/contact';

export const meta: Route.MetaFunction = () => {
  return [{title: 'money therapy | contact'}];
};

type ActionData = {ok: boolean; error?: string};

export async function action({request, context}: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const message = String(formData.get('message') || '').trim();

  if (!name || !email || !message) {
    return {ok: false, error: 'merci de compléter tous les champs.'};
  }

  const shopDomain = context.env.PUBLIC_STORE_DOMAIN;
  try {
    const body = new URLSearchParams({
      form_type: 'contact',
      utf8: '✓',
      'contact[name]': name,
      'contact[email]': email,
      'contact[body]': message,
    });
    const res = await fetch(`https://${shopDomain}/contact`, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: body.toString(),
    });
    if (res.status >= 500) throw new Error(`status ${res.status}`);
    return {ok: true};
  } catch (error) {
    console.error('Contact form failed', error);
    return {ok: false, error: "l'envoi a échoué, réessayez plus tard."};
  }
}

export default function Contact() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submitting = navigation.state === 'submitting';

  return (
    <div className="page">
      <h1>contact</h1>
      <p>une question sur une commande, un produit ou une collaboration ? écrivez-nous.</p>

      {actionData?.ok ? (
        <p className="form-success" role="status">
          merci, votre message a bien été envoyé.
        </p>
      ) : (
        <Form method="post" className="contact-form" replace>
          <label htmlFor="name">nom</label>
          <input id="name" name="name" type="text" required autoComplete="name" />

          <label htmlFor="email">e-mail</label>
          <input id="email" name="email" type="email" required autoComplete="email" />

          <label htmlFor="message">message</label>
          <textarea id="message" name="message" rows={5} required />

          {actionData?.error && (
            <p className="form-error" role="alert">
              {actionData.error}
            </p>
          )}

          <br />
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'envoi…' : 'envoyer'}
          </button>
        </Form>
      )}
    </div>
  );
}
