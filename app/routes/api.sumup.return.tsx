import type {Route} from './+types/api.sumup.return';
import {confirmSumUpPayment} from '~/lib/orderFulfillment.server';

/**
 * The `return_url` passed when creating each SumUp checkout. SumUp calls
 * this server-to-server when the checkout's status changes.
 *
 * The payload is only ever used to find *which* checkout id to look up —
 * its "status" field (if any) is never trusted. The real status is always
 * re-fetched from SumUp's API (confirmSumUpPayment -> getSumUpCheckout)
 * with SUMUP_API_KEY before any order is completed. This is the official
 * pattern for this integration: authenticity comes from re-querying SumUp's
 * API, not from a webhook secret.
 */
export async function action({request, context}: Route.ActionArgs) {
  const url = new URL(request.url);
  const draftOrderId = url.searchParams.get('draftOrderId');
  const rawBody = await request.text();

  if (!draftOrderId) {
    return new Response('Missing draftOrderId', {status: 400});
  }

  let payload: {id?: string; checkout_id?: string; checkoutId?: string} = {};
  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    // Some SumUp integrations redirect the browser here with query params
    // instead of posting JSON — fall back to the query string.
    payload = {id: url.searchParams.get('id') ?? undefined};
  }

  const sumupCheckoutId = payload.id || payload.checkout_id || payload.checkoutId;

  if (!sumupCheckoutId) {
    return new Response('Missing checkout id', {status: 400});
  }

  try {
    await confirmSumUpPayment(context.env, {sumupCheckoutId, draftOrderId});
  } catch (error) {
    console.error('SumUp return callback failed', error);
    // Still return 2xx so SumUp doesn't hammer retries for a bug on our
    // side while the pending draft order remains visible in Shopify Admin.
  }

  return new Response(null, {status: 200});
}

export async function loader({request}: Route.LoaderArgs) {
  // Browsers redirected here after leaving the widget land on a GET; send
  // them somewhere sensible instead of a raw 405.
  return Response.redirect(new URL('/', request.url).toString(), 302);
}
