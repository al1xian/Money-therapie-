import type {Review} from '~/data/reviews';
import {Reveal} from '~/components/Reveal';

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

function TestimonialCard({review}: {review: Review}) {
  return (
    <article className="testimonials__card">
      <p className="testimonials__quote">&ldquo;{review.text}&rdquo;</p>
      <div className="testimonials__meta">
        <span
          className="testimonials__avatar"
          style={{background: avatarColor(review.name)}}
          aria-hidden="true"
        >
          {initials(review.name)}
        </span>
        <span className="testimonials__name">{review.name}</span>
      </div>
    </article>
  );
}

function ScrollRow({
  reviews,
  direction,
  speed,
}: {
  reviews: Review[];
  direction: 'left' | 'right';
  speed: string;
}) {
  if (!reviews.length) return null;
  return (
    <div className="testimonials__row">
      <div
        className={`testimonials__track testimonials__track--${direction}`}
        style={{'--scroll-duration': speed} as React.CSSProperties}
      >
        <div className="testimonials__group">
          {reviews.map((review) => (
            <TestimonialCard key={`a-${review.name}`} review={review} />
          ))}
        </div>
        <div className="testimonials__group" aria-hidden="true">
          {reviews.map((review) => (
            <TestimonialCard key={`b-${review.name}`} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
}

const ROW_DIRECTIONS: Array<'left' | 'right'> = ['left', 'right', 'left'];
const ROW_SPEEDS = ['46s', '38s', '54s'];

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

  const rows: Review[][] = [[], [], []];
  reviews.forEach((review, index) => rows[index % rows.length]?.push(review));

  return (
    <Reveal as="section" className="testimonials">
      <div className="testimonials__head">
        <h2 className="section-title">{heading}</h2>
        {subheading ? <p className="testimonials__subheading">{subheading}</p> : null}
      </div>
      <div className="testimonials__rows">
        {rows.map((row, index) => (
          <ScrollRow
            // eslint-disable-next-line react/no-array-index-key -- rows is a fixed-length static array, never reordered
            key={index}
            reviews={row}
            direction={ROW_DIRECTIONS[index % ROW_DIRECTIONS.length]}
            speed={ROW_SPEEDS[index % ROW_SPEEDS.length]}
          />
        ))}
      </div>
    </Reveal>
  );
}
