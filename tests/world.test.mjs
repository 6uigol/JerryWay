// Gera 3000 fileiras com várias sementes e confere que sempre existe caminho e que nada se sobrepõe.
import assert from 'node:assert/strict';
import { World, COLS, TILE } from '../src/world.js';
for (let seed = 1; seed < 40; seed++) {
  const w = new World(seed * 7919);
  w.ensure(3000);
  let free = new Set([...Array(COLS).keys()]);
  for (let r = 0; r <= 3000; r++) {
    const L = w.lane(r); assert.ok(L, `fileira ${r}`);
    if (L.type === 'grass') {
      const open = [...Array(COLS).keys()].filter((c) => !L.block.has(c));
      assert.ok(open.length > 0, `grama sem saída na fileira ${r}`);
      // dá para chegar a alguma coluna livre andando de lado a partir de onde se podia estar
      const reach = new Set(); for (const c of open) if (free.has(c)) reach.add(c);
      assert.ok(reach.size > 0, `caminho fechado na fileira ${r} (semente ${seed})`);
      const grow = new Set(reach); let changed = true;
      while (changed) { changed = false; for (const c of open) if (!grow.has(c) && (grow.has(c - 1) || grow.has(c + 1))) { grow.add(c); changed = true; } }
      free = grow;
    } else free = new Set([...Array(COLS).keys()]);
    if (L.objs.length > 1 && !L.lily) {
      const xs = [...L.objs].sort((a, b) => a.x - b.x);
      for (let i = 1; i < xs.length; i++) assert.ok(xs[i].x >= xs[i - 1].x + xs[i - 1].w - 0.01, `objetos encostados na fileira ${r}`);
    }
    if (L.type === 'river' && L.lily) assert.ok(L.objs.length > 0);
  }
  for (let i = 0; i < 600; i++) w.update(1 / 30, Math.random);
}
console.log('✓ mundo: 39 sementes x 3000 fileiras, sempre com caminho');
