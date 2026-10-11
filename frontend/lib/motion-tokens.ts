export const motionTokens = {
  duration: {
    instant: 0.08,
    fast: 0.16,
    standard: 0.28,
    considered: 0.45,
    exit: 0.2,
  },
  ease: {
    standard: [0.2, 0, 0, 1] as const,
    enter: [0.16, 1, 0.3, 1] as const,
    inOut: [0.4, 0, 0.2, 1] as const,
  },
  spring: {
    snappy: { visualDuration: 0.26, bounce: 0.16 },
    smooth: { visualDuration: 0.42, bounce: 0.1 },
    morph: { visualDuration: 0.36, bounce: 0.2 },
  },
  blur: {
    subtle: 2,
    soft: 4,
  },
  stagger: {
    item: 0.04,
  },
} as const;

export default motionTokens;
