import { saltById } from '../chem/salts';
import type { GameState } from './game';

export type FeedbackKind = 'mistake' | 'suggestion';

export interface Feedback {
  kind: FeedbackKind;
  message: string;
  name: string;
  email: string;
  /** Hidden honeypot: real people leave it empty. */
  botcheck: string;
}

/** Web3Forms access key (set as the WEB3FORMS_KEY repo variable). Safe to ship: it can only send mail to its owner. */
const KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;

export const feedbackEnabled = !!KEY;

/** Where the player was, so a "this observation is wrong" report can be traced to the exact step. */
export function gameContext(game: GameState, puzzle: number | null): string {
  const salt = saltById(game.saltId);
  const lines = [
    `Mode: ${game.mode}${puzzle ? ` #${puzzle}` : ''}`,
    `Salt: ${salt.name} (${salt.formula}) [${game.saltId}]`,
    `Status: ${game.status} · phase ${game.phase} · section ${game.sectionIndex} · ${game.strikes} strikes`,
  ];
  game.rows.slice(-4).forEach((r, i, recent) => {
    const n = game.rows.length - recent.length + i + 1;
    lines.push(
      `Row ${n} [${r.stepId}/${r.outcomeId}]: ${r.experiment} → ${r.observation ?? `(pending; expected "${r.correctObservation}")`} → ${r.inference ?? `(pending; expected "${r.correctInference}")`}`,
    );
  });
  return lines.join('\n');
}

export async function sendFeedback(f: Feedback, context: string | null): Promise<void> {
  if (!KEY) throw new Error('Feedback is not set up yet.');
  const fields: Record<string, string> = {
    access_key: KEY,
    subject: `[Barely Passing Manual] ${f.kind === 'mistake' ? 'Mistake report' : 'Suggestion'}`,
    from_name: f.name || 'A student',
    ...(f.email && { email: f.email, replyto: f.email }),
    type: f.kind,
    message: f.message,
    game: context ?? '(not attached)',
    page: location.href,
    device: navigator.userAgent,
    botcheck: f.botcheck,
  };
  const body = new FormData();
  for (const [k, v] of Object.entries(fields)) body.append(k, v);
  // FormData with no custom headers is a "simple" CORS request: no preflight, which Web3Forms rejects.
  const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body }).catch(() => {
    throw new Error('Could not reach the server. Check your internet and try again.');
  });
  const data = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null;
  if (!res.ok || !data?.success) throw new Error(data?.message || 'Could not send. Try again in a bit.');
}
