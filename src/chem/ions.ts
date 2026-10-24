import type { Ion, IonId } from './types';

export const IONS: Record<IonId, Ion> = {
  CO3: { id: 'CO3', kind: 'anion', symbol: 'CO₃²⁻', name: 'carbonate', syllabus: ['cbse'] },
  S: { id: 'S', kind: 'anion', symbol: 'S²⁻', name: 'sulphide', syllabus: ['cbse'] },
  SO3: { id: 'SO3', kind: 'anion', symbol: 'SO₃²⁻', name: 'sulphite', syllabus: ['cbse'] },
  NO2: { id: 'NO2', kind: 'anion', symbol: 'NO₂⁻', name: 'nitrite', syllabus: ['cbse'] },
  CH3COO: { id: 'CH3COO', kind: 'anion', symbol: 'CH₃COO⁻', name: 'acetate', syllabus: ['cbse'] },
  Cl: { id: 'Cl', kind: 'anion', symbol: 'Cl⁻', name: 'chloride', syllabus: ['cbse'] },
  Br: { id: 'Br', kind: 'anion', symbol: 'Br⁻', name: 'bromide', syllabus: ['cbse'] },
  I: { id: 'I', kind: 'anion', symbol: 'I⁻', name: 'iodide', syllabus: ['cbse'] },
  NO3: { id: 'NO3', kind: 'anion', symbol: 'NO₃⁻', name: 'nitrate', syllabus: ['cbse'] },
  C2O4: { id: 'C2O4', kind: 'anion', symbol: 'C₂O₄²⁻', name: 'oxalate', syllabus: ['cbse'] },
  SO4: { id: 'SO4', kind: 'anion', symbol: 'SO₄²⁻', name: 'sulphate', syllabus: ['cbse'] },
  PO4: { id: 'PO4', kind: 'anion', symbol: 'PO₄³⁻', name: 'phosphate', syllabus: ['cbse'] },

  NH4: { id: 'NH4', kind: 'cation', symbol: 'NH₄⁺', name: 'ammonium', syllabus: ['cbse'] },
  Pb: { id: 'Pb', kind: 'cation', symbol: 'Pb²⁺', name: 'lead', syllabus: ['cbse'] },
  Cu: { id: 'Cu', kind: 'cation', symbol: 'Cu²⁺', name: 'copper', syllabus: ['cbse'] },
  As: { id: 'As', kind: 'cation', symbol: 'As³⁺', name: 'arsenic', syllabus: ['cbse'] },
  Al: { id: 'Al', kind: 'cation', symbol: 'Al³⁺', name: 'aluminium', syllabus: ['cbse'] },
  Fe3: { id: 'Fe3', kind: 'cation', symbol: 'Fe³⁺', name: 'iron(III)', syllabus: ['cbse'] },
  Mn: { id: 'Mn', kind: 'cation', symbol: 'Mn²⁺', name: 'manganese', syllabus: ['cbse'] },
  Zn: { id: 'Zn', kind: 'cation', symbol: 'Zn²⁺', name: 'zinc', syllabus: ['cbse'] },
  Co: { id: 'Co', kind: 'cation', symbol: 'Co²⁺', name: 'cobalt', syllabus: ['cbse'] },
  Ni: { id: 'Ni', kind: 'cation', symbol: 'Ni²⁺', name: 'nickel', syllabus: ['cbse'] },
  Ca: { id: 'Ca', kind: 'cation', symbol: 'Ca²⁺', name: 'calcium', syllabus: ['cbse'] },
  Sr: { id: 'Sr', kind: 'cation', symbol: 'Sr²⁺', name: 'strontium', syllabus: ['cbse'] },
  Ba: { id: 'Ba', kind: 'cation', symbol: 'Ba²⁺', name: 'barium', syllabus: ['cbse'] },
  Mg: { id: 'Mg', kind: 'cation', symbol: 'Mg²⁺', name: 'magnesium', syllabus: ['cbse'] },
};

export const sym = (id: IonId): string => IONS[id].symbol;
