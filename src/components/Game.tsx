import { useEffect, useRef, useState } from 'react';
import {
  MAX_STRIKES,
  canHint,
  currentRow,
  currentSection,
  hintCostsStrike,
  shelf,
  type Action,
  type Card,
  type GameState,
} from '../engine/game';
import { teacherLine } from '../engine/lines';
import { activeRow, finishedRows, nextStep, progress, sceneFor, whereLabel } from '../engine/view';
import { AntiChemist } from './AntiChemist';
import { LabScene } from './LabScene';
import { Teacher } from './Teacher';
import { FormulaRow, LegendKey, PendingRow, RecentRows, SheetRow, TileSheet } from './Tiles';

export interface GameProps {
  game: GameState;
  puzzle: number;
  dispatch: (a: Action) => void;
  onMode: (m: GameState['mode']) => void;
  onNewSalt: () => void;
  onHome: () => void;
  onManual: () => void;
  onStats: () => void;
  onFeedback: () => void;
  onShowResult: () => void;
}

/* ───── shared pieces ───── */

/** Dark magnifier panel with the looping bench animation for the current (or last) test. */
function Lens({ game, caption = true }: { game: GameState; caption?: boolean }) {
  const [replay, setReplay] = useState(0);
  const row = currentRow(game);
  const scene = sceneFor(game, row);
  return (
    <div className="lens">
      <div className="lens-stage" key={`${game.rows.length}-${replay}`}>
        <LabScene {...scene} />
      </div>
      {caption && <span className="lens-caption">{scene.caption}</span>}
      {row && (
        <button className="replay" onClick={() => setReplay((n) => n + 1)} aria-label="Replay the animation">
          ↻ replay
        </button>
      )}
    </div>
  );
}

function Progress({ game }: { game: GameState }) {
  return (
    <div className="progress" aria-label={whereLabel(game)}>
      {progress(game).map((seg) => (
        <div
          key={seg.key}
          className={`seg ${seg.fill >= 1 ? 'done' : ''}`}
          style={{ flex: seg.weight, ['--fill' as string]: `${Math.round(seg.fill * 100)}%` }}
          title={seg.label}
        />
      ))}
    </div>
  );
}

function StrikeDots({ game }: { game: GameState }) {
  return (
    <div className="strike-dots" aria-label={`${game.strikes} of ${MAX_STRIKES} strikes used`} title="Ma’am’s patience">
      {Array.from({ length: MAX_STRIKES }, (_, i) => (
        <span key={i} className={i < game.strikes ? 'used' : ''} />
      ))}
    </div>
  );
}

function lastNote(game: GameState): string | null {
  if (game.phase === 'observe' || game.phase === 'infer') return null;
  const last = game.rows[game.rows.length - 1];
  return last?.inference ? (last.note ?? null) : null;
}

/** Ma'am's line, keyed so it re-animates on every event. */
function TeacherSays({ game, withNext }: { game: GameState; withNext?: boolean }) {
  const line = teacherLine(game);
  return (
    <div className="teacher-says" key={game.eventCount}>
      <div className={`avatar mood-${line.mood}`}>
        <Teacher mood={line.mood} avatar />
      </div>
      {withNext ? (
        <div className="says">
          <span className="quote">“{line.text}”</span>
          {game.status === 'playing' && <b>Next step: {nextStep(game)}</b>}
        </div>
      ) : (
        <div className="bubble">{line.text}</div>
      )}
    </div>
  );
}

