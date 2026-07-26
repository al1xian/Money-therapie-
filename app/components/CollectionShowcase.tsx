import {useState} from 'react';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';

export type ShowcaseCollection = {
  id: string;
  title: string;
  handle: string;
  image?: {
    id?: string | null;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

/**
 * Full-bleed collection tiles closing the product page: one tall image per
 * collection with its name on a solid label.
 *
 * The collections come from Shopify, so every tile links to a page that really
 * exists — new collections appear here on their own once they're created in
 * the admin, and nothing ever 404s.
 */
export function CollectionShowcase({
  collections,
  heading,
}: {
  collections: ShowcaseCollection[];
  heading?: string;
}) {
  // Marks the tile being clicked so it can play a short press animation
  // before the route change.
  const [pressed, setPressed] = useState<string | null>(null);

  if (!collections.length) return null;

  return (
    <section className="showcase" aria-labelledby="showcase-heading">
      {heading && (
        <h2 className="showcase__heading" id="showcase-heading">
          {heading}
        </h2>
      )}

      <div className="showcase__rail">
        {collections.map((collection, index) => (
          <Link
            key={collection.id}
            to={`/collections/${collection.handle}`}
            prefetch="intent"
            className={`showcase__tile ${
              pressed === collection.id ? 'showcase__tile--pressed' : ''
            }`}
            onClick={() => setPressed(collection.id)}
            onAnimationEnd={() => setPressed(null)}
          >
            <div className="showcase__media">
              {collection.image ? (
                <Image
                  data={collection.image}
                  alt={collection.image.altText || `Collection ${collection.title}`}
                  sizes="(min-width: 64em) 25vw, 78vw"
                  loading={index < 2 ? 'eager' : 'lazy'}
                />
              ) : (
                <span className="showcase__placeholder" aria-hidden="true" />
              )}
            </div>
            <span className="showcase__label">{collection.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
