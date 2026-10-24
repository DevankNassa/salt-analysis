import { sym } from '../chem/ions';
import type { GameState } from './game';

export type TeacherMood = 'stern' | 'shouting' | 'flustered' | 'shocked' | 'grudging' | 'facepalm';

export interface TeacherLine {
  mood: TeacherMood;
  text: string;
}

const pick = (lines: string[], n: number) => lines[n % lines.length];

const L = {
  start: [
    'Unknown salt. One period. Do NOT make me regret this.',
    'Here is your salt. Write EVERYTHING in the sheet. Neatly!',
    'Procedure first, brilliance later. Begin.',
  ],
  order: [
    '{card}?! That is NOT the next step. PROCEDURE!',
    'Skipping steps? In MY lab?!',
    'ORDER! In order! Did you even open the manual?',
    'You do not jump around in salt analysis. Back to where you were!',
  ],
  repeat: ['You already did that. The answer will not change because you stare at it.', 'Again?! Once is enough.'],
  confirmEarly: ['Confirm WHAT? You have not found anything yet!', 'Confirmatory tests come AFTER you find something!'],
  confirmNeeded: [
    'You already have a result. CONFIRM it before running off!',
    'Stop! You got something. Confirm it first!',
  ],
  irrelevant: [
    'Why are you testing for that? Read your own inference!',
    'That reagent costs money, you know! It has nothing to do with your result!',
    'Wrong confirmatory test. Think about what you are confirming!',
  ],
  prereq: ['{detail}. I have said it a HUNDRED times!'],
  wrongObs: [
    'Look at the test tube. LOOK at it!',
    'That is not what it shows. Do you need glasses? I need new glasses!',
    'Are we looking at the same test tube?!',
  ],
  wrongInf: [
    'That inference does not follow. At ALL.',
    'Think! What does that observation MEAN?',
    'Wrong. Cut it and write it again. Neatly.',
  ],
  wrongFormula: ['Count the charges! Valency! Class nine stuff!', 'The charges do not balance. Try again.'],
  negative: ['Fine. Next.', 'Mm-hm. Continue.', 'Nothing there. Move on.', 'Okay. Next step.'],
  info: ['Noted. Go on.', 'Write it down properly.', 'Good. Keep going.'],
  positive: [
    'Something is there! Do not celebrate. Confirm it.',
    'A result! Now CONFIRM it.',
    'Hmm. Interesting. Prove it.',
  ],
  sectionPrelim: ['Preliminary done. Now the anion. In order.', 'Fine. Now the acid radical.'],
  sectionAnion: ['{ion}. Hmph. Correct. Now the cation, and no skipping groups.', '{ion} confirmed. ...Acceptable. Cation next.'],
  sectionCation: ['{ion}. Correct. Now write the formula of the salt.', 'Hmph. {ion}. Now the RESULT. Formula, please.'],
  hint: ['Hm? Were you just reading something? ...Carry on.', 'What is that note? Eyes on YOUR sheet!'],
  observed: ['Hmm. And what does that tell you?', 'And the inference?'],
  won0: ['Full marks. ...Hmph. Do not let it go to your head.', 'Acceptable. Very acceptable. Do not tell anyone I said that.'],
  won: ['Correct. Eventually. Fine.', 'You got there. My blood pressure did not enjoy it.'],
  wonBad: ['Correct... somehow. I need to sit down.', 'You passed. Barely. Like the manual says.'],
  lost: ['OUT! Out of my lab! Come back when you have read the manual!', 'That is SIX mistakes! Leave the lab. NOW!'],
};

const fill = (t: string, vars: Record<string, string | undefined>) =>
  t.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');

export function teacherLine(s: GameState): TeacherLine {
  const e = s.event;
  const n = s.eventCount;
  switch (e.type) {
    case 'start':
      return { mood: 'stern', text: pick(L.start, s.saltId.length) };
    case 'wrong-card': {
      const vars = { card: e.card, detail: e.detail };
      switch (e.reason) {
        case 'order':
          return { mood: 'shouting', text: fill(pick(L.order, n), vars) };
        case 'repeat':
          return { mood: 'facepalm', text: pick(L.repeat, n) };
        case 'confirm-early':
          return { mood: 'shocked', text: pick(L.confirmEarly, n) };
        case 'confirm-needed':
          return { mood: 'shouting', text: pick(L.confirmNeeded, n) };
        case 'irrelevant':
          return { mood: 'flustered', text: pick(L.irrelevant, n) };
        case 'prereq':
          return { mood: 'shouting', text: fill(pick(L.prereq, n), vars) };
      }
      break;
    }
    case 'card':
      return { mood: 'stern', text: 'Well? What do you observe?' };
    case 'observed':
      return { mood: 'stern', text: pick(L.observed, n) };
    case 'wrong-observation':
      return { mood: 'shocked', text: pick(L.wrongObs, n) };
    case 'wrong-inference':
      return { mood: 'facepalm', text: pick(L.wrongInf, n) };
    case 'row-done':
      if (e.result === 'positive') return { mood: 'flustered', text: pick(L.positive, n) };
      if (e.result === 'info') return { mood: 'stern', text: pick(L.info, n) };
      return { mood: 'stern', text: pick(e.candidates ? L.info : L.negative, n) };
    case 'section-done': {
      const ion = e.ion ? sym(e.ion) : '';
      if (e.section === 'prelim') return { mood: 'stern', text: pick(L.sectionPrelim, n) };
      if (e.section === 'anion') return { mood: 'grudging', text: fill(pick(L.sectionAnion, n), { ion }) };
      return { mood: 'grudging', text: fill(pick(L.sectionCation, n), { ion }) };
    }
    case 'wrong-formula':
      return { mood: 'shouting', text: pick(L.wrongFormula, n) };
    case 'hint':
      return { mood: 'shocked', text: pick(L.hint, n) };
    case 'won':
      if (s.strikes === 0) return { mood: 'grudging', text: pick(L.won0, n) };
      if (s.strikes <= 3) return { mood: 'stern', text: pick(L.won, n) };
      return { mood: 'facepalm', text: pick(L.wonBad, n) };
    case 'lost':
      return { mood: 'shouting', text: pick(L.lost, n) };
  }
  return { mood: 'stern', text: '' };
}
