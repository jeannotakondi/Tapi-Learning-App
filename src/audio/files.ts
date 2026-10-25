import { allLessons, allStories, LAND_NAMES, lexicon, track } from '../curriculum';
import { TAPI_LINES } from './lines';

export type ClipKind = 'sounds' | 'words' | 'blends' | 'tapi' | 'stories';

export type AudioManifest = Partial<Record<ClipKind, Record<string, string>>>;

/** Safe file name for a word or spelling: "a-e" stays "a-e", "Mr" becomes "mr". */
export function fileKey(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
}

/** Intro word for a spelling ("snake" for s). Prefixed so it can't clash with lesson words. */
export function exampleFileKey(graphemeKey: string): string {
  return `example-${fileKey(graphemeKey.replace(':', '_'))}`;
}

export function storyPageKey(storyId: string, page: number): string {
  return `${storyId}-p${page + 1}`;
}

export interface RequiredClip {
  kind: ClipKind;
  key: string;
  /** What the speaker should say. */
  script: string;
}

/** Every recording the app needs, in a stable order and without duplicates. */
export function requiredClips(): RequiredClip[] {
  const clips = new Map<string, RequiredClip>();
  const add = (clip: RequiredClip) => {
    const id = `${clip.kind}/${clip.key}`;
    if (!clips.has(id)) clips.set(id, clip);
  };
  const lessons = allLessons();

  for (const sound of Object.values(track.sounds)) {
    const example = Object.values(track.graphemes).find((g) => g.sound === sound.id)?.example ?? sound.id;
    add({ kind: 'sounds', key: sound.id, script: `The sound alone, never the letter name, as heard in "${example}". Record 3 takes.` });
  }
  for (const [key, grapheme] of Object.entries(track.graphemes)) {
    add({ kind: 'words', key: exampleFileKey(key), script: grapheme.example });
  }
  for (const word of lexicon.values()) {
    add({ kind: 'words', key: fileKey(word.text), script: word.text });
  }
  for (const lesson of lessons) {
    for (const t of lesson.tricky) add({ kind: 'words', key: fileKey(t.text), script: t.text });
    for (const a of lesson.activities) {
      const choices = a.kind === 'claps' ? [a.target] : a.kind === 'rhyme' ? [a.target, ...a.options] : a.options;
      for (const c of choices) add({ kind: 'words', key: fileKey(c.word), script: c.word });
    }
  }
  for (const word of lexicon.values()) {
    const parts = word.tiles.map((t) => t.grapheme.replace(/^([a-z])-e$/, '$1_e'));
    add({ kind: 'blends', key: fileKey(word.text), script: `Slowly: ${parts.join('… ')}… then a little faster, in one take` });
  }
  for (const [id, text] of Object.entries(TAPI_LINES)) add({ kind: 'tapi', key: id, script: text });
  for (const [id, name] of Object.entries(LAND_NAMES)) add({ kind: 'tapi', key: `land-${id}`, script: name });
  for (const story of allStories()) {
    add({ kind: 'stories', key: `${story.id}-title`, script: story.title });
    story.pages.forEach((page, i) => add({ kind: 'stories', key: storyPageKey(story.id, i), script: page.text }));
  }
  return [...clips.values()];
}

export function clipPath(kind: ClipKind, file: string): string {
  return `${import.meta.env.BASE_URL}audio/${kind}/${file}`;
}

/** Spreadsheet for the person recording audio: what to say and the exact file name. */
export function recordingChecklistCsv(clips: RequiredClip[], manifest: AudioManifest): string {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = clips.map((c) => {
    const recorded = Boolean(manifest[c.kind]?.[c.key]);
    return [c.kind, `${c.kind}/${c.key}.mp3`, c.script, recorded ? 'yes' : 'no'].map(escape).join(',');
  });
  return ['set,file,what to say,recorded', ...rows].join('\n');
}
