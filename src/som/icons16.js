// Ícones dos itens do inventário em 16x16, no mesmo estilo do Lyon e dos moradores: volume com luz e sombra,
// detalhes e contorno escuro em volta. Cada um é desenhado uma vez e guardado em cache.
const OL = '#1a1226';
const cache = new Map();
export function clearIcon16Cache() { cache.clear(); }

function outline(cv) {
  const c = cv.getContext('2d'), W = cv.width, H = cv.height, a = c.getImageData(0, 0, W, H).data;
  const solid = (x, y) => x >= 0 && y >= 0 && x < W && y < H && a[(y * W + x) * 4 + 3] > 100;
  c.fillStyle = OL;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) c.fillRect(x, y, 1, 1);
}
// linha de pixels (para cabos, lâminas e cordas na diagonal)
function line(R, x0, y0, x1, y1, col, w = 1) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) R(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), w, w, col);
}
// frasco: tampa de rolha, gargalo, bojo redondo com líquido, brilho e reflexo
function flask(R, liq, liqL, liqD, empty = false) {
  R(6, 0, 4, 2, '#9a6a3a'); R(6, 0, 4, 1, '#c8945a');
  R(6, 2, 4, 2, '#c8d4e8'); R(7, 2, 1, 2, '#ffffff');
  R(3, 4, 10, 1, '#c8d4e8'); R(2, 5, 12, 9, '#c8d4e8'); R(3, 14, 10, 1, '#c8d4e8');
  if (!empty) { R(3, 7, 10, 7, liq); R(2, 8, 12, 5, liq); R(3, 7, 10, 1, liqL); R(4, 13, 8, 1, liqD); R(11, 8, 2, 5, liqD); }
  R(4, 6, 2, 1, '#ffffff'); R(3, 7, 1, 3, '#ffffff'); R(10, 11, 1, 1, empty ? '#e8f0fa' : liqL);
}

