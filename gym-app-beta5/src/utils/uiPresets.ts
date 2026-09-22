/**
 * Centralized UI design tokens, animations, and interaction presets.
 * Follows strict Apple Glass aesthetics: standardized border radii,
 * physics-based spring animations, specular refraction highlights,
 * and unified micro-interaction hover/tap states.
 */

export const UI_RADII = {
  /** Large panels, dialogs, full-screen modals, and major grouped containers */
  modal: 'rounded-[32px]',
  /** Standard content cards, feature blocks, and large buttons */
  card: 'rounded-2xl',
  /** Internal inputs, segmented controls, set rows, and compact tools */
  control: 'rounded-xl',
  /** Badges, chips, tags, circular icons, and floating pills */
  pill: 'rounded-full',
} as const;

export const GPU_LAYER =
  '[transform:translateZ(0)] will-change-transform [backface-visibility:hidden]';

export const MOTION_PRESETS = {
  /** Standard modal entry and exit animation physics */
  modalSpring: {
    type: 'spring' as const,
    damping: 28,
    stiffness: 320,
    mass: 0.8,
  },
  /** Snappy feedback for list items, reordering, and tabs */
  snappySpring: {
    type: 'spring' as const,
    damping: 26,
    stiffness: 350,
  },
  /** Soft, fluid feedback for expanded accordions and indicators */
  gentleSpring: {
    type: 'spring' as const,
    damping: 24,
    stiffness: 240,
  },
  /** Fast tap scale feedback for buttons */
  buttonTap: { scale: 0.95 },
  /** Slight lift and brightness hover for action buttons */
  buttonHover: { scale: 1.02, transition: { duration: 0.12 } },
  /** Micro hover for icon-only action buttons */
  iconHover: { scale: 1.08, transition: { duration: 0.12 } },
  /** Gentle hover for interactive cards and list items */
  cardHover: { scale: 1.01, y: -1.5, transition: { duration: 0.15 } },
  /** Subtle tap for larger cards */
  cardTap: { scale: 0.985 },
} as const;

/**
 * Standardized Specular Refraction border highlights for Apple Glass panels
 */
export const SPECULAR_HIGHLIGHT =
  'absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none';

export const SPECULAR_HIGHLIGHT_FULL =
  'absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none';

/**
 * Varianti per la navigazione a stack multi-step (iOS / Material style).
 * Quando si avanza (direction > 0): entra da destra (x: 36) ed esce a sinistra (x: -36).
 * Quando si torna indietro (direction < 0): entra da sinistra (x: -36) ed esce a destra (x: 36).
 */
export const STEP_SLIDE_VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? 36 : -36,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -36 : 36,
    opacity: 0,
  }),
};

export const STEP_TRANSITION = {
  type: 'spring' as const,
  damping: 30,
  stiffness: 380,
  opacity: { duration: 0.18 },
};

