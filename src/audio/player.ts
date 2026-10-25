import type { Language, Track, Word } from '../curriculum';
import { getState } from '../store/store';
import { type AudioManifest, type ClipKind, clipPath, exampleFileKey, splitSyllables, wordFileKey } from './files';
import { LAND_LINES, TAPI_LINES, type TapiLineId } from './lines';

const VOICE_LANG: Record<Language, string> = { en: 'en-GB', fr: 'fr-FR' };

let manifest: AudioManifest = {};
let manifestReady: Promise<void> | undefined;

export function loadManifest(): Promise<void> {
  manifestReady ??= fetch(`${import.meta.env.BASE_URL}audio/manifest.json`)
    .then((r) => (r.ok ? r.json() : {}))
    .then((m: AudioManifest) => {
      manifest = m;
    })
    .catch(() => {
      manifest = {};
    });
  return manifestReady;
}

export function getManifest(): AudioManifest {
  return manifest;
}

/** Bumped by stop(). A sequence checks it between steps so it can be cut short. */
let generation = 0;
let current: HTMLAudioElement | undefined;
let finishCurrent: (() => void) | undefined;

const volume = () => getState().settings.volume;

export function stopAudio() {
  generation++;
  current?.pause();
  current = undefined;
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  finishCurrent?.();
  finishCurrent = undefined;
}

function playFile(src: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(src);
    audio.volume = volume();
    current = audio;
    finishCurrent = resolve;
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
  });
}

function pickVoice(language: Language): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices();
  const exact = voices.find((v) => v.lang === VOICE_LANG[language]);
  return exact ?? voices.find((v) => v.lang.startsWith(language));
}

/** Stand-in until recordings exist. Never good enough for isolated sounds. */
function speakText(language: Language, text: string, rate = 0.85): Promise<void> {
  if (typeof speechSynthesis === 'undefined' || !text) return Promise.resolve();
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = VOICE_LANG[language];
    const voice = pickVoice(language);
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = 1.15;
    utterance.volume = volume();
    // Some browsers never fire "end", so don't wait forever.
    const timer = setTimeout(resolve, 1500 + text.length * 160);
    const done = () => {
      clearTimeout(timer);
      resolve();
    };
    finishCurrent = done;
    utterance.onend = done;
    utterance.onerror = done;
    speechSynthesis.speak(utterance);
  });
}

async function playClip(language: Language, kind: ClipKind, key: string, fallbackText: string, rate?: number) {
  await loadManifest();
  const file = manifest[language]?.[kind]?.[key];
  if (file) return playFile(clipPath(language, kind, file));
  return speakText(language, fallbackText, rate);
}

export function hasRecording(language: Language, kind: ClipKind, key: string): boolean {
  return Boolean(manifest[language]?.[kind]?.[key]);
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Runs steps in order; stops early if anything else calls stopAudio(). */
export async function sequence(steps: Array<() => Promise<void> | void>): Promise<boolean> {
  stopAudio();
  const mine = ++generation;
  for (const step of steps) {
    if (generation !== mine) return false;
    await step();
  }
  return generation === mine;
}

export const say = {
  tapi(language: Language, id: TapiLineId) {
    return playClip(language, 'tapi', id, TAPI_LINES[id][language]);
  },
  land(language: Language, landId: string) {
    return playClip(language, 'tapi', `land-${landId}`, LAND_LINES[landId]?.[language] ?? landId);
  },
  sound(track: Track, soundId: string) {
    return playClip(track.language, 'sounds', soundId, track.sounds[soundId]?.ttsHint ?? soundId, 0.7);
  },
  word(language: Language, word: Word) {
    return playClip(language, 'words', wordFileKey(word), word.text);
  },
  example(track: Track, soundId: string) {
    const example = track.sounds[soundId]?.example ?? '';
    return playClip(track.language, 'words', exampleFileKey(soundId), example);
  },
  text(language: Language, text: string) {
    return speakText(language, text);
  },
  /**
   * Blending, step 7 of the word loop. With a recording: the slow-then-faster
   * take. Without one: each sound (English) or syllable (French) with gaps.
   * onPart lets the screen light up the tiles being heard.
   */
  async blend(track: Track, word: Word, onPart?: (tileIndexes: number[]) => void) {
    const key = wordFileKey(word);
    if (hasRecording(track.language, 'blends', key)) {
      onPart?.(word.tiles.map((_, i) => i));
      await playClip(track.language, 'blends', key, '');
      onPart?.([]);
      return;
    }
    const groups = track.language === 'fr' ? splitSyllables(word) : word.tiles.map((t) => [t]);
    // Slowly, then faster, as the lesson plan describes.
    for (const gap of [450, 120]) {
      let index = 0;
      for (const group of groups) {
        const indexes = group.map((_, i) => index + i);
        index += group.length;
        onPart?.(indexes);
        const audible = group.filter((t) => !t.silent);
        if (track.language === 'fr') {
          await speakText('fr', audible.map((t) => t.grapheme).join(''), gap > 200 ? 0.6 : 0.9);
        } else if (audible[0]) {
          await say.sound(track, audible[0].sound);
        }
        await pause(gap);
      }
      onPart?.([]);
      await pause(300);
    }
  },
};

// Short synthesised effects. These are UI sounds, not speech, so no recording is needed.
let audioContext: AudioContext | undefined;

function tone(frequencies: number[], duration: number, type: OscillatorType = 'sine') {
  try {
    audioContext ??= new AudioContext();
    const ctx = audioContext;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18 * volume(), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * frequencies.length);
    gain.connect(ctx.destination);
    frequencies.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = f;
      osc.connect(gain);
      osc.start(ctx.currentTime + i * duration);
      osc.stop(ctx.currentTime + (i + 1) * duration);
    });
  } catch {
    // No Web Audio: effects are optional.
  }
}

export const sfx = {
  click: () => tone([660], 0.06, 'triangle'),
  boing: () => tone([300, 220], 0.09, 'sine'),
  chime: () => tone([523, 659, 784], 0.12, 'sine'),
};
