'use client';

import React from 'react';
import { ReactLenis } from 'lenis/react';

export default function HorizontalScroll({
  children,
}: {
  children?: React.ReactNode;
}): React.JSX.Element {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 0.95,
      }}
    >
      {children}
    </ReactLenis>
  );
}
