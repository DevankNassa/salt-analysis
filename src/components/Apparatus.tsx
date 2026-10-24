import type { CSSProperties } from 'react';
import type { Visual } from '../chem/types';

const INK = '#1f1a17';
const GLASS = 'rgba(215, 235, 248, 0.35)';

const SMELL_LABEL: Record<NonNullable<Visual['smell']>, string> = {
  'rotten eggs': 'rotten eggs',
  vinegar: 'vinegar',
  'burning sulphur': 'burning sulphur',
  'pungent, choking': 'sharp & choking',
  ammonia: 'ammonia (like a cleaning bottle)',
};

const delay = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

function WatchGlass({ v }: { v: Visual }) {
  const solid = v.solid ?? '#fbfbf8';
  return (
    <g>
      <path d="M30 170 Q120 228 210 170" fill={GLASS} stroke={INK} strokeWidth={3} />
      <path d="M30 170 Q120 186 210 170" fill="none" stroke={INK} strokeWidth={2} opacity={0.4} />
      <path d="M80 182 Q92 146 120 144 Q148 146 160 182 Q120 194 80 182 Z" fill={solid} stroke={INK} strokeWidth={2.5} className="pop-in" />
      <g fill="#fff" opacity={0.6}>
        <rect x={104} y={156} width={5} height={5} transform="rotate(45 106 158)" />
        <rect x={128} y={164} width={4} height={4} transform="rotate(45 130 166)" />
        <rect x={114} y={172} width={3} height={3} transform="rotate(45 115 173)" />
      </g>
      <path d="M150 230 L162 206" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={120} cy={236} rx={60} ry={6} fill="#000" opacity={0.08} />
    </g>
  );
}

function Burner({ v }: { v: Visual }) {
  return (
    <g>
      <rect x={70} y={228} width={100} height={16} rx={5} fill="#7d7d84" stroke={INK} strokeWidth={3} />
      <rect x={108} y={150} width={24} height={80} fill="#a9a9b2" stroke={INK} strokeWidth={3} />
      <rect x={104} y={196} width={32} height={10} fill="#7d7d84" stroke={INK} strokeWidth={2.5} />
      <g className="flame">
        <path d="M120 40 Q150 92 140 128 Q134 150 120 152 Q106 150 100 128 Q90 92 120 40 Z" fill={v.flame} opacity={0.85} stroke={INK} strokeWidth={2} />
        <path d="M120 96 Q132 124 128 138 Q124 148 120 148 Q116 148 112 138 Q108 124 120 96 Z" fill="#6ea8ff" opacity={0.8} />
      </g>
      <path d="M220 40 L132 104" stroke="#9aa0a6" strokeWidth={3} />
      <circle cx={128} cy={107} r={5} fill="none" stroke="#9aa0a6" strokeWidth={3} />
      <rect x={210} y={30} width={26} height={14} rx={3} fill="#3b3b3b" transform="rotate(-36 223 37)" />
    </g>
  );
}

