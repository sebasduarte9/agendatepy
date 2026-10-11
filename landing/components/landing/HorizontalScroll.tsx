'use client';

import React, { useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';

function ScrollToTopOnLoad() {
  const lenis = useLenis();

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  }, []);

  useEffect(() => {
    if (!lenis || window.location.hash) return;
    lenis.scrollTo(0, { immediate: true, force: true });
  }, [lenis]);

  return null;
}

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
      <ScrollToTopOnLoad />
      {children}
    </ReactLenis>
  );
}
