import {Link} from 'react-router';
import {Reveal} from '~/components/Reveal';
import {useT, type TranslationKey} from '~/lib/i18n';

/**
 * "La vision Reda Studio" — an editorial statement of what the brand stands
 * for: five numbered pillars, then a link through to the brand story.
 *
 * This is the brand speaking about itself: no citations, no awards, no press
 * mentions, nothing attributed to anyone outside Reda Studio.
 */

/**
 * The five pillars, as dictionary keys rather than text: the words themselves
 * are resolved at render time, so the section follows the language like
 * everything else.
 */
const PILLARS: Array<{titleKey: TranslationKey; bodyKey: TranslationKey}> = [
  {titleKey: 'vision.ambition', bodyKey: 'vision.ambitionBody'},
  {titleKey: 'vision.identity', bodyKey: 'vision.identityBody'},
  {titleKey: 'vision.minimalism', bodyKey: 'vision.minimalismBody'},
  {titleKey: 'vision.streetwear', bodyKey: 'vision.streetwearBody'},
  {titleKey: 'vision.vision', bodyKey: 'vision.visionBody'},
];

export function VisionSection() {
  const t = useT();

  return (
    <section className="vision" aria-labelledby="vision-heading">
      <Reveal className="vision__head">
        <h2 className="vision__title" id="vision-heading">
          {t('vision.title')}
        </h2>
        <p className="vision__intro">{t('vision.intro')}</p>
      </Reveal>

      {/* Five aligned blocks on desktop; the same markup becomes a horizontal
          carousel on mobile (see .vision__rail). */}
      <div className="vision__rail">
        {PILLARS.map(({titleKey, bodyKey}, index) => (
          <Reveal
            key={titleKey}
            className="vision__card"
            style={{transitionDelay: `${index * 70}ms`}}
          >
            <span className="vision__index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="vision__card-title">{t(titleKey)}</h3>
            <p className="vision__card-body">{t(bodyKey)}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="vision__cta">
        <Link to="/about" prefetch="intent" className="btn">
          {t('vision.cta')}
        </Link>
      </Reveal>
    </section>
  );
}
