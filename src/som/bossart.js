// Arte dos chefes: cada um é desenhado numa tela à parte (caixa de 32×32 com origem no canto de cima),
// depois colado com um contorno escuro de 1 pixel, no mesmo estilo do Lyon e dos monstros comuns.
// Brilhos, halos e partículas ficam fora do contorno (camadas "atrás" e "na frente").

const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
// elipse cheia, linha por linha (sem antisserrilhado)
function oval(c, cx, cy, rx, ry, col) {
  c.fillStyle = col;
  for (let dy = -ry; dy <= ry; dy++) {
    const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy / (ry + 0.5)) ** 2)));
    if (hw > 0) c.fillRect(Math.round(cx - hw), Math.round(cy + dy), hw * 2, 1);
  }
}
// volume: sombra embaixo, cor base, brilho no alto à esquerda
function blob(c, cx, cy, rx, ry, [d, b, l]) {
  oval(c, cx, cy, rx, ry, d); oval(c, cx, cy - 1, rx - 1, ry - 1, b);
  if (l) oval(c, cx - Math.round(rx / 3), cy - Math.round(ry / 2), Math.max(1, Math.round(rx / 3)), Math.max(1, Math.round(ry / 4)), l);
}
// olho com íris, pupila e brilho; atordoado vira um risco
function eye(c, x, y, w, h, iris, stun, pupil = '#140c1c') {
  R(c, x, y, w, h, '#fff8ec');
  if (stun) { R(c, x, y, w, h, '#6a6478'); R(c, x, y + (h >> 1), w, 1, '#2a2438'); return; }
  const iw = Math.max(1, w - 1), ih = Math.max(1, h - 1);
  R(c, x + w - iw, y + h - ih, iw, ih, iris);
  R(c, x + w - iw + (iw >> 1), y + h - ih + (ih >> 1), Math.max(1, iw >> 1), Math.max(1, ih - (ih >> 1)), pupil);
  R(c, x + w - iw, y + h - ih, 1, 1, '#ffffff');
}
// olho que brilha (sem branco): órbitas, robôs, fantasmas
function glowEye(c, x, y, w, h, col, stun) {
  if (stun) { R(c, x, y + (h >> 1), w, 1, '#5a5468'); return; }
  R(c, x, y, w, h, col); R(c, x, y, 1, 1, '#ffffff');
}
const STUN = (s) => s === 'stun';
// o chefe está andando? (parado, as pernas não marcam passo)
let WALK = true;
export const setBossWalking = (v) => { WALK = v !== false; };
// linha de pixels com espessura
function line(c, x0, y0, x1, y1, w, col) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
  c.fillStyle = col;
  for (let i = 0; i <= n; i++) c.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), w, w);
}

// ------------------------------------------------------------------ camadas de efeito (sem contorno)
function shadow(c, x, y, w = 28, a = 0.35, col = '0,0,0') { c.fillStyle = `rgba(${col},${a})`; oval(c, x + 16, y + 30, w / 2, 2, `rgba(${col},${a})`); }
const FX_BACK = {
  primordial(c, x, y, t) {
    c.globalAlpha = 0.18 + 0.1 * Math.sin(t * 3); oval(c, x + 16, y + 15, 24, 22, '#bfe8ff'); c.globalAlpha = 0.25; oval(c, x + 16, y + 15, 17, 16, '#e8f8ff'); c.globalAlpha = 1;
    shadow(c, x, y, 36, 0.5, '4,12,30');
  },
  leviathan(c, x, y, t) { shadow(c, x, y, 36, 0.5, '4,12,30'); c.globalAlpha = 0.22 + 0.15 * Math.sin(t * 4); oval(c, x + 13, y - 4, 8, 7, '#fff3a0'); c.globalAlpha = 1; },
  siren(c, x, y, t) { shadow(c, x, y, 26, 0.3, '8,24,48'); c.globalAlpha = 0.16 + 0.1 * Math.sin(t * 4); oval(c, x + 16, y + 10, 16, 15, '#e8b0ff'); c.globalAlpha = 1; },
  phantom(c, x, y, t) { shadow(c, x, y, 24, 0.3, '8,24,48'); c.globalAlpha = 0.14 + 0.08 * Math.sin(t * 5); oval(c, x + 29, y + 22, 6, 6, '#ffe58a'); c.globalAlpha = 1; },
  icequeen(c, x, y, t) { shadow(c, x, y, 24, 0.3); c.globalAlpha = 0.12 + 0.06 * Math.sin(t * 3); oval(c, x + 16, y + 14, 16, 17, '#d8f4ff'); c.globalAlpha = 1; },
  moonking(c, x, y, t) { shadow(c, x, y, 30, 0.35); c.globalAlpha = 0.14 + 0.08 * Math.sin(t * 3); oval(c, x + 16, y + 2, 14, 8, '#fff2b0'); c.globalAlpha = 1; },
  kraken(c, x, y) { shadow(c, x, y, 30, 0.4, '8,24,48'); },
  coral(c, x, y) { shadow(c, x, y, 30, 0.4, '8,24,48'); },
  moray() {}, serpent() {},
};
const FX_FRONT = {
  siren(c, x, y, t) {
    for (let i = 0; i < 3; i++) {   // notas musicais subindo
      const p = (t * 0.7 + i / 3) % 1, nx = x + 3 + i * 12 + Math.round(Math.sin(t * 3 + i) * 2), ny = y - 2 - Math.round(p * 12);
      c.globalAlpha = 1 - p; R(c, nx, ny, 2, 2, '#ffffff'); R(c, nx + 1, ny - 4, 1, 4, '#ffffff'); R(c, nx + 2, ny - 4, 2, 1, '#ffffff');
    }
    c.globalAlpha = 1;
  },
  primordial(c, x, y, t) {
    c.globalAlpha = 0.45; c.strokeStyle = '#d8f4ff'; c.lineWidth = 1;
    for (let i = 0; i < 3; i++) { const r = 18 + ((t * 14 + i * 9) % 26); c.beginPath(); c.arc(x + 16, y + 16, r, 0, 7); c.stroke(); }
    c.globalAlpha = 1;
  },
  icequeen(c, x, y, t) {
    for (let i = 0; i < 4; i++) { const a = t * 1.6 + i * 1.57, sx = x + 16 + Math.round(Math.cos(a) * 17), sy = y + 14 + Math.round(Math.sin(a) * 9); R(c, sx, sy, 1, 1, '#ffffff'); if ((i + Math.floor(t * 4)) % 2) { R(c, sx - 1, sy, 3, 1, '#d8f4ff'); R(c, sx, sy - 1, 1, 3, '#d8f4ff'); } }
  },
  moonking(c, x, y, t) {
    for (let i = 0; i < 3; i++) { const p = (t * 0.5 + i / 3) % 1; c.globalAlpha = 1 - p; R(c, x + 6 + i * 10, y - 6 - Math.round(p * 8), 1, 1, '#fff2b0'); }
    c.globalAlpha = 1;
  },
  phantom(c, x, y, t) { c.globalAlpha = 0.5; for (let i = 0; i < 3; i++) { const p = (t * 0.8 + i / 3) % 1; R(c, x + 8 + i * 7, y + 30 - Math.round(p * 10), 1, 1, '#d8f0ff'); } c.globalAlpha = 1; },
};

// ------------------------------------------------------------------ chefes
const ART = {};

