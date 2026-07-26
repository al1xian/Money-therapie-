import {useRef, useState} from 'react';
import {ChevronDownIcon, GearIcon, GridIcon, PersonIcon, QuestionIcon} from '~/components/Icons';
import type {FaqItem} from '~/data/faq';

const ICONS = [QuestionIcon, GridIcon, GearIcon, PersonIcon];

function BigFaqRow({
  item,
  index,
  open,
  onToggle,
}: {
  item: FaqItem;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const Icon = ICONS[index % ICONS.length];

  return (
    <div className={`big-faq__item ${open ? 'big-faq__item--open' : ''}`}>
      <button type="button" className="big-faq__trigger" aria-expanded={open} onClick={onToggle}>
        <span className="big-faq__icon">
          <Icon />
        </span>
        <span className="big-faq__question">{item.question}</span>
        <span className="big-faq__meta">
          <span className="big-faq__tag">item-{index + 1}</span>
          <ChevronDownIcon className="big-faq__chevron" />
        </span>
      </button>
      <div
        ref={panelRef}
        className="big-faq__panel"
        style={{maxHeight: open ? `${panelRef.current?.scrollHeight ?? 400}px` : '0px'}}
      >
        <div className="big-faq__panel-inner">{item.answer}</div>
      </div>
    </div>
  );
}

/**
 * Big, dark, single-open FAQ accordion — deliberately a heavier visual
 * moment than the plain in-context Accordion used on product pages.
 */
export function BigFaqAccordion({items}: {items: FaqItem[]}) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="big-faq">
      {items.map((item, index) => (
        <BigFaqRow
          key={item.question}
          item={item}
          index={index}
          open={openIndex === index}
          onToggle={() => setOpenIndex((current) => (current === index ? -1 : index))}
        />
      ))}
    </div>
  );
}
