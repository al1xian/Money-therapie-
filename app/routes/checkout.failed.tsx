import {Link} from 'react-router';
import type {Route} from './+types/checkout.failed';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Money Therapy | Paiement échoué'}];
};

export default function CheckoutFailed() {
  return (
    <div className="checkout-confirmation">
      <h1>Paiement non abouti</h1>
      <p>
        Le paiement a été refusé ou annulé. Aucune somme n&rsquo;a été débitée et votre panier a
        été conservé.
      </p>
      <div className="checkout-confirmation__actions">
        <Link to="/checkout" className="btn btn--primary">
          Réessayer le paiement
        </Link>
        <Link to="/contact" className="link">
          Besoin d&rsquo;aide ? Contactez-nous
        </Link>
      </div>
    </div>
  );
}
