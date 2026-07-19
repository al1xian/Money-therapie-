import {Form, useActionData, useNavigation} from 'react-router';
import type {Route} from './+types/contact';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Money Therapy | Contact'}];
};

type ActionData = {ok: boolean; error?: string};

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const message = String(formData.get('message') || '').trim();

  if (!name || !email || !message) {
    return {ok: false, error: 'Merci de compléter tous les champs.'} satisfies ActionData;
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

    const response = await fetch(`https://${shopDomain}/contact`, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Shopify contact form responded ${response.status}`);
    }

    return {ok: true} satisfies ActionData;
  } catch (error) {
    console.error('Contact form submission failed', error);
    return {
      ok: false,
      error: "L'envoi a échoué. Réessayez ou écrivez-nous directement par e-mail.",
    } satisfies ActionData;
  }
}

export default function Contact() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="info-page">
      <h1>Contact</h1>
      <p className="info-page__intro">
        Une question sur une commande, un produit ou une collaboration ? Écrivez-nous.
      </p>

      {actionData?.ok ? (
        <p className="form-success" role="status">
          Merci, votre message a bien été envoyé. Nous vous répondons au plus vite.
        </p>
      ) : (
        <Form method="post" className="contact-form" replace>
          <label htmlFor="contact-name">Nom</label>
          <input id="contact-name" name="name" type="text" required autoComplete="name" />

          <label htmlFor="contact-email">E-mail</label>
          <input id="contact-email" name="email" type="email" required autoComplete="email" />

          <label htmlFor="contact-message">Message</label>
          <textarea id="contact-message" name="message" rows={6} required />

          {actionData?.error && (
            <p className="form-error" role="alert">
              {actionData.error}
            </p>
          )}

          <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
            {isSubmitting ? 'Envoi…' : 'Envoyer'}
          </button>
        </Form>
      )}
    </div>
  );
}