ART.rootboss = (c, t, state) => {   // Raiz Anciã: tronco velho com rosas da jardineira
  const D = '#3a2216', B = '#6e4428', L = '#9c6a3c', st = STUN(state);
  for (let i = 0; i < 6; i++) {   // raízes que se mexem
    const rx = 1 + i * 6 - (i > 2 ? 1 : 0), w = Math.round(Math.sin(t * 3 + i * 1.3) * 2), len = 6 + (i % 2) * 2;
    R(c, rx + (i < 3 ? -1 : 1) * (w > 0 ? 1 : 0), 24, 4, len, D); R(c, rx + 1, 24, 2, len - 1, B); R(c, rx + (i < 3 ? -1 : 2) + w, 23 + len, 3, 2, D);
  }
  const sw = Math.round(Math.sin(t * 2) * 1.5);
  // braços de galho
  R(c, -3, 11 + sw, 8, 3, D); R(c, -2, 12 + sw, 7, 1, B); R(c, -4, 6 + sw, 3, 7, D); R(c, -3, 7 + sw, 1, 5, B); R(c, -6, 5 + sw, 4, 3, '#3a7a3a');
  R(c, 27, 11 - sw, 8, 3, D); R(c, 27, 12 - sw, 7, 1, B); R(c, 33, 6 - sw, 3, 7, D); R(c, 34, 7 - sw, 1, 5, B); R(c, 34, 5 - sw, 4, 3, '#3a7a3a');
  // tronco
  blob(c, 16, 16, 13, 12, [D, B, L]);
  for (const [bx, by, bh] of [[7, 12, 9], [12, 20, 6], [21, 18, 8], [25, 11, 7], [16, 7, 4]]) R(c, bx, by, 1, bh, '#4e301c');
  R(c, 5, 22, 6, 3, '#3a7a3a'); R(c, 6, 22, 3, 1, '#6ab04a'); R(c, 22, 24, 5, 2, '#3a7a3a');   // musgo
  // copa de folhas com rosas
  for (const [lx, ly, rx2, ry2] of [[8, 4, 7, 4], [24, 4, 7, 4], [16, 1, 9, 4]]) { oval(c, lx, ly, rx2, ry2, '#2a5a2a'); oval(c, lx, ly - 1, rx2 - 1, ry2 - 1, '#3e8a3a'); oval(c, lx - 2, ly - 2, 2, 1, '#7ac85a'); }
  for (const [px, py] of [[5, 2], [14, -2], [22, 1], [28, 4], [10, 5]]) { R(c, px, py, 4, 3, '#b02a52'); R(c, px + 1, py, 2, 2, '#ff6a94'); R(c, px + 1, py, 1, 1, '#ffc8d8'); }
  // rosto: órbitas fundas com olhos acesos
  oval(c, 11, 14, 3, 2, '#1e100a'); oval(c, 21, 14, 3, 2, '#1e100a');
  glowEye(c, 9, 13, 4, 3, '#ffe060', st); glowEye(c, 19, 13, 4, 3, '#ffe060', st);
  if (!st) { R(c, 11, 14, 1, 2, '#3a2a10'); R(c, 21, 14, 1, 2, '#3a2a10'); }
  R(c, 8, 11, 6, 1, '#2a180e'); R(c, 18, 11, 6, 1, '#2a180e');   // sobrancelhas
  // boca torta com dentes de lasca
  const m = Math.round(Math.abs(Math.sin(t * 4)) * 2);
  R(c, 9, 19, 14, 4 + m, '#1e0a10'); R(c, 10, 20, 12, 2 + m, '#4a1420');
  for (let i = 0; i < 4; i++) { R(c, 10 + i * 3, 19, 2, 2, '#f0e4c8'); R(c, 11 + i * 3, 21 + m, 2, 2, '#e0d4b8'); }
};

ART.skelking = (c, t, state) => {   // Rei Esqueleto: manto, coroa e cetro de caveira
  const st = STUN(state), f = WALK ? Math.floor(t * 4) % 2 : 0, BN = '#efe6cc', BD = '#b8ac8c', BS = '#7a7058';
  // manto
  R(c, 5, 11, 22, 17, '#4a1838'); R(c, 6, 12, 20, 15, '#7d305d'); R(c, 6, 12, 2, 15, '#a8487e'); R(c, 4, 26, 24, 3, '#4a1838');
  R(c, 5, 10, 22, 3, '#d9a63d'); R(c, 5, 10, 22, 1, '#ffe08a'); for (let i = 0; i < 5; i++) R(c, 7 + i * 4, 11, 2, 1, '#ffffff');   // gola de arminho
  // pernas
  R(c, 11, 25, 3, 5 - f, BD); R(c, 18, 25, 3, 4 + f, BD); R(c, 10, 29 - f, 5, 2, BS); R(c, 17, 28 + f, 5, 2, BS);
  // costelas
  R(c, 11, 13, 10, 11, '#2a1a24'); R(c, 15, 13, 2, 11, BN);
  for (let k = 0; k < 4; k++) { R(c, 11, 14 + k * 3, 4, 1, BN); R(c, 17, 14 + k * 3, 4, 1, BN); R(c, 11, 15 + k * 3, 4, 1, BS); R(c, 17, 15 + k * 3, 4, 1, BS); }
  R(c, 12, 23, 8, 2, BD);
  // braços: um segura o cetro
  R(c, 6, 13, 3, 8, BD); R(c, 6, 13, 1, 8, BN); R(c, 5, 21, 4, 3, BN);
  R(c, 24, 13, 3, 7, BD); R(c, 26, 13, 1, 7, BN); R(c, 24, 19, 4, 3, BN);
  R(c, 27, 4, 2, 24, '#5a3a1a'); R(c, 27, 4, 1, 24, '#8a5a2a');
  oval(c, 28, 2, 3, 3, BN); R(c, 26, 1, 2, 2, '#2a1a24'); R(c, 29, 1, 2, 2, '#2a1a24'); R(c, 27, 1, 1, 1, '#ff3a5a'); R(c, 30, 1, 1, 1, '#ff3a5a');
  // crânio grande
  blob(c, 16, 6, 7, 6, [BD, BN, '#ffffff']);
  R(c, 11, 9, 10, 3, BD); R(c, 12, 11, 8, 2, BN); for (let i = 0; i < 4; i++) R(c, 12 + i * 2, 11, 1, 2, '#2a1a24');   // mandíbula
  oval(c, 13, 6, 2, 2, '#1a0e16'); oval(c, 19, 6, 2, 2, '#1a0e16');
  glowEye(c, 12, 5, 2, 2, '#ff3a5a', st); glowEye(c, 18, 5, 2, 2, '#ff3a5a', st);
  R(c, 15, 8, 2, 2, '#2a1a24');   // nariz
  // coroa
  R(c, 9, -2, 14, 3, '#b8862a'); R(c, 9, -2, 14, 1, '#ffd86a');
  for (const dx of [9, 14, 19]) { R(c, dx, -6, 4, 4, '#d9a63d'); R(c, dx + 1, -7, 2, 1, '#ffd86a'); R(c, dx + 1, -5, 2, 2, ['#c95a87', '#5ac8ff', '#c95a87'][(dx - 9) / 5]); }
};

ART.bigslime = (c, t, state) => {   // Lodo Gigante
  const st = STUN(state), sq = Math.sin(t * 4), rx = 15 + Math.round(sq), ry = 11 - Math.round(sq), cy = 30 - ry;
  oval(c, 16, cy + 1, rx, ry, '#3a1458');
  oval(c, 16, cy, rx - 1, ry - 1, '#7a3aaa'); oval(c, 16, cy + 2, rx - 3, ry - 3, '#9a50c8'); oval(c, 16, cy - 1, rx - 5, ry - 5, '#b26ad8');
  oval(c, 10, cy - ry + 4, 4, 2, '#e8c0ff'); R(c, 7, cy - ry + 3, 2, 1, '#ffffff');
  // coisas engolidas e bolhas lá dentro
  const w = Math.round(sq * 2);
  R(c, 20, cy + 3 + w, 4, 3, '#d8c8a8'); R(c, 21, cy + 4 + w, 1, 1, '#5a3a4a'); R(c, 6, cy + 5 - w, 3, 3, '#ffd23a'); R(c, 7, cy + 5 - w, 1, 1, '#fff3b0');
  for (let i = 0; i < 4; i++) { const p = (t * 0.6 + i * 0.27) % 1; oval(c, 8 + i * 6, cy + ry - 3 - Math.round(p * (ry + 2)), 1, 1, '#d8a0f0'); }
  // pingos escorrendo
  for (const dx of [4, 12, 25]) { const d = 1 + Math.round((Math.sin(t * 2 + dx) + 1) * 1.5); R(c, dx, 29, 2, d, '#7a3aaa'); R(c, dx, 29 + d, 2, 1, '#9a50c8'); }
  // olhos e boca
  eye(c, 9, cy - 3, 5, 5, '#3a0a5a', st); eye(c, 18, cy - 3, 5, 5, '#3a0a5a', st);
  R(c, 8, cy - 5, 6, 1, '#4a1868'); R(c, 18, cy - 5, 6, 1, '#4a1868');
  R(c, 12, cy + 4, 8, 3, '#2a0838'); R(c, 13, cy + 5, 6, 2, '#c84a8a'); R(c, 13, cy + 4, 2, 1, '#ffffff'); R(c, 17, cy + 4, 2, 1, '#ffffff');
};