const ART = {
  sword: (R) => {   // lâmina diagonal com friso, guarda dourada e cabo de couro
    line(R, 13, 2, 6, 9, '#dfe7f5', 2); line(R, 13, 2, 7, 8, '#ffffff'); line(R, 14, 3, 8, 9, '#8a94ac');
    R(13, 1, 2, 2, '#ffffff');
    line(R, 3, 7, 8, 12, '#e0c060', 2); R(5, 9, 2, 2, '#ffe9a8');
    line(R, 5, 11, 2, 14, '#6b4226', 2); R(1, 14, 2, 2, '#e0c060');
  },
  bow: (R) => {
    // só o arco: madeira curva com pontas reforçadas, empunhadura de couro e a corda
    const arc = [[7, 1], [8, 2], [9, 3], [10, 4], [10, 5], [11, 6], [11, 7], [11, 8], [11, 9], [10, 10], [10, 11], [9, 12], [8, 13], [7, 14]];
    for (const [x, y] of arc) { R(x - 1, y, 2, 1, '#9a5a2a'); R(x - 1, y, 1, 1, '#c8843a'); }
    R(5, 0, 3, 2, '#e0c060'); R(5, 14, 3, 2, '#e0c060');
    R(9, 6, 3, 4, '#4a2e1a'); R(9, 6, 3, 1, '#7a5232');
    line(R, 5, 1, 5, 14, '#f0eadc');
  },

  bombs: (R) => {   // bomba redonda com brilho, tampa de metal, pavio e faísca
    R(4, 5, 8, 10, '#2a2a3a'); R(3, 6, 10, 8, '#2a2a3a'); R(2, 8, 12, 4, '#2a2a3a');
    R(4, 6, 3, 2, '#5a5a7a'); R(4, 7, 1, 2, '#7a7a9a'); R(5, 6, 1, 1, '#9a9abc'); R(10, 12, 2, 2, '#1a1a26');
    R(6, 3, 4, 2, '#8a8a9a'); R(6, 3, 4, 1, '#c0c0d0');
    R(9, 2, 1, 1, '#8a6a3a'); R(10, 1, 1, 1, '#8a6a3a'); R(11, 0, 2, 2, '#ffb030'); R(12, 0, 1, 1, '#fff0a0');
  },
  firerod: (R) => {   // bastão de madeira com anel dourado e uma chama na ponta
    line(R, 2, 14, 10, 6, '#8a5a2a', 2); line(R, 2, 14, 9, 7, '#b07a46');
    R(9, 5, 3, 3, '#e0c060'); R(9, 5, 3, 1, '#ffe9a8');
    R(11, 1, 4, 5, '#ff6a1e'); R(12, 0, 2, 2, '#ff6a1e'); R(10, 3, 2, 3, '#ff6a1e'); R(12, 2, 2, 3, '#ffb030'); R(12, 3, 1, 2, '#fff0a0');
  },
  hammer: (R) => {   // martelo de ferro com cabeça grossa e cabo enrolado
    R(2, 2, 12, 6, '#8a94a8'); R(2, 2, 12, 2, '#c0c8d8'); R(2, 7, 12, 1, '#5a6278'); R(1, 3, 1, 4, '#5a6278'); R(14, 3, 1, 4, '#5a6278');
    R(4, 3, 1, 1, '#ffffff');
    R(7, 8, 3, 8, '#6a4024'); R(7, 8, 1, 8, '#9a6a3a'); for (const y of [10, 12, 14]) R(7, y, 3, 1, '#4a2e1a');
  },
  boomerang: (R) => {
    // bumerangue em L com os cantos chanfrados: cotovelo cortado na diagonal, rampa no canto de dentro e pontas azuis cortadas em ângulo
    const W = '#c8843a', L = '#e8a85a', D = '#8a5420', B = '#3a7ac8', BL = '#7ab8ff';
    const cell = (x, y) => {
      if (x < 2 || y < 1 || x > 15 || y > 15) return false;
      const top = y >= 2 && y <= 5 && x >= 2, left = x >= 2 && x <= 5 && y >= 2;
      if (!top && !left) return false;
      if (x + y < 6) return false;
      if (top && !left && x > 15 - (y - 2)) return false;
      if (left && !top && y > 15 - (x - 2)) return false;
      return true;
    };
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      if (!cell(x, y)) continue;
      const light = !cell(x, y - 1) || !cell(x - 1, y), dark = !cell(x, y + 1) || !cell(x + 1, y), tip = x >= 12 || y >= 12;
      R(x, y, 1, 1, tip ? (light ? BL : B) : light ? L : dark ? D : W);
    }
  },




  potion: (R) => flask(R, '#e83a7a', '#ff8ab4', '#a82050'),
  elixir: (R) => flask(R, '#3a8ae8', '#8ac4ff', '#1a5ab0'),
  bottle: (R) => flask(R, '', '', '', true),
  lantern: (R) => {   // lampião com alça, vidro e chama
    R(6, 0, 4, 1, '#5a5a6a'); R(5, 1, 1, 2, '#5a5a6a'); R(10, 1, 1, 2, '#5a5a6a');
    R(3, 3, 10, 2, '#5a5a6a'); R(3, 3, 10, 1, '#8a8a9a');
    R(4, 5, 8, 8, '#ffd040'); R(5, 6, 6, 6, '#ffe890'); R(7, 7, 2, 4, '#ffffff');
    R(3, 5, 1, 8, '#8a8a9a'); R(12, 5, 1, 8, '#5a5a6a'); R(7, 5, 2, 8, 'rgba(90,90,106,0.35)');
    R(3, 13, 10, 2, '#5a5a6a'); R(3, 13, 10, 1, '#8a8a9a');
  },
  glove: (R) => {   // luva de couro com dedos, punho e costura
    R(3, 5, 9, 8, '#c8843a'); for (const x of [3, 5, 7, 9]) { R(x, 1, 2, 5, '#c8843a'); R(x, 1, 1, 4, '#e8a85a'); }
    R(12, 6, 2, 4, '#c8843a'); R(12, 6, 2, 1, '#e8a85a');
    R(3, 12, 9, 3, '#8a5420'); R(3, 12, 9, 1, '#a86a30'); R(4, 9, 7, 1, '#e8a85a'); R(11, 5, 1, 7, '#a06020');
  },
  flippers: (R) => {   // pé de pato: dois pés azuis com membrana e tira
    for (const ox of [1, 9]) {
      R(ox, 6, 6, 9, '#3a8ae8'); R(ox + 1, 5, 4, 1, '#3a8ae8'); R(ox, 14, 6, 1, '#2a6ac0');
      R(ox + 1, 7, 1, 7, '#2a6ac0'); R(ox + 4, 7, 1, 7, '#2a6ac0'); R(ox, 6, 1, 6, '#7ab8ff');
      R(ox + 1, 2, 4, 3, '#1a4a8a'); R(ox + 1, 2, 4, 1, '#3a6aaa');
    }
  },
  boots: (R) => {
    // bota com a asinha atrás do calcanhar
    R(5, 2, 6, 10, '#3a7ac8'); R(5, 2, 2, 10, '#6aa8e8'); R(5, 11, 10, 4, '#3a7ac8'); R(5, 14, 10, 1, '#1a4a8a'); R(11, 12, 4, 1, '#6aa8e8');
    R(5, 2, 6, 2, '#e0e8f8');
    R(0, 4, 5, 2, '#ffffff'); R(1, 3, 4, 1, '#ffffff'); R(1, 6, 4, 1, '#c8d4e8'); R(2, 7, 3, 1, '#c8d4e8');
  },

  moonsword: (R) => {   // espada lunar azul-clara com brilho e lua na guarda
    line(R, 14, 1, 6, 9, '#9fe8ff', 2); line(R, 14, 1, 7, 8, '#ffffff'); line(R, 15, 2, 8, 9, '#5ab8e8');
    line(R, 3, 7, 8, 12, '#c8b0ff', 2); R(5, 9, 2, 2, '#ffffff');
    line(R, 5, 11, 2, 14, '#3a2a6a', 2); R(1, 14, 2, 2, '#9fe8ff');
  },
  mshield: (R) => {
    // escudo espelhado: aro dourado e o espelho prateado com reflexos
    R(2, 1, 12, 9, '#e0c060'); R(3, 10, 10, 2, '#e0c060'); R(5, 12, 6, 2, '#e0c060'); R(7, 14, 2, 1, '#e0c060');
    R(3, 2, 10, 8, '#c8d8ec'); R(4, 10, 8, 1, '#c8d8ec'); R(6, 11, 4, 2, '#c8d8ec');
    R(4, 3, 7, 6, '#e8f4ff'); R(5, 3, 2, 5, '#ffffff'); R(8, 4, 1, 3, '#ffffff'); R(11, 6, 1, 4, '#9ab0c8');
    R(2, 1, 12, 1, '#fff0a0');
  },

  blusa: (R) => {
    // camiseta azul: mangas curtas, gola em V e barra
    R(4, 3, 8, 12, '#3a6ec0'); R(1, 3, 3, 5, '#3a6ec0'); R(12, 3, 3, 5, '#3a6ec0');
    R(4, 3, 1, 12, '#5a90e0'); R(1, 3, 3, 1, '#5a90e0'); R(11, 4, 1, 11, '#28509a'); R(4, 14, 8, 1, '#28509a');
    R(6, 3, 4, 1, '#1a3a7a'); R(7, 4, 2, 2, '#1a3a7a'); R(1, 7, 3, 1, '#28509a'); R(12, 7, 3, 1, '#28509a');
  },

  jaleco: (R) => {   // jaleco branco com bolso e caneta
    R(3, 2, 10, 13, '#eef2f8'); R(0, 3, 3, 9, '#eef2f8'); R(13, 3, 3, 9, '#eef2f8');
    R(6, 2, 4, 5, '#8ab4e8'); R(7, 2, 2, 13, '#c8d2e2');
    R(9, 8, 3, 3, '#c8d2e2'); R(10, 6, 1, 3, '#3a5ab8'); R(12, 3, 1, 12, '#b4bfd2');
  },
  ring: (R) => {
    // anel de força: aro de ouro com uma pedra vermelha
    R(5, 7, 6, 1, '#e0b030'); R(4, 8, 1, 5, '#e0b030'); R(11, 8, 1, 5, '#e0b030'); R(5, 13, 6, 1, '#e0b030');
    R(5, 7, 6, 1, '#fff0a0'); R(4, 8, 1, 2, '#fff0a0'); R(10, 13, 1, 1, '#a07818');
    R(6, 3, 4, 4, '#e83a5a'); R(6, 3, 2, 2, '#ffb0c0'); R(9, 5, 1, 2, '#a01a3a');
  },

  dragon: (R) => {
    // uma escama de dragão: formato de gota, laranja-avermelhada, com brilho e sulcos
    R(5, 1, 6, 2, '#e8603a'); R(3, 3, 10, 6, '#e8603a'); R(4, 9, 8, 3, '#e8603a'); R(6, 12, 4, 2, '#e8603a'); R(7, 14, 2, 1, '#e8603a');
    R(5, 1, 3, 1, '#ffb090'); R(4, 3, 2, 5, '#ffb090'); R(6, 3, 3, 3, '#ffd23a'); R(7, 4, 1, 1, '#fff0a0');
    R(12, 4, 1, 5, '#a82a1a'); R(10, 9, 2, 3, '#a82a1a'); R(8, 12, 2, 2, '#a82a1a');
    line(R, 7, 7, 8, 12, '#a82a1a');
  },

  tridente: (R) => {
    // tridente da maré: cabo de madeira em pé e três pontas de cristal azul
    R(7, 6, 2, 10, '#8a6a42'); R(7, 6, 1, 10, '#b08a5a'); R(7, 15, 2, 1, '#5a4a2a');
    R(3, 5, 10, 2, '#7ad0e8'); R(3, 5, 10, 1, '#bff4ff');
    R(3, 1, 2, 4, '#9ae8ff'); R(11, 1, 2, 4, '#9ae8ff'); R(7, 0, 2, 5, '#bff4ff');
    R(3, 0, 1, 1, '#ffffff'); R(12, 0, 1, 1, '#ffffff'); R(7, 0, 1, 1, '#ffffff');
  },

  shard: (R) => {   // fragmento de cristal lunar
    R(6, 0, 4, 2, '#9fe8ff'); R(4, 2, 8, 10, '#9fe8ff'); R(6, 12, 4, 3, '#9fe8ff'); R(5, 12, 6, 1, '#9fe8ff');
    R(6, 2, 2, 10, '#ffffff'); R(10, 3, 2, 9, '#4ab0e0'); R(5, 4, 1, 6, '#d0f8ff');
  },
  shell: (R) => {
    // concha lunar: concha em leque com gomos, base em gancho, brilho perolado lilás e um brilhinho de lua
    const rows = [[6, 9], [4, 11], [3, 12], [2, 13], [1, 14], [1, 14], [1, 14], [2, 13], [3, 12], [5, 10]];
    rows.forEach(([x0, x1], i) => R(x0, 2 + i, x1 - x0 + 1, 1, '#f2d4ec'));
    R(5, 12, 6, 2, '#d8a8d0'); R(6, 14, 4, 1, '#c088b8'); R(4, 12, 1, 1, '#d8a8d0'); R(11, 12, 1, 1, '#d8a8d0');
    // gomos (sulcos que abrem em leque a partir da base)
    for (const [x0, x1] of [[3, 6], [5, 7], [8, 8], [10, 9], [12, 10]]) { const n = 8; for (let i = 0; i <= n; i++) R(Math.round(x0 + (x1 - x0) * i / n), 3 + i, 1, 1, '#c890c0'); }
    // luz em cima à esquerda, sombra embaixo à direita
    R(6, 2, 3, 1, '#ffffff'); R(4, 3, 2, 1, '#ffffff'); R(2, 5, 1, 3, '#fff0fa'); R(13, 6, 1, 4, '#b878b0'); R(11, 10, 2, 1, '#b878b0');
    R(7, 13, 2, 1, '#a868a0');
    // brilho lunar
    R(10, 4, 1, 1, '#bfe8ff'); R(11, 5, 1, 1, '#ffffff'); R(9, 5, 1, 1, '#bfe8ff');
  },
  shell3: (R) => ART.shell(R),
  ore3: (R) => ART.ore(R), ore5: (R) => ART.ore(R),   // pacotes de minério (baús) usam o mesmo desenho
  ore: (R) => {
    // pedaço bruto de rocha com faces irregulares (luz em cima à esquerda, sombra embaixo à direita) e cristais de minério encravados
    const rows = [[5, 9], [3, 11], [2, 12], [1, 13], [1, 14], [1, 14], [1, 15], [2, 15], [2, 14], [3, 14], [3, 13], [4, 12]];
    rows.forEach(([x0, x1], i) => R(x0, 2 + i, x1 - x0 + 1, 1, '#6e6672'));
    // faces: topo claro, lado esquerdo médio, base e lado direito escuros
    R(5, 2, 5, 1, '#a49aa6'); R(3, 3, 6, 1, '#a49aa6'); R(2, 4, 5, 1, '#948a96'); R(9, 3, 3, 2, '#8a808c');
    R(1, 5, 3, 5, '#847a86'); R(2, 10, 2, 2, '#5a525e');
    R(12, 6, 3, 4, '#4e4652'); R(10, 11, 4, 2, '#4e4652'); R(4, 13, 9, 1, '#3e3842'); R(13, 9, 2, 2, '#3e3842');
    // quinas e rachaduras
    R(7, 5, 1, 4, '#5a525e'); R(8, 8, 3, 1, '#5a525e'); R(4, 8, 2, 1, '#5a525e');
    // veios de minério: pepitas alaranjadas e douradas com ponto de brilho
    R(4, 6, 2, 2, '#c8701e'); R(4, 6, 1, 1, '#ffb050');
    R(9, 5, 2, 2, '#d8a020'); R(9, 5, 1, 1, '#fff0a0');
    R(10, 9, 2, 2, '#c8701e'); R(10, 9, 1, 1, '#ffb050'); R(12, 8, 1, 1, '#d8a020');
    R(6, 10, 1, 1, '#d8a020'); R(3, 11, 1, 1, '#c8701e');
  },

};

