'use client';

/**
 * Reusable framer-motion primitives for Aura Commerce.
 *
 * Design principles:
 * - Respect prefers-reduced-motion via framer-motion's default behavior
 * - All animations are short (150-300ms) and subtle
 * - Variants use ease curves that feel natural, not bouncy
 */
import { motion, type Transition, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

// ============ Shared transitions ============
const EASE_OUT: Transition['ease'] = [0.16, 1, 0.3, 1];
const EASE_IN_OUT: Transition['ease'] = [0.4, 0, 0.2, 1];

const FAST = { duration: 0.15, ease: EASE_OUT } satisfies Transition;
const NORMAL = { duration: 0.2, ease: EASE_OUT } satisfies Transition;
const SLOW = { duration: 0.3, ease: EASE_IN_OUT } satisfies Transition;

// ============ Dropdown / Popover ============

/**
 * Wrap a dropdown panel with smooth fade + slide.
 * Use inside <AnimatePresence>{open && <AnimatedDropdown>...</AnimatedDropdown>}</AnimatePresence>
 */
export function AnimatedDropdown({
  children,
  className,
  id,
  role,
  'aria-label': ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  role?: string;
  'aria-label'?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={FAST}
      className={className}
      id={id}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slide-in from below (for menus appearing under a button).
 */
export function AnimatedSlideDown({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={FAST}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============ Page transitions ============

/**
 * Wrap page content for subtle fade + slide on route change.
 * Must be used inside a parent <AnimatePresence mode="wait"> keyed by pathname.
 */
export function PageTransition({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={NORMAL}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============ List stagger ============

const STAGGER_PARENT: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

const STAGGER_ITEM: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE_OUT },
  },
};

/**
 * Container for staggered list animations.
 * Children must be <StaggerItem>.
 */
export function StaggerContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={STAGGER_PARENT}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Item in a <StaggerContainer>. Wrap each list item with this.
 */
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={STAGGER_ITEM} className={className}>
      {children}
    </motion.div>
  );
}

// ============ Feedback / micro-interactions ============

/**
 * Success checkmark pop-in animation. Use for "added to cart" feedback.
 */
export function FeedbackPop({
  show,
  children,
  className,
}: {
  show: boolean;
  children: ReactNode;
  className?: string;
}) {
  if (!show) return null;
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      className={className}
    >
      {children}
    </motion.span>
  );
}

// Re-export motion for convenience
export { motion, EASE_OUT, FAST, NORMAL, SLOW };
