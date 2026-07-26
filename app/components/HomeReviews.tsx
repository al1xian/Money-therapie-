import {getReviewsForSeed} from '~/data/reviews';
import {ReviewsSection} from '~/components/ReviewsSection';

export function HomeReviews() {
  const reviews = getReviewsForSeed('reda-studio-home', 12);
  return (
    <ReviewsSection
      heading="ils portent reda studio"
      subheading="des retours sincères de la communauté reda studio, sur des pièces pensées pour durer."
      reviews={reviews}
    />
  );
}
