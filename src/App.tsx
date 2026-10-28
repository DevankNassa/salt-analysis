import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { GameBoard, GamePhone, type GameProps } from './components/Game';
import { Home } from './components/Home';
import { Manual } from './components/Manual';
import { ResultModal, StatsModal } from './components/Modals';
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

type Screen = 'home' | 'manual' | 'game';
type ModalKind = 'result' | 'stats' | null;

function randomPracticeSalt(exclude?: string): string {
  const salts = pool('cbse').filter((s) => s.id !== exclude);
  return salts[Math.floor(Math.random() * salts.length)].id;
}

const WIDE = '(min-width: 1024px)';
const subscribeWide = (cb: () => void) => {
  const mq = matchMedia(WIDE);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
/** Desktop gets the three-column board; phones and tablets get the one-column flow. */
const useWide = () => useSyncExternalStore(subscribeWide, () => matchMedia(WIDE).matches);

export function App() {
  const today = dayNumber();
  const wide = useWide();
  const [screen, setScreen] = useState<Screen>('home');
  /** Where the manual goes back to, and where "Open the lab" leads. */
  const [manualNav, setManualNav] = useState<{ back: Screen; done: Screen }>({ back: 'home', done: 'game' });
  const [mode, setMode] = useState<Mode>('daily');
  const [daily, setDaily] = useState<GameState>(() => loadDaily(today) ?? newGame(dailySaltId(today), 'daily'));
  const [practice, setPractice] = useState<GameState>(() => loadPractice() ?? newGame(randomPracticeSalt(), 'practice'));
  const [stats, setStats] = useState(loadStats);
  const [modal, setModal] = useState<ModalKind>(null);

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const dispatch = useCallback((a: Action) => setGame((s) => reduce(s, a)), [setGame]);

  const newPractice = () => {
    setPractice((s) => newGame(randomPracticeSalt(s.saltId), 'practice'));
    prevStatus.current.practice = 'playing';
    setModal(null);
  };

  const openManual = (back: Screen, done: Screen = 'game') => {
    setManualNav({ back, done });
    setScreen('manual');
  };

  /** First visit: the manual comes before the first game. */
  const play = (m: Mode) => {
    setMode(m);
    if (!hasSeenHelp()) return openManual('home');
    setScreen('game');
    if (m === 'daily' && daily.status !== 'playing') setModal('result');
  };

  const closeManual = (to: Screen) => {
    markHelpSeen();
    setScreen(to);
  };

  const props: GameProps = {
    game,
    puzzle: today,
    dispatch,
    onMode: setMode,
    onNewSalt: newPractice,
    onHome: () => setScreen('home'),
    onManual: () => openManual('game'),
    onStats: () => setModal('stats'),
    onShowResult: () => setModal('result'),
  };

  return (
    <div className={`app ${wide ? 'wide' : 'narrow'} screen-${screen}`}>
      {screen === 'home' && (
        <Home
          puzzle={today}
          daily={daily}
          stats={stats}
          onDaily={() => play('daily')}
          onPractice={() => play('practice')}
          onManual={() => openManual('home')}
        />
      )}
      {screen === 'manual' && (
        <Manual
          backLabel={manualNav.back === 'game' ? 'Lab' : 'Home'}
          onBack={() => closeManual(manualNav.back)}
          onDone={() => closeManual(manualNav.done)}
        />
      )}
      {screen === 'game' && (
        <div key={`${mode}-${game.saltId}`} className="game-wrap">
          {wide ? <GameBoard {...props} /> : <GamePhone {...props} />}
        </div>
      )}

      {modal === 'stats' && <StatsModal stats={stats} onClose={() => setModal(null)} />}
      {modal === 'result' && screen === 'game' && game.status !== 'playing' && (
        <ResultModal
          game={game}
          puzzle={mode === 'daily' ? today : null}
          stats={mode === 'daily' ? stats : null}
          onClose={() => setModal(null)}
          onNewSalt={mode === 'practice' ? newPractice : undefined}
        />
      )}
    </div>
  );
}
