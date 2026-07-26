import {getReviewsForSeed} from '~/data/reviews';
import {ReviewsSection} from '~/components/ReviewsSection';

export function ProductReviews({
  productId,
  productTitle,
}: {
  productId: string;
  productTitle: string;
}) {
  const reviews = getReviewsForSeed(productId, 12);
  return <ReviewsSection heading={`avis sur ${productTitle.toLowerCase()}`} reviews={reviews} />;
}
