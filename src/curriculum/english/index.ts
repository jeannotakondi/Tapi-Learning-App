import type { Stage, Track } from '../types';
import { stage1Lessons, stage2Lessons, stage3Lessons, stage4Lessons, stage5Lessons } from './lessons';
import { graphemes, sounds } from './sounds';
import { stage0Lessons } from './stage0';
import { stories } from './stories';

const storyFor = (stage: number) => stories.find((s) => s.stage === stage);

const stages: Stage[] = [
  { index: 0, land: 'whisper-beach', title: 'Listening', source: 'Letters and Sounds, Phase 1', lessons: stage0Lessons },
  { index: 1, land: 'first-sound-forest', title: 'First sounds', source: 'Letters and Sounds, Phase 2', lessons: stage1Lessons },
  { index: 2, land: 'echo-hills', title: 'New consonants', source: 'Letters and Sounds, Phase 3 (first part)', lessons: stage2Lessons },
  { index: 3, land: 'rainbow-river', title: 'Vowel teams', source: 'Letters and Sounds, Phase 3 (second part)', lessons: stage3Lessons },
  { index: 4, land: 'windy-cliffs', title: 'Clusters', source: 'Letters and Sounds, Phase 4', lessons: stage4Lessons },
  { index: 5, land: 'singing-mountain', title: 'Other spellings', source: 'Letters and Sounds, Phase 5', lessons: stage5Lessons },
].map((stage) => ({ ...stage, ...(storyFor(stage.index) ? { story: storyFor(stage.index) } : {}) })) as Stage[];

/** British English track, following the order of Letters and Sounds (DfES, 2007). */
export const english: Track = { sounds, graphemes, stages };
