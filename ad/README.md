# Ads

Short vertical promo videos (1080×1920), made with [Remotion](https://www.remotion.dev): the video is React code.
It renders the game's **real components** from `../src` with a scripted game played by the real engine,
so every screen and observation matches the live site. Nothing here is part of the game's build or deploy.

## Use it

```bash
cd ad
npm install
npm run studio            # preview and scrub in the browser
./render.sh               # render every version → out/<id>.mp4 + out/<id>-poster.png
./render.sh v1-explainer  # render one
```

`out/` (renders) and `private/` stay out of git, and so do audio files.

## Make a new version

Every version is a script in [`src/versions.ts`](src/versions.ts). Copy one, give it a new `id`, change the
text and timings. It appears in the Studio and `./render.sh` picks it up.

- **Scenes:** `hook` (Ma'am and a big line), `phone` (the game on a phone, caption above), `end` (title + URL).
- **Shots** inside a phone scene: `home`, `result` (score card), or `game` with a `state`:
  `start`, `first-observe`, `cation-start`, `wrong-order`, `cation-positive`, `formula`, `won`.
  The scripted game solves correctly, skips one group in the cation section (one strike), and then finishes.
- **Shot options:** `callout` (Ma'am's line as a big bubble), `tap: 'wrong-key'` (a finger taps the key that
  skips ahead), `at` (start the bench animation N seconds in, e.g. so a precipitate is visibly forming).
- **Captions:** `*stars*` = red marker, `\n` = new line.
- **Salt:** `salt` is any id from `src/chem/salts.ts`. Check its observations are right before posting it.

## How it works

- `remotion.config.ts` makes the game's `react` imports use this folder's React, and stubs the Vite env vars,
  so the ad never loads analytics or sends feedback.
- The game sizes its phone screens with `dvh`. `src/ad.css` sizes them to the drawn phone instead.
- The game animates with CSS. `src/sync.ts` pauses every animation and seeks it to the current frame,
  because Remotion renders frames out of order.
