import { IONS, sym } from '../chem/ions';
import { SECTIONS, saltTint } from '../chem/procedure';
import { saltById } from '../chem/salts';
import type {
  AnionId,
  CationId,
  ConfirmTest,
  IonId,
  Outcome,
  ResultKind,
  Salt,
  Section,
  SectionId,
  Step,
  Visual,
} from '../chem/types';
import { seededShuffle } from './random';

export type Mode = 'daily' | 'practice';
export const MAX_STRIKES = 6;

export interface Row {
  section: SectionId;
  stepId: string;
  confirm: boolean;
  experiment: string;
  outcomeId: string;
  result: ResultKind;
  visual: Visual;
  observationOptions: string[];
  inferenceOptions: string[];
  correctObservation: string;
  correctInference: string;
  /** Filled in once the player picks the right option. */
  observation?: string;
  inference?: string;
  wrong: string[];
  strikes: number;
  hinted: boolean;
  note?: string;
}

export type Phase = 'reagent' | 'observe' | 'infer' | 'formula' | 'over';

export type WrongCardReason = 'order' | 'confirm-early' | 'confirm-needed' | 'irrelevant' | 'repeat' | 'prereq';

export type GameEvent =
  | { type: 'start' }
  | { type: 'wrong-card'; reason: WrongCardReason; card: string; detail?: string }
  | { type: 'card'; card: string }
  | { type: 'observed' }
  | { type: 'wrong-observation' }
  | { type: 'wrong-inference' }
  | { type: 'row-done'; result: ResultKind; candidates: boolean }
  | { type: 'section-done'; section: SectionId; ion?: IonId }
  | { type: 'wrong-formula' }
  | { type: 'hint' }
  | { type: 'won' }
  | { type: 'lost' };

export interface GameState {
  version: 1;
  mode: Mode;
  saltId: string;
  /** 0 prelim, 1 anion, 2 cation, 3 final formula. */
  sectionIndex: number;
  chainIndex: number;
  /** Non-null while confirming: ions still in the running. */
  candidates: IonId[] | null;
  /** Step ids already run in the current section. */
  done: string[];
  rows: Row[];
  phase: Phase;
  pendingStrikes: number;
  pendingHint: boolean;
  wrongCards: string[];
  found: { anion?: AnionId; cation?: CationId };
  formulaOptions: string[];
  formulaWrong: string[];
  formulaStrikes: number;
  formulaHinted: boolean;
  strikes: number;
  hintsUsed: number;
  hint: string | null;
  status: 'playing' | 'won' | 'lost';
  event: GameEvent;
  eventCount: number;
}

export type Action =
  | { type: 'card'; id: string }
  | { type: 'observation'; text: string }
  | { type: 'inference'; text: string }
  | { type: 'formula'; text: string }
  | { type: 'hint' };

export interface Card {
  id: string;
  label: string;
  kind: 'chain' | 'confirm';
  crossed: boolean;
  done: boolean;
}

export function newGame(saltId: string, mode: Mode): GameState {
  saltById(saltId);
  return {
    version: 1,
    mode,
    saltId,
    sectionIndex: 0,
    chainIndex: 0,
    candidates: null,
    done: [],
    rows: [],
    phase: 'reagent',
    pendingStrikes: 0,
    pendingHint: false,
    wrongCards: [],
    found: {},
    formulaOptions: [],
    formulaWrong: [],
    formulaStrikes: 0,
    formulaHinted: false,
    strikes: 0,
    hintsUsed: 0,
    hint: null,
    status: 'playing',
    event: { type: 'start' },
    eventCount: 0,
  };
}

export const currentSection = (s: GameState): Section | null => SECTIONS[s.sectionIndex] ?? null;
export const currentRow = (s: GameState): Row | null => s.rows[s.rows.length - 1] ?? null;

const findStep = (section: Section, id: string): { step: Step | ConfirmTest; confirm: boolean } | null => {
  const chain = section.chain.find((st) => st.id === id);
  if (chain) return { step: chain, confirm: false };
  const conf = section.confirms.find((st) => st.id === id);
  if (conf) return { step: conf, confirm: true };
  return null;
};

