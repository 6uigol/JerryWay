// Jerry, o esquilo, no padrão dos moradores e do Lyon: cabeça grande, olhos com brilho, pelo com luz e sombra, rabo em penacho e contorno escuro.
// view: 'side' (direita), 'left', 'front', 'back'. pose: idle, hop, sleep, eat, look, scratch, scared, sad, happy, carry, dig. f = quadro.
// suit: 'space' (macacão branco, capacete e mochila) ou 'dive' (roupa de neoprene e capacete de latão).
const C = {
  fur: '#d4843a', furD: '#a85a22', furL: '#eaa45a', belly: '#fbe6c0', bellyD: '#e8c890',
  tail: '#c8742e', tailD: '#8a4418', tailL: '#f2b870', ear: '#ff9ab0', eye: '#1d1424', nose: '#5a2a1a',
  acorn: '#c8843a', acornD: '#8a5424', cap: '#6a3a1a', tear: '#7ad0ff', blush: '#ff8fa8', mouth: '#7a2a2a',
};
// o rabo e o corpo são pintados em camadas separadas, cada uma com o próprio contorno (o rabo fica bem separado do corpo)
let LAYER = 'all', PART = 'body', HEAD = false, SUIT = null, PAL = null, SHADE = null;
// nome de cada cor original (fur, belly, tail, eye...): a skin usa isso para pintar estampas e roupas pixel a pixel
const KIND = Object.fromEntries(Object.entries(C).map(([k, v]) => [v, k]));
const SUITS = {
  space: { [C.fur]: '#e8eef8', [C.furL]: '#ffffff', [C.furD]: '#9aa4b8', [C.belly]: '#ffffff', [C.bellyD]: '#c8d2e2', [C.tail]: '#e8eef8', [C.tailL]: '#ffffff', [C.tailD]: '#62b9d9' },
  dive: { [C.fur]: '#1f6478', [C.furL]: '#2f8ca2', [C.furD]: '#14465a', [C.belly]: '#2f8ca2', [C.bellyD]: '#1f6478', [C.tail]: '#1f6478', [C.tailL]: '#2f8ca2', [C.tailD]: '#f0c040' },
};
const R = (c, x, y, w, h, col) => {
  if (LAYER !== 'all' && LAYER !== PART) return;
  const orig = col, suited = SUIT && !HEAD;
  if (suited) col = SUITS[SUIT][col] || col;   // o traje (espacial ou de mergulho) cobre o corpo, as patas e o rabo
  else if (PAL) col = PAL[col] || col;          // skin: troca as cores do pelo, da barriga e do rabo
  const kind = SHADE && !suited ? KIND[orig] : null;
  if (kind) {   // skin com estampa ou roupa: cada pixel pode mudar de cor conforme o lugar (x, y), a parte (corpo/rabo) e se é a cabeça
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { c.fillStyle = SHADE(kind, col, x + i, y + j, PART, HEAD) || col; c.fillRect(x + i, y + j, 1, 1); }
    return;
  }
  c.fillStyle = col; c.fillRect(x, y, w, h);
};
const H = (fn) => { HEAD = true; fn(); HEAD = false; };
const T = (fn) => { const prev = PART; PART = 'tail'; fn(); PART = prev; };

