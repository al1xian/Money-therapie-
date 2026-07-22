import {useEffect, useRef, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {ArrowLeftIcon, ArrowRightIcon} from '~/components/Icons';

type GalleryImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

/**
 * Swipeable product gallery. On mobile it is a horizontal scroll-snap
 * carousel; arrows + dots drive it on all viewports. The active dot tracks
 * the scroll position so swipe and buttons stay in sync.
 */
export function ProductGallery({images}: {images: GalleryImage[]}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(index, images.length - 1));
    track.scrollTo({left: track.clientWidth * clamped, behavior: 'smooth'});
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const index = Math.round(track.scrollLeft / track.clientWidth);
      setActive(index);
    };
    track.addEventListener('scroll', onScroll, {passive: true});
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  if (images.length === 0) {
    return <div className="gallery" style={{aspectRatio: '1/1'}} aria-hidden="true" />;
  }

  return (
    <div className="gallery">
      <div className="gallery__track" ref={trackRef}>
        {images.map((image, index) => (
          <div className="gallery__slide" key={image.id ?? index}>
            <Image
              data={image}
              alt={image.altText || 'produit'}
              sizes="(min-width: 64em) 58vw, 100vw"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            className="gallery__arrow gallery__arrow--prev"
            onClick={() => scrollToIndex(active - 1)}
            aria-label="Image précédente"
            disabled={active === 0}
          >
            <ArrowLeftIcon />
          </button>
          <button
            className="gallery__arrow gallery__arrow--next"
            onClick={() => scrollToIndex(active + 1)}
            aria-label="Image suivante"
            disabled={active === images.length - 1}
          >
            <ArrowRightIcon />
          </button>
          <div className="gallery__dots">
            {images.map((image, index) => (
              <button
                key={image.id ?? index}
                className={`gallery__dot ${index === active ? 'gallery__dot--active' : ''}`}
                onClick={() => scrollToIndex(index)}
                aria-label={`Aller à l'image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
