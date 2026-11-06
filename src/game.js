// A partida: o Jerry pula de faixa em faixa (toque = pra frente; arrastar = para os lados ou para trás).
// A tela sobe sozinha, devagar e cada vez mais rápido. Se ela passar do Jerry, ele abre um portal para Lacrímora e vai embora.
import { World, TILE, COLS, HARD_ROW, zoneAt, BONUS, BONUS_TIME, BONUS_MAX, ARENA_ROWS, BONUS_START, BONUS_FINISH } from './world.js';
import { drawGround, drawFloaters, drawUpright, drawCoin, drawPortal, drawWeather } from './draw.js';
import { jerryFrame } from './jerry.js';
import { SKIN_BY_ID, DEFAULT_SKIN } from './skins.js';
const GOLD_SQUIRREL = 's162';   // o esquilo da Caça ao Esquilo Dourado usa o desenho da skin Dourado
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
    this.revived = false; this.shield = 0;   // reviver: só 1 vez por partida; depois de reviver, 2,5 s sem ser atropelado
    this.hard = false;   // passou da fileira 1000: o monstro começa a perseguir (sem aviso)
    this.bonus = null; this.stash = null; this.used = {};   // dimensão bônus em andamento; habilidades de 1 vez por partida já usadas
    this.setAbility(this.ability || null);
  }
  // habilidade passiva da skin (ver ABILITIES em skins.js): ajusta o mundo e o pulo
  setAbility(id) {
    this.ability = id;
    this.hopT = id === 'ligeiro' ? HOP * 0.75 : HOP;
    this.world.bigChance = id === 'faro' ? 0.28 : 0.1;
    this.world.bonusRate = id === 'explorador' ? 1.45 : 1;
  }
  // fantasmas dos recordes: o seu, o da última partida e os 10 maiores do ranking, parados onde cada um chegou
  setGhosts(list) {
    this.ghosts = list.filter((g) => g.row > 2).map((g, i) => ({ ...g, col: [0, 1, 7, 8][Math.abs(g.row * 7 + i * 3) % 4] }));
  }
  start() { this.state = 'play'; }
  // reviver (vídeo ou 70 moedas, 1 vez por partida): o Jerry volta na grama segura mais perto de onde caiu,
  // a tela desce um pouco para ele ter espaço e ele fica piscando 2,5 s sem poder ser atropelado
  revive() {
    this.placeSafe(); this.end = null; this.queue = null; this.state = 'play'; this.revived = true; this.shield = 2.5;
  }
  // põe o Jerry na grama livre mais perto (reviver, Nadador e a volta da dimensão bônus)
  placeSafe() {
    const j = this.j, W = this.world;
    let row = null;
    for (let d = 0; d <= 16 && row === null; d++) for (const r of [j.row - d, j.row + d]) { const L = W.lane(r); if (r >= 0 && L && L.type === 'grass' && row === null) row = r; }
    if (row === null) row = Math.max(0, j.row);
    const L = W.lane(row), want = clamp(Math.round((j.x - T / 2) / T), 0, COLS - 1);
    let col = want;
    for (let d = 0; d < COLS; d++) { const a = clamp(want - d, 0, COLS - 1), b = clamp(want + d, 0, COLS - 1); if (!L || !L.block || !L.block.has(a)) { col = a; break; } if (!L.block.has(b)) { col = b; break; } }
    for (let r = Math.floor(this.cam) - 2; r < this.cam + 30; r++) { const l = W.lane(r); if (l) l.frozen = false; }   // o que atropelou volta a andar
    Object.assign(j, { row, x: col * T + T / 2, hop: null, on: null, view: 'back', bump: 0 });
    this.cam = Math.min(this.cam, row - 3);
    this.fx.push({ k: 'spark', x: j.x, row, t: 0 });
  }

  // ---------------------------------------------------------------- movimento
  move(dx, dy) {
    if (this.state !== 'play') return;
    if (this.j.hop) { this.queue = [dx, dy]; return; }
    const j = this.j;
    const col = clamp(Math.round((j.x - T / 2) / T) + dx, 0, COLS - 1);
    if (dx && col === Math.round((j.x - T / 2) / T) && !j.on) { j.view = dx > 0 ? 'side' : 'left'; j.bump = 0.12; sfx.bump(); return; }
    const row = j.row + dy;
    if (row < Math.floor(this.cam) - 1) { j.bump = 0.1; sfx.bump(); return; }
    if (this.bonus && (row < 0 || row >= ARENA_ROWS)) { j.bump = 0.1; sfx.bump(); return; }   // borda do labirinto
    if (this.bonus && this.bonus.kind === 'gelo') return this.slide(dx, dy);
    j.view = dy > 0 ? 'back' : dy < 0 ? 'front' : dx > 0 ? 'side' : 'left';
    const L = this.world.lane(row);
    if (L && (L.type === 'grass' || this.bonus) && L.block.has(col)) { j.bump = 0.12; sfx.bump(); return; }   // árvore ou pedra no caminho (no labirinto: parede)
    if (j.on && dy === 0) {
      // de lado em cima do tronco: o pulo é de 1 casa EM CIMA do tronco e acompanha o tronco no ar
      // (antes ele mirava uma coluna fixa da tela e o tronco andava por baixo: parecia um pulo duplo, pior contra a corrente)
      const o = j.on, to = j.onOff + dx * T, x = o.x + to;
      if (x < T / 2 || x > COLS * T - T / 2) { j.view = dx > 0 ? 'side' : 'left'; j.bump = 0.12; sfx.bump(); return; }
      j.hop = { fx: j.x, fr: j.row, tx: x, tr: row, t: 0, rel: o, fo: j.onOff, to };
    } else {
      // de um tronco direto para outro rio: sobe reto (sem puxar para a coluna); nas outras faixas, encaixa na coluna
      const straight = j.on && L && L.type === 'river' && !L.lily;
      j.hop = { fx: j.x, fr: j.row, tx: straight ? clamp(j.x, T / 2, COLS * T - T / 2) : col * T + T / 2, tr: row, t: 0 };
    }
    j.on = null; this.started = true;
    sfx.hop();
  }
  land() {
    const j = this.j, h = j.hop;
    j.x = h.tx; j.row = h.tr; j.hop = null;
    const L = this.world.lane(j.row);
    if (this.bonus) return this.landBonus(L);
    if (j.row > this.score) {
      this.score = j.row;
      if (this.ability === 'caminhante' && this.score % 10 === 0) { this.coins++; this.fx.push({ k: 'spark', x: j.x, row: j.row, t: 0 }); }   // Caminhante: 1 moeda a cada 10 fileiras
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
    if (L.myth !== undefined && L.myth === col) { delete L.myth; this.findMyth(j); }
    // passou da fileira do esquilo mítico sem pegar: ele sai correndo para o lado e some
    for (let r = j.row - 3; r < j.row; r++) { const M = this.world.lane(r); if (M && M.myth !== undefined) this.mythFlee(M); }
    this.grab(L, col);
    if (L.bonus === col) return this.enterBonus(L, col);   // portal dourado: vai para a dimensão bônus
    if (L.type === 'river') {
      // margem de erro: se cair até 7 px fora do tronco (ou da vitória-régia), o Jerry escorrega para cima dele
      const M = this.ability === 'equilibrio' ? 11 : 7, o = L.objs.filter((o) => j.x >= o.x - M && j.x <= o.x + o.w + M)
        .sort((a, b) => Math.max(0, a.x - j.x, j.x - a.x - a.w) - Math.max(0, b.x - j.x, j.x - b.x - b.w))[0];
      if (!o) return this.die('water');
      // fica onde caiu, só que sempre todo em cima (nunca metade para fora da ponta); sem "encaixar", que dava um segundo pulinho
      j.x = Math.max(o.x + T / 2, Math.min(o.x + o.w - T / 2, j.x));
      j.on = o; j.onOff = j.x - o.x;
    }
    if (this.queue) { const q = this.queue; this.queue = null; this.move(q[0], q[1]); }
  }
  // pega a moeda da casa (Ímã: também as das casas do lado; Sortudo: 1 em 4 vale o dobro)
  grab(L, col) {
    const j = this.j;
    for (const c of this.ability === 'ima' ? [col, col - 1, col + 1] : [col]) {
      if (!L.coins.has(c)) continue;
      let v = L.coins.get(c); L.coins.delete(c);
      if (this.ability === 'sorte' && Math.random() < 0.25) { v *= 2; this.fx.push({ k: 'star', x: c * T + T / 2, row: j.row, t: 0, c: 0 }); }
      this.coins += v; (v > 1 ? sfx.bigcoin : sfx.coin)(); this.fx.push({ k: 'spark', x: c * T + T / 2, row: j.row, t: 0 });
    }
  }
  // ---------------------------------------------------------------- dimensão bônus
  enterBonus(L, col) {
    const j = this.j, kinds = Object.keys(BONUS).filter((k) => k !== this.lastBonus), kind = kinds[Math.floor(Math.random() * kinds.length)], B = BONUS[kind];
    delete L.bonus; this.lastBonus = kind;   // nunca a mesma dimensão duas vezes seguidas
    this.stash = { world: this.world, cam: this.cam, row: L.row, col };
    this.world = new World((Math.random() * 1e9) | 0, kind); this.world.ensure(ARENA_ROWS + 6);
    const [sc, sr] = BONUS_START;
    Object.assign(j, { row: sr, x: sc * T + T / 2, hop: null, on: null, view: 'back', bump: 0 });
    this.cam = -1; this.queue = null;
    const b = this.bonus = { kind, arena: true, t: BONUS_TIME, coins0: this.coins, meteors: [], spawn: 1, gust: 1.6, wind: Math.random() < 0.5 ? -1 : 1, caught: 0, mobs: [] };
    if (kind === 'caca') { b.sqBig = 1 + Math.floor(Math.random() * BONUS_MAX.big); b.sq = this.squirrelSpot(); }
    if (kind === 'mina' || kind === 'trilhos') {   // slimes / carrinhos andando pelos corredores
      const open = this.world.open.filter(([c, r]) => Math.abs(c - sc) + Math.abs(r - sr) > 3);
      for (let i = 0; i < 3 && open.length; i++) { const [c, r] = open.splice(Math.floor(Math.random() * open.length), 1)[0]; b.mobs.push({ c, r, d: [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(Math.random() * 4)], t: Math.random() * 0.4 }); }
    }
    this.zoneBanner = { name: B.name, t: 0 }; this.toast(B.hint, '#ffe070');
    sfx.portal(); sfx.record();
  }
  // a casa está livre dentro da arena?
  open(c, r) { const L = this.world.lane(r); return c >= 0 && c < COLS && r >= 0 && r < ARENA_ROWS && L && !L.block.has(c); }
  // o que acontece sozinho em cada dimensão (a cada quadro)
  bonusTick(dt) {
    const b = this.bonus, j = this.j, jc = Math.round((j.x - T / 2) / T), jr = j.hop ? j.hop.tr : j.row;
    const hitBy = (c, r) => c === jc && r === jr && !(this.shield > 0);
    if (b.kind === 'chuva') {
      // meteoros: a sombra vermelha mostra onde vão cair; caiu em cima do Jerry = volta antes
      if ((b.spawn -= dt) <= 0) {
        b.spawn = 0.55; const o = this.world.open[Math.floor(Math.random() * this.world.open.length)];
        if (o) b.meteors.push({ c: o[0], r: o[1], h: 7, sp: 6 + Math.random() * 2 });
      }
      for (const m of b.meteors) {
        if ((m.h -= m.sp * dt) > 0) continue;
        m.done = true; this.fx.push({ k: 'splash', x: m.c * T + T / 2, row: m.r, t: 0 });
        if (hitBy(m.c, m.r)) { sfx.hit(); return this.exitBonus(true); }
      }
      b.meteors = b.meteors.filter((m) => !m.done);
    } else if (b.kind === 'caca') {
      const q = b.sq; q.t = (q.t || 0) + dt;
      if (q.t > 0.42) { q.t = 0; const nx = this.squirrelStep(q, jc, jr); q.c = nx[0]; q.r = nx[1]; }
      if (q.c === jc && q.r === jr && !j.hop) this.catchSquirrel();
    } else if (b.kind === 'vento') {
      // rajadas: de tempos em tempos o vento empurra o Jerry uma casa (se der) e às vezes muda de lado
      if ((b.gust -= dt) <= 0 && !j.hop) {
        b.gust = 2.2; if (Math.random() < 0.35) b.wind = -b.wind;
        const to = jc + b.wind;
        if (this.open(to, j.row)) { j.hop = { fx: j.x, fr: j.row, tx: to * T + T / 2, tr: j.row, t: 0 }; j.view = b.wind > 0 ? 'side' : 'left'; sfx.bump(); }
      }
    } else if (b.mobs.length) {
      // slimes (Mina) e carrinhos (Trilhos) andam pelos corredores e viram quando batem; encostou = volta antes
      const step = b.kind === 'trilhos' ? 0.28 : 0.45;
      for (const m of b.mobs) {
        if ((m.t += dt) < step) continue;
        m.t = 0;
        let tries = [m.d, [m.d[1], m.d[0]], [-m.d[1], -m.d[0]], [-m.d[0], -m.d[1]]];
        if (Math.random() < 0.25) tries = [tries[1], tries[2], tries[0], tries[3]];
        const d = tries.find(([dx, dy]) => this.open(m.c + dx, m.r + dy));
        if (d) { m.d = d; m.c += d[0]; m.r += d[1]; }
      }
      if (b.mobs.some((m) => hitBy(m.c, m.r))) { sfx.hit(); return this.exitBonus(true); }
    }
  }
  squirrelSpot() {
    const j = this.j, jc = Math.round((j.x - T / 2) / T), open = this.world.open.filter(([c, r]) => Math.abs(c - jc) + Math.abs(r - j.row) > 4);
    const o = open[Math.floor(Math.random() * open.length)] || [8, 8];
    return { c: o[0], r: o[1], t: 0 };
  }
  squirrelStep(q, jc, jr) {
    const opts = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [q.c + dx, q.r + dy]).filter(([c, r]) => this.open(c, r));
    opts.sort((a, b) => (Math.abs(b[0] - jc) + Math.abs(b[1] - jr) + Math.random() * 1.5) - (Math.abs(a[0] - jc) + Math.abs(a[1] - jr) + Math.random() * 1.5));
    return opts[0] || [q.c, q.r];
  }
  catchSquirrel() {
    const b = this.bonus, j = this.j; b.caught++;
    this.coins += 5; b.sqBig--; sfx.bigcoin(); this.toast(`Pegou o esquilo dourado! +5`, '#ffcc3a');
    for (let i = 0; i < 6; i++) this.fx.push({ k: 'star', x: j.x + (Math.random() - 0.5) * 30, row: j.row + Math.random(), t: -Math.random() * 0.3, c: i % 3 });
    b.sq = b.sqBig > 0 ? this.squirrelSpot() : null;
  }
  // Lago Congelado: escorrega pelo corredor até bater ou chegar numa curva/encruzilhada (pega as moedas do caminho)
  slide(dx, dy) {
    const j = this.j; let c = Math.round((j.x - T / 2) / T), r = j.row, n = 0;
    while (this.open(c + dx, r + dy)) {
      c += dx; r += dy; n++;
      const L = this.world.lane(r); if (L) this.grab(L, c);
      if (L && L.exit === c) break;
      if (this.open(c + dy, r + dx) || this.open(c - dy, r - dx)) break;   // abriu um caminho para o lado: para aqui
    }
    j.view = dy > 0 ? 'back' : dy < 0 ? 'front' : dx > 0 ? 'side' : 'left';
    if (!n) { j.bump = 0.12; sfx.bump(); return; }
    j.hop = { fx: j.x, fr: j.row, tx: c * T + T / 2, tr: r, t: 0, dur: this.hopT * (0.7 + n * 0.3) };
    this.started = true; sfx.hop();
  }
  landBonus(L) {
    const j = this.j, col = Math.round((j.x - T / 2) / T);
    if (!L) return;
    this.grab(L, col);
    if (L.exit === col) return this.exitBonus(false, true);   // chegou à saída antes do tempo: +3 moedas
    if (this.bonus.kind === 'caca' && this.bonus.sq && this.bonus.sq.c === col && this.bonus.sq.r === j.row) this.catchSquirrel();
    if (L.type === 'river') { const o = L.objs.find((o) => j.x >= o.x - 7 && j.x <= o.x + o.w + 7); if (o) { j.x = o.x + T / 2; j.on = o; j.onOff = T / 2; } }
    if (this.queue) { const q = this.queue; this.queue = null; this.move(q[0], q[1]); }
  }
  // volta para o mesmo lugar da corrida, com 2 s de proteção (fail: bateu/caiu; done: chegou à saída)
  exitBonus(fail, done = false) {
    const s = this.stash, j = this.j;
    if (done) { this.coins += BONUS_FINISH; sfx.record(); }
    const got = this.coins - this.bonus.coins0;
    this.world = s.world; this.cam = s.cam; this.bonus = null; this.stash = null;
    Object.assign(j, { row: s.row, x: s.col * T + T / 2, hop: null, on: null, view: 'back', bump: 0 });
    this.placeSafe();
    this.shield = 2; this.queue = null;
    this.toast(done ? `Saiu do labirinto! +${got} moedas` : fail ? `Voltou da dimensão: +${got} moedas` : `Acabou o tempo: +${got} moedas`, '#ffe070');
    this.zoneBanner = null; sfx.portal();
  }
  die(kind) {
    if (this.state !== 'play') return;
    if (this.bonus) return this.exitBonus(true);   // na dimensão bônus ninguém morre: só volta antes
    // Nadador: 1 vez por partida, sai da água e volta para a margem
    if (kind === 'water' && this.ability === 'nadador' && !this.used.nadador) {
      this.used.nadador = true; sfx.splash(); this.fx.push({ k: 'splash', x: this.j.x, row: this.j.row, t: 0 });
      this.placeSafe(); this.shield = 1.5; this.toast('Nadador: nadou até a margem!', '#7af0ff'); return;
    }
    this.state = 'dying'; this.end = { kind, t: 0 };
    if (kind === 'water') { sfx.splash(); this.fx.push({ k: 'splash', x: this.j.x, row: this.j.row, t: 0 }); }
    else if (kind === 'hit') sfx.hit();
    else { sfx.portal(); this.j.view = 'front'; }
  }
  // atropelado: o Jerry fica achatado no chão e o que o atropelou para em cima dele
  squash(L, o, jx, row) {
    const j = this.j;
    if (this.bonus) return this.exitBonus(true);
    if (this.ability === 'casco' && !this.used.casco) {   // Casco Duro: a primeira batida da partida não derruba
      this.used.casco = true; this.shield = 2; sfx.bump(); this.toast('Casco Duro aguentou a batida!', '#7aff9a'); return;
    }
    if (j.hop) { j.x = jx; j.row = row; j.hop = null; }
    L.frozen = true;
    // o que atropelou para com a traseira (a roda de trás) em cima dele: metade do Jerry achatado fica embaixo
    // e a outra metade aparece. O slime para em cima dele.
    if (L.type === 'slime') o.x = jx - o.w / 2;
    else o.x = L.dir > 0 ? jx + 1 : jx - 1 - o.w;
    this.die('hit'); this.end.dir = L.dir || 1; this.end.slime = L.type === 'slime';
  }
  // pegou o esquilo mítico: ganha essa skin (quem chama salva na hora)
  findMyth(j) {
    const s = this.onMyth ? this.onMyth() : null;
    if (!s) return;
    this.mythRun = null;
    this.mythFound = s.id;
    this.toast('Skin Mítica!', '#ff5a8a'); this.toast(s.name, '#ffd0e0');
    sfx.record(); setTimeout(() => sfx.bigcoin(), 300); setTimeout(() => sfx.bigcoin(), 600);
    for (let i = 0; i < 30; i++) this.fx.push({ k: 'star', x: j.x + (Math.random() - 0.5) * 100, row: j.row + Math.random() * 4, t: -Math.random() * 0.5, c: i % 3 });
  }
  mythFlee(M) {
    const col = M.myth; delete M.myth;
    const dir = col < COLS / 2 ? -1 : 1;   // foge para o lado mais perto da borda
    this.mythRun = { row: M.row, x: col * T + T / 2, dir, t: 0 };
    this.toast('O esquilo mítico fugiu!', '#ff8ab0'); sfx.bump();
  }
  toast(text, color = '#ffffff') { this.toasts.push({ text, color, t: 0 }); }

  // ---------------------------------------------------------------- tempo
  update(dt, visRows) {
    this.t += dt;
    const W = this.world, j = this.j;
    W.ensure(Math.floor(this.cam + visRows + 12));
    W.prune(Math.floor(this.cam) - 6);
    W.update(this.ability === 'reflexo' ? dt * 0.9 : dt, this.rnd);
    if (this.mythRun) { const m = this.mythRun; m.t += dt; m.x += m.dir * (60 + m.t * 220) * dt; if (m.x < -60 || m.x > COLS * T + 60) this.mythRun = null; }
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
    if (this.shield > 0) this.shield -= dt;

    // pulo em andamento
    if (j.hop) {
      if (j.hop.rel) { j.hop.fx = j.hop.rel.x + j.hop.fo; j.hop.tx = j.hop.rel.x + j.hop.to; }   // pulo de lado no tronco: anda junto com ele
      j.hop.t += dt; if (j.hop.t >= (j.hop.dur || this.hopT)) this.land();
    }
    // em cima de tronco: anda junto; se sair pela lateral, cai
    if (j.on && !j.hop) {
      j.x = j.on.x + j.onOff;
      // a borda da tela empurra o Jerry: ele escorrega pelo tronco (continua em cima) e só cai na água
      // quando a ponta do tronco passa por baixo dele
      const minX = T / 2, maxX = COLS * T - T / 2;
      if (j.x < minX || j.x > maxX) {
        j.x = Math.max(minX, Math.min(maxX, j.x));
        j.onOff = j.x - j.on.x; j.pushed = 0.15;
        if (j.onOff < -2 || j.onOff > j.on.w + 2) {
          // acabou este tronco: se tiver outro (ou vitória-régia) logo ali do lado, o Jerry passa para ele; senão cai
          const lane = this.world.lane(j.row), next = lane && lane.objs.find((o) => o !== j.on && j.x >= o.x - (this.ability === 'equilibrio' ? 6 : 3) && j.x <= o.x + o.w + (this.ability === 'equilibrio' ? 6 : 3));
          if (!next) return this.die('water');
          j.on = next; j.onOff = Math.max(0, Math.min(next.w, j.x - next.x));
        }
      }
    }
    // batidas: carroças, slimes e o trem
    const row = j.hop ? (j.hop.t / (j.hop.dur || this.hopT) > 0.5 ? j.hop.tr : j.hop.fr) : j.row;
    const jx = j.hop ? j.hop.fx + (j.hop.tx - j.hop.fx) * (j.hop.t / (j.hop.dur || this.hopT)) : j.x;
    const L = W.lane(row);
    if (L && !(this.shield > 0)) {
      const hit = (x, w, pad = 3) => jx + 4 > x + pad && jx - 4 < x + w - pad;
      const by = (L.type === 'road' || L.type === 'slime') && L.objs.find((o) => hit(o.x, o.w));
      if (by) return this.squash(L, by, jx, row);
      if (L.type === 'rail' && L.train && hit(L.train.x, L.train.w, 0)) return this.squash(L, L.train, jx, row);
    }
    // câmera: sobe sozinha (cada vez mais rápido) e acompanha o Jerry quando ele avança
    const d = Math.min(1, this.score / 700);
    if (this.bonus && (this.bonus.t -= dt) <= 0) return this.exitBonus(false);   // acabou o tempo da dimensão bônus
    if (this.bonus) { this.cam = -1; return this.bonusTick(dt); }   // dimensão bônus: a tela fica parada (labirinto numa tela só)
    if (!this.hard && this.score >= HARD_ROW) { this.hard = true; sfx.roar(); j.bump = 0.3; if (this.onHard) this.onHard(); }   // começa do nada
    if (this.started) this.cam += (0.38 + d * 0.62) * (this.ability === 'calmo' ? 0.88 : 1) * (this.hard ? 1.15 : 1) * dt;
    const target = j.row - visRows * 0.42;
    if (target > this.cam) this.cam += (target - this.cam) * Math.min(1, dt * 4);
    // depois da fileira 1000 o monstro vem por baixo da tela: se alcançar o Jerry, acabou (sem reviver)
    if (this.hard && j.row < this.cam + 0.35 && !j.hop) return this.die('monstro');
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
    if (!this.bonus) for (const g of this.ghosts) if (g.row >= r0 && g.row <= r1) this.drawGhost(c, g, ox, rowY(g.row));
    for (let r = r1; r >= r0; r--) {
      const L = this.world.lane(r), y = rowY(r);
      const jr = this.j.hop ? Math.max(this.j.hop.fr, this.j.hop.tr) : this.j.row, flat = this.end && this.end.kind === 'hit';
      if (L) for (const [col, v] of L.coins) drawCoin(c, ox + col * T, y, v, t);
      if (L && L.myth !== undefined) this.drawMyth(c, ox + L.myth * T + T / 2, y, t, false);
      const pc = L ? (L.bonus !== undefined ? L.bonus : L.exit) : undefined;   // portal dourado (entrada ou saída da dimensão bônus)
      if (pc !== undefined) drawPortal(c, ox + pc * T + T / 2, y + 8, 0.56 + Math.sin(t * 3) * 0.04, t, true);
      if (this.mythRun && this.mythRun.row === r) this.drawMyth(c, ox + this.mythRun.x, y, t, true);
      if (r === jr && flat) this.drawJerry(c, ox, rowY);   // achatado: fica embaixo do que o atropelou
      if (L) drawUpright(c, L, x0, x1, ox, y, t);
      if (r === jr && !flat) this.drawJerry(c, ox, rowY);
    }
    for (const f of this.fx) this.drawFx(c, f, ox, rowY);
    if (this.bonus) this.drawBonus(c, ox, rowY, LW);
    if (this.end && this.end.kind === 'hit') {   // estrelinhas de tonto por cima de tudo (até do que atropelou)
      const { x, y } = this.jerryPos(ox, rowY);
      for (let i = 0; i < 4; i++) { const a = t * 6 + i * 1.57, sx = Math.round(x + Math.cos(a) * 8), sy = Math.round(y + 2 + Math.sin(a) * 2.5); c.fillStyle = '#1a1226'; c.fillRect(sx - 1, sy - 1, 4, 4); c.fillStyle = i % 2 ? '#ffe070' : '#ffffff'; c.fillRect(sx, sy, 2, 2); }
    }
    drawWeather(c, this.bonus ? BONUS[this.bonus.kind].zone : zoneAt(Math.floor(cam + LH / T / 2)).id, LW, LH, t, cam * T);
    if (this.hard && !this.bonus) this.drawMonster(c, ox, LW, LH);
    if (this.bonus) {   // dimensão bônus: brilho dourado nas bordas
      c.fillStyle = 'rgba(255,204,58,0.10)'; c.fillRect(0, 0, LW, LH);
      for (let i = 0; i < 14; i++) { const k = (t * 0.4 + i / 14) % 1, x = (i * 37 % LW), yy = LH - k * LH; c.globalAlpha = Math.sin(k * Math.PI); c.fillStyle = i % 2 ? '#ffe070' : '#ffffff'; c.fillRect(x, Math.round(yy), 1, 1); }
      c.globalAlpha = 1;
    }
  }
  // coisas próprias das dimensões: o que cai do céu, o esquilo dourado e as setas do vento
  drawBonus(c, ox, rowY, LW) {
    const b = this.bonus, t = this.t;
    for (const m of b.meteors) {   // sombra vermelha onde vai cair e o meteoro descendo
      const x = ox + m.c * T, gy = rowY(m.r), y = Math.round(rowY(m.r + m.h)), k = 1 - Math.min(1, m.h / 7), w = Math.round(4 + k * 9);
      c.globalAlpha = 0.3 + k * 0.5; c.fillStyle = '#e83a2a'; c.fillRect(x + 8 - w / 2, gy + 10, w, 4); c.globalAlpha = 1;
      c.fillStyle = '#ff8a3a'; c.fillRect(x + 6, y - 10, 4, 10); c.fillStyle = '#ffe070'; c.fillRect(x + 7, y - 6, 2, 6);
      c.fillStyle = '#3a2a3a'; c.fillRect(x + 3, y, 10, 9); c.fillStyle = '#6a5a6a'; c.fillRect(x + 4, y + 1, 8, 7); c.fillStyle = '#9a8a9a'; c.fillRect(x + 5, y + 2, 3, 2);
    }
    for (const m of b.mobs) {
      const x = ox + m.c * T, y = rowY(m.r), bob = Math.round(Math.abs(Math.sin(t * 8 + m.c)) * 2);
      c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x + 3, y + 12, 10, 2);
      if (b.kind === 'mina') {   // slime roxo
        c.fillStyle = '#3a1a4a'; c.fillRect(x + 2, y + 4 - bob, 12, 10 + bob); c.fillStyle = '#b05ae8'; c.fillRect(x + 3, y + 5 - bob, 10, 8 + bob); c.fillStyle = '#e0a8ff'; c.fillRect(x + 4, y + 6 - bob, 3, 2);
        c.fillStyle = '#1a0a22'; c.fillRect(x + 5, y + 8 - bob, 2, 2); c.fillRect(x + 9, y + 8 - bob, 2, 2);
      } else {                   // carrinho de mina com ouro
        c.fillStyle = '#2a1a10'; c.fillRect(x + 1, y + 5, 14, 8); c.fillStyle = '#8a5a2a'; c.fillRect(x + 2, y + 6, 12, 6); c.fillStyle = '#ffcc3a'; c.fillRect(x + 3, y + 3, 10, 3);
        c.fillStyle = '#1a1226'; c.fillRect(x + 3, y + 12, 3, 3); c.fillRect(x + 10, y + 12, 3, 3);
      }
    }
    if (b.kind === 'caca' && b.sq) {
      const q = b.sq, x = ox + q.c * T + T / 2, y = rowY(q.r), hop = Math.abs(Math.sin(t * 10)) * 3;
      const fr = jerryFrame(Math.floor(t * 2) % 2 ? 'side' : 'left', 'hop', 1, SKIN_BY_ID[GOLD_SQUIRREL]);
      c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(Math.round(x) - 5, y + 12, 10, 2);
      c.drawImage(fr, Math.round(x) - 9, Math.round(y - 3 - hop));
      if (Math.floor(t * 6) % 2) { c.fillStyle = '#fff2a0'; c.fillRect(Math.round(x) + 6, Math.round(y - 4 - hop), 1, 1); c.fillRect(Math.round(x) - 7, Math.round(y + 2 - hop), 1, 1); }
    }
    if (b.kind === 'vento') {   // faixas de vento atravessando a tela no sentido da rajada
      c.fillStyle = 'rgba(255,240,200,0.55)';
      for (let i = 0; i < 9; i++) { const k = ((t * 1.6 + i * 0.37) % 1), x = b.wind > 0 ? k * LW : LW - k * LW, y = rowY(i * 1.1) + 6; c.fillRect(Math.round(x), Math.round(y), 10, 1); }
    }
  }
  // o que persegue o Jerry depois da fileira 1000: tentáculos pretos subindo pela borda de baixo da tela,
  // balançando; o do meio segue o Jerry de lado (e é ele que pega o Jerry)
  drawMonster(c, ox, LW, LH) {
    const t = this.t, e = this.end, eat = e && e.kind === 'monstro', jp = this.jerryPos(ox, (r) => LH - (r - this.cam + 1) * T);
    this.mx = this.mx === undefined ? jp.x : this.mx + (jp.x - this.mx) * 0.08;
    const base = LH + 4;
    const g = c.createLinearGradient(0, LH - 70, 0, LH); g.addColorStop(0, 'rgba(4,2,10,0)'); g.addColorStop(0.5, 'rgba(4,2,10,0.75)'); g.addColorStop(1, 'rgba(2,1,6,0.98)');
    c.fillStyle = g; c.fillRect(0, LH - 70, LW, 70);
    const tentacle = (bx, h, w0, ph, amp) => {
      const n = Math.max(4, Math.round(h / 2));
      for (let k = 0; k < n; k++) {
        const f = k / n, x = bx + Math.sin(f * 4.2 + t * 3 + ph) * amp * f, w = Math.max(1, Math.round(w0 * (1 - f * 0.85))), y = Math.round(base - k * 2);
        c.fillStyle = '#050208'; c.fillRect(Math.round(x - w / 2), y - 2, w, 3);
        if (w > 3) { c.fillStyle = '#1c0f2a'; c.fillRect(Math.round(x - w / 2), y - 2, 1, 3); }   // brilho na borda
        if (k % 5 === 2 && w > 4) { c.fillStyle = '#4a2a5a'; c.fillRect(Math.round(x + w / 2 - 2), y - 1, 1, 1); }   // ventosas
      }
    };
    const W = Math.ceil(LW / 18);
    for (let i = 0; i <= W; i++) {   // fileira de tentáculos de fundo
      const bx = i * 18 + Math.sin(i * 2.1) * 6, h = 30 + Math.sin(t * 1.7 + i * 1.3) * 10 + (i % 3) * 7;
      tentacle(bx, h, 11, i * 1.9, 8);
    }
    // o tentáculo que caça o Jerry: sobe mais alto e vai atrás dele (e o agarra quando pega)
    const reach = eat ? Math.max(0, base - jp.y - 6) * Math.min(1, e.t * 4) : 48 + Math.sin(t * 2.4) * 8;
    tentacle(this.mx, Math.max(48, reach), 14, 0.7, eat ? 2 : 10);
  }
  jerryPos(ox, rowY) {
    const j = this.j;
    if (j.hop) { const p = Math.min(1, j.hop.t / (j.hop.dur || this.hopT)); const y0 = rowY(j.hop.fr), y1 = rowY(j.hop.tr); return { x: ox + j.hop.fx + (j.hop.tx - j.hop.fx) * p, y: y0 + (y1 - y0) * p - Math.sin(p * Math.PI) * 6, air: true }; }
    const by = j.bump > 0 ? Math.round(Math.sin(j.bump * 50) * 1) : 0;
    return { x: ox + j.x + by, y: rowY(j.row), air: false };
  }
  drawJerry(c, ox, rowY) {
    const skin = SKIN_BY_ID[this.skinId || DEFAULT_SKIN], j = this.j, e = this.end;
    let { x, y, air } = this.jerryPos(ox, rowY);
    if (e && e.kind === 'water') return;
    if (e && e.kind === 'monstro') { if (e.t > 0.3) return; j.view = 'front'; }   // o monstro pegou: some na escuridão
    if (e && e.kind === 'portal') {   // o portal abre ao lado; ele olha, pula para dentro e o portal fecha
      const px = x + (x < ox + COLS * T / 2 ? 22 : -22), py = y + 5, k = e.t < 0.45 ? e.t / 0.45 : e.t < 1.25 ? 1 : Math.max(0, 1 - (e.t - 1.25) / 0.35);
      drawPortal(c, px, py, k, this.t);
      if (e.t > 1.15) return;
      if (e.t > 0.6) { const p = (e.t - 0.6) / 0.55; x += (px - x) * p; y -= Math.sin(p * Math.PI) * 8; c.globalAlpha = 1 - p * 0.8; }
      j.view = e.t > 0.6 ? (px > x ? 'side' : 'left') : 'front';
    }
    if (e && e.kind === 'hit') {   // achatado no chão, com estrelinhas girando por cima
      // de lado, achatado e esticado: o rabo e o corpo para fora, a cabeça embaixo da roda (o slime fica em cima dele todo)
      const fr = jerryFrame(e.dir > 0 ? 'side' : 'left', 'scared', 0, skin), k = Math.min(1, e.t / 0.08), h = Math.round(19 - 9 * k), w = Math.round(19 + 12 * k);
      c.drawImage(fr, Math.round(x) - Math.round(w / 2) - (e.slime ? 0 : e.dir > 0 ? 4 : -4), Math.round(y) + 13 - h, w, h);
      return;
    }
    // na ponta do tronco: o Jerry só se assusta (balança, cara de susto e o "!"); nada é marcado no mapa
    let edge = 0;
    if (j.on && !air && !e) {
      const o = j.on, lane = this.world.lane(j.row);
      if (lane && !lane.lily && o.w > T) { if (j.onOff <= T / 2 + 0.5) edge = -1; else if (j.onOff >= o.w - T / 2 - 0.5) edge = 1; }
      if (edge) x += Math.round(Math.sin(this.t * 14) * 1);
    }
    const pose = air ? 'hop' : edge ? 'scared' : 'idle';
    const fr = jerryFrame(j.view, pose, air ? 1 : Math.floor(this.t * 2) % 2 && pose === 'idle' ? 0 : 0, skin);
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(Math.round(x) - 5, Math.round((air ? y + Math.sin(Math.min(1, j.hop ? j.hop.t / (j.hop.dur || this.hopT) : 0) * Math.PI) * 6 : y)) + 12, 10, 2);
    if (skin.fx === 'ghost') c.globalAlpha *= 0.75;
    if (this.shield > 0 && Math.floor(this.t * 10) % 2) c.globalAlpha *= 0.35;   // acabou de reviver: piscando
    c.drawImage(fr, Math.round(x) - 9, Math.round(y) - 3);   // quadro 19x19 com os pés em (9, 17)
    c.globalAlpha = 1;
    if (skin.fx) this.drawAura(c, skin.fx, Math.round(x), Math.round(y) + 6);
    if (edge) { const by = Math.round(y) - 9 + (Math.floor(this.t * 6) % 2); c.fillStyle = '#1a1226'; c.fillRect(Math.round(x) - 2, by - 1, 4, 9); c.fillStyle = '#ffe070'; c.fillRect(Math.round(x) - 1, by, 2, 5); c.fillRect(Math.round(x) - 1, by + 6, 2, 1); }
  }
  // o esquilo mítico parado no caminho (com o brilho da skin) ou fugindo
  drawMyth(c, x, y, t, running) {
    const skin = SKIN_BY_ID[this.mythSkin]; if (!skin) return;
    const m = this.mythRun, hop = running ? Math.abs(Math.sin(m.t * 18)) * 4 : Math.abs(Math.sin(t * 2.5)) * 2;
    c.globalAlpha = 0.3 + Math.sin(t * 5) * 0.1; c.fillStyle = '#ff5a8a'; c.beginPath(); c.arc(Math.round(x), Math.round(y) + 7, 11, 0, 7); c.fill(); c.globalAlpha = 1;
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(Math.round(x) - 5, Math.round(y) + 12, 10, 2);
    const fr = running ? jerryFrame(m.dir > 0 ? 'side' : 'left', 'hop', 1, skin) : jerryFrame('front', 'idle', 0, skin);
    if (skin.fx === 'ghost') c.globalAlpha = 0.75;
    c.drawImage(fr, Math.round(x) - 9, Math.round(y - 3 - hop)); c.globalAlpha = 1;
    if (skin.fx) this.drawAura(c, skin.fx, Math.round(x), Math.round(y - hop) + 6);
    if (!running && Math.sin(t * 4) > 0.6) { c.fillStyle = '#ffffff'; c.fillRect(Math.round(x) + 6, Math.round(y) - 6, 1, 3); c.fillRect(Math.round(x) + 5, Math.round(y) - 5, 3, 1); }
    if (running) { c.fillStyle = 'rgba(232,232,240,0.7)'; for (let i = 1; i < 4; i++) c.fillRect(Math.round(x - m.dir * (6 + i * 5)), Math.round(y) + 11 - (i % 2), 3, 2); }
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
    if (g.kind !== 'world' || g.who) c.drawImage(jerryFrame('front', 'idle', 0, skin), x - 9, y - 6 - Math.round(Math.abs(Math.sin(this.t * 2 + g.row)) * 2));
    c.globalAlpha = passed ? 0.4 : 1;
    // texto no chão, logo acima da faixa
    const text = g.kind === 'world' || g.kind === 'best' ? `${g.name} ${g.row}` : g.name;
    label(c, text, ox + COLS * T / 2, y + T - 5, col, 8, 40);
    if (g.kind === 'world' && g.who) label(c, g.who, x, y - 7, col, 8, 8);   // quem tem o recorde mundial, em cima do fantasma
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
  const s = String(text).slice(0, max);
  // diminui a letra se o texto não couber na largura da tela
  for (;;) { c.font = `${size}px "Press Start 2P", monospace`; if (size <= 5 || c.measureText(s).width <= c.canvas.width - 8) break; size--; }
  c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  c.fillStyle = '#1a1226';
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) c.fillText(s, Math.round(x) + dx, Math.round(y) + dy);
  c.fillStyle = col; c.fillText(s, Math.round(x), Math.round(y));
}
