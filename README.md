# Tapi

Tapi teaches children aged 4 to 7 to read and spell in British English. A child drags sound tiles into slots to rebuild a word, hears the sounds blend together, and watches the word come alive. Parents use it at home and teachers can set it up for a class. It runs offline.

The teaching rules come from the lesson plan (October 2026):

1. Tiles say the letter's sound, never its name.
2. Words split into sound units, so "kick" is k, i, ck.
3. Every rebuilt word ends with blending: slowly, then faster, then the whole word.

## What's in it

All six stages of the English track, in Letters and Sounds order:

| Stage | Island | Follows | Lessons | Story |
| --- | --- | --- | --- | --- |
| 0. Listening | Whisper Beach | Phase 1 | 4 listening games | none |
| 1. First sounds | First Sound Forest | Phase 2 | 10 | The cat and the dog |
| 2. New consonants | Echo Hills | Phase 3, first part | 7 | The ship and the fish |
| 3. Vowel teams | Rainbow River | Phase 3, second part | 7 | Night on the farm |
| 4. Clusters | Windy Cliffs | Phase 4 | 4 | The frog and the drum |
| 5. Other spellings | Singing Mountain | Phase 5 | 10 | The boy and the kite |

That makes 42 lessons, 259 practice words, 40 tricky words and 5 stories.

What a child does:

- Stage 0 has no letters. Tapi asks which picture rhymes, how many claps a word has, which picture starts with a sound, and which picture matches some blended sounds.
- From Stage 1, each lesson introduces its new sounds, then runs the word loop for 5 to 8 words: the word is read aloud, splits into tiles, the next slot glows, dragging a tile plays its sound, a wrong tile bounces back gently, then the sounds blend and the word comes alive.
- Tricky words skip the tiles. Tapi shows and says the word, then the child finds it among three cards.
- Stage 3 tiles carry two or three letters (n, igh, t). Stage 4 clusters stay as separate tiles (f, r, o, g). Stage 5 split spellings like a-e are one linked tile: in "cake" the a and the e sit on either side of the k, joined by a curved line.
- Each island ends with a short story. The child taps any word to hear it blended, or has the page read aloud.
- Stars depend on how many tries a word took. Nothing is lost, and there are no timers or buzzers.
- If a child misses the same sound three times in a lesson, the next lesson opens with a couple of earlier words that use it.

For grown-ups (hold the Grown-ups button for 3 seconds):

- Add a child and either play the placement game or pick a stage. The placement game has four checks (rhyme, then sat/pin/dog, then shop/chip, then rain/boat), stops after two misses in a row, and starts the child at the last check passed.
- Each child's page shows sounds and tricky words learned, sounds worth practising, stories read and minutes played this week. You can move a child up or down a stage, rerun the placement game, change the volume, rename or delete.

## Before children use it

- **There's no real audio yet.** The app plays human recordings when they exist and falls back to the device's computer voice. Computer voices add an "uh" to short sounds like t and p, which breaks blending, so the stand-in is only for testing. The app needs 802 recordings in total. The checklist on any child's page lists every file name and what to say.
- **The artwork is a placeholder.** Tapi is an SVG drawn from the Stitch mock-ups. Word pictures and avatars are emoji, which look different on each device.
- **Some word lists need checking.** The Stage 4 and Stage 5 tricky words come from memory in the lesson plan, not from a verified source. Check them against the original Letters and Sounds document.
- **Some rules are my guesses, to tune with real children.** That covers the star cut-offs, the review threshold of 3, and how a placement miss is counted: a wrong first pick, or more than one wrong tile.
- **Stage 0 has no everyday sound effects yet.** Letters and Sounds Phase 1 includes environmental sounds (a doorbell, a dog barking). Those need sound-effect recordings.
- **Two lessons go over the plan's sound count.** Stage 1 lesson 1 introduces 4 sounds (s a t p) and lesson 9 introduces 3 (f ff l). The plan says 1 or 2 per lesson, but there aren't enough real words otherwise.

## Adding recordings

1. Open a child in the grown-up area and use "Download checklist (CSV)" or "Copy for a spreadsheet".
2. Save each recording as `public/audio/<set>/<name>.mp3`, using the exact file name from the checklist. The sets are `sounds`, `words`, `blends`, `tapi` and `stories`.
3. Run `npm run audio:manifest` so the app knows which files exist, then rebuild.

## Running it

You need Node 20 or newer.

```
npm install
npm run dev        # local development
npm test           # curriculum, game rules and progress tests
npm run build      # production build in dist/, installable and offline
npm run preview    # serve the production build
```

`npx vite build --mode artifact` makes a copy in `dist-artifact/` without the offline installer, for hosts that can't run one. `node scripts/make-artifact-page.mjs` then turns it into a page for a claude.ai artifact.

The build is a static web app. It can go on any static host, and it can be wrapped for the App Store and Google Play later (for example with Capacitor). That wrapping isn't set up yet.

## Where things live

- `src/curriculum/english/` has the lessons. `sounds.ts` is the spelling table, `lessons.ts` holds Stages 1 to 5, `stage0.ts` the listening games and `stories.ts` the stories. Each word is written as its tiles: `w('kick', 'k i ck')`, `w('book', 'b oo:oo_short k')` for a second sound, `w('cake', 'c a-e k')` for a split spelling.
- `src/engine/` has the game rules: tiles, stars, review words, the placement game and progress summaries. It has no UI code.
- `src/audio/` plays recordings and falls back to the computer voice.
- `src/store/` keeps profiles and progress in the browser's local storage. Nothing leaves the device.
- `src/screens/` holds the screens, and `src/components/` the shared pieces.
- `design/stitch/` has the screenshots and HTML exported from the Stitch project "Tapi Kids Literacy App".

Run `npm test` after changing any lesson. The tests check that:

- Every word uses only sounds already taught.
- The tiles spell the word exactly.
- No two consonants sit side by side before Stage 4 (except "and", which Letters and Sounds allows early).
- Each lesson has 5 to 8 words.
- Every story can be read with what the child knows by the end of its island.

## Other notes

- French was removed in this version. Profiles saved by the earlier English and French build keep their English progress.
- `npm audit` reports issues in the development tools (Vitest and the Vite dev server). None of them ship in the built app, which has no known issues.
- The open items in the lesson plan still stand, especially the licence check for Letters and Sounds.