function eyeSide(c, x, y, o) {
  if (o.closed) { R(c, x, y + 1, 2, 1, C.eye); return; }
  if (o.happy) { R(c, x, y + 1, 1, 1, C.eye); R(c, x + 1, y, 1, 1, C.eye); return; }
  if (o.wide) { R(c, x - 1, y - 1, 3, 3, '#ffffff'); R(c, x, y, 1, 1, C.eye); return; }
  R(c, x, y, 2, 2, C.eye); R(c, x + 1, y, 1, 1, '#ffffff');
}
// rabo grande e felpudo em S (atrás, para a esquerda quando ele olha para a direita); sw = balanço; puff = arrepiado
function tailSide(c, x, y, sw = 0, puff = 0) { T(() => tailSidePaint(c, x, y, sw, puff)); }
function tailSidePaint(c, x, y, sw, puff) {
  const p = puff, rows = [   // [dy, x0, x1] em relação aos pés: base atrás do quadril, sobe pelas costas e abre um penacho que se enrola para a frente
    [-3, -7, -3], [-4, -8, -3], [-5, -8, -3], [-6, -9, -3], [-7, -9, -3], [-8, -9, -3], [-9, -9, -3], [-10, -9, -3], [-11, -9, -2],
    [-12, -9, -2], [-13, -9, -1], [-14, -9, 0], [-15, -8, 1], [-16, -7, 1], [-17, -6, 0], [-18, -4, -1],
  ];
  for (const [dy, x0, x1] of rows) { const s2 = dy < -11 ? sw : 0; R(c, x + x0 - p + s2, y + dy - (dy < -11 ? p : 0), x1 - x0 + 1 + p, 1, C.tail); }
  R(c, x + 1 + sw, y - 14 - p, 1, 1, C.tail);
  // luz na curva de fora e no topo do penacho, sombra perto do corpo
  for (const [dy, xx] of [[-4, -7], [-5, -8], [-6, -8], [-7, -9], [-8, -9], [-9, -9], [-10, -9], [-11, -9], [-12, -8], [-13, -8], [-14, -8], [-15, -7], [-16, -6]]) R(c, x + xx - p + (dy < -11 ? sw : 0), y + dy - (dy < -11 ? p : 0), 1, 1, C.tailL);
  R(c, x - 4 - p + sw, y - 18 - p, 3, 1, C.tailL); R(c, x - 1 + sw, y - 16 - p, 2, 1, C.tailL);
  for (let dy = -3; dy >= -11; dy--) R(c, x - 3, y + dy, 1, 1, C.tailD);
  R(c, x - 2 + sw, y - 13 - p, 2, 1, C.tailD); R(c, x - 6 + sw, y - 13 - p, 1, 3, C.tailD);
}
function headSide(c, x, y, o = {}) { H(() => headSidePaint(c, x, y, o)); }
function headSidePaint(c, x, y, o) {
  // cabeça grande com focinho, orelha com tufo e bochecha
  R(c, x - 1, y - 14, 7, 6, C.fur); R(c, x, y - 15, 5, 1, C.fur); R(c, x - 1, y - 9, 6, 1, C.furD);
  R(c, x, y - 15, 3, 1, C.furL);
  R(c, x + 4, y - 11, 3, 3, C.belly); R(c, x + 6, y - 11, 1, 1, C.nose); R(c, x + 4, y - 9, 2, 1, C.bellyD);
  if (o.earsDown) { R(c, x - 2, y - 14, 3, 1, C.fur); R(c, x - 2, y - 13, 2, 1, C.furD); }
  else { R(c, x, y - 17, 2, 2, C.fur); R(c, x, y - 18, 1, 1, C.furD); R(c, x + 1, y - 16, 1, 1, C.ear); }
  eyeSide(c, x + 2, y - 13, o);
  if (o.happy || o.blush) R(c, x + 3, y - 10, 1, 1, C.blush);
  if (o.tear) R(c, x + 2, y - 11, 1, 2, C.tear);
  if (o.open) R(c, x + 5, y - 9, 1, 1, C.mouth);
}
function bodySide(c, x, y, o = {}) {
  R(c, x - 3, y - 8, 6, 6, C.fur); R(c, x - 2, y - 9, 4, 1, C.fur); R(c, x - 3, y - 8, 1, 4, C.furL);
  R(c, x + 1, y - 7, 2, 5, C.belly);
  // perna de trás dobrada e pé
  R(c, x - 3, y - 4, 4, 3, C.furD); R(c, x - 2, y - 4, 2, 1, C.fur); R(c, x - 1, y - 1, 4, 1, C.furD);
  // patinhas da frente
  if (!o.noPaws) R(c, x + 2, y - 5, 2, 1, C.furD);
}

