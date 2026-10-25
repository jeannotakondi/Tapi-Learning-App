import { LAND_NAMES, track, type Word } from '../curriculum';
import { getState } from '../store/store';
import { type AudioManifest, type ClipKind, clipPath, exampleFileKey, fileKey, storyPageKey } from './files';
import { TAPI_LINES, type TapiLineId } from './lines';

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

/** Bumped by stopAudio(). A sequence checks it between steps so it can be cut short. */
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

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices();
  return voices.find((v) => v.lang === 'en-GB') ?? voices.find((v) => v.lang.startsWith('en'));
}

/** Stand-in until recordings exist. Never good enough for isolated sounds. */
function speakText(text: string, rate = 0.85): Promise<void> {
  if (typeof speechSynthesis === 'undefined' || !text) return Promise.resolve();
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    const voice = pickVoice();
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

async function playClip(kind: ClipKind, key: string, fallbackText: string, rate?: number) {
  await loadManifest();
  const file = manifest[kind]?.[key];
  if (file) return playFile(clipPath(kind, file));
  return speakText(fallbackText, rate);
}

export function hasRecording(kind: ClipKind, key: string): boolean {
  return Boolean(manifest[kind]?.[key]);
}

export const pause = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Runs steps in order; stops early if anything else calls stopAudio(). */
export async function sequence(steps: Array<() => Promise<unknown> | unknown>): Promise<boolean> {
  stopAudio();
  const mine = ++generation;
  for (const step of steps) {
    if (generation !== mine) return false;
    await step();
  }
  return generation === mine;
}

export const say = {
  tapi(id: TapiLineId) {
    return playClip('tapi', id, TAPI_LINES[id]);
  },
  land(landId: string) {
    return playClip('tapi', `land-${landId}`, LAND_NAMES[landId] ?? landId);
  },
  sound(soundId: string) {
    return playClip('sounds', soundId, track.sounds[soundId]?.ttsHint ?? soundId, 0.7);
  },
  /** Any single word: lesson words, tricky words, listening-game pictures. */
  word(text: string) {
    return playClip('words', fileKey(text), text);
  },
  example(graphemeKey: string) {
    return playClip('words', exampleFileKey(graphemeKey), track.graphemes[graphemeKey]?.example ?? '');
  },
  storyPage(storyId: string, page: number, text: string) {
    return playClip('stories', storyPageKey(storyId, page), text, 0.8);
  },
  storyTitle(storyId: string, title: string) {
    return playClip('stories', `${storyId}-title`, title);
  },
  text(text: string) {
    return speakText(text);
  },
  /**
   * Blending, step 7 of the word loop. With a recording: the slow-then-faster
   * take. Without one: each sound slowly, then faster. onPart lights up the
   * tiles being heard.
   */
  async blend(word: Word, onPart?: (tileIndexes: number[]) => void) {
    const key = fileKey(word.text);
    if (hasRecording('blends', key)) {
      onPart?.(word.tiles.map((_, i) => i));
      await playClip('blends', key, '');
      onPart?.([]);
      return;
    }
    for (const gap of [450, 120]) {
      for (let i = 0; i < word.tiles.length; i++) {
        onPart?.([i]);
        await say.sound(word.tiles[i].sound);
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
  clap: () => tone([180], 0.05, 'square'),
};
