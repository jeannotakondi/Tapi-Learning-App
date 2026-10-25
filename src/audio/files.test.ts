import { describe, expect, it } from 'vitest';
import { exampleFileKey, fileKey, recordingChecklistCsv, requiredClips } from './files';

describe('audio files', () => {
  it('gives every recording a distinct, safe file name', () => {
    const clips = requiredClips();
    const paths = clips.map((c) => `${c.kind}/${c.key}`);
    expect(new Set(paths).size).toBe(paths.length);
    for (const c of clips) expect(c.key).toMatch(/^[a-z0-9_-]+$/);
  });

  it('keeps intro words apart from lesson words', () => {
    expect(exampleFileKey('oo:oo_short')).toBe('example-oo_oo_short');
    expect(fileKey('Mr')).toBe('mr');
  });

  it('lists one sound recording per sound, not per spelling', () => {
    const sounds = requiredClips()
      .filter((c) => c.kind === 'sounds')
      .map((s) => s.key);
    expect(sounds).toContain('k');
    expect(sounds).not.toContain('ck');
    expect(sounds).toContain('oo_short');
  });

  it('includes tricky words, listening game words and story pages', () => {
    const keys = requiredClips().map((c) => `${c.kind}/${c.key}`);
    expect(keys).toContain('words/the');
    expect(keys).toContain('words/butterfly');
    expect(keys).toContain('stories/story-1-p1');
  });

  it('marks what is already recorded in the checklist', () => {
    const clips = requiredClips().slice(0, 2);
    const csv = recordingChecklistCsv(clips, { sounds: { s: 's.mp3' } });
    expect(csv.split('\n')[1]).toContain('"yes"');
    expect(csv.split('\n')[2]).toContain('"no"');
  });
});