function side(c, x, y, pose, f) {
  const sw = pose === 'idle' ? (f % 2 ? 1 : 0) : 0;
  if (pose === 'sleep') {   // enrolado com o rabo por cima, respirando
    const b = f % 2;
    R(c, x - 6, y - 5 - b, 11, 5 + b, C.fur); R(c, x - 5, y - 6 - b, 8, 1, C.fur); R(c, x - 5, y - 1, 10, 1, C.furD);
    T(() => { R(c, x - 9, y - 8 - b, 8, 8 + b, C.tail); R(c, x - 8, y - 9 - b, 6, 1, C.tail); R(c, x - 8, y - 8 - b, 4, 1, C.tailL); R(c, x - 9, y - 6 - b, 1, 4, C.tailL); R(c, x - 3, y - 6 - b, 1, 5, C.tailD); R(c, x - 2, y - 8 - b, 3, 3, C.tail); R(c, x - 1, y - 8 - b, 2, 1, C.tailL); });
    R(c, x + 1, y - 7 - b, 5, 5, C.fur); R(c, x + 4, y - 4 - b, 3, 2, C.belly); R(c, x + 6, y - 4 - b, 1, 1, C.nose);
    R(c, x + 2, y - 8 - b, 2, 1, C.fur); R(c, x + 3, y - 8 - b, 1, 1, C.ear);
    R(c, x + 2, y - 5 - b, 2, 1, C.eye);
    return;
  }
  if (pose === 'hop') {   // f0 agachado, f1 no ar esticado
    if (f % 2 === 0) {
      tailSide(c, x, y + 2, -1);
      R(c, x - 4, y - 7, 8, 6, C.fur); R(c, x - 3, y - 8, 6, 1, C.fur); R(c, x + 1, y - 5, 3, 4, C.belly); R(c, x - 4, y - 3, 5, 2, C.furD); R(c, x + 2, y - 1, 3, 1, C.furD);
      headSide(c, x + 1, y + 3, {});
    } else {
      T(() => { R(c, x - 9, y - 11, 5, 5, C.tail); R(c, x - 12, y - 14, 5, 4, C.tail); R(c, x - 13, y - 15, 4, 2, C.tail); R(c, x - 12, y - 15, 3, 1, C.tailL); R(c, x - 13, y - 13, 1, 2, C.tailL); R(c, x - 8, y - 8, 3, 1, C.tailD); });
      R(c, x - 5, y - 10, 9, 5, C.fur); R(c, x - 4, y - 11, 7, 1, C.fur); R(c, x, y - 7, 4, 2, C.belly);
      R(c, x - 7, y - 6, 3, 2, C.furD); R(c, x + 3, y - 6, 2, 2, C.furD);
      headSide(c, x + 2, y + 1, {});
    }
    return;
  }
  const puff = pose === 'scared' ? 1 : 0;
  tailSide(c, x, y, sw, puff);
  if (pose === 'scratch') {   // pé de trás coçando a orelha
    bodySide(c, x, y, {});
    R(c, x - 3, y - 4, 4, 3, C.fur);
    const up = f % 2;
    R(c, x - 1, y - 11 - up, 2, 6, C.furD); R(c, x - 1, y - 12 - up, 3, 1, C.furD);
    headSide(c, x, y, { closed: true });
    return;
  }
  bodySide(c, x, y, { noPaws: pose === 'eat' || pose === 'carry' });
  if (pose === 'look') { headSide(c, x, y, {}); R(c, x + 4, y - 11, 3, 3, C.fur); R(c, x - 3, y - 11, 3, 3, C.belly); R(c, x - 3, y - 11, 1, 1, C.nose); R(c, x + 2, y - 13, 2, 2, C.fur); eyeSide(c, x - 1, y - 13, {}); return; }
  const o = { idle: { closed: f === 2 }, eat: { blush: true }, scared: { wide: true }, sad: { earsDown: true, tear: true }, happy: { happy: true, open: true } }[pose] || {};
  headSide(c, x, y, o);
  if (pose === 'eat') {   // bolota nas patinhas, mordiscando
    const n = f % 2;
    R(c, x + 4, y - 8 + n, 3, 1, C.cap); R(c, x + 4, y - 7 + n, 3, 2, C.acorn); R(c, x + 5, y - 6 + n, 1, 1, C.acornD);
    R(c, x + 3, y - 7 + n, 1, 2, C.furD); R(c, x + 7, y - 7 + n, 1, 2, C.furD);
    if (n) R(c, x + 5, y - 9, 1, 1, '#f4e0b0');
  }
}

