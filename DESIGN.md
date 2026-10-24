# The Barely Passing Manual by the Anti-Chemist — Design Doc

> Status: **Draft v0.2** · Owner: Devank · Last updated: 2026-10-25
> Tagline / share hook: **"Want to test your salt analysis?"**

---

## 0. Decisions log

| # | Decision | Date |
|---|---|---|
| D1 | Web game, mobile-first | 2026-10-25 |
| D2 | Syllabus filter: "CBSE only" option; every ion/salt tagged by syllabus | 2026-10-25 |
| D3 | Two sprite characters: strict, flustered **Teacher** + mysterious **Anti-Chemist** (tips only) | 2026-10-25 |
| D4 | Art: hand-drawn + **chibi sprites**; AI/code-made placeholders for now | 2026-10-25 |
| D5 | **No skipping groups.** The procedure is enforced in the correct order, so we don't build bad habits | 2026-10-25 |
| D6 | Daily puzzle: random salt, same difficulty every day | 2026-10-25 |
| D7 | Share hook text: "Want to test your salt analysis?" | 2026-10-25 |
| D8 | Build on the draft flowchart (§6.2); fix data as it gets reviewed | 2026-10-25 |
| D9 | Answer-sheet mechanic (Experiment / Observation / Inference) | 2026-10-25 |
| D10 | Wordle-style scoring: **6 strikes**, score = strikes used, 6th strike = thrown out (X/6) | 2026-10-25 |
| D11 | Teacher is a woman (students call her "Ma'am"); English only | 2026-10-25 |
| D12 | Hosted on GitHub Pages for now | 2026-10-25 |

---

## 1. Pitch

You're a Class 12 student stuck in chemistry lab with the board practical coming up. The official lab manual is useless: one long procedure per salt. Then you find an old, battered manual whose margins are full of flowcharts, shortcuts and sticky notes from someone who signs as **"the Anti-Chemist"**. With their notes you work through the procedure, read the observations correctly and identify the salt, all while the Teacher hovers over you.

**What it is:** a procedure-and-deduction puzzle built on real **qualitative salt analysis** (CBSE Class 12 practical). Identify the **anion** and **cation** of an unknown salt by doing the tests in the right order, reading what you see and drawing the right inferences.

**Audience:** Indian Class 11–12 students (CBSE first) preparing for the chemistry practical and viva.

---

## 2. Design pillars

1. **Procedure is sacred.** Steps follow the real practical order. You can't skip ahead (D5). Shortcuts are hints, not cheats.
2. **Think, don't memorize.** The challenge is *reading observations and inferring*, not reciting procedures.
3. **Chemically honest.** Every observation must be correct. A wrong colour or ppt is a critical bug.
4. **Done in 5–10 minutes.** A daily puzzle fits between mock tests.
5. **Funny, not preachy.** The Teacher panics and yells. The Anti-Chemist whispers.

---

## 3. Characters (chibi sprites)

Big heads, small bodies, thick hand-drawn outlines, flat colours plus marker-style shading.

### The Teacher ("Ma'am", full name TBD)
- **Personality:** strict, loud, perpetually flustered: watching the clock, counting reagent bottles, convinced you'll blow up the lab.
- **Look:** a woman in a lab coat a size too big, glasses sliding down her nose, hair bun coming loose, a register/clipboard clutched to her chest, sweat drops, red face when angry.
- **Role:** enforces the procedure and reacts to mistakes. Gives no answers.
- **Expressions (sprite set):**
  1. `stern`: arms crossed, glaring (idle)
  2. `shouting`: mouth huge, steam puffs, ALL-CAPS bubble
  3. `flustered`: sweat drops, swirly eyes, papers flying
  4. `shocked`: glasses popped off
  5. `grudging`: "Hmph. Acceptable.", looking away
  6. `facepalm`
- **Example lines:**
  - *"GROUP II?! Have you even DONE Group I? PROCEDURE!"*
  - *"That is the wrong reagent. Do you want me to call your parents?"*
  - *"Hmph. Lead. ...Correct. Don't let it go to your head."*

