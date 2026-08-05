import {Form, Link, useActionData, useLoaderData, useNavigation} from 'react-router';
import type {Route} from './+types/order-tracking';
import type {TrackedOrderFragment} from 'customer-accountapi.generated';
import {CUSTOMER_ORDER_TRACKING_QUERY} from '~/graphql/customer-account/CustomerOrderTrackingQuery';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'reda studio | order tracking'},
    {
      name: 'description',
      content: 'Track your reda studio order — status, carrier and delivery estimate.',
    },
  ];
};

/** What the page renders once a lookup has run. */
type Shipment = {
  status: string;
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  estimatedDeliveryAt: string | null;
  history: Array<{id: string; status: string; happenedAt: string}>;
};

type TrackingResult = {
  orderName: string;
  placedAt: string | null;
  fulfillmentStatus: string;
  statusPageUrl: string | null;
  shipments: Shipment[];
};

type ActionResult =
  | {state: 'found'; tracking: TrackingResult}
  | {state: 'not-found'; message: string}
  | {state: 'needs-login'; orderNumber: string; email: string};

export async function loader({context}: Route.LoaderArgs) {
  const loggedIn = await context.customerAccount.isLoggedIn();
  return {loggedIn};
}

/**
 * Order lookup.
 *
 * Shopify does not expose order data to an unauthenticated caller, and that is
 * the right call: an order number plus a guessed email would otherwise let
 * anyone enumerate other people's addresses and purchase history. So the
 * lookup runs against the Customer Account API, and an unidentified visitor is
 * sent through Shopify's own email verification first — which is a one-time
 * code sent to the address they just typed, not a password to remember.
 *
 * The email field is not decoration: once the order is found, it is checked
 * against the address on the order itself.
 */
