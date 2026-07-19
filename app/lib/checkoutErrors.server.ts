/**
 * Structured, step-labelled errors for the checkout/payment flow, so a
 * failure can be pinpointed to an exact step instead of a generic
 * "something went wrong". Logged server-side (visible in Oxygen logs) with
 * a short requestId that can be quoted back for support — never logs or
 * returns a token, API key, or card data.
 */

import type {CheckoutStep} from '~/lib/checkoutMessages';

export type {CheckoutStep} from '~/lib/checkoutMessages';
export {STEP_PUBLIC_MESSAGES} from '~/lib/checkoutMessages';

export class CheckoutStepError extends Error {
  step: CheckoutStep;
  httpStatus?: number;
  requestId: string;

  constructor(step: CheckoutStep, message: string, opts?: {httpStatus?: number; requestId?: string}) {
    super(message);
    this.name = 'CheckoutStepError';
    this.step = step;
    this.httpStatus = opts?.httpStatus;
    this.requestId = opts?.requestId ?? newRequestId();
  }
}

export function newRequestId(): string {
  return crypto.randomUUID().slice(0, 8);
}

/**
 * Strips anything that looks like a token/key/authorization header from
 * upstream error text before it's logged or ever returned to a client, and
 * caps the length so a huge HTML error page doesn't flood the logs.
 */
export function sanitizeUpstreamError(text: string): string {
  return text
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]')
    .replace(/"access_token"\s*:\s*"[^"]*"/gi, '"access_token":"[redacted]"')
    .replace(/X-Shopify-Access-Token:\s*\S+/gi, 'X-Shopify-Access-Token: [redacted]')
    .replace(/sup_sk_[A-Za-z0-9]+/g, 'sup_sk_[redacted]')
    .replace(/shpat_[A-Za-z0-9]+/g, 'shpat_[redacted]')
    .slice(0, 500);
}

/** Logs a step failure server-side with enough context to debug, nothing sensitive. */
export function logCheckoutStepFailure(error: CheckoutStepError, extra?: Record<string, unknown>) {
  console.error(
    `[checkout:${error.step}] requestId=${error.requestId}` +
      (error.httpStatus ? ` httpStatus=${error.httpStatus}` : '') +
      ` message=${sanitizeUpstreamError(error.message)}` +
      (extra ? ` extra=${JSON.stringify(extra)}` : ''),
  );
}
