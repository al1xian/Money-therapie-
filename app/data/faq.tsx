import type {ReactNode} from 'react';

export interface FaqItem {
  question: string;
  answer: ReactNode;
}

/** General questions — shipping, quality, refunds. */
export const generalFaq: FaqItem[] = [
  {
    question: 'how long does shipping take?',
    answer:
      'we ship from our studio in paris and deliver within 48 hours anywhere in france.',
  },
  {
    question: 'where are your pieces made?',
    answer: 'every piece is manufactured in portugal.',
  },
  {
    question: 'how is quality controlled?',
    answer:
      'each piece is checked one by one against our quality and finishing standards before it goes on sale.',
  },
  {
    question: 'can i get a refund?',
    answer: 'refunds are issued once the returned item reaches us.',
  },
];

/**
 * Pulls the composition out of a product description.
 *
 * Shops write it in prose ("Composition: 100% cotton"), so we look for an
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
  // percentage, e.g. "80% cotton, 20% polyester" out of a longer sentence.
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
      question: 'fit & sizing',
      answer: (
        <>
          the cut and size guidance are given in the product description
          wherever they are available. if you fall between two sizes, reach out
          to us before ordering and we will advise.
        </>
      ),
    },
    {
      question: 'composition',
      answer: composition ? (
        <>{composition}.</>
      ) : (
        <>
          the exact composition of this piece — materials and percentages — is
          printed on the label sewn inside the garment.
        </>
      ),
    },
    {
      question: 'manufacturing',
      answer: (
        <>
          our pieces are made in portugal, then checked one by one against our
          quality and finishing standards before going on sale.
        </>
      ),
    },
    {
      question: 'shipping',
      answer: (
        <>
          shipped from our studio in paris and delivered within 48 hours
          anywhere in france, with tracking. full details on our{' '}
          <a href="/policies/shipping-policy">shipping page</a>.
        </>
      ),
    },
    {
      question: 'returns',
      answer: (
        <>
          returns and exchanges accepted within 30 days. full details on our{' '}
          <a href="/policies/refund-policy">returns page</a>.
        </>
      ),
    },
    {
      question: 'care',
      answer: (
        <>
          wash inside out at a low temperature, and follow the specific
          instructions printed on the garment&rsquo;s label.
        </>
      ),
    },
  ];
}

/** Generic product questions for the standalone /faq page. */
export const productFaq: FaqItem[] = getProductFaq();
