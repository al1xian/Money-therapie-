import {getSumUpCheckout} from '~/lib/sumup.server';
import {completeDraftOrder, getDraftOrder} from '~/lib/shopifyAdmin.server';
import {CheckoutStepError, STEP_PUBLIC_MESSAGES, logCheckoutStepFailure, newRequestId} from '~/lib/checkoutErrors.server';

export type ConfirmResult =
  | {status: 'PAID'; order: {id: string; name: string; confirmationNumber: string}}
  | {status: 'PENDING' | 'FAILED' | 'EXPIRED'}
  | {status: 'ERROR'; error: string; requestId: string};

/**
 * Authoritative confirmation step: re-fetches the checkout status directly
 * from SumUp's API (never trusts a webhook/callback body on its own), then
 * completes the matching Shopify draft order exactly once. Safe to call
 * more than once for the same checkout — completing an already-completed
 * draft order is a no-op that returns the existing order.
 */
export async function confirmSumUpPayment(
  env: Env,
  params: {sumupCheckoutId: string; draftOrderId: string},
): Promise<ConfirmResult> {
  let checkout;
  try {
    checkout = await getSumUpCheckout(env, params.sumupCheckoutId);
  } catch (error) {
    return handleFailure(error, 'sumup_checkout_verify', params);
  }

  if (checkout.status !== 'PAID') {
    return {status: checkout.status === 'EXPIRED' ? 'EXPIRED' : checkout.status === 'FAILED' ? 'FAILED' : 'PENDING'};
  }

  try {
    const existing = await getDraftOrder(env, params.draftOrderId);

    if (existing?.order) {
      return {status: 'PAID', order: existing.order};
    }

    const completed = await completeDraftOrder(env, params.draftOrderId);

    if (!completed?.order) {
      // Payment succeeded but order completion returned no order — surface
      // as pending so the merchant can investigate rather than telling the
      // customer their payment failed (it didn't: SumUp already has it).
      return {status: 'PENDING'};
    }

    return {status: 'PAID', order: completed.order};
  } catch (error) {
    return handleFailure(error, 'shopify_order_complete', params);
  }
}

function handleFailure(
  error: unknown,
  fallbackStep: 'sumup_checkout_verify' | 'shopify_order_complete',
  params: {sumupCheckoutId: string; draftOrderId: string},
): ConfirmResult {
  if (error instanceof CheckoutStepError) {
    logCheckoutStepFailure(error, params);
    return {status: 'ERROR', error: STEP_PUBLIC_MESSAGES[error.step], requestId: error.requestId};
  }

  const requestId = newRequestId();
  console.error(
    `[checkout:${fallbackStep}] requestId=${requestId} draftOrderId=${params.draftOrderId} sumupCheckoutId=${params.sumupCheckoutId} unexpected error=${error instanceof Error ? error.message : String(error)}`,
  );
  return {status: 'ERROR', error: STEP_PUBLIC_MESSAGES[fallbackStep], requestId};
}
