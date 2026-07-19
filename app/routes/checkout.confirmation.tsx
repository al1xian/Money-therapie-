import {useEffect, useRef} from 'react';
import {Link, useLoaderData, useRevalidator} from 'react-router';
import type {Route} from './+types/checkout.confirmation';
import {getDraftOrder} from '~/lib/shopifyAdmin.server';
import {CheckoutStepError, logCheckoutStepFailure, newRequestId} from '~/lib/checkoutErrors.server';
import {STEP_PUBLIC_MESSAGES} from '~/lib/checkoutMessages';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Money Therapy | Confirmation de commande'}];
};

type LoaderResult =
  | {draftOrderId: string; draftOrder: Awaited<ReturnType<typeof getDraftOrder>>; error?: never}
  | {draftOrderId: string; draftOrder?: never; error: {message: string; requestId: string}};

export async function loader({request, context}: Route.LoaderArgs): Promise<LoaderResult> {
  const url = new URL(request.url);
  const draftOrderId = url.searchParams.get('order');

  if (!draftOrderId) {
    throw new Response('Missing order reference', {status: 400});
  }

  try {
    const draftOrder = await getDraftOrder(context.env, draftOrderId);
    return {draftOrder, draftOrderId};
  } catch (error) {
    if (error instanceof CheckoutStepError) {
      logCheckoutStepFailure(error, {draftOrderId});
      return {draftOrderId, error: {message: STEP_PUBLIC_MESSAGES[error.step], requestId: error.requestId}};
    }
    const requestId = newRequestId();
    console.error(
      `[checkout:shopify_order_complete] requestId=${requestId} draftOrderId=${draftOrderId} unexpected error=${error instanceof Error ? error.message : String(error)}`,
    );
    return {
      draftOrderId,
      error: {message: STEP_PUBLIC_MESSAGES.shopify_order_complete, requestId},
    };
  }
}

const MAX_POLL_ATTEMPTS = 20; // ~50s at 2.5s intervals

export default function CheckoutConfirmation() {
  const data = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const attempts = useRef(0);

  const isPending = !data.error && !data.draftOrder?.order;
  const gaveUp = isPending && attempts.current >= MAX_POLL_ATTEMPTS;

  useEffect(() => {
    if (!isPending || gaveUp) return;
    const interval = setInterval(() => {
      attempts.current += 1;
      void revalidator.revalidate();
    }, 2500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, gaveUp]);

  if (data.error || gaveUp) {
    const message = data.error?.message ?? STEP_PUBLIC_MESSAGES.shopify_order_complete;
    const requestId = data.error?.requestId;
    return (
      <div className="checkout-confirmation checkout-confirmation--pending">
        <h1>Paiement reçu, confirmation en attente</h1>
        <p>{message}</p>
        <p className="checkout-confirmation__hint">
          Le paiement a bien été transmis à SumUp. Contactez-nous via la page{' '}
          <Link to="/contact">Contact</Link> en mentionnant la référence <code>{data.draftOrderId}</code>
          {requestId && <> (code {requestId})</>} — nous finaliserons votre commande manuellement.
        </p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="checkout-confirmation checkout-confirmation--pending">
        <h1>Finalisation de votre commande…</h1>
        <p>Le paiement a été reçu par SumUp, nous finalisons votre commande sur la boutique.</p>
        <p className="checkout-confirmation__hint">
          Cette page se met à jour automatiquement. Si rien ne se passe après une minute,
          contactez-nous via la page <Link to="/contact">Contact</Link> en mentionnant la référence{' '}
          <code>{data.draftOrderId}</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="checkout-confirmation">
      <h1>Merci pour votre commande</h1>
      <p>
        Votre commande <strong>{data.draftOrder?.order?.name}</strong> est confirmée.
      </p>
      <p className="checkout-confirmation__hint">
        Un e-mail de confirmation vous a été envoyé. Vous pouvez suivre son statut depuis votre{' '}
        <Link to="/account/orders">espace compte</Link>.
      </p>
      <Link to="/collections/all" className="btn btn--outline">
        Continuer mes achats
      </Link>
    </div>
  );
}
