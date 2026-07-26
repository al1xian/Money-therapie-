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
 * Product gallery, one DOM structure for every viewport — CSS switches the
 * layout, so the markup is never duplicated per breakpoint:
 *
 * - mobile / tablet: horizontal scroll-snap slider, one image per screen,
 *   driven by touch. Dots reflect and control the position.
 * - desktop (>= 64em): the same list becomes a vertical stack of large
 *   images. That makes the gallery column tall, which is what gives the
 *   sticky purchase panel beside it room to travel.
 *
 * Images sit in fixed-aspect boxes with `object-fit: contain`, so nothing is
 * ever stretched or cropped whatever the source ratio.
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

  // Keeps the dots in sync while the user swipes. Only ever meaningful on the
  // mobile slider — on desktop the track isn't horizontally scrollable, so
  // this simply never fires.
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

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(index, images.length - 1));
    track.scrollTo({left: track.clientWidth * clamped, behavior: 'smooth'});
  };

  if (images.length === 0) {
    return <div className="gallery gallery--empty" aria-hidden="true" />;
  }

  return (
    <div className="gallery">
      <div className="gallery__track" ref={trackRef}>
        {images.map((image, index) => (
          <div className="gallery__slide" key={image.id ?? `${image.url}-${index}`}>
            <Image
              data={image}
              alt={image.altText || title}
              sizes="(min-width: 64em) 55vw, 100vw"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="gallery__dots">
          {images.map((image, index) => (
            <button
              type="button"
              key={image.id ?? `dot-${image.url}-${index}`}
              className={`gallery__dot ${index === active ? 'gallery__dot--active' : ''}`}
              onClick={() => goTo(index)}
              aria-label={`Voir l'image ${index + 1} sur ${images.length}`}
              aria-current={index === active}
            />
          ))}
        </div>
      )}
    </div>
  );
}
