/**
 * Plain, isomorphic (client + server safe) step identifiers and their
 * French user-facing messages. Deliberately NOT a `.server.ts` file: the
 * checkout confirmation page needs these in its client-rendered component,
 * and nothing here is sensitive.
 */

export type CheckoutStep =
  | 'cart_read'
  | 'stock_check'
  | 'draft_order_create'
  | 'sumup_checkout_create'
  | 'sumup_checkout_verify'
  | 'shopify_order_complete';

export const STEP_PUBLIC_MESSAGES: Record<CheckoutStep, string> = {
  cart_read: 'Impossible de vérifier le panier Shopify.',
  stock_check: 'Impossible de vérifier le panier Shopify.',
  draft_order_create: 'Impossible de créer le brouillon de commande.',
  sumup_checkout_create: 'SumUp a refusé la création du paiement.',
  sumup_checkout_verify: 'Paiement reçu, mais confirmation Shopify impossible.',
  shopify_order_complete: 'Paiement reçu, mais confirmation Shopify impossible.',
};
