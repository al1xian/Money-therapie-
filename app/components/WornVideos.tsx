import {useCallback, useEffect, useRef, useState} from 'react';

/**
 * Vidéos du dossier `public/videos`. Pour en ajouter ou en retirer une, il
 * suffit de modifier ce tableau — le composant ne dépend de rien d'autre.
 */
const VIDEOS: Array<{src: string; poster: string; label: string}> = [
  {src: '/videos/porte-01.mp4', poster: '/videos/porte-01.webp', label: 'Look reda studio en extérieur'},
  {src: '/videos/porte-02.mp4', poster: '/videos/porte-02.webp', label: 'Look reda studio en intérieur'},
  {src: '/videos/porte-03.mp4', poster: '/videos/porte-03.webp', label: 'Détail d’une pièce reda studio'},
  {src: '/videos/porte-04.mp4', poster: '/videos/porte-04.webp', label: 'Tenue reda studio portée'},
  {src: '/videos/porte-05.mp4', poster: '/videos/porte-05.webp', label: 'Pièce reda studio en mouvement'},
];

/**
 * Une vignette vidéo.
 *
 * La source n'est posée sur l'élément qu'une fois la carte proche de l'écran :
 * sans cela, la page d'accueil téléchargerait plusieurs mégaoctets de vidéo
 * dès son ouverture. La lecture démarre à l'entrée dans le champ et se met en
 * pause à la sortie, pour ne jamais faire tourner cinq décodeurs à la fois.
 */
function VideoSlide({
  src,
  poster,
  label,
}: {
  src: string;
  poster: string;
  label: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;

    // Marge large : la vidéo est prête avant d'être réellement visible.
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
          // play() rejette si le navigateur refuse la lecture automatique ;
          // la vidéo reste alors sur sa première image, ce qui est voulu.
          void node.play().catch(() => {});
        } else {
          node.pause();
        }
      },
      {threshold: 0.35},
    );
    player.observe(node);

    return () => {
      preloader.disconnect();
      player.disconnect();
    };
  }, []);

  return (
    <div className="worn__slide">
      {/*
        Le poster est la première image de la vidéo : la vignette est déjà
        visible avant que le fichier ne soit chargé, et le rail ne se remplit
        pas de rectangles vides au premier affichage.
      */}
      <video
        ref={videoRef}
        className="worn__video"
        src={loaded ? src : undefined}
        poster={poster}
        aria-label={label}
        muted
        loop
        playsInline
        autoPlay
        preload="none"
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
 * « Nos produits portés » — carrousel horizontal de vidéos.
 *
 * Composant autonome : il lit les fichiers du dossier `public/videos` et ne
 * dépend ni du catalogue Shopify ni d'aucun autre composant du site.
 */
export function WornVideos() {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

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
    window.addEventListener('resize', syncEdges);
    return () => window.removeEventListener('resize', syncEdges);
  }, [syncEdges]);

  function scrollByPage(direction: 1 | -1) {
    const rail = railRef.current;
    if (!rail) return;
    // Une carte + son écart : le rail avance d'un cran net, jamais à moitié.
    const step = rail.firstElementChild?.clientWidth ?? rail.clientWidth;
    rail.scrollBy({left: direction * (step + 16), behavior: 'smooth'});
  }

  if (!VIDEOS.length) return null;

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
          {VIDEOS.map((video) => (
            <VideoSlide
              key={video.src}
              src={video.src}
              poster={video.poster}
              label={video.label}
            />
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
