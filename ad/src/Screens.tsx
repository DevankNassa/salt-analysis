import { useLayoutEffect, useRef, useState } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { GamePhone } from '../../src/components/Game';
import { Home } from '../../src/components/Home';
import { ResultModal } from '../../src/components/Modals';
import { newGame } from '../../src/engine/game';
import type { Stats } from '../../src/engine/storage';
import { scriptedStates } from './gameStates';
import { useFrameSyncedAnimations } from './sync';
import type { Shot } from './versions';

const noop = () => {};

/** What a first-time visitor sees: nothing played yet. */
const NEW_VISITOR: Stats = { played: 0, won: 0, streak: 0, maxStreak: 0, lastDay: 0, dist: [0, 0, 0, 0, 0, 0, 0] };

/** One game screen, rendered with the game's real components, sized like a phone. */
export function Screen({ shot, salt, puzzle, width, height }: { shot: Shot; salt: string; puzzle: number; width: number; height: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useFrameSyncedAnimations(ref, (shot.at ?? 0) * 1000);
  const states = scriptedStates(salt);

  // Where the finger taps: the key the scripted wrong move presses.
  const [tapAt, setTapAt] = useState<{ x: number; y: number } | null>(null);
  const wrong = states['wrong-order'].event;
  const tapLabel = shot.tap === 'wrong-key' && wrong.type === 'wrong-card' ? wrong.card : null;
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !tapLabel) return;
    const key = [...el.querySelectorAll<HTMLElement>('.key.reagent')].find((k) => k.textContent?.trim() === tapLabel);
    if (!key) throw new Error(`No key labelled "${tapLabel}" on screen`);
    const box = el.getBoundingClientRect();
    const k = key.getBoundingClientRect();
    const scale = box.width / width; // the phone is drawn scaled down
    setTapAt({ x: (k.left + k.width / 2 - box.left) / scale, y: (k.top + k.height / 2 - box.top) / scale });
  }, [tapLabel, width]);

  const gameProps = {
    puzzle,
    dispatch: noop,
    onMode: noop,
    onNewSalt: noop,
    onHome: noop,
    onManual: noop,
    onStats: noop,
    onFeedback: noop,
    onShowResult: noop,
  };

  let content;
  if (shot.screen === 'home') {
    content = (
      <Home
        puzzle={puzzle}
        daily={newGame(salt, 'daily')}
        stats={NEW_VISITOR}
        onDaily={noop}
        onPractice={noop}
        onManual={noop}
        onFeedback={noop}
      />
    );
  } else if (shot.screen === 'game') {
    content = (
      <div className="game-wrap">
        <GamePhone game={states[shot.state]} {...gameProps} />
      </div>
    );
  } else {
    content = (
      <>
        <div className="game-wrap">
          <GamePhone game={states.won} {...gameProps} />
        </div>
        <ResultModal game={states.won} puzzle={puzzle} stats={null} onClose={noop} />
      </>
    );
  }

  return (
    <div ref={ref} className="ad-screen" style={{ width, ['--screen-h' as string]: `${height}px` }}>
      <div className={`app narrow screen-${shot.screen === 'home' ? 'home' : 'game'}`}>{content}</div>
      {tapAt && <Tap x={tapAt.x} y={tapAt.y} endSec={shot.sec} />}
    </div>
  );
}

/** A fingertip that lands on (x, y) and presses, finishing just before the shot ends. */
function Tap({ x, y, endSec }: { x: number; y: number; endSec: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - (endSec - 0.75); // 0 = finger arrives
  if (t < 0) return null;
  const arrive = interpolate(t, [0, 0.25], [0, 1], { extrapolateRight: 'clamp' });
  const press = interpolate(t, [0.3, 0.4, 0.55], [1, 0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ripple = interpolate(t, [0.38, 0.75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none', zIndex: 20 }}>
      {ripple > 0 && (
        <div
          style={{
            position: 'absolute',
            width: 46,
            height: 46,
            left: -23,
            top: -23,
            borderRadius: '50%',
            border: '3px solid #d0312d',
            opacity: 1 - ripple,
            transform: `scale(${1 + ripple * 1.6})`,
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          width: 46,
          height: 46,
          left: -23,
          top: -23,
          borderRadius: '50%',
          background: 'rgba(31, 26, 23, 0.35)',
          border: '3px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          opacity: arrive,
          transform: `translate(${(1 - arrive) * 40}px, ${(1 - arrive) * 60}px) scale(${press})`,
        }}
      />
    </div>
  );
}
