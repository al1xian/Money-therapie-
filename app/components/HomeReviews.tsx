import {getReviewsForSeed} from '~/data/reviews';
import {ReviewsSection} from '~/components/ReviewsSection';
import {useT} from '~/lib/i18n';

export function HomeReviews() {
  const t = useT();
  const reviews = getReviewsForSeed('reda-studio-home', 12);
  return (
    <ReviewsSection
      heading={t('reviews.title')}
      subheading={t('reviews.subtitle')}
      reviews={reviews}
    />
  );
}