ART.golem = (c, t, state) => {   // Golem da Mina: blocos de pedra, cristais e núcleo aceso
  const st = STUN(state), f = WALK ? Math.floor(t * 3) % 2 : 0, D = '#4a4034', B = '#8a7a62', L = '#b0a084', M = '#6a5e4e';
  R(c, 6, 23, 8, 7 - f, D); R(c, 7, 23, 6, 6 - f, M); R(c, 18, 23, 8, 6 + f, D); R(c, 19, 23, 6, 5 + f, M);   // pernas
  R(c, 5, 29 - f, 10, 2, D); R(c, 17, 28 + f, 10, 2, D);
  // braços enormes
  for (const [ax, s] of [[-2, 1], [26, -1]]) { R(c, ax, 8, 8, 16, D); R(c, ax + 1, 9, 6, 14, B); R(c, ax + 1, 9, 6, 2, L); R(c, ax + 1, 16, 6, 1, D); R(c, ax, 22, 8, 4, D); R(c, ax + 1, 22, 6, 3, M); if (s > 0) { R(c, ax + 2, 10, 2, 3, '#7af0ff'); R(c, ax + 2, 10, 1, 1, '#e8ffff'); } }
  // tronco
  R(c, 5, 7, 22, 18, D); R(c, 6, 8, 20, 16, B); R(c, 6, 8, 20, 3, L); R(c, 6, 21, 20, 3, M);
  R(c, 15, 8, 1, 6, D); R(c, 9, 14, 5, 1, D); R(c, 20, 18, 4, 1, D); R(c, 22, 9, 1, 4, M);   // rachaduras
  R(c, 7, 22, 4, 2, '#4a7a3a'); R(c, 23, 9, 3, 1, '#5a8a3a');   // musgo
  // núcleo de lava pulsando
  const p = Math.sin(t * 5) > 0;
  R(c, 12, 13, 8, 7, '#2a1a10'); R(c, 13, 14, 6, 5, st ? '#5a4a3a' : p ? '#ff8a2a' : '#ff6a1a'); R(c, 14, 15, 4, 3, st ? '#6a5a4a' : '#ffd23a'); R(c, 14, 15, 1, 1, '#fff8c0');
  // cabeça
  R(c, 10, -1, 12, 10, D); R(c, 11, 0, 10, 8, B); R(c, 11, 0, 10, 2, L);
  R(c, 11, 3, 10, 3, '#2a2018'); glowEye(c, 12, 4, 3, 2, '#ff8a2a', st); glowEye(c, 17, 4, 3, 2, '#ff8a2a', st);
  R(c, 13, 7, 6, 1, D);
  // cristais nos ombros
  for (const [cx, h] of [[3, 5], [5, 3], [26, 4], [28, 6]]) { R(c, cx, 8 - h, 2, h, '#3a9ab8'); R(c, cx, 8 - h, 1, h, '#9af0ff'); }
};

ART.pharaoh = (c, t, state) => {   // Faraó Escarlate: múmia-rei de máscara dourada e manto vermelho
  const st = STUN(state), fl = Math.round(Math.sin(t * 2.5) * 1.5), G = '#ffd23a', GD = '#b8862a', BL = '#2a4ab0';
  // manto escarlate
  R(c, 6, 11 + fl, 20, 18, '#6a1018'); R(c, 7, 12 + fl, 18, 16, '#a8202c'); R(c, 7, 12 + fl, 2, 16, '#d8404a'); R(c, 5, 27 + fl, 22, 3, '#6a1018');
  // corpo enfaixado
  R(c, 10, 12 + fl, 12, 15, '#a89c7a'); R(c, 11, 12 + fl, 10, 14, '#e0d4b0');
  for (let k = 0; k < 4; k++) R(c, 11, 14 + k * 3 + fl, 10, 1, '#b8ac8a');
  R(c, 10, 20 + fl, 12, 2, G); R(c, 15, 20 + fl, 2, 2, '#c02a2a');   // cinto
  R(c, 9, 11 + fl, 14, 3, BL); for (let i = 0; i < 7; i++) R(c, 9 + i * 2, 11 + fl, 1, 3, G);   // colar largo
  // braços cruzados segurando cajado e mangual
  R(c, 3, 13 + fl, 5, 3, '#e0d4b0'); R(c, 24, 13 + fl, 5, 3, '#e0d4b0');
  R(c, 27, 1 + fl, 2, 26, GD); R(c, 27, 1 + fl, 1, 26, G); R(c, 25, -1 + fl, 6, 2, G); R(c, 25, -3 + fl, 2, 3, G); R(c, 29, -3 + fl, 2, 3, G);   // ankh
  R(c, 26, -5 + fl, 4, 2, G); R(c, 27, -4 + fl, 2, 1, '#2a1a10');
  R(c, 2, 14 + fl, 2, 10, GD); R(c, 1, 23 + fl, 2, 3, '#4a8ad8'); R(c, 3, 24 + fl, 2, 3, '#c02a2a');
  // nemes (lenço listrado)
  R(c, 6, -1 + fl, 20, 13, BL); for (let k = 0; k < 6; k++) R(c, 6, k * 2 + fl, 20, 1, G);
  R(c, 4, 6 + fl, 4, 7, BL); R(c, 24, 6 + fl, 4, 7, BL); R(c, 4, 7 + fl, 4, 1, G); R(c, 24, 7 + fl, 4, 1, G); R(c, 4, 10 + fl, 4, 1, G); R(c, 24, 10 + fl, 4, 1, G);
  // máscara dourada
  R(c, 10, 1 + fl, 12, 10, GD); R(c, 11, 1 + fl, 10, 9, G); R(c, 11, 1 + fl, 3, 9, '#ffe88a');
  R(c, 11, 4 + fl, 4, 2, '#1a0a10'); R(c, 17, 4 + fl, 4, 2, '#1a0a10');
  glowEye(c, 12, 4 + fl, 2, 2, '#ff3a3a', st); glowEye(c, 18, 4 + fl, 2, 2, '#ff3a3a', st);
  R(c, 15, 6 + fl, 2, 2, GD); R(c, 14, 9 + fl, 4, 1, '#8a5a1a'); R(c, 15, 10 + fl, 2, 3, '#2a4ab0'); R(c, 15, 12 + fl, 2, 1, G);   // barba postiça
  R(c, 15, -3 + fl, 2, 3, G); R(c, 14, -4 + fl, 4, 2, '#c02a2a');   // cobra na testa
};

ART.icequeen = (c, t, state) => {   // Rainha do Gelo
  const st = STUN(state), fl = Math.round(Math.sin(t * 2) * 1.2);
  // capa de cristal atrás
  R(c, 4, 10 + fl, 24, 19, '#5a9ac8'); for (let i = 0; i < 6; i++) R(c, 4 + i * 4, 27 + fl + (i % 2), 4, 2 + (i % 2), '#5a9ac8');
  R(c, 5, 11 + fl, 22, 17, '#8ac8ec');
  // vestido em degradê
  R(c, 9, 12 + fl, 14, 17, '#bfe8ff'); R(c, 8, 20 + fl, 16, 9, '#9fd8f4'); R(c, 7, 25 + fl, 18, 4, '#7cbce0'); R(c, 10, 12 + fl, 3, 15, '#e8f8ff');
  R(c, 14, 13 + fl, 4, 2, '#ffffff'); R(c, 15, 15 + fl, 2, 10, '#d8f4ff');
  for (let i = 0; i < 4; i++) R(c, 9 + i * 4, 26 + fl, 2, 1, '#ffffff');
  // braços e cetro de floco
  R(c, 5, 13 + fl, 4, 7, '#bfe8ff'); R(c, 5, 19 + fl, 3, 2, '#f0f4ff');
  R(c, 23, 12 + fl, 4, 6, '#bfe8ff'); R(c, 25, 17 + fl, 3, 2, '#f0f4ff');
  R(c, 27, 3 + fl, 1, 24, '#d8f4ff'); R(c, 24, 3 + fl, 7, 1, '#ffffff'); R(c, 27, 0 + fl, 1, 7, '#ffffff'); R(c, 25, 1 + fl, 1, 1, '#ffffff'); R(c, 29, 1 + fl, 1, 1, '#ffffff'); R(c, 25, 5 + fl, 1, 1, '#ffffff'); R(c, 29, 5 + fl, 1, 1, '#ffffff');
  // cabelo longo branco-azulado
  R(c, 8, 0 + fl, 16, 6, '#e8f4ff'); R(c, 7, 3 + fl, 4, 14, '#d0e8f8'); R(c, 21, 3 + fl, 4, 14, '#d0e8f8'); R(c, 8, 3 + fl, 1, 13, '#ffffff');
  // rosto
  R(c, 11, 3 + fl, 10, 9, '#f4e8f0'); R(c, 11, 3 + fl, 10, 2, '#e8f4ff'); R(c, 11, 10 + fl, 10, 2, '#e0d0e0');
  eye(c, 12, 6 + fl, 3, 2, '#3a7ad8', st); eye(c, 17, 6 + fl, 3, 2, '#3a7ad8', st);
  R(c, 12, 5 + fl, 3, 1, '#a8c8e8'); R(c, 17, 5 + fl, 3, 1, '#a8c8e8'); R(c, 12, 9 + fl, 2, 1, '#f0b8d0'); R(c, 18, 9 + fl, 2, 1, '#f0b8d0');
  R(c, 15, 10 + fl, 2, 1, '#7a5ab8');
  // coroa de cristais
  R(c, 9, -1 + fl, 14, 2, '#ffffff');
  for (const [dx, h] of [[9, 3], [12, 5], [15, 7], [18, 5], [21, 3]]) { R(c, dx, -1 - h + fl, 2, h, '#9fe0ff'); R(c, dx, -1 - h + fl, 1, h, '#ffffff'); }
};

