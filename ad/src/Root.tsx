import { loadFont as loadKalam } from '@remotion/google-fonts/Kalam';
import { loadFont as loadMarker } from '@remotion/google-fonts/PermanentMarker';
import { Composition } from 'remotion';
import '../../src/styles.css';
import './ad.css';
import { Ad, adFrames } from './Ad';
import { VERSIONS } from './versions';

// The same fonts the game loads from Google Fonts.
loadKalam('normal', { weights: ['400', '700'], subsets: ['latin'] });
loadMarker('normal', { weights: ['400'], subsets: ['latin'] });

const FPS = 30;

/** Every version is designed on a 540×960 canvas and rendered at 2× (1080×1920, vertical). */
export function Root() {
  return (
    <>
      {VERSIONS.map((v) => (
        <Composition
          key={v.id}
          id={v.id}
          component={Ad}
          defaultProps={{ version: v }}
          durationInFrames={adFrames(v, FPS)}
          fps={FPS}
          width={540}
          height={960}
        />
      ))}
    </>
  );
}
