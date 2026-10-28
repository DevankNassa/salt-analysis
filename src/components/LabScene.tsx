import { useId, type CSSProperties, type ReactNode } from 'react';
import type { Visual } from '../chem/types';

// Looping bench animations for the dark lens panel (redesign 2a). Each test type has its own scene:
// flame test, reagent into a tube, heating a tube, and the salt on a watch glass.
// Ink-outlined, stippled ppt so white results read on the dark ground.

const INK = '#1f1a17';
const LINE = '#e9eef5';
const GLASS = 'rgba(215, 235, 248, 0.35)';
const CLEAR = '#e6f0f7';
const TUBE_INSIDE = 'M97 50 L97 210 A23 23 0 0 0 143 210 L143 50 Z';
const TUBE_GLASS = 'M97 50 L97 210 A23 23 0 0 0 143 210 L143 50';
const FLAME = 'M120 40 Q150 92 140 128 Q134 150 120 152 Q106 150 100 128 Q90 92 120 40 Z';
const FLAME_CORE = 'M120 96 Q132 124 128 138 Q124 148 120 148 Q116 148 112 138 Q108 124 120 96 Z';

const delay = (s: number, extra?: CSSProperties & Record<string, string>): CSSProperties => ({ animationDelay: `${s}s`, ...extra });

function Stipple({ id, fill }: { id: string; fill: string }) {
  return (
    <pattern id={id} width={7} height={7} patternUnits="userSpaceOnUse">
      <rect width={7} height={7} fill={fill} />
      <circle cx={2} cy={2} r={1.3} fill="#6b6560" />
      <circle cx={5.5} cy={5} r={1.1} fill="#6b6560" />
    </pattern>
  );
}

function BurnerG({ transform, tint }: { transform?: string; tint?: string }) {
  return (
    <g transform={transform}>
      <rect x={70} y={228} width={100} height={16} rx={5} fill="#7d7d84" stroke={LINE} strokeWidth={2.5} />
      <rect x={108} y={150} width={24} height={80} fill="#a9a9b2" stroke={LINE} strokeWidth={2.5} />
      <rect x={104} y={196} width={32} height={10} fill="#7d7d84" stroke={LINE} strokeWidth={2} />
      <g className="lab-flick">
        <path d={FLAME} fill="#6ea8ff" opacity={0.55} />
        {tint && <path d={FLAME} fill={tint} className="lab-tint" />}
        <path d={FLAME_CORE} fill="#9ec5ff" opacity={0.9} />
      </g>
    </g>
  );
}

/** Flame test: platinum wire with salt paste swings into the flame; the flame takes the salt's colour. */
function FlameScene({ tint }: { tint?: string }) {
  return (
    <svg viewBox="40 10 230 250" className="lab-svg" role="img" aria-label="Flame test">
      <BurnerG tint={tint} />
      <g className="lab-wire">
        <path d="M128 98 L262 26" stroke="#c9ced6" strokeWidth={2.5} strokeLinecap="round" />
        <rect x={236} y={22} width={40} height={12} rx={4} fill="#b07a45" stroke={LINE} strokeWidth={2} transform="rotate(-28 256 28)" />
        <circle cx={128} cy={98} r={5} fill="#fbfbf8" stroke={LINE} strokeWidth={1.5} />
      </g>
      {tint && (
        <g fill={tint}>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={124 + i * 5} cy={90} r={2.2} className="lab-spark" style={delay(i * 0.15, { '--dx': `${(i - 1) * 10}px` })} />
          ))}
        </g>
      )}
    </svg>
  );
}