ART.conductor = (c, t, state) => {   // Guardião dos Vagões: chefe de trem de bigode e lanterna
  const st = STUN(state), f = WALK ? Math.floor(t * 3) % 2 : 0, N = '#1c2c58', B = '#24407a', L = '#3e62a8', G = '#ffd23a';
  R(c, 9, 24, 6, 6 - f, '#141a2a'); R(c, 18, 24, 6, 5 + f, '#141a2a'); R(c, 8, 29 - f, 8, 2, '#0a0a14'); R(c, 17, 28 + f, 8, 2, '#0a0a14');
  // casaco comprido
  R(c, 5, 9, 22, 17, N); R(c, 6, 10, 20, 15, B); R(c, 6, 10, 3, 15, L); R(c, 6, 23, 20, 2, N);
  R(c, 14, 10, 4, 15, '#e8e0d0'); R(c, 15, 10, 2, 4, '#a8202c');   // camisa e gravata
  for (const yy of [13, 17, 21]) { R(c, 12, yy, 2, 2, G); R(c, 18, yy, 2, 2, G); }
  R(c, 19, 15, 6, 1, G); R(c, 24, 15, 2, 3, '#e8e0d0'); R(c, 24, 16, 1, 1, '#2a2a3a');   // relógio de bolso
  // braços: lanterna na mão esquerda, apito na direita
  R(c, 1, 10, 5, 11, N); R(c, 2, 11, 3, 9, B); R(c, 1, 20, 5, 3, '#e8e0d0');
  R(c, 0, 23, 5, 6, '#3a3a4a'); R(c, 1, 24, 3, 4, Math.sin(t * 6) > -0.3 ? '#ffe58a' : '#ffb84a'); R(c, 1, 22, 3, 1, '#3a3a4a');
  R(c, 26, 10, 5, 11, N); R(c, 27, 11, 3, 9, B); R(c, 26, 20, 5, 3, '#e8e0d0'); R(c, 27, 18, 3, 2, '#c8c8d8');
  // rosto
  R(c, 9, 1, 14, 9, '#c88a5a'); R(c, 10, 1, 12, 8, '#e8b88a'); R(c, 10, 1, 12, 1, '#f4cca0');
  eye(c, 11, 3, 3, 3, '#2a1a10', st); eye(c, 18, 3, 3, 3, '#2a1a10', st);
  R(c, 11, 2, 3, 1, '#5a3a1a'); R(c, 18, 2, 3, 1, '#5a3a1a'); R(c, 15, 4, 2, 3, '#d89a6a');
  R(c, 10, 7, 12, 2, '#6a4a2a'); R(c, 9, 8, 3, 2, '#6a4a2a'); R(c, 20, 8, 3, 2, '#6a4a2a'); R(c, 11, 7, 3, 1, '#8a6a3a');   // bigode
  R(c, 8, 4, 2, 4, '#5a3a1a'); R(c, 22, 4, 2, 4, '#5a3a1a');
  // quepe
  R(c, 7, -1, 18, 3, '#0a1430'); R(c, 7, 1, 18, 1, '#2a2a3a'); R(c, 9, -5, 14, 5, N); R(c, 9, -5, 14, 1, L);
  R(c, 14, -4, 4, 3, G); R(c, 15, -3, 2, 1, '#fff3b0'); R(c, 9, -1, 14, 1, G);
};

ART.kraken = (c, t, state) => {   // Kraken Guardião
  const st = STUN(state), D = '#3a1648', B = '#7a3a8a', L = '#a864bc';
  for (let i = 0; i < 8; i++) {   // tentáculos ondulando, com ventosas
    const base = 2 + i * 4, len = 9 + (i % 3) * 2;
    for (let k = 0; k < len; k++) {
      const wx = base + Math.round(Math.sin(t * 3 + i * 1.1 + k * 0.35) * (k / 4));
      R(c, wx, 19 + k, 4, 1, D); R(c, wx + 1, 19 + k, 2, 1, i % 2 ? '#6a3a8a' : B);
      if (k % 3 === 1) R(c, wx + 2, 19 + k, 1, 1, '#e8c0f0');
    }
  }
  blob(c, 16, 11, 13, 11, [D, B, L]);
  R(c, 10, 0, 12, 2, B); oval(c, 12, 2, 3, 1, '#d8a0e8');
  for (const [bx, by] of [[7, 6], [22, 4], [25, 12], [5, 14], [19, 2]]) { R(c, bx, by, 2, 2, '#5a2a6a'); R(c, bx, by, 1, 1, '#8a4aa0'); }
  // olhos grandes e brabos
  oval(c, 11, 12, 4, 3, D); oval(c, 21, 12, 4, 3, D);
  eye(c, 8, 10, 6, 5, st ? '#4a4a5a' : '#ffe060', st); eye(c, 18, 10, 6, 5, st ? '#4a4a5a' : '#ffe060', st);
  if (!st) { R(c, 11, 11, 1, 4, '#1d1424'); R(c, 21, 11, 1, 4, '#1d1424'); }
  R(c, 7, 8, 7, 1, '#2a0a38'); R(c, 18, 8, 7, 1, '#2a0a38'); R(c, 13, 9, 1, 1, '#2a0a38'); R(c, 18, 9, 1, 1, '#2a0a38');
  R(c, 13, 17, 6, 3, '#2a0838'); R(c, 14, 18, 4, 1, '#f0d8f8');   // bico
};

ART.coral = (c, t, state) => {   // Colosso de Coral
  const st = STUN(state), f = WALK ? Math.floor(t * 3) % 2 : 0, D = '#7a2a44', B = '#d8708a', L = '#f0a8bc', M = '#b0506a';
  R(c, 7, 22, 7, 8 - f, D); R(c, 8, 22, 5, 7 - f, M); R(c, 18, 22, 7, 7 + f, D); R(c, 19, 22, 5, 6 + f, M);
  // braços de coral ramificado
  for (const [ax, s] of [[-1, -1], [26, 1]]) {
    R(c, ax, 9, 7, 14, D); R(c, ax + 1, 10, 5, 12, M); R(c, ax + 1, 10, 5, 2, B);
    R(c, ax + (s < 0 ? -2 : 6), 19, 3, 5, D); R(c, ax + (s < 0 ? -1 : 6), 20, 1, 3, B);
  }
  R(c, -2, 6, 5, 5, '#c8b8a0'); R(c, -1, 7, 3, 3, '#fffbe8'); R(c, -1, 7, 1, 1, '#ffffff');   // pérolas nos ombros
  R(c, 29, 6, 5, 5, '#c8b8a0'); R(c, 30, 7, 3, 3, '#fffbe8'); R(c, 30, 7, 1, 1, '#ffffff');
  // tronco com poros e cracas
  R(c, 4, 7, 24, 17, D); R(c, 5, 8, 22, 15, B); R(c, 5, 8, 22, 3, L); R(c, 5, 20, 22, 3, M);
  for (const [px, py] of [[8, 13], [12, 17], [20, 14], [23, 18], [16, 12], [9, 19]]) { R(c, px, py, 2, 2, M); R(c, px, py, 1, 1, D); }
  R(c, 21, 9, 4, 3, '#e8e0c8'); R(c, 22, 9, 2, 1, '#7a6a5a');
  // anêmona no peito
  const a = Math.round(Math.sin(t * 4));
  for (let i = 0; i < 5; i++) R(c, 12 + i * 2, 13 + (i % 2) + a * (i % 2 ? 1 : -1), 1, 3, '#ffd06a');
  R(c, 12, 16, 9, 3, '#e86a3a'); R(c, 15, 17, 3, 1, '#ffd06a');
  // cabeça com galhos de coral
  for (const [dx, h] of [[7, 6], [11, 8], [19, 9], [24, 6]]) { R(c, dx, 4 - h + 4, 3, h, D); R(c, dx + 1, 5 - h + 4, 1, h - 1, L); R(c, dx - 1, 4 - h + 5, 1, 2, B); R(c, dx + 3, 4 - h + 6, 1, 2, B); }
  R(c, 9, 0, 14, 9, D); R(c, 10, 1, 12, 7, B); R(c, 10, 1, 12, 2, L);
  R(c, 11, 3, 4, 3, '#4a1020'); R(c, 17, 3, 4, 3, '#4a1020'); glowEye(c, 12, 4, 2, 2, '#ffe58a', st); glowEye(c, 18, 4, 2, 2, '#ffe58a', st);
  R(c, 13, 7, 6, 1, '#4a1020');
};

