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
    throw new Error(
      `Draft order completion failed: ${data.draftOrderComplete.userErrors.map((e) => e.message).join(', ')}`,
    );
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
