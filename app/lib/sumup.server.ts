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

import {CheckoutStepError, sanitizeUpstreamError, type CheckoutStep} from '~/lib/checkoutErrors.server';

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

function assertSumUpEnv(env: Env, step: CheckoutStep) {
  if (!env.SUMUP_API_KEY) {
    throw new CheckoutStepError(step, 'SUMUP_API_KEY is not set.');
  }
  if (!env.SUMUP_MERCHANT_CODE) {
    throw new CheckoutStepError(step, 'SUMUP_MERCHANT_CODE is not set.');
  }
}

async function sumupFetch(
  url: string,
  init: RequestInit,
  step: CheckoutStep,
): Promise<SumUpCheckout> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (networkError) {
    throw new CheckoutStepError(
      step,
      `Network error calling SumUp API: ${networkError instanceof Error ? networkError.message : String(networkError)}`,
    );
  }

  const rawText = await response.text();

  if (response.status === 401 || response.status === 403) {
    throw new CheckoutStepError(
      step,
      'SumUp rejected the request as unauthorized (401/403) — SUMUP_API_KEY is missing, invalid, revoked, or does not belong to the same account as SUMUP_MERCHANT_CODE.',
      {httpStatus: response.status},
    );
  }

  if (!response.ok) {
    throw new CheckoutStepError(step, `SumUp API error: ${sanitizeUpstreamError(rawText)}`, {
      httpStatus: response.status,
    });
  }

  try {
    return JSON.parse(rawText) as SumUpCheckout;
  } catch {
    throw new CheckoutStepError(
      step,
      `SumUp API returned a non-JSON response: ${sanitizeUpstreamError(rawText)}`,
      {httpStatus: response.status},
    );
  }
}

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
  assertSumUpEnv(env, 'sumup_checkout_create');

  if (!Number.isFinite(params.amount) || params.amount <= 0) {
    throw new CheckoutStepError(
      'sumup_checkout_create',
      `Computed amount is invalid (${params.amount}) — refusing to create a SumUp checkout for it.`,
    );
  }

  return sumupFetch(
    `${SUMUP_API_BASE}/v0.1/checkouts`,
    {
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
    },
    'sumup_checkout_create',
  );
}

export async function getSumUpCheckout(env: Env, checkoutId: string): Promise<SumUpCheckout> {
  assertSumUpEnv(env, 'sumup_checkout_verify');

  return sumupFetch(
    `${SUMUP_API_BASE}/v0.1/checkouts/${checkoutId}`,
    {headers: {Authorization: `Bearer ${env.SUMUP_API_KEY}`}},
    'sumup_checkout_verify',
  );
}
