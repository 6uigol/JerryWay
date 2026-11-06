// O mundo infinito do Jerry's Way: faixas geradas para cima, sem fim. Cada faixa é grama (com árvores e pedras),
// estrada (carroças e carruagens), rio (troncos e vitórias-régias), trilho (Trem Infinito) ou campo de slimes.
// A câmera sobe sozinha devagar; se ela passar do Jerry, ele abre um portal para Lacrímora e vai embora.
export const TILE = 16, COLS = 9;            // 9 colunas jogáveis
// esquilo mítico: um sorteio só por partida (não acumula por fileira): 0,00014% de chance de a partida ter um.
// Se tiver, ele aparece uma vez só, numa fileira de grama entre a 200 e a 600.
export const MYTH_RUN_CHANCE = 0.0000014, MYTH_ROW = 200, MYTH_SPREAD = 400;
export const SPAN = 9 * TILE;                // objetos andam também fora da área jogável (aparecem nas laterais da tela)
const MINX = -SPAN, MAXX = COLS * TILE + SPAN;

// zonas que se repetem conforme o Jerry sobe
export const ZONES = [
  { id: 'campo', name: 'Campo de Brumavale' },
  { id: 'floresta', name: 'Floresta Sombria' },
  { id: 'deserto', name: 'Dunas' },
  { id: 'neve', name: 'Picos Gelados' },
  { id: 'lacrimora', name: 'Lacrímora' },
  { id: 'lua', name: 'A Lua' },
];
export const ZONE_LEN = 120;
export const zoneAt = (row) => ZONES[Math.floor(Math.max(0, row) / ZONE_LEN) % ZONES.length];

// gerador de números com semente (cada partida tem a sua)
export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

// dimensões bônus: um portal dourado aparece de vez em quando no caminho (na coluna livre da grama). Pulando nele,
// o Jerry vai para uma fase curta cheia de moedas e volta para o mesmo lugar da corrida (a distância não conta lá dentro).
// Se cair, for atropelado ou a tela passar dele lá dentro, ele só volta antes (não morre).
// Toda dimensão bônus é um labirinto passável (médio-difícil) numa tela só, com o tema e uma mecânica própria.
// Chegar ao portal de saída antes do tempo vale +3 moedas; se o tempo acabar, volta sem esse bônus.
export const BONUS = {
  labirinto: { name: 'Labirinto da Floresta', zone: 'floresta', hint: 'Ache a saída do labirinto!' },
  cofre:     { name: 'Cofre da Lua', zone: 'lua', hint: 'Muitas moedas! Ache a saída!' },
  lagoa:     { name: 'Lagoa Dourada', zone: 'campo', hint: 'Só dá para pisar nas vitórias-régias!' },
  mina:      { name: 'Mina de Lacrímora', zone: 'lacrimora', hint: 'Desvie dos slimes no caminho!' },
  trilhos:   { name: 'Trilhos Dourados', zone: 'neve', hint: 'Cuidado com os carrinhos!' },
  vento:     { name: 'Tempestade nas Dunas', zone: 'deserto', hint: 'O vento empurra você!' },
  chuva:     { name: 'Chuva de Estrelas', zone: 'lua', hint: 'Fuja das sombras: meteoros!' },
  gelo:      { name: 'Lago Congelado', zone: 'neve', hint: 'No gelo você escorrega até a curva!' },
  caca:      { name: 'Caça ao Esquilo Dourado', zone: 'campo', hint: 'Pegue o esquilo dourado no labirinto!' },
};
export const BONUS_TIME = 10, ARENA_ROWS = 10, BONUS_START = [4, 0];   // segundos de cada dimensão (máximo 10); a arena tem 10 fileiras
export const BONUS_MAX = { small: 17, big: 3 };                         // no máximo 17 moedas normais e 3 moedas de 5 em cada dimensão
export const BONUS_FINISH = 3;                                          // moedas a mais por chegar à saída antes do tempo
// chance pequena-média: a partir da fileira 60, cada grama tem 1,2% de chance de ter o portal, com pelo menos 150 fileiras entre um
// e outro (em média um a cada ~350 fileiras; a habilidade Explorador aumenta a chance)
export const BONUS_FIRST = 60, BONUS_GAP = 150, BONUS_CHANCE = 0.012;

