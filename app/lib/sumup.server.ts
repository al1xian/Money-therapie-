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

/**
 * Verifies the `x-payload-signature` header SumUp sends on webhook/return
 * callbacks (HMAC-SHA256 of the raw body using the webhook secret), using
 * the Web Crypto API since Oxygen runs on a Workers-style runtime without
 * Node's `crypto` module.
 *
 * Per SumUp's own guidance, signature verification is defense in depth —
 * always re-fetch the checkout status from the API (getSumUpCheckout) before
 * trusting a callback, never act on the callback body alone.
 */
export async function verifySumUpSignature(
  rawBody: string,
  signatureHeader: string | null,
  webhookSecret: string | undefined,
): Promise<boolean> {
  if (!webhookSecret || !signatureHeader) {
    // No webhook secret configured: signature check is skipped, but the
    // caller must still re-verify status via getSumUpCheckout server-side.
    return true;
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(webhookSecret),
    {name: 'HMAC', hash: 'SHA-256'},
    false,
    ['sign'],
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
  const computed = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const provided = signatureHeader.replace(/^sha256=/, '').trim();

  if (computed.length !== provided.length) return false;
  let mismatch = 0;
  for (let i = 0; i < computed.length; i++) {
    mismatch |= computed.charCodeAt(i) ^ provided.charCodeAt(i);
  }
  return mismatch === 0;
}
