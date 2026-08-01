import {useCallback, useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {getProductVideo, type ProductVideo} from '~/lib/media';

/** Un produit du catalogue, tel qu'il est déjà chargé par la page d'accueil. */
type WornProduct = {
  id: string;
  title: string;
  handle: string;
} & Parameters<typeof getProductVideo>[0];

type Slide = {
  id: string;
  title: string;
  handle: string;
  video: ProductVideo;
};

/**
 * Une vignette vidéo. La lecture ne démarre que lorsque la carte entre dans
 * le champ, et s'arrête dès qu'elle en sort : sans cela, un rail de dix
 * vidéos en autoplay ferait tourner dix décodeurs en continu.
 */
function VideoSlide({slide}: {slide: Slide}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // play() rejette si le navigateur refuse l'autoplay ; la vidéo
          // reste alors sur son poster, ce qui est le comportement voulu.
          void node.play().catch(() => {});
        } else {
          node.pause();
        }
      },
      {threshold: 0.35},
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Link
      to={`/products/${slide.handle}`}
      prefetch="intent"
      className="worn__slide"
      aria-label={slide.title}
    >
      <video
        ref={videoRef}
        className="worn__video"
        poster={slide.video.previewImage?.url ?? undefined}
        muted
        loop
        playsInline
        preload="metadata"
        // Certains navigateurs mobiles n'honorent l'autoplay que si
        // l'attribut est présent au chargement, en plus de l'appel à play().
        autoPlay
        aria-hidden="true"
        tabIndex={-1}
      >
        {slide.video.sources.map((source) => (
          <source key={source.url} src={source.url} type={source.mimeType} />
        ))}
      </video>

      <span className="worn__pill">
        {slide.title}
        <ChevronRight />
      </span>
    </Link>
  );
}

function ChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M4.2 2.4L7.8 6l-3.6 3.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
 * « Nos produits portés » — rail horizontal de vidéos produit.
 *
 * Les vidéos viennent de Shopify : ce sont celles attachées aux produits dans
 * l'admin. Un produit sans vidéo n'apparaît pas, et la section entière
 * disparaît tant qu'aucune vidéo n'est en ligne — rien n'est inventé.
 */
export function WornProducts({products}: {products: WornProduct[]}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const slides: Slide[] = products.flatMap((product) => {
    const video = getProductVideo(product);
    return video
      ? [{id: product.id, title: product.title, handle: product.handle, video}]
      : [];
  });

  /** Désactive la flèche correspondante quand le rail bute d'un côté. */
  const syncEdges = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    setAtStart(rail.scrollLeft <= 1);
    setAtEnd(rail.scrollLeft >= max - 1);
  }, []);

  useEffect(() => {
    syncEdges();
    const rail = railRef.current;
    if (!rail) return;
    window.addEventListener('resize', syncEdges);
    return () => window.removeEventListener('resize', syncEdges);
  }, [syncEdges, slides.length]);

  function scrollByPage(direction: 1 | -1) {
    const rail = railRef.current;
    if (!rail) return;
    // Une carte + son écart : le rail avance d'un cran net, jamais à moitié.
    const step = rail.firstElementChild?.clientWidth ?? rail.clientWidth;
    rail.scrollBy({left: direction * (step + 16), behavior: 'smooth'});
  }

  if (!slides.length) return null;

  return (
    <section className="worn" aria-labelledby="worn-heading">
      <h2 className="worn__title" id="worn-heading">
        nos produits portés
      </h2>

      <div className="worn__viewport">
        <button
          type="button"
          className="worn__arrow worn__arrow--prev"
          onClick={() => scrollByPage(-1)}
          disabled={atStart}
          aria-label="Vidéos précédentes"
        >
          <Arrow direction="left" />
        </button>

        <div className="worn__rail" ref={railRef} onScroll={syncEdges}>
          {slides.map((slide) => (
            <VideoSlide key={slide.id} slide={slide} />
          ))}
        </div>

        <button
          type="button"
          className="worn__arrow worn__arrow--next"
          onClick={() => scrollByPage(1)}
          disabled={atEnd}
          aria-label="Vidéos suivantes"
        >
          <Arrow direction="right" />
        </button>
      </div>
    </section>
  );
}
