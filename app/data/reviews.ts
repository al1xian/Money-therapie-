export interface Review {
  name: string;
  rating: number;
  title: string;
  text: string;
}

/**
 * Note: ce sont des avis rédigés en interne pour illustrer le rendu de la
 * section (pas des avis clients vérifiés). Aucun badge "vérifié", aucune
 * photo ni pseudo réaliste n'est associé — uniquement prénom + initiale.
 */
const REVIEW_POOL: Review[] = [
  {
    name: 'Yanis B.',
    rating: 5,
    title: 'coupe parfaite',
    text: 'la coupe tombe exactement comme sur les photos, matière épaisse et bien finie. je recommande sans hésiter.',
  },
  {
    name: 'Camille R.',
    rating: 4.5,
    title: 'très bonne qualité',
    text: 'agréablement surprise par la qualité des finitions pour ce prix. la livraison a été rapide en plus.',
  },
  {
    name: 'Nassim T.',
    rating: 5,
    title: 'exactement ce que je cherchais',
    text: 'un style minimaliste et premium, ça change des logos partout. je vais commander une autre couleur.',
  },
  {
    name: 'Léa M.',
    rating: 4,
    title: 'jolie pièce',
    text: 'très beau tissu, taille bien. seul bémol, j’aurais aimé plus de couleurs disponibles.',
  },
  {
    name: 'Adam K.',
    rating: 5,
    title: 'qualité au rendez-vous',
    text: 'du lourd niveau matière, les coutures sont propres. livré en 48h comme annoncé.',
  },
  {
    name: 'Inès D.',
    rating: 4.5,
    title: 'un basique qui fait la différence',
    text: 'coupe droite, tombe bien, se porte aussi bien en look casual qu’habillé. je suis conquise.',
  },
  {
    name: 'Rayan F.',
    rating: 5,
    title: 'aucun regret',
    text: 'j’hésitais avec d’autres marques mais la qualité est vraiment au niveau. photos fidèles au produit reçu.',
  },
  {
    name: 'Sarah L.',
    rating: 4,
    title: 'satisfaite',
    text: 'jolie pièce, un poil grande à ma taille habituelle donc je conseille de prendre une taille en dessous.',
  },
  {
    name: 'Mehdi O.',
    rating: 5,
    title: 'premium et discret',
    text: 'exactement le style que je recherchais, sobre mais qualitatif. le service client a répondu très vite à mes questions.',
  },
  {
    name: 'Chloé V.',
    rating: 4.5,
    title: 'très bon rapport qualité prix',
    text: 'la matière est plus belle qu’attendu, ça ne bouloche pas après plusieurs lavages.',
  },
  {
    name: 'Ilyes A.',
    rating: 4,
    title: 'bonne pioche',
    text: 'coupe ample comme indiqué, parfait pour un style streetwear. emballage soigné à la réception.',
  },
  {
    name: 'Manon P.',
    rating: 5,
    title: 'j’adore',
    text: 'déjà ma deuxième commande sur le site, toujours aussi qualitatif. hâte de voir les prochains drops.',
  },
  {
    name: 'Karim S.',
    rating: 4.5,
    title: 'très satisfait',
    text: 'finitions nickel, tombe bien sur les épaules. je recommande cette pièce sans problème.',
  },
  {
    name: 'Laura N.',
    rating: 5,
    title: 'un vrai coup de cœur',
    text: 'la matière est douce et épaisse à la fois, parfaite pour la mi-saison. je recommande la taille au-dessus si vous aimez plus ample.',
  },
  {
    name: 'Hugo E.',
    rating: 4,
    title: 'bon achat',
    text: 'simple, efficace, bien coupé. rien à redire pour le prix.',
  },
  {
    name: 'Emma G.',
    rating: 5,
    title: 'qualité premium confirmée',
    text: 'on sent clairement la différence avec des marques plus grand public. le tombé est impeccable.',
  },
  {
    name: 'Sami Z.',
    rating: 4.5,
    title: 'très content de mon achat',
    text: 'style épuré, matière qui respire, parfait pour un usage quotidien.',
  },
  {
    name: 'Nora C.',
    rating: 5,
    title: 'exactement comme espéré',
    text: 'commande reçue rapidement, produit conforme aux photos et à la description. je reviendrai.',
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