export function matchOutcome(step: Step, salt: Salt): Outcome {
  const matches = step.outcomes.filter((o) => o.match(salt));
  if (matches.length !== 1) {
    throw new Error(`Step ${step.id} has ${matches.length} outcomes for ${salt.id}`);
  }
  return matches[0];
}

const unique = (xs: string[]) => [...new Set(xs)];
const intersect = (a: IonId[], b: IonId[]) => a.filter((x) => b.includes(x));

/** Confirm-test negatives are phrased against the ions actually being considered. */
function inferenceFor(step: Step | ConfirmTest, outcome: Outcome, candidates: IonId[] | null): string {
  if ('forIons' in step && outcome.result === 'negative' && candidates) {
    const ids = intersect(step.forIons, candidates);
    return `${ids.map(sym).join(', ')} absent`;
  }
  return outcome.inference;
}

export function shelf(s: GameState): { chain: Card[]; confirm: Card[] } {
  const section = currentSection(s);
  if (!section) return { chain: [], confirm: [] };
  const toCard = (kind: Card['kind']) => (st: Step): Card => ({
    id: st.id,
    label: st.card,
    kind,
    crossed: s.wrongCards.includes(st.id),
    done: s.done.includes(st.id),
  });
  return {
    chain: seededShuffle(section.chain, `${s.saltId}:${section.id}:chain`).map(toCard('chain')),
    confirm: seededShuffle(section.confirms, `${s.saltId}:${section.id}:confirm`).map(toCard('confirm')),
  };
}

function fail(s: GameState): void {
  if (s.strikes >= MAX_STRIKES) {
    s.status = 'lost';
    s.phase = 'over';
    s.event = { type: 'lost' };
  }
}

function emit(s: GameState, event: GameEvent): void {
  s.event = event;
  s.eventCount += 1;
}

function strike(s: GameState, event: GameEvent): void {
  s.strikes += 1;
  emit(s, event);
  fail(s);
}

function wrongCard(s: GameState, step: Step, reason: WrongCardReason, detail?: string): void {
  s.pendingStrikes += 1;
  if (!s.wrongCards.includes(step.id)) s.wrongCards.push(step.id);
  strike(s, { type: 'wrong-card', reason, card: step.card, detail });
}

function run(s: GameState, salt: Salt, section: Section, step: Step | ConfirmTest, confirm: boolean): void {
  const outcome = matchOutcome(step, salt);
  const inference = inferenceFor(step, outcome, s.candidates);
  const inferences = unique(step.outcomes.map((o) => inferenceFor(step, o, s.candidates)));
  const tint = saltTint(salt);
  const visual: Visual = { ...outcome.visual };
  if (visual.apparatus === 'tube' && !visual.solution) {
    visual.solution = confirm ? '#e8f0f6' : tint.solution;
  }
  if (visual.apparatus === 'tube' && step.id === 'os' && !salt.solubleInWater) {
    visual.undissolved = tint.solid;
  }

  s.rows.push({
    section: section.id,
    stepId: step.id,
    confirm,
    experiment: step.experiment,
    outcomeId: outcome.id,
    result: outcome.result,
    visual,
    observationOptions: seededShuffle(unique(step.outcomes.map((o) => o.observation)), `${s.saltId}:${step.id}:obs`),
    inferenceOptions: seededShuffle(inferences, `${s.saltId}:${step.id}:inf`),
    correctObservation: outcome.observation,
    correctInference: inference,
    wrong: [],
    strikes: s.pendingStrikes,
    hinted: s.pendingHint,
    note: outcome.note,
  });
  s.pendingStrikes = 0;
  s.pendingHint = false;
  s.wrongCards = [];
  s.hint = null;
  s.done.push(step.id);
  s.phase = 'observe';
  emit(s, { type: 'card', card: step.card });
}

