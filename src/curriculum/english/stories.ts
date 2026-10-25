import { makeWordBuilder } from '../build';
import type { Story, Word } from '../types';
import { graphemes } from './sounds';

const w = makeWordBuilder(graphemes);

/**
 * Story words that aren't lesson words, with their tiles, so tests can prove
 * every story only uses sounds the child has learned by the end of that stage.
 */
export const storyWords: Word[] = [
  w('a', 'a'),
  w('and', 'a n d'),
  w('ran', 'r a n'),
  w('had', 'h a d'),
  w('hit', 'h i t'),
  w('rock', 'r o ck'),
  w('chat', 'ch a t'),
  w('with', 'w i th:th_voiced'),
  w('barn', 'b ar n'),
  w('good', 'g oo:oo_short d'),
  w('went', 'w e n t'),
  w('pond', 'p o n d'),
  w('ducks', 'd u ck s'),
  w('swam', 's w a m'),
  w('felt', 'f e l t'),
  w('plan', 'p l a n'),
  w('sang', 's a ng'),
  w('glad', 'g l a d'),
  w('wind', 'w i n d'),
  w('took', 't oo:oo_short k'),
  w('flew', 'f l ew'),
  w('clouds', 'c l ou d s'),
  w('gave', 'g a-e v'),
  w('came', 'c a-e m'),
  w('thank', 'th a n k'),
  w('away', 'a w ay'),
];

export const stories: Story[] = [
  {
    id: 'story-1',
    stage: 1,
    title: 'The cat and the dog',
    pages: [
      { text: 'The cat sat on a mat.', picture: '🐱' },
      { text: 'A big dog ran to the cat.', picture: '🐶' },
      { text: 'The cat got up on a log.', picture: '🪵' },
      { text: 'The dog sat in the mud.', picture: '🐶' },
      { text: 'The cat and the dog nap in the sun.', picture: '☀️' },
    ],
  },
  {
    id: 'story-2',
    stage: 2,
    title: 'The ship and the fish',
    pages: [
      { text: 'A man had a red ship.', picture: '🚢' },
      { text: 'He had a big dog.', picture: '🐶' },
      { text: 'The ship hit a rock and the dog fell in.', picture: '🪨' },
      { text: 'Six fish got the dog to the ship.', picture: '🐟' },
      { text: 'The man had a quick chat with the fish.', picture: '🐠' },
    ],
  },
  {
    id: 'story-3',
    stage: 3,
    title: 'Night on the farm',
    pages: [
      { text: 'It was night on the farm.', picture: '🌙' },
      { text: 'The moon was high and the owl was up.', picture: '🦉' },
      { text: 'The cow and the goat are in the barn.', picture: '🐄' },
      { text: 'The pig was in the mud.', picture: '🐷' },
      { text: 'Then they all had a good night.', picture: '😴' },
    ],
  },
  {
    id: 'story-4',
    stage: 4,
    title: 'The frog and the drum',
    pages: [
      { text: 'A little frog had a red drum.', picture: '🐸' },
      { text: 'The frog went to the pond.', picture: '🥁' },
      { text: 'Bang! The fish and the ducks swam up.', picture: '🦆' },
      { text: 'Stop the drum! said the crab.', picture: '🦀' },
      { text: 'The frog felt sad. Then the crab had a plan.', picture: '💡' },
      { text: 'They all sang and the frog was glad.', picture: '🎵' },
    ],
  },
  {
    id: 'story-5',
    stage: 5,
    title: 'The boy and the kite',
    pages: [
      { text: 'A boy had a blue kite.', picture: '🪁' },
      { text: 'One day the wind took the kite away.', picture: '💨' },
      { text: 'It flew high in the clouds.', picture: '☁️' },
      { text: 'The boy gave a shout.', picture: '📣' },
      { text: 'A bird came and the kite came down with it.', picture: '🐦' },
      { text: 'The boy said thank you to the bird.', picture: '👦' },
    ],
  },
];

/** Splits a page into words for tapping, keeping punctuation off the word. */
export function storyTokens(text: string): Array<{ word: string; key: string; trailing: string }> {
  return text.split(' ').map((raw) => {
    const match = raw.match(/^([A-Za-z]+)(.*)$/)!;
    return { word: match[1], key: match[1].toLowerCase(), trailing: match[2] };
  });
}
