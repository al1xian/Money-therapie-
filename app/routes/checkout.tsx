import {useEffect, useRef, useState} from 'react';
import {redirect, useFetcher, useLoaderData, useNavigate} from 'react-router';
import type {Route} from './+types/checkout';
import {Image, Money} from '@shopify/hydrogen';
import {createDraftOrder} from '~/lib/shopifyAdmin.server';
import {createSumUpCheckout} from '~/lib/sumup.server';

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
  | {ok: false; error: string};

export async function action({request, context}: Route.ActionArgs): Promise<ActionResult> {
  const cart = await context.cart.get();

  if (!cart || !cart.lines?.nodes?.length) {
    return {ok: false, error: 'Votre panier est vide.'};
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
    return {ok: false, error: 'Merci de compléter tous les champs obligatoires.'};
  }

  const lines = cart.lines.nodes
    .filter((line) => 'merchandise' in line && line.merchandise?.id)
    .map((line) => ({
      variantId: (line as {merchandise: {id: string}}).merchandise.id,
      quantity: line.quantity,
    }));

  try {
    const draftOrder = await createDraftOrder(context.env, {
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

    const origin = new URL(request.url).origin;
    const sumupCheckout = await createSumUpCheckout(context.env, {
      amount: Number(draftOrder.totalPrice),
      currency: draftOrder.currencyCode,
      checkoutReference: draftOrder.id.split('/').pop() || draftOrder.id,
      description: `Money Therapy — ${draftOrder.name}`,
      returnUrl: `${origin}/api/sumup/return?draftOrderId=${encodeURIComponent(draftOrder.id)}`,
    });

    return {ok: true, sumupCheckoutId: sumupCheckout.id, draftOrderId: draftOrder.id};
  } catch (error) {
    console.error('Checkout payment initiation failed', error);
    return {ok: false, error: "Impossible d'initier le paiement. Réessayez dans un instant."};
  }
}

export default function Checkout() {
  const {cart} = useLoaderData<typeof loader>();
  const fetcher = useFetcher<ActionResult>();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'form' | 'widget'>('form');
  const [widgetError, setWidgetError] = useState<string | null>(null);
  const widgetMounted = useRef(false);

  const result = fetcher.data;

  useEffect(() => {
    if (result?.ok && phase === 'form') {
      setPhase('widget');
    }
  }, [result, phase]);

  useEffect(() => {
    if (phase !== 'widget' || !result?.ok || widgetMounted.current) return;
    widgetMounted.current = true;

    const script = document.createElement('script');
    script.src = 'https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js';
    script.async = true;
    script.onload = () => mountWidget(result.sumupCheckoutId, result.draftOrderId);
    document.body.appendChild(script);

    return () => {
      // Widget script stays loaded for the session; only unmount the card UI.
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
          onResponse: (type: string, body: {transaction_id?: string; message?: string}) => void;
        }) => void;
      };
    };

    w.SumUpCard?.mount({
      id: 'sumup-card',
      checkoutId: sumupCheckoutId,
      onResponse: (type, body) => {
        if (type === 'success') {
          void verifyAndRedirect(sumupCheckoutId, draftOrderId);
        } else if (type === 'error') {
          setWidgetError(body.message || 'Le paiement a échoué ou a été annulé.');
        }
      },
    });
  }

  async function verifyAndRedirect(sumupCheckoutId: string, draftOrderId: string) {
    try {
      const response = await fetch('/api/sumup/verify', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({sumupCheckoutId, draftOrderId}),
      });
      const data = await response.json<{status: string}>();

      if (data.status === 'PAID') {
        void navigate(`/checkout/confirmation?order=${encodeURIComponent(draftOrderId)}`);
      } else if (data.status === 'FAILED' || data.status === 'EXPIRED') {
        void navigate('/checkout/failed');
      } else {
        // Payment reported success but SumUp hasn't confirmed PAID yet —
        // send the customer to the confirmation page, which polls.
        void navigate(`/checkout/confirmation?order=${encodeURIComponent(draftOrderId)}`);
      }
    } catch (error) {
      console.error('Post-payment verification failed', error);
      void navigate(`/checkout/confirmation?order=${encodeURIComponent(draftOrderId)}`);
    }
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
            <div id="sumup-card" />
            {widgetError && (
              <div className="form-error" role="alert">
                <p>{widgetError}</p>
                <button
                  type="button"
                  className="link"
                  onClick={() => {
                    setWidgetError(null);
                    setPhase('form');
                    widgetMounted.current = false;
                  }}
                >
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
