import { sym } from './ions';
import type { AnionId, CationId, ConfirmTest, IonId, Outcome, Salt, SaltColour, Section, Step } from './types';

// The procedure follows the CBSE practical order (DESIGN.md §4.3, §6.2).
// ⚠️ Chemistry lives here: every observation must stay accurate. vitest checks the structure
// (every salt solvable, exactly one outcome per step), not the chemistry itself.

export const C = {
  clear: '#e6f0f7',
  white: '#f7f7f2',
  dirtyWhite: '#e3ddc8',
  black: '#1e1e1e',
  yellow: '#f2cf1d',
  canary: '#ffe53b',
  paleYellow: '#f1e7a6',
  buff: '#e6bf98',
  reddishBrown: '#8e3b17',
  chocolate: '#5b3318',
  prussian: '#1f3e93',
  bloodRed: '#9e0c12',
  deepRed: '#b3261e',
  brightRed: '#e2245c',
  brownPpt: '#86552a',
  deepBlue: '#1f43c4',
  blueLake: '#3c6fd9',
  bluishWhite: '#dce7f3',
  purple: '#a52a8c',
  violet: '#7a3aa3',
  orangeBrown: '#c8641c',
  redBrownVapour: '#a2421a',
  lightBrownFumes: '#c48a4c',
  colourlessGas: '#d9dde3',
  milky: '#f1f1ea',
  limeClear: '#eef6fb',
  green: '#3d9a46',
  orange: '#e98b2a',
  pink: '#f0a3bf',
};

const SALT_COLOUR: Record<SaltColour, { solid: string; solution: string }> = {
  white: { solid: '#fbfbf8', solution: C.clear },
  blue: { solid: '#2f6fd6', solution: '#7fb0ee' },
  green: { solid: '#3f9d52', solution: '#93d19c' },
  pink: { solid: '#c9437b', solution: '#f2a9c6' },
  'light-pink': { solid: '#f3d3dc', solution: '#f8e6ec' },
  'yellow-brown': { solid: '#c98a2b', solution: '#e2b45e' },
};

export const saltTint = (salt: Salt) => SALT_COLOUR[salt.colour];

const an = (...ids: AnionId[]) => (s: Salt) => ids.includes(s.anion);
const cat = (...ids: CationId[]) => (s: Salt) => ids.includes(s.cation);
const absent = (ids: IonId[]) => `${ids.map(sym).join(', ')} absent`;

/** Adds the "nothing happened" outcome that matches whenever no positive outcome does. */
function withNegative(positives: Outcome[], negative: Omit<Outcome, 'match' | 'id' | 'result'>): Outcome[] {
  return [
    ...positives,
    {
      ...negative,
      id: 'negative',
      result: 'negative',
      match: (s) => !positives.some((o) => o.match(s)),
    },
  ];
}

// ───────────────────────────── Preliminary ─────────────────────────────

const physical: Step = {
  id: 'physical',
  card: 'Physical examination',
  label: 'physical examination',
  experiment: 'Note the colour of the salt',
  outcomes: [
    {
      id: 'white',
      match: (s) => s.colour === 'white',
      observation: 'White',
      inference: 'Cu²⁺, Fe³⁺, Mn²⁺, Co²⁺, Ni²⁺ probably absent',
      result: 'info',
      visual: { apparatus: 'watch-glass', solid: SALT_COLOUR.white.solid },
      note: 'White salt? Every coloured ion just left the chat. Doesn’t mean you skip any group though.',
    },
    {
      id: 'blue',
      match: (s) => s.colour === 'blue',
      observation: 'Blue',
      inference: 'Cu²⁺ may be present',
      result: 'info',
      visual: { apparatus: 'watch-glass', solid: SALT_COLOUR.blue.solid },
      note: 'Blue = copper. Nine times out of ten. Still march through every group. She’s watching.',
    },
    {
      id: 'green',
      match: (s) => s.colour === 'green',
      observation: 'Green',
      inference: 'Ni²⁺ may be present',
      result: 'info',
      visual: { apparatus: 'watch-glass', solid: SALT_COLOUR.green.solid },
      note: 'Bright green = nickel. Remember it when Group IV goes black.',
    },
    {
      id: 'pink',
      match: (s) => s.colour === 'pink',
      observation: 'Pink / reddish-violet',
      inference: 'Co²⁺ may be present',
      result: 'info',
      visual: { apparatus: 'watch-glass', solid: SALT_COLOUR.pink.solid },
      note: 'Proper pink-red = cobalt. Pale, barely-pink = manganese. Don’t mix them up.',
    },
    {
      id: 'light-pink',
      match: (s) => s.colour === 'light-pink',
      observation: 'Very light pink',
      inference: 'Mn²⁺ may be present',
      result: 'info',
      visual: { apparatus: 'watch-glass', solid: SALT_COLOUR['light-pink'].solid },
      note: 'That shy pink is manganese. Expect a buff ppt in Group IV.',
    },
    {
      id: 'yellow-brown',
      match: (s) => s.colour === 'yellow-brown',
      observation: 'Yellowish-brown',
      inference: 'Fe³⁺ may be present',
      result: 'info',
      visual: { apparatus: 'watch-glass', solid: SALT_COLOUR['yellow-brown'].solid },
      note: 'Rusty yellow-brown = ferric. Group III will go reddish-brown. Called it.',
    },
  ],
};

