import {useState} from 'react';
import {useHeaderTone} from '~/lib/header-tone';

const MESSAGES = [
  'livraison offerte dès 100€',
  'nouveau drop disponible',
  '-10% avec le code reda10',
];

/**
 * Infinite horizontal marquee. The message list is rendered twice back to
 * back and the track is translated by -50%, so the loop is seamless. Only
 * shown at the very top of the page — hidden as soon as the user scrolls,
 * so it doesn't permanently eat into the fixed header's space.
 */
export function Marquee() {
  const {scrolled} = useHeaderTone();
  const [pulsing, setPulsing] = useState(false);

  // Rendered twice for a seamless loop; the copy index keeps keys unique.
  const doubled = [
    ...MESSAGES.map((m, i) => ({m, key: `a-${i}`})),
    ...MESSAGES.map((m, i) => ({m, key: `b-${i}`})),
  ];

  return (
    <div
      className={`marquee ${scrolled ? 'marquee--hidden' : ''} ${pulsing ? 'marquee--pulse' : ''}`}
      onClick={() => setPulsing(true)}
      onAnimationEnd={() => setPulsing(false)}
      aria-hidden="true"
    >
      <div className="marquee__track">
        {doubled.map(({m, key}) => (
          <span className="marquee__item" key={key}>
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