/** The unknown salt on a watch glass, before any test. */
function WatchGlassScene({ solid }: { solid: string }) {
  return (
    <svg viewBox="20 110 200 140" className="lab-svg" role="img" aria-label="The salt on a watch glass">
      <path d="M30 170 Q120 228 210 170" fill={GLASS} stroke={LINE} strokeWidth={3} />
      <path d="M30 170 Q120 186 210 170" fill="none" stroke={LINE} strokeWidth={2} opacity={0.4} />
      <path d="M80 182 Q92 146 120 144 Q148 146 160 182 Q120 194 80 182 Z" fill={solid} stroke={INK} strokeWidth={2.5} className="lab-pop" />
      <g fill="#fff" opacity={0.7}>
        <rect x={104} y={156} width={5} height={5} transform="rotate(45 106 158)" />
        <rect x={128} y={164} width={4} height={4} transform="rotate(45 130 166)" />
        <rect x={114} y={172} width={3} height={3} transform="rotate(45 115 173)" />
      </g>
      <path d="M150 230 L162 206" stroke={LINE} strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

function Ppt({ v, fill }: { v: Visual; fill: string }) {
  const style = v.pptStyle ?? 'normal';
  if (style === 'gelatinous') {
    return (
      <g fill={fill} stroke={INK} strokeWidth={2.5} className="lab-settle">
        <path d="M92 190 Q104 176 116 188 Q126 172 140 186 Q152 196 148 250 L92 250 Z" />
        <ellipse cx={110} cy={172} rx={7} ry={5} />
        <ellipse cx={132} cy={166} rx={6} ry={4} />
      </g>
    );
  }
  if (style === 'crystalline') {
    return (
      <g fill={v.ppt} stroke={INK} strokeWidth={1.2} className="lab-settle">
        {Array.from({ length: 16 }, (_, i) => {
          const x = 100 + ((i * 37) % 40);
          const y = 206 + ((i * 13) % 26);
          return <rect key={i} x={x} y={y} width={6} height={6} transform={`rotate(45 ${x + 3} ${y + 3})`} />;
        })}
      </g>
    );
  }
  if (style === 'floating') {
    return (
      <g fill={fill} stroke={INK} strokeWidth={1.5} className="lab-show">
        <ellipse cx={108} cy={140} rx={9} ry={5} />
        <ellipse cx={126} cy={146} rx={10} ry={5} />
        <ellipse cx={136} cy={137} rx={6} ry={4} />
        <ellipse cx={116} cy={152} rx={6} ry={3} />
      </g>
    );
  }
  return (
    <g className="lab-settle">
      <path d="M90 202 Q105 196 120 202 Q135 208 150 200 L150 250 L90 250 Z" fill={fill} stroke={INK} strokeWidth={2.5} />
      {[102, 114, 126, 138].map((x, i) => (
        <circle key={i} cx={x} cy={186 - (i % 2) * 12} r={3} fill={v.ppt} stroke={INK} strokeWidth={1.2} />
      ))}
      <path d="M100 150 q8 -6 16 0 t16 0 M104 166 q8 -5 14 0 t14 0" stroke="#8f887b" strokeWidth={1.5} fill="none" />
    </g>
  );
}

function Bubbles({ kind, slow }: { kind: 'gentle' | 'brisk'; slow?: boolean }) {
  const n = kind === 'brisk' ? 14 : 6;
  return (
    <g className="lab-show">
      {Array.from({ length: n }, (_, i) => (
        <circle
          key={i}
          cx={103 + ((i * 11) % 34)}
          cy={236}
          r={kind === 'brisk' ? 3 + (i % 3) : 2.5}
          fill="none"
          stroke="#fff"
          strokeWidth={1.6}
          className="lab-bub"
          style={delay((i * 0.13) % 1, { animationDuration: `${(kind === 'brisk' ? 0.8 : 1.5) + (i % 4) * 0.15 + (slow ? 0.4 : 0)}s` })}
        />
      ))}
    </g>
  );
}

function Fumes({ fill, x, y, spread = 8 }: { fill: string; x: number; y: number; spread?: number }) {
  return (
    <g fill={fill}>
      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={i}
          cx={x + (i % 3) * spread}
          cy={y}
          r={9 + i}
          className="lab-fume"
          style={delay(i * 0.45, { '--dx': `${i % 2 ? 14 : -10}px` })}
        />
      ))}
    </g>
  );
}

function Smell({ x, y }: { x: number; y: number }) {
  return (
    <g stroke="#a9c48a" strokeWidth={2.5} fill="none" className="lab-show" transform={`translate(${x} ${y})`}>
      <path d="M0 0 q8 -6 0 -12 q-8 -6 0 -12" />
      <path d="M10 6 q8 -6 0 -12 q-8 -6 0 -12" />
    </g>
  );
}

