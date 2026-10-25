// Scans public/audio and writes public/audio/manifest.json, so the app knows
// which recordings exist. Run after adding audio: npm run audio:manifest
import { readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, parse } from 'node:path';

const root = join(import.meta.dirname, '..', 'public', 'audio');
const kinds = ['sounds', 'words', 'blends', 'tapi'];
const formats = ['.mp3', '.m4a', '.ogg'];
const manifest = {};
let count = 0;

for (const language of ['en', 'fr']) {
  manifest[language] = {};
  for (const kind of kinds) {
    const dir = join(root, language, kind);
    const files = existsSync(dir) ? readdirSync(dir) : [];
    const entries = {};
    for (const file of files.sort()) {
      const { name, ext } = parse(file);
      if (!formats.includes(ext.toLowerCase()) || entries[name]) continue;
      entries[name] = file;
      count++;
    }
    manifest[language][kind] = entries;
  }
}

writeFileSync(join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`audio manifest: ${count} recordings`);
