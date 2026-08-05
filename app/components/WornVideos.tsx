import {useCallback, useEffect, useRef, useState} from 'react';
import {INSTAGRAM_HANDLE, INSTAGRAM_URL} from '~/lib/social';

/**
 * Videos served from `public/videos`. Add or remove one by editing this array
 * — the component depends on nothing else.
 */
const VIDEOS: Array<{src: string; poster: string; label: string}> = [
  {src: '/videos/porte-01.mp4', poster: '/videos/porte-01.webp', label: 'reda studio look, outdoors'},
  {src: '/videos/porte-02.mp4', poster: '/videos/porte-02.webp', label: 'reda studio look, indoors'},
  {src: '/videos/porte-03.mp4', poster: '/videos/porte-03.webp', label: 'close-up on a reda studio piece'},
  {src: '/videos/porte-04.mp4', poster: '/videos/porte-04.webp', label: 'reda studio outfit worn'},
  {src: '/videos/porte-05.mp4', poster: '/videos/porte-05.webp', label: 'reda studio piece in motion'},
];

/**
 * The rail renders the list three times over. Scroll position is kept inside
 * the middle copy: whenever the viewer drifts into the first or last copy, we
 * jump by exactly one copy's width. That jump lands on a pixel-identical
 * frame, so the carousel has no start and no end — it can be dragged
 * indefinitely in either direction.
 */
const COPIES = 3;

type Slide = {
  key: string;
  index: number;
  src: string;
  poster: string;
  label: string;
};

const SLIDES: Slide[] = Array.from({length: COPIES}).flatMap((_, copy) =>
  VIDEOS.map((video, index) => ({
    key: `${copy}-${video.src}`,
    index: copy * VIDEOS.length + index,
    ...video,
  })),
);

/**
 * A single video tile.
 *
 * The source is only attached once the tile is near the viewport — otherwise
 * the homepage would pull several megabytes of video the moment it opens.
 * Playback starts when the tile enters view and pauses when it leaves, so a
 * handful of decoders never run at once.
 */
function VideoSlide({
  slide,
  active,
}: {
  slide: Slide;
  active: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;

    // Generous margin: the file is ready before the tile is actually seen.
    const preloader = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true);
          preloader.disconnect();
        }
      },
      {rootMargin: '400px'},
    );
    preloader.observe(node);

    const player = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // play() rejects when the browser refuses autoplay; the tile then
          // stays on its poster, which is the intended fallback.
          void node.play().catch(() => {});
        } else {
          node.pause();
        }
      },
      {threshold: 0.3},
    );
    player.observe(node);

    return () => {
      preloader.disconnect();
      player.disconnect();
    };
  }, []);

  return (
    <div
      className={`worn__slide ${active ? 'worn__slide--active' : ''}`}
      data-index={slide.index}
    >
      {/*
        The poster is the video's own first frame, so the tile is already
        legible before the file loads and the rail never shows empty boxes.
      */}
      <video
        ref={videoRef}
        className="worn__video"
        src={loaded ? slide.src : undefined}
        poster={slide.poster}
        aria-label={slide.label}
        muted
        loop
        playsInline
        autoPlay
        preload="none"
        draggable={false}
      />
    </div>
  );
}

function Arrow({direction}: {direction: 'left' | 'right'}) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * "Our products worn" — an endless horizontal video carousel.
 *
 * Self-contained: it reads the files in `public/videos` and depends on
 * neither the Shopify catalogue nor any other component.
 */
export function WornVideos() {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  /** Set while we reposition the rail, so the correction isn't treated as a scroll. */
  const correcting = useRef(false);

  /**
   * Keeps the viewer inside the middle copy and marks the centre tile.
   * Both jobs read the same measurements, so they share one pass.
   */
  const onScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail || correcting.current) return;

    const copyWidth = rail.scrollWidth / COPIES;

    // Wrap around before either edge is reached, on a whole copy width: the
    // pixels under the viewport are identical, so nothing is visible.
    if (rail.scrollLeft < copyWidth * 0.5) {
      correcting.current = true;
      rail.scrollLeft += copyWidth;
      requestAnimationFrame(() => (correcting.current = false));
    } else if (rail.scrollLeft > copyWidth * 1.5) {
      correcting.current = true;
      rail.scrollLeft -= copyWidth;
      requestAnimationFrame(() => (correcting.current = false));
    }

    // The tile whose centre is closest to the rail's centre takes focus.
    const middle = rail.scrollLeft + rail.clientWidth / 2;
    let best = -1;
    let bestGap = Infinity;
    for (const child of Array.from(rail.children) as HTMLElement[]) {
      const gap = Math.abs(child.offsetLeft + child.offsetWidth / 2 - middle);
      if (gap < bestGap) {
        bestGap = gap;
        best = Number(child.dataset.index);
      }
    }
    setActiveIndex(best);
  }, []);

  // Start in the middle copy so there is room to drag either way immediately.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollLeft = rail.scrollWidth / COPIES;
    onScroll();

    window.addEventListener('resize', onScroll);
    return () => window.removeEventListener('resize', onScroll);
  }, [onScroll]);

  // Pointer drag on desktop. Touch is left to the browser's native scrolling,
  // which already handles momentum better than any JS equivalent.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let dragging = false;
    let startX = 0;
    let startScroll = 0;

    function down(event: PointerEvent) {
      if (event.pointerType === 'touch') return;
      dragging = true;
      startX = event.clientX;
      startScroll = rail!.scrollLeft;
      rail!.classList.add('worn__rail--dragging');
    }

    function move(event: PointerEvent) {
      if (!dragging) return;
      event.preventDefault();
      rail!.scrollLeft = startScroll - (event.clientX - startX);
    }

    function up() {
      if (!dragging) return;
      dragging = false;
      rail!.classList.remove('worn__rail--dragging');
    }

    rail.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      rail.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, []);

  function step(direction: 1 | -1) {
    const rail = railRef.current;
    if (!rail) return;
    const slide = rail.firstElementChild as HTMLElement | null;
    const width = slide ? slide.offsetWidth + 24 : rail.clientWidth;
    rail.scrollBy({left: direction * width, behavior: 'smooth'});
  }

  if (!VIDEOS.length) return null;

  return (
    <section className="worn" aria-labelledby="worn-heading">
      <h2 className="worn__title" id="worn-heading">
        they talk about us :{' '}
        <a
          className="worn__handle"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {INSTAGRAM_HANDLE}
        </a>
      </h2>

      <div className="worn__viewport">
        <button
          type="button"
          className="worn__arrow worn__arrow--prev"
          onClick={() => step(-1)}
          aria-label="Previous videos"
        >
          <Arrow direction="left" />
        </button>

        <div className="worn__rail" ref={railRef} onScroll={onScroll}>
          {SLIDES.map((slide) => (
            <VideoSlide
              key={slide.key}
              slide={slide}
              active={slide.index === activeIndex}
            />
          ))}
        </div>

        <button
          type="button"
          className="worn__arrow worn__arrow--next"
          onClick={() => step(1)}
          aria-label="Next videos"
        >
          <Arrow direction="right" />
        </button>
      </div>
    </section>
  );
}
