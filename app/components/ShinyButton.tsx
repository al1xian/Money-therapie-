import {motion, useReducedMotion, type MotionProps} from 'framer-motion';

/**
 * Shiny button — a highlight sweeping across the surface, on a loop.
 *
 * Adapted from the reference `ShinyButton` (framer-motion + shadcn). Two
 * things changed to fit this project:
 *
 * - No `cn()` / `@/components/ui` / `hsl(var(--primary))`. This storefront
 *   isn't a shadcn project: it styles buttons with its own `.btn` classes in
 *   app.css, and those already carry the shape, the colours and the hover
 *   states. The component only adds the sweep on top.
 * - The reference masks the *label* so the text itself shimmers. That works on
 *   its light, translucent button; on our solid black CTA it would make the
 *   word "buy now" fade in and out. So the sweep is an overlay above the
 *   surface and below the label, plus the reference's edge gradient — the
 *   shine reads exactly the same, and the label stays fully legible.
 *
 * The driver is untouched: framer-motion animates the `--x` custom property
 * from 100% to -100% on a repeating spring, and the CSS gradients are
 * positioned off it.
 */
// `AnimationProps` in the reference snippet; framer-motion 12 dropped that
// alias, and `MotionProps` is the type it was carved out of.
const animationProps: MotionProps = {
  initial: {'--x': '100%', scale: 0.98},
  animate: {'--x': '-100%', scale: 1},
  whileTap: {scale: 0.97},
  transition: {
    repeat: Infinity,
    repeatType: 'loop',
    repeatDelay: 1,
    type: 'spring',
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: 'spring',
      stiffness: 200,
      damping: 12,
      mass: 0.5,
    },
  },
};

/** The two gradient layers. Identical for the button and the link version. */
function Shine({children}: {children: React.ReactNode}) {
  return (
    <>
      <span className="btn__shine" aria-hidden="true" />
      <span className="btn__shine btn__shine--edge" aria-hidden="true" />
      <span className="btn__label">{children}</span>
    </>
  );
}

/**
 * framer-motion redefines these four handlers with its own gesture signatures,
 * so they can't be forwarded from React's HTML attributes. Nothing in this
 * storefront drags or CSS-animates a buy button, so dropping them costs
 * nothing and keeps the rest of the props exact.
 */
type MotionConflicts = 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart';

type ShinyButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  MotionConflicts
> & {
  children: React.ReactNode;
};

export function ShinyButton({
  children,
  className = '',
  ...props
}: ShinyButtonProps) {
  // Someone who asked their system for less motion gets a plain button: no
  // sweep, no scale, no rAF loop running for as long as the page is open.
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <button className={className} {...props}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      {...animationProps}
      {...props}
      className={`${className} btn--shiny`}
    >
      <Shine>{children}</Shine>
    </motion.button>
  );
}

type ShinyLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  MotionConflicts
> & {
  children: React.ReactNode;
};

/**
 * Same treatment for an anchor — the checkout button is a real link to
 * Shopify's hosted checkout, not a form submit.
 */
export function ShinyLink({children, className = '', ...props}: ShinyLinkProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <a className={className} {...props}>
        {children}
      </a>
    );
  }

  return (
    <motion.a {...animationProps} {...props} className={`${className} btn--shiny`}>
      <Shine>{children}</Shine>
    </motion.a>
  );
}
