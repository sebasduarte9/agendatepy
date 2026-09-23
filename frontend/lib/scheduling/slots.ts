/** Intervalo semiabierto [startMs, endMs) en epoch ms. */

export type MsInterval = {
  startMs: number;
  endMs: number;
};

export type SlotStart = {
  startMs: number;
  endMs: number;
};

/**
 * Resta bloques ocupados de la jornada y emite inicios donde cabe `durationMs`.
 * El paso se ancla al inicio de cada hueco libre, no a una grilla de reloj:
 * si un turno termina 09:45, 09:45 es un inicio válido.
 */
export function availableStarts(input: {
  work: readonly MsInterval[];
  busy: readonly MsInterval[];
  durationMs: number;
  stepMs: number;
}): SlotStart[] {
  const { durationMs, stepMs } = input;
  if (durationMs <= 0 || stepMs <= 0) {
    throw new Error("durationMs y stepMs deben ser positivos");
  }

  const work = mergeIntervals(input.work);

  const busy = input.busy
    .filter((interval) => interval.endMs > interval.startMs)
    .sort((a, b) => a.startMs - b.startMs);

  let free = work;
  for (const block of busy) {
    free = subtractInterval(free, block);
  }

  const slots: SlotStart[] = [];
  for (const gap of free) {
    for (let start = gap.startMs; start + durationMs <= gap.endMs; start += stepMs) {
      slots.push({ startMs: start, endMs: start + durationMs });
    }
  }
  return slots;
}

function mergeIntervals(intervals: readonly MsInterval[]): MsInterval[] {
  const sorted = intervals
    .filter((interval) => interval.endMs > interval.startMs)
    .sort((a, b) => a.startMs - b.startMs);
  const merged: MsInterval[] = [];
  for (const interval of sorted) {
    const last = merged.at(-1);
    if (!last || interval.startMs > last.endMs) {
      merged.push({ startMs: interval.startMs, endMs: interval.endMs });
      continue;
    }
    last.endMs = Math.max(last.endMs, interval.endMs);
  }
  return merged;
}

function subtractInterval(
  free: readonly MsInterval[],
  block: MsInterval,
): MsInterval[] {
  const next: MsInterval[] = [];
  for (const gap of free) {
    if (block.endMs <= gap.startMs || block.startMs >= gap.endMs) {
      next.push(gap);
      continue;
    }
    if (block.startMs > gap.startMs) {
      next.push({ startMs: gap.startMs, endMs: block.startMs });
    }
    if (block.endMs < gap.endMs) {
      next.push({ startMs: block.endMs, endMs: gap.endMs });
    }
  }
  return next;
}
