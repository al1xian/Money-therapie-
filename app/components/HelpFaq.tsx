import {useId, useState} from 'react';
import type {ReactNode} from 'react';
import {ChevronDownIcon} from '~/components/Icons';

/** Feuille de papier : retours et échanges, mentions légales. */
function DocumentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect
        x="3.5"
        y="1.75"
        width="11"
        height="14.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M6.5 5.75h5M6.5 9h5M6.5 12.25h3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Bulle de dialogue : service client. */
function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M15.25 8.6c0 3.1-2.8 5.6-6.25 5.6-.72 0-1.4-.1-2.04-.3l-3.21 1.1.9-2.6A5.36 5.36 0 0 1 2.75 8.6C2.75 5.5 5.55 3 9 3s6.25 2.5 6.25 5.6Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M6.6 8.6h.01M9 8.6h.01M11.4 8.6h.01"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

type HelpItem = {
  icon: ReactNode;
  question: string;
  answer: ReactNode;
};

const ITEMS: HelpItem[] = [
  {
    icon: <DocumentIcon />,
    question: 'retours & échanges',
    answer: (
      <>
        <p>
          les retours et les échanges sont acceptés sous 30 jours après
          réception de la commande, sur des pièces non portées et dans leur
          emballage d&rsquo;origine.
        </p>
        <p>
          le remboursement est effectué après réception et contrôle du produit
          retourné. le détail de la procédure figure sur notre page{' '}
          <a href="/policies/refund-policy">politique de retour</a>.
        </p>
      </>
    ),
  },
  {
    icon: <DocumentIcon />,
    question: 'mentions légales',
    answer: (
      <>
        <p>
          l&rsquo;ensemble de nos conditions est consultable à tout moment :{' '}
          <a href="/policies/terms-of-service">conditions générales de vente</a>
          , <a href="/policies/privacy-policy">politique de confidentialité</a>{' '}
          et <a href="/policies/shipping-policy">conditions de livraison</a>.
        </p>
      </>
    ),
  },
  {
    icon: <ChatIcon />,
    question: 'service client',
    answer: (
      <>
        <p>
          une question sur une taille, une commande en cours ou un retour ?
          écrivez-nous depuis la page <a href="/contact">contact</a>, nous
          répondons sous 24h ouvrées.
        </p>
        <p>
          nos commandes partent de notre local à paris et sont livrées en 48h
          partout en france, avec suivi.
        </p>
      </>
    ),
  },
];

function HelpRow({
  item,
  open,
  onToggle,
}: {
  item: HelpItem;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();

  return (
    <div className={`help-faq__item ${open ? 'help-faq__item--open' : ''}`}>
      <button
        type="button"
        className="help-faq__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="help-faq__icon">{item.icon}</span>
        <span className="help-faq__question">{item.question}</span>
        <ChevronDownIcon className="help-faq__chevron" />
      </button>

      {/*
        `grid-template-rows: 0fr → 1fr` ouvre le panneau sans qu'on ait à
        deviner sa hauteur, contrairement à un max-height fixé au jugé. Le
        panneau reste dans le DOM pour que la transition puisse jouer.
      */}
      <div className="help-faq__panel" id={panelId}>
        <div className="help-faq__panel-inner">{item.answer}</div>
      </div>
    </div>
  );
}

/**
 * Bloc d'aide de fin de page : trois entrées repliables, une seule ouverte à
 * la fois. Volontairement léger — c'est un repère pratique, pas la FAQ
 * complète, qui vit sur la page /faq.
 */
export function HelpFaq() {
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <section className="help-faq" aria-labelledby="help-faq-heading">
      <h2 className="help-faq__title" id="help-faq-heading">
        besoin d&rsquo;aide ?
      </h2>

      <div className="help-faq__list">
        {ITEMS.map((item, index) => (
          <HelpRow
            key={item.question}
            item={item}
            open={openIndex === index}
            onToggle={() =>
              setOpenIndex((current) => (current === index ? -1 : index))
            }
          />
        ))}
      </div>
    </section>
  );
}
