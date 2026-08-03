import {Form, useActionData, useNavigation} from 'react-router';
import type {Route} from './+types/contact';

export const meta: Route.MetaFunction = () => {
  return [{title: 'reda studio | contact'}];
};

type ActionData = {ok: boolean; error?: string};

export async function action({request, context}: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const message = String(formData.get('message') || '').trim();

  if (!name || !email || !message) {
    return {ok: false, error: 'please fill in every field.'};
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
    return {ok: false, error: 'sending failed, please try again later.'};
  }
}

export default function Contact() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submitting = navigation.state === 'submitting';

  return (
    <div className="page">
      <h1>contact</h1>
      <p>a question about an order, a piece or a collaboration? write to us.</p>

      {actionData?.ok ? (
        <p className="form-success" role="status">
          thank you — your message has been sent.
        </p>
      ) : (
        <Form method="post" className="contact-form" replace>
          <label htmlFor="name">name</label>
          <input id="name" name="name" type="text" required autoComplete="name" />

          <label htmlFor="email">email</label>
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
            {submitting ? 'sending…' : 'send'}
          </button>
        </Form>
      )}
    </div>
  );
}