export class World {
  // kind: null = o caminho normal; senão, uma dimensão bônus (ver BONUS)
  constructor(seed, kind = null, bonusRate = 1) {
    this.kind = kind; this.bonusRate = bonusRate; this.bigChance = 0.1;
    this.r = rng(seed);
    this.lanes = new Map();
    this.next = 0;        // próxima faixa a gerar
    this.pathCol = 4;     // coluna sempre livre na grama (garante que sempre exista caminho)
    this.lastType = 'grass';
    // atrás do começo: grama com árvores (a tela começa um pouco abaixo da largada)
    for (let row = -12; row < 0; row++) {
      const L = this.base(row, 'grass');
      for (let c = -9; c < COLS + 9; c++) if ((c < 0 || c >= COLS || row < -2) && this.r() < (c < 0 || c >= COLS ? 0.6 : 0.35)) (c < 0 || c >= COLS ? L.deco.push(c) : L.block.add(c));
    }
    if (kind) for (const L of this.lanes.values()) L.zone = BONUS[kind].zone;
    this.next = 0;
    this.nextBonus = BONUS_FIRST;
    this.ensure(30);
  }
  diff(row) { return Math.min(1, row / 700); }
  lane(row) { return this.lanes.get(row); }
  ensure(upTo) { while (this.next <= upTo) this.genGroup(); }
  prune(below) { for (const k of this.lanes.keys()) if (k < below) this.lanes.delete(k); }

