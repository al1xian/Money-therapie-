const STEPS = [
  {label: 'Commande'},
  {label: 'Expédition'},
  {label: 'Livraison'},
];

export function DeliveryTimeline() {
  return (
    <div className="delivery-timeline" aria-hidden="true">
      {STEPS.map((step, index) => (
        <div className="delivery-timeline__step" key={step.label}>
          <span className="delivery-timeline__dot" />
          <span className="delivery-timeline__label">{step.label}</span>
          {index < STEPS.length - 1 && <span className="delivery-timeline__line" />}
        </div>
      ))}
    </div>
  );
}
