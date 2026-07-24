import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {Reveal} from '~/components/Reveal';

type SliderCollection = {
  id: string;
  handle: string;
  title: string;
  image?: {
    id?: string | null;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

/**
 * Horizontal, swipeable collections slider shown under the hero. Each tile
 * links to its collection page. Scroll-snap gives the native "slider" feel
 * on touch and desktop alike.
 */
export function CollectionsSlider({collections}: {collections: SliderCollection[]}) {
  if (!collections.length) return null;

  return (
    <Reveal as="section" className="collections-slider" aria-label="Collections">
      <div className="collections-slider__track">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            to={`/collections/${collection.handle}`}
            prefetch="intent"
            className="collections-slider__tile"
          >
            <div className="collections-slider__media">
              {collection.image ? (
                <Image
                  data={collection.image}
                  alt={collection.image.altText || collection.title}
                  sizes="(min-width: 48em) 40vw, 80vw"
                />
              ) : (
                <div className="collections-slider__placeholder" aria-hidden="true" />
              )}
              <span className="collections-slider__label">{collection.title}</span>
            </div>
          </Link>
        ))}
      </div>
    </Reveal>
  );
}
