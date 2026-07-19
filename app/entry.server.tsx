import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {
  createContentSecurityPolicy,
  type HydrogenRouterContextProvider,
} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    // Allow the SumUp Payment Widget: its SDK script, the iframe it mounts
    // for card entry / 3-D Secure, the XHR calls it makes to tokenize card
    // details directly with SumUp (never through our server), and any
    // images/styles it injects into our page (card brand icons, etc.).
    //
    // `scriptSrc`, `frameSrc` and `imgSrc` have no Hydrogen default to merge
    // onto (only `connectSrc` and `styleSrc` do), so the defaults are
    // repeated here explicitly — passing just the SumUp domain would
    // otherwise silently drop 'self' / cdn.shopify.com and break the app's
    // own hydration scripts and product images.
    //
    // Known limitation: a 3-D Secure challenge can embed an iframe served
    // directly by the customer's *issuing bank* (its ACS domain), which is
    // different for every bank and cannot be enumerated in advance. If a
    // real 3DS challenge is blocked by this frameSrc list in testing, that's
    // the likely cause — SumUp's gateway is expected to proxy this through
    // gateway.sumup.com, but that isn't independently confirmed here.
    scriptSrc: ["'self'", 'https://cdn.shopify.com', 'https://shopify.com', 'https://gateway.sumup.com'],
    connectSrc: ['https://gateway.sumup.com', 'https://api.sumup.com'],
    frameSrc: ["'self'", 'https://gateway.sumup.com'],
    imgSrc: ["'self'", 'https://cdn.shopify.com', 'https://gateway.sumup.com', 'data:'],
    styleSrc: ['https://gateway.sumup.com'],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);
  // Oxygen serves over HTTPS already; this instructs browsers to never
  // downgrade to plain HTTP for this origin, including subdomains.
  responseHeaders.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
