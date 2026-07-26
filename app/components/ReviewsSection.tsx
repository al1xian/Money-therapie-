import type {Review} from '~/data/reviews';
import {StarRating} from '~/components/StarRating';

const AVATAR_PALETTE = ['#111111', '#3d3d3a', '#6b6b66', '#8a8a86'];

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

/**
 * Review card: rating, headline, body, then the author.
 *
 * Only fields that exist in the review data are rendered. There is no date or
 * city here because that information isn't in the data, and no "verified"
 * badge because nothing verifies these.
 */
function TestimonialCard({review}: {review: Review}) {
  return (
    <div className="testimonial-card">
      <StarRating rating={review.rating} className="testimonial-card__stars" />
      <h4 className="testimonial-card__headline">{review.title}</h4>
      <p className="testimonial-card__quote">&ldquo;{review.text}&rdquo;</p>
      <div className="testimonial-card__author">
        <span
          className="testimonial-card__avatar"
          style={{background: avatarColor(review.name)}}
          aria-hidden="true"
        >
          {initials(review.name)}
        </span>
        <div>
          <p className="testimonial-card__name">{review.name}</p>
          <p className="testimonial-card__role">avis client</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Défilement horizontal infini : le contenu est rendu deux fois et la piste
 * est translatée de -50%, ce qui rend la boucle invisible.
 */
function HorizontalScroller({
  reviews,
  speed,
  direction,
}: {
  reviews: Review[];
  speed: string;
  direction: 'left' | 'right';
}) {
  if (!reviews.length) return null;

  return (
    <div className="scroller">
      <div
        className={`scroller__track scroller__track--${direction}`}
        style={{'--scroll-duration': speed} as React.CSSProperties}
      >
        <div className="scroller__group">
          {reviews.map((review) => (
            <TestimonialCard key={`a-${review.name}`} review={review} />
          ))}
        </div>
        <div className="scroller__group" aria-hidden="true">
          {reviews.map((review) => (
            <TestimonialCard key={`b-${review.name}`} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
}

const ROWS: Array<{speed: string; direction: 'left' | 'right'}> = [
  {speed: '50s', direction: 'left'},
  {speed: '40s', direction: 'right'},
  {speed: '60s', direction: 'left'},
];

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

  // Répartition en 3 rangées, dans l'ordre, pour que chaque rangée ait un
  // contenu distinct.
  const rows: Review[][] = [[], [], []];
  reviews.forEach((review, index) => rows[index % rows.length]?.push(review));

  return (
    <section className="testimonials">
      <div className="testimonials__head">
        <h2 className="testimonials__title">{heading}</h2>
        {subheading ? <p className="testimonials__subtitle">{subheading}</p> : null}
      </div>

      <div className="testimonials__rows">
        {rows.map((row, index) => (
          <HorizontalScroller
            // eslint-disable-next-line react/no-array-index-key -- tableau statique de longueur fixe, jamais réordonné
            key={index}
            reviews={row}
            speed={ROWS[index].speed}
            direction={ROWS[index].direction}
          />
        ))}
      </div>

      <div className="testimonials__glow" aria-hidden="true" />
    </section>
  );
}