const flame: Step = {
  id: 'flame',
  card: 'Flame test',
  label: 'flame test',
  experiment: 'Make a paste of the salt with conc. HCl; hold it in the flame on a platinum wire',
  outcomes: withNegative(
    [
      {
        id: 'ca',
        match: cat('Ca'),
        observation: 'Brick-red flame',
        inference: 'Ca²⁺ may be present',
        result: 'info',
        visual: { apparatus: 'flame', flame: '#d9541e' },
        note: 'Brick-red = calcium. Group V will tell the same story.',
      },
      {
        id: 'sr',
        match: cat('Sr'),
        observation: 'Crimson-red flame',
        inference: 'Sr²⁺ may be present',
        result: 'info',
        visual: { apparatus: 'flame', flame: '#d1123f' },
        note: 'Crimson = strontium. Deeper red than calcium’s brick. Squint if you must.',
      },
      {
        id: 'ba',
        match: cat('Ba'),
        observation: 'Apple-green flame',
        inference: 'Ba²⁺ may be present',
        result: 'info',
        visual: { apparatus: 'flame', flame: '#8fd14f' },
        note: 'Apple-green = barium. Write it down. Act surprised in Group V.',
      },
      {
        id: 'cu',
        match: cat('Cu'),
        observation: 'Green-blue flame',
        inference: 'Cu²⁺ may be present',
        result: 'info',
        visual: { apparatus: 'flame', flame: '#2bb59a' },
        note: 'Blue salt AND a green-blue flame. Copper is practically waving at you.',
      },
    ],
    {
      observation: 'No characteristic colour',
      inference: 'Ca²⁺, Sr²⁺, Ba²⁺, Cu²⁺ probably absent',
      visual: { apparatus: 'flame', flame: '#f2a640' },
    },
  ),
};

// ───────────────────────────── Anion ─────────────────────────────

const DIL_IONS: AnionId[] = ['CO3', 'S', 'SO3', 'NO2', 'CH3COO'];
const CONC_IONS: AnionId[] = ['Cl', 'Br', 'I', 'NO3', 'C2O4'];

const dilH2SO4: Step = {
  id: 'dil-h2so4',
  card: 'dil. H₂SO₄',
  label: 'dil. H₂SO₄ test',
  experiment: 'Salt + dil. H₂SO₄, warm gently',
  outcomes: withNegative(
    [
      {
        id: 'co3',
        match: an('CO3'),
        observation: 'Brisk effervescence; colourless, odourless gas',
        inference: 'CO₃²⁻ may be present',
        result: 'positive',
        candidates: ['CO3'],
        visual: { apparatus: 'tube', bubbles: 'brisk' },
        note: 'Fizz with no smell = carbonate. Easiest marks of your life.',
      },
      {
        id: 's',
        match: an('S'),
        observation: 'Colourless gas with a rotten-egg smell',
        inference: 'S²⁻ may be present',
        result: 'positive',
        candidates: ['S'],
        visual: { apparatus: 'tube', bubbles: 'gentle', smell: 'rotten eggs' },
      },
      {
        id: 'so3',
        match: an('SO3'),
        observation: 'Colourless gas with a suffocating (burning sulphur) smell',
        inference: 'SO₃²⁻ may be present',
        result: 'positive',
        candidates: ['SO3'],
        visual: { apparatus: 'tube', bubbles: 'gentle', smell: 'burning sulphur' },
      },
      {
        id: 'no2',
        match: an('NO2'),
        observation: 'Light brown fumes',
        inference: 'NO₂⁻ may be present',
        result: 'positive',
        candidates: ['NO2'],
        visual: { apparatus: 'tube', fumes: C.lightBrownFumes },
      },
      {
        id: 'ac',
        match: an('CH3COO'),
        observation: 'Colourless vapours with a vinegar smell',
        inference: 'CH₃COO⁻ may be present',
        result: 'positive',
        candidates: ['CH3COO'],
        visual: { apparatus: 'tube', fumes: C.colourlessGas, smell: 'vinegar' },
        note: 'Smells like the chaat stall? Acetate. Confirm with neutral FeCl₃.',
      },
    ],
    {
      observation: 'No gas evolved',
      inference: absent(DIL_IONS),
      visual: { apparatus: 'tube' },
      note: 'Nothing with dilute acid. Bring out the concentrated stuff.',
    },
  ),
};

