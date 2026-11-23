import { money } from './api';

/** Tournament amounts are Play Money, so they carry no currency sign. */
export function playMoney(cents: number | null | undefined, compact = false): string {
  return money(cents, compact).replace('$', '');
}

/** Tournament names as shown: no dollar sign ("$5K" -> "5K") "Battle Royale" is just "Battle" and "Quick Flip" is "Speed Flip". */
export function playName(name: unknown): string {
  return String(name ?? '').replace(/\$/g, '').replace(/Battle Royale/g, 'Battle').replace(/Quick Flip/g, 'Speed Flip');
}
