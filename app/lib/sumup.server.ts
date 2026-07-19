/**
 * Server-only SumUp Checkout API client.
 *
 * Endpoint shapes here are reconstructed from SumUp's public examples repo
 * (github.com/sumup/sumup-checkout-examples) and the developer.sumup.com
 * search index, since this sandbox cannot reach developer.sumup.com directly
 * to read the full reference docs. Test thoroughly in SumUp's sandbox mode
 * before going live, and cross-check against developer.sumup.com if a call
 * errors — the request/response shape may need small adjustments.
 */

const SUMUP_API_BASE = 'https://api.sumup.com';

export type SumUpCheckout = {
  id: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
  amount: number;
  currency: string;
  checkout_reference: string;
  transaction_id?: string;
  transactions?: Array<{id: string; status: string; transaction_code?: string}>;
};

export async function createSumUpCheckout(
  env: Env,
  params: {
    amount: number;
    currency: string;
    checkoutReference: string;
    description: string;
    returnUrl: string;
  },
): Promise<SumUpCheckout> {
  const response = await fetch(`${SUMUP_API_BASE}/v0.1/checkouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.SUMUP_API_KEY}`,
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      merchant_code: env.SUMUP_MERCHANT_CODE,
      checkout_reference: params.checkoutReference,
      description: params.description,
      return_url: params.returnUrl,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`SumUp checkout creation failed (${response.status}): ${text}`);
  }

  return (await response.json()) as SumUpCheckout;
}

export async function getSumUpCheckout(env: Env, checkoutId: string): Promise<SumUpCheckout> {
  const response = await fetch(`${SUMUP_API_BASE}/v0.1/checkouts/${checkoutId}`, {
    headers: {
      Authorization: `Bearer ${env.SUMUP_API_KEY}`,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`SumUp checkout lookup failed (${response.status}): ${text}`);
  }

  return (await response.json()) as SumUpCheckout;
}
