import { SALTS } from '../chem/salts';
import type { Syllabus } from '../chem/types';
import { seededShuffle } from './random';

/** Puzzle #1 is 25 Oct 2026. */
const EPOCH_UTC = Date.UTC(2026, 9, 25);
const DAY_MS = 86_400_000;

export function dayNumber(date = new Date()): number {
  const local = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.max(1, Math.floor((local - EPOCH_UTC) / DAY_MS) + 1);
}

export function pool(syllabus: Syllabus = 'cbse') {
  return SALTS.filter((s) => s.syllabus.includes(syllabus)).sort((a, b) => a.id.localeCompare(b.id));
}

/** Same salt for everyone on a given day; the pool is reshuffled each full cycle so nothing repeats early. */
export function dailySaltId(n: number): string {
  const salts = pool('cbse');
  const cycle = Math.floor((n - 1) / salts.length);
  const order = seededShuffle(salts, `anti-chemist-daily-${cycle}`);
  return order[(n - 1) % salts.length].id;
}

export function msUntilTomorrow(now = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}
