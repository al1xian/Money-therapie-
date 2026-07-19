import {useState, useId} from 'react';
import {PlusIcon, MinusIcon} from '~/components/Icons';

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
  const contentId = useId();

  return (
    <div className="accordion">
      <button
        type="button"
        className="accordion__trigger"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        {open ? <MinusIcon /> : <PlusIcon />}
      </button>
      <div
        id={contentId}
        className="accordion__panel"
        hidden={!open}
      >
        <div className="accordion__panel-inner">{children}</div>
      </div>
    </div>
  );
}
