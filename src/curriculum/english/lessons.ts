import { makeWordBuilder, tricky } from '../build';
import type { Lesson, TrickyWord, Word } from '../types';
import { graphemes } from './sounds';

const w = makeWordBuilder(graphemes);

const lesson = (
  stage: number,
  n: number,
  newGraphemes: string[],
  words: Word[],
  trickyWords: TrickyWord[] = [],
  focus?: Lesson['focus'],
): Lesson => ({
  id: `${stage}-${n}`,
  stage,
  newGraphemes,
  words,
  tricky: trickyWords,
  activities: [],
  ...(focus ? { focus } : {}),
});

/**
 * Stage 1: Letters and Sounds Phase 2. Lesson 1 brings in all of Set 1
 * (s a t p) and lesson 9 three spellings, because one or two sounds alone
 * can't make enough real words. The rest take the sets two at a time.
 */
export const stage1Lessons: Lesson[] = [
  lesson(1, 1, ['s', 'a', 't', 'p'], [w('at', 'a t'), w('sat', 's a t'), w('pat', 'p a t'), w('tap', 't a p', '🚰'), w('sap', 's a p')]),
  lesson(1, 2, ['i', 'n'], [
    w('in', 'i n'), w('it', 'i t'), w('pin', 'p i n', '📌'), w('tin', 't i n', '🥫'),
    w('sit', 's i t', '🪑'), w('nap', 'n a p', '😴'), w('tip', 't i p'),
  ]),
  lesson(1, 3, ['m', 'd'], [
    w('map', 'm a p', '🗺️'), w('man', 'm a n', '👨'), w('mat', 'm a t'), w('dad', 'd a d', '👨‍👧'),
    w('sad', 's a d', '😢'), w('dip', 'd i p'),
  ], tricky('the', 'to')),
  lesson(1, 4, ['g', 'o'], [
    w('dog', 'd o g', '🐶'), w('pig', 'p i g', '🐷'), w('dig', 'd i g', '⛏️'), w('pot', 'p o t', '🍯'),
    w('top', 't o p'), w('on', 'o n'), w('got', 'g o t'),
  ]),
  lesson(1, 5, ['c', 'k'], [
    w('cat', 'c a t', '🐱'), w('cap', 'c a p', '🧢'), w('cot', 'c o t', '🛏️'), w('can', 'c a n'),
    w('kid', 'k i d', '🧒'), w('kit', 'k i t'),
  ], tricky('I')),
  lesson(1, 6, ['ck', 'e'], [
    w('sock', 's o ck', '🧦'), w('kick', 'k i ck', '🦵'), w('ten', 't e n', '🔟'), w('pet', 'p e t'),
    w('neck', 'n e ck'), w('get', 'g e t'), w('deck', 'd e ck'),
  ]),
  lesson(1, 7, ['u', 'r'], [
    w('sun', 's u n', '☀️'), w('cup', 'c u p', '☕'), w('run', 'r u n', '🏃'), w('rat', 'r a t', '🐀'),
    w('red', 'r e d', '🔴'), w('mud', 'm u d'), w('up', 'u p'),
  ]),
  lesson(1, 8, ['h', 'b'], [
    w('hat', 'h a t', '👒'), w('bed', 'b e d', '🛏️'), w('bus', 'b u s', '🚌'), w('hug', 'h u g', '🤗'),
    w('hot', 'h o t', '🔥'), w('bag', 'b a g', '👜'), w('big', 'b i g'),
  ], tricky('go', 'no')),
  lesson(1, 9, ['f', 'ff', 'l'], [
    w('fun', 'f u n'), w('fan', 'f a n'), w('leg', 'l e g', '🦵'), w('lip', 'l i p', '👄'),
    w('log', 'l o g', '🪵'), w('off', 'o ff'), w('puff', 'p u ff'),
  ]),
  lesson(1, 10, ['ll', 'ss'], [
    w('bell', 'b e ll', '🔔'), w('hill', 'h i ll', '⛰️'), w('doll', 'd o ll', '🪆'), w('kiss', 'k i ss', '😘'),
    w('mess', 'm e ss'), w('fell', 'f e ll'), w('less', 'l e ss'),
  ]),
]; // prettier-ignore

