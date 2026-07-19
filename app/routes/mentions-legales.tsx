import type {Route} from './+types/mentions-legales';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Money Therapy | Mentions légales'}];
};

export default function LegalNotice() {
  return (
    <div className="info-page legal-page">
      <h1>Mentions légales</h1>
      <p className="legal-page__notice" role="note">
        Cette page est un modèle à compléter avec vos informations légales
        réelles avant la mise en ligne du site — elles sont obligatoires pour
        un site e-commerce en France.
      </p>

      <section>
        <h2>Éditeur du site</h2>
        <p>
          Raison sociale : [à compléter]
          <br />
          Forme juridique : [à compléter]
          <br />
          SIRET : [à compléter]
          <br />
          Adresse du siège social : [à compléter]
          <br />
          Directeur de la publication : [à compléter]
          <br />
          Contact : voir la page{' '}
          <a href="/contact">Contact</a>
        </p>
      </section>

      <section>
        <h2>Hébergement</h2>
        <p>
          Ce site est hébergé par Shopify Inc. sur son infrastructure Oxygen.
          <br />
          Shopify Inc., 151 O&rsquo;Connor Street, Ottawa, ON K2P 2L8, Canada.
        </p>
      </section>

      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          L&rsquo;ensemble des contenus présents sur ce site (textes, images,
          identité visuelle) est la propriété de Money Therapy, sauf mention
          contraire, et ne peut être reproduit sans autorisation préalable.
        </p>
      </section>

      <section>
        <h2>Données personnelles</h2>
        <p>
          Le traitement des données personnelles est détaillé dans notre{' '}
          <a href="/policies/privacy-policy">politique de confidentialité</a>.
        </p>
      </section>
    </div>
  );
}