const concH2SO4: Step = {
  id: 'conc-h2so4',
  card: 'conc. H₂SO₄',
  label: 'conc. H₂SO₄ test',
  experiment: 'Salt + conc. H₂SO₄, heat (add Cu turnings if brown fumes appear)',
  outcomes: withNegative(
    [
      {
        id: 'cl',
        match: an('Cl'),
        observation: 'Colourless pungent gas; dense white fumes with a rod dipped in NH₄OH',
        inference: 'Cl⁻ may be present',
        result: 'positive',
        candidates: ['Cl'],
        visual: {
          apparatus: 'tube',
          fumes: C.colourlessGas,
          smell: 'pungent, choking',
          rod: { label: 'NH₄OH rod', fumes: C.white },
        },
        note: 'White fumes at the NH₄OH rod = HCl gas = chloride. Silver nitrate will agree.',
      },
      {
        id: 'br',
        match: an('Br'),
        observation: 'Reddish-brown vapours',
        inference: 'Br⁻ may be present',
        result: 'positive',
        candidates: ['Br'],
        visual: { apparatus: 'tube', fumes: C.redBrownVapour },
        note: 'Reddish-brown WITHOUT copper turnings = bromine. Nitrate needs the copper.',
      },
      {
        id: 'i',
        match: an('I'),
        observation: 'Violet vapours',
        inference: 'I⁻ may be present',
        result: 'positive',
        candidates: ['I'],
        visual: { apparatus: 'tube', fumes: C.violet },
        note: 'Violet = iodine. Prettiest fumes in the lab. Don’t sniff them.',
      },
      {
        id: 'no3',
        match: an('NO3'),
        observation: 'Light brown fumes; they intensify on adding Cu turnings',
        inference: 'NO₃⁻ may be present',
        result: 'positive',
        candidates: ['NO3'],
        visual: { apparatus: 'tube', fumes: C.lightBrownFumes, prop: 'cu-turnings' },
        note: 'Copper turnings make it worse = nitrate. Brown ring time.',
      },
      {
        id: 'c2o4',
        match: an('C2O4'),
        observation: 'Colourless, odourless gas; it burns with a blue flame',
        inference: 'C₂O₄²⁻ may be present',
        result: 'positive',
        candidates: ['C2O4'],
        visual: { apparatus: 'tube', bubbles: 'gentle', mouthFlame: '#4d8df0' },
        note: 'Blue flame at the mouth = CO. CO + CO₂ from conc. acid = oxalate.',
      },
    ],
    {
      observation: 'No characteristic gas',
      inference: absent(CONC_IONS),
      visual: { apparatus: 'tube' },
      note: 'Still nothing? Sulphate or phosphate. They don’t make a scene, test them separately.',
    },
  ),
};

const bacl2: Step = {
  id: 'bacl2',
  card: 'BaCl₂ solution',
  label: 'sulphate test (BaCl₂)',
  experiment: 'Water extract + BaCl₂ solution; then add conc. HCl',
  outcomes: withNegative(
    [
      {
        id: 'so4',
        match: an('SO4'),
        observation: 'White ppt, insoluble in conc. HCl',
        inference: 'SO₄²⁻ may be present',
        result: 'positive',
        candidates: ['SO4'],
        visual: { apparatus: 'tube', ppt: C.white },
        note: 'Refuses to dissolve even in conc. HCl = BaSO₄. Stubborn, like you.',
      },
      {
        id: 'po4',
        match: an('PO4'),
        observation: 'White ppt, dissolves in conc. HCl',
        inference: 'SO₄²⁻ absent',
        result: 'negative',
        visual: { apparatus: 'tube' },
        note: 'Ppt that gives up in HCl is NOT sulphate. Try molybdate.',
      },
    ],
    {
      observation: 'No ppt',
      inference: 'SO₄²⁻ absent',
      visual: { apparatus: 'tube' },
    },
  ),
};

const molybdate: Step = {
  id: 'molybdate',
  card: 'conc. HNO₃ + ammonium molybdate',
  label: 'phosphate test (ammonium molybdate)',
  experiment: 'Salt + conc. HNO₃, warm; add ammonium molybdate solution',
  outcomes: withNegative(
    [
      {
        id: 'po4',
        match: an('PO4'),
        observation: 'Canary-yellow ppt',
        inference: 'PO₄³⁻ confirmed',
        result: 'positive',
        confirms: 'PO4',
        visual: { apparatus: 'tube', ppt: C.canary },
        note: 'Canary yellow = phosphate. That one IS the confirmatory test.',
      },
    ],
    {
      observation: 'No yellow ppt',
      inference: 'PO₄³⁻ absent',
      visual: { apparatus: 'tube' },
    },
  ),
};

/** A confirmatory test: one positive outcome per ion it detects, plus the negative. */
function confirm(
  def: Omit<ConfirmTest, 'outcomes'> & {
    positives: { ion: IonId; observation: string; visual: Outcome['visual']; note?: string }[];
    negative: { observation: string; visual: Outcome['visual'] };
  },
): ConfirmTest {
  const { positives, negative, ...rest } = def;
  return {
    ...rest,
    outcomes: withNegative(
      positives.map((p) => ({
        id: p.ion,
        match: (s: Salt) => s.anion === p.ion || s.cation === p.ion,
        observation: p.observation,
        inference: `${sym(p.ion)} confirmed`,
        result: 'positive' as const,
        confirms: p.ion,
        visual: p.visual,
        note: p.note,
      })),
      { ...negative, inference: absent(rest.forIons) },
    ),
  };
}

