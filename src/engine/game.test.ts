import { describe, expect, it } from 'vitest';
import { SECTIONS } from '../chem/procedure';
import { SALTS } from '../chem/salts';
import { MAX_STRIKES, correctAction, grid, newGame, reduce, shelf, type GameState } from './game';
import { dailySaltId } from './daily';

function solve(saltId: string): GameState {
  let s = newGame(saltId, 'practice');
  for (let i = 0; i < 200 && s.status === 'playing'; i++) {
    const action = correctAction(s);
    if (!action) throw new Error(`${saltId}: stuck in phase ${s.phase}`);
    s = reduce(s, action);
  }
  return s;
}

describe('every salt in the pool', () => {
  for (const salt of SALTS) {
    it(`${salt.formula} is solvable by following the procedure`, () => {
      const s = solve(salt.id);
      expect(s.status).toBe('won');
      expect(s.strikes).toBe(0);
      expect(s.found).toEqual({ anion: salt.anion, cation: salt.cation });
    });
  }

  it('has unique ids and formulas, and distractors never equal the answer', () => {
    expect(new Set(SALTS.map((s) => s.id)).size).toBe(SALTS.length);
    expect(new Set(SALTS.map((s) => s.formula)).size).toBe(SALTS.length);
    for (const s of SALTS) {
      expect(new Set(s.distractors).size).toBe(3);
      expect(s.distractors).not.toContain(s.formula);
    }
  });
});

describe('procedure data', () => {
  it('every step has exactly one outcome for every salt', () => {
    for (const section of SECTIONS) {
      for (const step of [...section.chain, ...section.confirms]) {
        for (const salt of SALTS) {
          const n = step.outcomes.filter((o) => o.match(salt)).length;
          expect(n, `${step.id} × ${salt.id}`).toBe(1);
        }
      }
    }
  });

  it('every candidate an outcome can produce has a confirmatory test', () => {
    for (const section of SECTIONS) {
      for (const step of section.chain) {
        for (const o of step.outcomes) {
          for (const ion of o.candidates ?? []) {
            expect(
              section.confirms.some((t) => t.forIons.includes(ion)),
              `${ion} from ${step.id}`,
            ).toBe(true);
          }
        }
      }
    }
  });
});

describe('procedure enforcement', () => {
  it('blocks skipping a group and costs a strike', () => {
    let s = solveUntil('cuso4', (st) => st.sectionIndex === 2);
    s = reduce(s, { type: 'card', id: 'g2' });
    expect(s.strikes).toBe(1);
    expect(s.phase).toBe('reagent');
    expect(s.event).toMatchObject({ type: 'wrong-card', reason: 'order' });
    expect(shelf(s).chain.find((c) => c.id === 'g2')?.crossed).toBe(true);
  });

  it('blocks confirmatory tests before a positive result', () => {
    let s = solveUntil('cuso4', (st) => st.sectionIndex === 2);
    s = reduce(s, { type: 'card', id: 'kscn' });
    expect(s.event).toMatchObject({ type: 'wrong-card', reason: 'confirm-early' });
  });

  it('enforces Ba → Sr → Ca order in Group V', () => {
    let s = solveUntil('cacl2', (st) => st.candidates?.length === 3);
    s = reduce(s, { type: 'card', id: 'nh42c2o4' });
    expect(s.event).toMatchObject({ type: 'wrong-card', reason: 'prereq' });
  });

  it('wrong observations cost strikes and six strikes ends the game', () => {
    let s = solveUntil('nh4cl', (st) => st.phase === 'observe');
    const wrong = s.rows[0].observationOptions.filter((o) => o !== s.rows[0].correctObservation);
    for (const w of wrong) s = reduce(s, { type: 'observation', text: w });
    expect(s.strikes).toBe(Math.min(wrong.length, MAX_STRIKES));
    expect(s.status).toBe(wrong.length >= MAX_STRIKES ? 'lost' : 'playing');
  });

  it('builds a share grid with a result line', () => {
    const s = solve('fecl3');
    const g = grid(s);
    expect(g.map((l) => l.label)).toEqual(['Prelim', 'Anion', 'Cation', 'Result']);
    expect(g.at(-1)!.squares).toEqual(['🟩']);
  });
});

describe('daily', () => {
  it('cycles through the whole pool before repeating', () => {
    const ids = Array.from({ length: SALTS.length }, (_, i) => dailySaltId(i + 1));
    expect(new Set(ids).size).toBe(SALTS.length);
  });
});

function solveUntil(saltId: string, stop: (s: GameState) => boolean): GameState {
  let s = newGame(saltId, 'practice');
  for (let i = 0; i < 200 && !stop(s); i++) s = reduce(s, correctAction(s)!);
  return s;
}