ART.siren = (c, t, state) => {   // Sirena: sereia cantora de cabelo longo
  const st = STUN(state), sw = Math.round(Math.sin(t * 3) * 2), b = Math.round(Math.sin(t * 2) * 1.5), HAIR = '#b050e0', HD = '#7a2aa8';
  // cauda de peixe com escamas e barbatana
  R(c, 10, 17 + b, 12, 7, '#3a2a7a'); R(c, 11, 17 + b, 10, 6, '#5a3a9a'); R(c, 12, 23 + b, 8, 3, '#5a3a9a'); R(c, 14, 25 + b, 4, 2, '#7a52c0');
  for (let k = 0; k < 3; k++) for (let i = 0; i < 3; i++) R(c, 12 + i * 3 + (k % 2), 18 + k * 2 + b, 2, 1, '#8a6ad8');
  R(c, 6 + sw, 26 + b, 9, 3, '#7a52c0'); R(c, 17 - sw, 26 + b, 9, 3, '#7a52c0'); R(c, 4 + sw, 28 + b, 6, 2, '#b89af0'); R(c, 22 - sw, 28 + b, 6, 2, '#b89af0');
  R(c, 13, 26 + b, 6, 2, '#5a3a9a');
  // cabelo atrás: preso no alto da cabeça e ondulando só para baixo, como cabelo na água (cada fio balança mais perto da ponta)
  for (let y = 0; y < 20; y++) {
    const k = y < 6 ? 0 : Math.round(Math.sin(t * 3 - y * 0.35) * (y - 5) / 6), w = y < 15 ? 4 : y < 18 ? 3 : 2;
    R(c, 9 - w + 1 + k, y + b, w, 1, HD); R(c, 23 - 1 + k, y + b, w, 1, HD);
    R(c, 9 - w + 2 + k, y + b, Math.max(1, w - 2), 1, HAIR); R(c, 23 + k, y + b, Math.max(1, w - 2), 1, HAIR);
  }
  // tronco: ombros largos, cintura fina descendo para a cauda; braços nas laterais
  R(c, 11, 11 + b, 10, 2, '#f0c8d8'); R(c, 11, 13 + b, 9, 3, '#f0c8d8'); R(c, 12, 16 + b, 7, 2, '#f0c8d8'); R(c, 11, 11 + b, 2, 2, '#ffe0ea');
  R(c, 12, 16 + b, 1, 2, '#e0b0c4'); R(c, 18, 16 + b, 1, 2, '#e0b0c4');                       // curva da cintura
  // conchas nos seios no estilo da Concha da Lua, com 1 pixel de decote entre elas
  for (const sx of [11, 16]) {
    R(c, sx + 1, 12 + b, 2, 1, '#ecc8f0'); R(c, sx, 13 + b, 4, 2, '#ecc8f0'); R(c, sx + 1, 15 + b, 2, 1, '#b078c0');                                     // leque e base em gancho
    R(c, sx, 15 + b, 1, 1, '#7a4a90'); R(c, sx + 3, 15 + b, 1, 1, '#7a4a90'); R(c, sx, 12 + b, 1, 1, '#7a4a90'); R(c, sx + 3, 12 + b, 1, 1, '#7a4a90');  // contorno arredondado
    R(c, sx + 1, 13 + b, 1, 2, '#b880c8'); R(c, sx + 3, 13 + b, 1, 2, '#c898d4');                                                                     // gomos
    R(c, sx + 1, 12 + b, 1, 1, '#ffffff'); R(c, sx, 13 + b, 1, 1, '#ffffff'); R(c, sx + 2, 12 + b, 1, 1, '#bfe8ff');                                   // brilho perolado e lunar
  }
  R(c, 15, 13 + b, 1, 2, '#d898b4'); R(c, 15, 12 + b, 1, 1, '#e8b0c8');                          // decote
  R(c, 8, 12 + b, 3, 6, '#f0c8d8'); R(c, 20, 12 + b, 3, 6, '#f0c8d8'); R(c, 7, 17 + b, 3, 2, '#f0c8d8'); R(c, 21, 17 + b, 3, 2, '#f0c8d8');
  // rosto
  R(c, 10, 1 + b, 12, 11, '#f4d0e0'); R(c, 10, 9 + b, 12, 2, '#e8b8cc');
  eye(c, 11, 5 + b, 4, 3, '#c040e0', st); eye(c, 17, 5 + b, 4, 3, '#c040e0', st);
  R(c, 11, 4 + b, 4, 1, HD); R(c, 17, 4 + b, 4, 1, HD); R(c, 11, 8 + b, 2, 1, '#f0a0c0'); R(c, 19, 8 + b, 2, 1, '#f0a0c0');
  R(c, 10, 5 + b, 1, 1, '#3a1048'); R(c, 21, 5 + b, 1, 1, '#3a1048'); R(c, 10, 4 + b, 1, 1, '#3a1048'); R(c, 21, 4 + b, 1, 1, '#3a1048');   // cílios longos
  R(c, 19, 9 + b, 1, 1, '#a0507a');                                                                                                             // pinta charmosa
  const sing = Math.sin(t * 6) > 0;   // canta
  R(c, 14, 9 + b, 4, sing ? 2 : 1, '#d0306a'); R(c, 15, 9 + b, 2, 1, '#ff5a8a'); if (sing) R(c, 15, 10 + b, 2, 1, '#ff9ab8');   // lábios de batom
  // franja e tiara de pérolas
  R(c, 9, -1 + b, 14, 4, HAIR); R(c, 9, 2 + b, 3, 3, HAIR); R(c, 20, 2 + b, 3, 3, HAIR); R(c, 11, -1 + b, 5, 1, '#d890ff');
  // tiara: aro dourado curvo por cima da franja, pérolas pequenas nas laterais e uma pérola grande no centro
  R(c, 10, 0 + b, 2, 1, '#c89a2a'); R(c, 12, -1 + b, 8, 1, '#e8c050'); R(c, 20, 0 + b, 2, 1, '#c89a2a'); R(c, 13, -1 + b, 6, 1, '#ffe08a');
  for (const px of [11, 13, 18, 20]) { R(c, px, (px === 11 || px === 20 ? -1 : -2) + b, 1, 1, '#fffbe8'); }
  R(c, 15, -3 + b, 2, 2, '#fffbe8'); R(c, 15, -3 + b, 1, 1, '#ffffff'); R(c, 16, -2 + b, 1, 1, '#d8c8e0');
  R(c, 10, 5 + b, 1, 1, '#3a1048'); R(c, 21, 5 + b, 1, 1, '#3a1048');   // cílios por cima da franja
};

