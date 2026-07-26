import {getReviewsForSeed} from '~/data/reviews';
import {ReviewsSection} from '~/components/ReviewsSection';

export function HomeReviews() {
  const reviews = getReviewsForSeed('reda-studio-home', 6);
  return <ReviewsSection heading="ils portent reda studio" reviews={reviews} />;
}
