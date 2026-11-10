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
        <div className="chart-callout">
          <a className="btn round" href="./salt-chart.html" target="_blank" rel="noopener">
            Study the salt chart
          </a>
          <span className="pencil-note">
            <svg className="pencil-arrow" viewBox="0 0 64 46" aria-hidden>
              <defs>
                <filter id="graphite">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
                  <feDisplacementMap in="SourceGraphic" scale="1.6" />
                </filter>
              </defs>
              <g filter="url(#graphite)">
                <path d="M60 40 C 44 42, 20 36, 13 7" />
                <path d="M4 15 L 13 5 L 21 14" />
              </g>
            </svg>
            you can practice here first
          </span>
        </div>
      </div>
      <StatRow stats={stats} />
      <Countdown />
      <button className="link feedback-link" onClick={onFeedback}>
        Found a mistake or want a change? Send feedback
      </button>
    </div>
  );
}
