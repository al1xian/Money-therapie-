import {useId, useRef, useState} from 'react';
import {ChevronDownIcon} from '~/components/Icons';

export function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <div className="accordion">
      <button
        type="button"
        className="accordion__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <ChevronDownIcon className="accordion__chevron" />
      </button>
      <div
        id={panelId}
        ref={panelRef}
        className="accordion__panel"
        style={{
          maxHeight: open ? `${panelRef.current?.scrollHeight ?? 600}px` : '0px',
          transition: 'max-height 300ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="accordion__panel-inner">{children}</div>
      </div>
    </div>
  );
}
