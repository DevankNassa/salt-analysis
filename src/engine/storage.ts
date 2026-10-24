import { MAX_STRIKES, type GameState } from './game';

const KEY = {
  daily: (n: number) => `bpm.daily.${n}`,
  practice: 'bpm.practice',
  stats: 'bpm.stats',
  seenHelp: 'bpm.seenHelp',
};

export interface Stats {
  played: number;
  won: number;
  streak: number;
  maxStreak: number;
  lastDay: number;
  /** Index = strikes used (0–5) for wins; the last slot counts losses. */
  dist: number[];
}

const emptyStats = (): Stats => ({
  played: 0,
  won: 0,
  streak: 0,
  maxStreak: 0,
  lastDay: 0,
  dist: Array(MAX_STRIKES + 1).fill(0),
});

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the game still works, it just won't remember.
  }
}

const valid = (s: GameState | null): s is GameState => !!s && s.version === 1;

export const loadDaily = (n: number) => {
  const s = read<GameState>(KEY.daily(n));
  return valid(s) ? s : null;
};
export const saveDaily = (n: number, s: GameState) => write(KEY.daily(n), s);

export const loadPractice = () => {
  const s = read<GameState>(KEY.practice);
  return valid(s) ? s : null;
};
export const savePractice = (s: GameState) => write(KEY.practice, s);

export const loadStats = (): Stats => ({ ...emptyStats(), ...read<Stats>(KEY.stats) });

/** Records a finished daily exactly once. */
export function recordDaily(n: number, s: GameState): Stats {
  const stats = loadStats();
  if (stats.lastDay >= n || s.status === 'playing') return stats;
  stats.played += 1;
  if (s.status === 'won') {
    stats.won += 1;
    stats.streak = stats.lastDay === n - 1 ? stats.streak + 1 : 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.streak);
    stats.dist[Math.min(s.strikes, MAX_STRIKES - 1)] += 1;
  } else {
    stats.streak = 0;
    stats.dist[MAX_STRIKES] += 1;
  }
  stats.lastDay = n;
  write(KEY.stats, stats);
  return stats;
}

export const hasSeenHelp = () => read<boolean>(KEY.seenHelp) === true;
export const markHelpSeen = () => write(KEY.seenHelp, true);
