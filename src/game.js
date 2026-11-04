// A partida: o Jerry pula de faixa em faixa (toque = pra frente; arrastar = para os lados ou para trás).
// A tela sobe sozinha, devagar e cada vez mais rápido. Se ela passar do Jerry, ele abre um portal para Lacrímora e vai embora.
import { World, TILE, COLS, zoneAt } from './world.js';
import { drawGround, drawFloaters, drawUpright, drawCoin, drawPortal, drawWeather } from './draw.js';
import { jerryFrame } from './jerry.js';
import { SKIN_BY_ID, DEFAULT_SKIN } from './skins.js';
import { sfx } from './audio.js';

const T = TILE;
const HOP = 0.12;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class Game {
  constructor() { this.reset(Date.now() & 0x7fffffff); this.state = 'title'; this.t = 0; }
  reset(seed) {
    this.seed = seed;
    this.world = new World(seed);
    this.rnd = Math.random;
    this.j = { row: 0, x: 4 * T + T / 2, view: 'back', hop: null, bump: 0, on: null };
    this.cam = -2;          // fileira que está na borda de baixo da tela
    this.started = false;   // a câmera só começa a subir depois do primeiro pulo
    this.score = 0; this.coins = 0; this.queue = null;
    this.fx = []; this.toasts = []; this.end = null; this.zone = zoneAt(0).id; this.zoneBanner = { name: zoneAt(0).name, t: 0 };
    this.ghosts = []; this.passed = new Set(); this.worldBest = 0; this.worldName = ''; this.beatWorld = false;
  }
  // fantasmas dos recordes: o seu, o da última partida e os 10 maiores do ranking, parados onde cada um chegou
  setGhosts(list) {
    this.ghosts = list.filter((g) => g.row > 2).map((g, i) => ({ ...g, col: [0, 1, 7, 8][Math.abs(g.row * 7 + i * 3) % 4] }));
  }
  start() { this.state = 'play'; }

  // ---------------------------------------------------------------- movimento
  move(dx, dy) {
    if (this.state !== 'play') return;
    if (this.j.hop) { this.queue = [dx, dy]; return; }
    const j = this.j;
    const col = clamp(Math.round((j.x - T / 2) / T) + dx, 0, COLS - 1);
    if (dx && col === Math.round((j.x - T / 2) / T) && !j.on) { j.view = dx > 0 ? 'side' : 'left'; j.bump = 0.12; sfx.bump(); return; }
    const row = j.row + dy;
    if (row < Math.floor(this.cam) - 1) { j.bump = 0.1; sfx.bump(); return; }
    j.view = dy > 0 ? 'back' : dy < 0 ? 'front' : dx > 0 ? 'side' : 'left';
    const L = this.world.lane(row);
    if (L && L.type === 'grass' && L.block.has(col)) { j.bump = 0.12; sfx.bump(); return; }   // árvore ou pedra no caminho
    j.hop = { fx: j.x, fr: j.row, tx: col * T + T / 2, tr: row, t: 0 };
    j.on = null; this.started = true;
    sfx.hop();
  }
  land() {
    const j = this.j, h = j.hop;
    j.x = h.tx; j.row = h.tr; j.hop = null;
    const L = this.world.lane(j.row);
    if (j.row > this.score) {
      this.score = j.row;
      // passou o recorde mundial (o 1º do ranking): aviso grande, som e chuva de estrelas
      if (this.worldBest > 0 && !this.beatWorld && this.score > this.worldBest) {
        this.beatWorld = true; this.toast('NOVO RECORDE MUNDIAL!', '#ffcc3a'); sfx.record(); setTimeout(() => sfx.bigcoin(), 450);
        for (let i = 0; i < 24; i++) this.fx.push({ k: 'star', x: j.x + (Math.random() - 0.5) * 120, row: j.row + Math.random() * 6, t: -Math.random() * 0.4, c: i % 3 });
      }
      for (const g of this.ghosts) if (!this.passed.has(g.key) && this.score > g.row) { this.passed.add(g.key); this.toast(g.kind === 'top' ? `Passou ${g.name}!` : g.kind === 'best' ? 'Novo recorde pessoal!' : 'Passou a última partida!', g.kind === 'best' ? '#ffe070' : '#c8b8ff'); sfx[g.kind === 'best' ? 'record' : 'pass'](); }
    }
    const z = zoneAt(j.row);
    if (z.id !== this.zone && j.row === this.score) { this.zone = z.id; this.zoneBanner = { name: z.name, t: 0 }; }
    if (!L) return;
    const col = Math.round((j.x - T / 2) / T);
    if (L.coins.has(col)) { const v = L.coins.get(col); L.coins.delete(col); this.coins += v; (v > 1 ? sfx.bigcoin : sfx.coin)(); this.fx.push({ k: 'spark', x: j.x, row: j.row, t: 0 }); }
    if (L.type === 'river') {
      const o = L.objs.find((o) => j.x >= o.x - 1 && j.x <= o.x + o.w + 1);
      if (!o) return this.die('water');
      j.on = o; j.onOff = j.x - o.x;
      // encaixa num pedaço inteiro do tronco (de 16 em 16): o Jerry fica sempre todo em cima, nunca metade para fora da ponta
      j.onOff = Math.max(T / 2, Math.min(o.w - T / 2, Math.round((j.onOff - T / 2) / T) * T + T / 2));
    }
    if (this.queue) { const q = this.queue; this.queue = null; this.move(q[0], q[1]); }
  }
  die(kind) {
    if (this.state !== 'play') return;
    this.state = 'dying'; this.end = { kind, t: 0 };
    if (kind === 'water') { sfx.splash(); this.fx.push({ k: 'splash', x: this.j.x, row: this.j.row, t: 0 }); }
    else if (kind === 'hit') sfx.hit();
    else { sfx.portal(); this.j.view = 'front'; }
  }
  // atropelado: o Jerry fica achatado no chão e o que o atropelou para em cima dele
  squash(L, o, jx, row) {
    const j = this.j;
    if (j.hop) { j.x = jx; j.row = row; j.hop = null; }
    L.frozen = true;
    // o que atropelou para com a traseira (a roda de trás) em cima dele: metade do Jerry achatado fica embaixo
    // e a outra metade aparece. O slime para em cima dele.
    if (L.type === 'slime') o.x = jx - o.w / 2;
    else o.x = L.dir > 0 ? jx + 1 : jx - 1 - o.w;
    this.die('hit'); this.end.dir = L.dir || 1; this.end.slime = L.type === 'slime';
  }
  toast(text, color = '#ffffff') { this.toasts.push({ text, color, t: 0 }); }

  // ---------------------------------------------------------------- tempo
  update(dt, visRows) {
    this.t += dt;
    const W = this.world, j = this.j;
    W.ensure(Math.floor(this.cam + visRows + 12));
    W.prune(Math.floor(this.cam) - 6);
    W.update(dt, this.rnd);
    for (const L of W.lanes.values()) {
      if (L.type === 'rail') {
        const warn = W.warning(L);
        if (warn && !L.warned && Math.abs(L.row - j.row) < visRows) { L.warned = true; sfx.ding(); }
        if (L.train && !L.honked && Math.abs(L.row - j.row) < 6) { L.honked = true; sfx.horn(); }
        if (!warn && !L.train) { L.warned = false; L.honked = false; }
      }
    }
    for (const f of this.fx) f.t += dt;
    this.fx = this.fx.filter((f) => f.t < 1);
    for (const s of this.toasts) s.t += dt;
    this.toasts = this.toasts.filter((s) => s.t < 2.2);
    if (this.zoneBanner) { this.zoneBanner.t += dt; if (this.zoneBanner.t > 2.6) this.zoneBanner = null; }
    if (j.bump > 0) j.bump -= dt;

    if (this.state === 'dying') {
      this.end.t += dt;
      if (this.end.kind === 'portal') this.cam = Math.max(j.row - 2.2, this.cam - dt * 6);   // a tela desce um pouco para mostrar o portal inteiro
      return;
    }
    if (this.state !== 'play') return;

    // pulo em andamento
    if (j.hop) { j.hop.t += dt; if (j.hop.t >= HOP) this.land(); }
    // em cima de tronco: anda junto; se sair pela lateral, cai
    if (j.on && !j.hop) {
      j.x = j.on.x + j.onOff;
      if (j.x < 2 || j.x > COLS * T - 2) return this.die('water');
    }
    // batidas: carroças, slimes e o trem
    const row = j.hop ? (j.hop.t / HOP > 0.5 ? j.hop.tr : j.hop.fr) : j.row;
    const jx = j.hop ? j.hop.fx + (j.hop.tx - j.hop.fx) * (j.hop.t / HOP) : j.x;
    const L = W.lane(row);
    if (L) {
      const hit = (x, w, pad = 3) => jx + 4 > x + pad && jx - 4 < x + w - pad;
      const by = (L.type === 'road' || L.type === 'slime') && L.objs.find((o) => hit(o.x, o.w));
      if (by) return this.squash(L, by, jx, row);
      if (L.type === 'rail' && L.train && hit(L.train.x, L.train.w, 0)) return this.squash(L, L.train, jx, row);
    }
    // câmera: sobe sozinha (cada vez mais rápido) e acompanha o Jerry quando ele avança
    const d = Math.min(1, this.score / 700);
    if (this.started) this.cam += (0.38 + d * 0.62) * dt;
    const target = j.row - visRows * 0.42;
    if (target > this.cam) this.cam += (target - this.cam) * Math.min(1, dt * 4);
    // a tela passou do Jerry: ele abre um portal para Lacrímora e vai embora
    if (j.row < this.cam - 0.1 && !j.hop) this.die('portal');
  }

  // ---------------------------------------------------------------- desenho (c = tela lógica LW x LH)
  draw(c, LW, LH) {
    const t = this.t, cam = this.cam, ox = Math.round((LW - COLS * T) / 2);
    const rowY = (row) => Math.round(LH - (row - cam + 1) * T);
    const r0 = Math.floor(cam) - 1, r1 = Math.ceil(cam + LH / T) + 1;
    const x0 = -Math.ceil(ox / T) - 1, x1 = COLS + Math.ceil(ox / T) + 1;
    c.fillStyle = '#1a1226'; c.fillRect(0, 0, LW, LH);
    const W = this.world;
    for (let r = r1; r >= r0; r--) { const L = W.lane(r); if (L) drawGround(c, L, x0, x1, ox, rowY(r), t, W.lane(r + 1), W.lane(r - 1)); }
    for (let r = r1; r >= r0; r--) { const L = W.lane(r); if (L) drawFloaters(c, L, ox, rowY(r), t); }
    // fantasmas dos recordes (no chão da fileira, transparentes, com o nome)
    for (const g of this.ghosts) if (g.row >= r0 && g.row <= r1) this.drawGhost(c, g, ox, rowY(g.row));
    for (let r = r1; r >= r0; r--) {
      const L = this.world.lane(r), y = rowY(r);
      const jr = this.j.hop ? Math.max(this.j.hop.fr, this.j.hop.tr) : this.j.row, flat = this.end && this.end.kind === 'hit';
      if (L) for (const [col, v] of L.coins) drawCoin(c, ox + col * T, y, v, t);
      if (r === jr && flat) this.drawJerry(c, ox, rowY);   // achatado: fica embaixo do que o atropelou
      if (L) drawUpright(c, L, x0, x1, ox, y, t);
      if (r === jr && !flat) this.drawJerry(c, ox, rowY);
    }
    for (const f of this.fx) this.drawFx(c, f, ox, rowY);
    if (this.end && this.end.kind === 'hit') {   // estrelinhas de tonto por cima de tudo (até do que atropelou)
      const { x, y } = this.jerryPos(ox, rowY);
      for (let i = 0; i < 4; i++) { const a = t * 6 + i * 1.57, sx = Math.round(x + Math.cos(a) * 8), sy = Math.round(y + 2 + Math.sin(a) * 2.5); c.fillStyle = '#1a1226'; c.fillRect(sx - 1, sy - 1, 4, 4); c.fillStyle = i % 2 ? '#ffe070' : '#ffffff'; c.fillRect(sx, sy, 2, 2); }
    }
    drawWeather(c, zoneAt(Math.floor(cam + LH / T / 2)).id, LW, LH, t, cam * T);
  }
  jerryPos(ox, rowY) {
    const j = this.j;
    if (j.hop) { const p = Math.min(1, j.hop.t / HOP); const y0 = rowY(j.hop.fr), y1 = rowY(j.hop.tr); return { x: ox + j.hop.fx + (j.hop.tx - j.hop.fx) * p, y: y0 + (y1 - y0) * p - Math.sin(p * Math.PI) * 6, air: true }; }
    const by = j.bump > 0 ? Math.round(Math.sin(j.bump * 50) * 1) : 0;
    return { x: ox + j.x + by, y: rowY(j.row), air: false };
  }
  drawJerry(c, ox, rowY) {
    const skin = SKIN_BY_ID[this.skinId || DEFAULT_SKIN], j = this.j, e = this.end;
    let { x, y, air } = this.jerryPos(ox, rowY);
    if (e && e.kind === 'water') return;
    if (e && e.kind === 'portal') {   // o portal abre ao lado; ele olha, pula para dentro e o portal fecha
      const px = x + (x < ox + COLS * T / 2 ? 22 : -22), py = y + 5, k = e.t < 0.45 ? e.t / 0.45 : e.t < 1.25 ? 1 : Math.max(0, 1 - (e.t - 1.25) / 0.35);
      drawPortal(c, px, py, k, this.t);
      if (e.t > 1.15) return;
      if (e.t > 0.6) { const p = (e.t - 0.6) / 0.55; x += (px - x) * p; y -= Math.sin(p * Math.PI) * 8; c.globalAlpha = 1 - p * 0.8; }
      j.view = e.t > 0.6 ? (px > x ? 'side' : 'left') : 'front';
    }
    if (e && e.kind === 'hit') {   // achatado no chão, com estrelinhas girando por cima
      // de lado, achatado e esticado: o rabo e o corpo para fora, a cabeça embaixo da roda (o slime fica em cima dele todo)
      const fr = jerryFrame(e.dir > 0 ? 'side' : 'left', 'scared', 0, skin), k = Math.min(1, e.t / 0.08), h = Math.round(17 - 8 * k), w = Math.round(17 + 11 * k);
      c.drawImage(fr, Math.round(x) - Math.round(w / 2) - (e.slime ? 0 : e.dir > 0 ? 4 : -4), Math.round(y) + 13 - h, w, h);
      return;
    }
    // na ponta do tronco: balança, aparece um "!" e a ponta do tronco desse lado pisca (dá para saber que é a beirada)
    let edge = 0;
    if (j.on && !air && !e) {
      const o = j.on, lane = this.world.lane(j.row);
      if (lane && !lane.lily && o.w > T) { if (j.onOff <= T / 2 + 0.5) edge = -1; else if (j.onOff >= o.w - T / 2 - 0.5) edge = 1; }
      if (edge) {
        const blink = Math.floor(this.t * 6) % 2, ex = edge < 0 ? ox + o.x - 1 : ox + o.x + o.w - 4;
        c.fillStyle = blink ? '#ffe070' : '#ff8a3a'; c.fillRect(Math.round(ex), Math.round(y) + 2, 1, 11); c.fillRect(Math.round(ex) + 4, Math.round(y) + 2, 1, 11); c.fillRect(Math.round(ex), Math.round(y) + 2, 5, 1); c.fillRect(Math.round(ex), Math.round(y) + 12, 5, 1);
        x += Math.round(Math.sin(this.t * 14) * 1);
      }
      // o tronco está levando o Jerry para fora: a beirada da tela pisca em vermelho desse lado
      const side = j.x < T * 1.3 ? -1 : j.x > COLS * T - T * 1.3 ? 1 : 0;
      if (side && Math.floor(this.t * 5) % 2) { c.fillStyle = 'rgba(255,60,60,0.55)'; c.fillRect(side < 0 ? ox : ox + COLS * T - 3, Math.round(y), 3, T); }
    }
    const pose = air ? 'hop' : edge ? 'scared' : 'idle';
    const fr = jerryFrame(j.view, pose, air ? 1 : Math.floor(this.t * 2) % 2 && pose === 'idle' ? 0 : 0, skin);
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(Math.round(x) - 5, Math.round((air ? y + Math.sin(Math.min(1, j.hop ? j.hop.t / HOP : 0) * Math.PI) * 6 : y)) + 12, 10, 2);
    if (skin.fx === 'ghost') c.globalAlpha *= 0.75;
    c.drawImage(fr, Math.round(x) - 8, Math.round(y) - 1);
    c.globalAlpha = 1;
    if (skin.fx) this.drawAura(c, skin.fx, Math.round(x), Math.round(y) + 6);
    if (edge) { const by = Math.round(y) - 9 + (Math.floor(this.t * 6) % 2); c.fillStyle = '#1a1226'; c.fillRect(Math.round(x) - 2, by - 1, 4, 9); c.fillStyle = '#ffe070'; c.fillRect(Math.round(x) - 1, by, 2, 5); c.fillRect(Math.round(x) - 1, by + 6, 2, 1); }
  }
  drawAura(c, fx, x, y) {
    const t = this.t;
    for (let i = 0; i < 6; i++) {
      const a = t * 2 + i * 1.05, r = 9 + Math.sin(t * 3 + i) * 2, px = Math.round(x + Math.cos(a) * r), py = Math.round(y + Math.sin(a) * r * 0.6);
      c.fillStyle = fx === 'rainbow' ? `hsl(${(t * 200 + i * 60) % 360},90%,65%)` : fx === 'stars' ? (i % 2 ? '#ffffff' : '#ffe070') : fx === 'fire' ? (i % 2 ? '#ff8a2a' : '#ffd23a') : fx === 'moon' ? '#fff4c8' : '#e8e8ff';
      if (fx === 'fire') { const k = (t * 1.5 + i / 6) % 1; c.globalAlpha = 1 - k; c.fillRect(Math.round(x - 6 + i * 2.4), Math.round(y + 4 - k * 16), 1, 2); c.globalAlpha = 1; continue; }
      if (fx === 'ghost') { c.globalAlpha = 0.4; c.fillRect(px, py - 4, 1, 3); c.globalAlpha = 1; continue; }
      c.fillRect(px, py, 1, 1);
    }
  }
  // marca no chão da fileira do recorde: faixa tracejada de lado a lado, o texto escrito no chão e o Jerry fantasma
  drawGhost(c, g, ox, y) {
    const skin = SKIN_BY_ID[g.skin] || SKIN_BY_ID[DEFAULT_SKIN], x = ox + g.col * T + T / 2, passed = this.passed.has(g.key);
    const col = g.kind === 'world' ? '#ffcc3a' : g.kind === 'best' ? '#7aff9a' : g.kind === 'last' ? '#c8b8ff' : '#7af0ff';
    const big = g.kind === 'world' || g.kind === 'best';
    c.globalAlpha = passed ? 0.35 : 0.85;
    c.fillStyle = col;
    for (let k = -T * 8; k < COLS * T + T * 8; k += 6) c.fillRect(ox + k, y + T - (big ? 3 : 2), 3, big ? 2 : 1);
    c.globalAlpha = passed ? 0.2 : 0.5 + Math.sin(this.t * 3) * 0.1;
    if (g.kind !== 'world' || g.who) c.drawImage(jerryFrame('front', 'idle', 0, skin), x - 8, y - 4 - Math.round(Math.abs(Math.sin(this.t * 2 + g.row)) * 2));
    c.globalAlpha = passed ? 0.4 : 1;
    // texto no chão, logo acima da faixa
    const text = g.kind === 'world' || g.kind === 'best' ? `${g.name} ${g.row}` : g.name;
    label(c, text, ox + COLS * T / 2, y + T - 5, col, 8, 40);
    if (g.kind === 'world' && g.who) label(c, g.who, x, y - 7, col, 8, 16);   // quem tem o recorde mundial, em cima do fantasma
    c.globalAlpha = 1;
  }
  drawFx(c, f, ox, rowY) {
    const y = rowY(f.row), x = ox + f.x;
    if (f.k === 'star' && f.t > 0) { c.globalAlpha = 1 - f.t; c.fillStyle = ['#ffcc3a', '#ffffff', '#7af0ff'][f.c]; const yy = Math.round(y - f.t * 30); c.fillRect(Math.round(x) - 1, yy, 3, 1); c.fillRect(Math.round(x), yy - 1, 1, 3); c.globalAlpha = 1; }
    if (f.k === 'spark') { c.fillStyle = '#fff2a0'; for (let i = 0; i < 6; i++) { const a = i * 1.05; c.fillRect(Math.round(x + Math.cos(a) * f.t * 18), Math.round(y + 6 + Math.sin(a) * f.t * 12 - f.t * 6), 1, 1); } }
    if (f.k === 'splash') { c.strokeStyle = '#e8f8ff'; c.lineWidth = 1; for (let i = 0; i < 2; i++) { const k = f.t + i * 0.25; if (k > 1) continue; c.globalAlpha = 1 - k; c.beginPath(); c.ellipse(x, y + 9, 3 + k * 12, 1.5 + k * 4, 0, 0, 7); c.stroke(); } c.globalAlpha = 1; c.fillStyle = '#ffffff'; for (let i = 0; i < 6; i++) c.fillRect(Math.round(x - 6 + i * 2.4), Math.round(y + 6 - Math.sin(f.t * Math.PI) * (6 + (i % 3) * 3)), 1, 2); }
  }
  // a partida acabou de vez (depois da animação)?
  get over() { return this.state === 'dying' && this.end.t > (this.end.kind === 'portal' ? 1.8 : 1.2); }
}
// texto pequeno com contorno (nomes dos fantasmas)
export function label(c, text, x, y, col = '#ffffff', size = 8, max = 40) {
  c.font = `${size}px "Press Start 2P", monospace`; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  const s = String(text).slice(0, max);
  c.fillStyle = '#1a1226';
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) c.fillText(s, Math.round(x) + dx, Math.round(y) + dy);
  c.fillStyle = col; c.fillText(s, Math.round(x), Math.round(y));
}