/** Stage 2: Letters and Sounds Phase 3, first part. */
export const stage2Lessons: Lesson[] = [
  lesson(2, 1, ['j', 'v'], [
    w('jam', 'j a m'), w('jet', 'j e t', '✈️'), w('jug', 'j u g'), w('jog', 'j o g'),
    w('van', 'v a n', '🚐'), w('vet', 'v e t'),
  ], tricky('he', 'she')),
  lesson(2, 2, ['w', 'x'], [
    w('web', 'w e b', '🕸️'), w('wet', 'w e t'), w('wig', 'w i g'), w('box', 'b o x', '📦'),
    w('fox', 'f o x', '🦊'), w('six', 's i x', '6️⃣'), w('mix', 'm i x'),
  ]),
  lesson(2, 3, ['y', 'z', 'zz'], [
    w('yes', 'y e s'), w('yum', 'y u m', '😋'), w('yell', 'y e ll'), w('zip', 'z i p'),
    w('zap', 'z a p'), w('buzz', 'b u zz', '🐝'), w('fizz', 'f i zz'),
  ], tricky('we', 'me')),
  lesson(2, 4, ['qu', 'ch'], [
    w('quiz', 'qu i z'), w('quick', 'qu i ck'), w('quack', 'qu a ck', '🦆'), w('chip', 'ch i p', '🍟'),
    w('chop', 'ch o p'), w('chin', 'ch i n'), w('rich', 'r i ch'),
  ]),
  lesson(2, 5, ['sh'], [
    w('ship', 'sh i p', '🚢'), w('shop', 'sh o p', '🛍️'), w('fish', 'f i sh', '🐟'), w('dish', 'd i sh'),
    w('cash', 'c a sh', '💷'), w('shed', 'sh e d'), w('shell', 'sh e ll', '🐚'),
  ], tricky('be')),
  lesson(2, 6, ['th', 'th:th_voiced'], [
    w('thin', 'th i n'), w('thick', 'th i ck'), w('moth', 'm o th'), w('this', 'th:th_voiced i s'),
    w('that', 'th:th_voiced a t'), w('then', 'th:th_voiced e n'), w('them', 'th:th_voiced e m'),
  ]),
  lesson(2, 7, ['ng'], [
    w('ring', 'r i ng', '💍'), w('sing', 's i ng', '🎤'), w('king', 'k i ng', '👑'), w('long', 'l o ng'),
    w('bang', 'b a ng', '💥'), w('song', 's o ng', '🎵'), w('wing', 'w i ng'),
  ]),
]; // prettier-ignore

