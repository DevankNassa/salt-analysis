import type { TeacherMood } from '../engine/lines';

// Placeholder chibi sprite (DESIGN.md §3, §7): strict, flustered teacher — oversized lab coat,
// glasses sliding down, bun coming loose with a pencil stuck through it, clipboard.

const INK = '#1f1a17';
const SKIN = '#f2c7a0';
const HAIR = '#2b1d1a';

function Eyes({ mood }: { mood: TeacherMood }) {
  switch (mood) {
    case 'shouting':
      return (
        <g stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none">
          <path d="M68 100 L84 106 L68 112" />
          <path d="M132 100 L116 106 L132 112" />
        </g>
      );
    case 'flustered':
      return (
        <g stroke={INK} strokeWidth={2.5} fill="none">
          <path d="M77 106 m-8 0 a8 8 0 1 0 16 0 a6 6 0 1 0 -12 0 a4 4 0 1 0 8 0" />
          <path d="M123 106 m-8 0 a8 8 0 1 0 16 0 a6 6 0 1 0 -12 0 a4 4 0 1 0 8 0" />
        </g>
      );
    case 'shocked':
      return (
        <g>
          <ellipse cx={77} cy={106} rx={10} ry={11} fill="#fff" stroke={INK} strokeWidth={2.5} />
          <ellipse cx={123} cy={106} rx={10} ry={11} fill="#fff" stroke={INK} strokeWidth={2.5} />
          <circle cx={77} cy={107} r={2.5} fill={INK} />
          <circle cx={123} cy={107} r={2.5} fill={INK} />
        </g>
      );
    case 'grudging':
      return (
        <g>
          <ellipse cx={80} cy={108} rx={6} ry={5} fill={INK} />
          <ellipse cx={126} cy={108} rx={6} ry={5} fill={INK} />
          <path d="M68 103 L90 103" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          <path d="M114 103 L136 103" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        </g>
      );
    case 'facepalm':
      return (
        <g stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none">
          <path d="M115 108 Q123 113 131 108" />
        </g>
      );
    default:
      return (
        <g>
          <ellipse cx={77} cy={107} rx={6.5} ry={7} fill={INK} />
          <ellipse cx={123} cy={107} rx={6.5} ry={7} fill={INK} />
          <circle cx={79} cy={104.5} r={2} fill="#fff" />
          <circle cx={125} cy={104.5} r={2} fill="#fff" />
          <path d="M67 101 L88 99" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          <path d="M112 99 L133 101" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        </g>
      );
  }
}

function Brows({ mood }: { mood: TeacherMood }) {
  const d: Record<TeacherMood, [string, string]> = {
    stern: ['M64 86 L90 93', 'M136 86 L110 93'],
    shouting: ['M62 82 L92 96', 'M138 82 L108 96'],
    flustered: ['M64 92 L88 84', 'M136 92 L112 84'],
    shocked: ['M65 80 Q77 72 89 80', 'M111 80 Q123 72 135 80'],
    grudging: ['M65 90 L89 92', 'M111 86 Q123 80 135 86'],
    facepalm: ['M64 92 L88 86', 'M136 92 L112 86'],
  };
  const [l, r] = d[mood];
  return (
    <g stroke={HAIR} strokeWidth={4.5} strokeLinecap="round" fill="none">
      <path d={l} />
      <path d={r} />
    </g>
  );
}

