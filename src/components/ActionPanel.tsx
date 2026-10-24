import { sym } from '../chem/ions';
import { saltById } from '../chem/salts';
import { currentRow, currentSection, shelf, type Action, type Card, type GameState } from '../engine/game';

function CardButton({ card, onPick }: { card: Card; onPick: (id: string) => void }) {
  const disabled = card.crossed || card.done;
  return (
    <button
      className={`reagent ${card.crossed ? 'crossed' : ''} ${card.done ? 'done' : ''}`}
      disabled={disabled}
      onClick={() => onPick(card.id)}
    >
      <span className="bottle" aria-hidden />
      <span>{card.label}</span>
      {card.done && <span className="tick">✓</span>}
    </button>
  );
}

function Options({
  options,
  wrong,
  onPick,
}: {
  options: string[];
  wrong: string[];
  onPick: (text: string) => void;
}) {
  return (
    <div className="options">
      {options.map((o) => (
        <button key={o} className={`option ${wrong.includes(o) ? 'crossed' : ''}`} disabled={wrong.includes(o)} onClick={() => onPick(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

export function ActionPanel({
  game,
  dispatch,
  onNewSalt,
  onShowResult,
}: {
  game: GameState;
  dispatch: (a: Action) => void;
  onNewSalt?: () => void;
  onShowResult: () => void;
}) {
  const section = currentSection(game);
  const row = currentRow(game);
  const salt = saltById(game.saltId);

  if (game.phase === 'reagent' && section) {
    const { chain, confirm } = shelf(game);
    const pick = (id: string) => dispatch({ type: 'card', id });
    return (
      <section className="panel">
        <h3 className="prompt">
          <span className="marker">{section.title}</span>
          {game.candidates ? (
            <span>
              Confirm it: <b>{game.candidates.map(sym).join(' or ')}</b>
            </span>
          ) : (
            <span>Which test comes next?</span>
          )}
        </h3>
        <div className="shelf-label">{section.mode === 'survey' ? 'Preliminary tests' : 'Group / detection reagents'}</div>
        <div className="shelf">
          {chain.map((c) => (
            <CardButton key={c.id} card={c} onPick={pick} />
          ))}
        </div>
        {confirm.length > 0 && (
          <>
            <div className="shelf-label">Confirmatory reagents</div>
            <div className="shelf">
              {confirm.map((c) => (
                <CardButton key={c.id} card={c} onPick={pick} />
              ))}
            </div>
          </>
        )}
      </section>
    );
  }

  if ((game.phase === 'observe' || game.phase === 'infer') && row) {
    const observing = game.phase === 'observe';
    return (
      <section className="panel">
        <h3 className="prompt">
          <span className="marker">{observing ? 'Observation' : 'Inference'}</span>
          <span>{observing ? 'What do you observe?' : `“${row.observation}”. So what do you infer?`}</span>
        </h3>
        <p className="exp-line">{row.experiment}</p>
        <Options
          options={observing ? row.observationOptions : row.inferenceOptions}
          wrong={row.wrong}
          onPick={(text) => dispatch({ type: observing ? 'observation' : 'inference', text })}
        />
      </section>
    );
  }

  if (game.phase === 'formula') {
    return (
      <section className="panel">
        <h3 className="prompt">
          <span className="marker">Result</span>
          <span>
            Anion {game.found.anion && sym(game.found.anion)}, cation {game.found.cation && sym(game.found.cation)}. Write the
            formula of the salt:
          </span>
        </h3>
        <Options options={game.formulaOptions} wrong={game.formulaWrong} onPick={(text) => dispatch({ type: 'formula', text })} />
      </section>
    );
  }

  return (
    <section className="panel over">
      <h3 className="prompt">
        <span className="marker">{game.status === 'won' ? 'Salt identified' : 'Thrown out of the lab'}</span>
        <span>
          {game.status === 'won' ? 'It was' : 'The salt was'}{' '}
          <b>{salt.name}</b>, {salt.formula}.
        </span>
      </h3>
      <div className="row-buttons">
        <button className="btn" onClick={onShowResult}>
          Score & share
        </button>
        {onNewSalt && (
          <button className="btn primary" onClick={onNewSalt}>
            Another salt
          </button>
        )}
      </div>
    </section>
  );
}
