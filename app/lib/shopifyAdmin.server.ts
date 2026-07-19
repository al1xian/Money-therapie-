/**
 * Server-only Shopify Admin API client (GraphQL). Requires a custom app
 * access token — see the setup checklist shared with the merchant.
 * Never import this file from anything that runs in the browser.
 */

const ADMIN_API_VERSION = '2026-04';

async function adminFetch<T>(env: Env, query: string, variables: Record<string, unknown>): Promise<T> {
  const response = await fetch(
    `https://${env.PUBLIC_STORE_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_API_ACCESS_TOKEN,
      },
      body: JSON.stringify({query, variables}),
    },
  );

  const json = (await response.json()) as {data: T; errors?: unknown};

  if (!response.ok || json.errors) {
    throw new Error(`Shopify Admin API error: ${JSON.stringify(json.errors ?? response.statusText)}`);
  }

  return json.data;
}

export type DraftOrderLine = {
  variantId: string;
  quantity: number;
};

const VARIANTS_QUERY = `#graphql
  query VerifyVariants($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        availableForSale
        inventoryQuantity
        price
        product {
          title
          status
        }
      }
    }
  }
`;

export type VariantCheck = {
  variantId: string;
  requestedQuantity: number;
  ok: boolean;
  reason?: string;
  productTitle?: string;
  unitPrice?: string;
};

/**
 * Re-reads price, stock and availability directly from Shopify for every
 * requested line, server-side, right before a draft order is created.
 * Never trust a price or "in stock" flag coming from the client/cart.
 */
export async function verifyVariantsAvailability(
  env: Env,
  lines: DraftOrderLine[],
): Promise<VariantCheck[]> {
  const data = await adminFetch<{
    nodes: Array<{
      id: string;
      availableForSale: boolean;
      inventoryQuantity: number | null;
      price: string;
      product: {title: string; status: string};
    } | null>;
  }>(env, VARIANTS_QUERY, {ids: lines.map((l) => l.variantId)});

  return lines.map((line, index) => {
    const variant = data.nodes[index];

    if (!variant) {
      return {variantId: line.variantId, requestedQuantity: line.quantity, ok: false, reason: 'Produit introuvable.'};
    }

    if (variant.product.status !== 'ACTIVE' || !variant.availableForSale) {
      return {
        variantId: line.variantId,
        requestedQuantity: line.quantity,
        ok: false,
        reason: `${variant.product.title} n'est plus disponible.`,
        productTitle: variant.product.title,
      };
    }

    if (
      variant.inventoryQuantity !== null &&
      variant.inventoryQuantity >= 0 &&
      variant.inventoryQuantity < line.quantity
    ) {
      return {
        variantId: line.variantId,
        requestedQuantity: line.quantity,
        ok: false,
        reason: `Stock insuffisant pour ${variant.product.title} (${variant.inventoryQuantity} disponible${variant.inventoryQuantity > 1 ? 's' : ''}).`,
        productTitle: variant.product.title,
      };
    }

    return {
      variantId: line.variantId,
      requestedQuantity: line.quantity,
      ok: true,
      productTitle: variant.product.title,
      unitPrice: variant.price,
    };
  });
}

export type ShippingAddressInput = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
  countryCode: string;
  phone?: string;
};

