import type {Route} from './+types/histoire';

export const meta: Route.MetaFunction = () => {
  return [{title: "Money Therapy | L'histoire"}];
};

export default function Histoire() {
  return (
    <div className="info-page">
      <p className="info-page__eyebrow">01 — L&rsquo;histoire</p>
      <h1>L&rsquo;histoire de Money Therapy</h1>
      <p className="info-page__intro">
        Le texte de présentation de la marque — origines, positionnement,
        univers — sera ajouté ici une fois rédigé.
      </p>
    </div>
  );
}
