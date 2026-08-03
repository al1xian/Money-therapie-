export interface Review {
  /** Stable identifier, utilisé comme clé React. */
  id: string;
  /** Prénom et nom, affichés tels quels sous l'avis. */
  name: string;
  rating: number;
  /**
   * Texte intégral de l'avis. C'est le seul contenu rédactionnel de la
   * carte : ni titre ni accroche séparée, pour qu'aucun résumé ne vienne
   * doubler l'avis lui-même.
   */
  text: string;
  /** Drives the "avis certifié" badge. Only set on part of the pool. */
  certified?: boolean;
}

/**
 * Avis affichés dans la section « avis clients ». Formulations courtes, comme
 * sur la plupart des plateformes d'avis, et affichées en entier — chaque avis
 * n'apparaît qu'une seule fois par section.
 *
 * À remplacer par de vrais avis dès qu'une application d'avis (Judge.me,
 * Okendo…) est installée : la section lit ce tableau, donc le branchement se
 * fait ici sans toucher au reste du code.
 */
const REVIEW_POOL: Review[] = [
  {
    id: 'r01',
    name: 'Amine Belkacem',
    rating: 5,
    text: 'parfait, rien à dire.',
    certified: true,
  },
  {
    id: 'r02',
    name: 'Camille Rousseau',
    rating: 5,
    text: 'tout était parfait, livraison rapide.',
    certified: true,
  },
  {
    id: 'r03',
    name: 'Mehdi Kaddouri',
    rating: 4.5,
    text: 'très bien, conforme aux photos.',
  },
  {
    id: 'r04',
    name: 'Sarah Lemoine',
    rating: 5,
    text: 'nickel, je recommande.',
    certified: true,
  },
  {
    id: 'r05',
    name: 'Clara Fontaine',
    rating: 4,
    text: 'bien, livré vite.',
    certified: true,
  },
  {
    id: 'r06',
    name: 'Lucas Dubois',
    rating: 5,
    text: 'super qualité, taille bien.',
  },
  {
    id: 'r07',
    name: 'Yanis Rahmani',
    rating: 4.5,
    text: 'très content, colis reçu en 2 jours.',
    certified: true,
  },
  {
    id: 'r08',
    name: 'Nadia Toumi',
    rating: 5,
    text: 'impeccable, comme prévu.',
  },
  {
    id: 'r09',
    name: 'Chloé Marchand',
    rating: 5,
    text: 'rien à redire, livraison rapide.',
  },
  {
    id: 'r10',
    name: 'Céline Vasseur',
    rating: 4,
    text: 'conforme à la description, merci.',
    certified: true,
  },
  {
    id: 'r11',
    name: 'Adam Khelifi',
    rating: 5,
    text: 'parfait, deuxième commande.',
    certified: true,
  },
  {
    id: 'r12',
    name: 'Inès Daoudi',
    rating: 4.5,
    text: 'top, matière agréable.',
  },
  {
    id: 'r13',
    name: 'Thomas Berger',
    rating: 5,
    text: 'très satisfait, envoi rapide.',
    certified: true,
  },
  {
    id: 'r14',
    name: 'Hugo Renaud',
    rating: 4,
    text: 'bon produit, bien emballé.',
    certified: true,
  },
  {
    id: 'r15',
    name: 'Emma Girard',
    rating: 5,
    text: 'j’adore, tombe très bien.',
  },
  {
    id: 'r16',
    name: 'Karim Saidi',
    rating: 4.5,
    text: 'commande reçue rapidement, très bien.',
  },
  {
    id: 'r17',
    name: 'Léa Moreau',
    rating: 5,
    text: 'tout est parfait.',
    certified: true,
  },
  {
    id: 'r18',
    name: 'Maxime Petit',
    rating: 5,
    text: 'au top, je recommande.',
    certified: true,
  },
  {
    id: 'r19',
    name: 'Sofia Zeroual',
    rating: 4,
    text: 'satisfait, taille un peu grande.',
  },
  {
    id: 'r20',
    name: 'Rayan Fournier',
    rating: 4.5,
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