function Rod({ v, x, y }: { v: NonNullable<Visual['rod']>; x: number; y: number }) {
  return (
    <g className="lab-show">
      <path d={`M${x + 78} ${y - 40} L${x} ${y}`} stroke="#b5d5e8" strokeWidth={6} strokeLinecap="round" />
      <g fill={v.fumes} stroke="#bbb" strokeWidth={1}>
        <circle cx={x} cy={y - 10} r={9} className="lab-fume" style={delay(0.2)} />
        <circle cx={x + 10} cy={y - 16} r={7} className="lab-fume" style={delay(0.9)} />
      </g>
      <text x={x + 26} y={y - 10} className="lab-label">
        {v.label}
      </text>
    </g>
  );
}

function MouthFlame({ fill, transform }: { fill: string; transform: string }) {
  return (
    <g transform={transform}>
      <path d="M0 -44 Q14 -22 8 -8 Q4 0 0 0 Q-4 0 -8 -8 Q-14 -22 0 -44 Z" fill={fill} opacity={0.9} stroke={LINE} strokeWidth={1.5} className="lab-show" />
    </g>
  );
}

function TubeGlass({ children }: { children?: ReactNode }) {
  return (
    <>
      <path d={TUBE_GLASS} fill={GLASS} stroke={LINE} strokeWidth={3.5} />
      <path d="M92 50 L148 50" stroke={LINE} strokeWidth={3.5} strokeLinecap="round" />
      <path d="M104 64 L104 200" stroke="#fff" strokeWidth={3} opacity={0.6} strokeLinecap="round" />
      {children}
    </>
  );
}

/** Reagent into a tube: the dropper comes down, three drops fall, then the result appears. */
function ReagentScene({ v, base }: { v: Visual; base: string }) {
  const id = useId().replace(/:/g, '');
  const sol = v.solution ?? base;
  const pptFill = v.ppt ? `url(#${id}st)` : undefined;
  return (
    <svg viewBox="30 -60 180 310" className="lab-svg" role="img" aria-label="Adding a reagent">
      <defs>
        <clipPath id={`${id}in`}>
          <path d={TUBE_INSIDE} />
        </clipPath>
        {v.ppt && <Stipple id={`${id}st`} fill={v.ppt} />}
      </defs>
      <g className="lab-dropper">
        <rect x={113} y={-2} width={14} height={26} rx={5} fill="#d13b3b" stroke={LINE} strokeWidth={2} />
        <path d="M115 24 L118 44 L122 44 L125 24 Z" fill={GLASS} stroke={LINE} strokeWidth={1.8} />
      </g>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={120} cy={48} r={3.5} fill={CLEAR} stroke={LINE} strokeWidth={1} className="lab-drip" style={delay(i * 0.35)} />
      ))}
      <g clipPath={`url(#${id}in)`}>
        <rect x={90} y={130} width={60} height={120} fill={base} opacity={0.9} />
        {sol !== base && <rect x={90} y={130} width={60} height={120} fill={sol} className="lab-show" />}
        {v.undissolved && (
          <g fill={v.undissolved} stroke={INK} strokeWidth={1} className="lab-dissolve">
            {[104, 112, 120, 128, 136, 116, 124].map((x, i) => (
              <circle key={i} cx={x} cy={i > 4 ? 222 : 228} r={4} />
            ))}
          </g>
        )}
        {v.prop === 'cu-turnings' && (
          <g stroke="#d08a4f" strokeWidth={3} fill="none">
            <path d="M104 230 q4 -8 8 0 q4 8 8 0" />
            <path d="M120 236 q4 -8 8 0 q4 8 8 0" />
          </g>
        )}
        {v.layer && !v.layerTop && <rect x={90} y={200} width={60} height={50} fill={v.layer} stroke={INK} strokeWidth={1.5} className="lab-show" />}
        {v.layer && v.layerTop && <rect x={90} y={130} width={60} height={24} fill={v.layer} stroke={INK} strokeWidth={1.5} className="lab-show" />}
        {v.ring && <rect x={90} y={172} width={60} height={10} fill={v.ring} stroke={LINE} strokeWidth={1} className="lab-show" />}
        {v.ppt && pptFill && <Ppt v={v} fill={pptFill} />}
        {v.bubbles && <Bubbles kind={v.bubbles} />}
      </g>
      <TubeGlass />
      {v.fumes && (
        <g className="lab-show">
          <Fumes fill={v.fumes} x={112} y={40} />
        </g>
      )}
      {v.mouthFlame && <MouthFlame fill={v.mouthFlame} transform="translate(120 46)" />}
      {v.paper && (
        <g transform="rotate(-18 159 30)">
          <rect x={150} y={8} width={18} height={44} rx={2} fill={v.paper.from} stroke={LINE} strokeWidth={2} />
          {v.paper.to !== v.paper.from && <rect x={150} y={8} width={18} height={44} rx={2} fill={v.paper.to} stroke={LINE} strokeWidth={2} className="lab-show" />}
        </g>
      )}
      {v.paper && (
        <text x={150} y={-14} className="lab-label">
          {v.paper.label}
        </text>
      )}
      {v.rod && <Rod v={v.rod} x={150} y={46} />}
      {v.smell && <Smell x={152} y={40} />}
    </svg>
  );
}

