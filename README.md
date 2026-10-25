# Tapi

Tapi teaches children aged 4 to 7 to read and spell in British English or French. A child drags sound tiles into slots to rebuild a word, hears the sounds blend together, and watches the word come alive. Parents use it at home and teachers can set it up for a class. It runs offline.

The teaching rules come from the lesson plan (October 2026):

1. Tiles say the letter's sound, never its name.
2. Words split into sound units, so "kick" is k, i, ck.
3. Every rebuilt word ends with blending: slowly, then faster, then the whole word.

## What works today

- Who is playing: one profile per child, with a 3 second hold to reach the grown-up area.
- Island map: six islands, one per stage, with the lessons for the current island.
- Lessons: the full word loop from the lesson plan. New sound intro, word read aloud, tiles scatter, the next slot glows, dragging a tile plays its sound, wrong tiles bounce back gently, blending, then a reward.
- Stars depend on how many tries a word took. Nothing is ever lost, and there are no timers or buzzers.
- The three misses rule: if a child misses the same sound three times in a lesson, the next lesson opens with a couple of earlier words that use it.
- Grown-up area: add, edit or delete children, switch language, move a child up or down a stage, set the volume, and see sounds learned, words built, sounds worth practising and minutes played over the last week.
- English Stage 1 (Letters and Sounds Phase 2) has 10 lessons. French Stage 1 (Eduscol steps 1 to 6) has 5 lessons, with syllable blending and island words.

## What is not built yet

- Stages 0 and 2 to 5 in both languages. They appear on the map as locked islands.
- The placement game. For now a grown-up picks the starting stage.
- Tricky words, the end-of-stage stories, and the split-digraph tile (a-e) for Stage 5.
- Real audio. See below.
- Final artwork. Tapi is an SVG I drew from the Stitch mock-ups, and the word pictures and avatars are emoji. The Stitch images are hosted on a Google server this build machine couldn't reach, so none of them are in the app.

## Audio

The lesson plan asks for real human recordings, and none exist yet. Until a file is added, the app falls back to the device's computer voice. That's fine for testing, but computer voices add an "uh" to short sounds like t and p, which breaks blending. Don't put it in front of children like that.

To add recordings:

1. In the grown-up area, open a child and tap "Recording checklist (CSV)". It lists every file, what to say, and whether it already exists.
2. Save each recording as `public/audio/<en|fr>/<sounds|words|blends|tapi>/<name>.mp3`, using the exact name from the checklist.
3. Run `npm run audio:manifest` so the app knows which files exist, then rebuild.

The French lines Tapi says (in `src/audio/lines.ts`) should be checked by a native speaker before recording.

## Running it

You need Node 20 or newer.

```
npm install
npm run dev        # local development
npm test           # curriculum, game logic and progress tests
npm run build      # production build in dist/, installable and offline
npm run preview    # serve the production build
```

The build is a static web app. It can go on any static host, and it can be wrapped for the App Store and Google Play later (for example with Capacitor). That wrapping isn't set up yet.

## Where things live

- `src/curriculum/` holds the lessons. Each word is written as its tiles, for example `w('kick', 'k i ck')`.
- `src/engine/` holds the game rules: placing tiles, stars, review words and progress summaries. It has no UI code.
- `src/audio/` plays recordings and falls back to the computer voice.
- `src/store/` keeps profiles and progress in the browser's local storage. Nothing leaves the device.
- `src/screens/` holds the screens, and `src/components/` the shared pieces.
- `design/stitch/` has the screenshots and HTML exported from the Stitch project "Tapi Kids Literacy App".

The curriculum tests check each lesson against the plan: every word uses only sounds taught so far, tiles spell the word exactly, and each lesson has 5 to 8 words. Run `npm test` after changing any lesson.

## Things to know

- English lesson 1 introduces 4 sounds (s a t p) and lesson 9 introduces 3 (f ff l). The plan says 1 or 2 per lesson, but with so few letters there aren't enough real words to practise. The other lessons take the Phase 2 sets two sounds at a time, in the same order.
- The star cut-offs (3 stars for no slips, 2 for one or two, 1 for more) and the review threshold of 3 are starting points to tune after testing with children.
- `npm audit` reports issues in the development tools (Vitest and the Vite dev server). None of them ship in the built app, which has no known issues. Those tools are pinned to older versions, and upgrading them is a separate job.
- The open items in the lesson plan still stand, especially the licence checks for Letters and Sounds and the Eduscol progression.