function pickCard(s: GameState, id: string): void {
  if (s.phase !== 'reagent') return;
  const section = currentSection(s);
  if (!section) return;
  const found = findStep(section, id);
  if (!found) return;
  const salt = saltById(s.saltId);
  const { step, confirm } = found;

  if (!confirm) {
    if (s.candidates) return wrongCard(s, step, 'confirm-needed');
    if (section.chain[s.chainIndex].id === id) return run(s, salt, section, step, false);
    return wrongCard(s, step, s.done.includes(id) ? 'repeat' : 'order');
  }

  const test = step as ConfirmTest;
  if (!s.candidates) return wrongCard(s, step, 'confirm-early');
  if (s.done.includes(id)) return wrongCard(s, step, 'repeat');
  if (intersect(test.forIons, s.candidates).length === 0) return wrongCard(s, step, 'irrelevant');
  if (test.after && !test.after.every((a) => s.done.includes(a))) {
    return wrongCard(s, step, 'prereq', test.afterReason);
  }
  run(s, salt, section, test, true);
}

function finishSection(s: GameState, section: Section, ion?: IonId): void {
  if (ion) {
    if (IONS[ion].kind === 'anion') s.found.anion = ion as AnionId;
    else s.found.cation = ion as CationId;
  }
  s.sectionIndex += 1;
  s.chainIndex = 0;
  s.candidates = null;
  s.done = [];
  if (s.sectionIndex >= SECTIONS.length) {
    const salt = saltById(s.saltId);
    s.phase = 'formula';
    s.formulaOptions = seededShuffle([salt.formula, ...salt.distractors], `${s.saltId}:formula`);
  } else {
    s.phase = 'reagent';
  }
  emit(s, { type: 'section-done', section: section.id, ion });
}

function advance(s: GameState, row: Row): void {
  const section = currentSection(s)!;
  const found = findStep(section, row.stepId)!;
  const outcome = found.step.outcomes.find((o) => o.id === row.outcomeId)!;

  if (section.mode === 'survey') {
    s.chainIndex += 1;
    if (s.chainIndex >= section.chain.length) return finishSection(s, section);
  } else if (outcome.confirms) {
    return finishSection(s, section, outcome.confirms);
  } else if (!found.confirm) {
    if (outcome.candidates) {
      s.candidates = [...outcome.candidates];
    } else {
      s.chainIndex += 1;
      if (s.chainIndex >= section.chain.length) {
        throw new Error(`${s.saltId}: ran out of ${section.id} tests`);
      }
    }
  } else {
    const test = found.step as ConfirmTest;
    s.candidates = (s.candidates ?? []).filter((c) => !test.forIons.includes(c));
  }
  s.phase = 'reagent';
  emit(s, { type: 'row-done', result: row.result, candidates: !!s.candidates });
}

function pickObservation(s: GameState, text: string): void {
  const row = currentRow(s);
  if (s.phase !== 'observe' || !row || row.wrong.includes(text)) return;
  if (text === row.correctObservation) {
    row.observation = text;
    s.phase = 'infer';
    s.hint = null;
    emit(s, { type: 'observed' });
  } else {
    row.wrong.push(text);
    row.strikes += 1;
    strike(s, { type: 'wrong-observation' });
  }
}

function pickInference(s: GameState, text: string): void {
  const row = currentRow(s);
  if (s.phase !== 'infer' || !row || row.wrong.includes(text)) return;
  if (text === row.correctInference) {
    row.inference = text;
    s.hint = null;
    advance(s, row);
  } else {
    row.wrong.push(text);
    row.strikes += 1;
    strike(s, { type: 'wrong-inference' });
  }
}

function pickFormula(s: GameState, text: string): void {
  if (s.phase !== 'formula' || s.formulaWrong.includes(text)) return;
  const salt = saltById(s.saltId);
  if (text === salt.formula) {
    s.status = 'won';
    s.phase = 'over';
    s.hint = null;
    emit(s, { type: 'won' });
  } else {
    s.formulaWrong.push(text);
    s.formulaStrikes += 1;
    strike(s, { type: 'wrong-formula' });
  }
}

