import type { TeacherMood } from '../../src/engine/lines';
import type { StateName } from './gameStates';

/*
 * Every ad version is a script: a list of scenes. To make a new version, copy one below,
 * change its id, text or timing, and it shows up in Remotion Studio and in `npm run render`.
 *
 * Caption text: wrap words in *stars* to write them in red marker; \n starts a new line.
 * Times are in seconds.
 */

/** Extras any shot can have. */
interface ShotOptions {
  sec: number;
  /** Start the screen's animations this many seconds in (e.g. so a precipitate is already forming). */
  at?: number;
  /** Show Ma'am's current line as a big speech bubble over the phone (the phone's text is small). */
  callout?: boolean;
  /** A finger taps the key that the next shot's wrong move presses. */
  tap?: 'wrong-key';
}

/** One screen shown inside the phone. */
export type Shot =
  | ({ screen: 'home' } & ShotOptions)
  | ({ screen: 'game'; state: StateName } & ShotOptions)
  | ({ screen: 'result' } & ShotOptions);

export type Scene =
  /** Ma'am alone, glaring, with a big line of text. */
  | { kind: 'hook'; sec: number; text: string; mood: TeacherMood }
  /** The phone with the real game in it; a caption above. */
  | { kind: 'phone'; caption: string; shots: Shot[] }
  /** Title, URL and pitch. */
  | { kind: 'end'; sec: number; pitch: string; url: string };

export interface Version {
  id: string;
  /** Which salt the scripted game uses (an id from src/chem/salts.ts). */
  salt: string;
  /** Daily puzzle number shown in the game header and on the score card. */
  puzzle: number;
  scenes: Scene[];
}

const URL = 'devank.dev/chemistry-game';

export const VERSIONS: Version[] = [
  {
    // The explainer: what it is and how it works, no real gameplay. ~20 s.
    id: 'v1-explainer',
    salt: 'cuso4',
    puzzle: 33,
    scenes: [
      { kind: 'hook', sec: 2.5, mood: 'stern', text: 'Salt analysis\n*practical*\ncoming up?' },
      { kind: 'phone', caption: 'Here’s a *free daily*\n*puzzle* for it.', shots: [{ screen: 'home', sec: 2.5 }] },
      {
        kind: 'phone',
        caption: '1. You get one\n*unknown salt*',
        shots: [
          { screen: 'game', state: 'start', sec: 1.2 },
          { screen: 'game', state: 'first-observe', sec: 1.8 },
        ],
      },
      {
        kind: 'phone',
        caption: '2. Run the tests in the\n*real practical order*',
        shots: [
          { screen: 'game', state: 'cation-start', sec: 1.5, tap: 'wrong-key' },
          { screen: 'game', state: 'wrong-order', sec: 2.4, callout: true },
        ],
      },
      {
        kind: 'phone',
        caption: '3. Find the\n*anion + cation*',
        shots: [
          { screen: 'game', state: 'cation-positive', sec: 2.2, at: 1.6 },
          { screen: 'game', state: 'formula', sec: 1.6 },
        ],
      },
      {
        kind: 'phone',
        caption: '*New salt every day*\n6 strikes · free · no login',
        shots: [{ screen: 'result', sec: 3 }],
      },
      { kind: 'end', sec: 3.5, pitch: 'Want to test your salt analysis?', url: URL },
    ],
  },
];

export const sceneSec = (s: Scene) => (s.kind === 'phone' ? s.shots.reduce((t, x) => t + x.sec, 0) : s.sec);