function front(c, x, y, pose, f) {
  const sw = pose === 'idle' ? (f % 2 ? 1 : 0) : 0;
  if (pose === 'hop' && f % 2) y -= 2;
  // rabo atrás do corpo, subindo pela direita e fazendo a curva por cima
  T(() => {
    R(c, x + 3, y - 8, 4, 6, C.tail); R(c, x + 4, y - 13, 5, 6, C.tail); R(c, x + 3 + sw, y - 18, 6, 6, C.tail); R(c, x + 3 + sw, y - 19, 5, 2, C.tail);
    R(c, x + 4 + sw, y - 19, 3, 1, C.tailL); R(c, x + 8, y - 16 + sw, 1, 10, C.tailL); R(c, x + 4, y - 11, 1, 8, C.tailD);
  });
  // corpo sentado com barriga clara
  R(c, x - 3, y - 8, 7, 7, C.fur); R(c, x - 2, y - 9, 5, 1, C.fur); R(c, x - 2, y - 7, 5, 5, C.belly); R(c, x - 1, y - 3, 3, 1, C.bellyD);
  R(c, x - 4, y - 2, 3, 2, C.furD); R(c, x + 2, y - 2, 3, 2, C.furD); R(c, x - 4, y - 1, 3, 1, C.fur); R(c, x + 2, y - 1, 3, 1, C.fur);
  const carry = pose === 'carry', dig = pose === 'dig';
  if (carry) { R(c, x - 5, y - 15, 2, 7, C.furD); R(c, x + 4, y - 15, 2, 7, C.furD); }
  else if (dig) { const d = f % 2; R(c, x - 3, y - 3 + d, 2, 2, C.furD); R(c, x + 2, y - 3 + (1 - d), 2, 2, C.furD); }
  else if (pose === 'eat') { R(c, x - 1, y - 7, 3, 1, C.cap); R(c, x - 1, y - 6, 3, 2, C.acorn); R(c, x - 2, y - 6, 1, 2, C.furD); R(c, x + 2, y - 6, 1, 2, C.furD); }
  // cabeça grande
  const hy = dig ? y + 2 : y;
  HEAD = true;
  R(c, x - 4, hy - 14, 9, 6, C.fur); R(c, x - 3, hy - 15, 7, 1, C.fur); R(c, x - 3, hy - 9, 7, 1, C.furD); R(c, x - 3, hy - 15, 3, 1, C.furL);
  if (pose === 'sad') { R(c, x - 6, hy - 13, 2, 1, C.fur); R(c, x + 5, hy - 13, 2, 1, C.fur); }
  else { R(c, x - 4, hy - 17, 2, 3, C.fur); R(c, x + 3, hy - 17, 2, 3, C.fur); R(c, x - 3, hy - 16, 1, 2, C.ear); R(c, x + 3, hy - 16, 1, 2, C.ear); R(c, x - 4, hy - 18, 1, 1, C.furD); R(c, x + 4, hy - 18, 1, 1, C.furD); }
  R(c, x - 2, hy - 11, 5, 3, C.belly); R(c, x, hy - 11, 1, 1, C.nose);
  const o = { idle: { closed: f === 2 }, scared: { wide: true }, happy: { happy: true }, sad: { tear: true } }[pose] || {};
  for (const ex of [x - 3, x + 2]) {
    if (o.closed || pose === 'dig') R(c, ex, hy - 12, 2, 1, C.eye);
    else if (o.happy) { R(c, ex, hy - 12, 1, 1, C.eye); R(c, ex + 1, hy - 13, 1, 1, C.eye); }
    else if (o.wide) { R(c, ex - 1, hy - 14, 3, 3, '#ffffff'); R(c, ex, hy - 13, 1, 1, C.eye); }
    else { R(c, ex, hy - 13, 2, 2, C.eye); R(c, ex + 1, hy - 13, 1, 1, '#ffffff'); }
  }
  R(c, x - 4, hy - 10, 1, 1, C.blush); R(c, x + 4, hy - 10, 1, 1, C.blush);
  if (o.tear) R(c, x - 3, hy - 11, 1, 2, C.tear);
  if (o.happy || pose === 'scared') R(c, x, hy - 9, 1, 1, C.mouth);
  HEAD = false;
  if (dig) for (const [dx, dy] of [[-6, -3], [6, -4], [-5, -6], [5, -2]]) if ((dx + f) % 2 === 0) R(c, x + dx, y + dy, 1, 1, '#8a6238');
}

