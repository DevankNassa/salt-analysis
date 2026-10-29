import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { saltById } from '../chem/salts';
import { MAX_STRIKES, grid, type GameState } from '../engine/game';
import { feedbackEnabled, gameContext, sendFeedback, type FeedbackKind } from '../engine/feedback';
import { msUntilTomorrow } from '../engine/daily';
import { teacherLine } from '../engine/lines';
import { scoreLabel, share, shareText } from '../engine/share';
import type { Stats } from '../engine/storage';
import { SQUARE_TONE } from '../engine/view';
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
        <div className="modal-head">
          <h2 className="marker">{title}</h2>
          <button className="close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Countdown() {
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

export function StatRow({ stats }: { stats: Stats }) {
  const winPct = stats.played ? Math.round((stats.won / stats.played) * 100) : 0;
  const items: [number, string][] = [
    [stats.played, 'Played'],
    [winPct, 'Win %'],
    [stats.streak, 'Streak'],
    [stats.maxStreak, 'Best'],
  ];
  return (
    <div className="stat-row">
      {items.map(([v, l]) => (
        <div key={l}>
          <b>{v}</b>
          <span>{l}</span>
        </div>
      ))}
    </div>
  );
}

/** Strikes-per-solve bars. `mine` highlights today's result. */
function Distribution({ stats, mine }: { stats: Stats; mine?: number }) {
  const max = Math.max(1, ...stats.dist);
  return (
    <div className="dist">
      {stats.dist.map((v, i) => (
        <div key={i} className="dist-row">
          <span>{i === MAX_STRIKES ? 'X' : i}</span>
          <div className={`bar ${i === mine ? 'me' : ''}`} style={{ width: `${Math.max(8, (v / max) * 100)}%` }}>
            {v}
          </div>
        </div>
      ))}
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
  const line = teacherLine(game);
  const url = `${location.origin}${location.pathname}`;
  const mine = won ? Math.min(game.strikes, MAX_STRIKES - 1) : MAX_STRIKES;

  const doShare = async () => {
    const r = await share(shareText(game, puzzle, url));
    setShared(r === 'copied' ? 'Copied to clipboard!' : r === 'shared' ? 'Shared!' : 'Could not share');
  };

  return (
    <Modal title={won ? 'Salt identified!' : 'Thrown out of the lab!'} onClose={onClose}>
      <div className="share-card">
        <span className="pitch">Want to test your salt analysis?</span>
        <div className="share-title">
          <b>{puzzle ? `The Anti-Chemist #${puzzle}` : 'The Anti-Chemist (practice)'}</b>
          <span className="marker score">{scoreLabel(game)}</span>
        </div>
        <div className="share-grid">
          {grid(game).map((l) => (
            <div key={l.label}>
              <span className="lbl">{l.label}</span>
              {l.squares.map((sq, i) => (
                <span key={i} className={`mini tone-${SQUARE_TONE[sq]}`} style={{ animationDelay: `${0.15 + i * 0.08}s` }} />
              ))}
            </div>
          ))}
        </div>
        <span className="pitch">
          {stats && stats.streak > 0 ? `${stats.streak}-day streak · ` : ''}no spoilers in the card
        </span>
      </div>
      <button className="btn round red" onClick={doShare}>
        Share result
      </button>
      {shared && <p className="muted center">{shared}</p>}
      <div className="verdict">
        <div className="avatar">
          <Teacher mood={line.mood} avatar />
        </div>
        <span>
          “{line.text}” It was {salt.name}, <b>{salt.formula}</b>.
        </span>
      </div>
      {stats && (
        <>
          <StatRow stats={stats} />
          <Distribution stats={stats} mine={mine} />
        </>
      )}
      {puzzle && <Countdown />}
      {onNewSalt && (
        <button className="btn round" onClick={onNewSalt}>
          Try another salt
        </button>
      )}
    </Modal>
  );
}

export function StatsModal({ stats, onClose }: { stats: Stats; onClose: () => void }) {
  return (
    <Modal title="Your record" onClose={onClose}>
      <StatRow stats={stats} />
      <Distribution stats={stats} />
      <Countdown />
    </Modal>
  );
}

export function FeedbackModal({ game, puzzle, onClose }: { game: GameState | null; puzzle: number | null; onClose: () => void }) {
  const [kind, setKind] = useState<FeedbackKind>('mistake');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [botcheck, setBotcheck] = useState('');
  const [attach, setAttach] = useState(!!game);
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setState('sending');
    try {
      await sendFeedback({ kind, message: message.trim(), name: name.trim(), email: email.trim(), botcheck }, attach && game ? gameContext(game, puzzle) : null);
      setState('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send.');
      setState('error');
    }
  };

  if (state === 'sent') {
    return (
      <Modal title="Noted!" onClose={onClose}>
        <div className="verdict">
          <div className="avatar">
            <Teacher mood="grudging" avatar />
          </div>
          <span>“Hmph. Acceptable. I’ll look into it.” Thanks for helping fix the manual.</span>
        </div>
        <button className="btn round dark" onClick={onClose}>
          Back
        </button>
      </Modal>
    );
  }

  return (
    <Modal title="Feedback" onClose={onClose}>
      <form className="feedback" onSubmit={submit}>
        <div className="feedback-kind" role="radiogroup" aria-label="Type of feedback">
          <button type="button" role="radio" aria-checked={kind === 'mistake'} className={`pill ${kind === 'mistake' ? 'on' : ''}`} onClick={() => setKind('mistake')}>
            Something’s wrong
          </button>
          <button type="button" role="radio" aria-checked={kind === 'suggestion'} className={`pill ${kind === 'suggestion' ? 'on' : ''}`} onClick={() => setKind('suggestion')}>
            Suggest a change
          </button>
        </div>
        <label>
          {kind === 'mistake' ? 'What’s wrong? (wrong colour, ppt, inference, a bug…)' : 'What would you change or add?'}
          <textarea
            required
            rows={5}
            maxLength={4000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={kind === 'mistake' ? 'e.g. With dil. HCl, Pb²⁺ should give a white ppt, but the game says…' : 'e.g. Add a timer mode, more salts, a dark theme…'}
          />
        </label>
        {game && (
          <label className="feedback-check">
            <input type="checkbox" checked={attach} onChange={(e) => setAttach(e.target.checked)} />
            Attach where I am in the current game (helps find the mistake)
          </label>
        )}
        <div className="feedback-row">
          <label>
            <span>
              Name <span className="muted">(optional)</span>
            </span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" />
          </label>
          <label>
            <span>
              Email <span className="muted">(optional, for a reply)</span>
            </span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} autoComplete="email" />
          </label>
        </div>
        <input className="honeypot" tabIndex={-1} autoComplete="off" aria-hidden value={botcheck} onChange={(e) => setBotcheck(e.target.value)} />
        {!feedbackEnabled && <p className="muted small">Feedback isn’t switched on in this build yet.</p>}
        {state === 'error' && <p className="feedback-error small">{error}</p>}
        <button className="btn round red" type="submit" disabled={!feedbackEnabled || state === 'sending' || !message.trim()}>
          {state === 'sending' ? 'Sending…' : 'Send feedback'}
        </button>
      </form>
    </Modal>
  );
}