export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const rawNumber = String(formData.get('orderNumber') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();

  if (!rawNumber || !email) {
    return {
      state: 'not-found',
      message: 'Please give both your order number and the email you ordered with.',
    } satisfies ActionResult;
  }

  // "#1024", "1024" and " 1024 " are the same order to a customer.
  const orderNumber = rawNumber.replace(/^#/, '');

  if (!(await context.customerAccount.isLoggedIn())) {
    return {state: 'needs-login', orderNumber, email} satisfies ActionResult;
  }

  const {data} = await context.customerAccount.query(
    CUSTOMER_ORDER_TRACKING_QUERY,
    {
      variables: {
        query: `name:#${orderNumber}`,
        language: context.customerAccount.i18n.language,
      },
    },
  );

  const orders = data?.customer?.orders?.nodes ?? [];
  const order = orders.find(
    (candidate) => candidate.name.replace(/^#/, '') === orderNumber,
  );

  if (!order) {
    return {
      state: 'not-found',
      message: `We couldn't find order #${orderNumber} on this account. Check the number, or sign in with the account the order was placed on.`,
    } satisfies ActionResult;
  }

  // The address on the order is what has to match — not the account's, which
  // could differ if the order was placed as a guest and later claimed.
  const orderEmail = order.email?.toLowerCase() ?? null;
  if (orderEmail && orderEmail !== email) {
    return {
      state: 'not-found',
      message: `That email doesn't match the one on order #${orderNumber}.`,
    } satisfies ActionResult;
  }

  return {
    state: 'found',
    tracking: toTracking(order),
  } satisfies ActionResult;
}

/**
 * Shapes the API response into exactly what the panel renders.
 *
 * Typed off the generated fragment rather than a hand-written shape, so a
 * field that changes in the schema surfaces here at compile time instead of as
 * an empty dash on the page.
 */
function toTracking(order: TrackedOrderFragment): TrackingResult {
  return {
    orderName: order.name,
    placedAt: order.processedAt ?? null,
    fulfillmentStatus: order.fulfillmentStatus,
    statusPageUrl: order.statusPageUrl ?? null,
    shipments: order.fulfillments.nodes.map((fulfillment) => {
      const tracking = fulfillment.trackingInformation?.[0];
      return {
        // The carrier's own word for where the parcel is, falling back to
        // Shopify's fulfilment state, then to something honest.
        status:
          fulfillment.latestShipmentStatus ?? fulfillment.status ?? 'pending',
        carrier: tracking?.company ?? null,
        trackingNumber: tracking?.number ?? null,
        trackingUrl: tracking?.url ?? null,
        shippedAt: fulfillment.createdAt ?? null,
        estimatedDeliveryAt: fulfillment.estimatedDeliveryAt ?? null,
        // Newest first: the last thing that happened is the thing you want.
        history: [...fulfillment.events.nodes].sort(
          (a, b) => Date.parse(b.happenedAt) - Date.parse(a.happenedAt),
        ),
      };
    }),
  };
}

/** "OUT_FOR_DELIVERY" is not a sentence. */
function humanise(value: string): string {
  return value.toLowerCase().replace(/_/g, ' ');
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function OrderTracking() {
  const {loggedIn} = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>() as ActionResult | undefined;
  const navigation = useNavigation();
  const busy = navigation.state === 'submitting';

  return (
    <div className="tracking">
      <header className="tracking__header">
        <p className="tracking__eyebrow">support</p>
        <h1 className="tracking__title">order tracking</h1>
        <p className="tracking__intro">
          Your order number is in your confirmation email — it looks like
          #1024. Enter it with the email you ordered with.
        </p>
      </header>

      <Form method="post" className="tracking__form">
        <div className="tracking__field">
          <label htmlFor="orderNumber">order number</label>
          <input
            id="orderNumber"
            name="orderNumber"
            type="text"
            inputMode="numeric"
            placeholder="#1024"
            autoComplete="off"
            required
            defaultValue={
              result?.state === 'needs-login' ? result.orderNumber : undefined
            }
          />
        </div>

        <div className="tracking__field">
          <label htmlFor="email">email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <button type="submit" className="btn btn--full" disabled={busy}>
          {busy ? 'looking…' : 'track order'}
        </button>
      </Form>

      {result?.state === 'needs-login' && (
        <NeedsLogin email={result.email} />
      )}

      {result?.state === 'not-found' && (
        <p className="tracking__error" role="alert">
          {result.message}
        </p>
      )}

      {result?.state === 'found' && <Result tracking={result.tracking} />}

      <section className="tracking__help">
        <h2>can&rsquo;t find your order?</h2>
        <p>
          Tracking becomes available once the parcel leaves us, one to three
          business days after you order. A freshly created tracking number can
          also take a few hours to activate with the carrier.
        </p>
        <p>
          Still stuck? Write to us from the <Link to="/contact">contact page</Link>{' '}
          and we&rsquo;ll look it up ourselves. Full delivery times are in our{' '}
          <Link to="/legal/shipping">shipping policy</Link>.
        </p>
        {loggedIn && (
          <p>
            You&rsquo;re signed in — all your orders are in{' '}
            <Link to="/account/orders">your account</Link>.
          </p>
        )}
      </section>
    </div>
  );
}

/**
 * Shown when the visitor has not been identified yet.
 *
 * Stated plainly rather than dressed up as an error: nothing has gone wrong,
 * we simply will not hand order details to someone who has only typed a
 * number.
 */
function NeedsLogin({email}: {email: string}) {
  /*
   * A plain link, not a form: /account/login is a GET loader that redirects to
   * Shopify. `login_hint` carries the address the visitor just typed so they
   * don't type it twice, and `return_to` is read by Hydrogen when the
   * authorisation comes back — which is what brings them to this page rather
   * than dumping them in the account dashboard.
   */
  const loginUrl = `/account/login?${new URLSearchParams({
    login_hint: email,
    return_to: '/order-tracking',
  }).toString()}`;

  return (
    <div className="tracking__gate">
      <h2>one step first</h2>
      <p>
        We only show order details to the person who placed the order. Confirm
        your email address and we&rsquo;ll bring you straight back here —
        Shopify sends you a one-time code, there is no password to remember.
      </p>
      <a href={loginUrl} className="btn">
        confirm my email
      </a>
    </div>
  );
}

function Result({tracking}: {tracking: TrackingResult}) {
  const hasShipments = tracking.shipments.length > 0;

  return (
    <section className="tracking__result" aria-live="polite">
      <div className="tracking__result-head">
        <div>
          <p className="tracking__result-label">order</p>
          <p className="tracking__result-value">{tracking.orderName}</p>
        </div>
        <div>
          <p className="tracking__result-label">placed</p>
          <p className="tracking__result-value">
            {formatDate(tracking.placedAt)}
          </p>
        </div>
        <div>
          <p className="tracking__result-label">status</p>
          <p className="tracking__result-value tracking__result-value--status">
            {humanise(tracking.fulfillmentStatus)}
          </p>
        </div>
      </div>

      {!hasShipments && (
        <p className="tracking__pending">
          Your order is confirmed and being prepared. A tracking number appears
          here as soon as it ships — one to three business days.
        </p>
      )}

      {tracking.shipments.map((shipment, index) => (
        <ShipmentCard
          key={shipment.trackingNumber ?? index}
          shipment={shipment}
          index={index}
          total={tracking.shipments.length}
        />
      ))}

      {tracking.statusPageUrl && (
        <p className="tracking__status-link">
          <a
            href={tracking.statusPageUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            open the full order status page →
          </a>
        </p>
      )}
    </section>
  );
}

function ShipmentCard({
  shipment,
  index,
  total,
}: {
  shipment: Shipment;
  index: number;
  total: number;
}) {
  return (
    <article className="tracking__shipment">
      {total > 1 && (
        <p className="tracking__shipment-index">
          parcel {index + 1} of {total}
        </p>
      )}

      <dl className="tracking__grid">
        <div>
          <dt>status</dt>
          <dd>{humanise(shipment.status)}</dd>
        </div>
        <div>
          <dt>carrier</dt>
          <dd>{shipment.carrier ?? '—'}</dd>
        </div>
        <div>
          <dt>tracking number</dt>
          <dd>
            {shipment.trackingNumber ? (
              shipment.trackingUrl ? (
                <a
                  href={shipment.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {shipment.trackingNumber}
                </a>
              ) : (
                shipment.trackingNumber
              )
            ) : (
              '—'
            )}
          </dd>
        </div>
        <div>
          <dt>shipped</dt>
          <dd>{formatDate(shipment.shippedAt)}</dd>
        </div>
        <div>
          <dt>estimated delivery</dt>
          <dd>{formatDate(shipment.estimatedDeliveryAt)}</dd>
        </div>
      </dl>

      {shipment.history.length > 0 && (
        <div className="tracking__history">
          <p className="tracking__history-title">history</p>
          <ol>
            {shipment.history.map((event, position) => (
              <li
                key={event.id}
                className={position === 0 ? 'tracking__event--latest' : undefined}
              >
                <span className="tracking__event-dot" aria-hidden="true" />
                <span className="tracking__event-status">
                  {humanise(event.status)}
                </span>
                <time dateTime={event.happenedAt}>
                  {formatDateTime(event.happenedAt)}
                </time>
              </li>
            ))}
          </ol>
        </div>
      )}
    </article>
  );
}