function back(c, x, y, pose, f) {
  const sw = pose === 'idle' ? (f % 2 ? 1 : 0) : 0;
  if (pose === 'hop' && f % 2) y -= 2;
  R(c, x - 3, y - 8, 7, 7, C.fur); R(c, x - 2, y - 9, 5, 1, C.fur); R(c, x - 4, y - 2, 3, 2, C.furD); R(c, x + 2, y - 2, 3, 2, C.furD);
  HEAD = true;
  R(c, x - 4, y - 14, 9, 6, C.fur); R(c, x - 3, y - 15, 7, 1, C.fur); R(c, x - 3, y - 15, 3, 1, C.furL);
  R(c, x - 4, y - 17, 2, 3, C.fur); R(c, x + 3, y - 17, 2, 3, C.fur); R(c, x - 4, y - 18, 1, 1, C.furD); R(c, x + 4, y - 18, 1, 1, C.furD);
  HEAD = false;
  R(c, x - 4, y - 9, 9, 1, C.furD); R(c, x - 5, y - 13, 1, 4, C.fur); R(c, x - 4, y - 12, 1, 3, C.furD); R(c, x - 4, y - 8, 1, 6, C.furD); R(c, x - 3, y - 7, 1, 4, C.furL);   // nuca, bochecha e costas com sombra
  // rabo felpudo na frente das costas, com a ponta enrolada por cima da cabeça
  T(() => {   // sobe do quadril pela direita das costas e abre o penacho por cima do ombro
    R(c, x, y - 7, 4, 6, C.tail); R(c, x + 1, y - 11, 5, 5, C.tail); R(c, x + 2, y - 15, 6, 5, C.tail); R(c, x + 3 + sw, y - 19, 6, 5, C.tail); R(c, x + 2 + sw, y - 20, 4, 2, C.tail); R(c, x + 1 + sw, y - 19, 2, 2, C.tail);
    R(c, x + 3 + sw, y - 20, 3, 1, C.tailL); R(c, x + 1, y - 9, 1, 3, C.tailL); R(c, x + 2, y - 13, 1, 4, C.tailL); R(c, x + 3, y - 16, 1, 3, C.tailL);
    R(c, x + 3, y - 6, 1, 5, C.tailD); R(c, x + 5, y - 10, 1, 4, C.tailD); R(c, x + 7, y - 14, 1, 4, C.tailD);
  });

}

