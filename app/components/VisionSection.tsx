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
    body: 'A new generation driven by ambition and the will to build a future of its own.',
  },
  {
    title: 'identity',
    body: 'Distinctive pieces made for the people who refuse to go unnoticed.',
  },
  {
    title: 'minimalism',
    body: 'A stripped-back aesthetic where every cut, fabric and detail serves a real purpose.',
  },
  {
    title: 'streetwear',
    body: 'A contemporary take on streetwear, between elegance, character and city culture.',
  },
  {
    title: 'vision',
    body: 'Reda Studio does not simply follow trends — the house builds a world of its own.',
  },
];

export function VisionSection() {
  return (
    <section className="vision" aria-labelledby="vision-heading">
      <Reveal className="vision__head">
        <h2 className="vision__title" id="vision-heading">
          the reda studio vision
        </h2>
        <p className="vision__intro">
          Reda Studio builds a premium, minimalist vision of streetwear. Our
          pieces are made for founders, creators and anyone building something
          of their own: every design is shaped around ambition, identity and a
          refusal to overlook the detail.
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
          discover the story behind the brand
        </Link>
      </Reveal>
    </section>
  );
}