ART.phantom = (c, t, state) => {   // Imediato Valdo: imediato fantasma de chapéu de bicorne e lanterna
  const st = STUN(state), b = Math.round(Math.sin(t * 2.4) * 2), C = '#2a3a5a', CL = '#4a5a80', SP = '#b8d8ec', SL = '#e0f2ff';
  // cauda de névoa
  for (let i = 0; i < 5; i++) { const w = Math.round(Math.sin(t * 4 + i) * 1.5); R(c, 7 + i * 4 + w, 24 + b + (i % 2) * 2, 4, 4, SP); R(c, 8 + i * 4 + w, 24 + b + (i % 2) * 2, 2, 2, SL); }
  // casaco de capitão
  R(c, 6, 11 + b, 20, 15, C); R(c, 7, 12 + b, 18, 13, CL); R(c, 7, 12 + b, 2, 13, '#6a7aa0');
  R(c, 13, 12 + b, 6, 13, '#d0e4f4'); for (const yy of [14, 18, 22]) { R(c, 11, yy + b, 2, 2, '#e0c060'); R(c, 19, yy + b, 2, 2, '#e0c060'); }
  R(c, 6, 11 + b, 5, 2, '#e0c060'); R(c, 21, 11 + b, 5, 2, '#e0c060');   // dragonas
  // braços e lanterna
  R(c, 2, 13 + b, 5, 9, C); R(c, 3, 14 + b, 3, 7, CL); R(c, 2, 21 + b, 4, 3, SL);
  R(c, 25, 13 + b, 5, 8, C); R(c, 26, 14 + b, 3, 6, CL); R(c, 26, 20 + b, 4, 2, SL);
  R(c, 27, 22 + b, 1, 2, '#2a3250'); R(c, 25, 24 + b, 6, 6, '#2a3250'); R(c, 26, 25 + b, 4, 4, Math.sin(t * 8) > -0.4 ? '#ffe58a' : '#ffc04a'); R(c, 26, 25 + b, 1, 1, '#ffffff');
  // rosto pálido com barba de névoa
  R(c, 9, 2 + b, 14, 10, SP); R(c, 10, 2 + b, 12, 9, SL);
  R(c, 11, 5 + b, 3, 3, '#1d2a4a'); R(c, 18, 5 + b, 3, 3, '#1d2a4a'); glowEye(c, 12, 6 + b, 1, 1, '#9fe8ff', st); glowEye(c, 19, 6 + b, 1, 1, '#9fe8ff', st);
  R(c, 10, 9 + b, 12, 3, SP); R(c, 11, 11 + b, 10, 2, SP); R(c, 13, 13 + b, 6, 1, SP); R(c, 14, 9 + b, 4, 1, '#6a8aa8');
  // bicorne com caveira
  R(c, 5, 0 + b, 22, 3, '#1a2238'); R(c, 8, -4 + b, 16, 5, '#242c48'); R(c, 8, -4 + b, 16, 1, '#3a4568'); R(c, 5, 1 + b, 22, 1, '#e0c060');
  R(c, 14, -3 + b, 4, 3, '#e8f0f8'); R(c, 15, -2 + b, 1, 1, '#1a2238'); R(c, 17, -2 + b, 1, 1, '#1a2238');
};

ART.leviathan = (c, t, state) => {   // Leviatã Abissal: peixe-abissal de bocarra e isca de luz
  const st = STUN(state), w = Math.round(Math.sin(t * 2) * 2), D = '#0a1a3a', B = '#1d3f78', L = '#2f5ea0';
  // cauda e barbatanas
  R(c, 24, 9 + w, 9, 16, D); R(c, 25, 10 + w, 7, 14, '#1a3a6a'); R(c, 30, 4 + w, 5, 10, D); R(c, 31, 5 + w, 3, 8, '#2a5a9a'); R(c, 30, 19 + w, 5, 10, D); R(c, 31, 20 + w, 3, 8, '#2a5a9a');
  R(c, 10, 2, 10, 4, D); for (let i = 0; i < 4; i++) R(c, 11 + i * 2, 0, 1, 4, '#2a5a9a');   // barbatana de cima
  // corpo
  blob(c, 15, 16, 14, 12, [D, B, L]);
  for (const [bx, by] of [[11, 9], [17, 11], [22, 9], [20, 16], [24, 14]]) { R(c, bx, by, 2, 2, '#4ad8ff'); R(c, bx, by, 1, 1, '#d8ffff'); }   // pintas que brilham
  R(c, 18, 19, 7, 6, '#16305e'); R(c, 20, 20, 4, 1, '#0a1a3a'); R(c, 20, 22, 4, 1, '#0a1a3a');   // guelras
  // bocarra com dentes
  const m = 3 + Math.round(Math.abs(Math.sin(t * 3)) * 2);
  R(c, 1, 17, 15, m + 3, '#05081a'); R(c, 2, 18, 13, m + 1, '#5a0a1a');
  for (let k = 0; k < 6; k++) { R(c, 2 + k * 2 + (k > 2 ? 1 : 0), 17, 1, 3, '#f4f8ff'); R(c, 3 + k * 2, 18 + m, 1, 3, '#e0e8f0'); }
  R(c, 0, 15, 16, 2, B); R(c, 1, 20 + m, 14, 2, D);
  // olho grande
  oval(c, 9, 10, 4, 4, D); eye(c, 6, 7, 6, 6, st ? '#4a4a5a' : '#ff5a3a', st); if (!st) R(c, 9, 8, 1, 5, '#1d1424');
  // isca de luz
  R(c, 13, -3, 1, 6, D); R(c, 12, -4, 1, 2, D); R(c, 9, -6, 4, 1, D);
  R(c, 6, -8, 5, 4, '#fff3a0'); R(c, 7, -7, 3, 2, '#ffffff');
};

ART.primordial = (c, t, state) => {   // Maré Primordial: o primeiro mar, luminoso, de runas douradas
  const st = STUN(state), w = Math.round(Math.sin(t * 2) * 2), D = '#14306a', B = '#2a5aa8', L = '#6aa8f0';
  R(c, 23, 9 + w, 10, 15, D); R(c, 24, 10 + w, 8, 13, '#4a8ad8'); R(c, 30, 3 + w, 6, 11, '#4a8ad8'); R(c, 31, 4 + w, 4, 9, '#9ad4ff'); R(c, 30, 19 + w, 6, 11, '#4a8ad8'); R(c, 31, 20 + w, 4, 9, '#9ad4ff');
  blob(c, 15, 16, 14, 12, [D, B, L]);
  R(c, 3, 22, 24, 5, '#1a3a78'); R(c, 4, 23, 22, 1, '#3a6ac8');
  // crista de água
  for (let k = 0; k < 5; k++) { const h = 5 + (k % 2) * 3 + Math.round(Math.sin(t * 5 + k)); R(c, 6 + k * 4, 4 - h + 1, 3, h, '#9ad4ff'); R(c, 6 + k * 4, 4 - h + 1, 1, h, '#e8f8ff'); }
  // runas douradas pulsando
  const g = Math.sin(t * 4) > 0 ? '#ffe58a' : '#ffd23a';
  for (const [bx, by] of [[14, 9], [21, 11], [17, 16], [24, 17], [12, 19]]) { R(c, bx, by, 3, 1, g); R(c, bx + 1, by - 1, 1, 3, g); }
  // olho solar
  oval(c, 8, 10, 4, 4, D); R(c, 5, 7, 7, 7, '#ffffff'); R(c, 6, 8, 5, 6, st ? '#4a4a5a' : '#ffd23a'); if (!st) { R(c, 8, 9, 2, 4, '#1d1424'); R(c, 6, 8, 1, 1, '#ffffff'); }
  // boca com dentes de espuma
  R(c, 1, 17, 14, 4, '#0a1a3a'); for (let k = 0; k < 7; k++) R(c, 2 + k * 2, 17, 1, 2 + (k % 2), '#f4f8ff');
};

ART.lunarcolossus = (c, t, state) => {   // Colosso Lunar: rocha da lua com crateras e veias de cristal
  const st = STUN(state), f = WALK ? Math.floor(t * 3) % 2 : 0, D = '#3a3a52', B = '#8a8aa2', L = '#b8b8d0', M = '#6a6a84', CY = '#7af0ff';
  R(c, 5, 23, 9, 7 - f, D); R(c, 6, 23, 7, 6 - f, M); R(c, 18, 23, 9, 6 + f, D); R(c, 19, 23, 7, 5 + f, M);
  for (const ax of [-3, 27]) { R(c, ax, 8, 8, 17, D); R(c, ax + 1, 9, 6, 15, M); R(c, ax + 1, 9, 6, 2, L); R(c, ax, 22, 8, 4, D); R(c, ax + 1, 22, 6, 3, B); }
  R(c, -1, 13, 2, 6, CY); R(c, 31, 12, 2, 7, CY);
  R(c, 3, 6, 26, 19, D); R(c, 4, 7, 24, 17, B); R(c, 4, 7, 24, 3, L); R(c, 4, 20, 24, 4, M);
  for (const [cx, cy, r] of [[8, 12, 2], [24, 16, 2], [21, 9, 1], [9, 20, 1]]) { oval(c, cx, cy, r + 1, r, M); R(c, cx - r, cy - 1, r, 1, L); }   // crateras
  // coração de cristal com veias
  const p = Math.sin(t * 4) > 0;
  R(c, 13, 11, 7, 9, '#1a3a4a'); R(c, 14, 12, 5, 7, st ? '#4a6a7a' : CY); R(c, 15, 13, 2, 4, '#e8ffff');
  if (!st) { R(c, 11, 14, 2, 1, CY); R(c, 20, 15, 3, 1, CY); R(c, 16, 20, 1, 3, p ? CY : '#4ab8d8'); R(c, 9, 15, 2, 1, p ? CY : '#4ab8d8'); }
  // cabeça
  R(c, 9, -2, 14, 10, D); R(c, 10, -1, 12, 8, B); R(c, 10, -1, 12, 2, L);
  R(c, 10, 2, 12, 4, '#22223a'); glowEye(c, 11, 3, 4, 2, CY, st); glowEye(c, 17, 3, 4, 2, CY, st);
  for (const [dx, h] of [[10, 4], [14, 2], [19, 3], [21, 5]]) { R(c, dx, -2 - h, 2, h, '#3a9ab8'); R(c, dx, -2 - h, 1, h, '#bff8ff'); }
};

