import {useId, useRef, useState} from 'react';
import {ChevronDownIcon} from '~/components/Icons';
import {useT} from '~/lib/i18n';

/**
 * Collapsible product description. Collapsed by default: only the heading,
 * the chevron and an optional one-line intro are visible.
 *
 * Closing preserves the reader's position exactly. Collapsing shortens the
 * page, and if the viewport was scrolled near the bottom the browser clamps
 * scrollY and yanks the reader upward. To prevent that we pin the trigger's
 * on-screen offset: we record it before the toggle and restore it after the
 * DOM updates and again when the height transition ends.
 */
export function ProductDescription({
  html,
  intro,
}: {
  html: string;
  intro?: string;
}) {
  const [open, setOpen] = useState(false);
  const t = useT();
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const toggle = () => {
    const trigger = triggerRef.current;
    const offsetBefore = trigger?.getBoundingClientRect().top ?? null;

    setOpen((value) => !value);

    if (offsetBefore === null || !trigger) return;

    const restore = () => {
      const offsetAfter = trigger.getBoundingClientRect().top;
      const drift = offsetAfter - offsetBefore;
      if (Math.abs(drift) > 0.5) window.scrollBy({top: drift, behavior: 'instant'});
    };

    // Once for the immediate reflow, then after the transition settles.
    requestAnimationFrame(restore);
    const panel = panelRef.current;
    if (panel) {
      const onEnd = (event: TransitionEvent) => {
        if (event.propertyName !== 'grid-template-rows') return;
        panel.removeEventListener('transitionend', onEnd);
        restore();
      };
      panel.addEventListener('transitionend', onEnd);
    }
  };

  return (
    <div className={`description ${open ? 'description--open' : ''}`}>
      <button
        type="button"
        ref={triggerRef}
        className="description__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
      >
        <span className="description__label">{t('product.description')}</span>
        <ChevronDownIcon className="description__chevron" />
      </button>

      {intro && !open && <p className="description__intro">{intro}</p>}

      {/* grid-template-rows 0fr -> 1fr animates to the content's natural
          height, unlike a max-height guess that either clips long copy or
          makes short copy ease slowly from an oversized value. */}
      <div className="description__panel" id={panelId} ref={panelRef}>
        <div className="description__inner">
          <div
            className="pdp__prose"
            dangerouslySetInnerHTML={{__html: html}}
          />
        </div>
      </div>
    </div>
  );
}