  genGroup() {
    if (this.kind) return this.genBonus();
    const r = this.r, row = this.next;
    if (row < 5) { this.addGrass(row, row === 0 ? 0 : 0.12); return; }
    const d = this.diff(row);
    const opts = [['grass', 26], ['road', 30 + d * 6], ['river', 22], ['rail', row > 15 ? 10 + d * 4 : 0], ['slime', row > 35 ? 7 + d * 4 : 0]];
    let tot = 0; for (const o of opts) tot += o[1];
    let pick = r() * tot, type = 'grass';
    for (const [k, w] of opts) { if (pick < w) { type = k; break; } pick -= w; }
    if (type === this.lastType && type !== 'grass') type = 'grass';   // entre grupos iguais sempre um respiro de grama
    this.lastType = type;
    const n = type === 'road' ? 1 + Math.floor(r() * (2 + d * 2.5)) : type === 'river' ? 1 + Math.floor(r() * (1.6 + d * 1.6)) : type === 'rail' ? 1 + (r() < 0.25 + d * 0.3 ? 1 : 0) : type === 'slime' ? 1 : 1 + Math.floor(r() * 2);
    let dir = r() < 0.5 ? -1 : 1;
    for (let i = 0; i < n; i++) {
      const rw = this.next;
      if (type === 'grass') this.addGrass(rw, (0.18 + d * 0.22) * (this.lane(rw - 1)?.type === 'river' || i === n - 1 ? 0.45 : 1));   // margem do rio mais aberta
      else if (type === 'road') this.addRoad(rw, dir, d);
      else if (type === 'river') this.addRiver(rw, dir, d);
      else if (type === 'rail') this.addRail(rw, d);
      else this.addSlime(rw, dir, d);
      dir = type === 'river' || r() < 0.75 ? -dir : dir;   // rios seguidos sempre em sentidos contrários
    }
  }
  base(row, type) {
    const L = { row, type, zone: zoneAt(row).id, block: new Set(), deco: [], coins: new Map(), objs: [], dir: 1, speed: 0 };
    this.lanes.set(row, L); this.next = row + 1;
    return L;
  }
  coins(L, chance) {
    const r = this.r;
    if (r() < chance) { let c; for (let t = 0; t < 6; t++) { c = Math.floor(r() * COLS); if (!L.block.has(c)) break; } if (!L.block.has(c)) L.coins.set(c, r() < this.bigChance ? 5 : 1); }
  }
  addGrass(row, density) {
    const r = this.r, L = this.base(row, 'grass');
    // a coluna livre anda devagar para os lados, para o caminho não ser uma reta
    // (quando ela muda, a coluna anterior também fica livre nesta fileira: dá para subir e depois andar de lado)
    const prev = this.pathCol;
    if (r() < 0.45) this.pathCol = Math.max(0, Math.min(COLS - 1, this.pathCol + (r() < 0.5 ? -1 : 1)));
    for (let c = 0; c < COLS; c++) if (c !== this.pathCol && c !== prev && r() < density && row > 2) L.block.add(c);
    if (row === 0) L.block.clear();
    // fora da área jogável sempre tem árvores (o limite do caminho)
    for (let c = -9; c < 0; c++) if (r() < 0.55) L.deco.push(c);
    for (let c = COLS; c < COLS + 9; c++) if (r() < 0.55) L.deco.push(c);
    L.variant = Math.floor(r() * 4);
    this.coins(L, row < 3 ? 0 : 0.3);
    // esquilo mítico: só nas partidas sorteadas (e se faltar mítica), na fileira marcada, no máximo um por partida
    if (this.mythOn && !this.mythDone && row >= this.mythAt) { L.myth = this.pathCol; L.coins.delete(this.pathCol); this.mythDone = true; }
    // portal dourado da dimensão bônus (na coluna livre, então sempre dá para chegar nele)
    else if (!this.kind && row >= this.nextBonus && r() < BONUS_CHANCE * this.bonusRate) {
      L.bonus = this.pathCol; L.coins.delete(this.pathCol);
      this.nextBonus = row + BONUS_GAP;
    }
  }
  // ---------------------------------------------------------------- dimensão bônus (labirinto numa tela só)
  genBonus() {
    const r = this.r, row = this.next, B = BONUS[this.kind];
    if (!this.layout) this.layout = this.makeMaze();
    const lily = this.kind === 'lagoa' && row >= 0 && row < ARENA_ROWS;
    const L = this.base(row, lily ? 'river' : 'grass'); L.variant = Math.floor(r() * 4);
    for (let c = -9; c < 0; c++) if (r() < 0.55) L.deco.push(c); for (let c = COLS; c < COLS + 9; c++) if (r() < 0.55) L.deco.push(c);
    if (row < ARENA_ROWS) {
      const A = this.layout[row];
      for (let c = 0; c < COLS; c++) {
        if (A.block[c]) L.block.add(c);   // parede (na lagoa, água: não dá para pisar)
        else { if (lily) L.objs.push({ x: c * TILE, w: TILE, kind: 0 }); if (A.coin[c]) L.coins.set(c, A.coin[c]); }
      }
      if (lily) L.lily = true;
      if (A.exit !== undefined) L.exit = A.exit;
    }
    L.zone = B.zone; L.bonusLane = true;
  }
  // labirinto perfeito (casas nas posições pares, 5 x 5) cavado a partir da largada, com 2 atalhos para não ficar linear demais;
  // a saída é a casa mais longe da largada. Moedas variam: 8 a 17 normais e 0 a 3 de 5 (Cofre da Lua: mais).
  makeMaze() {
    const r = this.r, [sc, sr] = BONUS_START, k = this.kind;
    const A = Array.from({ length: ARENA_ROWS }, (_, y) => ({ block: Array.from({ length: COLS }, (_, x) => !(x % 2 === 0 && y % 2 === 0 && y < 9)), coin: Array(COLS).fill(0) }));
    const key = (x, y) => x + ',' + y, seen = new Set([key(sc, sr)]), stack = [[sc, sr]];
    while (stack.length) {
      const [x, y] = stack[stack.length - 1];
      const nb = [[2, 0], [-2, 0], [0, 2], [0, -2]].map(([dx, dy]) => [x + dx, y + dy]).filter(([a, b]) => a >= 0 && a < COLS && b >= 0 && b < 9 && !seen.has(key(a, b)));
      if (!nb.length) { stack.pop(); continue; }
      const [nx, ny] = nb[Math.floor(r() * nb.length)];
      A[(y + ny) / 2].block[(x + nx) / 2] = false; seen.add(key(nx, ny)); stack.push([nx, ny]);
    }
    for (let n = 0, t = 0; n < 2 && t < 40; t++) {   // 2 atalhos: abre paredes entre duas casas
      const x = Math.floor(r() * COLS), y = Math.floor(r() * 9);
      if (y < 9 && A[y].block[x] && ((x % 2 === 1 && y % 2 === 0) || (x % 2 === 0 && y % 2 === 1))) { A[y].block[x] = false; n++; }
    }
    // distância de cada casa até a largada (a saída fica na mais longe)
    const dist = { [key(sc, sr)]: 0 }, q = [[sc, sr]]; let far = [sc, sr];
    while (q.length) {
      const [x, y] = q.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= COLS || ny < 0 || ny >= ARENA_ROWS || A[ny].block[nx] || key(nx, ny) in dist) continue;
        dist[key(nx, ny)] = dist[key(x, y)] + 1; q.push([nx, ny]);
        if (dist[key(nx, ny)] > dist[key(far[0], far[1])]) far = [nx, ny];
      }
    }
    A[far[1]].exit = far[0];
    const free = [];
    for (let y = 0; y < ARENA_ROWS; y++) for (let x = 0; x < COLS; x++) if (!A[y].block[x] && !(x === sc && y === sr) && !(x === far[0] && y === far[1])) free.push([x, y]);
    for (let i = free.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [free[i], free[j]] = [free[j], free[i]]; }
    const small = k === 'cofre' ? 14 + Math.floor(r() * 4) : 8 + Math.floor(r() * 10), big = k === 'caca' ? 0 : Math.floor(r() * (BONUS_MAX.big + 1));   // na Caça, as moedas de 5 são do esquilo
    free.slice(0, Math.min(BONUS_MAX.small, small)).forEach(([x, y]) => { A[y].coin[x] = 1; });
    free.slice(small, small + Math.min(BONUS_MAX.big, big)).forEach(([x, y]) => { A[y].coin[x] = 5; });
    this.open = free;   // casas livres (para o esquilo, os slimes e os carrinhos)
    return A;
  }
  // objetos que andam na faixa: espaçados com folga, dando a volta pelos dois lados
  movers(L, count, minW, maxW, gap, even = false) {
    const total = MAXX - MINX;
    count = Math.max(1, Math.min(count, Math.floor(total / ((maxW + gap) * TILE))));
    const r = this.r, slot = total / count, off = r() * slot;
    for (let i = 0; i < count; i++) {   // cada um na sua fatia da volta, então nunca se encostam
      const w = (minW + Math.floor(r() * (maxW - minW + 1))) * TILE;
      const x = MINX + ((off + i * slot + r() * Math.max(0, even ? Math.min(TILE, slot - w - gap * TILE) : slot - w - gap * TILE)) % total);   // even: espalhados por igual (rios)
      L.objs.push({ x, w, kind: Math.floor(r() * 3) });
    }
  }
  addRoad(row, dir, d) {
    const r = this.r, L = this.base(row, 'road');
    L.dir = dir; L.speed = (24 + d * 46 + r() * 18) * (0.85 + r() * 0.3);
    const big = r() < 0.35;
    this.movers(L, 2 + Math.floor(r() * (1.5 + d * 2)), big ? 3 : 2, big ? 3 : 2, 3);
    this.coins(L, 0.22);
  }
  addRiver(row, dir, d) {
    const r = this.r, L = this.base(row, 'river');
    if (r() < 0.22 && d < 0.8) {   // vitórias-régias paradas (sempre uma na coluna livre)
      L.lily = true;
      for (let c = 0; c < COLS; c++) if (c === this.pathCol || r() < 0.38) L.objs.push({ x: c * TILE, w: TILE, kind: 0 });
      return;
    }
    L.dir = dir; L.speed = (16 + d * 30 + r() * 12);
    // troncos suficientes para sempre ter onde pular: o vão entre dois nunca passa de umas 4 casas
    const minW = 2 + (d > 0.6 ? 0 : 1), maxW = 4 - (d > 0.6 ? 1 : 0), need = Math.ceil((MAXX - MINX) / ((minW + 4) * TILE));
    this.movers(L, Math.max(need, 3 + Math.floor(r() * 2)), minW, maxW, 1.5 + d * 1.5, true);
  }
  addRail(row, d) {
    const r = this.r, L = this.base(row, 'rail');
    L.dir = r() < 0.5 ? -1 : 1; L.speed = 420 + d * 120;
    L.timer = 1.5 + r() * 4; L.train = null;
    this.coins(L, 0.18);
  }
  addSlime(row, dir, d) {
    const r = this.r, L = this.base(row, 'slime');
    L.dir = dir; L.speed = 18 + d * 26;
    this.movers(L, 3 + Math.floor(d * 3), 1, 1, 2);
    for (const o of L.objs) o.ph = r() * 6;
    this.coins(L, 0.35);
  }

  update(dt, rnd) {
    for (const L of this.lanes.values()) {
      if (L.frozen) continue;   // a faixa que atropelou o Jerry para em cima dele
      if (L.type === 'rail') {
        if (L.train) {
          L.train.x += L.dir * L.speed * dt;
          if ((L.dir > 0 && L.train.x > MAXX + 40) || (L.dir < 0 && L.train.x + L.train.w < MINX - 40)) { L.train = null; L.timer = L.fast ? 0.8 + rnd() * 2 : 2 + rnd() * 5; }
        } else {
          L.timer -= dt;
          if (L.timer <= 0) { const w = 12 * TILE; L.train = { w, x: L.dir > 0 ? MINX - w : MAXX }; }
        }
        continue;
      }
      if (!L.speed) continue;
      const total = MAXX - MINX;
      for (const o of L.objs) {
        o.x += L.dir * L.speed * dt;
        if (o.x > MAXX) o.x -= total; else if (o.x + o.w < MINX) o.x += total;
        if (o.ph !== undefined) o.ph += dt * 6;
      }
    }
  }
  // o trem está para passar? (a luz pisca e o sino toca)
  warning(L) { return L.type === 'rail' && !L.train && L.timer < 1.3; }
}
