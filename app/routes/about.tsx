import {Link} from 'react-router';
import type {Route} from './+types/about';
import {Reveal} from '~/components/Reveal';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'reda studio | our story'},
    {
      name: 'description',
      content:
        'reda studio — an independent streetwear house: premium, minimalist, driven by ambition and contemporary culture.',
    },
  ];
};

const pillars = [
  {
    title: 'ambition',
    body: 'reda studio was built for people who move — pieces made to keep up with high standards, not to comment on them.',
  },
  {
    title: 'elegance',
    body: 'a black and white foundation, clean cuts, no ornament. minimalism as a form of discipline.',
  },
  {
    title: 'culture',
    body: 'a streetwear wardrobe rooted in the city, informed by art, music and the era it lives in.',
  },
];

/**
 * Visual closing each text block. One image per block, always in the same
 * place, so the page reads as an alternation texte → image du début à la fin.
 */
function BlockFigure({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  return (
    <figure className="about__block-media">
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
      />
    </figure>
  );
}

export default function About() {
  return (
    <div className="about">
      <Reveal as="section" className="about__intro">
        <p className="about__eyebrow">our story</p>
        <h1 className="about__title">reda studio</h1>
        <p className="about__lead">
          an independent streetwear house, born from a simple conviction:
          ambition deserves a wardrobe to match &mdash; premium, minimalist,
          uncompromising.
        </p>
        <BlockFigure
          src="/images/histoire-piscine.webp"
          alt="All-black reda studio outfit by a poolside facing the sea at sunset"
          width={675}
          height={1200}
        />
      </Reveal>

      <Reveal as="section" className="about__block">
        <p className="about__eyebrow">the origin</p>
        <h2>an independent house</h2>
        <p>
          reda studio is an independent house. no oversized logo, no bloated
          collections &mdash; a tight line, considered piece by piece, for the
          people building something.
        </p>
        <p>
          our starting point is the street and its quiet standards: clothes
          that say a great deal without ever needing to shout.
        </p>
        <BlockFigure
          src="/images/histoire-cerisiers.webp"
          alt="reda studio outfit: oversized white tee and embroidered washed jeans under cherry blossom"
          width={675}
          height={1200}
        />
      </Reveal>

      <Reveal as="section" className="about__manifesto">
        <p>
          &ldquo;dressing with ambition means choosing restraint over
          noise.&rdquo;
        </p>
      </Reveal>

      <Reveal as="section" className="about__block">
        <p className="about__eyebrow">our approach</p>
        <h2>premium, minimalist, timeless</h2>
        <p>
          every reda studio piece is designed to last &mdash; in its fabric as
          much as in its style. we would rather offer a tight, considered
          wardrobe than an overloaded collection: fewer pieces, better chosen,
          better made.
        </p>
        <p>
          elegance, here, is not an extra. it is the starting point of every
          cut, every fabric, every detail.
        </p>
        <BlockFigure
          src="/images/histoire-chambre.webp"
          alt="Embroidered reda studio jeans in a room overlooking the city at night"
          width={675}
          height={1200}
        />
      </Reveal>

      <Reveal as="section" className="about__block">
        <p className="about__eyebrow">the detail</p>
        <h2>the cut above all</h2>
        <p>
          our pieces are made in portugal, then checked one by one before
          going on sale. seams, hems, drape: nothing ships unless the detail is
          right.
        </p>
        <p>
          that invisible work is what shows in the wearing &mdash; a piece that
          holds its shape, its wash and its line, load after load.
        </p>
        <BlockFigure
          src="/images/lookbook-denim.webp"
          alt="Two pairs of reda studio flare jeans laid flat, one blue wash and one black"
          width={901}
          height={1200}
        />
      </Reveal>

      <section className="about__values">
        {pillars.map((pillar, index) => (
          <Reveal
            key={pillar.title}
            as="div"
            className="about__value"
            style={{transitionDelay: `${index * 80}ms`}}
          >
            <h3>{pillar.title}</h3>
            <p>{pillar.body}</p>
          </Reveal>
        ))}
      </section>

      <Reveal as="section" className="about__cta">
        <h2>discover the collection</h2>
        <p>every available piece, chosen with the same care.</p>
        <Link to="/collections/all" className="btn">
          shop the collection
        </Link>
      </Reveal>
    </div>
  );
}
