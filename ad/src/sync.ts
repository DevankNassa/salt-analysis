import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * The game animates with CSS (tiles flipping, Ma'am's bubble, the looping bench scenes).
 * CSS animations run on the wall clock, but Remotion renders frames out of order, so every
 * animation under `ref` is paused and seeked to the current (Sequence-local) time.
 *
 * Seeking once in a layout effect isn't enough: when a frame is first rendered the screen may
 * not be displayed yet, so its CSS animations don't exist and start later on the wall clock.
 * So we also (1) seek any animation as soon as it starts, and (2) hold the frame until two
 * paints have passed and seek again.
 */
export function useFrameSyncedAnimations(ref: RefObject<HTMLElement | null>, offsetMs = 0) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000 + offsetMs;
  const msRef = useRef(ms);
  msRef.current = ms;

  // Any animation that starts later (element shown, remounted, class added) is seeked right away.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onStart = (e: AnimationEvent) => {
      const target = e.target as Element;
      for (const a of target.getAnimations()) {
        if ((a as CSSAnimation).animationName === e.animationName) seek(a, msRef.current);
      }
    };
    el.addEventListener('animationstart', onStart, true);
    return () => el.removeEventListener('animationstart', onStart, true);
  }, [ref]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    seekAll(el, ms);
    const handle = delayRender('Seeking CSS animations');
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        seekAll(el, msRef.current);
        continueRender(handle);
      });
    });
    return () => {
      cancelAnimationFrame(raf);
      continueRender(handle);
    };
  }, [ref, ms]);
}

function seek(a: Animation, ms: number) {
  a.pause();
  a.currentTime = ms;
}

function seekAll(el: HTMLElement, ms: number) {
  for (const a of el.getAnimations({ subtree: true })) seek(a, ms);
}
