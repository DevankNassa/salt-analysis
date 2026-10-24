export type AnionId =
  | 'CO3'
  | 'S'
  | 'SO3'
  | 'NO2'
  | 'CH3COO'
  | 'Cl'
  | 'Br'
  | 'I'
  | 'NO3'
  | 'C2O4'
  | 'SO4'
  | 'PO4';

export type CationId =
  | 'NH4'
  | 'Pb'
  | 'Cu'
  | 'As'
  | 'Al'
  | 'Fe3'
  | 'Mn'
  | 'Zn'
  | 'Co'
  | 'Ni'
  | 'Ca'
  | 'Sr'
  | 'Ba'
  | 'Mg';

export type IonId = AnionId | CationId;

export type Syllabus = 'cbse' | 'extended';

export interface Ion {
  id: IonId;
  kind: 'anion' | 'cation';
  symbol: string;
  name: string;
  syllabus: Syllabus[];
}

export type SaltColour = 'white' | 'blue' | 'green' | 'pink' | 'light-pink' | 'yellow-brown';

export interface Salt {
  id: string;
  name: string;
  formula: string;
  cation: CationId;
  anion: AnionId;
  colour: SaltColour;
  solubleInWater: boolean;
  syllabus: Syllabus[];
  /** Plausible wrong formulas (valency mistakes) for the final answer. */
  distractors: [string, string, string];
}

export type Smell = 'rotten eggs' | 'vinegar' | 'burning sulphur' | 'pungent, choking' | 'ammonia';

/** Everything the apparatus drawing needs to show a result. Colours are CSS colours. */
export interface Visual {
  apparatus: 'tube' | 'flame' | 'watch-glass';
  solution?: string;
  ppt?: string;
  pptStyle?: 'normal' | 'gelatinous' | 'crystalline' | 'floating';
  bubbles?: 'gentle' | 'brisk';
  fumes?: string;
  smell?: Smell;
  paper?: { label: string; from: string; to: string };
  rod?: { label: string; fumes: string };
  ring?: string;
  layer?: string;
  /** Organic layer floats on top (amyl alcohol) instead of sinking (CCl₄). */
  layerTop?: boolean;
  mouthFlame?: string;
  flame?: string;
  solid?: string;
  /** Extra prop shown in the tube, e.g. copper turnings. */
  prop?: 'cu-turnings';
  undissolved?: string;
}

export type ResultKind = 'negative' | 'positive' | 'info';

export interface Outcome {
  id: string;
  match: (salt: Salt) => boolean;
  observation: string;
  inference: string;
  result: ResultKind;
  /** Positive detection: the ions still in the running, to be confirmed next. */
  candidates?: IonId[];
  /** This outcome confirms the ion outright. */
  confirms?: IonId;
  visual: Visual;
  /** Free Anti-Chemist margin note shown after the row is completed. */
  note?: string;
}

export interface Step {
  id: string;
  /** Label on the reagent shelf card. */
  card: string;
  /** "Experiment" column of the answer sheet. */
  experiment: string;
  /** Short label used in hints, e.g. "Group III". */
  label: string;
  outcomes: Outcome[];
}

export interface ConfirmTest extends Step {
  /** Ions this test is meant to confirm. Using it for any other ion is a wasted reagent. */
  forIons: IonId[];
  /** Tests that must be done (and come out negative) before this one, e.g. Ba before Sr before Ca. */
  after?: string[];
  afterReason?: string;
}

export type SectionId = 'prelim' | 'anion' | 'cation';

export interface Section {
  id: SectionId;
  title: string;
  /** survey: every step runs. detect: stop at the first positive and confirm. */
  mode: 'survey' | 'detect';
  chain: Step[];
  confirms: ConfirmTest[];
}
