import {useId, useState} from 'react';
import type {ReactNode} from 'react';

/** Rotating cross: a plus that becomes a minus as the row opens. */
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

const ITEMS: HelpItem[] = [
  {
    icon: <TruckIcon />,
    question: 'shipping time',
    answer: (
      <p>
        we process and ship all orders within 1&ndash;3 business days. once
        dispatched from our paris studio, delivery takes 48 hours anywhere in
        france, with tracking on every parcel.
      </p>
    ),
  },
  {
    icon: <ReturnIcon />,
    question: 'returns & exchanges',
    answer: (
      <>
        <p>
          returns and exchanges are accepted within 30 days of delivery, on
          unworn pieces in their original packaging.
        </p>
        <p>
          refunds are issued once the returned item reaches us and has been
          checked. the full procedure is on our{' '}
          <a href="/policies/refund-policy">returns page</a>.
        </p>
      </>
    ),
  },
  {
    icon: <ShieldIcon />,
    question: 'legal policies',
    answer: (
      <p>
        our terms are available at any time:{' '}
        <a href="/policies/terms-of-service">terms of service</a>,{' '}
        <a href="/policies/privacy-policy">privacy policy</a> and{' '}
        <a href="/policies/shipping-policy">shipping policy</a>.
      </p>
    ),
  },
  {
    icon: <ChatIcon />,
    question: 'support',
    answer: (
      <p>
        a question about sizing, an order in progress or a return? write to us
        from the <a href="/contact">contact page</a> and we will reply within 24
        working hours.
      </p>
    ),
  },
];

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
        `grid-template-rows: 0fr → 1fr` opens the panel without anyone having
        to guess its height, unlike a max-height picked by eye. The panel stays
        in the DOM so the transition can run in both directions.
      */}
      <div className="help-faq__panel" id={panelId}>
        <div className="help-faq__panel-inner">{item.answer}</div>
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

  return (
    <section className="help-faq" aria-labelledby="help-faq-heading">
      <p className="help-faq__eyebrow">support</p>
      <h2 className="help-faq__title" id="help-faq-heading">
        need some help?
      </h2>

      <div className="help-faq__list">
        {ITEMS.map((item, index) => (
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