function ACNote({ game, fallback }: { game: GameState; fallback?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const note = game.hint ?? lastNote(game) ?? fallback;
  // A tip can land below the fold on a phone; bring it into view.
  useEffect(() => {
    if (game.hint) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [game.hint]);
  if (!note) return null;
  return (
    <div className={`ac-note ${game.hint ? 'hint' : ''}`} key={note} ref={ref}>
      <div className="avatar">
        <AntiChemist pose="lurking" avatar />
      </div>
      <div className="sticky">
        {note}
        <span className="sig">— A.C.</span>
      </div>
    </div>
  );
}

function ReagentKey({ card, onPick }: { card: Card; onPick: (id: string) => void }) {
  return (
    <button
      className={`key reagent ${card.kind} ${card.crossed ? 'crossed' : ''} ${card.done ? 'done' : ''}`}
      disabled={card.crossed || card.done}
      onClick={() => onPick(card.id)}
    >
      {card.done && '✓ '}
      {card.label}
    </button>
  );
}

function Options({ options, wrong, onPick }: { options: string[]; wrong: string[]; onPick: (t: string) => void }) {
  const big = options.length <= 2;
  return (
    <div className={`opts ${big ? 'big' : ''}`}>
      {options.map((o) => (
        <button key={o} className={`key opt ${wrong.includes(o) ? 'crossed' : ''}`} disabled={wrong.includes(o)} onClick={() => onPick(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

function StepTabs({ game }: { game: GameState }) {
  if (game.phase === 'formula') {
    return (
      <div className="tabs">
        <span className="on">Result: formula</span>
      </div>
    );
  }
  const order = ['reagent', 'observe', 'infer'] as const;
  const at = order.indexOf(game.phase as (typeof order)[number]);
  const names = ['1 Reagent', '2 Observation', '3 Inference'];
  return (
    <div className="tabs">
      {names.map((n, i) => (
        <span key={n} className={i === at ? 'on' : i < at ? 'past' : ''}>
          {n}
          {i < at && ' ✓'}
        </span>
      ))}
    </div>
  );
}

/** The keyboard that changes with the step: reagents, then observations, then inferences. */
function Keyboard({ game, dispatch, onNewSalt, onShowResult, onHome }: Pick<GameProps, 'game' | 'dispatch' | 'onNewSalt' | 'onShowResult' | 'onHome'>) {
  const row = currentRow(game);
  const section = currentSection(game);

  if (game.status !== 'playing') {
    return (
      <div className="keyboard">
        <div className="over-keys">
          <button className="btn primary" onClick={onShowResult}>
            Score & share
          </button>
          {game.mode === 'practice' ? (
            <button className="btn" onClick={onNewSalt}>
              Another salt
            </button>
          ) : (
            <button className="btn" onClick={onHome}>
              Home
            </button>
          )}
        </div>
      </div>
    );
  }

  let keys = null;
  if (game.phase === 'reagent' && section) {
    const { chain, confirm } = shelf(game);
    const pick = (id: string) => dispatch({ type: 'card', id });
    keys = (
      <>
        <div className="keys chain">
          {chain.map((c) => (
            <ReagentKey key={c.id} card={c} onPick={pick} />
          ))}
        </div>
        {confirm.length > 0 && (
          <>
            <span className="keys-label">Confirmatory</span>
            <div className="keys confirm">
              {confirm.map((c) => (
                <ReagentKey key={c.id} card={c} onPick={pick} />
              ))}
            </div>
          </>
        )}
      </>
    );
  } else if ((game.phase === 'observe' || game.phase === 'infer') && row) {
    const observing = game.phase === 'observe';
    keys = (
      <Options
        options={observing ? row.observationOptions : row.inferenceOptions}
        wrong={row.wrong}
        onPick={(text) => dispatch({ type: observing ? 'observation' : 'inference', text })}
      />
    );
  } else if (game.phase === 'formula') {
    keys = <Options options={game.formulaOptions} wrong={game.formulaWrong} onPick={(text) => dispatch({ type: 'formula', text })} />;
  }

  const costs = hintCostsStrike(game);
  return (
    <div className="keyboard">
      <StepTabs game={game} />
      {keys}
      <button className="ask" onClick={() => dispatch({ type: 'hint' })} disabled={!canHint(game) || game.hint !== null}>
        {game.hint ? 'Tip given. Read the note.' : costs ? 'Ask the Anti-Chemist · costs a strike · turns the row 🟨' : 'Ask the Anti-Chemist · free in practice'}
      </button>
    </div>
  );
}

/* ───── desktop board (1b) ───── */

export function GameBoard(props: GameProps) {
  const { game, puzzle, onMode, onNewSalt, onHome, onManual, onStats, onFeedback } = props;
  const row = activeRow(game);
  return (
    <div className="board-page">
      <header className="board-head">
        <div className="head-left">
          <button className={`pill ${game.mode === 'daily' ? 'on' : ''}`} onClick={() => onMode('daily')}>
            Daily #{puzzle}
          </button>
          <button className={`pill ${game.mode === 'practice' ? 'on' : ''}`} onClick={() => onMode('practice')}>
            Practice
          </button>
          {game.mode === 'practice' && (
            <button className="pill ghost" onClick={onNewSalt}>
              New salt ↻
            </button>
          )}
        </div>
        <button className="title-btn" onClick={onHome} aria-label="Home">
          <h1 className="marker">The Barely Passing Manual</h1>
          <span className="byline">by the Anti-Chemist</span>
        </button>
        <div className="head-right">
          <button className="pill square" onClick={onManual} aria-label="How to play">
            ?
          </button>
          <button className="pill" onClick={onFeedback}>
            Feedback
          </button>
          <button className="pill" onClick={onStats}>
            Stats
          </button>
        </div>
      </header>

      <div className="board-grid">
        <aside className="board-left">
          {game.status === 'playing' && (
            <div className="next-note">
              <span className="marker">Next step · row {game.rows.length + (row ? 0 : 1)}</span>
              <b>{nextStep(game).replace(/^./, (c) => c.toUpperCase())}</b>
            </div>
          )}
          <Lens game={game} />
          <TeacherSays game={game} />
        </aside>

        <main className="board-center">
          <div className="status-line">
            <Progress game={game} />
            <span className="where">{whereLabel(game)}</span>
            <StrikeDots game={game} />
          </div>
          <TileSheet game={game} />
          <Keyboard {...props} />
        </main>

        <aside className="board-right">
          <ACNote game={game} fallback="I’ll leave notes here when you get something right. Don’t expect many." />
          <LegendKey />
          {game.mode === 'practice' && <p className="muted small">Practice lab: tips are free here, and nothing counts towards your stats.</p>}
        </aside>
      </div>
    </div>
  );
}

/* ───── phone flow (2b) ───── */

export function GamePhone(props: GameProps) {
  const { game, puzzle, onNewSalt, onHome, onManual, onStats, onFeedback } = props;
  const [showAll, setShowAll] = useState(false);
  const row = activeRow(game);
  const showLens = !!row || game.rows.length === 0;
  const done = finishedRows(game);
  const recent = row ? 1 : 3;

  return (
    <div className="phone-page">
      <header className="phone-head">
        <div className="head-left">
          <button onClick={onHome} aria-label="Home">
            ←
          </button>
          <button onClick={onManual} aria-label="How to play">
            ?
          </button>
          <button onClick={onFeedback} aria-label="Send feedback" title="Send feedback">
            ✉
          </button>
        </div>
        <span className="marker">{game.mode === 'daily' ? `Daily salt #${puzzle}` : 'Practice lab'}</span>
        {game.mode === 'practice' ? (
          <button onClick={onNewSalt}>New ↻</button>
        ) : (
          <button onClick={onStats}>Stats</button>
        )}
      </header>
      <div className="phone-status">
        <Progress game={game} />
        <span>
          {whereLabel(game).split(' · ')[0]} · {game.strikes}/{MAX_STRIKES} strikes
        </span>
      </div>

      <div className="phone-body">
        {done.length > recent && (
          <button className="sheet-toggle" onClick={() => setShowAll((v) => !v)}>
            {showAll ? 'Hide the full sheet ▴' : `See the full sheet (${done.length} rows) ▾`}
          </button>
        )}
        {showAll ? (
          <div className="recent all">
            {done.map((r, i) => (
              <SheetRow key={i} row={r} />
            ))}
          </div>
        ) : (
          <RecentRows game={game} count={recent} />
        )}

        {row && <SheetRow row={row} active />}
        {game.phase === 'reagent' && <PendingRow />}
        {(game.phase === 'formula' || (game.phase === 'over' && game.sectionIndex >= 3)) && <FormulaRow game={game} />}

        {showLens && <Lens game={game} caption={!row} />}
        <TeacherSays game={game} withNext />
        <ACNote game={game} />
      </div>

      <Keyboard {...props} />
    </div>
  );
}
