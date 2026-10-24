import { saltById } from '../chem/salts';
import { saltTint } from '../chem/procedure';
import { MAX_STRIKES, canHint, currentRow, hintCostsStrike, type GameState } from '../engine/game';
import { teacherLine } from '../engine/lines';
import { AntiChemist, type AntiChemistPose } from './AntiChemist';
import { Apparatus } from './Apparatus';
import { Teacher } from './Teacher';

function StrikeMeter({ strikes, lost }: { strikes: number; lost: boolean }) {
  return (
    <div className="strikes" aria-label={`${strikes} of ${MAX_STRIKES} strikes used`}>
      <span className="strikes-label">Ma’am’s patience</span>
      {Array.from({ length: MAX_STRIKES }, (_, i) => (
        <span key={i} className={`strike ${i < strikes ? 'used' : ''} ${lost ? 'lost' : ''}`}>
          {i < strikes ? '✗' : ''}
        </span>
      ))}
    </div>
  );
}

/** The margin note for the row just finished; it disappears once the next test starts. */
function lastNote(game: GameState): string | null {
  if (game.phase === 'observe' || game.phase === 'infer') return null;
  const last = game.rows[game.rows.length - 1];
  return last?.inference ? (last.note ?? null) : null;
}

export function Bench({ game, onHint }: { game: GameState; onHint: () => void }) {
  const line = teacherLine(game);
  const row = currentRow(game);
  const salt = saltById(game.saltId);
  const visual = row?.visual ?? { apparatus: 'watch-glass' as const, solid: saltTint(salt).solid };
  const note = game.hint ?? lastNote(game);
  const pose: AntiChemistPose = game.hint ? 'pointing' : note ? 'writing' : 'lurking';
  const costs = hintCostsStrike(game);
  const playing = game.status === 'playing';

  return (
    <section className="bench">
      <StrikeMeter strikes={game.strikes} lost={game.status === 'lost'} />
      <div className="bench-stage">
        <div className="teacher-wrap">
          <div className="bubble" key={game.eventCount}>
            {line.text}
          </div>
          <Teacher mood={line.mood} className={`teacher-sprite mood-${line.mood}`} />
        </div>

        <div className="apparatus-wrap" key={`${game.rows.length}-${visual.apparatus}`}>
          <Apparatus visual={visual} caption={row ? undefined : 'The unknown salt'} />
        </div>

        <div className="ac-wrap">
          {note && (
            <div className={`sticky ${game.hint ? 'hint' : ''}`} key={note}>
              {note}
              <span className="sig">— A.C.</span>
            </div>
          )}
          <AntiChemist pose={pose} className="ac-sprite" />
          {playing && (
            <button className="ask" onClick={onHint} disabled={!canHint(game) || game.hint !== null}>
              {game.hint ? 'Tip given' : costs ? 'Ask the Anti-Chemist (costs a strike)' : 'Ask the Anti-Chemist'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