const DRAFT_ORDER_CREATE_MUTATION = `#graphql
  mutation DraftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        name
        totalPrice
        currencyCode
        invoiceUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function createDraftOrder(
  env: Env,
  params: {
    email: string;
    lines: DraftOrderLine[];
    shippingAddress: ShippingAddressInput;
    note?: string;
  },
) {
  const data = await adminFetch<{
    draftOrderCreate: {
      draftOrder: {
        id: string;
        name: string;
        totalPrice: string;
        currencyCode: string;
        invoiceUrl: string;
      } | null;
      userErrors: Array<{field: string[]; message: string}>;
    };
  }>(env, DRAFT_ORDER_CREATE_MUTATION, {
    input: {
      email: params.email,
      note: params.note,
      tags: ['sumup-pending'],
      lineItems: params.lines.map((line) => ({
        variantId: line.variantId,
        quantity: line.quantity,
      })),
      customAttributes: [{key: 'payment_provider', value: 'sumup'}],
      shippingAddress: {
        firstName: params.shippingAddress.firstName,
        lastName: params.shippingAddress.lastName,
        address1: params.shippingAddress.address1,
        address2: params.shippingAddress.address2,
        city: params.shippingAddress.city,
        zip: params.shippingAddress.zip,
        countryCode: params.shippingAddress.countryCode,
        phone: params.shippingAddress.phone,
      },
    },
  });

  if (data.draftOrderCreate.userErrors.length > 0) {
    throw new Error(
      `Draft order creation failed: ${data.draftOrderCreate.userErrors.map((e) => e.message).join(', ')}`,
    );
  }

  if (!data.draftOrderCreate.draftOrder) {
    throw new Error('Draft order creation returned no draft order');
  }

  return data.draftOrderCreate.draftOrder;
}

const DRAFT_ORDER_UPDATE_REFERENCE_MUTATION = `#graphql
  mutation DraftOrderAttachSumUpCheckout($id: ID!, $checkoutId: String!) {
    draftOrderUpdate(
      id: $id
      input: {
        customAttributes: [
          {key: "payment_provider", value: "sumup"}
          {key: "sumup_checkout_id", value: $checkoutId}
        ]
      }
    ) {
      draftOrder {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/** Stores the SumUp checkoutId on the draft order for traceability/support. */
export async function attachSumUpCheckoutReference(
  env: Env,
  draftOrderId: string,
  sumupCheckoutId: string,
) {
  await adminFetch(env, DRAFT_ORDER_UPDATE_REFERENCE_MUTATION, {
    id: draftOrderId,
    checkoutId: sumupCheckoutId,
  });
}

const DRAFT_ORDER_COMPLETE_MUTATION = `#graphql
  mutation DraftOrderComplete($id: ID!) {
    draftOrderComplete(id: $id, paymentPending: false) {
      draftOrder {
        id
        order {
          id
          name
          confirmationNumber
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function completeDraftOrder(env: Env, draftOrderId: string) {
  const data = await adminFetch<{
    draftOrderComplete: {
      draftOrder: {
        id: string;
        order: {id: string; name: string; confirmationNumber: string} | null;
      } | null;
      userErrors: Array<{field: string[]; message: string}>;
    };
  }>(env, DRAFT_ORDER_COMPLETE_MUTATION, {id: draftOrderId});

  if (data.draftOrderComplete.userErrors.length > 0) {
    const messages = data.draftOrderComplete.userErrors.map((e) => e.message).join(', ');

    // Idempotency: two near-simultaneous confirmations (the client-side
    // verify call and SumUp's return_url callback) can both try to complete
    // the same draft order. Shopify rejects the second attempt — treat that
    // as success and return the order that already exists instead of
    // throwing, rather than risk the customer seeing a false failure.
    const alreadyCompleted = /already been completed|already completed|already converted/i.test(messages);
    if (alreadyCompleted) {
      const existing = await getDraftOrder(env, draftOrderId);
      if (existing?.order) {
        return {id: existing.id, order: existing.order};
      }
    }

    throw new Error(`Draft order completion failed: ${messages}`);
  }

  return data.draftOrderComplete.draftOrder;
}

const DRAFT_ORDER_QUERY = `#graphql
  query DraftOrder($id: ID!) {
    draftOrder(id: $id) {
      id
      name
      status
      totalPrice
      currencyCode
      order {
        id
        name
        confirmationNumber
      }
    }
  }
`;

export async function getDraftOrder(env: Env, draftOrderId: string) {
  const data = await adminFetch<{
    draftOrder: {
      id: string;
      name: string;
      status: string;
      totalPrice: string;
      currencyCode: string;
      order: {id: string; name: string; confirmationNumber: string} | null;
    } | null;
  }>(env, DRAFT_ORDER_QUERY, {id: draftOrderId});

  return data.draftOrder;
}