function Mouth({ mood }: { mood: TeacherMood }) {
  switch (mood) {
    case 'shouting':
      return (
        <g>
          <path d="M82 128 Q100 120 118 128 Q116 152 100 154 Q84 152 82 128 Z" fill="#7a1d24" stroke={INK} strokeWidth={3} />
          <path d="M88 145 Q100 138 112 145 Q106 152 100 152 Q94 152 88 145 Z" fill="#e0606e" />
          <path d="M86 128 L114 128" stroke="#fff" strokeWidth={3} />
        </g>
      );
    case 'flustered':
      return (
        <path
          d="M84 134 q4 -5 8 0 q4 5 8 0 q4 -5 8 0 q4 5 8 0"
          stroke={INK}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'shocked':
      return <ellipse cx={100} cy={136} rx={7} ry={9} fill="#7a1d24" stroke={INK} strokeWidth={3} />;
    case 'grudging':
      return <path d="M90 136 Q100 132 112 134" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />;
    case 'facepalm':
      return <path d="M88 140 Q100 130 112 140" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />;
    default:
      return <path d="M89 137 Q100 132 111 137" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />;
  }
}

function Glasses({ mood }: { mood: TeacherMood }) {
  // Shocked: glasses pop off and fly above the head.
  const transform = mood === 'shocked' ? 'translate(0 -78) rotate(-12 100 106)' : 'translate(0 5) rotate(-4 100 106)';
  return (
    <g transform={transform} className={mood === 'shocked' ? 'teacher-glasses-pop' : undefined}>
      <circle cx={77} cy={106} r={16} fill="rgba(200,230,255,0.25)" stroke="#6b3b22" strokeWidth={3.5} />
      <circle cx={123} cy={106} r={16} fill="rgba(200,230,255,0.25)" stroke="#6b3b22" strokeWidth={3.5} />
      <path d="M93 104 Q100 99 107 104" stroke="#6b3b22" strokeWidth={3.5} fill="none" />
      <path d="M70 99 L76 95" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M116 99 L122 95" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
    </g>
  );
}

export function Teacher({ mood, className }: { mood: TeacherMood; className?: string }) {
  const sweaty = mood === 'flustered' || mood === 'shocked' || mood === 'facepalm';
  const blush = mood === 'flustered' || mood === 'shouting' || mood === 'grudging';
  return (
    <svg viewBox="0 0 200 250" className={className} role="img" aria-label={`Ma'am looks ${mood}`}>
      <g className={`teacher teacher-${mood}`}>
        {/* coat + kurta */}
        <path d="M30 250 Q34 186 72 172 L128 172 Q166 186 170 250 Z" fill="#fdfdfb" stroke={INK} strokeWidth={3.5} />
        <path d="M84 172 L100 204 L116 172 Z" fill="#8c2d3e" stroke={INK} strokeWidth={3} />
        <path d="M72 172 L100 222 M128 172 L100 222" stroke={INK} strokeWidth={3} fill="none" />
        <rect x={136} y={206} width={16} height={4} fill="#3a6fd9" transform="rotate(-8 144 208)" />

        {/* clipboard + hands */}
        {mood !== 'facepalm' && (
          <g transform="rotate(-6 100 222)">
            <rect x={70} y={200} width={60} height={50} rx={4} fill="#b07a45" stroke={INK} strokeWidth={3} />
            <rect x={76} y={208} width={48} height={42} fill="#fffdf4" stroke={INK} strokeWidth={2} />
            <rect x={90} y={196} width={20} height={9} rx={2} fill="#9a9a9a" stroke={INK} strokeWidth={2} />
            <path d="M81 218 H118 M81 226 H114 M81 234 H118" stroke="#9fb3c8" strokeWidth={2} />
            <path d="M82 224 l4 4 l8 -9" stroke="#c0392b" strokeWidth={2.5} fill="none" />
            <ellipse cx={70} cy={228} rx={10} ry={9} fill={SKIN} stroke={INK} strokeWidth={3} />
            <ellipse cx={130} cy={228} rx={10} ry={9} fill={SKIN} stroke={INK} strokeWidth={3} />
          </g>
        )}

        {/* back hair */}
        <path d="M36 110 Q30 40 100 36 Q170 40 164 110 Q166 150 150 160 L50 160 Q34 150 36 110 Z" fill={HAIR} stroke={INK} strokeWidth={3} />

        {/* bun with pencil */}
        <g className="teacher-bun">
          <path d="M126 6 L76 44" stroke="#e8b32a" strokeWidth={7} strokeLinecap="round" />
          <path d="M126 6 L131 2" stroke="#f3a3b0" strokeWidth={7} strokeLinecap="round" />
          <circle cx={100} cy={30} r={22} fill={HAIR} stroke={INK} strokeWidth={3} />
          <path d="M86 24 Q100 14 114 26" stroke="#4a332d" strokeWidth={2.5} fill="none" />
        </g>

        {/* head */}
        <ellipse cx={34} cy={112} rx={9} ry={12} fill={SKIN} stroke={INK} strokeWidth={3} />
        <ellipse cx={166} cy={112} rx={9} ry={12} fill={SKIN} stroke={INK} strokeWidth={3} />
        <path d="M38 104 Q38 52 100 52 Q162 52 162 104 Q162 162 100 166 Q38 162 38 104 Z" fill={SKIN} stroke={INK} strokeWidth={3.5} />

        {/* fringe, parted in the middle */}
        <path d="M38 104 Q34 52 100 46 Q100 70 70 82 Q52 90 40 108 Z" fill={HAIR} stroke={INK} strokeWidth={3} />
        <path d="M162 104 Q166 52 100 46 Q100 70 130 82 Q148 90 160 108 Z" fill={HAIR} stroke={INK} strokeWidth={3} />

        {/* loose strands */}
        <g stroke={HAIR} strokeWidth={3} fill="none" strokeLinecap="round" className="teacher-strands">
          <path d="M64 56 Q54 46 60 36" />
          <path d="M138 56 Q150 48 146 38" />
          <path d="M42 120 Q32 138 40 152" />
        </g>

        {blush && (
          <g fill="#f08a8a" opacity={mood === 'shouting' ? 0.75 : 0.5}>
            <ellipse cx={62} cy={126} rx={11} ry={6} />
            <ellipse cx={138} cy={126} rx={11} ry={6} />
          </g>
        )}

        <Brows mood={mood} />
        <Eyes mood={mood} />
        <Mouth mood={mood} />
        <Glasses mood={mood} />

        {mood === 'shouting' && (
          <g stroke="#d0312d" strokeWidth={4} strokeLinecap="round" className="teacher-vein">
            <path d="M140 66 q6 6 0 12 M146 60 q-6 6 0 12 M152 66 q-6 6 0 12" fill="none" />
          </g>
        )}
        {mood === 'shouting' && (
          <g fill="#e7e7e7" stroke={INK} strokeWidth={2} className="teacher-steam">
            <circle cx={22} cy={70} r={9} />
            <circle cx={12} cy={56} r={6} />
            <circle cx={178} cy={70} r={9} />
            <circle cx={188} cy={56} r={6} />
          </g>
        )}

        {sweaty && (
          <g fill="#8fd0ff" stroke={INK} strokeWidth={2} className="teacher-sweat">
            <path d="M158 80 q8 12 0 18 q-8 -6 0 -18 Z" />
            {mood !== 'facepalm' && <path d="M44 76 q6 9 0 14 q-6 -5 0 -14 Z" />}
          </g>
        )}

        {mood === 'facepalm' && (
          <g>
            <path d="M40 250 Q44 200 70 160" stroke={INK} strokeWidth={3.5} fill="#fdfdfb" />
            <path d="M58 92 Q80 82 100 100 Q104 122 86 130 Q62 132 56 116 Z" fill={SKIN} stroke={INK} strokeWidth={3} />
            <path d="M66 96 L70 120 M78 92 L82 122 M90 96 L92 122" stroke={INK} strokeWidth={2} />
          </g>
        )}
      </g>
    </svg>
  );
}
