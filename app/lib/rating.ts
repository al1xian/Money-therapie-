/**
 * Reads product ratings from Shopify's standard review metafields
 * (`reviews.rating` and `reviews.rating_count`), which review apps such as
 * Shopify Product Reviews, Judge.me or Okendo write to.
 *
 * Returns null whenever the data isn't there, so the UI shows no rating at
 * all rather than a made-up one. A shop with no review app simply gets no
 * stars.
 */
export type ProductRating = {value: number; count: number | null};

type MetafieldLike = {value?: string | null} | null | undefined;

export function parseRating(
  ratingField: MetafieldLike,
  countField: MetafieldLike,
): ProductRating | null {
  const raw = ratingField?.value;
  if (!raw) return null;

  let value: number | null = null;
  let scaleMax = 5;

  // The `rating` metafield type is JSON: {"value":"4.5","scale_min":"1","scale_max":"5"}
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>;
      const v = Number(obj.value);
      if (Number.isFinite(v)) value = v;
      const max = Number(obj.scale_max);
      if (Number.isFinite(max) && max > 0) scaleMax = max;
    }
  } catch {
    // Some apps store a plain number instead of the JSON shape.
    const v = Number(raw);
    if (Number.isFinite(v)) value = v;
  }

  if (value === null || value <= 0) return null;

  // Normalise to a 5-point scale if the shop uses a different one.
  if (scaleMax !== 5) value = (value / scaleMax) * 5;
  value = Math.round(Math.max(0, Math.min(5, value)) * 10) / 10;

  const rawCount = Number(countField?.value);
  const count = Number.isFinite(rawCount) && rawCount > 0 ? Math.round(rawCount) : null;

  return {value, count};
}