const anionConfirms: ConfirmTest[] = [
  confirm({
    id: 'limewater',
    card: 'Lime water',
    label: 'lime water test',
    experiment: 'Pass the gas from salt + dil. H₂SO₄ through lime water',
    forIons: ['CO3'],
    positives: [
      {
        ion: 'CO3',
        observation: 'Lime water turns milky',
        visual: { apparatus: 'tube', bubbles: 'gentle', solution: C.milky },
      },
    ],
    negative: { observation: 'Lime water stays clear', visual: { apparatus: 'tube', solution: C.limeClear } },
  }),
  confirm({
    id: 'pbac-paper',
    card: 'Lead acetate paper',
    label: 'lead acetate paper test',
    experiment: 'Hold lead acetate paper in the gas',
    forIons: ['S'],
    positives: [
      {
        ion: 'S',
        observation: 'Paper turns black',
        visual: { apparatus: 'tube', bubbles: 'gentle', paper: { label: 'lead acetate paper', from: C.white, to: C.black } },
      },
    ],
    negative: {
      observation: 'Paper does not change',
      visual: { apparatus: 'tube', paper: { label: 'lead acetate paper', from: C.white, to: C.white } },
    },
  }),
  confirm({
    id: 'nitroprusside',
    card: 'Sodium nitroprusside',
    label: 'sodium nitroprusside test',
    experiment: 'Sodium carbonate extract + sodium nitroprusside solution',
    forIons: ['S'],
    positives: [{ ion: 'S', observation: 'Purple / violet colour', visual: { apparatus: 'tube', solution: C.purple } }],
    negative: { observation: 'No purple colour', visual: { apparatus: 'tube' } },
  }),
  confirm({
    id: 'dichromate-paper',
    card: 'Acidified K₂Cr₂O₇ paper',
    label: 'acidified potassium dichromate paper test',
    experiment: 'Hold acidified K₂Cr₂O₇ paper in the gas',
    forIons: ['SO3'],
    positives: [
      {
        ion: 'SO3',
        observation: 'Paper turns green',
        visual: { apparatus: 'tube', bubbles: 'gentle', paper: { label: 'K₂Cr₂O₇ paper', from: C.orange, to: C.green } },
      },
    ],
    negative: {
      observation: 'Paper stays orange',
      visual: { apparatus: 'tube', paper: { label: 'K₂Cr₂O₇ paper', from: C.orange, to: C.orange } },
    },
  }),
  confirm({
    id: 'kmno4',
    card: 'Acidified KMnO₄',
    label: 'potassium permanganate test',
    experiment: 'Water extract + dil. H₂SO₄, warm; add KMnO₄ solution drop by drop',
    forIons: ['SO3', 'C2O4'],
    positives: [
      { ion: 'SO3', observation: 'Pink colour of KMnO₄ disappears', visual: { apparatus: 'tube', solution: C.clear } },
      { ion: 'C2O4', observation: 'Pink colour of KMnO₄ disappears', visual: { apparatus: 'tube', solution: C.clear } },
    ],
    negative: { observation: 'Pink colour stays', visual: { apparatus: 'tube', solution: C.pink } },
  }),
  confirm({
    id: 'ki-starch',
    card: 'KI + starch solution',
    label: 'potassium iodide–starch test',
    experiment: 'Water extract + acetic acid + KI + starch solution',
    forIons: ['NO2'],
    positives: [{ ion: 'NO2', observation: 'Solution turns deep blue', visual: { apparatus: 'tube', solution: C.deepBlue } }],
    negative: { observation: 'No blue colour', visual: { apparatus: 'tube' } },
  }),
  confirm({
    id: 'fecl3-neutral',
    card: 'Neutral FeCl₃',
    label: 'neutral ferric chloride test',
    experiment: 'Water extract + neutral FeCl₃ solution; then boil',
    forIons: ['CH3COO'],
    positives: [
      {
        ion: 'CH3COO',
        observation: 'Deep red colour; brown-red ppt on boiling',
        visual: { apparatus: 'tube', solution: C.deepRed, ppt: C.reddishBrown },
      },
    ],
    negative: { observation: 'No red colour', visual: { apparatus: 'tube', solution: '#efd9a0' } },
  }),
  confirm({
    id: 'agno3',
    card: 'AgNO₃ solution',
    label: 'silver nitrate test',
    experiment: 'Water extract + dil. HNO₃ + AgNO₃; then add NH₄OH',
    forIons: ['Cl', 'Br', 'I'],
    positives: [
      { ion: 'Cl', observation: 'Curdy white ppt, soluble in NH₄OH', visual: { apparatus: 'tube', ppt: C.white } },
      {
        ion: 'Br',
        observation: 'Pale yellow ppt, sparingly soluble in NH₄OH',
        visual: { apparatus: 'tube', ppt: C.paleYellow },
      },
      { ion: 'I', observation: 'Yellow ppt, insoluble in NH₄OH', visual: { apparatus: 'tube', ppt: C.yellow } },
    ],
    negative: { observation: 'No ppt', visual: { apparatus: 'tube' } },
  }),
  confirm({
    id: 'chromyl',
    card: 'K₂Cr₂O₇ + conc. H₂SO₄ (chromyl chloride)',
    label: 'chromyl chloride test',
    experiment: 'Salt + solid K₂Cr₂O₇ + conc. H₂SO₄, heat; pass vapours into NaOH; add acetic acid + lead acetate',
    forIons: ['Cl'],
    positives: [
      {
        ion: 'Cl',
        observation: 'Orange-red vapours; yellow solution in NaOH; yellow ppt with lead acetate',
        visual: { apparatus: 'tube', fumes: C.orangeBrown, ppt: C.yellow },
      },
    ],
    negative: { observation: 'No orange-red vapours', visual: { apparatus: 'tube' } },
  }),
  confirm({
    id: 'layer',
    card: 'CCl₄ + chlorine water (layer test)',
    label: 'layer test',
    experiment: 'Water extract + CCl₄ + chlorine water, shake',
    forIons: ['Br', 'I'],
    positives: [
      { ion: 'Br', observation: 'Orange-brown organic layer', visual: { apparatus: 'tube', layer: C.orangeBrown } },
      { ion: 'I', observation: 'Violet organic layer', visual: { apparatus: 'tube', layer: C.violet } },
    ],
    negative: { observation: 'Organic layer stays colourless', visual: { apparatus: 'tube', layer: C.clear } },
  }),
  confirm({
    id: 'brown-ring',
    card: 'FeSO₄ + conc. H₂SO₄ (brown ring)',
    label: 'brown ring test',
    experiment: 'Water extract + fresh FeSO₄ solution; pour conc. H₂SO₄ slowly down the side',
    forIons: ['NO3'],
    positives: [
      {
        ion: 'NO3',
        observation: 'Dark brown ring at the junction of the two layers',
        visual: { apparatus: 'tube', ring: '#5a2e12' },
        note: 'Brown ring = nitrate. Pour slowly or there is no ring and no marks.',
      },
    ],
    negative: { observation: 'No brown ring', visual: { apparatus: 'tube' } },
  }),
  confirm({
    id: 'cacl2',
    card: 'CaCl₂ solution',
    label: 'calcium chloride test',
    experiment: 'Water extract + acetic acid + CaCl₂ solution',
    forIons: ['C2O4'],
    positives: [{ ion: 'C2O4', observation: 'White ppt', visual: { apparatus: 'tube', ppt: C.white } }],
    negative: { observation: 'No ppt', visual: { apparatus: 'tube' } },
  }),
  confirm({
    id: 'pbac-solution',
    card: 'Lead acetate solution',
    label: 'lead acetate test',
    experiment: 'Water extract + acetic acid + lead acetate; then add hot ammonium acetate',
    forIons: ['SO4'],
    positives: [
      {
        ion: 'SO4',
        observation: 'White ppt, soluble in hot ammonium acetate',
        visual: { apparatus: 'tube', ppt: C.white },
      },
    ],
    negative: { observation: 'No ppt', visual: { apparatus: 'tube' } },
  }),
];

