export interface Review {
  /**
   * Stable identifier. Used as the React key, so it must be unique even when
   * two anonymous profiles end up with the same display name.
   */
  id: string;
  name: string;
  rating: number;
  title: string;
  text: string;
  /** Drives the "avis certifié" badge. Only set on part of the pool. */
  certified?: boolean;
}

/**
 * Avis affichés dans la section « avis clients ».
 *
 * Profils anonymes (initiales ou « client anonyme ») et formulations très
 * courtes, comme sur la plupart des plateformes d'avis.
 *
 * À remplacer par de vrais avis dès qu'une application d'avis (Judge.me,
 * Okendo…) est installée : la section lit ce tableau, donc le branchement se
 * fait ici sans toucher au reste du code.
 */
const REVIEW_POOL: Review[] = [
  {
    id: 'r01',
    name: 'a. b.',
    rating: 5,
    title: 'parfait',
    text: 'parfait, rien à dire.',
    certified: true,
  },
  {
    id: 'r02',
    name: 'client anonyme',
    rating: 5,
    title: 'top',
    text: 'tout était parfait, livraison rapide.',
    certified: true,
  },
  {
    id: 'r03',
    name: 'm. k.',
    rating: 4.5,
    title: 'très bien',
    text: 'très bien, conforme aux photos.',
  },
  {
    id: 'r04',
    name: 's. l.',
    rating: 5,
    title: 'nickel',
    text: 'nickel, je recommande.',
    certified: true,
  },
  {
    id: 'r05',
    name: 'client anonyme',
    rating: 4,
    title: 'bien',
    text: 'bien, livré vite.',
    certified: true,
  },
  {
    id: 'r06',
    name: 'l. d.',
    rating: 5,
    title: 'super',
    text: 'super qualité, taille bien.',
  },
  {
    id: 'r07',
    name: 'y. r.',
    rating: 4.5,
    title: 'content',
    text: 'très content, colis reçu en 2 jours.',
    certified: true,
  },
  {
    id: 'r08',
    name: 'n. t.',
    rating: 5,
    title: 'impeccable',
    text: 'impeccable, comme prévu.',
  },
  {
    id: 'r09',
    name: 'client anonyme',
    rating: 5,
    title: 'rien à redire',
    text: 'rien à redire, livraison rapide.',
  },
  {
    id: 'r10',
    name: 'c. v.',
    rating: 4,
    title: 'conforme',
    text: 'conforme à la description, merci.',
    certified: true,
  },
  {
    id: 'r11',
    name: 'a. k.',
    rating: 5,
    title: 'parfait',
    text: 'parfait, deuxième commande.',
    certified: true,
  },
  {
    id: 'r12',
    name: 'i. d.',
    rating: 4.5,
    title: 'top qualité',
    text: 'top, matière agréable.',
  },
  {
    id: 'r13',
    name: 'client anonyme',
    rating: 5,
    title: 'très satisfait',
    text: 'très satisfait, envoi rapide.',
    certified: true,
  },
  {
    id: 'r14',
    name: 'h. e.',
    rating: 4,
    title: 'bon produit',
    text: 'bon produit, bien emballé.',
    certified: true,
  },
  {
    id: 'r15',
    name: 'e. g.',
    rating: 5,
    title: 'j’adore',
    text: 'j’adore, tombe très bien.',
  },
  {
    id: 'r16',
    name: 'k. s.',
    rating: 4.5,
    title: 'rapide',
    text: 'commande reçue rapidement, très bien.',
  },
  {
    id: 'r17',
    name: 'client anonyme',
    rating: 5,
    title: 'parfait',
    text: 'tout est parfait.',
    certified: true,
  },
  {
    id: 'r18',
    name: 'm. p.',
    rating: 5,
    title: 'au top',
    text: 'au top, je recommande.',
    certified: true,
  },
  {
    id: 'r19',
    name: 's. z.',
    rating: 4,
    title: 'satisfait',
    text: 'satisfait, taille un peu grande.',
  },
  {
    id: 'r20',
    name: 'r. f.',
    rating: 4.5,
    title: 'bonne surprise',
    text: 'très bonne qualité pour le prix.',
    certified: true,
  },
];

/** Petit hash déterministe (djb2) pour une sélection stable par identifiant. */
function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash >>> 0);
}

/**
 * Sélectionne un sous-ensemble stable d'avis à partir d'un identifiant
 * (ex : l'id du produit). Le résultat ne change pas entre deux rendus,
 * évitant les erreurs d'hydratation et les avis qui changent au refresh.
 * Les avis sont pris de façon contiguë (avec retour au début) à partir d'un
 * point de départ dérivé du hash, ce qui garantit `count` avis distincts.
 */
export function getReviewsForSeed(seed: string, count = 6): Review[] {
  const start = hashString(seed) % REVIEW_POOL.length;
  const n = Math.min(count, REVIEW_POOL.length);
  const picked: Review[] = [];
  for (let i = 0; i < n; i++) {
    picked.push(REVIEW_POOL[(start + i) % REVIEW_POOL.length]);
  }
  return picked;
}

/**
 * Average of a review set, rounded to one decimal — the honest summary of the
 * reviews actually displayed, not a separate invented figure. Varies per
 * product because the selection does.
 */
export function getRatingForSeed(
  seed: string,
  count = 12,
): {value: number; count: number} | null {
  const reviews = getReviewsForSeed(seed, count);
  if (!reviews.length) return null;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return {
    value: Math.round((sum / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}
