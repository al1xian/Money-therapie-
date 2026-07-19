import {useEffect, useRef, useState} from 'react';
import {redirect, useFetcher, useLoaderData, useNavigate} from 'react-router';
import type {Route} from './+types/checkout';
import {Image, Money} from '@shopify/hydrogen';
import {
  attachSumUpCheckoutReference,
  createDraftOrder,
  verifyVariantsAvailability,
} from '~/lib/shopifyAdmin.server';
import {createSumUpCheckout} from '~/lib/sumup.server';
import {
  CheckoutStepError,
  STEP_PUBLIC_MESSAGES,
  logCheckoutStepFailure,
  newRequestId,
} from '~/lib/checkoutErrors.server';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Money Therapy | Paiement'}];
};

export async function loader({context}: Route.LoaderArgs) {
  const cart = await context.cart.get();

  if (!cart || !cart.lines?.nodes?.length) {
    throw redirect('/cart');
  }

  return {cart};
}

type ActionResult =
  | {ok: true; sumupCheckoutId: string; draftOrderId: string}
  | {ok: false; error: string; requestId: string; step?: string};

function actionFailure(error: unknown, fallbackStep: CheckoutStepError['step']): ActionResult {
  if (error instanceof CheckoutStepError) {
    logCheckoutStepFailure(error);
    return {
      ok: false,
      error: STEP_PUBLIC_MESSAGES[error.step],
      requestId: error.requestId,
      step: error.step,
    };
  }

  const requestId = newRequestId();
  console.error(
    `[checkout:${fallbackStep}] requestId=${requestId} unexpected error=${error instanceof Error ? error.message : String(error)}`,
  );
  return {ok: false, error: STEP_PUBLIC_MESSAGES[fallbackStep], requestId, step: fallbackStep};
}

export async function action({request, context}: Route.ActionArgs): Promise<ActionResult> {
  let cart;
  try {
    cart = await context.cart.get();
  } catch (error) {
    return actionFailure(error, 'cart_read');
  }

  if (!cart || !cart.lines?.nodes?.length) {
    return {ok: false, error: 'Votre panier est vide.', requestId: newRequestId()};
  }

  const formData = await request.formData();
  const email = String(formData.get('email') || '').trim();
  const firstName = String(formData.get('firstName') || '').trim();
  const lastName = String(formData.get('lastName') || '').trim();
  const address1 = String(formData.get('address1') || '').trim();
  const address2 = String(formData.get('address2') || '').trim();
  const city = String(formData.get('city') || '').trim();
  const zip = String(formData.get('zip') || '').trim();
  const countryCode = String(formData.get('countryCode') || 'FR').trim();
  const phone = String(formData.get('phone') || '').trim();

  if (!email || !firstName || !lastName || !address1 || !city || !zip) {
    return {ok: false, error: 'Merci de compléter tous les champs obligatoires.', requestId: newRequestId()};
  }

  const lines = cart.lines.nodes
    .filter((line) => 'merchandise' in line && line.merchandise?.id)
    .map((line) => ({
      variantId: (line as {merchandise: {id: string}}).merchandise.id,
      quantity: line.quantity,
    }));

  // Step 1: stock/price re-verification — never trust the cart/browser.
  let checks;
  try {
    checks = await verifyVariantsAvailability(context.env, lines);
  } catch (error) {
    return actionFailure(error, 'stock_check');
  }

  const problems = checks.filter((c) => !c.ok);
  if (problems.length > 0) {
    return {
      ok: false,
      error: problems.map((p) => p.reason).join(' '),
      requestId: newRequestId(),
      step: 'stock_check',
    };
  }

  // Step 2: create the Shopify draft order (source of truth for the amount).
  let draftOrder;
  try {
    draftOrder = await createDraftOrder(context.env, {
      email,
      lines,
      shippingAddress: {
        firstName,
        lastName,
        address1,
        address2: address2 || undefined,
        city,
        zip,
        countryCode,
        phone: phone || undefined,
      },
      note: `Cart ${cart.id}`,
    });
  } catch (error) {
    return actionFailure(error, 'draft_order_create');
  }

  // Step 3: create the SumUp checkout for the amount Shopify just computed.
  let sumupCheckout;
  try {
    const origin = new URL(request.url).origin;
    sumupCheckout = await createSumUpCheckout(context.env, {
      amount: Number(draftOrder.totalPrice),
      currency: draftOrder.currencyCode,
      checkoutReference: draftOrder.id.split('/').pop() || draftOrder.id,
      description: `Money Therapy — ${draftOrder.name}`,
      returnUrl: `${origin}/api/sumup/return?draftOrderId=${encodeURIComponent(draftOrder.id)}`,
    });
  } catch (error) {
    const failure = actionFailure(error, 'sumup_checkout_create');
    console.error(`[checkout:sumup_checkout_create] draftOrderId=${draftOrder.id} requestId=${failure.ok ? '' : failure.requestId}`);
    return failure;
  }

  // Step 4 (best-effort, never blocks payment): note the SumUp checkoutId on
  // the draft order for support/traceability.
  try {
    await attachSumUpCheckoutReference(context.env, draftOrder.id, sumupCheckout.id);
  } catch (error) {
    if (error instanceof CheckoutStepError) logCheckoutStepFailure(error, {draftOrderId: draftOrder.id});
  }

  return {ok: true, sumupCheckoutId: sumupCheckout.id, draftOrderId: draftOrder.id};
}