const VIEWS = { side, front, back };
export function drawJerry(c, x, y, view, pose = 'idle', f = 0, o = {}) {
  if (view === 'left') { c.save(); c.translate(x * 2, 0); c.scale(-1, 1); side(c, x, y, pose, f); c.restore(); }
  else VIEWS[view](c, x, y, pose, f);
}
// contorno escuro de 1 pixel em volta de tudo que foi pintado
export function outline(cv, col = '#1a1226') {
  const c = cv.getContext('2d'), W = cv.width, H = cv.height, img = c.getImageData(0, 0, W, H), a = img.data;
  const solid = (x, y) => x >= 0 && y >= 0 && x < W && y < H && a[(y * W + x) * 4 + 3] > 100;
  const out = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) out.push([x, y]);
  c.fillStyle = col; for (const [x, y] of out) c.fillRect(x, y, 1, 1);
}
// um quadro pronto (com contorno) num canvas 28x28 com os pés em (14, 25); guardado em cache
const cache = new Map();
export function clearJerryCache() { cache.clear(); }
// skin = { id, pal: {corOriginal: corNova}, shade(kind, cor, x, y, parte, cabeça), suit, acc: função ou lista (c, hx, hy, view, sgn) } (veja skins.js); small = reduzir para 19x19
export function jerryFrame(view, pose, f = 0, skin = null, small = true) {
  const suit = skin && skin.suit || null;
  const key = `${view}|${pose}|${f}|${skin ? skin.id : ''}|${small ? 1 : 0}`;
  let cv = cache.get(key);
  if (cv) return cv;
  cv = document.createElement('canvas'); cv.width = 28; cv.height = 28;
  const c = cv.getContext('2d');
  SUIT = suit; PAL = skin && skin.pal || null; SHADE = skin && skin.shade || null;
  const layer = (name) => { const l = document.createElement('canvas'); l.width = 28; l.height = 28; LAYER = name; drawJerry(l.getContext('2d'), 14, 25, view, pose, f); LAYER = 'all'; outline(l); return l; };
  const order = view === 'back' && !suit ? ['body', 'tail'] : ['tail', 'body'];   // de traje, o rabo fica atrás (o capacete não passa por cima dele)
  for (const n of order) c.drawImage(layer(n), 0, 0);
  SUIT = null; PAL = null; SHADE = null;
  if (skin && skin.acc && pose !== 'sleep') {   // acessórios da skin (chapéu, óculos, coroa...) por cima, na cabeça, com o próprio contorno
    const side = view === 'side' || view === 'left', sgn = view === 'left' ? -1 : 1;
    const [ox, oy] = side ? (pose === 'hop' ? (f % 2 ? [4, 1] : [3, 3]) : [2, 0]) : [0, (pose === 'dig' ? 2 : 0) - (pose === 'hop' && f % 2 ? 2 : 0)];
    const l = document.createElement('canvas'); l.width = 28; l.height = 28; const lc = l.getContext('2d');
    for (const a of [].concat(skin.acc)) a(lc, 14 + ox * sgn, 25 - 12 + oy, view, sgn);
    outline(l); c.drawImage(l, 0, 0);
  }
  if (suit && pose !== 'sleep') {   // capacete de vidro em volta da cabeça (latão no mergulho) e, no espaço, mochila com antena
    const side = view === 'side' || view === 'left', sgn = view === 'left' ? -1 : 1;
    // centro da cabeça em cada pose (no pulo de lado a cabeça vai para a frente)
    const [ox, oy] = side ? (pose === 'hop' ? (f % 2 ? [4, 1] : [3, 3]) : [2, 0]) : [0, (pose === 'dig' ? 2 : 0) - (pose === 'hop' && f % 2 ? 2 : 0)];
    const hx = 14 + ox * sgn, hy = 25 - 12 + oy;
    const ring = suit === 'dive' ? '#c9a050' : '#e8eef8', glass = suit === 'dive' ? 'rgba(190,235,255,0.30)' : 'rgba(220,235,255,0.22)';
    if (suit === 'space' && side) {   // mochila com antena (de frente e de costas fica escondida atrás do corpo e do capacete)
      const bx = view === 'side' ? 14 - 6 : view === 'left' ? 14 + 3 : 14 - 3, by = 25 - 10;
      c.fillStyle = '#1a1226'; c.fillRect(bx - 1, by - 1, 5, 7); c.fillStyle = '#d8deea'; c.fillRect(bx, by, 3, 5); c.fillStyle = '#ff8a2a'; c.fillRect(bx, by, 3, 1);
      c.fillStyle = '#9aa4b8'; c.fillRect(bx + 1, by - 5, 1, 4); c.fillStyle = '#ff5a4a'; c.fillRect(bx + 1, by - 6, 1, 1);   // antena
    }
    c.fillStyle = glass; c.beginPath(); c.arc(hx + 0.5, hy, 7.6, 0, 7); c.fill();
    c.strokeStyle = '#1a1226'; c.lineWidth = 1; c.beginPath(); c.arc(hx + 0.5, hy, 8.4, 0, 7); c.stroke();
    c.strokeStyle = ring; c.lineWidth = 1.2; c.beginPath(); c.arc(hx + 0.5, hy, 7.4, 0, 7); c.stroke();
    c.fillStyle = '#ffffff'; c.fillRect(hx - 4, hy - 5, 2, 1); c.fillRect(hx - 5, hy - 4, 1, 2);
    if (suit === 'dive') { c.fillStyle = '#c9a050'; c.fillRect(hx - 4, hy + 6, 9, 2); c.fillStyle = '#f0d078'; c.fillRect(hx - 4, hy + 6, 9, 1); }
  }
  if (small) cv = shrink(cv);
  cache.set(key, cv);
  return cv;
}
// O desenho é feito em 28x28 (com detalhe) e reduzido para 19x19 (68%) no jogo:
// a redução é suavizada e depois cada pixel volta para a cor mais próxima do próprio quadro (continua pixel art, sem borrão).
// Pés em (9, 17) no quadro reduzido.
export const JERRY_SIZE = 19, JERRY_FEET = [9, 17];   // 19x19 no jogo (era 17): mais espaço para as estampas e acessórios das skins
function shrink(src) {
  const sd = src.getContext('2d').getImageData(0, 0, 28, 28).data, pal = new Map();
  for (let i = 0; i < sd.length; i += 4) if (sd[i + 3] > 200) pal.set((sd[i] << 16) | (sd[i + 1] << 8) | sd[i + 2], [sd[i], sd[i + 1], sd[i + 2]]);
  const P = [...pal.values()], out = document.createElement('canvas'); out.width = out.height = JERRY_SIZE;
  const c = out.getContext('2d'); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  c.drawImage(src, 0, 0, 28, 28, 0, 0, JERRY_SIZE, JERRY_SIZE);
  const img = c.getImageData(0, 0, JERRY_SIZE, JERRY_SIZE), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 110) { d[i + 3] = 0; continue; }
    let best = P[0], bd = 1e9;
    for (const q of P) { const e = (q[0] - d[i]) ** 2 + (q[1] - d[i + 1]) ** 2 + (q[2] - d[i + 2]) ** 2; if (e < bd) { bd = e; best = q; } }
    if (best) { d[i] = best[0]; d[i + 1] = best[1]; d[i + 2] = best[2]; } d[i + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  return out;
}
