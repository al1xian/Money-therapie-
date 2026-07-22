const MESSAGES = [
  'livraison offerte dès 150€',
  'retours sous 30 jours',
  'échanges gratuits',
  'paiement 100% sécurisé',
];

/**
 * Infinite horizontal marquee. The message list is rendered twice back to
 * back and the track is translated by -50%, so the loop is seamless.
 */
export function Marquee() {
  // Rendered twice for a seamless loop; the copy index keeps keys unique.
  const doubled = [
    ...MESSAGES.map((m, i) => ({m, key: `a-${i}`})),
    ...MESSAGES.map((m, i) => ({m, key: `b-${i}`})),
  ];
  return (
    <div className="marquee" aria-hidden="true">
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