type WidgetStatus = 'idle' | 'loading' | 'load-error' | 'sent' | 'auth-screen' | 'invalid' | 'error' | 'fail' | 'success';

const WIDGET_MESSAGES: Partial<Record<WidgetStatus, string>> = {
  loading: 'Chargement du module de paiement…',
  'load-error': "Le widget SumUp n'a pas pu se charger. Vérifiez votre connexion et réessayez.",
  sent: 'Envoi du paiement en cours…',
  'auth-screen': 'Vérification 3-D Secure en cours…',
  invalid: 'Les informations de carte semblent invalides. Vérifiez-les et réessayez.',
  error: "Une erreur technique est survenue pendant le paiement. Réessayez dans un instant.",
  fail: 'Le paiement a été refusé par votre banque ou annulé. Aucune somme n’a été débitée.',
};

const WIDGET_SCRIPT_TIMEOUT_MS = 12000;

export default function Checkout() {
  const {cart} = useLoaderData<typeof loader>();
  const fetcher = useFetcher<ActionResult>();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'form' | 'widget'>('form');
  const [widgetStatus, setWidgetStatus] = useState<WidgetStatus>('idle');
  const widgetMounted = useRef(false);

  const result = fetcher.data;
  const isProcessing = widgetStatus === 'sent' || widgetStatus === 'auth-screen';

  useEffect(() => {
    if (result?.ok && phase === 'form') {
      setPhase('widget');
    }
  }, [result, phase]);

  useEffect(() => {
    if (phase !== 'widget' || !result?.ok || widgetMounted.current) return;
    widgetMounted.current = true;
    setWidgetStatus('loading');

    let settled = false;
    const timeout = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        console.error('[checkout:widget_load] SumUp SDK did not finish loading within timeout');
        setWidgetStatus('load-error');
      }
    }, WIDGET_SCRIPT_TIMEOUT_MS);

    const script = document.createElement('script');
    script.src = 'https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js';
    script.async = true;
    script.onload = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      const w = window as unknown as {SumUpCard?: unknown};
      if (!w.SumUpCard) {
        console.error('[checkout:widget_load] SumUp SDK script loaded but window.SumUpCard is undefined');
        setWidgetStatus('load-error');
        return;
      }
      setWidgetStatus('idle');
      mountWidget(result.sumupCheckoutId, result.draftOrderId);
    };
    script.onerror = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      console.error('[checkout:widget_load] SumUp SDK script failed to load (network or CSP block)');
      setWidgetStatus('load-error');
    };
    document.body.appendChild(script);

    return () => {
      window.clearTimeout(timeout);
      const w = window as unknown as {SumUpCard?: {unmount: (id: string) => void}};
      w.SumUpCard?.unmount('sumup-card');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function mountWidget(sumupCheckoutId: string, draftOrderId: string) {
    const w = window as unknown as {
      SumUpCard?: {
        mount: (config: {
          id: string;
          checkoutId: string;
          locale?: string;
          onResponse: (type: string, body: {transaction_id?: string; message?: string}) => void;
        }) => void;
      };
    };

    w.SumUpCard?.mount({
      id: 'sumup-card',
      checkoutId: sumupCheckoutId,
      // `locale` is passed best-effort (fr-FR) — not independently confirmed
      // against SumUp's full widget reference from this environment; the
      // checkoutId + return payload are the parts that are load-bearing.
      locale: 'fr-FR',
      onResponse: (type, body) => {
        const status = type as WidgetStatus;
        setWidgetStatus(status);

        if (status === 'success') {
          void verifyAndRedirect(sumupCheckoutId, draftOrderId);
        } else if (status === 'fail' || status === 'error') {
          console.error('SumUp widget response', type, body);
        }
      },
    });
  }

  async function verifyAndRedirect(sumupCheckoutId: string, draftOrderId: string) {
    // A widget "success" is never treated as proof of payment on its own —
    // it only triggers this server-side re-check against SumUp's API.
    try {
      const response = await fetch('/api/sumup/verify', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({sumupCheckoutId, draftOrderId}),
      });
      const data = (await response.json()) as {status: string};

      if (data.status === 'FAILED' || data.status === 'EXPIRED') {
        void navigate('/checkout/failed');
        return;
      }

      // PAID or still PENDING (SumUp hasn't confirmed yet): the confirmation
      // page polls until the Shopify order is actually completed.
      void navigate(`/checkout/confirmation?order=${encodeURIComponent(draftOrderId)}`);
    } catch (error) {
      console.error('Post-payment verification failed', error);
      void navigate(`/checkout/confirmation?order=${encodeURIComponent(draftOrderId)}`);
    }
  }

  function retry() {
    setWidgetStatus('idle');
    setPhase('form');
    widgetMounted.current = false;
  }

  return (
    <div className="checkout-page">
      <div className="checkout-page__summary">
        <h1>Récapitulatif</h1>
        <ul className="checkout-summary-list">
          {cart.lines.nodes.map((line) => (
            <li key={line.id} className="checkout-summary-line">
              {line.merchandise.image && (
                <Image data={line.merchandise.image} alt={line.merchandise.product.title} width={64} height={80} />
              )}
              <div>
                <p>{line.merchandise.product.title}</p>
                <small>Qté {line.quantity}</small>
              </div>
              <Money data={line.cost.totalAmount} />
            </li>
          ))}
        </ul>
        <div className="checkout-summary-total">
          <span>Total</span>
          <Money data={cart.cost.totalAmount} />
        </div>
        <p className="checkout-page__note">
          Les frais de port sont calculés séparément et confirmés par e-mail si applicable.
        </p>
      </div>

      <div className="checkout-page__payment">
        {phase === 'form' ? (
          <fetcher.Form method="post" className="checkout-form">
            <h2>Livraison</h2>
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" required autoComplete="email" />

            <div className="checkout-form__row">
              <div>
                <label htmlFor="firstName">Prénom</label>
                <input id="firstName" name="firstName" type="text" required autoComplete="given-name" />
              </div>
              <div>
                <label htmlFor="lastName">Nom</label>
                <input id="lastName" name="lastName" type="text" required autoComplete="family-name" />
              </div>
            </div>

            <label htmlFor="address1">Adresse</label>
            <input id="address1" name="address1" type="text" required autoComplete="address-line1" />

            <label htmlFor="address2">Complément d&rsquo;adresse</label>
            <input id="address2" name="address2" type="text" autoComplete="address-line2" />

            <div className="checkout-form__row">
              <div>
                <label htmlFor="city">Ville</label>
                <input id="city" name="city" type="text" required autoComplete="address-level2" />
              </div>
              <div>
                <label htmlFor="zip">Code postal</label>
                <input id="zip" name="zip" type="text" required autoComplete="postal-code" />
              </div>
            </div>

            <label htmlFor="countryCode">Pays</label>
            <select id="countryCode" name="countryCode" defaultValue="FR">
              <option value="FR">France</option>
              <option value="BE">Belgique</option>
              <option value="CH">Suisse</option>
              <option value="LU">Luxembourg</option>
            </select>

            <label htmlFor="phone">Téléphone</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" />

            {result && !result.ok && (
              <p className="form-error" role="alert">
                {result.error}
                {result.requestId && (
                  <span className="form-error__ref"> (référence {result.requestId})</span>
                )}
              </p>
            )}

            <button type="submit" className="btn btn--primary" disabled={fetcher.state !== 'idle'}>
              {fetcher.state !== 'idle' ? 'Préparation du paiement…' : 'Continuer vers le paiement'}
            </button>
          </fetcher.Form>
        ) : (
          <div className="checkout-widget">
            <h2>Paiement</h2>
            <p className="checkout-widget__note">Paiement sécurisé, traité par SumUp.</p>

            <div id="sumup-card" aria-busy={isProcessing || widgetStatus === 'loading'} />

            {(isProcessing || widgetStatus === 'loading') && (
              <p className="checkout-widget__status" role="status">
                {WIDGET_MESSAGES[widgetStatus]}
              </p>
            )}

            {(widgetStatus === 'invalid' ||
              widgetStatus === 'error' ||
              widgetStatus === 'fail' ||
              widgetStatus === 'load-error') && (
              <div className="form-error" role="alert">
                <p>{WIDGET_MESSAGES[widgetStatus]}</p>
                <button type="button" className="link" onClick={retry}>
                  Réessayer
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
