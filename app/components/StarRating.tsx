/**
 * Star rating, drawn inline so it inherits the brand's ink colour and needs
 * no image request. Supports halves via a clip on the filled layer.
 *
 * Deliberately not Trustpilot's green star graphic: that mark signals a
 * Trustpilot-verified score, which this shop doesn't have.
 */
export function StarRating({
  rating,
  count,
  size = 13,
  className,
}: {
  rating: number;
  count?: number | null;
  size?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(5, rating));
  const label =
    typeof count === 'number'
      ? `${clamped.toString().replace('.', ',')} sur 5 — ${count} avis`
      : `${clamped.toString().replace('.', ',')} sur 5`;

  return (
    <span className={`stars ${className ?? ''}`}>
      <span className="stars__icons" role="img" aria-label={label}>
        {[0, 1, 2, 3, 4].map((position) => {
          const fill = Math.max(0, Math.min(1, clamped - position));
          return <Star key={position} fill={fill} size={size} />;
        })}
      </span>
      <span className="stars__value" aria-hidden="true">
        {clamped.toString().replace('.', ',')}
      </span>
      {typeof count === 'number' && (
        <span className="stars__count" aria-hidden="true">
          ({count})
        </span>
      )}
    </span>
  );
}

const STAR_PATH =
  'M8 1.3l2.06 4.18 4.61.67-3.34 3.25.79 4.6L8 11.8l-4.12 2.2.79-4.6L1.33 6.15l4.61-.67L8 1.3z';

function Star({fill, size}: {fill: number; size: number}) {
  // Ids are shared per fill bucket on purpose: same bucket means identical
  // clip geometry, so whichever one the browser resolves is correct.
  const clipId = `star-fill-${Math.round(fill * 100)}`;
  const full = fill >= 1;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className="stars__star"
    >
      <path d={STAR_PATH} className="stars__star-bg" />
      {/* A full star needs no clip at all. */}
      {full && <path d={STAR_PATH} className="stars__star-fg" />}
      {!full && fill > 0 && (
        <>
          <defs>
            <clipPath id={clipId}>
              <rect x="0" y="0" width={16 * fill} height="16" />
            </clipPath>
          </defs>
          <path d={STAR_PATH} className="stars__star-fg" clipPath={`url(#${clipId})`} />
        </>
      )}
    </svg>
  );
}
