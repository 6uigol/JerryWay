// Copia a arte do Song of Moonlight (personagens, monstros, chefes, pisos) e o Jerry do Jerry's Way para src/som/.
// Assim o Richard Is Bored usa exatamente os mesmos desenhos dos outros jogos.
// Uso: node scripts/sync-art.mjs [pasta do song-of-moonlight] [pasta do jerryway]
import { copyFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOM = process.argv[2] || join(ROOT, '..', 'song-of-moonlight'), JW = process.argv[3] || join(ROOT, '..', 'jerryway');
mkdirSync(join(ROOT, 'src/som'), { recursive: true });
for (const f of ['gfx.js', 'train.js', 'bossart.js', 'facades.js', 'util.js', 'icons16.js', 'hero.js', 'accents.js']) copyFileSync(join(SOM, 'src', f), join(ROOT, 'src/som', f));
copyFileSync(join(JW, 'src/jerry.js'), join(ROOT, 'src/som/jerry.js'));
console.log('arte copiada para src/som/');
