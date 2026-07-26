import type {Route} from './+types/faq';
import {Reveal} from '~/components/Reveal';
import {Accordion} from '~/components/Accordion';
import {generalFaq, productFaq} from '~/data/faq';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'reda studio | faq'},
    {name: 'description', content: 'questions fréquentes — reda studio.'},
  ];
};

export default function Faq() {
  return (
    <div className="faq-page">
      <Reveal as="section">
        <h1 className="section-title">questions fréquentes</h1>
        <p className="faq-page__intro">
          livraison, retours, entretien... retrouvez ici les réponses aux
          questions les plus fréquentes sur reda studio et nos produits.
        </p>
      </Reveal>

      <Reveal as="section">
        <h2 className="faq-page__group-title">commande &amp; livraison</h2>
        <div className="pdp__accordions">
          {generalFaq.map((item) => (
            <Accordion key={item.question} title={item.question}>
              <p>{item.answer}</p>
            </Accordion>
          ))}
        </div>
      </Reveal>

      <Reveal as="section">
        <h2 className="faq-page__group-title">nos produits</h2>
        <div className="pdp__accordions">
          {productFaq.map((item) => (
            <Accordion key={item.question} title={item.question}>
              <p>{item.answer}</p>
            </Accordion>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
