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
      'nous expédions depuis notre local à paris et livrons en 48h partout en france.',
  },
  {
    question: 'où sont fabriqués vos produits ?',
    answer: 'toutes nos pièces sont fabriquées au portugal.',
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

/**
 * Pulls the composition out of a product description.
 *
 * Shops write it in prose ("Composition : 100% coton"), so we look for an
 * explicit "composition" sentence first, then for any sentence carrying a
 * material percentage. Returns null when the description says nothing about
 * it — the FAQ then points to the garment's own label rather than inventing a
 * fabric.
 */
export function extractComposition(description: string): string | null {
  const text = description.replace(/\s+/g, ' ').trim();
  if (!text) return null;

  const sentences = text.split(/(?<=[.!?])\s+|\s*[\n•·]\s*/);

  const labelled = sentences.find((sentence) =>
    /composition\s*:?/i.test(sentence),
  );
  if (labelled) {
    const cleaned = labelled.replace(/^.*?composition\s*:?\s*/i, '').trim();
    if (cleaned.length > 2) return cleaned.replace(/\.$/, '');
    return labelled.trim().replace(/\.$/, '');
  }

  // No explicit label: pick the clauses that actually carry a material
  // percentage, e.g. "80 % coton, 20 % polyester" out of a longer sentence.
  const withPercent = sentences.find((sentence) =>
    /\d+\s*%\s*\p{L}/u.test(sentence),
  );
  if (withPercent) {
    const clauses = withPercent
      .split(',')
      .map((clause) => clause.trim())
      .filter((clause) => /\d+\s*%\s*\p{L}/u.test(clause));
    if (clauses.length) return clauses.join(', ').replace(/\.$/, '');
    return withPercent.trim().replace(/\.$/, '');
  }

  return null;
}

/**
 * Product-page FAQ. `composition` is derived from the product's own
 * description, so each product states its real materials.
 */
export function getProductFaq(description = ''): FaqItem[] {
  const composition = extractComposition(description);

  return [
    {
      question: 'coupe & taille',
      answer: (
        <>
          coupe et correspondance des tailles précisées dans la description du
          produit lorsqu&rsquo;elles sont disponibles. en cas de doute entre
          deux tailles, contactez notre service client avant l&rsquo;achat.
        </>
      ),
    },
    {
      question: 'composition',
      answer: composition ? (
        <>{composition}.</>
      ) : (
        <>
          la composition exacte de la pièce (matières, pourcentages) est
          indiquée sur l&rsquo;étiquette cousue à l&rsquo;intérieur du
          vêtement.
        </>
      ),
    },
    {
      question: 'fabrication',
      answer: (
        <>
          nos pièces sont fabriquées au portugal, puis contrôlées une à une
          avant leur mise en vente selon nos critères de qualité et de
          finition.
        </>
      ),
    },
    {
      question: 'livraison',
      answer: (
        <>
          expédition depuis notre local à paris et livraison en 48h partout en
          france, avec suivi. détails sur notre page{' '}
          <a href="/policies/shipping-policy">livraison</a>.
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
}

/** Generic product questions for the standalone /faq page. */
export const productFaq: FaqItem[] = getProductFaq();
