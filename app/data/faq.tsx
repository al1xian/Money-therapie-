import type {ReactNode} from 'react';

export interface FaqItem {
  question: string;
  answer: ReactNode;
}

/** Questions générales — livraison, qualité, remboursement. */
export const generalFaq: FaqItem[] = [
  {
    question: 'quels sont vos délais de livraison ?',
    answer:
      'nous livrons tous nos produits en 48h, avec une livraison rapide partout en france.',
  },
  {
    question: 'vos produits sont-ils de qualité ?',
    answer:
      'oui, tous nos produits sont de qualité, sélectionnés avec soin avant leur mise en vente.',
  },
  {
    question: 'puis-je être remboursé ?',
    answer: 'le remboursement est autorisé uniquement après renvoi du produit.',
  },
];

/** Questions liées à un produit — coupe, composition, entretien... */
export const productFaq: FaqItem[] = [
  {
    question: 'coupe & taille',
    answer: (
      <>
        coupe et correspondance des tailles précisées dans la description du
        produit lorsqu&rsquo;elles sont disponibles. en cas de doute entre deux
        tailles, contactez notre service client avant l&rsquo;achat.
      </>
    ),
  },
  {
    question: 'composition',
    answer: (
      <>
        la composition exacte de la pièce (matières, pourcentages) est
        indiquée sur l&rsquo;étiquette cousue à l&rsquo;intérieur du vêtement.
      </>
    ),
  },
  {
    question: 'fabrication',
    answer: (
      <>
        chaque pièce est sélectionnée et contrôlée avant sa mise en vente
        selon nos critères de qualité et de finition.
      </>
    ),
  },
  {
    question: 'livraison',
    answer: (
      <>
        livraison suivie, expédiée sous quelques jours ouvrés. détails sur
        notre page <a href="/policies/shipping-policy">livraison</a>.
      </>
    ),
  },
  {
    question: 'retours',
    answer: (
      <>
        retours et échanges acceptés sous 30 jours. détails sur notre page{' '}
        <a href="/policies/refund-policy">retours</a>.
      </>
    ),
  },
  {
    question: 'entretien',
    answer: (
      <>
        lavez de préférence à l&rsquo;envers, à basse température, et suivez
        les instructions précises indiquées sur l&rsquo;étiquette du produit.
      </>
    ),
  },
];
