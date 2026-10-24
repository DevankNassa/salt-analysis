import { MAX_STRIKES, grid, type GameState } from './game';

export function scoreLabel(s: GameState): string {
  return s.status === 'lost' ? `X/${MAX_STRIKES}` : `${s.strikes}/${MAX_STRIKES}`;
}

export function shareText(s: GameState, puzzle: number | null, url: string): string {
  const title = puzzle ? `The Anti-Chemist #${puzzle}` : 'The Anti-Chemist (practice)';
  const lines = grid(s).map((l) => `${l.label.padEnd(6, ' ')} ${l.squares.join('')}`);
  return ['Want to test your salt analysis? 🧪', `${title} — ${scoreLabel(s)}`, ...lines, url].join('\n');
}

/** Uses the native share sheet on phones, the clipboard elsewhere. */
export async function share(text: string): Promise<'shared' | 'copied' | 'failed'> {
  try {
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      await navigator.share({ text });
      return 'shared';
    }
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
