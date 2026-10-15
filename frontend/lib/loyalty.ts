/**
 * Stamps/points a client earns for one completed appointment, based on the
 * tenant's loyalty settings. Returns 0 while the program is paused.
 */
export function loyaltyIncrementForVisit(settings: unknown): number {
  const loyalty = (settings as { loyalty?: Record<string, unknown> } | null)?.loyalty ?? {};
  if (loyalty.enabled === false) return 0;
  if (loyalty.mode === "points") {
    return Math.max(1, Math.round(Number(loyalty.pointsPerVisit) || 1));
  }
  return 1;
}
