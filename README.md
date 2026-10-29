# The Barely Passing Manual by the Anti-Chemist

*Want to test your salt analysis?* A daily, Wordle-style puzzle built on the CBSE Class 12
chemistry practical: identify the anion and cation of an unknown salt by running the tests in
the right order and filling in the answer sheet (Experiment / Observation / Inference).

See [DESIGN.md](DESIGN.md) for the full design.

## Run it

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # every salt must be solvable by following the procedure
npm run build   # static site in dist/
```

## Where things live

| Path | What |
|---|---|
| `src/chem/procedure.ts` | **All the chemistry**: tests, observations, inferences, the order of the procedure |
| `src/chem/salts.ts` | The salt pool |
| `src/engine/game.ts` | Game rules: procedure enforcement, strikes, hints, share grid |
| `src/engine/lines.ts` | Ma'am's dialogue |
| `src/components/` | UI, including the placeholder chibi sprites (`Teacher.tsx`, `AntiChemist.tsx`) |

To fix a chemistry mistake, edit `src/chem/procedure.ts` and run `npm test`.

## Deploy

Push to GitHub, then in the repo go to **Settings → Pages → Source: GitHub Actions**.
`.github/workflows/deploy.yml` tests, builds and publishes on every push to `main`/`master`.

### Feedback form

The in-game feedback form sends submissions to your email through [Web3Forms](https://web3forms.com) (free, no backend).
Get an access key there with your email, then add it in the repo under
**Settings → Secrets and variables → Actions → Variables** as `WEB3FORMS_KEY`, and re-run the deploy.
For local dev, put `VITE_WEB3FORMS_KEY=...` in `.env.local`. Without a key the form shows but can't send.
