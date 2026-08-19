export const HOME_HERO = {
  /** Scroll offset (px) at which the hero → header logo handoff journey starts. */
  journeyStart: 4,
  logo: {
    /**
     * Morph targets landing the hero logo exactly in the header logo slot
     * (svg 84x40, center y=40): desktop wrap center 196 → translateY -156,
     * scale 40/120; mobile wrap center 156 → translateY -116, scale 40/100.
     */
    desktop: { scale: 1 / 3, translateY: -156 },
    mobile: { scale: 0.4, translateY: -116 },
  },
} as const;