// ───────────────────────────── Cation ─────────────────────────────

const group0: Step = {
  id: 'g0',
  card: 'NaOH + heat',
  label: 'Group zero',
  experiment: 'Salt + NaOH solution, heat; bring a rod dipped in conc. HCl to the mouth',
  outcomes: withNegative(
    [
      {
        id: 'nh4',
        match: cat('NH4'),
        observation: 'Smell of ammonia; white fumes with the HCl rod',
        inference: 'Group zero present (NH₄⁺)',
        result: 'positive',
        candidates: ['NH4'],
        visual: { apparatus: 'tube', smell: 'ammonia', rod: { label: 'conc. HCl rod', fumes: C.white } },
        note: 'Ammonia smell = NH₄⁺. Confirm with Nessler’s and you can skip the long march.',
      },
    ],
    {
      observation: 'No smell of ammonia',
      inference: 'Group zero absent (NH₄⁺ absent)',
      visual: { apparatus: 'tube' },
    },
  ),
};

const originalSolution: Step = {
  id: 'os',
  card: 'Prepare original solution',
  label: 'original solution',
  experiment: 'Shake the salt with distilled water; if it does not dissolve, use dil. HCl',
  outcomes: [
    {
      id: 'water',
      match: (s) => s.solubleInWater,
      observation: 'Salt dissolves in water',
      inference: 'Original solution (O.S.) prepared in water',
      result: 'info',
      visual: { apparatus: 'tube' },
    },
    {
      id: 'hcl',
      match: (s) => !s.solubleInWater,
      observation: 'Insoluble in water; dissolves in dil. HCl',
      inference: 'Original solution (O.S.) prepared in dil. HCl',
      result: 'info',
      visual: { apparatus: 'tube', bubbles: 'gentle' },
      note: 'Doesn’t dissolve in water? Probably a carbonate. Dil. HCl, and watch it fizz.',
    },
  ],
};

const group1: Step = {
  id: 'g1',
  card: 'dil. HCl',
  label: 'Group I',
  experiment: 'O.S. + dil. HCl',
  outcomes: withNegative(
    [
      {
        id: 'pb',
        match: cat('Pb'),
        observation: 'White ppt',
        inference: 'Group I present (Pb²⁺)',
        result: 'positive',
        candidates: ['Pb'],
        visual: { apparatus: 'tube', ppt: C.white },
        note: 'Lead. In a real lab some of it sneaks into Group II too. PbCl₂ is a bit soluble.',
      },
    ],
    { observation: 'No ppt', inference: 'Group I absent', visual: { apparatus: 'tube' } },
  ),
};

