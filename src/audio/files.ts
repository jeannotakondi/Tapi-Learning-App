import { allLessons, type Language, type Track, type Word } from '../curriculum';
import { LAND_LINES, TAPI_LINES } from './lines';

export type ClipKind = 'sounds' | 'words' | 'blends' | 'tapi';

export type AudioManifest = Partial<Record<Language, Partial<Record<ClipKind, Record<string, string>>>>>;

const MARKS: Record<string, string> = {
  '́': '_acute',
  '̀': '_grave',
  '̂': '_circ',
  '̈': '_trema',
  '̧': '_cedil',
};

/**
 * ASCII file key for a word, so names survive every file system:
 * "élu" -> "e_acutelu", "garçon" -> "garc_cedilon".
 */
export function wordFileKey(word: Pick<Word, 'text'>): string {
  return word.text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, (mark) => MARKS[mark] ?? '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .toLowerCase();
}

/** Intro word for a sound ("snake" for s). Prefixed so it can't clash with lesson words. */
export function exampleFileKey(soundId: string): string {
  return `example-${soundId}`;
}

export interface RequiredClip {
  language: Language;
  kind: ClipKind;
  key: string;
  /** What the speaker should say. */
  script: string;
}

/** Every recording the current lessons need, in a stable order. */
export function requiredClips(track: Track): RequiredClip[] {
  const language = track.language;
  const clips: RequiredClip[] = [];
  const sounds = new Set<string>();
  for (const lesson of allLessons(track)) {
    for (const grapheme of lesson.newGraphemes) sounds.add(track.graphemeSounds[grapheme] ?? grapheme);
  }
  for (const id of sounds) {
    const sound = track.sounds[id];
    clips.push({
      language,
      kind: 'sounds',
      key: id,
      script: `The sound alone (not the letter name), e.g. as heard in "${sound?.example ?? id}". Record 3 takes.`,
    });
  }
  for (const id of sounds) {
    const sound = track.sounds[id];
    if (sound) clips.push({ language, kind: 'words', key: exampleFileKey(id), script: sound.example });
  }
  const words = allLessons(track).flatMap((l) => l.words);
  for (const word of words) {
    clips.push({ language, kind: 'words', key: wordFileKey(word), script: word.text });
  }
  for (const word of words) {
    const parts = word.syllables
      ? splitSyllables(word).map((s) => s.map((t) => t.grapheme).join(''))
      : word.tiles.filter((t) => !t.silent).map((t) => t.grapheme);
    clips.push({
      language,
      kind: 'blends',
      key: wordFileKey(word),
      script: `Slowly: ${parts.join('… ')}… then a little faster, in one take`,
    });
  }
  for (const [id, text] of Object.entries(TAPI_LINES)) {
    clips.push({ language, kind: 'tapi', key: id, script: text[language] });
  }
  for (const [id, text] of Object.entries(LAND_LINES)) {
    clips.push({ language, kind: 'tapi', key: `land-${id}`, script: text[language] });
  }
  return clips;
}

export function splitSyllables(word: Word): Word['tiles'][] {
  if (!word.syllables) return [word.tiles];
  const groups: Word['tiles'][] = [];
  let start = 0;
  for (const size of word.syllables) {
    groups.push(word.tiles.slice(start, start + size));
    start += size;
  }
  return groups;
}

export function clipPath(language: Language, kind: ClipKind, file: string): string {
  return `${import.meta.env.BASE_URL}audio/${language}/${kind}/${file}`;
}

/** Spreadsheet for the person recording audio: what to say and the exact file name. */
export function recordingChecklistCsv(clips: RequiredClip[], manifest: AudioManifest): string {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = clips.map((c) => {
    const recorded = Boolean(manifest[c.language]?.[c.kind]?.[c.key]);
    return [c.language, c.kind, `${c.language}/${c.kind}/${c.key}.mp3`, c.script, recorded ? 'yes' : 'no'].map(escape).join(',');
  });
  return ['language,set,file,what to say,recorded', ...rows].join('\n');
}