/** Stage 3: Letters and Sounds Phase 3, second part. Tiles carry two or three letters. */
export const stage3Lessons: Lesson[] = [
  lesson(3, 1, ['ai', 'ee'], [
    w('rain', 'r ai n', '🌧️'), w('tail', 't ai l'), w('nail', 'n ai l', '💅'), w('wait', 'w ai t'),
    w('feet', 'f ee t', '🦶'), w('bee', 'b ee', '🐝'), w('seed', 's ee d', '🌱'), w('sheep', 'sh ee p', '🐑'),
  ], tricky('was', 'you')),
  lesson(3, 2, ['igh', 'oa'], [
    w('night', 'n igh t', '🌙'), w('light', 'l igh t', '💡'), w('high', 'h igh'), w('boat', 'b oa t', '⛵'),
    w('goat', 'g oa t', '🐐'), w('coat', 'c oa t', '🧥'), w('soap', 's oa p', '🧼'),
  ]),
  lesson(3, 3, ['oo', 'oo:oo_short'], [
    w('moon', 'm oo n', '🌕'), w('zoo', 'z oo', '🦓'), w('food', 'f oo d', '🍲'), w('boot', 'b oo t', '👢'),
    w('book', 'b oo:oo_short k', '📖'), w('look', 'l oo:oo_short k', '👀'), w('cook', 'c oo:oo_short k', '🧑‍🍳'),
  ], tricky('they', 'all')),
  lesson(3, 4, ['ar', 'or'], [
    w('car', 'c ar', '🚗'), w('park', 'p ar k'), w('farm', 'f ar m', '🚜'), w('fork', 'f or k', '🍴'),
    w('corn', 'c or n', '🌽'), w('horn', 'h or n', '📯'), w('short', 'sh or t'),
  ]),
  lesson(3, 5, ['ur', 'ow'], [
    w('turn', 't ur n'), w('fur', 'f ur'), w('hurt', 'h ur t'), w('cow', 'c ow', '🐄'),
    w('owl', 'ow l', '🦉'), w('town', 't ow n'), w('down', 'd ow n', '👇'),
  ], tricky('are')),
  lesson(3, 6, ['oi', 'ear'], [
    w('coin', 'c oi n', '🪙'), w('oil', 'oi l'), w('boil', 'b oi l'), w('join', 'j oi n'),
    w('ear', 'ear', '👂'), w('hear', 'h ear'), w('beard', 'b ear d', '🧔'),
  ]),
  lesson(3, 7, ['air', 'ure', 'er'], [
    w('hair', 'h air', '💇'), w('chair', 'ch air', '🪑'), w('pair', 'p air', '🧦'), w('cure', 'c ure'),
    w('farmer', 'f ar m er', '🧑‍🌾'), w('corner', 'c or n er'), w('boxer', 'b o x er', '🥊'),
  ], tricky('my', 'her')),
]; // prettier-ignore

/**
 * Stage 4: Letters and Sounds Phase 4. No new sounds: consonants side by side.
 * Clusters stay as separate tiles so children hear both sounds.
 * The tricky word list is from memory in the lesson plan and must be checked
 * against the original Letters and Sounds document.
 */
export const stage4Lessons: Lesson[] = [
  lesson(4, 1, [], [
    w('tent', 't e n t', '⛺'), w('milk', 'm i l k', '🥛'), w('hand', 'h a n d', '✋'), w('jump', 'j u m p'),
    w('lamp', 'l a m p'), w('belt', 'b e l t'), w('nest', 'n e s t', '🪺'),
  ], tricky('said', 'have', 'like', 'so'), 'clusters'),
  lesson(4, 2, [], [
    w('frog', 'f r o g', '🐸'), w('stop', 's t o p', '🛑'), w('crab', 'c r a b', '🦀'), w('drum', 'd r u m', '🥁'),
    w('flag', 'f l a g', '🚩'), w('swim', 's w i m', '🏊'), w('plug', 'p l u g', '🔌'),
  ], tricky('do', 'some', 'come', 'were'), 'clusters'),
  lesson(4, 3, [], [
    w('crisp', 'c r i s p'), w('train', 't r ai n', '🚂'), w('sweet', 's w ee t', '🍬'), w('spoon', 's p oo n', '🥄'),
    w('chimp', 'ch i m p', '🐒'), w('float', 'f l oa t'), w('bring', 'b r i ng'),
  ], tricky('there', 'little', 'one'), 'clusters'),
  lesson(4, 4, [], [
    w('helmet', 'h e l m e t', '⛑️'), w('sunlight', 's u n l igh t'), w('treetop', 't r ee t o p'),
    w('lunchbox', 'l u n ch b o x'), w('windmill', 'w i n d m i ll'), w('carpet', 'c ar p e t'),
  ], tricky('when', 'out', 'what'), 'clusters'),
]; // prettier-ignore

/**
 * Stage 5: Letters and Sounds Phase 5. Other spellings for known sounds.
 * Split spellings (a-e) are one linked tile. The tricky words here are not
 * from a verified source and must be checked before recording.
 */
