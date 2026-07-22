import type {Route} from './+types/newsletter';

/**
 * Resource route: forwards a newsletter sign-up to the Shopify store's
 * native customer form endpoint, server-side. Keeps the storefront free of
 * any third-party email integration. Returns a small JSON status; the
 * client component only cares whether it was accepted.
 */
export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return Response.json({ok: false}, {status: 405});
  }

  const incoming = await request.formData();
  const email = String(incoming.get('contact[email]') || '').trim();

  if (!email) {
    return Response.json({ok: false, error: 'email requis'}, {status: 400});
  }

  const shopDomain = context.env.PUBLIC_STORE_DOMAIN;
  try {
    const body = new URLSearchParams({
      form_type: 'customer',
      utf8: '✓',
      'contact[email]': email,
      'contact[tags]': 'newsletter',
    });
    const res = await fetch(`https://${shopDomain}/contact`, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: body.toString(),
    });
    // Shopify redirects (302) on success; treat any non-5xx as accepted.
    return Response.json({ok: res.status < 500}, {status: res.status < 500 ? 200 : 502});
  } catch (error) {
    console.error('Newsletter forward failed', error);
    return Response.json({ok: false}, {status: 502});
  }
}

// Visiting /newsletter directly is not meaningful — send them home.
export async function loader() {
  return Response.redirect('/', 302);
}