ART.cryspider = (c, t, state) => {   // Aranha de Cristal
  const st = STUN(state), w = Math.floor(t * 6) % 2, D = '#22183e', B = '#4a3a7a', L = '#7a6ac0';
  for (let i = 0; i < 4; i++) {   // pernas articuladas: sobem até o joelho de cristal e descem até a ponta
    const k = (i + w) % 2;
    for (const s of [-1, 1]) {
      const hx = s < 0 ? 10 : 22, hy = 12 + i * 3, kx = hx + s * (8 + (i % 2)), ky = 3 + i * 4 - k, fx = hx + s * (14 - i), fy = 22 + i * 2 + k;
      line(c, hx, hy, kx, ky, 2, D); line(c, kx, ky, fx, fy, 2, D); line(c, hx, hy - 1, kx, ky - 1, 1, L); line(c, kx, ky, fx, fy, 1, B);
      R(c, kx - 1, ky - 1, 3, 2, '#c08aff'); R(c, kx - 1, ky - 1, 1, 1, '#f0d8ff');
    }
  }
  // abdômen com cristais
  blob(c, 16, 19, 10, 9, [D, B, L]);
  for (const [cx, h] of [[10, 5], [14, 8], [18, 7], [22, 4]]) { R(c, cx, 16 - h, 3, h + 2, '#8a4ad0'); R(c, cx, 16 - h, 1, h + 2, '#f0d8ff'); R(c, cx + 2, 16 - h + 1, 1, h, '#5a2aa0'); }
  R(c, 12, 20, 9, 5, '#c08aff'); R(c, 13, 21, 3, 3, '#f0d8ff'); R(c, 17, 22, 3, 2, '#8a4ad0');   // marca
  // cabeça com muitos olhos
  blob(c, 16, 6, 7, 5, [D, B, L]);
  const ec = '#ff5ae8';
  glowEye(c, 11, 4, 3, 3, ec, st); glowEye(c, 18, 4, 3, 3, ec, st);
  glowEye(c, 14, 2, 1, 1, ec, st); glowEye(c, 17, 2, 1, 1, ec, st); glowEye(c, 10, 7, 1, 1, ec, st); glowEye(c, 21, 7, 1, 1, ec, st);
  R(c, 13, 9, 2, 3, '#e8e0ff'); R(c, 17, 9, 2, 3, '#e8e0ff'); R(c, 13, 11, 1, 1, '#8a4ad0'); R(c, 18, 11, 1, 1, '#8a4ad0');   // presas
};

ART.moonking = (c, t, state) => {   // Soberano Cristalino
  const st = STUN(state), fl = Math.round(Math.sin(t * 2) * 1), N = '#1e1e48', B = '#3a3a78', W = '#e8e8f8';
  // capa estrelada
  R(c, 2, 10, 28, 20, N); R(c, 3, 11, 26, 18, B); R(c, 3, 11, 2, 18, '#5a5aa0');
  for (const [sx, sy] of [[5, 14], [26, 18], [6, 24], [25, 26], [8, 19], [23, 12]]) R(c, sx, sy, 1, 1, Math.sin(t * 3 + sx) > 0 ? '#ffffff' : '#a8a8e0');
  // túnica branca
  R(c, 8, 10, 16, 19, '#b8b8d8'); R(c, 9, 10, 14, 18, W); R(c, 9, 10, 3, 18, '#ffffff');
  R(c, 15, 12, 2, 16, '#8a8ac8'); R(c, 8, 18, 16, 2, '#c9a03a'); R(c, 15, 18, 2, 2, '#7af0ff');
  // braços e cetro de cristal
  R(c, 4, 12, 5, 8, B); R(c, 4, 19, 4, 3, '#e8d8d0');
  R(c, 24, 12, 5, 7, B); R(c, 26, 18, 4, 3, '#e8d8d0');
  R(c, 28, 2 + fl, 2, 26, '#c9a03a'); R(c, 28, 2 + fl, 1, 26, '#ffe08a');
  R(c, 27, -3 + fl, 4, 6, '#3ab8d8'); R(c, 28, -5 + fl, 2, 9, '#7af0ff'); R(c, 28, -4 + fl, 1, 4, '#ffffff');
  // rosto pálido
  R(c, 9, 0, 14, 11, '#c8c8e0'); R(c, 10, 0, 12, 10, '#f0f0fc'); R(c, 10, 8, 12, 2, '#d8d8ec');
  eye(c, 11, 4, 3, 3, st ? '#4a4a4a' : '#ff5a8a', st); eye(c, 18, 4, 3, 3, st ? '#4a4a4a' : '#ff5a8a', st);
  R(c, 11, 3, 3, 1, '#8a8ab8'); R(c, 18, 3, 3, 1, '#8a8ab8'); R(c, 14, 8, 4, 1, '#6a6a98');
  R(c, 8, 2, 2, 10, '#d8e0ff'); R(c, 22, 2, 2, 10, '#d8e0ff');   // cabelo prateado
  // coroa de cristais
  R(c, 8, -1, 16, 2, '#c9a03a'); R(c, 8, -1, 16, 1, '#ffe08a');
  for (const [cx, ch, col] of [[8, 5, '#7af0ff'], [12, 8, '#c08aff'], [15, 10, '#ffffff'], [18, 8, '#c08aff'], [22, 5, '#7af0ff']]) { R(c, cx, -1 - ch, 2, ch, col); R(c, cx, -1 - ch, 1, 2, '#ffffff'); }
};

// Valério e o Eco: cavaleiro de armadura escura, capa, pluma e espada (caixa de 24×24)
export function knightBody(c, x, y, frame, state, t, echo = false) {
  const a = echo ? '#14102a' : '#24203a', a2 = echo ? '#241e44' : '#3d3552', hi = echo ? '#4a3a8a' : '#6a5e8a', sh = echo ? '#0a0818' : '#16121e';
  const cape = echo ? '#1a1a4a' : '#6a1030', capeL = echo ? '#2e2e6a' : '#9a2048', trim = echo ? '#7af0ff' : '#c9993a';
  const glow = state === 'charge' && Math.sin(t * 40) > 0 ? '#ffffff' : echo ? '#7af0ff' : '#b66cff';
  const st = frame % 2, wv = Math.round(Math.sin(t * 4));
  // capa esvoaçante
  R(c, x + 2, y + 9, 20, 15, cape); R(c, x + 2, y + 9, 2, 15, capeL); for (let i = 0; i < 5; i++) R(c, x + 2 + i * 4, y + 23 + ((i + wv) & 1), 4, 2, cape);
  // pernas e botas
  R(c, x + 7, y + 20 + st, 4, 5 - st, a); R(c, x + 13, y + 21 - st, 4, 4 + st, a); R(c, x + 6, y + 24, 6, 2, sh); R(c, x + 12, y + 24, 6, 2, sh);
  R(c, x + 8, y + 20 + st, 1, 3, hi); R(c, x + 14, y + 21 - st, 1, 3, hi);
  // peitoral
  R(c, x + 5, y + 10, 14, 12, a); R(c, x + 6, y + 10, 12, 11, a2); R(c, x + 6, y + 11, 12, 2, hi); R(c, x + 11, y + 13, 2, 7, a);
  R(c, x + 7, y + 14, 3, 1, hi); R(c, x + 14, y + 14, 3, 1, hi); R(c, x + 6, y + 19, 12, 2, trim); R(c, x + 11, y + 19, 2, 2, glow);
  // ombreiras
  R(c, x + 1, y + 9, 6, 5, a); R(c, x + 2, y + 9, 4, 2, hi); R(c, x + 17, y + 9, 6, 5, a); R(c, x + 18, y + 9, 4, 2, hi);
  R(c, x + 1, y + 13, 6, 1, trim); R(c, x + 17, y + 13, 6, 1, trim);
  R(c, x + 2, y + 14, 3, 5, a2); R(c, x + 19, y + 14, 3, 5, a2);
  R(c, x + 2, y + 18, 4, 3, echo ? '#2a2450' : '#8a8aa0'); R(c, x + 18, y + 17, 4, 3, echo ? '#2a2450' : '#8a8aa0');   // manoplas
  // elmo
  R(c, x + 6, y + 1, 12, 9, a); R(c, x + 7, y + 1, 10, 8, a2); R(c, x + 7, y + 1, 10, 2, hi); R(c, x + 7, y + 1, 2, 7, hi);
  R(c, x + 7, y + 5, 10, 2, '#06040c'); R(c, x + 9, y + 5, 2, 2, glow); R(c, x + 13, y + 5, 2, 2, glow);
  R(c, x + 11, y + 7, 2, 2, sh); R(c, x + 9, y + 8, 1, 1, sh); R(c, x + 14, y + 8, 1, 1, sh);
  R(c, x + 6, y + 3, 1, 4, trim); R(c, x + 17, y + 3, 1, 4, trim);
  // pluma
  R(c, x + 11, y - 2, 2, 3, trim); R(c, x + 10, y - 4 + wv, 4, 3, cape); R(c, x + 13, y - 5 + wv, 4, 2, capeL); R(c, x + 16, y - 4 + wv, 2, 2, cape);
  // espada
  R(c, x + 21, y + 1, 3, 17, '#6a7290'); R(c, x + 22, y + 1, 1, 17, '#eef4ff'); R(c, x + 21, y, 2, 1, '#eef4ff');
  if (echo) R(c, x + 23, y + 2, 1, 15, '#7af0ff');
  R(c, x + 19, y + 17, 7, 2, trim); R(c, x + 21, y + 19, 3, 3, '#5b3a22'); R(c, x + 21, y + 22, 3, 1, trim);
}

