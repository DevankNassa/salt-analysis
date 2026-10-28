import { useEffect, useState } from 'react';
import { AntiChemist } from './AntiChemist';
import { LegendExamples } from './Tiles';

const PAGES = 3;

/** How to play, as the Anti-Chemist's booklet: cover → page 1 (rules) → page 2 (reading the tiles). */
export function Manual({ backLabel, onBack, onDone }: { backLabel: string; onBack: () => void; onDone: () => void }) {
  const [page, setPage] = useState(0);
  const prev = () => (page === 0 ? onBack() : setPage(page - 1));
  const next = () => (page === PAGES - 1 ? onDone() : setPage(page + 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft' && page > 0) setPage(page - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="manual">
      <div className="manual-top">
        <button className="link" onClick={onBack}>
          ← {backLabel}
        </button>
        <span>
          {page + 1} / {PAGES}
        </span>
      </div>

      {page === 0 && (
        <div className="cover page-turn" key="cover">
          <div className="cover-label">
            <span className="marker">The Barely Passing Manual</span>
            <span className="byline">by the Anti-Chemist</span>
          </div>
          <span className="cover-scrawl">Property of the Anti-Chemist. If found, keep it. You need it more than I do.</span>
          <div className="cover-ac">
            <AntiChemist pose="writing" />
          </div>
          <div className="ribbon" aria-hidden />
          <button className="btn wobbly red" onClick={next}>
            Open the manual
          </button>
        </div>
      )}

      {page === 1 && (
        <div className="page lined page-turn" key="p1">
          <h2 className="marker">Page 1 of the Manual</h2>
          <span className="scrawl">Property of the Anti-Chemist. If found, keep it. You need it more than I do.</span>
          <ol>
            <li>
              You get an <b>unknown salt</b>. Find its <b>anion</b> and <b>cation</b>, then write its <b>formula</b>.
            </li>
            <li>
              Pick the tests <b>in the right order</b>. Preliminary → anion → cation, group by group. Skip a step and Ma’am will
              notice.
            </li>
            <li>
              After every test, write what you <b>observe</b> and what you <b>infer</b>. Just like the real answer sheet.
            </li>
            <li>
              Got a result? <b>Confirm it</b> with the right confirmatory test before moving on.
            </li>
            <li>
              Every mistake is a <b>strike</b>. Six strikes and you’re thrown out of the lab.
            </li>
            <li>Stuck? Ask me. Free in practice. In the daily salt it costs a strike.</li>
          </ol>
          <span className="scrawl">A new salt every day, the same for everyone. Want to test your salt analysis?</span>
          <PageButtons onBack={prev} onNext={next} next="Turn the page" />
        </div>
      )}

      {page === 2 && (
        <div className="page lined page-turn" key="p2">
          <h2 className="marker">Reading the tiles</h2>
          <span>Every test is one row: experiment, observation, inference.</span>
          <LegendExamples />
          <PageButtons onBack={prev} onNext={next} next="Open the lab" />
        </div>
      )}
    </div>
  );
}

function PageButtons({ onBack, onNext, next }: { onBack: () => void; onNext: () => void; next: string }) {
  return (
    <div className="page-buttons">
      <button className="btn wobbly" onClick={onBack}>
        Back
      </button>
      <button className="btn wobbly red" onClick={onNext}>
        {next}
      </button>
    </div>
  );
}