### The Anti-Chemist
- **Personality:** calm, cryptic, a little smug. A Half-Blood Prince figure who clearly hated this lab but mastered it anyway.
- **Look:** never fully shown. A hooded silhouette with a glint of glasses, an inky hand holding a pen.
- **Role:** tips, mnemonics, shortcuts. Speaks **only** through margin handwriting and **yellow sticky notes**.
- **Poses (sprite set):** `lurking` (corner of screen), `writing`, `pointing` (at a note).
- **Example notes:**
  - *"Blue salt? It's copper. Still do the groups. The Teacher is watching."*
  - *"Brisk fizz + milky lime water = carbonate. Don't overthink it."*
  - *"Group III without NH₄Cl? Enjoy precipitating everything."*

---

## 4. Core gameplay

Because the order is fixed (D5), the puzzle isn't *which* test to run. It's **knowing the next correct step, choosing the right reagent, and reading the result correctly**. That's exactly what the practical tests.

### 4.1 The practical sheet (the main UI)
The screen is the real answer-sheet format: **Experiment | Observation | Inference**. Each step fills one row.

```
 ┌───────────────┬──────────────────────┬──────────────────────┐
 │ Experiment    │ Observation          │ Inference            │
 ├───────────────┼──────────────────────┼──────────────────────┤
 │ Salt + dil.   │ [player picks]       │ [player picks]       │
 │ H₂SO₄         │ brisk effervescence  │ CO₃²⁻ may be present │
 └───────────────┴──────────────────────┴──────────────────────┘
```

### 4.2 One step
1. **Pick the reagent/test** from the shelf. The shelf shows *all* reagents, so you need to know which one comes next.
   - Wrong order or wrong reagent → **blocked**, Teacher reacts, counts as a mistake.
2. **Watch the result:** an animated visual (ppt colour, gas, fumes, flame colour). The game doesn't name it in text.
3. **Record the observation:** choose from options (e.g. "white ppt" / "black ppt" / "no ppt").
4. **Record the inference:** choose from options (e.g. "Group I present (Pb²⁺)" / "Group I absent").
5. The game then moves on: a negative result unlocks the next group, a positive result unlocks the confirmatory tests.

### 4.3 Procedure order (enforced)
```
A. Preliminary   physical examination (colour, smell, state) → dry tests
B. Anion         dil. H₂SO₄ → conc. H₂SO₄ → independent (SO₄²⁻, PO₄³⁻) → confirmatory
C. Cation        prepare original solution → Group 0 → I → II → III → IV → V → VI → confirmatory
D. Result        state the anion and cation
```
Rules:
- A group can only run after the previous group gave **no ppt**.
- Once a group gives a ppt, the later groups lock (single salt) and you **confirm**.
- You can't state the final result until a **confirmatory test is positive**.
- Dry tests: physical examination is required. Flame test, borax bead, charcoal cavity and cobalt nitrate are **conditional**, and only run when the procedure calls for them (e.g. borax bead for coloured salts, cobalt nitrate after a white residue in charcoal cavity). Doing one when it isn't called for is a wasted step.

