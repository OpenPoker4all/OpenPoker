// Late-registration clock: one ring per hour left, each hour its own colour. Pure, so Node can test it.

export const HOUR_MS = 3_600_000;
export const MAX_RINGS = 6;
/** Colour of the hour block, counted from the deadline: the last hour is red, then orange, gold, green, blue, violet. */
export const RING_COLORS: readonly string[] = Object.freeze(['#ff4d5a', '#ff9a3d', '#ffd24a', '#4fd37a', '#4aa8ff', '#b07cff']);

export type Ring = { readonly hour: number; readonly fraction: number; readonly color: string };

/**
 * Rings from the outermost inward. Whole hours are full rings; the hour furthest from the deadline is the
 * partial one, drawn outermost, so the clock "eats" from the outside in as time runs out.
 */
export function lateRegRings(remainingMs: number): readonly Ring[] {
  if (!(remainingMs > 0)) return [];
  const blocks = Math.min(MAX_RINGS, Math.ceil(remainingMs / HOUR_MS));
  const partial = (remainingMs % HOUR_MS) / HOUR_MS;
  const rings: Ring[] = [];
  for (let hour = blocks - 1; hour >= 0; hour--) {
    const isFurthest = hour === Math.ceil(remainingMs / HOUR_MS) - 1;
    rings.push({ hour, fraction: isFurthest && partial > 0 ? partial : 1, color: RING_COLORS[hour] });
  }
  return rings;
}

export function formatRemaining(remainingMs: number): string {
  const total = Math.max(0, Math.floor(remainingMs / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const two = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${two(m)}:${two(s)}` : `${two(m)}:${two(s)}`;
}
