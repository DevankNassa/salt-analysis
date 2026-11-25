// Visitor counting through GoatCounter (https://www.goatcounter.com): free, cookieless, no banner needed.
// Set the GOATCOUNTER_CODE repo variable (the "xyz" in xyz.goatcounter.com). Without it, nothing loads or is sent,
// so local dev never pollutes the numbers.

const CODE = import.meta.env.VITE_GOATCOUNTER_CODE as string | undefined;

interface GoatCounter {
  count: (vars: { path: string; title?: string; event?: boolean }) => void;
}
declare global {
  interface Window {
    goatcounter?: GoatCounter;
  }
}

/** Events fired before the script finishes loading. */
const queue: string[] = [];

export function initAnalytics(): void {
  if (!CODE) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.dataset.goatcounter = `https://${CODE}.goatcounter.com/count`;
  s.onload = () => queue.splice(0).forEach(track);
  document.head.appendChild(s);
}

/** Counts a named event (shows up under its name in the GoatCounter dashboard). */
export function track(event: string): void {
  if (!CODE) return;
  const gc = window.goatcounter;
  if (gc?.count) gc.count({ path: event, title: event, event: true });
  else queue.push(event);
}