// ------------------------------------------------------------------ montagem com contorno
// Telas auxiliares do tamanho de cada uso (as grandes custavam caro a cada quadro, principalmente no celular):
// chefe 112×112, chefe comprido (serpente e moreia) 256×256, personagem 64×64. ox/oy = onde fica a origem.
const pool = (w, h, ox, oy) => {
  if (typeof document === 'undefined') return null;
  const mk = () => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; };
  const a = mk(), b = mk();
  return { cv: a, c: a.getContext('2d', { willReadFrequently: true }), sil: b, sc: b.getContext('2d', { willReadFrequently: true }), w, h, ox, oy };
};
const POOLS = { boss: pool(112, 112, 40, 48), long: pool(256, 256, 112, 112), char: pool(64, 64, 24, 32) };

// cola o que foi desenhado em P.cv com o contorno escuro (e o lampejo branco do golpe)
function paste(ctx, P, x, y, outlineAlpha, alpha, flashOn) {
  const { cv, sil, sc, w, h, ox, oy } = P, a0 = ctx.globalAlpha;
  sc.setTransform(1, 0, 0, 1, 0, 0); sc.globalCompositeOperation = 'source-over'; sc.clearRect(0, 0, w, h); sc.drawImage(cv, 0, 0);
  sc.globalCompositeOperation = 'source-in'; sc.fillStyle = '#140e20'; sc.fillRect(0, 0, w, h); sc.globalCompositeOperation = 'source-over';
  const smooth = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = a0 * alpha * outlineAlpha;
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) ctx.drawImage(sil, x - ox + dx, y - oy + dy);
  ctx.globalAlpha = a0 * alpha; ctx.drawImage(cv, x - ox, y - oy);
  if (flashOn) {
    sc.globalCompositeOperation = 'source-in'; sc.fillStyle = '#ffffff'; sc.fillRect(0, 0, w, h); sc.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = a0 * alpha * 0.7; ctx.drawImage(sil, x - ox, y - oy);
  }
  ctx.globalAlpha = a0; ctx.imageSmoothingEnabled = smooth;
}

// desenha `body(c)` (coordenadas locais da caixa) com contorno escuro; pisca branco quando leva dano
export function drawOutlinedBoss(ctx, x, y, t, flash, body, alpha = 1, long = false, owner = 'boss', key = '') {
  drawOutlinedCached(ctx, owner, key, long ? 'long' : 'boss', [0, 0], [x, y], body, { alpha, flash: !!(flash && Math.floor(t * 30) % 2) });
}

export const BOSS_ART = ART;
export function bossFxBack(ctx, type, x, y, t) { (FX_BACK[type] || ((c) => shadow(c, x, y)))(ctx, x, y, t); }
export function bossFxFront(ctx, type, x, y, t) { FX_FRONT[type]?.(ctx, x, y, t); }

// Contorno para personagens desenhados em coordenadas absolutas (moradores, Marcos, Eduardo):
// a sombra no chão vai direto para a tela principal e não ganha contorno.
export function drawOutlinedAt(ctx, x, y, body, outlineAlpha = 1, owner = null, key = '') {
  const bx = Math.round(x), by = Math.round(y);
  drawOutlinedCached(ctx, owner || ('at:' + bx + ',' + by), key, 'char', [bx, by], [bx, by], body, { outline: outlineAlpha });
}

// ------------------------------------------------------------------ desenho com contorno guardado
// Desenhar e contornar a cada quadro pesava no celular. Aqui cada personagem guarda o próprio desenho já contornado
// e só redesenha quando a `key` muda (quadro da animação, direção, estado...). A sombra no chão é gravada e
// repetida a cada quadro, por baixo, sem contorno.
const SIZES = { mob: [48, 48, 24, 30], char: [64, 64, 24, 32], boss: [112, 112, 40, 48], long: [256, 256, 112, 112] };
const scratch = {};
const scratchFor = (size) => scratch[size] ||= pool(...SIZES[size]);
const owned = new WeakMap(), named = new Map();
function entryFor(owner) {
  if (typeof owner === 'object' && owner) { let e = owned.get(owner); if (!e) owned.set(owner, e = {}); return e; }
  let e = named.get(owner); if (!e) { if (named.size > 300) named.clear(); named.set(owner, e = {}); } return e;
}
// at = ponto do desenho que vai parar em dest (na tela de destino, com a transformação atual dela)
export function drawOutlinedCached(ctx, owner, key, size, at, dest, body, { outline = 1, alpha = 1, flash = false } = {}) {
  const P = typeof document === 'undefined' ? null : scratchFor(size);
  if (!P) { body(ctx); return; }
  const e = entryFor(owner), { w, h, ox, oy } = P, k = key + '|' + (flash ? 1 : 0) + '|' + outline;
  if (e.key !== k || e.size !== size) {
    const { c, cv, sil, sc } = P, shadows = [];
    const rec = { fillStyle: '', fillRect(x, y, ww, hh) { shadows.push([this.fillStyle, x, y, ww, hh]); } };
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, w, h);
    c.setTransform(1, 0, 0, 1, ox - at[0], oy - at[1]); c.shadowSink = rec;
    try { body(c); } finally { c.shadowSink = null; c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; }
    sc.setTransform(1, 0, 0, 1, 0, 0); sc.globalCompositeOperation = 'source-over'; sc.clearRect(0, 0, w, h); sc.drawImage(cv, 0, 0);
    sc.globalCompositeOperation = 'source-in'; sc.fillStyle = '#140e20'; sc.fillRect(0, 0, w, h); sc.globalCompositeOperation = 'source-over';
    if (!e.cv || e.cv.width !== w) { e.cv = document.createElement('canvas'); e.cv.width = w; e.cv.height = h; e.c = e.cv.getContext('2d', { willReadFrequently: true }); }
    const o = e.c; o.globalCompositeOperation = 'source-over'; o.globalAlpha = 1; o.clearRect(0, 0, w, h);
    o.globalAlpha = outline; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) o.drawImage(sil, dx, dy);
    o.globalAlpha = 1; o.drawImage(cv, 0, 0);
    if (flash) { sc.globalCompositeOperation = 'source-in'; sc.fillStyle = '#ffffff'; sc.fillRect(0, 0, w, h); sc.globalCompositeOperation = 'source-over'; o.globalAlpha = 0.7; o.drawImage(sil, 0, 0); o.globalAlpha = 1; }
    e.key = k; e.size = size; e.shadows = shadows; e.at = [at[0], at[1]];
  }
  // o desenho guardado vale em qualquer posição: só a sombra precisa acompanhar onde ele foi gravado
  const dx = dest[0] - e.at[0], dy = dest[1] - e.at[1];
  for (const [st, x, y, ww, hh] of e.shadows) { ctx.fillStyle = st; ctx.fillRect(x + dx, y + dy, ww, hh); }
  const a0 = ctx.globalAlpha, smooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false; ctx.globalAlpha = a0 * alpha;
  ctx.drawImage(e.cv, dest[0] - ox, dest[1] - oy);
  ctx.globalAlpha = a0; ctx.imageSmoothingEnabled = smooth;
}
