// Turns dist-artifact/index.html into page.html for publishing as a claude.ai
// page: the host adds its own <html>/<head>/<body>, so only the tags inside go
// in. Also prints the supporting files to publish next to it.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const dir = join(import.meta.dirname, '..', 'dist-artifact');
const html = readFileSync(join(dir, 'index.html'), 'utf8');
const tags = [...html.matchAll(/<(script|link)\b[^>]*(src|href)="\.\/(assets\/[^"]+)"[^>]*>(<\/script>)?/g)].map((m) => m[0]);

const page = [
  '<title>Tapi Reading App</title>',
  '<meta name="description" content="Tapi teaches children aged 4 to 7 to read and spell with sound tiles.">',
  ...tags,
  '<div id="root"></div>',
].join('\n');
writeFileSync(join(dir, 'page.html'), page + '\n');

const files = [];
const walk = (d) => {
  for (const name of readdirSync(d)) {
    const path = join(d, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (!['index.html', 'page.html', '.gitkeep'].includes(name)) files.push(relative(dir, path));
  }
};
walk(dir);
console.log(JSON.stringify(Object.fromEntries(files.map((f) => [f, `dist-artifact/${f}`]))));
