import { useRef, type ReactNode } from 'react';
import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AntiChemist } from '../../src/components/AntiChemist';
import { Teacher } from '../../src/components/Teacher';
import { LogoTiles } from '../../src/components/Tiles';
import { teacherLine, type TeacherMood } from '../../src/engine/lines';
import { scriptedStates } from './gameStates';
import { Screen } from './Screens';
import { useFrameSyncedAnimations } from './sync';
import { sceneSec, type Scene, type Version } from './versions';

/* Layout of the 540×960 canvas (rendered at 2× = 1080×1920). */
const W = 540;
const PHONE_W = 350; // on canvas, inside the bezel
const SCREEN_W = 390; // the phone's CSS width (an ordinary phone)
const SCREEN_H = 770;
const PHONE_SCALE = PHONE_W / SCREEN_W;
const PHONE_TOP = 222;
const BEZEL = 9;

/** "Find the *anion + cation*" → red marker for the starred words; \n → new line. */
function Marked({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, l) => (
        <div key={l}>
          {line.split(/(\*[^*]+\*)/).map((part, i) =>
            part.startsWith('*') ? (
              <span key={i} className="red">
                {part.slice(1, -1)}
              </span>
            ) : (
              part
            ),
          )}
        </div>
      ))}
    </>
  );
}

function useEnter(delay = 0) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 160, mass: 0.7 } });
}

