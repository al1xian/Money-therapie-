import type {Review} from '~/data/reviews';
import {getAverageRating} from '~/data/reviews';
import {StarRating} from '~/components/StarRating';
import {Reveal} from '~/components/Reveal';

export function ReviewsSection({
  heading,
  reviews,
}: {
  heading: string;
  reviews: Review[];
}) {
  if (!reviews.length) return null;
  const average = getAverageRating(reviews);

  return (
    <Reveal as="section" className="reviews">
      <div className="reviews__head">
        <h2 className="section-title">{heading}</h2>
        <div className="reviews__summary">
          <StarRating rating={average} />
          <span className="reviews__summary-text">
            {average.toString().replace('.', ',')} / 5 · {reviews.length} avis
          </span>
        </div>
      </div>
      <div className="reviews__masonry">
        {reviews.map((review) => (
          <article className="reviews__card" key={`${review.name}-${review.title}`}>
            <StarRating rating={review.rating} />
            <h3 className="reviews__card-title">{review.title}</h3>
            <p className="reviews__card-text">{review.text}</p>
            <span className="reviews__card-name">{review.name}</span>
          </article>
        ))}
      </div>
    </Reveal>
  );
}
