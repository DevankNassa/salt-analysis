import { useEffect, useRef } from 'react';
import { sym } from '../chem/ions';
import { SECTIONS } from '../chem/procedure';
import { saltById } from '../chem/salts';
import { rowSquare, type GameState, type Row } from '../engine/game';

function Cell({ value, wrong, pending }: { value?: string; wrong: string[]; pending: boolean }) {
  return (
    <td>
      {wrong.map((w) => (
        <s key={w} className="cut">
          {w}
        </s>
      ))}
      {value ? <span className="ink">{value}</span> : pending ? <span className="blank">…</span> : null}
    </td>
  );
}

function SheetRow({ row, index }: { row: Row; index: number }) {
  const wrongObs = row.wrong.filter((w) => row.observationOptions.includes(w));
  const wrongInf = row.wrong.filter((w) => row.inferenceOptions.includes(w));
  const square = row.inference ? rowSquare(row) : null;
  return (
    <tr className={row.confirm ? 'confirm-row' : undefined}>
      <td className="num">
        {index}
        {square && <span className="sq">{square}</span>}
      </td>
      <td className="exp">
        {row.confirm && <span className="tag">C.T.</span>}
        {row.experiment}
      </td>
      <Cell value={row.observation} wrong={wrongObs} pending={!row.observation} />
      <Cell value={row.inference} wrong={wrongInf} pending={!!row.observation && !row.inference} />
    </tr>
  );
}

export function AnswerSheet({ game }: { game: GameState }) {
  const ref = useRef<HTMLDivElement>(null);
  const salt = saltById(game.saltId);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [game.rows.length, game.phase]);

  let n = 0;
  const showResult = game.phase === 'formula' || game.phase === 'over';
  return (
    <div className="sheet" ref={ref}>
      <h2 className="marker">Answer sheet</h2>
      <p className="sheet-meta">
        Experiment: Systematic analysis of the given salt for one anion and one cation
      </p>
      <table>
        <thead>
          <tr>
            <th className="num">#</th>
            <th>Experiment</th>
            <th>Observation</th>
            <th>Inference</th>
          </tr>
        </thead>
        {SECTIONS.map((sec) => {
          const rows = game.rows.filter((r) => r.section === sec.id);
          if (rows.length === 0) return null;
          return (
            <tbody key={sec.id}>
              <tr className="section-row">
                <td colSpan={4}>{sec.title}</td>
              </tr>
              {rows.map((r) => {
                n += 1;
                return <SheetRow key={n} row={r} index={n} />;
              })}
            </tbody>
          );
        })}
      </table>
      {game.rows.length === 0 && <p className="sheet-empty">Nothing written yet. Ma’am is watching.</p>}

      {showResult && (
        <div className="result-box">
          <span className="marker">Result</span>
          <div>
            Acid radical: <b>{game.found.anion ? sym(game.found.anion) : '?'}</b> · Basic radical:{' '}
            <b>{game.found.cation ? sym(game.found.cation) : '?'}</b>
          </div>
          <div>
            The given salt is{' '}
            {game.formulaWrong.map((w) => (
              <s key={w} className="cut">
                {w}
              </s>
            ))}{' '}
            {game.status === 'won' ? <b className="ink">{salt.formula}</b> : <span className="blank">…</span>}
          </div>
        </div>
      )}
    </div>
  );
}
