import type {Route} from './+types/faq';
import {Accordion} from '~/components/Accordion';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Money Therapy | FAQ'}];
};

const FAQ_ITEMS = [
  {
    q: 'Comment suivre ma commande ?',
    a: 'Une fois votre commande validée, vous recevez une confirmation par e-mail. Le suivi est également disponible depuis votre espace compte, rubrique "Suivi de commande".',
  },
  {
    q: 'Quels moyens de paiement acceptez-vous ?',
    a: 'Le paiement par carte bancaire est traité de façon sécurisée par SumUp. Aucune donnée de carte ne transite ni n’est stockée par Money Therapy.',
  },
  {
    q: 'Comment retourner ou échanger un article ?',
    a: 'La marche à suivre complète est détaillée sur notre page Retours & échanges.',
  },
  {
    q: 'Comment choisir ma taille ?',
    a: 'Un guide des tailles détaillé est disponible sur chaque fiche produit et sur notre page dédiée.',
  },
  {
    q: 'Comment vous contacter ?',
    a: 'Via notre page Contact — nous répondons au plus vite.',
  },
];

export default function Faq() {
  return (
    <div className="info-page">
      <h1>FAQ</h1>
      <div className="faq-list">
        {FAQ_ITEMS.map((item) => (
          <Accordion key={item.q} title={item.q}>
            <p>{item.a}</p>
          </Accordion>
        ))}
      </div>
    </div>
  );
}
