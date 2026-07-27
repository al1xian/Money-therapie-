import {Link} from 'react-router';
import {Reveal} from '~/components/Reveal';

/**
 * "La vision Reda Studio" — an editorial statement of what the brand stands
 * for: five numbered pillars, then a link through to the brand story.
 *
 * This is the brand speaking about itself: no citations, no awards, no press
 * mentions, nothing attributed to anyone outside Reda Studio.
 */

const PILLARS: Array<{title: string; body: string}> = [
  {
    title: 'ambition',
    body: 'Une nouvelle génération guidée par l’ambition et la volonté de construire son propre avenir.',
  },
  {
    title: 'identité',
    body: 'Des pièces distinctives pensées pour celles et ceux qui refusent de passer inaperçus.',
  },
  {
    title: 'minimalisme',
    body: 'Une esthétique épurée où chaque coupe, matière et détail possède une véritable fonction.',
  },
  {
    title: 'streetwear',
    body: 'Une vision contemporaine du streetwear, entre élégance, caractère et culture urbaine.',
  },
  {
    title: 'vision',
    body: 'Reda Studio ne suit pas simplement les tendances : la marque développe son propre univers.',
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
          Reda Studio développe une vision premium et minimaliste du
          streetwear. Nos pièces sont confectionnées pour les entrepreneurs,
          les créateurs et celles et ceux qui construisent quelque chose :
          chaque création est pensée autour de l’ambition, de l’identité et du
          souci du détail.
        </p>
      </Reveal>

      {/* Five aligned blocks on desktop; the same markup becomes a horizontal
          carousel on mobile (see .vision__rail). */}
      <div className="vision__rail">
        {PILLARS.map(({title, body}, index) => (
          <Reveal
            key={title}
            className="vision__card"
            style={{transitionDelay: `${index * 70}ms`}}
          >
            <span className="vision__index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="vision__card-title">{title}</h3>
            <p className="vision__card-body">{body}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="vision__cta">
        <Link to="/about" prefetch="intent" className="btn">
          découvrir l’histoire de la marque
        </Link>
      </Reveal>
    </section>
  );
}
