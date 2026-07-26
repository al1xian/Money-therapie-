import {StarIcon} from '~/components/Icons';

export function StarRating({rating, className}: {rating: number; className?: string}) {
  return (
    <span className={`star-rating ${className ?? ''}`} aria-label={`${rating} sur 5 étoiles`}>
      {[1, 2, 3, 4, 5].map((position) => (
        <StarIcon key={position} fill={Math.max(0, Math.min(1, rating - (position - 1)))} />
      ))}
    </span>
  );
}
