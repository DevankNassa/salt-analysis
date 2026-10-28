import type { ReactNode } from 'react';
import { SECTIONS } from '../chem/procedure';
import { saltById } from '../chem/salts';
import type { GameState, Row } from '../engine/game';
import {
  activeRow,
  cellTone,
  finishedRows,
  formulaTone,
  reagentStrikes,
  rowCard,
  wrongInferences,
  wrongObservations,
  type Tone,
} from '../engine/view';

// The answer sheet as a tile grid (redesign 1b): one row per test, three tiles per row
// (experiment, observation, inference) that flip and colour as they're filled in.

export function Tile({ tone, cut, children, className = '' }: { tone?: Tone; cut?: string[]; children?: ReactNode; className?: string }) {
  return (
    <div className={`tile ${tone ? `tone-${tone} flip` : ''} ${className}`}>
      {cut && cut.length > 0 && (
        <span className="tile-cut">
          {cut.map((c) => (
            <s key={c}>{c}</s>
          ))}
        </span>
      )}
      <span>{children}</span>
    </div>
  );
}

const Blank = () => <div className="tile blank" />;
const Asking = () => <div className="tile asking">?</div>;

function ExpTile({ row, active }: { row: Row; active?: boolean }) {
  const missed = reagentStrikes(row);
  return (
    <div className={`tile exp ${active ? 'active' : ''}`} title={row.experiment}>
      <span>
        {row.confirm && <b className="ct">C.T.</b>} {rowCard(row)}
      </span>
      {missed > 0 && <span className="missed" aria-label={`${missed} wrong reagents first`}>✗{missed}</span>}
    </div>
  );
}

/** A finished or in-progress test. Only the active row asks a question; an abandoned one (thrown out) stays blank. */
export function SheetRow({ row, active }: { row: Row; active?: boolean }) {
  return (
    <div className="tile-row">
      <ExpTile row={row} active={active} />
      {row.observation ? (
        <Tile key={row.observation} tone={cellTone(row, 'obs')} cut={wrongObservations(row)}>
          {row.observation}
        </Tile>
      ) : active ? (
        <Asking />
      ) : (
        <Blank />
      )}
      {row.inference ? (
        <Tile key={row.inference} tone={cellTone(row, 'inf')} cut={wrongInferences(row)} className="inf">
          {row.inference}
        </Tile>
      ) : row.observation && active ? (
        <Asking />
      ) : (
        <Blank />
      )}
    </div>
  );
}

/** Waiting for a reagent: the experiment tile is the question. */
export function PendingRow() {
  return (
    <div className="tile-row">
      <div className="tile exp active ask-exp">?</div>
      <Blank />
      <Blank />
    </div>
  );
}

export function FormulaRow({ game }: { game: GameState }) {
  const salt = saltById(game.saltId);
  const done = game.phase === 'over';
  return (
    <div className="tile-row formula-row">
      <div className={`tile exp ${done ? '' : 'active'}`}>Result: formula of the salt</div>
      {game.status === 'won' ? (
        <Tile key="won" tone={formulaTone(game)} cut={game.formulaWrong}>
          {salt.formula}
        </Tile>
      ) : done ? (
        <Tile key="lost" tone="r" cut={game.formulaWrong}>
          {salt.formula}
        </Tile>
      ) : (
        <div className="tile asking">{game.formulaWrong.length ? <s>{game.formulaWrong.join(', ')}</s> : '?'}</div>
      )}
    </div>
  );
}

