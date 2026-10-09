"use client";

import { useEffect, useRef, useState } from "react";

// Anima el primer número de un texto ya formateado ("Gs. 1.250.000", "85%", "12")
// usando "." como separador de miles, como en es-PY.
const NUMBER_RE = /\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?/;

function parse(token: string) {
  const [int, dec] = token.split(",");
  return { value: Number(int.replace(/\./g, "") + (dec ? `.${dec}` : "")), decimals: dec?.length ?? 0, grouped: token.includes(".") };
}

function format(n: number, decimals: number, grouped: boolean) {
  const fixed = n.toFixed(decimals);
  const [int, dec] = fixed.split(".");
  const intPart = grouped || int.length > 3 ? int.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : int;
  return dec ? `${intPart},${dec}` : intPart;
}

export default function AnimatedValue({ value, duration = 900 }: { value: string; duration?: number }) {
  const match = value.match(NUMBER_RE);
  const [display, setDisplay] = useState(() => (match ? value.replace(match[0], "0") : value));
  const fromRef = useRef(0);

  useEffect(() => {
    if (!match || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    const { value: target, decimals, grouped } = parse(match[0]);
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (target - from) * eased;
      setDisplay(value.replace(match[0], format(current, decimals, grouped)));
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <span className="tabular-nums">{match ? display : value}</span>;
}
