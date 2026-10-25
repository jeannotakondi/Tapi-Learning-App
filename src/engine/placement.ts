import { type Choice, lexicon, type Word } from '../curriculum';

/**
 * Placement game from the lesson plan. Four checks, climbing in difficulty.
 * It stops after two misses in a row, and the child starts at the stage of
 * the last check they passed (Stage 0 if they miss the first).
 *
 * How a miss is counted is my reading of the plan, to tune after testing:
 * a listening item is missed if the first pick is wrong, and a word is missed
 * if it takes more than one wrong tile. A check passes when none of its items
 * are missed.
 */
export type PlacementItem = { kind: 'rhyme'; target: Choice; options: Choice[] } | { kind: 'build'; word: Word };

export interface PlacementCheck {
  passStage: number;
  items: PlacementItem[];
}

const word = (text: string) => lexicon.get(text)!;

export const PLACEMENT_CHECKS: PlacementCheck[] = [
  {
    passStage: 1,
    items: [
      {
        kind: 'rhyme',
        target: { word: 'cat', picture: '🐱' },
        options: [
          { word: 'hat', picture: '👒', correct: true },
          { word: 'dog', picture: '🐶' },
        ],
      },
      {
        kind: 'rhyme',
        target: { word: 'king', picture: '👑' },
        options: [
          { word: 'moon', picture: '🌕' },
          { word: 'ring', picture: '💍', correct: true },
        ],
      },
    ],
  },
  {
    passStage: 2,
    items: [
      { kind: 'build', word: word('sat') },
      { kind: 'build', word: word('pin') },
      { kind: 'build', word: word('dog') },
    ],
  },
  {
    passStage: 3,
    items: [
      { kind: 'build', word: word('shop') },
      { kind: 'build', word: word('chip') },
    ],
  },
  {
    passStage: 4,
    items: [
      { kind: 'build', word: word('rain') },
      { kind: 'build', word: word('boat') },
    ],
  },
];

export const MAX_WRONG_TILES_TO_PASS = 1;

export interface PlacementState {
  checkIndex: number;
  itemIndex: number;
  missesInARow: number;
  /** Whether each check so far had no misses. */
  checkPassed: boolean[];
  finished: boolean;
}

export function startPlacement(): PlacementState {
  return { checkIndex: 0, itemIndex: 0, missesInARow: 0, checkPassed: [], finished: false };
}

export function currentItem(state: PlacementState): PlacementItem | undefined {
  return PLACEMENT_CHECKS[state.checkIndex]?.items[state.itemIndex];
}

export function recordPlacementItem(state: PlacementState, passed: boolean): PlacementState {
  const missesInARow = passed ? 0 : state.missesInARow + 1;
  const checkPassed = [...state.checkPassed];
  checkPassed[state.checkIndex] = (checkPassed[state.checkIndex] ?? true) && passed;

  let { checkIndex, itemIndex } = state;
  itemIndex++;
  if (itemIndex >= PLACEMENT_CHECKS[checkIndex].items.length) {
    checkIndex++;
    itemIndex = 0;
  }
  const finished = missesInARow >= 2 || checkIndex >= PLACEMENT_CHECKS.length;
  return { checkIndex, itemIndex, missesInARow, checkPassed, finished };
}

/** Stage of the last check passed, or 0. */
export function placementStage(state: PlacementState): number {
  let stage = 0;
  state.checkPassed.forEach((passed, i) => {
    // A check cut short by two misses in a row doesn't count as passed.
    const complete = i < state.checkIndex || (i === state.checkIndex && state.itemIndex === 0);
    if (passed && complete) stage = PLACEMENT_CHECKS[i].passStage;
  });
  return stage;
}
