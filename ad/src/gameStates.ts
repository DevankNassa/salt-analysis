import { correctAction, newGame, reduce, shelf, type GameState } from '../../src/engine/game';

/**
 * Named moments of one scripted game, played by the real engine (the same solver the tests use),
 * so every observation and inference on screen is the game's own data.
 *
 * The story: solve correctly, make ONE wrong-order move at the start of the cation section
 * (so Ma'am shouts), then finish correctly. That ends on a 1/6 score with one non-green square.
 */
export type StateName =
  | 'start' // fresh game, empty sheet
  | 'first-observe' // first test run, choosing the observation (e.g. the salt's colour)
  | 'cation-start' // cation section, reagent keys on screen
  | 'wrong-order' // skipped a group: Ma'am shouts, key crossed out, 1 strike
  | 'cation-positive' // a positive cation test, choosing the observation
  | 'formula' // anion and cation found, choosing the formula
  | 'won'; // finished

const step = (s: GameState) => {
  const a = correctAction(s);
  if (!a) throw new Error(`No correct action in phase ${s.phase}`);
  return reduce(s, a);
};

function advanceUntil(s: GameState, stop: (s: GameState) => boolean): GameState {
  for (let i = 0; i < 200 && !stop(s); i++) s = step(s);
  if (!stop(s)) throw new Error('Scripted game never reached the wanted moment');
  return s;
}

const cache = new Map<string, Record<StateName, GameState>>();

export function scriptedStates(saltId: string): Record<StateName, GameState> {
  const hit = cache.get(saltId);
  if (hit) return hit;

  const start = newGame(saltId, 'daily');
  const firstObserve = step(start);
  const cationStart = advanceUntil(firstObserve, (s) => s.sectionIndex === 2 && s.phase === 'reagent');

  // Find a reagent key that skips ahead in the procedure (prefer the last one, usually a later group).
  const keys = shelf(cationStart).chain.map((c) => c.id);
  let wrongOrder: GameState | null = null;
  for (const id of [...keys].reverse()) {
    const s = reduce(cationStart, { type: 'card', id });
    if (s.event.type === 'wrong-card' && s.event.reason === 'order') {
      wrongOrder = s;
      break;
    }
  }
  if (!wrongOrder) throw new Error(`No wrong-order move found for ${saltId}`);

  const cationPositive = advanceUntil(
    wrongOrder,
    (s) => s.phase === 'observe' && s.sectionIndex === 2 && s.rows[s.rows.length - 1]?.result === 'positive',
  );
  const formula = advanceUntil(cationPositive, (s) => s.phase === 'formula');
  const won = advanceUntil(formula, (s) => s.status !== 'playing');

  const out = {
    start,
    'first-observe': firstObserve,
    'cation-start': cationStart,
    'wrong-order': wrongOrder,
    'cation-positive': cationPositive,
    formula,
    won,
  };
  cache.set(saltId, out);
  return out;
}
