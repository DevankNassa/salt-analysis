import { sym } from '../chem/ions';
import { SECTIONS, saltTint } from '../chem/procedure';
import { saltById } from '../chem/salts';
import type { SectionId } from '../chem/types';
import { currentRow, currentSection, rowSquare, type GameState, type Row, type Square } from './game';

// Derived, display-only state for the tile-sheet UI. Nothing here changes the game.

export type Tone = 'w' | 'g' | 'y' | 'r';

export const SQUARE_TONE: Record<Square, Tone> = { '⬜': 'w', '🟩': 'g', '🟨': 'y', '🟥': 'r' };

export const SECTION_SHORT: Record<SectionId | 'result', string> = {
  prelim: 'Prelim',
  anion: 'Anion',
  cation: 'Cation',
  result: 'Result',
};

/** Shelf label of the step behind a row, e.g. "Flame test". Shorter than the full experiment text. */
export function rowCard(row: Row): string {
  const section = SECTIONS.find((s) => s.id === row.section);
  const step = section?.chain.find((s) => s.id === row.stepId) ?? section?.confirms.find((s) => s.id === row.stepId);
  return step?.card ?? row.experiment;
}

export const wrongObservations = (row: Row) => row.wrong.filter((w) => row.observationOptions.includes(w));
export const wrongInferences = (row: Row) => row.wrong.filter((w) => row.inferenceOptions.includes(w));
/** Strikes from picking the wrong reagent before this row's test was run. */
export const reagentStrikes = (row: Row) => row.strikes - row.wrong.length;

/** Colour of one observation / inference tile once it is filled in. */
export function cellTone(row: Row, which: 'obs' | 'inf'): Tone {
  const wrong = which === 'obs' ? wrongObservations(row) : wrongInferences(row);
  if (wrong.length > 0) return 'r';
  if (row.hinted) return 'y';
  return row.result === 'positive' ? 'g' : 'w';
}

export const rowTone = (row: Row): Tone => SQUARE_TONE[rowSquare(row)];

export function formulaTone(s: GameState): Tone {
  if (s.formulaStrikes > 0 || s.status === 'lost') return 'r';
  if (s.formulaHinted) return 'y';
  return 'g';
}

/** The row being worked on (observe / infer), if any. */
export const activeRow = (s: GameState): Row | null =>
  s.phase === 'observe' || s.phase === 'infer' ? currentRow(s) : null;

export const finishedRows = (s: GameState): Row[] => (activeRow(s) ? s.rows.slice(0, -1) : s.rows);

export interface Segment {
  key: SectionId | 'result';
  label: string;
  weight: number;
  /** 0 = not started, 1 = done. */
  fill: number;
}

const WEIGHTS = { prelim: 1, anion: 1.4, cation: 2, result: 0.5 };

export function progress(s: GameState): Segment[] {
  const sec = currentSection(s);
  const within = (() => {
    if (!sec) return 0;
    if (sec.mode === 'survey') return s.chainIndex / sec.chain.length;
    const base = (s.chainIndex + (s.candidates ? 0.6 : 0.1)) / sec.chain.length;
    return Math.min(0.95, Math.max(0.1, base));
  })();
  const keys: (SectionId | 'result')[] = ['prelim', 'anion', 'cation', 'result'];
  return keys.map((key, i) => {
    let fill = 0;
    if (i < s.sectionIndex) fill = 1;
    else if (i === s.sectionIndex) fill = key === 'result' ? (s.status === 'won' ? 1 : 0.5) : within;
    return { key, label: SECTION_SHORT[key], weight: WEIGHTS[key], fill };
  });
}

/** "Cation · Group I", "Anion · confirming NO₃⁻", "Result". */
export function whereLabel(s: GameState): string {
  const sec = currentSection(s);
  if (!sec) return SECTION_SHORT.result;
  const short = SECTION_SHORT[sec.id];
  if (s.candidates) return `${short} · confirming ${s.candidates.map(sym).join(' / ')}`;
  if (sec.id === 'cation') return `${short} · ${sec.chain[s.chainIndex].label.replace(/^./, (c) => c.toUpperCase())}`;
  return short;
}

export function nextStep(s: GameState): string {
  const row = currentRow(s);
  const sec = currentSection(s);
  switch (s.phase) {
    case 'reagent':
      if (s.candidates) return `confirm ${s.candidates.map(sym).join(' or ')} with a confirmatory test.`;
      if (sec?.id === 'prelim') return 'pick the next preliminary test.';
      if (sec?.id === 'anion') return 'pick the next test for the anion.';
      return 'pick the next group reagent.';
    case 'observe':
      if (row?.visual.apparatus === 'flame') return 'watch the flame. Did it change colour?';
      if (row?.visual.apparatus === 'watch-glass') return 'look at the salt. What colour is it?';
      return 'watch the tube. What do you see?';
    case 'infer':
      return `“${row?.observation}”. So what do you infer?`;
    case 'formula':
      return `anion ${s.found.anion ? sym(s.found.anion) : '?'}, cation ${s.found.cation ? sym(s.found.cation) : '?'}. Write the formula.`;
    default:
      return s.status === 'won' ? 'nothing. You’re done.' : 'leave the lab.';
  }
}

/** Which bench animation fits a row. Heating scenes are only used where the procedure says to heat over a flame. */
export function sceneFor(s: GameState, row: Row | null) {
  const salt = saltById(s.saltId);
  const tint = saltTint(salt);
  if (!row) {
    return {
      kind: 'salt' as const,
      visual: { apparatus: 'watch-glass' as const, solid: tint.solid },
      caption: 'The unknown salt',
    };
  }
  const v = row.visual;
  const caption = rowCard(row);
  if (v.apparatus === 'flame') {
    return { kind: 'flame' as const, visual: v, tint: row.result === 'negative' ? undefined : v.flame, caption };
  }
  if (v.apparatus === 'watch-glass') return { kind: 'salt' as const, visual: v, caption };
  const base = row.confirm ? '#e8f0f6' : tint.solution;
  const heat = /conc\. H₂SO₄, heat/.test(row.experiment);
  return { kind: heat ? ('heat' as const) : ('reagent' as const), visual: v, base, caption };
}
