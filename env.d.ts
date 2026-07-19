/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  interface Env {
    /** Secret SumUp API key — server-only, set in Oxygen environment variables. */
    SUMUP_API_KEY: string;
    /** SumUp merchant code (not secret, but env-configured for portability). */
    SUMUP_MERCHANT_CODE: string;
    /** Optional: enables HMAC signature verification on the SumUp return callback. */
    SUMUP_WEBHOOK_SECRET?: string;
    /** Secret Shopify Admin API access token — server-only, never exposed to the client. */
    SHOPIFY_ADMIN_API_ACCESS_TOKEN: string;
  }
}
