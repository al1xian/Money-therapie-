import type {Route} from './+types/api.sumup.verify';
import {confirmSumUpPayment} from '~/lib/orderFulfillment.server';
import {newRequestId} from '~/lib/checkoutErrors.server';

/**
 * Called by the client right after the SumUp widget reports a client-side
 * "success", so the customer gets an immediate answer instead of waiting on
 * the asynchronous return_url callback. Always re-verifies against SumUp's
 * API server-side before completing the order — never trusts the client.
 */
export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return Response.json({status: 'ERROR', error: 'Method not allowed', requestId: newRequestId()}, {status: 405});
  }

  let body: {sumupCheckoutId?: string; draftOrderId?: string};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json(
      {status: 'ERROR', error: 'Requête invalide.', requestId: newRequestId()},
      {status: 400},
    );
  }

  if (!body.sumupCheckoutId || !body.draftOrderId) {
    return Response.json(
      {status: 'ERROR', error: 'Missing sumupCheckoutId or draftOrderId', requestId: newRequestId()},
      {status: 400},
    );
  }

  // confirmSumUpPayment already catches and logs its own failures, returning
  // a typed {status: 'ERROR', ...} result — this try/catch is only a safety
  // net against a truly unexpected throw.
  try {
    const result = await confirmSumUpPayment(context.env, {
      sumupCheckoutId: body.sumupCheckoutId,
      draftOrderId: body.draftOrderId,
    });
    return Response.json(result);
  } catch (error) {
    const requestId = newRequestId();
    console.error(`[checkout:sumup_checkout_verify] requestId=${requestId} unexpected error=${error instanceof Error ? error.message : String(error)}`);
    return Response.json(
      {status: 'ERROR', error: 'Paiement reçu, mais confirmation Shopify impossible.', requestId},
      {status: 500},
    );
  }
}
