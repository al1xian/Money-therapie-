import {getReviewsForSeed} from '~/data/reviews';
import {ReviewsSection} from '~/components/ReviewsSection';

export function HomeReviews() {
  const reviews = getReviewsForSeed('reda-studio-home', 12);
  return (
    <ReviewsSection
      heading="what our customers say"
      subheading="honest words from the reda studio community, on pieces made to last."
      reviews={reviews}
    />
  );
}
