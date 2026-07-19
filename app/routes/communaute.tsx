import type {Route} from './+types/communaute';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Money Therapy | La communauté'}];
};

export default function Communaute() {
  return (
    <div className="info-page">
      <p className="info-page__eyebrow">03 — La communauté</p>
      <h1>La communauté Money Therapy</h1>
      <p className="info-page__intro">
        Cette page mettra en avant les personnes qui portent la marque une
        fois les visuels et témoignages fournis.
      </p>
    </div>
  );
}