/** The full sheet, grouped by section, for the desktop board. */
export function TileSheet({ game }: { game: GameState }) {
  const active = activeRow(game);
  const showPending = game.phase === 'reagent';
  const reachedResult = game.phase === 'formula' || (game.phase === 'over' && game.sectionIndex >= SECTIONS.length);
  const currentSec = SECTIONS[game.sectionIndex]?.id;
  return (
    <div className="tile-sheet">
      <div className="tile-head">
        <span>Experiment</span>
        <span>Observation</span>
        <span>Inference</span>
      </div>
      {SECTIONS.map((sec) => {
        const rows = game.rows.filter((r) => r.section === sec.id);
        const pendingHere = showPending && currentSec === sec.id;
        if (rows.length === 0 && !pendingHere) return null;
        return (
          <div key={sec.id} className="tile-section">
            <div className="marker sec-title">{sec.title}</div>
            {rows.map((r, i) => (
              <SheetRow key={`${sec.id}-${i}`} row={r} active={r === active} />
            ))}
            {pendingHere && <PendingRow />}
          </div>
        );
      })}
      {/* What comes after detection, before anything is detected. */}
      {!game.candidates && game.status === 'playing' && SECTIONS[game.sectionIndex]?.mode === 'detect' && (
        <div className="tile-row ghost">
          <div className="tile blank label">Confirm</div>
          <Blank />
          <Blank />
        </div>
      )}
      {reachedResult ? (
        <FormulaRow game={game} />
      ) : (
        game.status === 'playing' && (
          <div className="tile-row formula-row ghost">
            <div className="tile blank label">Result: formula of the salt</div>
          </div>
        )
      )}
    </div>
  );
}

/** The phone shows only the last few finished rows, faded, above the row being worked on. */
export function RecentRows({ game, count }: { game: GameState; count: number }) {
  const rows = finishedRows(game);
  const shown = rows.slice(Math.max(0, rows.length - count));
  if (shown.length === 0) return null;
  return (
    <div className="recent">
      {shown.map((r, i) => (
        <SheetRow key={rows.length - shown.length + i} row={r} />
      ))}
    </div>
  );
}

/** "S A L T ?" in tiles, for the home screen. */
export function LogoTiles() {
  const tiles: [string, Tone][] = [
    ['S', 'w'],
    ['A', 'g'],
    ['L', 'y'],
    ['T', 'r'],
    ['?', 'g'],
  ];
  return (
    <div className="logo-tiles" aria-hidden>
      {tiles.map(([ch, tone], i) => (
        <div key={i} className={`logo-tile tone-${tone}`} style={{ animationDelay: `${0.1 + i * 0.12}s` }}>
          {ch}
        </div>
      ))}
    </div>
  );
}

const LEGEND: { tone: Tone; txt: string; e: [string, string, string] }[] = [
  { tone: 'w', txt: '⬜ nothing there', e: ['O.S. + dil. HCl', 'No ppt', 'Group I absent'] },
  { tone: 'g', txt: '🟩 found / confirmed', e: ['Brown ring test', 'Dark brown ring', 'NO₃⁻ confirmed'] },
  { tone: 'y', txt: '🟨 used a tip', e: ['Flame test', 'No characteristic colour', 'Ca²⁺, Sr²⁺, Ba²⁺ absent'] },
  { tone: 'r', txt: '🟥 strike', e: ['NaOH + heat', 'Smell of ammonia', '…'] },
];

/** Example rows explaining the tile colours (manual page 2). */
export function LegendExamples() {
  return (
    <div className="legend-examples">
      {LEGEND.map((l) => (
        <div key={l.tone} className="legend-ex">
          <div className="tile-row small">
            <div className="tile exp">{l.e[0]}</div>
            {l.tone === 'r' ? (
              <>
                <div className="tile tone-r">
                  <s>{l.e[1]}</s>
                </div>
                <Blank />
              </>
            ) : (
              <>
                <div className={`tile tone-${l.tone}`}>{l.e[1]}</div>
                <div className={`tile tone-${l.tone}`}>{l.e[2]}</div>
              </>
            )}
          </div>
          <span>{l.txt}</span>
        </div>
      ))}
    </div>
  );
}

export function LegendKey() {
  return (
    <div className="legend-key">
      <b>Tile colours</b>
      {(
        [
          ['w', 'nothing there'],
          ['g', 'found / confirmed'],
          ['y', 'used a tip'],
          ['r', 'strike'],
        ] as [Tone, string][]
      ).map(([t, label]) => (
        <div key={t}>
          <span className={`swatch tone-${t}`} />
          {label}
        </div>
      ))}
    </div>
  );
}
