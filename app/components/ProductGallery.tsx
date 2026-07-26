import {useEffect, useRef, useState} from 'react';
import {Image} from '@shopify/hydrogen';

type GalleryImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

/**
 * Product gallery — a single image list that CSS lays out two ways, so no
 * image is ever duplicated in the DOM or downloaded twice:
 *
 * - desktop (>= 64em): the slides are stacked in one large frame and only the
 *   active one is visible. Picking a thumbnail cross-fades the new image in
 *   with a slight horizontal glide.
 * - mobile / tablet: the same slides become a horizontal scroll-snap slider
 *   driven by touch, with dots that reflect and control the position.
 *
 * Each slide is a fixed-aspect box with `object-fit: contain`: the space is
 * reserved before the image loads (no layout shift) and no source ratio is
 * ever stretched or cropped.
 */
export function ProductGallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Reset when the product changes (this component gets reused across routes).
  useEffect(() => {
    setActive(0);
  }, [images]);

  // Keeps the active index in sync while swiping. Only fires on the mobile
  // slider — on desktop the track isn't horizontally scrollable.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      if (track.clientWidth === 0) return;
      setActive(Math.round(track.scrollLeft / track.clientWidth));
    };
    track.addEventListener('scroll', onScroll, {passive: true});
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  const select = (index: number) => {
    const clamped = Math.max(0, Math.min(index, images.length - 1));
    setActive(clamped);
    // If the track is actually scrollable (mobile), move it too.
    const track = trackRef.current;
    if (track && track.clientWidth > 0 && track.scrollWidth > track.clientWidth + 1) {
      track.scrollTo({left: track.clientWidth * clamped, behavior: 'smooth'});
    }
  };

  if (images.length === 0) {
    return <div className="gallery gallery--empty" aria-hidden="true" />;
  }

  const multiple = images.length > 1;

  return (
    <div className="gallery">
      {multiple && (
        <div className="gallery__thumbs" role="tablist" aria-label="Images du produit">
          {images.map((image, index) => (
            <button
              type="button"
              key={image.id ?? `thumb-${image.url}-${index}`}
              className={`gallery__thumb ${index === active ? 'gallery__thumb--active' : ''}`}
              onClick={() => select(index)}
              role="tab"
              aria-selected={index === active}
              aria-label={`Voir l'image ${index + 1} sur ${images.length}`}
            >
              <Image
                data={image}
                alt={image.altText || `${title} — miniature ${index + 1}`}
                sizes="80px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      <div className="gallery__track" ref={trackRef}>
        {images.map((image, index) => (
          <div
            className={`gallery__slide ${index === active ? 'gallery__slide--active' : ''}`}
            key={image.id ?? `${image.url}-${index}`}
            aria-hidden={index === active ? undefined : true}
          >
            <Image
              data={image}
              alt={
                image.altText ||
                (images.length > 1 ? `${title} — image ${index + 1}` : title)
              }
              sizes="(min-width: 64em) 48vw, 100vw"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {multiple && (
        <div className="gallery__dots">
          {images.map((image, index) => (
            <button
              type="button"
              key={image.id ?? `dot-${image.url}-${index}`}
              className={`gallery__dot ${index === active ? 'gallery__dot--active' : ''}`}
              onClick={() => select(index)}
              aria-label={`Voir l'image ${index + 1} sur ${images.length}`}
              aria-current={index === active}
            />
          ))}
        </div>
      )}
    </div>
  );
}