function Caption({ text, top, size }: { text: string; top: number; size: number }) {
  const p = useEnter(2);
  return (
    <div
      className="ad-caption"
      style={{
        top,
        fontSize: size,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [18, 0])}px) scale(${interpolate(p, [0, 1], [0.94, 1])})`,
      }}
    >
      <Marked text={text} />
    </div>
  );
}

/** Captions get smaller as their longest line gets longer, so every one fits above the phone. */
const captionSize = (text: string) => {
  const longest = Math.max(...text.replace(/\*/g, '').split('\n').map((l) => l.length));
  return longest <= 16 ? 46 : longest <= 22 ? 40 : 35;
};

/** Ma'am's current line, big, over the phone: the phone's own text is too small to read in a feed. */
function Callout({ text, mood }: { text: string; mood: TeacherMood }) {
  const p = useEnter(3);
  return (
    <div
      className="ad-callout"
      style={{ opacity: p, transform: `rotate(-2.5deg) scale(${interpolate(p, [0, 1], [0.6, 1])})` }}
    >
      <div className="ad-callout-avatar">
        <Teacher mood={mood} avatar />
      </div>
      <div className="ad-callout-bubble">{text}</div>
    </div>
  );
}

/* ───── scenes ───── */

function HookScene({ text, mood }: { text: string; mood: TeacherMood }) {
  const frame = useCurrentFrame();
  const p = useEnter(0);
  // Ma'am leans in slowly the whole time she's on screen.
  const lean = interpolate(frame, [0, 90], [1, 1.07], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <Caption text={text} top={150} size={60} />
      <div
        style={{
          position: 'absolute',
          left: (W - 400) / 2,
          top: 400,
          width: 400,
          transformOrigin: '50% 100%',
          transform: `translateY(${interpolate(p, [0, 1], [420, 0])}px) scale(${lean})`,
        }}
      >
        <Teacher mood={mood} />
      </div>
    </AbsoluteFill>
  );
}

function PhoneScene({ scene, version, slideIn }: { scene: Extract<Scene, { kind: 'phone' }>; version: Version; slideIn: boolean }) {
  const { fps } = useVideoConfig();
  const p = useEnter(0);
  const y = slideIn ? interpolate(p, [0, 1], [700, 0]) : 0;
  let t = 0;
  const shots = scene.shots.map((shot) => {
    const dur = Math.round(shot.sec * fps);
    const at = { shot, from: t, dur };
    t += dur;
    return at;
  });
  return (
    <AbsoluteFill>
      <Caption text={scene.caption} top={50} size={captionSize(scene.caption)} />
      <div
        className="ad-phone"
        style={{
          left: (W - PHONE_W) / 2 - BEZEL,
          top: PHONE_TOP + y,
          width: PHONE_W + BEZEL * 2,
          height: SCREEN_H * PHONE_SCALE + BEZEL * 2,
        }}
      >
        <div className="ad-phone-inner" style={{ width: SCREEN_W, height: SCREEN_H, transform: `scale(${PHONE_SCALE})` }}>
          {shots.map(({ shot, from, dur }, i) => (
            <Sequence key={i} from={from} durationInFrames={dur} layout="none">
              <Screen shot={shot} salt={version.salt} puzzle={version.puzzle} width={SCREEN_W} height={SCREEN_H} />
            </Sequence>
          ))}
        </div>
      </div>
      {shots.map(({ shot, from, dur }, i) => {
        if (!shot.callout || shot.screen !== 'game') return null;
        const line = teacherLine(scriptedStates(version.salt)[shot.state]);
        return (
          <Sequence key={`c${i}`} from={from} durationInFrames={dur}>
            <Callout text={line.text} mood={line.mood} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

function EndScene({ pitch, url }: { pitch: string; url: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useFrameSyncedAnimations(ref); // the logo tiles flip in
  const title = useEnter(4);
  const note = useEnter(14);
  const pitchIn = useEnter(24);
  const sprites = useEnter(8);
  const pop = (v: number, dy = 20): React.CSSProperties => ({
    opacity: v,
    transform: `translateY(${interpolate(v, [0, 1], [dy, 0])}px)`,
  });
  return (
    <AbsoluteFill ref={ref}>
      <div className="ad-end" style={{ paddingBottom: 170 }}>
        <LogoTiles />
        <h1 className="marker" style={pop(title)}>
          Saltdle
        </h1>
        <span className="byline" style={pop(title)}>
          The Barely Passing Manual, by the Anti-Chemist
        </span>
        <div className="ad-url" style={{ ...pop(note, 30), transform: `rotate(-2deg) scale(${interpolate(note, [0, 1], [0.7, 1])})` }}>
          {url.replace('/', '/\n')}
        </div>
        <span className="ad-pitch" style={pop(pitchIn)}>
          {pitch}
        </span>
        <span className="ad-free" style={pop(pitchIn)}>
          Free · no login · CBSE Class 12 practical
        </span>
      </div>
      <div className="ad-sprite" style={{ left: 18, width: 170, transform: `translateY(${interpolate(sprites, [0, 1], [220, 0])}px)` }}>
        <Teacher mood="grudging" />
      </div>
      <div className="ad-sprite" style={{ right: 14, width: 150, transform: `translateY(${interpolate(sprites, [0, 1], [220, 0])}px)` }}>
        <AntiChemist pose="pointing" />
      </div>
    </AbsoluteFill>
  );
}

function SceneView({ scene, version, index }: { scene: Scene; version: Version; index: number }): ReactNode {
  if (scene.kind === 'hook') return <HookScene text={scene.text} mood={scene.mood} />;
  if (scene.kind === 'end') return <EndScene pitch={scene.pitch} url={scene.url} />;
  const prev = version.scenes[index - 1];
  return <PhoneScene scene={scene} version={version} slideIn={!prev || prev.kind !== 'phone'} />;
}

/* ───── the whole ad ───── */

export function Ad({ version }: { version: Version }) {
  const { fps } = useVideoConfig();
  let from = 0;
  return (
    <AbsoluteFill className="ad-canvas">
      {version.scenes.map((scene, i) => {
        const dur = Math.round(sceneSec(scene) * fps);
        const seq = (
          <Sequence key={i} from={from} durationInFrames={dur} name={`${i + 1} ${scene.kind}`}>
            <SceneView scene={scene} version={version} index={i} />
          </Sequence>
        );
        from += dur;
        return seq;
      })}
    </AbsoluteFill>
  );
}

export const adFrames = (version: Version, fps: number) =>
  version.scenes.reduce((t, s) => t + Math.round(sceneSec(s) * fps), 0);
