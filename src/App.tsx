import { useCallback, useEffect, useRef, useState } from 'react';
import { ActionPanel } from './components/ActionPanel';
import { AnswerSheet } from './components/AnswerSheet';
import { Bench } from './components/Bench';
import { HelpModal, ResultModal, StatsModal } from './components/Modals';
import { dailySaltId, dayNumber, pool } from './engine/daily';
import { newGame, reduce, type Action, type GameState, type Mode } from './engine/game';
import {
  hasSeenHelp,
  loadDaily,
  loadPractice,
  loadStats,
  markHelpSeen,
  recordDaily,
  saveDaily,
  savePractice,
} from './engine/storage';

type ModalKind = 'help' | 'result' | 'stats' | null;

function randomPracticeSalt(exclude?: string): string {
  const salts = pool('cbse').filter((s) => s.id !== exclude);
  return salts[Math.floor(Math.random() * salts.length)].id;
}

export function App() {
  const today = dayNumber();
  const [mode, setMode] = useState<Mode>('daily');
  const [daily, setDaily] = useState<GameState>(() => loadDaily(today) ?? newGame(dailySaltId(today), 'daily'));
  const [practice, setPractice] = useState<GameState>(() => loadPractice() ?? newGame(randomPracticeSalt(), 'practice'));
  const [stats, setStats] = useState(loadStats);
  const [modal, setModal] = useState<ModalKind>(() => (hasSeenHelp() ? null : 'help'));

  const game = mode === 'daily' ? daily : practice;
  const setGame = mode === 'daily' ? setDaily : setPractice;

  useEffect(() => saveDaily(today, daily), [today, daily]);
  useEffect(() => savePractice(practice), [practice]);
  useEffect(() => {
    if (daily.status !== 'playing') setStats(recordDaily(today, daily));
  }, [today, daily]);

  // Open the score card shortly after a game ends (not when reloading a finished one).
  const prevStatus = useRef({ daily: daily.status, practice: practice.status });
  useEffect(() => {
    const prev = prevStatus.current[mode];
    prevStatus.current[mode] = game.status;
    if (prev === 'playing' && game.status !== 'playing') {
      const t = setTimeout(() => setModal('result'), 1400);
      return () => clearTimeout(t);
    }
  }, [mode, game.status]);

  const dispatch = useCallback((a: Action) => setGame((s) => reduce(s, a)), [setGame]);

  const newPractice = () => {
    setPractice((s) => newGame(randomPracticeSalt(s.saltId), 'practice'));
    prevStatus.current.practice = 'playing';
    setModal(null);
  };

  const closeModal = () => {
    if (modal === 'help') markHelpSeen();
    setModal(null);
  };

  return (
    <div className="app">
      <header className="top">
        <div className="title">
          <h1 className="marker">The Barely Passing Manual</h1>
          <span className="byline">by the Anti-Chemist</span>
        </div>
        <nav className="modes">
          <button className={mode === 'daily' ? 'active' : ''} onClick={() => setMode('daily')}>
            Daily salt #{today}
          </button>
          <button className={mode === 'practice' ? 'active' : ''} onClick={() => setMode('practice')}>
            Practice lab
          </button>
        </nav>
        <div className="icons">
          <button onClick={() => setModal('help')} aria-label="How to play">
            ?
          </button>
          <button onClick={() => setModal('stats')} aria-label="Statistics">
            📊
          </button>
        </div>
      </header>

      {mode === 'practice' && (
        <div className="practice-bar">
          <label>
            Syllabus{' '}
            <select defaultValue="cbse">
              <option value="cbse">CBSE only</option>
              <option value="all" disabled>
                All boards (coming soon)
              </option>
            </select>
          </label>
          <span className="muted">Tips are free here.</span>
          <button className="btn small" onClick={newPractice}>
            New salt
          </button>
        </div>
      )}

      <main className="board" key={`${mode}-${game.saltId}`}>
        <div className="left">
          <Bench game={game} onHint={() => dispatch({ type: 'hint' })} />
          <ActionPanel
            game={game}
            dispatch={dispatch}
            onNewSalt={mode === 'practice' ? newPractice : undefined}
            onShowResult={() => setModal('result')}
          />
        </div>
        <AnswerSheet game={game} />
      </main>

      <footer className="foot">
        Placeholder art. Chemistry follows the CBSE Class 12 practical. Found a mistake? Ma’am would like to know.
      </footer>

      {modal === 'help' && <HelpModal onClose={closeModal} />}
      {modal === 'stats' && <StatsModal stats={stats} onClose={closeModal} />}
      {modal === 'result' && game.status !== 'playing' && (
        <ResultModal
          game={game}
          puzzle={mode === 'daily' ? today : null}
          stats={mode === 'daily' ? stats : null}
          onClose={closeModal}
          onNewSalt={mode === 'practice' ? newPractice : undefined}
        />
      )}
    </div>
  );
}
