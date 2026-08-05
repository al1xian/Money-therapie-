/**
 * Locking the page behind an overlay without moving anything.
 *
 * The problem: `overflow: hidden` on the body takes the scrollbar away, and on
 * a desktop browser with classic scrollbars the layout immediately reclaims
 * those ~15px. The whole site widens as the dialog opens and snaps back as it
 * closes — which is exactly what "clicking a button changed the format of the
 * site" looks like.
 *
 * Two defences, and they cooperate rather than fight:
 *
 * 1. `scrollbar-gutter: stable` on the root element (app.css) reserves the
 *    space permanently. Where it is honoured — Chrome 94+, Firefox 97+, Safari
 *    18.2+ — nothing can shift, not just here but on every navigation between
 *    a short page and a long one.
 *
 * 2. Where it is not honoured, the width the layout actually gained is
 *    measured and given straight back as padding.
 *
 * The measurement is the important part. It compares the document width
 * *before and after* the lock is applied, rather than assuming the gap equals
 * the scrollbar width. On a browser with a stable gutter that difference is
 * zero and nothing is padded — assuming otherwise would push the page 15px the
 * other way, turning the fix into the bug.
 *
 * Nested overlays are counted, so closing one while another is still open
 * doesn't release the lock early.
 */

const LOCK_CLASS = 'is-scroll-locked';
const GAP_PROPERTY = '--scrollbar-lock';

let depth = 0;

export function lockScroll(): void {
  if (typeof document === 'undefined') return;

  depth += 1;
  if (depth > 1) return;

  const root = document.documentElement;
  const widthBefore = root.clientWidth;

  document.body.classList.add(LOCK_CLASS);

  // Read after the class lands: this is the width the layout just gained.
  const gained = root.clientWidth - widthBefore;
  if (gained > 0) {
    root.style.setProperty(GAP_PROPERTY, `${gained}px`);
  }
}

export function unlockScroll(): void {
  if (typeof document === 'undefined') return;

  depth = Math.max(0, depth - 1);
  if (depth > 0) return;

  document.body.classList.remove(LOCK_CLASS);
  document.documentElement.style.removeProperty(GAP_PROPERTY);
}
