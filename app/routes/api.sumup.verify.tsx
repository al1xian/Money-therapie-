import type {Route} from './+types/api.sumup.verify';
import {confirmSumUpPayment} from '~/lib/orderFulfillment.server';

/**
 * Called by the client right after the SumUp widget reports a client-side
 * "success", so the customer gets an immediate answer instead of waiting on
 * the asynchronous return_url callback. Always re-verifies against SumUp's
 * API server-side before completing the order — never trusts the client.
 */
export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return Response.json({error: 'Method not allowed'}, {status: 405});
  }

  const body = await request.json<{sumupCheckoutId?: string; draftOrderId?: string}>();

  if (!body.sumupCheckoutId || !body.draftOrderId) {
    return Response.json({error: 'Missing sumupCheckoutId or draftOrderId'}, {status: 400});
  }

  try {
    const result = await confirmSumUpPayment(context.env, {
      sumupCheckoutId: body.sumupCheckoutId,
      draftOrderId: body.draftOrderId,
    });
    return Response.json(result);
  } catch (error) {
    console.error('SumUp verify failed', error);
    return Response.json({error: 'Verification failed'}, {status: 500});
  }
}
