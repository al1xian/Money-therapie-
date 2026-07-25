import {Link} from 'react-router';
import type {Route} from './+types/about';
import {Reveal} from '~/components/Reveal';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'reda studio | à propos'},
    {
      name: 'description',
      content: 'reda studio — un studio de vêtements minimalistes, pensés pour durer.',
    },
  ];
};

const values = [
  {
    title: 'simplicité',
    body: 'des pièces essentielles, sans logo tape-à-l’œil ni surcharge — la coupe et la matière font le vêtement.',
  },
  {
    title: 'durabilité',
    body: 'des matières choisies pour tenir dans le temps, plutôt que suivre une tendance qui s’efface en une saison.',
  },
  {
    title: 'attention au détail',
    body: 'chaque référence est vérifiée avant sa mise en vente — finitions, tombé, confort.',
  },
];

export default function About() {
  return (
    <div className="about">
      <Reveal as="section" className="about__intro">
        <p className="about__eyebrow">notre histoire</p>
        <h1 className="about__title">reda studio</h1>
        <p className="about__lead">
          un studio de vêtements pensés pour durer : des pièces essentielles,
          des matières choisies, une coupe nette.
        </p>
      </Reveal>

      <Reveal as="section" className="about__figure">
        <img
          src="/images/P1973928-2.webp"
          alt="Deux personnes en tenue reda studio, ambiance urbaine"
          loading="lazy"
          decoding="async"
        />
      </Reveal>

      <Reveal as="section" className="about__block">
        <p className="about__eyebrow">notre approche</p>
        <h2>penser le vêtement dans la durée</h2>
        <p>
          reda studio conçoit des vêtements sobres, pensés pour être portés
          longtemps plutôt que renouvelés à chaque saison. chaque pièce est
          choisie pour sa coupe, sa matière et sa capacité à traverser le
          temps sans se démoder.
        </p>
        <p>
          nous préférons un vestiaire resserré et bien pensé à une collection
          surchargée — moins de pièces, mieux choisies.
        </p>
      </Reveal>

      <section className="about__values">
        {values.map((value, index) => (
          <Reveal key={value.title} as="div" className="about__value" style={{transitionDelay: `${index * 80}ms`}}>
            <h3>{value.title}</h3>
            <p>{value.body}</p>
          </Reveal>
        ))}
      </section>

      <Reveal as="section" className="about__cta">
        <h2>découvrir la collection</h2>
        <p>l’ensemble des pièces disponibles, sélectionnées avec le même soin.</p>
        <Link to="/collections/all" className="btn">
          voir la boutique
        </Link>
      </Reveal>
    </div>
  );
}
