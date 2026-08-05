// NOTE: https://shopify.dev/docs/api/customer/latest/objects/Order
//
// Everything the tracking page shows, in one query: the order's identity, its
// fulfilment state, and — per shipment — the carrier, the tracking number, the
// dispatch date, the estimated delivery and the full event history.
//
// Searched by order name rather than by id, because an order number is what a
// customer actually has in front of them.
export const CUSTOMER_ORDER_TRACKING_QUERY = `#graphql
  fragment TrackedFulfillment on Fulfillment {
    id
    status
    createdAt
    estimatedDeliveryAt
    latestShipmentStatus
    trackingInformation {
      company
      number
      url
    }
    events(first: 25) {
      nodes {
        id
        status
        happenedAt
      }
    }
  }
  fragment TrackedOrder on Order {
    id
    name
    number
    email
    processedAt
    fulfillmentStatus
    statusPageUrl
    fulfillments(first: 5) {
      nodes {
        ...TrackedFulfillment
      }
    }
  }
  query CustomerOrderTracking($query: String, $language: LanguageCode)
    @inContext(language: $language) {
    customer {
      emailAddress {
        emailAddress
      }
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true, query: $query) {
        nodes {
          ...TrackedOrder
        }
      }
    }
  }
` as const;