/** The single correct next action. Drives hints and the solver used in tests. */
export function correctAction(s: GameState): Action | null {
  const salt = saltById(s.saltId);
  const row = currentRow(s);
  switch (s.phase) {
    case 'observe':
      return { type: 'observation', text: row!.correctObservation };
    case 'infer':
      return { type: 'inference', text: row!.correctInference };
    case 'formula':
      return { type: 'formula', text: salt.formula };
    case 'reagent': {
      const section = currentSection(s)!;
      if (!s.candidates) return { type: 'card', id: section.chain[s.chainIndex].id };
      const usable = section.confirms.filter(
        (t) =>
          !s.done.includes(t.id) &&
          intersect(t.forIons, s.candidates!).length > 0 &&
          (t.after ?? []).every((a) => s.done.includes(a)),
      );
      const decisive = usable.find((t) => t.forIons.includes(salt.anion) || t.forIons.includes(salt.cation));
      const pick = decisive ?? usable[0];
      return pick ? { type: 'card', id: pick.id } : null;
    }
    default:
      return null;
  }
}

export const hintCostsStrike = (s: GameState) => s.mode === 'daily';
export const canHint = (s: GameState) =>
  s.status === 'playing' && (!hintCostsStrike(s) || s.hint !== null || s.strikes < MAX_STRIKES - 1);

function hintText(s: GameState, action: Action): string {
  const section = currentSection(s);
  switch (action.type) {
    case 'card': {
      const found = section && findStep(section, action.id);
      if (!found) return '';
      return found.confirm
        ? `Confirm it with: ${found.step.card}. (${found.step.label})`
        : `Next on the sheet: ${found.step.card}. That’s the ${found.step.label}.`;
    }
    case 'observation':
      return `Look properly. That’s “${action.text}”.`;
    case 'inference':
      return `${currentRow(s)!.correctObservation} means: ${action.text}.`;
    case 'formula':
      return `Balance the charges. It’s ${action.text}.`;
    default:
      return '';
  }
}

function useHint(s: GameState): void {
  if (s.hint !== null || !canHint(s)) return;
  const action = correctAction(s);
  if (!action) return;
  s.hint = hintText(s, action);
  s.hintsUsed += 1;
  if (s.phase === 'reagent') s.pendingHint = true;
  else if (s.phase === 'formula') s.formulaHinted = true;
  else currentRow(s)!.hinted = true;
  if (hintCostsStrike(s)) s.strikes += 1;
  emit(s, { type: 'hint' });
}

export function reduce(state: GameState, action: Action): GameState {
  if (state.status !== 'playing') return state;
  const s = structuredClone(state);
  switch (action.type) {
    case 'card':
      pickCard(s, action.id);
      break;
    case 'observation':
      pickObservation(s, action.text);
      break;
    case 'inference':
      pickInference(s, action.text);
      break;
    case 'formula':
      pickFormula(s, action.text);
      break;
    case 'hint':
      useHint(s);
      break;
  }
  return s;
}

export type Square = '⬜' | '🟩' | '🟥' | '🟨';

export function rowSquare(r: { strikes: number; hinted: boolean; result: ResultKind }): Square {
  if (r.strikes > 0) return '🟥';
  if (r.hinted) return '🟨';
  return r.result === 'positive' ? '🟩' : '⬜';
}

export function grid(s: GameState): { label: string; squares: Square[] }[] {
  const lines = SECTIONS.map((sec) => ({
    label: sec.id === 'prelim' ? 'Prelim' : sec.id === 'anion' ? 'Anion' : 'Cation',
    squares: s.rows.filter((r) => r.section === sec.id).map(rowSquare),
  }));
  if (s.phase === 'formula' || s.status === 'won' || s.formulaWrong.length > 0) {
    lines.push({
      label: 'Result',
      squares: [
        rowSquare({
          strikes: s.formulaStrikes,
          hinted: s.formulaHinted,
          result: s.status === 'won' ? 'positive' : 'negative',
        }),
      ],
    });
  }
  return lines.filter((l) => l.squares.length > 0);
}
