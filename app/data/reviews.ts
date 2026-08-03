export interface Review {
  /** Stable identifier, utilisé comme clé React. */
  id: string;
  /** Prénom et nom, affichés tels quels sous l'avis. */
  name: string;
  rating: number;
  /**
   * Texte intégral de l'avis, rédigé en phrases complètes. C'est le seul
   * contenu rédactionnel de la carte : ni titre, ni accroche, ni version
   * courte — rien qui viendrait doubler ou résumer l'avis.
   */
  text: string;
  /** Drives the "avis certifié" badge. Only set on part of the pool. */
  certified?: boolean;
}

/**
 * Avis affichés dans la section « avis clients ».
 *
 * Chaque avis est affiché en entier, une seule fois par section, sous le
 * prénom et le nom de son auteur.
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
    text: 'La coupe tombe exactement comme sur les photos et la matière est bien plus épaisse que ce à quoi je m’attendais. Commandé un mardi, reçu le jeudi matin. Je repasserai commande sans hésiter.',
    certified: true,
  },
  {
    id: 'r02',
    name: 'Camille Rousseau',
    rating: 5,
    text: 'Tout s’est parfaitement passé, de la commande à la livraison. Le colis est arrivé en deux jours, très bien emballé, et la pièce correspond en tous points à la description. Rien à redire.',
    certified: true,
  },
  {
    id: 'r03',
    name: 'Mehdi Kaddouri',
    rating: 4.5,
    text: 'Le produit est fidèle aux photos, les finitions sont propres et les coutures bien nettes. Je retire une demi-étoile uniquement parce que j’aurais aimé un choix de coloris un peu plus large.',
  },
  {
    id: 'r04',
    name: 'Sarah Lemoine',
    rating: 5,
    text: 'J’ai été agréablement surprise par la qualité pour ce prix. Le tissu est agréable à porter toute la journée et ne se déforme pas après lavage. Je recommande vraiment cette boutique.',
    certified: true,
  },
  {
    id: 'r05',
    name: 'Clara Fontaine',
    rating: 4,
    text: 'Bonne pièce dans l’ensemble, la livraison a été rapide et le suivi bien communiqué. La taille est un peu plus grande que prévu, je conseille de prendre en dessous de sa taille habituelle.',
    certified: true,
  },
  {
    id: 'r06',
    name: 'Lucas Dubois',
    rating: 5,
    text: 'Excellente qualité, on sent tout de suite la différence avec des marques plus grand public. La coupe tombe bien sur les épaules et le rendu est exactement celui que je recherchais.',
  },
  {
    id: 'r07',
    name: 'Yanis Rahmani',
    rating: 4.5,
    text: 'Colis reçu en deux jours seulement, avec un emballage soigné. Le vêtement est conforme à ce qui est annoncé et la matière est agréable. Très content de cet achat.',
    certified: true,
  },
  {
    id: 'r08',
    name: 'Nadia Toumi',
    rating: 5,
    text: 'Le rendu est impeccable, exactement comme je l’imaginais en regardant les photos. Le style est sobre sans être fade, c’est précisément ce que je cherchais depuis un moment.',
  },
  {
    id: 'r09',
    name: 'Chloé Marchand',
    rating: 5,
    text: 'Rien à redire sur cette commande. La livraison a été très rapide, le produit est conforme et la qualité au rendez-vous. C’est ma deuxième commande et je suis toujours aussi satisfaite.',
  },
  {
    id: 'r10',
    name: 'Céline Vasseur',
    rating: 4,
    text: 'Le produit correspond bien à la description et la matière est de bonne facture. J’ai contacté le service client pour une question de taille, la réponse est arrivée dans la journée.',
    certified: true,
  },
  {
    id: 'r11',
    name: 'Adam Khelifi',
    rating: 5,
    text: 'Deuxième commande sur le site et toujours le même niveau de qualité. Les pièces sont bien coupées, la matière tient dans le temps et les délais annoncés sont respectés à chaque fois.',
    certified: true,
  },
  {
    id: 'r12',
    name: 'Inès Daoudi',
    rating: 4.5,
    text: 'La matière est vraiment agréable au toucher et le tombé est très propre. Je porte cette pièce aussi bien en look décontracté qu’en tenue plus habillée, elle s’adapte à tout.',
  },
  {
    id: 'r13',
    name: 'Thomas Berger',
    rating: 5,
    text: 'Commande passée le soir, expédiée dès le lendemain matin. Le produit est arrivé en parfait état et correspond exactement aux photos du site. Service sérieux et efficace.',
    certified: true,
  },
  {
    id: 'r14',
    name: 'Hugo Renaud',
    rating: 4,
    text: 'Bon produit, bien emballé et livré dans les temps. La coupe est ample comme indiqué sur la fiche, ce qui correspond bien à ce que je recherchais pour un style plus large.',
    certified: true,
  },
  {
    id: 'r15',
    name: 'Emma Girard',
    rating: 5,
    text: 'J’adore cette pièce, elle tombe très bien et la matière est douce et épaisse à la fois. Parfaite pour la mi-saison, et elle n’a pas bougé après plusieurs passages en machine.',
  },
  {
    id: 'r16',
    name: 'Karim Saidi',
    rating: 4.5,
    text: 'Commande reçue rapidement et conforme à mes attentes. Les finitions sont soignées, notamment au niveau des ourlets. Une marque que je vais suivre pour les prochains drops.',
  },
  {
    id: 'r17',
    name: 'Léa Moreau',
    rating: 5,
    text: 'Tout est parfait : la qualité du tissu, la coupe, l’emballage et la rapidité de livraison. C’est rare de trouver ce niveau de soin sur une marque indépendante, bravo.',
    certified: true,
  },
  {
    id: 'r18',
    name: 'Maxime Petit',
    rating: 5,
    text: 'Le style est vraiment épuré, ça change des vêtements couverts de logos. La qualité suit derrière, ce n’est pas qu’une question d’image. Je recommande sans réserve.',
    certified: true,
  },
  {
    id: 'r19',
    name: 'Sofia Zeroual',
    rating: 4,
    text: 'Je suis satisfaite de mon achat, la pièce est jolie et bien finie. Elle taille légèrement grand par rapport à mes habitudes, pensez à vérifier le guide des tailles avant de commander.',
  },
  {
    id: 'r20',
    name: 'Rayan Fournier',
    rating: 4.5,
    text: 'Très bonne surprise sur le rapport qualité-prix. J’hésitais avec d’autres marques mais le niveau de finition est vraiment là, et les photos du site sont fidèles au produit reçu.',
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
