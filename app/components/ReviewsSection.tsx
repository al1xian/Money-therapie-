import type {Review} from '~/data/reviews';
import {StarRating} from '~/components/StarRating';

const AVATAR_PALETTE = ['#111111', '#3d3d3a', '#6b6b66', '#8a8a86'];

/** Initiales du prénom et du nom, pour la pastille d'avatar. */
function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** Couleur dérivée de l'identifiant, stable d'un rendu à l'autre. */
function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

/**
 * Carte d'avis : note, avis complet, puis l'auteur.
 *
 * Un seul bloc de texte, affiché en entier — pas de titre d'accroche qui
 * ferait doublon avec l'avis, pas de troncature.
 *
 * Le badge « avis certifié » ne s'affiche que si la donnée porte
 * `certified: true`, il peut donc être coupé avis par avis.
 */
function ReviewCard({review}: {review: Review}) {
  return (
    <article className="review-card">
      <StarRating rating={review.rating} className="review-card__stars" />

      <p className="review-card__text">
        &laquo;&nbsp;{review.text}&nbsp;&raquo;
      </p>

      <footer className="review-card__author">
        <span
          className="review-card__avatar"
          style={{background: avatarColor(review.id)}}
          aria-hidden="true"
        >
          {initials(review.name)}
        </span>
        <span className="review-card__identity">
          <span className="review-card__name">{review.name}</span>
          {review.certified && (
            <span className="review-card__certified">
              <CheckIcon />
              avis certifié
            </span>
          )}
        </span>
      </footer>
    </article>
  );
}

function CheckIcon() {
  return (
    <svg
      className="review-card__check"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="7" fill="currentColor" />
      <path
        d="M3.9 7.2l2.1 2.1 4.1-4.4"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Bloc « avis clients », partagé par la page d'accueil et les pages produit.
 *
 * Grille simple : une carte par avis, chaque avis rendu une seule fois. Même
 * structure sur mobile et sur desktop, seul le nombre de colonnes change.
 */
export function ReviewsSection({
  heading,
  subheading,
  reviews,
}: {
  heading: string;
  subheading?: string;
  reviews: Review[];
}) {
  if (!reviews.length) return null;

  return (
    <section className="reviews">
      <div className="reviews__head">
        <h2 className="reviews__title">{heading}</h2>
        {subheading ? <p className="reviews__subtitle">{subheading}</p> : null}
      </div>

      <div className="reviews__grid">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
