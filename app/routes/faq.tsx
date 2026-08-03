import type {Route} from './+types/faq';
import {Reveal} from '~/components/Reveal';
import {BigFaqAccordion} from '~/components/BigFaqAccordion';
import {generalFaq, productFaq} from '~/data/faq';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'reda studio | faq'},
    {name: 'description', content: 'frequently asked questions — reda studio.'},
  ];
};

export default function Faq() {
  return (
    <div className="faq-page">
      <Reveal as="section">
        <h1 className="section-title">frequently asked questions</h1>
        <p className="faq-page__intro">
          shipping, returns, care — the answers to the questions we are asked
          most often about reda studio and our pieces.
        </p>
      </Reveal>

      <Reveal as="section">
        <h2 className="faq-page__group-title">orders &amp; shipping</h2>
        <BigFaqAccordion items={generalFaq} />
      </Reveal>

      <Reveal as="section">
        <h2 className="faq-page__group-title">our pieces</h2>
        <BigFaqAccordion items={productFaq} />
      </Reveal>
    </div>
  );
}
