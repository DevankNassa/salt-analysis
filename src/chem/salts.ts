import type { AnionId, CationId, Salt, SaltColour } from './types';

// MVP pool (DESIGN.md §6.3). Single salts only; phosphate and oxalate are only paired with
// NH₄⁺ because removal of interfering radicals before Group III is not simulated.
// ⚠️ NH₄Br and NH₄I are here so the bromide/iodide branches get played; confirm they are realistic.

type Row = [
  id: string,
  name: string,
  formula: string,
  cation: CationId,
  anion: AnionId,
  colour: SaltColour,
  soluble: boolean,
  distractors: [string, string, string],
];

const ROWS: Row[] = [
  ['nh4cl', 'Ammonium chloride', 'NH₄Cl', 'NH4', 'Cl', 'white', true, ['NH₄Cl₂', '(NH₄)₂Cl', 'NH₃Cl']],
  ['nh4br', 'Ammonium bromide', 'NH₄Br', 'NH4', 'Br', 'white', true, ['NH₄Br₂', '(NH₄)₂Br', 'NH₃Br']],
  ['nh4i', 'Ammonium iodide', 'NH₄I', 'NH4', 'I', 'white', true, ['NH₄I₂', '(NH₄)₂I', 'NH₃I']],
  ['nh4no3', 'Ammonium nitrate', 'NH₄NO₃', 'NH4', 'NO3', 'white', true, ['(NH₄)₂NO₃', 'NH₄(NO₃)₂', 'NH₃NO₃']],
  ['nh42co3', 'Ammonium carbonate', '(NH₄)₂CO₃', 'NH4', 'CO3', 'white', true, ['NH₄CO₃', 'NH₄(CO₃)₂', '(NH₄)₃CO₃']],
  ['nh42so4', 'Ammonium sulphate', '(NH₄)₂SO₄', 'NH4', 'SO4', 'white', true, ['NH₄SO₄', 'NH₄(SO₄)₂', '(NH₄)₃SO₄']],
  ['nh43po4', 'Ammonium phosphate', '(NH₄)₃PO₄', 'NH4', 'PO4', 'white', true, ['NH₄PO₄', '(NH₄)₂PO₄', 'NH₄(PO₄)₃']],
  ['nh42c2o4', 'Ammonium oxalate', '(NH₄)₂C₂O₄', 'NH4', 'C2O4', 'white', true, ['NH₄C₂O₄', '(NH₄)₃C₂O₄', 'NH₄(C₂O₄)₂']],
  ['nh4ac', 'Ammonium acetate', 'CH₃COONH₄', 'NH4', 'CH3COO', 'white', true, ['(CH₃COO)₂NH₄', 'CH₃COO(NH₄)₂', '(CH₃COO)₃NH₄']],
  ['pbno32', 'Lead nitrate', 'Pb(NO₃)₂', 'Pb', 'NO3', 'white', true, ['PbNO₃', 'Pb₂NO₃', 'Pb(NO₃)₃']],
  ['pbac2', 'Lead acetate', '(CH₃COO)₂Pb', 'Pb', 'CH3COO', 'white', true, ['CH₃COOPb', 'CH₃COOPb₂', '(CH₃COO)₃Pb']],
  ['cuso4', 'Copper sulphate', 'CuSO₄', 'Cu', 'SO4', 'blue', true, ['Cu₂SO₄', 'Cu(SO₄)₂', 'Cu₂(SO₄)₃']],
  ['cuno32', 'Copper nitrate', 'Cu(NO₃)₂', 'Cu', 'NO3', 'blue', true, ['CuNO₃', 'Cu₂NO₃', 'Cu(NO₃)₃']],
  ['al2so43', 'Aluminium sulphate', 'Al₂(SO₄)₃', 'Al', 'SO4', 'white', true, ['AlSO₄', 'Al₃(SO₄)₂', 'Al(SO₄)₃']],
  ['alno33', 'Aluminium nitrate', 'Al(NO₃)₃', 'Al', 'NO3', 'white', true, ['AlNO₃', 'Al(NO₃)₂', 'Al₃NO₃']],
  ['fecl3', 'Ferric chloride', 'FeCl₃', 'Fe3', 'Cl', 'yellow-brown', true, ['FeCl₂', 'FeCl', 'Fe₃Cl']],
  ['znso4', 'Zinc sulphate', 'ZnSO₄', 'Zn', 'SO4', 'white', true, ['Zn₂SO₄', 'Zn(SO₄)₂', 'Zn₂(SO₄)₃']],
  ['znco3', 'Zinc carbonate', 'ZnCO₃', 'Zn', 'CO3', 'white', false, ['Zn₂CO₃', 'Zn(CO₃)₂', 'Zn₃CO₃']],
  ['znno32', 'Zinc nitrate', 'Zn(NO₃)₂', 'Zn', 'NO3', 'white', true, ['ZnNO₃', 'Zn₂NO₃', 'Zn(NO₃)₃']],
  ['mncl2', 'Manganese chloride', 'MnCl₂', 'Mn', 'Cl', 'light-pink', true, ['MnCl', 'MnCl₃', 'Mn₂Cl']],
  ['mnso4', 'Manganese sulphate', 'MnSO₄', 'Mn', 'SO4', 'light-pink', true, ['Mn₂SO₄', 'Mn(SO₄)₂', 'Mn₂(SO₄)₃']],
  ['nicl2', 'Nickel chloride', 'NiCl₂', 'Ni', 'Cl', 'green', true, ['NiCl', 'NiCl₃', 'Ni₂Cl']],
  ['niso4', 'Nickel sulphate', 'NiSO₄', 'Ni', 'SO4', 'green', true, ['Ni₂SO₄', 'Ni(SO₄)₂', 'Ni₂(SO₄)₃']],
  ['cocl2', 'Cobalt chloride', 'CoCl₂', 'Co', 'Cl', 'pink', true, ['CoCl', 'CoCl₃', 'Co₂Cl']],
  ['cono32', 'Cobalt nitrate', 'Co(NO₃)₂', 'Co', 'NO3', 'pink', true, ['CoNO₃', 'Co₂NO₃', 'Co(NO₃)₃']],
  ['bacl2', 'Barium chloride', 'BaCl₂', 'Ba', 'Cl', 'white', true, ['BaCl', 'BaCl₃', 'Ba₂Cl']],
  ['bano32', 'Barium nitrate', 'Ba(NO₃)₂', 'Ba', 'NO3', 'white', true, ['BaNO₃', 'Ba₂NO₃', 'Ba(NO₃)₃']],
  ['srcl2', 'Strontium chloride', 'SrCl₂', 'Sr', 'Cl', 'white', true, ['SrCl', 'SrCl₃', 'Sr₂Cl']],
  ['srno32', 'Strontium nitrate', 'Sr(NO₃)₂', 'Sr', 'NO3', 'white', true, ['SrNO₃', 'Sr₂NO₃', 'Sr(NO₃)₃']],
  ['caco3', 'Calcium carbonate', 'CaCO₃', 'Ca', 'CO3', 'white', false, ['Ca₂CO₃', 'Ca(CO₃)₂', 'Ca₃CO₃']],
  ['cacl2', 'Calcium chloride', 'CaCl₂', 'Ca', 'Cl', 'white', true, ['CaCl', 'CaCl₃', 'Ca₂Cl']],
  ['cano32', 'Calcium nitrate', 'Ca(NO₃)₂', 'Ca', 'NO3', 'white', true, ['CaNO₃', 'Ca₂NO₃', 'Ca(NO₃)₃']],
  ['caac2', 'Calcium acetate', '(CH₃COO)₂Ca', 'Ca', 'CH3COO', 'white', true, ['CH₃COOCa', 'CH₃COOCa₂', '(CH₃COO)₃Ca']],
  ['mgso4', 'Magnesium sulphate', 'MgSO₄', 'Mg', 'SO4', 'white', true, ['Mg₂SO₄', 'Mg(SO₄)₂', 'Mg₂(SO₄)₃']],
  ['mgco3', 'Magnesium carbonate', 'MgCO₃', 'Mg', 'CO3', 'white', false, ['Mg₂CO₃', 'Mg(CO₃)₂', 'Mg₃CO₃']],
  ['mgac2', 'Magnesium acetate', '(CH₃COO)₂Mg', 'Mg', 'CH3COO', 'white', true, ['CH₃COOMg', 'CH₃COOMg₂', '(CH₃COO)₃Mg']],
];

export const SALTS: Salt[] = ROWS.map(([id, name, formula, cation, anion, colour, soluble, distractors]) => ({
  id,
  name,
  formula,
  cation,
  anion,
  colour,
  solubleInWater: soluble,
  syllabus: ['cbse'],
  distractors,
}));

export const saltById = (id: string): Salt => {
  const salt = SALTS.find((s) => s.id === id);
  if (!salt) throw new Error(`Unknown salt ${id}`);
  return salt;
};
