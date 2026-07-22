import type {Route} from './+types/about';

export const meta: Route.MetaFunction = () => {
  return [{title: 'money therapy | à propos'}];
};

export default function About() {
  return (
    <div className="page">
      <h1>à propos</h1>
      <p>
        money therapy est un studio de vêtements pensés pour durer : des
        pièces essentielles, des matières choisies, une coupe nette.
      </p>
      <p>
        Le texte de présentation de la marque sera complété ici avec votre
        histoire et votre positionnement.
      </p>
    </div>
  );
}
