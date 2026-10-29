import type { GameState } from '../engine/game';
import type { Stats } from '../engine/storage';
import { Countdown, StatRow } from './Modals';
import { LogoTiles } from './Tiles';

export function Home({
  puzzle,
  daily,
  stats,
  onDaily,
  onPractice,
  onManual,
  onFeedback,
}: {
  puzzle: number;
  daily: GameState;
  stats: Stats;
  onDaily: () => void;
  onPractice: () => void;
  onManual: () => void;
  onFeedback: () => void;
}) {
  const started = daily.rows.length > 0;
  const dailyLabel =
    daily.status !== 'playing' ? `See today’s result #${puzzle}` : started ? `Continue daily salt #${puzzle}` : `Play daily salt #${puzzle}`;
  return (
    <div className="home">
      <LogoTiles />
      <div className="home-title">
        <h1 className="marker">The Barely Passing Manual</h1>
        <span className="byline">by the Anti-Chemist</span>
      </div>
      <p className="home-pitch">Want to test your salt analysis?</p>
      <div className="home-buttons">
        <button className="btn round dark" onClick={onDaily}>
          {dailyLabel}
        </button>
        <button className="btn round" onClick={onPractice}>
          Practice lab
        </button>
        <button className="btn round manual-btn" onClick={onManual}>
          <span className="book-icon" aria-hidden />
          How to play: open the manual
        </button>
      </div>
      <StatRow stats={stats} />
      <Countdown />
      <button className="link feedback-link" onClick={onFeedback}>
        Found a mistake or want a change? Send feedback
      </button>
    </div>
  );
}
