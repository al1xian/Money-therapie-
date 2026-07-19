import type {Route} from './+types/equipe';

export const meta: Route.MetaFunction = () => {
  return [{title: "Money Therapy | L'équipe"}];
};

export default function Equipe() {
  return (
    <div className="info-page">
      <p className="info-page__eyebrow">02 — L&rsquo;équipe</p>
      <h1>Les personnes derrière Money Therapy</h1>
      <p className="info-page__intro">
        La présentation de l&rsquo;équipe sera ajoutée ici une fois le contenu
        et les visuels fournis.
      </p>
    </div>
  );
}