### 4.4 Scoring (Wordle-style strikes, D10)
- You get **6 strikes** (the Teacher's patience).
- A **strike** is: the wrong reagent or a step out of order, a wrong observation, a wrong inference, an irrelevant confirmatory test, or the wrong final formula. A wrong choice is crossed out and you try again, Wordle-style.
- **Score = strikes used** (0/6 is perfect). The 6th strike gets you thrown out of the lab → **X/6**.
- Final step: pick the salt's **formula** (tests valency, e.g. Al₂(SO₄)₃ vs AlSO₄).
- The Teacher's end reaction depends on the score (0 = `grudging`, 4–5 = `facepalm`, X = `shouting`).

### 4.5 Hints (the Anti-Chemist)
- Practice Lab: unlimited sticky-note hints with no penalty.
- Daily Salt: a hint costs **1 strike** (shown as 🟨 on the share card instead of 🟥).

---

## 5. Game modes

### 5.1 Daily Salt (MVP)
- One random salt per day, the same for everyone (date-seeded, no server), with the same difficulty every day (D6).
- The pool is shuffled once so no salt repeats until the whole pool has been used.
- Streak + stats in `localStorage`.
- **Share card** (no spoilers):
  ```
  Want to test your salt analysis? 🧪
  The Anti-Chemist #142 — 2/6
  Prelim ⬜⬜
  Anion  ⬜🟩🟩
  Cation ⬜⬜⬜🟩🟥🟩
  Result 🟩
  🔥 5-day streak
  <link>
  ```
  ⬜ correct negative step · 🟩 correct positive/confirm step · 🟥 mistake · 🟨 hint used

### 5.2 Practice Lab (MVP)
- Unlimited random salts, free hints, an optional flowchart overlay.
- Filters: syllabus (CBSE / All), anion-only, cation-only, a specific group.

### 5.3 The Manual (story mode, v2)
- Chapters = manual pages (e.g. "Chapter 3: The dil. H₂SO₄ Gang"), each teaching one part of the flowchart.
- Collect sticky notes and pages, and gradually uncover who the Anti-Chemist was.

### 5.4 Later
- **Exam Mode:** timed, with the full sheet graded at the end.
- **Viva Voce:** the Teacher fires rapid questions ("Why add NH₄Cl before NH₄OH in Group III?").
- **Extended syllabus** (ICSE/state boards).

---

## 6. Chemistry scope

### 6.1 CBSE ion list
- **Cations (14):** NH₄⁺, Pb²⁺, Cu²⁺, As³⁺, Al³⁺, Fe³⁺, Mn²⁺, Zn²⁺, Co²⁺, Ni²⁺, Ca²⁺, Sr²⁺, Ba²⁺, Mg²⁺
- **Anions (12):** CO₃²⁻, S²⁻, SO₃²⁻, NO₂⁻, CH₃COO⁻, Cl⁻, Br⁻, I⁻, NO₃⁻, C₂O₄²⁻, SO₄²⁻, PO₄³⁻

### 6.2 Draft flowchart. ⚠️ To be verified against Devank's remade chart

**Anions**
```
Salt + dil. H₂SO₄
 ├─ brisk effervescence, colourless odourless gas → lime water milky ....... CO₃²⁻   confirm: MgSO₄ white ppt (water extract)
 ├─ rotten-egg smell → lead acetate paper black ............................ S²⁻     confirm: sodium nitroprusside → purple/violet
 ├─ suffocating smell (burning S) → acidified K₂Cr₂O₇ paper green .......... SO₃²⁻   confirm: BaCl₂ white ppt soluble in dil. HCl; decolourises KMnO₄
 ├─ light brown fumes → starch-iodide paper blue ........................... NO₂⁻    confirm: KI + starch + acetic acid → blue; FeSO₄ → brown/black
 ├─ vinegar smell .......................................................... CH₃COO⁻ confirm: neutral FeCl₃ → deep red, brown-red ppt on boiling
 └─ no gas → Salt + conc. H₂SO₄
     ├─ colourless pungent gas, white fumes with NH₄OH rod ..... Cl⁻     confirm: AgNO₃ white ppt soluble in NH₄OH; chromyl chloride test
     ├─ reddish-brown vapours .................................. Br⁻     confirm: AgNO₃ pale yellow ppt, sparingly soluble in NH₄OH; layer test orange-brown
     ├─ violet vapours ......................................... I⁻      confirm: AgNO₃ yellow ppt insoluble in NH₄OH; layer test violet
     ├─ brown fumes, intensify with Cu turnings ................ NO₃⁻    confirm: brown ring test
     ├─ colourless gas (CO + CO₂) → lime water milky ........... C₂O₄²⁻  confirm: decolourises warm acidified KMnO₄; CaCl₂ white ppt
     └─ nothing → independent tests
         ├─ BaCl₂ → white ppt insoluble in conc. HCl ........... SO₄²⁻   confirm: lead acetate → white ppt soluble in hot ammonium acetate
         └─ conc. HNO₃ + ammonium molybdate → canary yellow ppt  PO₄³⁻
```

**Cations**
```
Original solution: water; if insoluble → dil. HCl (carbonates)
Group 0   NaOH + heat → NH₃ smell, white fumes with HCl rod ............. NH₄⁺   confirm: Nessler's reagent brown ppt
Group I   dil. HCl → white ppt ......................................... Pb²⁺   confirm: KI yellow ppt; K₂CrO₄ yellow ppt
Group II  H₂S gas in dil. HCl → black ppt ............................... Cu²⁺   confirm: 50% HNO₃, then excess NH₄OH → deep blue; K₄[Fe(CN)₆] chocolate-brown ppt
                              → yellow ppt .............................. As³⁺   confirm: conc. HNO₃ + ammonium molybdate → yellow ppt
Group III (boil with conc. HNO₃) NH₄Cl + NH₄OH → reddish-brown ppt ...... Fe³⁺   confirm: K₄[Fe(CN)₆] Prussian blue; KSCN blood red
                                               → white gelatinous ppt ... Al³⁺   confirm: blue litmus + NH₄OH → blue lake
Group IV  H₂S in ammoniacal solution → dirty-white ppt ................. Zn²⁺   confirm: NaOH white ppt soluble in excess; K₄[Fe(CN)₆] bluish-white ppt
                                     → buff/flesh ppt .................. Mn²⁺   confirm: NaOH white ppt → turns brown; PbO₂ + conc. HNO₃ → pink/purple
                                     → black ppt ....................... Ni²⁺   confirm: DMG → bright red ppt
                                     → black ppt ....................... Co²⁺   confirm: KNO₂ + CH₃COOH → yellow ppt; NH₄SCN + ether → blue
Group V   (NH₄)₂CO₃ with NH₄Cl + NH₄OH → white ppt ...................... Ba²⁺   confirm: K₂CrO₄ (acetic acid) yellow ppt; flame grassy/apple-green
                                                                          Sr²⁺   confirm: (NH₄)₂SO₄ white ppt; flame crimson
                                                                          Ca²⁺   confirm: (NH₄)₂C₂O₄ white ppt; flame brick-red
Group VI  Na₂HPO₄ + NH₄OH, scratch sides → white crystalline ppt ......... Mg²⁺
```

**Dry-test shortcuts the Anti-Chemist "leaks":**
- Colour: blue/blue-green Cu²⁺ · green Ni²⁺ · pink/red Co²⁺ · very light pink Mn²⁺ · yellow-brown Fe³⁺
- Flame: brick-red Ca²⁺ · crimson Sr²⁺ · apple-green Ba²⁺ · green-blue Cu²⁺
- Cobalt nitrate (white residue): blue Al³⁺ · green Zn²⁺ · pink Mg²⁺

### 6.3 Salt pool (MVP draft, ~30). ⚠️ To be checked against what was used in real labs
NH₄Cl, (NH₄)₂CO₃, (NH₄)₂SO₄, (NH₄)₃PO₄, (NH₄)₂C₂O₄, Pb(NO₃)₂, Pb(CH₃COO)₂, CuSO₄, CuCO₃, Cu(NO₃)₂, Al₂(SO₄)₃, FeCl₃, ZnSO₄, ZnCO₃, MnCl₂, MnSO₄, NiCl₂, NiSO₄, CoCl₂, BaCl₂, Ba(NO₃)₂, SrCl₂, Sr(NO₃)₂, CaCO₃, CaCl₂, Ca(NO₃)₂, MgSO₄, MgCO₃, Mg(CH₃COO)₂ …

### 6.4 Known simplifications
- **Interfering radicals:** removing phosphate or oxalate before Group III isn't simulated, so those anions are only paired with NH₄⁺ / Group I–II cations in the pool.
- **Pb²⁺ in Group II:** PbCl₂ is partly soluble, so in real labs lead can also show up in Group II. MVP: lead is always caught in Group I. The Anti-Chemist mentions the real behaviour in a tip.
- Observations are illustrated + chosen from options, not physically simulated.

---

## 7. Art & audio direction

- **Whiteboard / notebook look**, taken from Devank's 2014 whiteboards:
  - **Black marker** for reactions, arrows and the sheet's ruling.
  - **Red marker** for headings and named tests ("Brown Ring Test", "GROUP III").
  - **Yellow sticky notes** for confirmatory tests and Anti-Chemist tips.
  - Hub-and-spoke mind-map layout for manual pages.
- **Chibi sprites (placeholder phase):** drawn as SVG in code so the game is playable right away, then swapped for final art later. The sprite sheet spec below lets an artist or an AI image tool produce matching replacements:
  - Teacher: 6 expressions (§3), 512×512 transparent PNG/SVG, facing right.
  - Anti-Chemist: 3 poses, silhouette palette (dark navy + glasses glint).
  - Props: test tube, burner, watch glass, reagent bottles (~20 labels), charcoal block, platinum wire.
  - Effects: ppt colours (white, black, yellow, buff, reddish-brown, blue lake, Prussian blue, blood-red), gas/fumes (colourless fizz, brown, violet, white fumes), flame colours.
- Fonts: handwritten for the Anti-Chemist, blocky "official" for the Teacher and the sheet.
- Audio (v2): marker squeak, fizz, the Teacher's "AHEM!".

---

## 8. Technical plan

| Concern | Choice | Why |
|---|---|---|
| Build | **Vite + TypeScript** | fast, static output |
| UI | **React**, DOM + CSS/SVG animation | the game is a sheet + dialogue + short effects, so a canvas engine is overkill |
| Chemistry data | TS data files: `ions`, `salts`, `reagents`, `steps`, `observations` | reviewable by a chemistry person without reading game logic |
| Procedure engine | state machine: `nextAllowedSteps(state)`, `runStep(salt, step) → observation` | enforces D5; unit-testable |
| Daily | date → index into a seeded shuffle of the pool | no backend |
| Persistence | `localStorage` | no accounts in MVP |
| Hosting | GitHub Pages / Cloudflare Pages | free, static |
| Tests | Vitest: every salt solvable via the procedure; every step has an observation defined for every ion; no salt's confirmatory test passes for the wrong ion | protects chemical honesty |

---

## 9. Milestones

| Phase | Scope | Done when |
|---|---|---|
| **0. Content** | Devank verifies §6.2 flowchart + §6.3 salt pool | data signed off |
| **1. Prototype** ✅ | Practice Lab: practical sheet, enforced procedure, full CBSE data, scoring, SVG chibi placeholders | a salt can be solved end-to-end on a phone |
| **2. Daily MVP** 🟡 | Daily seed, streaks, share card, Teacher/Anti-Chemist lines | built, not yet deployed; friends can play from a link |
| **3. Art pass** | Final sprites, manual-page UI, animations | looks like the whiteboards |
| **4. The Manual** | Story chapters, collectibles, Anti-Chemist mystery | first 3 chapters playable |
| **5. Extras** | Exam Mode, Viva Voce, extended syllabus | — |

---

## 10. Open questions

Resolved: flowchart (D8), mechanic (D9), scoring (D10), Teacher + language (D11), hosting (D12).

Still open:
1. **Teacher's full name** (for now she's just "Ma'am").
2. **Salt pool review (§6.3):** which of these did you actually get in your lab? Anything missing?
3. **S²⁻, SO₃²⁻, NO₂⁻, As³⁺:** in the data, but no pool salt yet. Their common lab salts (Na₂S, Na₂SO₃, NaNO₂) have Na⁺, which isn't in the CBSE cation list, and arsenic salts are rarely handed out. Add Na⁺/K⁺ as "no group" cations, or leave them out?
4. **Dry tests:** the MVP only does physical examination + flame test. Dry heating, borax bead, charcoal cavity and cobalt nitrate come later. Is that OK?
