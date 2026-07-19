import {useEffect} from 'react';
import {Link, useLoaderData, useRevalidator} from 'react-router';
import type {Route} from './+types/checkout.confirmation';
import {getDraftOrder} from '~/lib/shopifyAdmin.server';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Money Therapy | Confirmation de commande'}];
};

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const draftOrderId = url.searchParams.get('order');

  if (!draftOrderId) {
    throw new Response('Missing order reference', {status: 400});
  }

  const draftOrder = await getDraftOrder(context.env, draftOrderId);

  return {draftOrder, draftOrderId};
}

export default function CheckoutConfirmation() {
  const {draftOrder, draftOrderId} = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  const isPending = !draftOrder?.order;

  useEffect(() => {
    if (!isPending) return;
    const interval = setInterval(() => {
      void revalidator.revalidate();
    }, 2500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  if (isPending) {
    return (
      <div className="checkout-confirmation checkout-confirmation--pending">
        <h1>Finalisation de votre commande…</h1>
        <p>Le paiement a été reçu par SumUp, nous finalisons votre commande sur la boutique.</p>
        <p className="checkout-confirmation__hint">
          Cette page se met à jour automatiquement. Si rien ne se passe après une minute,
          contactez-nous via la page <Link to="/contact">Contact</Link> en mentionnant la référence{' '}
          <code>{draftOrderId}</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="checkout-confirmation">
      <h1>Merci pour votre commande</h1>
      <p>
        Votre commande <strong>{draftOrder.order?.name}</strong> est confirmée.
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
