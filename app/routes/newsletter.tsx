import type {Route} from './+types/newsletter';

/** Sign-up points allowed to tag themselves, so the tag stays a closed set. */
const SOURCES = new Set(['popup', 'footer']);

/**
 * Resource route: forwards a newsletter sign-up to the Shopify store's
 * native customer form endpoint, server-side. Keeps the storefront free of
 * any third-party email integration. Returns a small JSON status; the
 * client component only cares whether it was accepted.
 *
 * Every address ends up in Shopify Admin → Clients, tagged `newsletter` plus
 * its origin (`newsletter-popup` / `newsletter-footer`). That customer list
 * is where the collected e-mails live; how to read, filter and export it is
 * written up in docs/emails-newsletter.md.
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

  // The source is supplied by the browser, so it is matched against a fixed
  // list instead of being written into the customer record as-is.
  const source = String(incoming.get('source') || '').trim();
  const tags = SOURCES.has(source)
    ? `newsletter, newsletter-${source}`
    : 'newsletter';

  const shopDomain = context.env.PUBLIC_STORE_DOMAIN;
  try {
    const body = new URLSearchParams({
      form_type: 'customer',
      utf8: '✓',
      'contact[email]': email,
      'contact[tags]': tags,
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
