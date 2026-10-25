import { describe, expect, it } from 'vitest';
import { tracks } from '../curriculum';
import { recordingChecklistCsv, requiredClips, wordFileKey } from './files';

describe('audio files', () => {
  it('gives accented words safe, distinct file names', () => {
    expect(wordFileKey({ text: 'élu' })).toBe('e_acutelu');
    expect(wordFileKey({ text: 'ré' })).not.toBe(wordFileKey({ text: 're' }));
    expect(wordFileKey({ text: 'cat' })).toBe('cat');
  });

  it('has no clashing file names within a set', () => {
    for (const track of Object.values(tracks)) {
      const clips = requiredClips(track);
      const paths = clips.map((c) => `${c.kind}/${c.key}`);
      expect(new Set(paths).size).toBe(paths.length);
    }
  });

  it('lists one sound recording per sound, not per spelling', () => {
    const sounds = requiredClips(tracks.en).filter((c) => c.kind === 'sounds');
    expect(sounds.map((s) => s.key)).toContain('k');
    expect(sounds.map((s) => s.key)).not.toContain('ck');
  });

  it('marks what is already recorded in the checklist', () => {
    const clips = requiredClips(tracks.en).slice(0, 2);
    const csv = recordingChecklistCsv(clips, { en: { sounds: { s: 's.mp3' } } });
    expect(csv.split('\n')[1]).toContain('"yes"');
    expect(csv.split('\n')[2]).toContain('"no"');
  });
});