/** Heating: tube in a holder, tilted over the flame; whatever comes off curls out of the mouth. */
function HeatScene({ v, base }: { v: Visual; base: string }) {
  const id = useId().replace(/:/g, '');
  // Mouth of the tilted tube, worked out from the group transform below.
  const mouth = { x: 262, y: 62 };
  return (
    <svg viewBox="-10 -20 330 360" className="lab-svg" role="img" aria-label="Heating a test tube">
      <defs>
        <clipPath id={`${id}in`}>
          <path d={TUBE_INSIDE} />
        </clipPath>
      </defs>
      <BurnerG transform="translate(88 176) scale(.6)" />
      <g transform="translate(40 -20) rotate(35 120 233)">
        <g className="lab-shake">
          <g clipPath={`url(#${id}in)`}>
            <rect x={90} y={150} width={60} height={100} fill={v.solution ?? base} opacity={0.9} />
            {v.prop === 'cu-turnings' && (
              <g stroke="#d08a4f" strokeWidth={3} fill="none">
                <path d="M104 222 q4 -8 8 0 q4 8 8 0" />
                <path d="M120 228 q4 -8 8 0 q4 8 8 0" />
              </g>
            )}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <circle
                key={i}
                cx={106 + ((i * 9) % 28)}
                cy={226}
                r={2.5}
                fill="none"
                stroke="#fff"
                strokeWidth={1.4}
                className="lab-bub"
                style={delay(i * 0.17, { animationDuration: '1.3s' })}
              />
            ))}
          </g>
          <TubeGlass>
            <rect x={90} y={96} width={60} height={12} rx={3} fill="#b07a45" stroke={LINE} strokeWidth={2} />
          </TubeGlass>
        </g>
      </g>
      <path d="M232 108 L36 46" stroke="#b07a45" strokeWidth={9} strokeLinecap="round" />
      {v.fumes && <Fumes fill={v.fumes} x={mouth.x - 4} y={mouth.y + 2} />}
      {v.mouthFlame && <MouthFlame fill={v.mouthFlame} transform={`translate(${mouth.x} ${mouth.y})`} />}
      {v.rod && <Rod v={v.rod} x={mouth.x - 20} y={mouth.y - 30} />}
      {v.smell && <Smell x={mouth.x + 18} y={mouth.y + 4} />}
    </svg>
  );
}

const SMELL_LABEL: Record<NonNullable<Visual['smell']>, string> = {
  'rotten eggs': 'rotten eggs',
  vinegar: 'vinegar',
  'burning sulphur': 'burning sulphur',
  'pungent, choking': 'sharp & choking',
  ammonia: 'ammonia (like a cleaning bottle)',
};

export type SceneKind = 'flame' | 'reagent' | 'heat' | 'salt';

export interface SceneProps {
  kind: SceneKind;
  visual: Visual;
  /** Liquid colour before the reagent goes in. */
  base?: string;
  /** Flame colour; undefined when the flame shows nothing. */
  tint?: string;
}

export function LabScene({ kind, visual, base = CLEAR, tint }: SceneProps) {
  return (
    <>
      {kind === 'flame' && <FlameScene tint={tint} />}
      {kind === 'salt' && <WatchGlassScene solid={visual.solid ?? '#fbfbf8'} />}
      {kind === 'reagent' && <ReagentScene v={visual} base={base} />}
      {kind === 'heat' && <HeatScene v={visual} base={base} />}
      {visual.smell && <span className="lab-smell">👃 smells like {SMELL_LABEL[visual.smell]}</span>}
    </>
  );
}
