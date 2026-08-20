import {useId, useState} from 'react';
import type {ReactNode} from 'react';
import {Link} from 'react-router';
import {useT, type Translate} from '~/lib/i18n';

/**
 * A plus that turns into a minus as the row opens: the whole cross makes a
 * half-turn while the upright bar fades out, leaving the horizontal one.
 *
 * The half-turn matters. A quarter-turn maps the upright bar onto the
 * horizontal axis and the horizontal one onto the upright axis — so fading the
 * upright bar leaves a *vertical* stroke, not a minus.
 */
function PlusIcon() {
  return (
    <svg
      className="help-faq__toggle"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="help-faq__toggle-bar"
        d="M8 2.5v11"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M2.5 8h11"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M1.75 4.5h9.5v8.75h-9.5zM11.25 7.75h3.4l3.6 3.1v2.4h-7z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <circle cx="5.5" cy="15" r="1.6" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="14.5" cy="15" r="1.6" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4.5 8.25A6 6 0 1 1 4.6 12"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M1.9 5.1v3.4h3.4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.25l6 2.2v5.1c0 3.4-2.4 6.4-6 8.2-3.6-1.8-6-4.8-6-8.2v-5.1z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M17 9.6c0 3.4-3.1 6.2-7 6.2-.8 0-1.6-.12-2.3-.34l-3.6 1.24 1-2.9A5.9 5.9 0 0 1 3 9.6C3 6.2 6.1 3.4 10 3.4s7 2.8 7 6.2Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type HelpItem = {
  icon: ReactNode;
  question: string;
  answer: ReactNode;
};

/**
 * Built inside the component rather than as a module constant, because every
 * string in it depends on the language and a constant would be frozen at
 * whatever the first render happened to be.
 */
function buildItems(t: Translate): HelpItem[] {
  return [
    {
      icon: <TruckIcon />,
      question: t('faq.shipping'),
      answer: (
        <p>
          {t('faq.shippingBody')}{' '}
          <Link to="/order-tracking">{t('faq.trackingPage')}</Link>.
        </p>
      ),
    },
    {
      icon: <ReturnIcon />,
      question: t('faq.returns'),
      answer: (
        <>
          <p>{t('faq.returnsBody1')}</p>
          <p>
            {t('faq.returnsBody2')}{' '}
            <Link to="/legal/returns">{t('faq.returnsPage')}</Link>.
          </p>
        </>
      ),
    },
    {
      icon: <ShieldIcon />,
      question: t('faq.legal'),
      answer: (
        <p>
          {t('faq.legalBody')}{' '}
          <Link to="/legal/terms">{t('faq.terms')}</Link>,{' '}
          <Link to="/legal/privacy">{t('faq.privacy')}</Link> {t('faq.and')}{' '}
          <Link to="/legal/shipping">{t('faq.shippingPolicy')}</Link>.
        </p>
      ),
    },
    {
      icon: <ChatIcon />,
      question: t('faq.support'),
      answer: (
        <p>
          {t('faq.supportBody')} <Link to="/contact">{t('faq.contactPage')}</Link>{' '}
          {t('faq.supportBodyEnd')}
        </p>
      ),
    },
  ];
}

function HelpRow({
  item,
  index,
  open,
  onToggle,
}: {
  item: HelpItem;
  index: number;
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
        <span className="help-faq__index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="help-faq__icon">{item.icon}</span>
        <span className="help-faq__question">{item.question}</span>
        <PlusIcon />
      </button>

      {/*
        Three nested elements, one job each — which is what makes the movement
        read as one gesture rather than several.

        `panel` owns the height: `grid-template-rows: 0fr → 1fr` animates the
        content's real height without anyone having to guess it.
        `panel-inner` is the clipper, and never moves — a transform on an
        `overflow: hidden` box drags its clipping rectangle along, so the
        content would shift without ever appearing to slide.
        `panel-content` is the only thing that fades and slides.

        All three stay in the DOM so the transition runs in both directions.
      */}
      <div className="help-faq__panel" id={panelId}>
        <div className="help-faq__panel-inner">
          <div className="help-faq__panel-content">{item.answer}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Closing help block: four collapsible entries, one open at a time.
 * Deliberately light — a practical signpost, not the full FAQ, which lives on
 * the /faq page.
 */
export function HelpFaq() {
  const [openIndex, setOpenIndex] = useState(-1);
  const t = useT();
  const items = buildItems(t);

  return (
    <section className="help-faq" aria-labelledby="help-faq-heading">
      <p className="help-faq__eyebrow">{t('faq.eyebrow')}</p>
      <h2 className="help-faq__title" id="help-faq-heading">
        {t('faq.title')}
      </h2>

      <div className="help-faq__list">
        {items.map((item, index) => (
          <HelpRow
            key={item.question}
            item={item}
            index={index}
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
