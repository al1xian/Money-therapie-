import type {Review} from '~/data/reviews';
import {StarRating} from '~/components/StarRating';

const AVATAR_PALETTE = ['#111111', '#3d3d3a', '#6b6b66', '#8a8a86'];

/**
 * Initials for the avatar. Profiles are anonymous, so a name is either
 * initials already ("a. b.") or the generic "client anonyme" — the latter has
 * no meaningful initials and gets a neutral glyph instead.
 */
function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** True for the generic anonymous profile, which shows a glyph, not letters. */
function isAnonymous(name: string): boolean {
  return /anonyme/i.test(name);
}

/** Keyed on the review id so two "client anonyme" cards differ visually. */
function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

/**
 * Review card: stars, headline, body, then the author line.
 *
 * The "avis certifié" badge only renders for reviews whose data carries
 * `certified: true`, so it can be switched off per review from the data file.
 */
function TestimonialCard({review, size}: {review: Review; size: 'sm' | 'md'}) {
  const anonymous = isAnonymous(review.name);

  return (
    <div className={`testimonial-card testimonial-card--${size}`}>
      <StarRating rating={review.rating} className="testimonial-card__stars" />
      <h4 className="testimonial-card__headline">{review.title}</h4>
      <p className="testimonial-card__quote">&laquo;&nbsp;{review.text}&nbsp;&raquo;</p>
      <div className="testimonial-card__author">
        <span
          className="testimonial-card__avatar"
          style={{background: avatarColor(review.id)}}
          aria-hidden="true"
        >
          {anonymous ? <PersonIcon /> : initials(review.name)}
        </span>
        <p className="testimonial-card__name">{review.name}</p>
        {review.certified && (
          <span className="testimonial-card__certified">
            <CheckIcon />
            avis certifié
          </span>
        )}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      className="testimonial-card__check"
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

function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="5.6" r="2.6" fill="currentColor" />
      <path
        d="M2.6 14c0-2.7 2.4-4.5 5.4-4.5s5.4 1.8 5.4 4.5"
        fill="currentColor"
      />
    </svg>
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
          {reviews.map((review, index) => (
            <TestimonialCard
              key={`a-${review.id}`}
              review={review}
              size={cardSize(index)}
            />
          ))}
        </div>
        <div className="scroller__group" aria-hidden="true">
          {reviews.map((review, index) => (
            <TestimonialCard
              key={`b-${review.id}`}
              review={review}
              size={cardSize(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Alternates compact and regular cards so the rails don't read as a grid. */
function cardSize(index: number): 'sm' | 'md' {
  return index % 3 === 1 ? 'sm' : 'md';
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
