import {Link} from 'react-router';
import type {Route} from './+types/about';
import {Reveal} from '~/components/Reveal';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'reda studio | notre histoire'},
    {
      name: 'description',
      content:
        'reda studio — maison streetwear indépendante, premium et minimaliste, inspirée par l’ambition et la culture contemporaine.',
    },
  ];
};

const pillars = [
  {
    title: 'ambition',
    body: 'reda studio est né pour ceux qui avancent — des pièces pensées pour accompagner l’exigence, pas pour la commenter.',
  },
  {
    title: 'élégance',
    body: 'une base noir & blanc, des coupes nettes, aucune fioriture. le minimalisme comme forme de rigueur.',
  },
  {
    title: 'culture',
    body: 'un vestiaire streetwear enraciné dans la ville, informé par l’art, la musique et l’époque dans laquelle il vit.',
  },
];

export default function About() {
  return (
    <div className="about">
      <Reveal as="section" className="about__intro">
        <p className="about__eyebrow">notre histoire</p>
        <h1 className="about__title">reda studio</h1>
        <p className="about__lead">
          une maison streetwear indépendante, née d’une conviction simple :
          l’ambition mérite un vestiaire à sa mesure — premium, minimaliste,
          sans compromis.
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
        <p className="about__eyebrow">l’origine</p>
        <h2>une maison indépendante</h2>
        <p>
          reda studio est une maison indépendante. pas de gros logo, pas de
          collections surdimensionnées — une ligne resserrée, pensée pièce par
          pièce, pour celles et ceux qui construisent quelque chose.
        </p>
        <p>
          notre point de départ, c’est la rue et son exigence silencieuse :
          des vêtements qui en disent long sans avoir besoin de crier.
        </p>
      </Reveal>

      <Reveal as="section" className="about__manifesto">
        <p>
          « s&rsquo;habiller avec ambition, c&rsquo;est choisir la sobriété
          plutôt que le bruit. »
        </p>
      </Reveal>

      <Reveal as="section" className="about__block">
        <p className="about__eyebrow">notre approche</p>
        <h2>premium, minimaliste, intemporel</h2>
        <p>
          chaque pièce reda studio est conçue pour durer — dans sa matière
          comme dans son style. nous préférons un vestiaire resserré et bien
          pensé à une collection surchargée : moins de pièces, mieux choisies,
          mieux faites.
        </p>
        <p>
          l’élégance, chez nous, n’est pas un supplément : c’est le point de
          départ de chaque coupe, de chaque tissu, de chaque détail.
        </p>
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
        <h2>découvrir la collection</h2>
        <p>l’ensemble des pièces disponibles, sélectionnées avec le même soin.</p>
        <Link to="/collections/all" className="btn">
          voir la boutique
        </Link>
      </Reveal>
    </div>
  );
}