const group2: Step = {
  id: 'g2',
  card: 'H₂S gas (acidic medium)',
  label: 'Group II',
  experiment: 'O.S. + dil. HCl; pass H₂S gas',
  outcomes: withNegative(
    [
      {
        id: 'cu',
        match: cat('Cu'),
        observation: 'Black ppt',
        inference: 'Group II present (Cu²⁺)',
        result: 'positive',
        candidates: ['Cu'],
        visual: { apparatus: 'tube', ppt: C.black, bubbles: 'gentle' },
      },
      {
        id: 'as',
        match: cat('As'),
        observation: 'Yellow ppt',
        inference: 'Group II present (As³⁺)',
        result: 'positive',
        candidates: ['As'],
        visual: { apparatus: 'tube', ppt: C.yellow, bubbles: 'gentle' },
      },
    ],
    { observation: 'No ppt', inference: 'Group II absent', visual: { apparatus: 'tube', bubbles: 'gentle' } },
  ),
};

const group3: Step = {
  id: 'g3',
  card: 'conc. HNO₃, then NH₄Cl + NH₄OH',
  label: 'Group III',
  experiment: 'Boil O.S. with a few drops of conc. HNO₃; add solid NH₄Cl, then NH₄OH in excess',
  outcomes: withNegative(
    [
      {
        id: 'fe3',
        match: cat('Fe3'),
        observation: 'Reddish-brown ppt',
        inference: 'Group III present (Fe³⁺)',
        result: 'positive',
        candidates: ['Fe3'],
        visual: { apparatus: 'tube', ppt: C.reddishBrown, pptStyle: 'gelatinous' },
      },
      {
        id: 'al',
        match: cat('Al'),
        observation: 'White gelatinous ppt',
        inference: 'Group III present (Al³⁺)',
        result: 'positive',
        candidates: ['Al'],
        visual: { apparatus: 'tube', ppt: C.white, pptStyle: 'gelatinous' },
        note: 'White and wobbly like jelly = Al(OH)₃. Lake test next.',
      },
    ],
    {
      observation: 'No ppt',
      inference: 'Group III absent',
      visual: { apparatus: 'tube' },
      note: 'NH₄Cl is there to keep Mg²⁺ from crashing Group III. That’s a viva question, by the way.',
    },
  ),
};

const group4: Step = {
  id: 'g4',
  card: 'H₂S gas (ammoniacal medium)',
  label: 'Group IV',
  experiment: 'Pass H₂S gas through the ammoniacal solution from Group III',
  outcomes: withNegative(
    [
      {
        id: 'zn',
        match: cat('Zn'),
        observation: 'Dirty-white ppt',
        inference: 'Group IV present (Zn²⁺)',
        result: 'positive',
        candidates: ['Zn'],
        visual: { apparatus: 'tube', ppt: C.dirtyWhite, bubbles: 'gentle' },
      },
      {
        id: 'mn',
        match: cat('Mn'),
        observation: 'Buff (flesh-coloured) ppt',
        inference: 'Group IV present (Mn²⁺)',
        result: 'positive',
        candidates: ['Mn'],
        visual: { apparatus: 'tube', ppt: C.buff, bubbles: 'gentle' },
      },
      {
        id: 'nico',
        match: cat('Ni', 'Co'),
        observation: 'Black ppt',
        inference: 'Group IV present (Ni²⁺ or Co²⁺)',
        result: 'positive',
        candidates: ['Ni', 'Co'],
        visual: { apparatus: 'tube', ppt: C.black, bubbles: 'gentle' },
        note: 'Black in Group IV: nickel or cobalt. Look back at the salt’s colour. Green or pink?',
      },
    ],
    { observation: 'No ppt', inference: 'Group IV absent', visual: { apparatus: 'tube', bubbles: 'gentle' } },
  ),
};

const group5: Step = {
  id: 'g5',
  card: '(NH₄)₂CO₃ + NH₄OH',
  label: 'Group V',
  experiment: 'Boil off H₂S; add NH₄OH and (NH₄)₂CO₃ solution',
  outcomes: withNegative(
    [
      {
        id: 'ba-sr-ca',
        match: cat('Ba', 'Sr', 'Ca'),
        observation: 'White ppt',
        inference: 'Group V present (Ba²⁺, Sr²⁺ or Ca²⁺)',
        result: 'positive',
        candidates: ['Ba', 'Sr', 'Ca'],
        visual: { apparatus: 'tube', ppt: C.white },
        note: 'Ba, then Sr, then Ca. In THAT order, or the yellow ppt lies to you. The flame test already told you, didn’t it?',
      },
    ],
    { observation: 'No ppt', inference: 'Group V absent', visual: { apparatus: 'tube' } },
  ),
};