// versões pequenas (10x10 com contorno) desenhadas à mão para itens que perdem a forma quando reduzidos
const SMALL = {
  shell: (R) => {   // concha em leque: gomos, base em gancho e brilho
    const O = '#1a1226';
    R(3, 0, 4, 1, O); R(1, 1, 8, 1, O); R(0, 2, 10, 4, O); R(1, 6, 8, 1, O); R(2, 7, 6, 2, O); R(3, 9, 4, 1, O);
    R(3, 1, 4, 1, '#f2d4ec'); R(1, 2, 8, 4, '#f2d4ec'); R(2, 6, 6, 1, '#f2d4ec'); R(3, 7, 4, 1, '#d8a8d0'); R(4, 8, 2, 1, '#c088b8');
    R(2, 3, 1, 3, '#c890c0'); R(4, 2, 1, 4, '#c890c0'); R(6, 2, 1, 4, '#c890c0'); R(8, 3, 1, 2, '#c890c0');
    R(3, 1, 2, 1, '#ffffff'); R(1, 2, 1, 2, '#ffffff'); R(7, 2, 1, 1, '#bfe8ff');
  },
};
SMALL.shell3 = SMALL.shell;
function icon16Canvas(name) {
  const art = ART[name];
  if (!art) return null;
  let cv = cache.get(name);
  if (!cv) {
    cv = document.createElement('canvas'); cv.width = cv.height = 18;
    const c = cv.getContext('2d');
    const R = (xx, yy, w, h, col) => { if (!col) { c.clearRect(xx + 1, yy + 1, w, h); return; } c.fillStyle = col; c.fillRect(xx + 1, yy + 1, w, h); };
    art(R);
    outline(cv);
    cache.set(name, cv);
  }
  return cv;
}
export { icon16Canvas };
// versão menor (n x n, com o contorno) para o HUD, o chão e lugares de 8x8: a redução volta para as cores do próprio ícone
export function icon16Small(name, n = 10) {
  const key = name + '@' + n;
  if (cache.has(key)) return cache.get(key);
  if (SMALL[name] && n <= 12) {   // desenho próprio para o tamanho pequeno (a redução apagaria os detalhes)
    const cv = document.createElement('canvas'); cv.width = cv.height = n; const c = cv.getContext('2d'), o = Math.floor((n - 10) / 2);
    SMALL[name]((x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x + o, y + o, w, h); });
    cache.set(key, cv); return cv;
  }
  const src = icon16Canvas(name);
  if (!src) return null;
  const sd = src.getContext('2d').getImageData(0, 0, 18, 18).data, pal = new Map();
  for (let i = 0; i < sd.length; i += 4) if (sd[i + 3] > 200) pal.set((sd[i] << 16) | (sd[i + 1] << 8) | sd[i + 2], [sd[i], sd[i + 1], sd[i + 2]]);
  const P = [...pal.values()], out = document.createElement('canvas'); out.width = out.height = n;
  const c = out.getContext('2d'); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  c.drawImage(src, 0, 0, 18, 18, 0, 0, n, n);
  const img = c.getImageData(0, 0, n, n), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 100) { d[i + 3] = 0; continue; }
    let best = P[0], bd = 1e9;
    for (const q of P) { const e = (q[0] - d[i]) ** 2 + (q[1] - d[i + 1]) ** 2 + (q[2] - d[i + 2]) ** 2; if (e < bd) { bd = e; best = q; } }
    d[i] = best[0]; d[i + 1] = best[1]; d[i + 2] = best[2]; d[i + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  cache.set(key, out);
  return out;
}
// desenha o ícone 16x16 de `name` com o canto em x,y; devolve false se não houver desenho novo para ele
export function drawIcon16(ctx, name, x, y) {
  const cv = icon16Canvas(name);
  if (!cv) return false;
  ctx.drawImage(cv, x - 1, y - 1);
  return true;
}
export const ICON16 = Object.keys(ART);