function Tube({ v }: { v: Visual }) {
  const sol = v.solution ?? '#e6f0f7';
  const bubbleCount = v.bubbles === 'brisk' ? 14 : v.bubbles === 'gentle' ? 6 : 0;
  return (
    <g>
      <defs>
        <clipPath id="tube-inside">
          <path d="M97 50 L97 210 A23 23 0 0 0 143 210 L143 50 Z" />
        </clipPath>
      </defs>

      {/* dropper */}
      <g className="dropper">
        <rect x={113} y={-2} width={14} height={26} rx={5} fill="#d13b3b" stroke={INK} strokeWidth={2.5} />
        <path d="M115 24 L118 44 L122 44 L125 24 Z" fill={GLASS} stroke={INK} strokeWidth={2} />
      </g>
      <circle cx={120} cy={50} r={4} fill={sol} stroke={INK} strokeWidth={1.5} className="drop" />

      <g clipPath="url(#tube-inside)">
        <rect x={90} y={130} width={60} height={120} fill={sol} opacity={0.85} className="liquid" />
        <path d="M97 130 Q120 135 143 130" stroke="#fff" strokeWidth={2} fill="none" opacity={0.6} />

        {v.layer && !v.layerTop && <rect x={90} y={200} width={60} height={50} fill={v.layer} opacity={0.9} className="fade-in" style={delay(0.8)} />}
        {v.layer && v.layerTop && <rect x={90} y={130} width={60} height={24} fill={v.layer} opacity={0.9} className="fade-in" style={delay(0.8)} />}
        {v.ring && <rect x={90} y={172} width={60} height={9} fill={v.ring} className="fade-in" style={delay(1)} />}

        {v.undissolved && (
          <g fill={v.undissolved} stroke={INK} strokeWidth={1} className="dissolve">
            {[104, 112, 120, 128, 136, 116, 124].map((x, i) => (
              <circle key={i} cx={x} cy={i > 4 ? 222 : 228} r={4} />
            ))}
          </g>
        )}

        {v.ppt && (v.pptStyle ?? 'normal') === 'normal' && (
          <g className="settle" style={delay(0.6)}>
            <path d="M90 202 Q105 196 120 202 Q135 208 150 200 L150 250 L90 250 Z" fill={v.ppt} stroke={INK} strokeWidth={1.5} />
            {[102, 114, 126, 138].map((x, i) => (
              <circle key={i} cx={x} cy={190 - (i % 2) * 10} r={2.5} fill={v.ppt} />
            ))}
          </g>
        )}
        {v.ppt && v.pptStyle === 'gelatinous' && (
          <g fill={v.ppt} stroke={INK} strokeWidth={1.5} className="settle wobble" style={delay(0.6)}>
            <path d="M92 190 Q104 176 116 188 Q126 172 140 186 Q152 196 148 250 L92 250 Z" />
            <ellipse cx={110} cy={172} rx={7} ry={5} />
            <ellipse cx={132} cy={166} rx={6} ry={4} />
          </g>
        )}
        {v.ppt && v.pptStyle === 'crystalline' && (
          <g fill={v.ppt} stroke={INK} strokeWidth={1} className="settle" style={delay(0.6)}>
            {Array.from({ length: 16 }, (_, i) => {
              const x = 100 + ((i * 37) % 40);
              const y = 206 + ((i * 13) % 26);
              return <rect key={i} x={x} y={y} width={5} height={5} transform={`rotate(45 ${x + 2} ${y + 2})`} />;
            })}
          </g>
        )}
        {v.ppt && v.pptStyle === 'floating' && (
          <g fill={v.ppt} stroke={INK} strokeWidth={1.2} className="fade-in" style={delay(0.8)}>
            <ellipse cx={108} cy={140} rx={9} ry={5} />
            <ellipse cx={126} cy={146} rx={10} ry={5} />
            <ellipse cx={136} cy={137} rx={6} ry={4} />
            <ellipse cx={116} cy={152} rx={6} ry={3} />
          </g>
        )}

        {v.prop === 'cu-turnings' && (
          <g stroke="#b8733d" strokeWidth={3} fill="none" className="fade-in" style={delay(0.3)}>
            <path d="M104 230 q4 -8 8 0 q4 8 8 0" />
            <path d="M120 236 q4 -8 8 0 q4 8 8 0" />
          </g>
        )}

        {Array.from({ length: bubbleCount }, (_, i) => (
          <circle
            key={i}
            cx={103 + ((i * 11) % 34)}
            cy={236}
            r={v.bubbles === 'brisk' ? 3 + (i % 3) : 2.5}
            fill="none"
            stroke="#fff"
            strokeWidth={1.5}
            className="gas-bubble"
            style={{ animationDelay: `${0.5 + (i * 0.23) % 1.6}s`, animationDuration: v.bubbles === 'brisk' ? '0.9s' : '1.8s' }}
          />
        ))}
      </g>

      {/* glass */}
      <path d="M97 50 L97 210 A23 23 0 0 0 143 210 L143 50" fill={GLASS} stroke={INK} strokeWidth={3.5} />
      <path d="M92 50 L148 50" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
      <path d="M104 64 L104 200" stroke="#fff" strokeWidth={3} opacity={0.7} strokeLinecap="round" />

      {v.fumes && (
        <g fill={v.fumes} opacity={0.85}>
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={112 + (i % 2) * 16} cy={40} r={9 + i * 2} className="fume" style={delay(0.7 + i * 0.4)} />
          ))}
        </g>
      )}

      {v.mouthFlame && (
        <path
          d="M120 6 Q134 28 128 42 Q124 50 120 50 Q116 50 112 42 Q106 28 120 6 Z"
          fill={v.mouthFlame}
          opacity={0.85}
          stroke={INK}
          strokeWidth={1.5}
          className="flame fade-in"
          style={delay(0.9)}
        />
      )}

      {v.paper && (
        <g className="fade-in" style={delay(0.2)}>
          <rect x={150} y={8} width={18} height={44} rx={2} fill={v.paper.from} stroke={INK} strokeWidth={2} transform="rotate(-18 159 30)">
            <animate attributeName="fill" from={v.paper.from} to={v.paper.to} begin="1.2s" dur="1s" fill="freeze" />
          </rect>
          <text x={172} y={66} className="app-label">
            {v.paper.label}
          </text>
        </g>
      )}

      {v.rod && (
        <g className="fade-in" style={delay(0.2)}>
          <path d="M228 6 L150 46" stroke="#b5d5e8" strokeWidth={6} strokeLinecap="round" />
          <path d="M228 6 L150 46" stroke={INK} strokeWidth={1} fill="none" />
          <g fill={v.rod.fumes} stroke="#bbb" strokeWidth={1}>
            <circle cx={150} cy={36} r={9} className="fume" style={delay(1.1)} />
            <circle cx={160} cy={30} r={7} className="fume" style={delay(1.4)} />
          </g>
          <text x={176} y={36} className="app-label">
            {v.rod.label}
          </text>
        </g>
      )}

      {v.smell && (
        <g className="fade-in" style={delay(0.9)}>
          <path d="M146 40 q8 -6 0 -12 q-8 -6 0 -12" stroke="#7a8a5a" strokeWidth={2.5} fill="none" />
          <path d="M156 46 q8 -6 0 -12 q-8 -6 0 -12" stroke="#7a8a5a" strokeWidth={2.5} fill="none" />
        </g>
      )}

      <ellipse cx={120} cy={250} rx={34} ry={5} fill="#000" opacity={0.08} />
    </g>
  );
}

export function Apparatus({ visual, caption }: { visual: Visual; caption?: string }) {
  return (
    <figure className="apparatus">
      <svg viewBox="0 0 240 256" role="img" aria-label={caption ?? 'Lab apparatus'}>
        {visual.apparatus === 'tube' && <Tube v={visual} />}
        {visual.apparatus === 'flame' && <Burner v={visual} />}
        {visual.apparatus === 'watch-glass' && <WatchGlass v={visual} />}
      </svg>
      {visual.smell && <div className="sniff fade-in">👃 smells like {SMELL_LABEL[visual.smell]}</div>}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