const group6: Step = {
  id: 'g6',
  card: 'Na₂HPO₄ + NH₄OH',
  label: 'Group VI',
  experiment: 'Add NH₄OH and Na₂HPO₄ solution; scratch the sides of the test tube',
  outcomes: withNegative(
    [
      {
        id: 'mg',
        match: cat('Mg'),
        observation: 'White crystalline ppt',
        inference: 'Group VI present: Mg²⁺ confirmed',
        result: 'positive',
        confirms: 'Mg',
        visual: { apparatus: 'tube', ppt: C.white, pptStyle: 'crystalline' },
        note: 'Made it to the last group. Magnesium. Scratching the tube helps the crystals. Not your grades.',
      },
    ],
    { observation: 'No ppt', inference: 'Group VI absent', visual: { apparatus: 'tube' } },
  ),
};

const cationConfirms: ConfirmTest[] = [
  confirm({
    id: 'nessler',
    card: 'Nessler’s reagent',
    label: 'Nessler’s reagent test',
    experiment: 'Pass the gas (salt + NaOH, heated) into Nessler’s reagent',
    forIons: ['NH4'],
    positives: [{ ion: 'NH4', observation: 'Brown ppt', visual: { apparatus: 'tube', solution: '#f1d77a', ppt: C.brownPpt } }],
    negative: { observation: 'No brown ppt', visual: { apparatus: 'tube', solution: '#f6eab5' } },
  }),
  confirm({
    id: 'ki',
    card: 'KI solution',
    label: 'potassium iodide test',
    experiment: 'Dissolve the Group I ppt in hot water; add KI solution',
    forIons: ['Pb'],
    positives: [
      { ion: 'Pb', observation: 'Yellow ppt (golden spangles on cooling)', visual: { apparatus: 'tube', ppt: C.yellow, pptStyle: 'crystalline' } },
    ],
    negative: { observation: 'No yellow ppt', visual: { apparatus: 'tube' } },
  }),
  confirm({
    id: 'k2cro4',
    card: 'K₂CrO₄ solution',
    label: 'potassium chromate test',
    experiment: 'Dissolve the ppt (hot water for Group I, acetic acid for Group V); add K₂CrO₄ solution',
    forIons: ['Pb', 'Ba'],
    positives: [
      { ion: 'Pb', observation: 'Yellow ppt', visual: { apparatus: 'tube', solution: '#f6e27a', ppt: C.yellow } },
      { ion: 'Ba', observation: 'Yellow ppt', visual: { apparatus: 'tube', solution: '#f6e27a', ppt: C.yellow } },
    ],
    negative: { observation: 'No yellow ppt', visual: { apparatus: 'tube', solution: '#f6e27a' } },
  }),
  confirm({
    id: 'nh4oh-excess',
    card: 'NH₄OH in excess',
    label: 'ammonium hydroxide test',
    experiment: 'Dissolve the black ppt in 50% HNO₃; add NH₄OH in excess',
    forIons: ['Cu'],
    positives: [{ ion: 'Cu', observation: 'Deep blue solution', visual: { apparatus: 'tube', solution: C.deepBlue } }],
    negative: { observation: 'No blue colour', visual: { apparatus: 'tube' } },
  }),
  confirm({
    id: 'ferrocyanide',
    card: 'K₄[Fe(CN)₆] solution',
    label: 'potassium ferrocyanide test',
    experiment: 'Dissolve the ppt in acid; add potassium ferrocyanide, K₄[Fe(CN)₆]',
    forIons: ['Cu', 'Fe3', 'Zn'],
    positives: [
      { ion: 'Cu', observation: 'Chocolate-brown ppt', visual: { apparatus: 'tube', ppt: C.chocolate } },
      { ion: 'Fe3', observation: 'Prussian blue colour / ppt', visual: { apparatus: 'tube', solution: '#3d5fb8', ppt: C.prussian } },
      { ion: 'Zn', observation: 'Bluish-white ppt', visual: { apparatus: 'tube', ppt: C.bluishWhite } },
    ],
    negative: { observation: 'No characteristic ppt', visual: { apparatus: 'tube' } },
  }),
  confirm({
    id: 'molybdate-as',
    card: 'Ammonium molybdate (for As³⁺)',
    label: 'ammonium molybdate test for arsenic',
    experiment: 'Dissolve the yellow ppt in conc. HNO₃; add ammonium molybdate, warm',
    forIons: ['As'],
    positives: [{ ion: 'As', observation: 'Yellow ppt', visual: { apparatus: 'tube', ppt: C.canary } }],
    negative: { observation: 'No yellow ppt', visual: { apparatus: 'tube' } },
  }),
  confirm({
    id: 'kscn',
    card: 'KSCN solution',
    label: 'potassium thiocyanate test',
    experiment: 'Dissolve the reddish-brown ppt in dil. HCl; add KSCN solution',
    forIons: ['Fe3'],
    positives: [{ ion: 'Fe3', observation: 'Blood-red colour', visual: { apparatus: 'tube', solution: C.bloodRed } }],
    negative: { observation: 'No red colour', visual: { apparatus: 'tube' } },
  }),
  confirm({
    id: 'lake',
    card: 'Blue litmus + NH₄OH (lake test)',
    label: 'lake test',
    experiment: 'Dissolve the white ppt in dil. HCl; add blue litmus, then NH₄OH drop by drop',
    forIons: ['Al'],
    positives: [
      {
        ion: 'Al',
        observation: 'Blue ppt floating in a colourless solution (blue lake)',
        visual: { apparatus: 'tube', ppt: C.blueLake, pptStyle: 'floating' },
        note: 'Blue lake = aluminium. The ppt soaks up the litmus. Floaty marks.',
      },
    ],
    negative: { observation: 'No blue lake', visual: { apparatus: 'tube', solution: '#b9c8ef' } },
  }),
  confirm({
    id: 'naoh',
    card: 'NaOH solution',
    label: 'sodium hydroxide test',
    experiment: 'Dissolve the ppt in dil. HCl; add NaOH drop by drop, then in excess',
    forIons: ['Zn', 'Mn'],
    positives: [
      { ion: 'Zn', observation: 'White ppt, dissolves in excess NaOH', visual: { apparatus: 'tube', solution: C.clear } },
      { ion: 'Mn', observation: 'White ppt, turns brown on standing', visual: { apparatus: 'tube', ppt: '#9a6b3c' } },
    ],
    negative: { observation: 'No characteristic change', visual: { apparatus: 'tube' } },
  }),
  confirm({
    id: 'pbo2',
    card: 'PbO₂ + conc. HNO₃',
    label: 'lead dioxide test',
    experiment: 'Boil the ppt with PbO₂ and conc. HNO₃; let it settle',
    forIons: ['Mn'],
    positives: [{ ion: 'Mn', observation: 'Pink / purple solution', visual: { apparatus: 'tube', solution: C.purple, ppt: '#4b3a2a' } }],
    negative: { observation: 'No pink colour', visual: { apparatus: 'tube', ppt: '#4b3a2a' } },
  }),
  confirm({
    id: 'dmg',
    card: 'Dimethylglyoxime (DMG)',
    label: 'dimethylglyoxime test',
    experiment: 'Dissolve the black ppt in aqua regia; add NH₄OH and DMG',
    forIons: ['Ni'],
    positives: [
      {
        ion: 'Ni',
        observation: 'Bright red (rosy) ppt',
        visual: { apparatus: 'tube', ppt: C.brightRed },
        note: 'Rosy red with DMG = nickel. Prettiest confirmatory test, change my mind.',
      },
    ],
    negative: { observation: 'No red ppt', visual: { apparatus: 'tube', solution: '#e9cfae' } },
  }),
  confirm({
    id: 'kno2',
    card: 'KNO₂ + CH₃COOH',
    label: 'potassium nitrite test',
    experiment: 'Dissolve the black ppt in aqua regia; add CH₃COOH and KNO₂, warm',
    forIons: ['Co'],
    positives: [{ ion: 'Co', observation: 'Yellow ppt', visual: { apparatus: 'tube', ppt: C.yellow } }],
    negative: { observation: 'No yellow ppt', visual: { apparatus: 'tube' } },
  }),
  confirm({
    id: 'nh4scn',
    card: 'NH₄SCN + amyl alcohol',
    label: 'ammonium thiocyanate test',
    experiment: 'Dissolve the black ppt in aqua regia; add NH₄SCN and amyl alcohol, shake',
    forIons: ['Co'],
    positives: [{ ion: 'Co', observation: 'Blue colour in the alcohol layer', visual: { apparatus: 'tube', layer: C.deepBlue, layerTop: true } }],
    negative: { observation: 'Alcohol layer stays colourless', visual: { apparatus: 'tube', layer: C.clear, layerTop: true } },
  }),
  confirm({
    id: 'nh42so4',
    card: '(NH₄)₂SO₄ solution',
    label: 'ammonium sulphate test',
    experiment: 'Dissolve the Group V ppt in acetic acid; add (NH₄)₂SO₄ solution, warm',
    forIons: ['Sr'],
    after: ['k2cro4'],
    afterReason: 'Test for Ba²⁺ first, then Sr²⁺, then Ca²⁺',
    positives: [{ ion: 'Sr', observation: 'White ppt', visual: { apparatus: 'tube', ppt: C.white } }],
    negative: { observation: 'No ppt', visual: { apparatus: 'tube' } },
  }),
  confirm({
    id: 'nh42c2o4',
    card: '(NH₄)₂C₂O₄ solution',
    label: 'ammonium oxalate test',
    experiment: 'Dissolve the Group V ppt in acetic acid; add (NH₄)₂C₂O₄ solution',
    forIons: ['Ca'],
    after: ['k2cro4', 'nh42so4'],
    afterReason: 'Test for Ba²⁺ first, then Sr²⁺, then Ca²⁺',
    positives: [{ ion: 'Ca', observation: 'White ppt', visual: { apparatus: 'tube', ppt: C.white } }],
    negative: { observation: 'No ppt', visual: { apparatus: 'tube' } },
  }),
];

export const SECTIONS: Section[] = [
  { id: 'prelim', title: 'Preliminary tests', mode: 'survey', chain: [physical, flame], confirms: [] },
  {
    id: 'anion',
    title: 'Anion (acid radical)',
    mode: 'detect',
    chain: [dilH2SO4, concH2SO4, bacl2, molybdate],
    confirms: anionConfirms,
  },
  {
    id: 'cation',
    title: 'Cation (basic radical)',
    mode: 'detect',
    chain: [group0, originalSolution, group1, group2, group3, group4, group5, group6],
    confirms: cationConfirms,
  },
];
