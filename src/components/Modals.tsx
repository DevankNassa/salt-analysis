import { useEffect, useState, type ReactNode } from 'react';
import { saltById } from '../chem/salts';
import { MAX_STRIKES, grid, type GameState } from '../engine/game';
import { msUntilTomorrow } from '../engine/daily';
import { scoreLabel, share, shareText } from '../engine/share';
import type { Stats } from '../engine/storage';
import { Teacher } from './Teacher';

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal aria-label={title} onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 className="marker">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Page 1 of the Manual" onClose={onClose}>
      <div className="manual-page">
        <p className="scrawl">Property of the Anti-Chemist. If found, keep it. You need it more than I do.</p>
        <ol>
          <li>
            You get an <b>unknown salt</b>. Find its <b>anion</b> and <b>cation</b>, then write its <b>formula</b>.
          </li>
          <li>
            Pick the tests <b>in the right order</b>. Preliminary → anion → cation, group by group. Skip a step and Ma’am
            will notice.
          </li>
          <li>
            After every test, write what you <b>observe</b> and what you <b>infer</b>. Just like the real answer sheet.
          </li>
          <li>
            Got a result? <b>Confirm it</b> with the right confirmatory test before moving on.
          </li>
          <li>
            Every mistake is a <b>strike</b>. Six strikes and you’re thrown out of the lab.
          </li>
          <li>
            Stuck? Ask me. Free in practice. In the daily salt it costs a strike.
          </li>
        </ol>
        <div className="legend">
          <span>⬜ nothing there</span>
          <span>🟩 found / confirmed</span>
          <span>🟨 used a tip</span>
          <span>🟥 strike</span>
        </div>
        <p className="scrawl">A new salt every day, the same for everyone. Want to test your salt analysis?</p>
      </div>
      <button className="btn primary wide" onClick={onClose}>
        Open the lab
      </button>
    </Modal>
  );
}

function Countdown() {
  const [ms, setMs] = useState(msUntilTomorrow);
  useEffect(() => {
    const t = setInterval(() => setMs(msUntilTomorrow()), 1000);
    return () => clearInterval(t);
  }, []);
  const total = Math.floor(ms / 1000);
  const hh = String(Math.floor(total / 3600)).padStart(2, '0');
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return (
    <div className="countdown">
      Next salt in <b>{`${hh}:${mm}:${ss}`}</b>
    </div>
  );
}

export function StatsBlock({ stats }: { stats: Stats }) {
  const max = Math.max(1, ...stats.dist);
  const winPct = stats.played ? Math.round((stats.won / stats.played) * 100) : 0;
  return (
    <div className="stats">
      <div className="stat-row">
        <div>
          <b>{stats.played}</b>
          <span>Played</span>
        </div>
        <div>
          <b>{winPct}</b>
          <span>Win %</span>
        </div>
        <div>
          <b>{stats.streak}</b>
          <span>Streak</span>
        </div>
        <div>
          <b>{stats.maxStreak}</b>
          <span>Best</span>
        </div>
      </div>
      <div className="dist">
        {stats.dist.map((v, i) => (
          <div key={i} className="dist-row">
            <span>{i === MAX_STRIKES ? 'X' : i}</span>
            <div className="bar" style={{ width: `${Math.max(8, (v / max) * 100)}%` }}>
              {v}
            </div>
          </div>
        ))}
      </div>
      <p className="dist-note">Strikes used per solved salt</p>
    </div>
  );
}

export function ResultModal({
  game,
  puzzle,
  stats,
  onClose,
  onNewSalt,
}: {
  game: GameState;
  puzzle: number | null;
  stats: Stats | null;
  onClose: () => void;
  onNewSalt?: () => void;
}) {
  const [shared, setShared] = useState<string | null>(null);
  const salt = saltById(game.saltId);
  const won = game.status === 'won';
  const mood = !won ? 'shouting' : game.strikes === 0 ? 'grudging' : game.strikes <= 3 ? 'stern' : 'facepalm';
  const url = `${location.origin}${location.pathname}`;

  const doShare = async () => {
    const r = await share(shareText(game, puzzle, url));
    setShared(r === 'copied' ? 'Copied to clipboard!' : r === 'shared' ? 'Shared!' : 'Could not share');
  };

  return (
    <Modal title={won ? 'Salt identified!' : 'Thrown out of the lab!'} onClose={onClose}>
      <div className="result-head">
        <Teacher mood={mood} className="result-teacher" />
        <div>
          <div className="big-score">{scoreLabel(game)}</div>
          <div>
            {salt.name} <b>{salt.formula}</b>
          </div>
          {puzzle && <div className="muted">The Anti-Chemist #{puzzle}</div>}
        </div>
      </div>
      <div className="grid">
        {grid(game).map((l) => (
          <div key={l.label}>
            <span className="grid-label">{l.label}</span> {l.squares.join('')}
          </div>
        ))}
      </div>
      <button className="btn primary wide" onClick={doShare}>
        Share result
      </button>
      {shared && <p className="muted center">{shared}</p>}
      {stats && <StatsBlock stats={stats} />}
      {puzzle && <Countdown />}
      {onNewSalt && (
        <button className="btn wide" onClick={onNewSalt}>
          Try another salt
        </button>
      )}
    </Modal>
  );
}

export function StatsModal({ stats, onClose }: { stats: Stats; onClose: () => void }) {
  return (
    <Modal title="Your record" onClose={onClose}>
      <StatsBlock stats={stats} />
      <Countdown />
    </Modal>
  );
}
