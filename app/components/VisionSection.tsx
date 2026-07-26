import {Reveal} from '~/components/Reveal';

/**
 * "La vision Reda Studio" — an editorial statement of what the brand stands
 * for. Five pillars, each with an original geometric mark drawn in the
 * brand's own idiom (thin strokes, quatrefoil geometry, no third-party
 * identity).
 *
 * This is the brand speaking about itself: no citations, no awards, no press
 * mentions, nothing attributed to anyone outside Reda Studio.
 */

type Mark = ({className}: {className?: string}) => React.ReactElement;

/** Ascending strokes — ambition. */
const AmbitionMark: Mark = ({className}) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M5 25V17M12.3 25V12M19.7 25V7M27 25V13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

/** The house quatrefoil — identity. */
const IdentityMark: Mark = ({className}) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path
      d="M16 5c2.9 0 5.2 2.3 5.2 5.2 0 .2 0 .4 0 .6.2 0 .4 0 .6 0 2.9 0 5.2 2.3 5.2 5.2s-2.3 5.2-5.2 5.2c-.2 0-.4 0-.6 0 0 .2 0 .4 0 .6 0 2.9-2.3 5.2-5.2 5.2s-5.2-2.3-5.2-5.2c0-.2 0-.4 0-.6-.2 0-.4 0-.6 0C7.3 21.2 5 18.9 5 16s2.3-5.2 5.2-5.2c.2 0 .4 0 .6 0 0-.2 0-.4 0-.6C10.8 7.3 13.1 5 16 5z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

/** One line, one point — minimalism. */
const MinimalismMark: Mark = ({className}) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M5 20h22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="16" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

/** Interlocking city blocks — streetwear. */
const StreetwearMark: Mark = ({className}) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect x="5" y="12" width="10" height="15" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <rect x="17" y="5" width="10" height="22" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M8.6 17.5h2.8M20.6 10.5h2.8M20.6 17.5h2.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

/** A lens focusing forward — vision. */
const VisionMark: Mark = ({className}) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="16" cy="16" r="4.6" stroke="currentColor" strokeWidth="1.4" />
    <path d="M16 5v3.2M16 23.8V27M5 16h3.2M23.8 16H27" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const PILLARS: Array<{title: string; body: string; Mark: Mark}> = [
  {
    title: 'ambition',
    body: 'Une nouvelle génération guidée par l’ambition et la volonté de construire son propre avenir.',
    Mark: AmbitionMark,
  },
  {
    title: 'identité',
    body: 'Des pièces distinctives pensées pour celles et ceux qui refusent de passer inaperçus.',
    Mark: IdentityMark,
  },
  {
    title: 'minimalisme',
    body: 'Une esthétique épurée où chaque coupe, matière et détail possède une véritable fonction.',
    Mark: MinimalismMark,
  },
  {
    title: 'streetwear',
    body: 'Une vision contemporaine du streetwear, entre élégance, caractère et culture urbaine.',
    Mark: StreetwearMark,
  },
  {
    title: 'vision',
    body: 'Reda Studio ne suit pas simplement les tendances : la marque développe son propre univers.',
    Mark: VisionMark,
  },
];

export function VisionSection() {
  return (
    <section className="vision" aria-labelledby="vision-heading">
      <Reveal className="vision__head">
        <h2 className="vision__title" id="vision-heading">
          la vision reda studio
        </h2>
        <p className="vision__intro">
          Reda Studio développe une vision premium et minimaliste du streetwear.
          Chaque création est pensée autour de l’ambition, de l’identité et du
          souci du détail.
        </p>
      </Reveal>

      {/* Five aligned blocks on desktop; the same markup becomes a horizontal
          carousel on mobile (see .vision__rail). */}
      <div className="vision__rail">
        {PILLARS.map(({title, body, Mark}, index) => (
          <Reveal
            key={title}
            className="vision__card"
            style={{transitionDelay: `${index * 70}ms`}}
          >
            <span className="vision__mark" aria-hidden="true">
              <Mark />
            </span>
            <h3 className="vision__card-title">{title}</h3>
            <p className="vision__card-body">{body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
