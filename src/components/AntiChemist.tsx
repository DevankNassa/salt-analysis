// Placeholder chibi silhouette (DESIGN.md §3): never fully seen — hood, glint of glasses, inky pen.

export type AntiChemistPose = 'lurking' | 'writing' | 'pointing';

const NAVY = '#1c2340';
const SHADOW = '#0c0f1e';

export function AntiChemist({ pose, className, avatar }: { pose: AntiChemistPose; className?: string; avatar?: boolean }) {
  return (
    <svg viewBox={avatar ? '16 10 128 132' : '0 0 160 190'} className={className} role="img" aria-label="The Anti-Chemist">
      <g className={`ac ac-${pose}`}>
        {/* body */}
        <path d="M18 190 Q22 132 80 124 Q138 132 142 190 Z" fill={NAVY} stroke="#000" strokeWidth={3} />
        <path d="M80 128 L80 190" stroke="#2b3561" strokeWidth={3} />
        {/* hood */}
        <path d="M24 92 Q22 20 80 16 Q138 20 136 92 Q134 132 80 136 Q26 132 24 92 Z" fill={NAVY} stroke="#000" strokeWidth={3} />
        <path d="M40 94 Q40 44 80 40 Q120 44 120 94 Q118 124 80 126 Q42 124 40 94 Z" fill={SHADOW} />
        {/* glasses glint */}
        <g className="ac-glint">
          <rect x={50} y={80} width={24} height={14} rx={5} fill="none" stroke="#5b6aa8" strokeWidth={2.5} />
          <rect x={86} y={80} width={24} height={14} rx={5} fill="none" stroke="#5b6aa8" strokeWidth={2.5} />
          <path d="M74 86 H86" stroke="#5b6aa8" strokeWidth={2.5} />
          <path d="M55 90 L62 83" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
          <path d="M91 90 L98 83" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
        </g>
        {/* a hint of a smirk */}
        <path d="M70 110 Q82 116 92 108" stroke="#5b6aa8" strokeWidth={2.5} fill="none" strokeLinecap="round" />

        {!avatar && pose === 'writing' && (
          <g className="ac-hand">
            <ellipse cx={118} cy={160} rx={12} ry={10} fill="#d9b08c" stroke="#000" strokeWidth={2.5} />
            <path d="M120 156 L146 128" stroke="#222" strokeWidth={5} strokeLinecap="round" />
            <path d="M146 128 L150 124" stroke="#c0392b" strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
        {!avatar && pose === 'pointing' && (
          <g className="ac-hand">
            <path d="M110 150 Q130 140 150 120" stroke={NAVY} strokeWidth={14} strokeLinecap="round" fill="none" />
            <ellipse cx={150} cy={118} rx={8} ry={7} fill="#d9b08c" stroke="#000" strokeWidth={2.5} />
            <path d="M154 113 L160 104" stroke="#d9b08c" strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
      </g>
    </svg>
  );
}