export const stage5Lessons: Lesson[] = [
  lesson(5, 1, ['ay', 'ou'], [
    w('day', 'd ay'), w('play', 'p l ay'), w('tray', 't r ay'), w('say', 's ay'),
    w('cloud', 'c l ou d', '☁️'), w('shout', 'sh ou t', '📣'), w('mouth', 'm ou th', '👄'),
  ], tricky('oh', 'their')),
  lesson(5, 2, ['ie', 'ea'], [
    w('pie', 'p ie', '🥧'), w('tie', 't ie', '👔'), w('cried', 'c r ie d', '😭'), w('sea', 's ea', '🌊'),
    w('leaf', 'l ea f', '🍃'), w('dream', 'd r ea m'), w('team', 't ea m'),
  ], tricky('people')),
  lesson(5, 3, ['oy', 'ir'], [
    w('boy', 'b oy', '👦'), w('toy', 't oy', '🧸'), w('enjoy', 'e n j oy'), w('girl', 'g ir l', '👧'),
    w('bird', 'b ir d', '🐦'), w('shirt', 'sh ir t', '👕'), w('first', 'f ir s t', '🥇'),
  ], tricky('Mr', 'Mrs')),
  lesson(5, 4, ['ue', 'ue:yoo', 'aw'], [
    w('blue', 'b l ue', '🔵'), w('glue', 'g l ue'), w('true', 't r ue'), w('rescue', 'r e s c ue:yoo', '🛟'),
    w('saw', 's aw', '🪚'), w('paw', 'p aw', '🐾'), w('draw', 'd r aw', '✏️'),
  ]),
  lesson(5, 5, ['wh', 'ph'], [
    w('whip', 'wh i p'), w('wheel', 'wh ee l', '🛞'), w('whisk', 'wh i s k'), w('which', 'wh i ch'),
    w('dolphin', 'd o l ph i n', '🐬'), w('elephant', 'e l e ph a n t', '🐘'),
  ], tricky('looked')),
  lesson(5, 6, ['ew', 'ew:yoo', 'oe'], [
    w('chew', 'ch ew'), w('grew', 'g r ew', '🌱'), w('new', 'n ew:yoo', '🆕'), w('few', 'f ew:yoo'),
    w('stew', 's t ew:yoo', '🍲'), w('toe', 't oe', '🦶'), w('hoe', 'h oe'),
  ], tricky('called')),
  lesson(5, 7, ['au', 'ey'], [
    w('launch', 'l au n ch', '🚀'), w('haunt', 'h au n t', '👻'), w('haul', 'h au l'), w('key', 'k ey', '🔑'),
    w('donkey', 'd o n k ey', '🫏'), w('chimney', 'ch i m n ey'), w('turkey', 't ur k ey', '🦃'),
  ], tricky('asked')),
  lesson(5, 8, ['a-e', 'e-e'], [
    w('cake', 'c a-e k', '🎂'), w('bake', 'b a-e k'), w('gate', 'g a-e t'), w('snake', 's n a-e k', '🐍'),
    w('game', 'g a-e m', '🎲'), w('theme', 'th e-e m'), w('complete', 'c o m p l e-e t'),
  ], tricky('could')),
  lesson(5, 9, ['i-e', 'o-e'], [
    w('bike', 'b i-e k', '🚲'), w('kite', 'k i-e t', '🪁'), w('time', 't i-e m', '⏰'), w('five', 'f i-e v', '5️⃣'),
    w('home', 'h o-e m', '🏠'), w('bone', 'b o-e n', '🦴'), w('rope', 'r o-e p'),
  ]),
  lesson(5, 10, ['u-e', 'u-e:oo'], [
    w('cube', 'c u-e b', '🧊'), w('tube', 't u-e b'), w('mule', 'm u-e l'), w('rude', 'r u-e:oo d'),
    w('flute', 'f l u-e:oo t', '🪈'), w('prune', 'p r u-e:oo n'),
  ]),
]; // prettier-ignore
