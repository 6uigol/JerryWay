// As 180 skins do Jerry. Cada uma pode trocar as cores do pelo (pal), ter estampa no pelo (listras, manchas, máscara...),
// roupa no corpo (camisa, casaco, armadura, manto...), botas, olhos de outra cor, acessórios na cabeça e no pescoço (acc),
// um traje inteiro (suit) e, nas míticas, um efeito em volta dele (fx). Tudo é pintado pixel a pixel por jerry.js.
// Saem no sorteio (Sortear skin): 100 moedas por tentativa, podendo repetir.
// Raridade: comum, rara, épica, lendária e mítica. A chance é da raridade; dentro dela, todas têm a mesma chance.
// As míticas NÃO saem no sorteio: só pegando o esquilo mítico no caminho (muito raro; se passar da fileira dele, ele foge) e nunca repetem.
// Os ids (s000...s179) e a raridade de cada posição nunca mudam: quem já tem uma skin continua com ela.
export const RARITIES = {
  comum: { name: 'Comum', color: '#c8c8d8', chance: 55 },
  rara: { name: 'Rara', color: '#5ab0ff', chance: 28 },
  epica: { name: 'Épica', color: '#c07aff', chance: 12.5 },
  lendaria: { name: 'Lendária', color: '#ffb84a', chance: 4.5 },
  mitica: { name: 'Mítica', color: '#ff5a8a', chance: 0, onlyRun: true },   // só no caminho
};
export const PULL_COST = 100;

// ---------------------------------------------------------------- cores
// cores originais do Jerry (jerry.js) que a skin troca
const ORIG = { fur: '#d4843a', furD: '#a85a22', furL: '#eaa45a', belly: '#fbe6c0', bellyD: '#e8c890', tail: '#c8742e', tailD: '#8a4418', tailL: '#f2b870' };
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (a) => '#' + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, k) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * k));
const dark = (c, k = 0.28) => mix(c, '#000000', k), light = (c, k = 0.22) => mix(c, '#ffffff', k);
// paleta inteira a partir de uma cor de pelo (e, se quiser, de outra para a barriga e para o rabo)
function pal(fur, belly = null, tail = null) {
  const t = tail || mix(fur, '#000000', 0.06), b = belly || mix(fur, '#ffffff', 0.72);
  return {
    [ORIG.fur]: fur, [ORIG.furD]: dark(fur), [ORIG.furL]: light(fur),
    [ORIG.belly]: b, [ORIG.bellyD]: dark(b, 0.12),
    [ORIG.tail]: t, [ORIG.tailD]: dark(t, 0.38), [ORIG.tailL]: light(t, 0.3),
  };
}
// mesma variação de luz e sombra que o pelo tem, aplicada a uma cor nova
const tone = (kind, c) => (kind.endsWith('D') ? dark(c, kind.startsWith('tail') ? 0.38 : 0.28) : kind.endsWith('L') ? light(c, kind.startsWith('tail') ? 0.3 : 0.22) : c);
const FUR = new Set(['fur', 'furD', 'furL']), BELLY = new Set(['belly', 'bellyD']), TAIL = new Set(['tail', 'tailD', 'tailL']);
// ruído fixo por pixel (a mesma skin sai sempre igual)
const hsh = (x, y, s = 0) => { let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const RAINBOW = ['#ff5a5a', '#ff9a3a', '#ffd84a', '#5ad070', '#4aa8ff', '#a86ae8'];

// ---------------------------------------------------------------- estampas (no quadro 28x28: pés em y=25, corpo nas linhas 16-22, patas 23-24, cabeça até 16)
// cada uma recebe o tipo da cor (fur/belly/tail...), a cor atual, x, y, se é rabo e se é cabeça; devolve a cor nova ou nada
const PATTERNS = {
  pontaRabo: (k, c, x, y, tail, head, p) => tail && y <= 9 && tone(k, p),
  meias: (k, c, x, y, tail, head, p) => !tail && !head && y >= 22 && FUR.has(k) && tone(k, p),
  mascara: (k, c, x, y, tail, head, p) => head && FUR.has(k) && y >= 11 && y <= 13 && tone(k, p),
  sardas: (k, c, x, y, tail, head, p) => head && FUR.has(k) && y >= 12 && hsh(x, y, 3) < 0.16 && p,
  raboListrado: (k, c, x, y, tail, head, p) => tail && ((y >> 1) & 1) && tone(k, p),
  listras: (k, c, x, y, tail, head, p) => (tail ? ((y >> 1) & 1) : FUR.has(k) && (x + (y >> 1)) % 4 === 0) && tone(k, p),
  pintas: (k, c, x, y, tail, head, p) => (FUR.has(k) || TAIL.has(k)) && hsh(x >> 1, y >> 1, 7) < 0.24 && tone(k, p),
  manchas: (k, c, x, y, tail, head, p) => (FUR.has(k) || TAIL.has(k)) && hsh(x >> 2, y >> 2, 5) < 0.4 && tone(k, p),
  bicolor: (k, c, x, y, tail, head, p) => (FUR.has(k) || TAIL.has(k)) && x >= 14 && tone(k, p),
  degrade: (k, c, x, y, tail, head, p) => (FUR.has(k) || TAIL.has(k)) && mix(c, tone(k, p), Math.max(0, Math.min(1, (y - 6) / 18))),
  brilho: (k, c, x, y, tail, head, p) => (FUR.has(k) || TAIL.has(k)) && hsh(x, y, 11) < 0.07 && (p || '#ffffff'),
  estrelas: (k, c, x, y, tail, head) => (FUR.has(k) || TAIL.has(k)) && hsh(x, y, 13) < 0.1 && ['#ffffff', '#ffe070', '#c8b8ff'][Math.floor(hsh(x, y, 14) * 3)],
  rachaduras: (k, c, x, y, tail, head) => (FUR.has(k) || TAIL.has(k)) && (x * 3 + y * 2 + Math.floor(hsh(x >> 2, y >> 2, 2) * 5)) % 7 === 0 && (hsh(x, y, 4) < 0.3 ? '#ffe070' : '#ff7a2a'),
  geada: (k, c, x, y, tail, head) => (FUR.has(k) || TAIL.has(k)) && hsh(x, y, 9) < 0.2 && '#ffffff',
  escamas: (k, c, x, y, tail, head, p) => (FUR.has(k) || TAIL.has(k)) && y % 2 === 0 && (x + (y % 4 ? 1 : 0)) % 3 === 0 && tone(k, p),
  arcoIris: (k, c, x, y) => (FUR.has(k) || TAIL.has(k)) && tone(k, RAINBOW[Math.floor(y / 4) % 6]),
  metal: (k, c, x, y) => (FUR.has(k) || TAIL.has(k)) && (x + y) % 6 === 0 && light(c, 0.55),
  cristal: (k, c, x, y) => (FUR.has(k) || TAIL.has(k)) && (((x + y) >> 1) % 3 === 0 ? light(c, 0.45) : ((x - y + 40) >> 1) % 4 === 0 ? dark(c, 0.25) : null),
  runas: (k, c, x, y) => (FUR.has(k) || TAIL.has(k)) && hsh(x, y, 21) < 0.07 && '#e0a8ff',
  chamas: (k, c, x, y) => (FUR.has(k) || TAIL.has(k)) && tone(k, mix('#ffe070', '#d8341a', Math.max(0, Math.min(1, (y - 4) / 20)))),
  barriga: (k, c, x, y, tail, head, p) => BELLY.has(k) && tone(k === 'bellyD' ? 'furD' : 'fur', p),
};

// ---------------------------------------------------------------- roupas (só no corpo, linhas 16-22; o manto vai até os pés)
// cor principal (a), detalhe (b) e o desenho de cada uma
const OUTFITS = {
  camisa: (k, x, y, a, b) => (BELLY.has(k) ? (y === 16 ? b : tone(k === 'bellyD' ? 'furL' : 'fur', light(a, 0.15))) : tone(k, a)),
  regata: (k, x, y, a, b) => (BELLY.has(k) ? null : tone(k, a)),
  casaco: (k, x, y, a, b) => (BELLY.has(k) ? (Math.abs(x - 14) <= 0 ? b : tone('fur', light(a, 0.1))) : tone(k, a)),
  jaqueta: (k, x, y, a, b) => (BELLY.has(k) ? (x === 14 ? '#c8ccd8' : null) : tone(k, a)),
  moletom: (k, x, y, a, b) => (BELLY.has(k) ? (y >= 20 ? tone('furD', a) : tone('fur', light(a, 0.12))) : tone(k, a)),
  manto: (k, x, y, a, b) => (BELLY.has(k) ? (x === 14 ? b : tone('furL', a)) : y === 22 ? b : tone(k, a)),
  armadura: (k, x, y, a, b) => ((x + y) % 4 === 0 ? light(a, 0.6) : BELLY.has(k) ? (y === 18 ? b : tone('furL', a)) : tone(k, a)),
  macacao: (k, x, y, a, b) => (BELLY.has(k) ? (y <= 17 ? null : tone('fur', a)) : (x === 12 || x === 16) && y <= 19 ? a : null),
  kimono: (k, x, y, a, b) => (y === 20 ? b : BELLY.has(k) ? (x === 14 - (18 - y) || x === 14 + (18 - y) ? light(a, 0.5) : tone('fur', a)) : tone(k, a)),
  marinheiro: (k, x, y, a, b) => (y <= 17 ? b : BELLY.has(k) ? (y === 18 ? '#ff4a4a' : '#ffffff') : tone(k, '#ffffff')),
  listrada: (k, x, y, a, b) => tone(k.startsWith('belly') ? 'fur' : k, y % 2 ? a : b),
  havaiana: (k, x, y, a, b) => (hsh(x >> 1, y >> 1, 31) < 0.3 ? b : tone(k.startsWith('belly') ? 'furL' : k, a)),
  vestido: (k, x, y, a, b) => (BELLY.has(k) ? (y === 19 ? b : tone('furL', a)) : tone(k, a)),
  terno: (k, x, y, a, b) => (BELLY.has(k) ? (x === 14 ? b : '#f4f4f8') : tone(k, a)),
  jaleco: (k, x, y, a, b) => (BELLY.has(k) ? (x === 14 ? '#c8ccd8' : b) : tone(k, '#f4f4f8')),
  camiseta10: (k, x, y, a, b) => (BELLY.has(k) ? ((x === 13 || x === 15) && y >= 18 && y <= 20 ? b : x === 14 && y >= 18 && y <= 20 ? '#ffffff' : tone('fur', a)) : tone(k, a)),
};

// monta a skin: { pal, shade } a partir de uma descrição curta
//   fur/belly/tail: cores; pat: estampa e pc: cor dela; outfit: [tipo, cor, detalhe]; boots: cor das patas; eye: cor dos olhos
function look(o) {
  const out = { pal: pal(o.fur || '#d4843a', o.belly, o.tail) };
  const pats = [].concat(o.pat || []), outfit = o.outfit, boots = o.boots, eye = o.eye;
  if (!pats.length && !outfit && !boots && !eye) return out;
  out.shade = (k, c, x, y, part, head) => {
    const tail = part === 'tail';
    if (eye && k === 'eye') return eye;
    if (!tail && !head) {
      if (boots && y >= 23 && FUR.has(k)) return tone(k, boots);
      if (outfit && (y >= 16 && y <= 22 || (outfit[0] === 'manto' && y >= 23)) && (FUR.has(k) || BELLY.has(k))) {
        const r = OUTFITS[outfit[0]](k, x, y, outfit[1], outfit[2] || light(outfit[1], 0.4));
        if (r) return r;
      }
    }
    let col = null;
    for (const p of pats) { const [name, pc] = Array.isArray(p) ? p : [p, o.pc]; const r = PATTERNS[name](k, col || c, x, y, tail, head, pc); if (r) col = r; }
    return col;
  };
  return out;
}

// ---------------------------------------------------------------- acessórios (cabeça em (x, y): olhos na linha y-1, nariz em y+1, topo em y-3, orelhas até y-6, pescoço em y+3)
const P = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const face = (v) => v !== 'back';   // óculos, máscara e nariz não aparecem de costas
// capa: de frente só a gola; de costas cobre as costas; de lado cai atrás das costas
function cape(c, x, y, v, s, col, hi, clasp) {
  if (v === 'front') { P(c, x - 5, y + 3, 11, 1, col); if (clasp) P(c, x, y + 3, 1, 1, clasp); return; }
  if (v === 'back') { P(c, x - 5, y + 3, 11, 9, col); P(c, x - 5, y + 3, 11, 1, hi); P(c, x - 5, y + 11, 11, 1, dark(col, 0.3)); return; }
  const bx = s > 0 ? x - 6 : x + 4;   // tira estreita colada nas costas, sem esconder o rabo
  P(c, bx, y + 3, 3, 8, col); P(c, s > 0 ? bx : bx + 2, y + 4, 1, 7, hi); P(c, bx - (s > 0 ? 1 : -1), y + 9, 3, 3, col); P(c, bx - (s > 0 ? 1 : -1), y + 11, 3, 1, dark(col, 0.3)); P(c, s > 0 ? x - 4 : x + 1, y + 3, 4, 1, col);
}
const ACC = {
  laco: (c, x, y) => { P(c, x + 1, y - 7, 3, 3, '#ff5a9a'); P(c, x + 5, y - 7, 3, 3, '#ff5a9a'); P(c, x + 4, y - 6, 1, 1, '#c02a6a'); P(c, x + 1, y - 7, 1, 1, '#ffb0d0'); P(c, x + 5, y - 7, 1, 1, '#ffb0d0'); },
  bone: (c, x, y, v, s) => { P(c, x - 4, y - 6, 9, 3, '#3a7ad8'); P(c, x - 3, y - 7, 7, 1, '#3a7ad8'); P(c, x - 3, y - 6, 3, 1, '#7ab0ff'); P(c, x, y - 7, 1, 1, '#ffffff'); if (v === 'side' || v === 'left') P(c, s > 0 ? x + 3 : x - 7, y - 4, 5, 1, '#2a5aa8'); else if (v === 'front') P(c, x - 4, y - 3, 9, 1, '#2a5aa8'); },
  oculos: (c, x, y, v) => { if (!face(v)) { P(c, x - 4, y - 1, 9, 1, '#1a1a22'); return; } P(c, x - 4, y - 2, 4, 3, '#1a1a22'); P(c, x + 1, y - 2, 4, 3, '#1a1a22'); P(c, x, y - 1, 1, 1, '#1a1a22'); P(c, x - 3, y - 1, 2, 1, '#8ad0ff'); P(c, x + 2, y - 1, 2, 1, '#8ad0ff'); P(c, x - 3, y - 1, 1, 1, '#ffffff'); P(c, x + 2, y - 1, 1, 1, '#ffffff'); },
  oculosEscuros: (c, x, y, v) => { if (!face(v)) { P(c, x - 4, y - 1, 9, 1, '#1a1a22'); return; } P(c, x - 5, y - 2, 11, 1, '#1a1a22'); P(c, x - 4, y - 1, 4, 2, '#1a1a22'); P(c, x + 1, y - 1, 4, 2, '#1a1a22'); P(c, x - 3, y - 1, 1, 1, '#7a8aff'); P(c, x + 2, y - 1, 1, 1, '#7a8aff'); },
  cachecol: (c, x, y) => { P(c, x - 4, y + 3, 9, 2, '#e04848'); P(c, x - 4, y + 3, 9, 1, '#ff7a6a'); P(c, x + 2, y + 5, 2, 4, '#e04848'); P(c, x + 2, y + 8, 2, 1, '#ffffff'); for (const i of [-3, 0, 3]) P(c, x + i, y + 4, 1, 1, '#a82a2a'); },
  bandana: (c, x, y) => { P(c, x - 4, y - 4, 9, 2, '#d83a3a'); P(c, x - 4, y - 4, 9, 1, '#ff6a5a'); for (const i of [-3, 0, 3]) P(c, x + i, y - 3, 1, 1, '#ffffff'); P(c, x + 5, y - 3, 2, 1, '#d83a3a'); P(c, x + 6, y - 2, 1, 2, '#d83a3a'); },
  gravata: (c, x, y, v) => { if (!face(v)) return; P(c, x - 3, y + 3, 3, 3, '#d83a5a'); P(c, x + 1, y + 3, 3, 3, '#d83a5a'); P(c, x, y + 4, 1, 1, '#8a1a3a'); P(c, x - 3, y + 3, 1, 1, '#ff8aa0'); },
  medalha: (c, x, y, v) => { P(c, x - 3, y + 3, 1, 2, '#3a7ad8'); P(c, x + 3, y + 3, 1, 2, '#3a7ad8'); if (!face(v)) return; P(c, x - 1, y + 5, 3, 3, '#ffcc3a'); P(c, x - 1, y + 5, 1, 1, '#fff2a0'); P(c, x, y + 6, 1, 1, '#c8901a'); },
  sino: (c, x, y, v) => { P(c, x - 3, y + 3, 7, 1, '#a83a2a'); if (!face(v)) return; P(c, x - 1, y + 4, 3, 3, '#ffcc3a'); P(c, x - 1, y + 4, 1, 1, '#fff2a0'); P(c, x, y + 7, 1, 1, '#8a6a1c'); },
  gorro: (c, x, y) => { P(c, x - 4, y - 7, 9, 4, '#4aa860'); P(c, x - 3, y - 8, 7, 1, '#4aa860'); P(c, x - 4, y - 4, 9, 1, '#e8e8e8'); for (const i of [-3, -1, 1, 3]) P(c, x + i, y - 6, 1, 2, '#3a8850'); P(c, x - 1, y - 10, 3, 2, '#ffffff'); },
  palha: (c, x, y) => { P(c, x - 7, y - 4, 15, 1, '#e8c860'); P(c, x - 6, y - 3, 13, 1, '#c8a040'); P(c, x - 3, y - 8, 7, 4, '#e8c860'); P(c, x - 3, y - 5, 7, 1, '#c84a3a'); P(c, x - 2, y - 8, 2, 1, '#fff0a0'); },
  fone: (c, x, y) => { P(c, x - 4, y - 7, 9, 1, '#2a2a3a'); P(c, x - 5, y - 6, 1, 2, '#2a2a3a'); P(c, x + 4, y - 6, 1, 2, '#2a2a3a'); P(c, x - 6, y - 4, 3, 4, '#ff5a5a'); P(c, x + 4, y - 4, 3, 4, '#ff5a5a'); P(c, x - 6, y - 4, 1, 1, '#ffa0a0'); P(c, x + 4, y - 4, 1, 1, '#ffa0a0'); },
  flor: (c, x, y) => { for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) P(c, x + 3 + dx, y - 6 + dy, 1, 1, '#ff8ad0'); P(c, x + 3, y - 6, 1, 1, '#ffe070'); },
  coroaFlores: (c, x, y) => { P(c, x - 4, y - 5, 9, 1, '#4a9a4a'); for (const [i, col] of [[-4, '#ff8ad0'], [-1, '#ffe070'], [2, '#8ad0ff'], [4, '#ff8ad0']]) { P(c, x + i, y - 6, 2, 2, col); P(c, x + i, y - 6, 1, 1, '#ffffff'); } },
  tiara: (c, x, y) => { P(c, x - 3, y - 6, 7, 1, '#e8e8f8'); P(c, x - 1, y - 7, 3, 1, '#e8e8f8'); P(c, x, y - 8, 1, 1, '#e8e8f8'); P(c, x, y - 7, 1, 1, '#7af0ff'); },
  chifres: (c, x, y) => { P(c, x - 4, y - 8, 1, 3, '#f4e8d0'); P(c, x + 4, y - 8, 1, 3, '#f4e8d0'); P(c, x - 5, y - 10, 1, 2, '#f4e8d0'); P(c, x + 5, y - 10, 1, 2, '#f4e8d0'); P(c, x - 6, y - 11, 1, 1, '#f4e8d0'); P(c, x + 6, y - 11, 1, 1, '#f4e8d0'); },
  chifresDiabo: (c, x, y) => { P(c, x - 4, y - 7, 2, 2, '#d83a3a'); P(c, x + 3, y - 7, 2, 2, '#d83a3a'); P(c, x - 5, y - 9, 1, 2, '#d83a3a'); P(c, x + 5, y - 9, 1, 2, '#d83a3a'); },
  antenas: (c, x, y) => { P(c, x - 2, y - 9, 1, 4, '#3a3a4a'); P(c, x + 2, y - 9, 1, 4, '#3a3a4a'); P(c, x - 3, y - 11, 2, 2, '#ffe070'); P(c, x + 2, y - 11, 2, 2, '#ffe070'); },
  antenasPretas: (c, x, y) => { P(c, x - 2, y - 9, 1, 4, '#1a1a24'); P(c, x + 2, y - 9, 1, 4, '#1a1a24'); P(c, x - 3, y - 10, 2, 2, '#1a1a24'); P(c, x + 2, y - 10, 2, 2, '#1a1a24'); },
  coelho: (c, x, y) => { for (const ex of [-3, 2]) { P(c, x + ex, y - 13, 2, 8, '#f4f4f8'); P(c, x + ex, y - 12, 1, 6, '#ffb0c8'); } },
  orelhasGato: (c, x, y) => { P(c, x - 5, y - 9, 3, 4, '#1a1a24'); P(c, x + 3, y - 9, 3, 4, '#1a1a24'); P(c, x - 4, y - 7, 1, 2, '#ff9ab0'); P(c, x + 4, y - 7, 1, 2, '#ff9ab0'); },
  coroa: (c, x, y) => { P(c, x - 4, y - 7, 9, 3, '#ffcc3a'); P(c, x - 4, y - 9, 1, 2, '#ffcc3a'); P(c, x, y - 10, 1, 3, '#ffcc3a'); P(c, x + 4, y - 9, 1, 2, '#ffcc3a'); P(c, x - 4, y - 7, 9, 1, '#fff2a0'); P(c, x - 2, y - 6, 1, 1, '#3a7ad8'); P(c, x, y - 6, 1, 1, '#ff3a5a'); P(c, x + 2, y - 6, 1, 1, '#3aa860'); },
  coroinha: (c, x, y) => { P(c, x - 2, y - 6, 5, 2, '#ffcc3a'); P(c, x - 2, y - 7, 1, 1, '#ffcc3a'); P(c, x, y - 8, 1, 2, '#ffcc3a'); P(c, x + 2, y - 7, 1, 1, '#ffcc3a'); P(c, x, y - 6, 1, 1, '#ff3a5a'); },
  coroaGelo: (c, x, y) => { P(c, x - 4, y - 6, 9, 2, '#bfe8ff'); for (const [i, h] of [[-4, 2], [-2, 4], [0, 5], [2, 4], [4, 2]]) P(c, x + i, y - 6 - h, 1, h, '#e8f8ff'); P(c, x, y - 11, 1, 1, '#ffffff'); },
  mago: (c, x, y) => { P(c, x - 6, y - 5, 13, 2, '#6a3ab8'); P(c, x - 4, y - 8, 9, 3, '#6a3ab8'); P(c, x - 3, y - 10, 7, 2, '#6a3ab8'); P(c, x - 1, y - 12, 4, 2, '#6a3ab8'); P(c, x + 1, y - 14, 3, 2, '#6a3ab8'); P(c, x + 3, y - 15, 2, 1, '#6a3ab8'); P(c, x - 4, y - 6, 9, 1, '#ffcc3a'); P(c, x, y - 9, 1, 1, '#ffe070'); P(c, x - 2, y - 11, 1, 1, '#fff2a0'); },
  bruxa: (c, x, y) => { P(c, x - 7, y - 5, 15, 2, '#2a1a3a'); P(c, x - 4, y - 8, 9, 3, '#2a1a3a'); P(c, x - 3, y - 10, 6, 2, '#2a1a3a'); P(c, x - 3, y - 12, 4, 2, '#2a1a3a'); P(c, x - 5, y - 13, 3, 1, '#2a1a3a'); P(c, x - 4, y - 6, 9, 1, '#7ad860'); P(c, x, y - 6, 1, 1, '#ffe070'); },
  cartola: (c, x, y) => { P(c, x - 6, y - 5, 13, 2, '#1a1a24'); P(c, x - 4, y - 12, 9, 7, '#1a1a24'); P(c, x - 4, y - 7, 9, 2, '#c83a4a'); P(c, x - 3, y - 12, 1, 4, '#3a3a4a'); },
  aureola: (c, x, y) => { P(c, x - 3, y - 11, 7, 1, '#fff27a'); P(c, x - 4, y - 10, 1, 1, '#fff27a'); P(c, x + 4, y - 10, 1, 1, '#fff27a'); P(c, x - 3, y - 9, 7, 1, '#e8c83a'); },
  mascara: (c, x, y, v) => { if (!face(v)) { P(c, x - 4, y - 1, 9, 1, '#1a1a22'); return; } P(c, x - 5, y - 2, 11, 3, '#1a1a22'); P(c, x - 3, y - 1, 2, 1, '#ffffff'); P(c, x + 2, y - 1, 2, 1, '#ffffff'); P(c, x + 5, y - 1, 2, 1, '#1a1a22'); },
  ninja: (c, x, y, v, s) => { P(c, x - 5, y - 4, 11, 2, '#1a1a24'); P(c, x - 5, y - 4, 11, 1, '#3a3a4a'); P(c, s < 0 ? x + 5 : x - 8, y - 3, 3, 1, '#1a1a24'); P(c, s < 0 ? x + 7 : x - 9, y - 2, 2, 2, '#1a1a24'); if (face(v)) P(c, x - 4, y + 1, 9, 2, '#1a1a24'); },
  tapaOlho: (c, x, y, v) => { P(c, x - 5, y - 3, 11, 1, '#1a1a22'); if (face(v)) P(c, x + 1, y - 2, 3, 3, '#1a1a22'); },
  pirata: (c, x, y) => { P(c, x - 6, y - 5, 13, 2, '#1a1a24'); P(c, x - 4, y - 8, 9, 3, '#1a1a24'); P(c, x - 2, y - 9, 5, 1, '#1a1a24'); P(c, x - 6, y - 5, 13, 1, '#ffcc3a'); P(c, x - 1, y - 7, 3, 2, '#ffffff'); P(c, x, y - 7, 1, 1, '#1a1a24'); },
  cowboy: (c, x, y) => { P(c, x - 7, y - 4, 15, 1, '#8a5a32'); P(c, x - 8, y - 5, 2, 1, '#8a5a32'); P(c, x + 7, y - 5, 2, 1, '#8a5a32'); P(c, x - 4, y - 8, 9, 4, '#a8703a'); P(c, x - 3, y - 9, 3, 1, '#a8703a'); P(c, x + 1, y - 9, 3, 1, '#a8703a'); P(c, x - 4, y - 5, 9, 1, '#3a2418'); },
  safari: (c, x, y) => { P(c, x - 6, y - 4, 13, 1, '#c8b078'); P(c, x - 4, y - 8, 9, 4, '#d8c088'); P(c, x - 3, y - 9, 7, 1, '#d8c088'); P(c, x - 4, y - 5, 9, 1, '#6a5a3a'); },
  helice: (c, x, y) => { P(c, x - 4, y - 6, 9, 3, '#ff5a5a'); P(c, x - 4, y - 6, 3, 3, '#4aa8ff'); P(c, x + 2, y - 6, 3, 3, '#ffd84a'); P(c, x, y - 8, 1, 2, '#3a3a4a'); P(c, x - 4, y - 9, 9, 1, '#5ad070'); },
  viking: (c, x, y) => { P(c, x - 4, y - 7, 9, 4, '#9aa0b0'); P(c, x - 3, y - 8, 7, 1, '#9aa0b0'); P(c, x - 3, y - 7, 2, 1, '#d8dce8'); P(c, x - 4, y - 4, 9, 1, '#6a5a3a'); P(c, x - 6, y - 8, 2, 3, '#f4e8d0'); P(c, x + 5, y - 8, 2, 3, '#f4e8d0'); P(c, x - 7, y - 10, 1, 2, '#f4e8d0'); P(c, x + 7, y - 10, 1, 2, '#f4e8d0'); },
  chef: (c, x, y) => { P(c, x - 4, y - 5, 9, 2, '#e8e8f0'); P(c, x - 4, y - 10, 9, 5, '#ffffff'); P(c, x - 5, y - 9, 11, 3, '#ffffff'); P(c, x - 2, y - 11, 5, 1, '#ffffff'); P(c, x - 3, y - 7, 1, 2, '#d8d8e8'); P(c, x + 2, y - 8, 1, 2, '#d8d8e8'); },
  detetive: (c, x, y) => { P(c, x - 5, y - 5, 11, 2, '#8a6a4a'); P(c, x - 4, y - 8, 9, 3, '#8a6a4a'); for (let i = -4; i <= 4; i += 2) P(c, x + i, y - 8, 1, 3, '#6a4a2a'); P(c, x - 6, y - 4, 2, 1, '#8a6a4a'); P(c, x + 5, y - 4, 2, 1, '#8a6a4a'); },
  monoculo: (c, x, y, v) => { if (!face(v)) return; P(c, x + 1, y - 2, 3, 3, '#ffcc3a'); P(c, x + 2, y - 1, 1, 1, '#bfe8ff'); P(c, x + 3, y + 1, 1, 3, '#ffcc3a'); },
  bombeiro: (c, x, y) => { P(c, x - 6, y - 4, 13, 1, '#a82a2a'); P(c, x - 4, y - 8, 9, 4, '#d83a3a'); P(c, x - 3, y - 9, 7, 1, '#d83a3a'); P(c, x - 1, y - 8, 3, 3, '#ffcc3a'); P(c, x - 3, y - 8, 1, 1, '#ff8a8a'); },
  cavaleiro: (c, x, y, v) => { P(c, x - 5, y - 7, 11, 9, '#9aa0b0'); P(c, x - 4, y - 8, 9, 1, '#9aa0b0'); P(c, x - 5, y - 7, 11, 1, '#d8dce8'); P(c, x - 4, y - 6, 2, 6, '#c8ccd8'); P(c, x, y - 11, 1, 3, '#d83a3a'); P(c, x - 1, y - 12, 3, 1, '#d83a3a'); if (face(v)) { P(c, x - 4, y - 1, 9, 1, '#1a1a22'); for (const i of [-3, 0, 3]) P(c, x + i, y + 1, 1, 1, '#5a6070'); } },
  moicano: (c, x, y) => { for (const [i, h] of [[-1, 3], [0, 5], [1, 4], [2, 3]]) P(c, x + i, y - 3 - h, 1, h, '#ff3a9a'); P(c, x, y - 8, 1, 2, '#ff8ad0'); },
  coque: (c, x, y) => { P(c, x - 1, y - 8, 3, 3, '#1a1a24'); P(c, x - 2, y - 6, 5, 1, '#d83a3a'); P(c, x, y - 9, 1, 1, '#3a3a4a'); },
  narizPalhaco: (c, x, y, v) => { if (face(v)) { P(c, x - 1, y, 3, 3, '#ff2a3a'); P(c, x - 1, y, 1, 1, '#ffa0a0'); } },
  perucaPalhaco: (c, x, y) => { for (const [dx, col] of [[-7, '#ff5a5a'], [-6, '#ffd84a'], [5, '#4aa8ff'], [6, '#5ad070']]) P(c, x + dx, y - 5, 2, 5, col); P(c, x - 2, y - 7, 5, 2, '#ff8a2a'); },
  marinheiro: (c, x, y) => { P(c, x - 4, y - 6, 9, 3, '#ffffff'); P(c, x - 4, y - 4, 9, 1, '#2a4aa8'); P(c, x - 3, y - 7, 7, 1, '#ffffff'); P(c, x, y - 6, 1, 1, '#ffcc3a'); },
  oculosProtecao: (c, x, y, v) => { P(c, x - 5, y - 2, 11, 1, '#5a4a3a'); if (!face(v)) return; P(c, x - 4, y - 2, 4, 3, '#3a3a4a'); P(c, x + 1, y - 2, 4, 3, '#3a3a4a'); P(c, x - 3, y - 1, 2, 1, '#7af0a0'); P(c, x + 2, y - 1, 2, 1, '#7af0a0'); },
  espelhoMedico: (c, x, y) => { P(c, x - 4, y - 5, 9, 1, '#3a3a4a'); P(c, x - 2, y - 8, 4, 3, '#c8ccd8'); P(c, x - 1, y - 7, 2, 1, '#ffffff'); },
  topete: (c, x, y) => { P(c, x - 4, y - 7, 8, 3, '#5a3a22'); P(c, x - 2, y - 9, 5, 2, '#5a3a22'); P(c, x + 1, y - 10, 3, 1, '#7a5232'); P(c, x - 3, y - 7, 2, 1, '#8a6a42'); },
  juba: (c, x, y) => { for (let i = -3; i <= 3; i++) P(c, x + i, y - 6 - (i % 2 ? 1 : 0), 1, 3 + (i % 2 ? 1 : 0), '#2a1a12'); P(c, x - 1, y - 8, 3, 1, '#4a2a1a'); },
  concha: (c, x, y) => { P(c, x + 1, y - 7, 5, 3, '#ffb0c8'); P(c, x + 2, y - 8, 3, 1, '#ffb0c8'); for (const i of [2, 4]) P(c, x + i, y - 7, 1, 3, '#ff7aa8'); P(c, x - 3, y - 6, 2, 2, '#ffffff'); },
  estrela: (c, x, y) => { P(c, x - 1, y - 11, 3, 1, '#ffe070'); P(c, x, y - 12, 1, 3, '#ffe070'); P(c, x, y - 11, 1, 1, '#ffffff'); },
  cristais: (c, x, y) => { P(c, x - 4, y - 9, 2, 4, '#7af0ff'); P(c, x - 1, y - 11, 2, 6, '#c08aff'); P(c, x + 2, y - 9, 2, 4, '#7af0ff'); P(c, x - 1, y - 11, 1, 2, '#ffffff'); P(c, x - 4, y - 9, 1, 1, '#ffffff'); },
  chama: (c, x, y) => { P(c, x - 3, y - 9, 7, 4, '#ff8a2a'); P(c, x - 2, y - 11, 5, 2, '#ffc83a'); P(c, x - 1, y - 13, 3, 2, '#ffe070'); P(c, x, y - 14, 1, 1, '#fff4a0'); },
  capa: (c, x, y, v, s) => cape(c, x, y, v, s, '#c83a4a', '#ff6a6a', '#ffcc3a'),
  capaRoxa: (c, x, y, v, s) => cape(c, x, y, v, s, '#5a2a8a', '#8a5ac8', '#ffcc3a'),
  capaVampiro: (c, x, y, v, s) => { cape(c, x, y, v, s, '#1a1a24', '#3a3a4a', null); if (v === 'front') { P(c, x - 6, y + 2, 2, 3, '#1a1a24'); P(c, x + 5, y + 2, 2, 3, '#1a1a24'); P(c, x - 6, y + 2, 1, 2, '#c83a4a'); P(c, x + 6, y + 2, 1, 2, '#c83a4a'); } },
  arminho: (c, x, y, v, s) => { cape(c, x, y, v, s, '#c8283a', '#e84858', null); if (v === 'front') { P(c, x - 5, y + 3, 11, 2, '#f4f4f8'); for (const i of [-4, -1, 2]) P(c, x + i, y + 3, 1, 1, '#1a1a24'); } else if (v !== 'back') { P(c, x - 4, y + 3, 6, 2, '#f4f4f8'); P(c, x - 2, y + 3, 1, 1, '#1a1a24'); P(c, x + 1, y + 4, 1, 1, '#1a1a24'); } },
};
const A = (...names) => names.map((n) => ACC[n]);

// ---------------------------------------------------------------- cores de pelo
const COMMON_FUR = [
  ['Avelã', '#d4843a'], ['Caramelo', '#c87a32'], ['Canela', '#a85a2a'], ['Mel', '#e0a040'], ['Castanha', '#8a5a32'], ['Cinza', '#8a8a96'],
  ['Grafite', '#5a5a66'], ['Creme', '#e8d0a0'], ['Neve', '#e8e8f0'], ['Ferrugem', '#b84a22'], ['Chocolate', '#6a3a22'], ['Areia', '#d8b878'],
  ['Musgo', '#7a8a4a'], ['Pêssego', '#f0a070'], ['Tijolo', '#a8422a'], ['Café', '#7a5238'], ['Trigo', '#d8b060'], ['Bronze', '#a8703a'],
  ['Carvão', '#3a3440'], ['Pérola', '#d8d0c8'], ['Ocre', '#c8902a'], ['Fumaça', '#a09aa8'], ['Abóbora', '#e0702a'], ['Barro', '#9a6a4a'],
  ['Folha Seca', '#b8883a'], ['Noz', '#7a4a2a'], ['Palha', '#e0c070'], ['Aveia', '#c8b088'], ['Pinha', '#8a6040'], ['Cobre', '#c06a3a'],
  ['Granito', '#7a7480'], ['Baunilha', '#f0e0b0'], ['Tâmara', '#9a4a32'], ['Amêndoa', '#c89868'], ['Gengibre', '#d07a3a'],
];
const VIVID_FUR = [
  ['Menta', '#5ad0a0'], ['Algodão-Doce', '#ff9ad0'], ['Céu', '#5ab0ff'], ['Lavanda', '#a88ae8'], ['Limão', '#c8e048'], ['Coral', '#ff7a6a'],
  ['Turquesa', '#2ac0c8'], ['Uva', '#7a3ab8'], ['Cereja', '#d83a5a'], ['Oceano', '#2a6ad8'], ['Floresta', '#3a8a4a'], ['Ametista', '#9a5ad8'],
];

// ---------------------------------------------------------------- a lista (a ordem define os ids: não mude a quantidade de cada raridade)
export const SKINS = [];
const add = (rarity, name, opts) => SKINS.push({ id: 's' + String(SKINS.length).padStart(3, '0'), rarity, name, ...opts });

// 70 comuns: as 35 cores com marcas naturais (ponta do rabo, meias, máscara, sardas...) e as mesmas cores com um acessório simples
const MARKS = [null, ['pontaRabo', '#fbf0dc', 'Ponta Clara'], ['meias', '#fbf0dc', 'de Meias'], ['sardas', '#7a4a2a', 'Sardento'], ['mascara', '#3a2a2a', 'Mascarado'], ['raboListrado', '#3a2a22', 'de Rabo Listrado'], ['barriga', '#fbf0dc', 'de Peito Branco']];
COMMON_FUR.forEach(([n, c], i) => {
  const m = MARKS[i % MARKS.length];
  add('comum', m ? `${n} ${m[2]}` : n, look(m ? { fur: c, pat: [[m[0], m[0] === 'pontaRabo' || m[0] === 'meias' || m[0] === 'barriga' ? light(c, 0.75) : dark(c, 0.55)]] } : { fur: c }));
});
const SIMPLE = [['laco', 'Laço'], ['bone', 'Boné'], ['oculos', 'Óculos'], ['cachecol', 'Cachecol'], ['bandana', 'Bandana'], ['gravata', 'Gravatinha'], ['flor', 'Flor']];
COMMON_FUR.forEach(([n, c], i) => { const [a, an] = SIMPLE[i % SIMPLE.length]; add('comum', `${n} com ${an}`, { ...look({ fur: c, pat: i % 3 === 0 ? [['pontaRabo', light(c, 0.75)]] : [] }), acc: A(a) }); });

// 55 raras: estampas (tigrado, pintado, bicolor, degradê) com acessórios melhores; as cores vivas ganham brilho
const RARE_PAT = [['listras', 'Tigrado', (c) => dark(c, 0.6)], ['pintas', 'Pintado', (c) => dark(c, 0.5)], ['bicolor', 'Bicolor', (c) => light(c, 0.6)], ['degrade', 'Degradê', (c) => mix(c, '#ff5a8a', 0.6)], ['manchas', 'Malhado', (c) => light(c, 0.7)]];
const RARE_ACC = [['gorro', 'Gorro'], ['palha', 'Chapéu de Palha'], ['fone', 'Fone'], ['coroaFlores', 'Coroa de Flores'], ['tiara', 'Tiara'], ['chifres', 'Chifres'], ['antenas', 'Antenas'], ['coelho', 'Orelhas de Coelho'], ['oculosEscuros', 'Óculos Escuros'], ['helice', 'Boné de Hélice'], ['medalha', 'Medalha']];
for (let i = 0; i < 43; i++) {
  const [n, c] = COMMON_FUR[(i * 8 + 3) % COMMON_FUR.length], [pt, pn, pcol] = RARE_PAT[i % RARE_PAT.length], [a, an] = RARE_ACC[i % RARE_ACC.length];
  add('rara', `${n} ${pn} com ${an}`, { ...look({ fur: c, pat: [[pt, pcol(c)]], boots: i % 4 === 1 ? dark(c, 0.5) : null }), acc: A(a) });
}
VIVID_FUR.forEach(([n, c], i) => add('rara', `${n} Brilhante`, { ...look({ fur: c, belly: light(c, 0.8), pat: [['degrade', mix(c, '#ffffff', 0.35)], ['brilho', '#ffffff']] }), acc: i % 2 ? A('flor') : [] }));

// 35 épicas: fantasias completas (roupa + chapéu + estampa)
const EPIC = [
  ['Pirata', { fur: '#c87a32', outfit: ['casaco', '#c83a3a', '#ffcc3a'], boots: '#3a2418' }, ['pirata', 'tapaOlho']],
  ['Ninja', { fur: '#5a5a66', outfit: ['regata', '#1a1a24'], boots: '#1a1a24', eye: '#d83a3a' }, ['ninja']],
  ['Cavaleiro', { fur: '#d4843a', outfit: ['armadura', '#9aa0b0', '#d83a3a'], boots: '#6a7080' }, ['cavaleiro']],
  ['Mago', { fur: '#a88ae8', outfit: ['manto', '#4a2a8a', '#ffcc3a'] }, ['mago']],
  ['Chef', { fur: '#e0a040', outfit: ['camisa', '#f4f4f8', '#d83a3a'] }, ['chef', 'gravata']],
  ['Detetive', { fur: '#8a5a32', outfit: ['casaco', '#a8885a', '#6a4a2a'], boots: '#3a2418' }, ['detetive', 'monoculo']],
  ['Bombeiro', { fur: '#c06a3a', outfit: ['jaqueta', '#d83a3a'], boots: '#1a1a24' }, ['bombeiro']],
  ['Roqueiro', { fur: '#3a3440', outfit: ['jaqueta', '#2a2a32'], boots: '#1a1a24', pat: [['pontaRabo', '#ff3a9a']] }, ['moicano', 'oculosEscuros']],
  ['Fazendeiro', { fur: '#d8b060', outfit: ['macacao', '#3a6ab8'], boots: '#6a4a2a' }, ['palha']],
  ['Marinheiro', { fur: '#e8d0a0', outfit: ['marinheiro', '#ffffff', '#2a4aa8'] }, ['marinheiro']],
  ['Samurai', { fur: '#a85a2a', outfit: ['kimono', '#2a4a8a', '#d83a3a'] }, ['coque']],
  ['Vampiro', { fur: '#3a3440', belly: '#e8e0f0', outfit: ['terno', '#1a1a24', '#c83a4a'], eye: '#d83a3a' }, ['capaVampiro']],
  ['Abelha', { fur: '#ffcc3a', pat: [['listras', '#1a1a24'], ['raboListrado', '#1a1a24']] }, ['antenasPretas']],
  ['Joaninha', { fur: '#d83a3a', belly: '#1a1a24', pat: [['pintas', '#1a1a24']] }, ['antenasPretas']],
  ['Panda', { fur: '#f4f4f8', tail: '#f4f4f8', pat: [['mascara', '#1a1a24'], ['meias', '#1a1a24'], ['pontaRabo', '#1a1a24']] }, ['flor']],
  ['Guaxinim', { fur: '#8a8a96', pat: [['mascara', '#2a2a32'], ['raboListrado', '#2a2a32']] }, ['oculos']],
  ['Tigre', { fur: '#e0702a', belly: '#fbf0dc', pat: [['listras', '#1a1a24']] }, ['gravata']],
  ['Zebra', { fur: '#f4f4f8', belly: '#f4f4f8', pat: [['listras', '#1a1a24']] }, ['juba']],
  ['Vaquinha', { fur: '#f4f4f8', pat: [['manchas', '#2a2a32']] }, ['sino', 'chifres']],
  ['Pinguim', { fur: '#1a1a24', belly: '#ffffff', tail: '#1a1a24', boots: '#ff9a3a' }, ['gravata']],
  ['Explorador', { fur: '#c89868', outfit: ['camisa', '#c8b078', '#6a5a3a'], boots: '#6a4a2a' }, ['safari']],
  ['Esquiador', { fur: '#e8e8f0', outfit: ['moletom', '#3a7ad8'], boots: '#d83a3a' }, ['gorro', 'cachecol']],
  ['Super-Herói', { fur: '#d4843a', outfit: ['regata', '#2a4ab8'], boots: '#d83a3a', pat: [['pontaRabo', '#ffcc3a']] }, ['capa', 'medalha']],
  ['Príncipe', { fur: '#e0c070', outfit: ['casaco', '#3a5ad8', '#ffcc3a'] }, ['coroinha', 'capaRoxa']],
  ['Bruxa', { fur: '#7a8a4a', outfit: ['vestido', '#2a1a3a', '#7ad860'], boots: '#1a1a24' }, ['bruxa']],
  ['Palhaço', { fur: '#f0e0b0', outfit: ['listrada', '#ff5a5a', '#ffd84a'], boots: '#4aa8ff' }, ['perucaPalhaco', 'narizPalhaco']],
  ['Caubói', { fur: '#a8703a', outfit: ['casaco', '#8a5a32', '#e8d0a0'], boots: '#3a2418' }, ['cowboy', 'bandana']],
  ['Viking', { fur: '#b84a22', outfit: ['casaco', '#6a4a2a', '#e8d0a0'], boots: '#3a2418' }, ['viking']],
  ['Surfista', { fur: '#e0a040', outfit: ['havaiana', '#2ac0c8', '#ffd84a'] }, ['oculosEscuros', 'flor']],
  ['Craque', { fur: '#c87a32', outfit: ['camiseta10', '#ffd84a', '#2a8a4a'], boots: '#ffffff' }, []],
  ['Gamer', { fur: '#5a5a66', outfit: ['moletom', '#7a3ab8'], eye: '#7af0ff' }, ['fone']],
  ['Médico', { fur: '#d8d0c8', outfit: ['jaleco', '#f4f4f8', '#7ad0c8'] }, ['espelhoMedico']],
  ['Cientista', { fur: '#a09aa8', outfit: ['jaleco', '#f4f4f8', '#3a7ad8'] }, ['oculosProtecao']],
  ['Diabinho', { fur: '#d83a3a', belly: '#ffb0a0', tail: '#a82a2a', eye: '#ffe070' }, ['chifresDiabo']],
  ['Coelhinho', { fur: '#f4f4f8', belly: '#ffd0e0', pat: [['pontaRabo', '#ffb0c8']] }, ['coelho', 'laco']],
];
EPIC.forEach(([n, o, accs]) => add('epica', n, { ...look(o), acc: A(...accs) }));

// 15 lendárias: as do universo Song of Moonlight, com roupas e estampas especiais
const LEG = [
  ['Astronauta', { suit: 'space' }],
  ['Mergulhador', { suit: 'dive' }],
  ['Dourado', { ...look({ fur: '#e8b830', belly: '#fff4c0', tail: '#d8a020', pat: ['metal', ['brilho', '#fffbe0']], eye: '#8a5a10' }), acc: A('coroinha') }],
  ['Prata Lunar', { ...look({ fur: '#c8d0e0', belly: '#ffffff', tail: '#a8b0c8', pat: ['metal', 'estrelas'], eye: '#3a5ad8' }), acc: A('estrela') }],
  ['Cristal', { ...look({ fur: '#7ad8f0', belly: '#e8fbff', tail: '#9a7ae8', pat: ['cristal'], eye: '#c08aff' }), acc: A('cristais') }],
  ['Lava', { ...look({ fur: '#3a2a2a', belly: '#5a3a2a', tail: '#2a1a1a', pat: ['rachaduras'], eye: '#ffe070' }), acc: A('chama') }],
  ['Gelo', { ...look({ fur: '#a8e0ff', belly: '#ffffff', tail: '#e8f8ff', pat: [['degrade', '#ffffff'], 'geada'], eye: '#2a6ad8' }), acc: A('coroaGelo') }],
  ['Breu', { ...look({ fur: '#2a2632', belly: '#5a5266', tail: '#2a2632', eye: '#ffe070', pat: [['pontaRabo', '#5a5266']] }), acc: A('orelhasGato', 'gravata') }],
  ['Fã do Lyon', { ...look({ fur: '#d4843a', outfit: ['camisa', '#2a6ad8', '#ff8a2a'], boots: '#6a4a2a' }), acc: A('topete') }],
  ['Hermes', { ...look({ fur: '#8a5a32', belly: '#e8d0a8', tail: '#2a1a12', boots: '#3a2418', pat: [['meias', '#f4f4f8']] }), acc: A('juba') }],
  ['Sereia de Marélia', { ...look({ fur: '#2aa8a0', belly: '#a8f0e0', tail: '#2a7ab8', pat: [['escamas', '#7af0e0']], eye: '#2a6ad8' }), acc: A('concha') }],
  ['Lacrímora', { ...look({ fur: '#7a4ab8', belly: '#d8c0ff', tail: '#4a2a8a', pat: ['runas'], eye: '#e0a8ff' }), acc: A('cristais') }],
  ['Rei Jerry', { ...look({ fur: '#d4843a', outfit: ['manto', '#c8283a', '#ffcc3a'] }), acc: A('arminho', 'coroa') }],
  ['Mago Supremo', { ...look({ fur: '#4a3a8a', belly: '#c8b8ff', tail: '#2a1a5a', outfit: ['manto', '#2a1a5a', '#ffcc3a'], pat: ['estrelas'], eye: '#7af0ff' }), acc: A('mago') }],
  ['Sombra', { ...look({ fur: '#1a1a24', belly: '#3a3a4a', tail: '#1a1a24', pat: [['brilho', '#7a5aff']], eye: '#ff3a5a' }), acc: A('mascara') }],
];
LEG.forEach(([n, o]) => add('lendaria', n, o));

// 5 míticas: estampas únicas e um efeito brilhando em volta
const MYTH = [
  ['Arco-Íris', { ...look({ fur: '#ff5a8a', belly: '#fff4c0', pat: ['arcoIris', 'brilho'] }), fx: 'rainbow' }],
  ['Galáxia', { ...look({ fur: '#2a1a5a', belly: '#8a6ae8', tail: '#1a0a3a', pat: [['degrade', '#5a2a8a'], 'estrelas'], eye: '#ffe070' }), acc: A('estrela'), fx: 'stars' }],
  ['Fantasma', { ...look({ fur: '#e8e8ff', belly: '#ffffff', tail: '#c8c8f0', pat: [['degrade', '#b8b8f0']], eye: '#5a5aa8' }), fx: 'ghost' }],
  ['Fênix', { ...look({ fur: '#ff6a2a', belly: '#ffe070', tail: '#ffb83a', pat: ['chamas', ['brilho', '#fff4a0']], eye: '#fff4a0' }), acc: A('chama'), fx: 'fire' }],
  ['Coração da Lua', { ...look({ fur: '#f4ecc8', belly: '#ffffff', tail: '#e8d898', pat: ['metal', ['brilho', '#ffffff']], eye: '#3a5ad8' }), acc: A('aureola'), fx: 'moon' }],
];
MYTH.forEach(([n, o]) => add('mitica', n, o));

// ---------------------------------------------------------------- habilidades passivas
// Toda skin tem uma. A raridade NÃO deixa a habilidade mais forte: cada habilidade aparece em todas as raridades,
// e todas foram pensadas para valer o mesmo (metade ajuda a sobreviver, metade ajuda a ganhar moedas).
// O jogador escolhe a skin pelo jeito de jogar.
export const ABILITIES = {
  ima:        { name: 'Magnético', desc: 'Pega também as moedas das casas do lado quando pousa.' },
  sorte:      { name: 'Sortudo', desc: '1 em cada 4 moedas vale o dobro.' },
  faro:       { name: 'Faro de Tesouro', desc: 'Moedas grandes (valem 5) aparecem bem mais.' },
  explorador: { name: 'Explorador', desc: 'Portais de dimensão bônus aparecem com mais frequência.' },
  caminhante: { name: 'Caminhante', desc: 'Ganha 1 moeda a cada 10 fileiras de distância.' },
  pechincha:  { name: 'Pechincheiro', desc: 'Reviver custa 40 moedas em vez de 70.' },
  casco:      { name: 'Casco Duro', desc: '1 vez por partida, aguenta uma batida sem cair.' },
  nadador:    { name: 'Nadador', desc: '1 vez por partida, se cair na água, nada até a margem.' },
  calmo:      { name: 'Sangue-Frio', desc: 'A tela sobe 12% mais devagar.' },
  equilibrio: { name: 'Pés Firmes', desc: 'Mais margem de erro para pousar e ficar nos troncos.' },
  reflexo:    { name: 'Reflexo', desc: 'Carroças, slimes e trens andam 10% mais devagar.' },
  ligeiro:    { name: 'Ligeiro', desc: 'Pula 25% mais rápido.' },
};
const ORDER = Object.keys(ABILITIES);
// algumas skins combinam com uma habilidade; as outras se revezam na ordem (cada raridade tem de todas)
const THEMED = { Pirata: 'faro', Ninja: 'ligeiro', Cavaleiro: 'casco', Samurai: 'reflexo', Marinheiro: 'nadador', Mergulhador: 'nadador', Surfista: 'equilibrio',
  Explorador: 'explorador', Astronauta: 'caminhante', Dourado: 'sorte', Gelo: 'calmo', Detetive: 'faro', Fazendeiro: 'pechincha', 'Prata Lunar': 'ima', Breu: 'reflexo' };
SKINS.forEach((s, i) => { s.ability = THEMED[s.name] || ORDER[i % ORDER.length]; });
export const abilityOf = (id) => ABILITIES[(SKINS.find((s) => s.id === id) || SKINS[0]).ability];

export const SKIN_BY_ID = Object.fromEntries(SKINS.map((s) => [s.id, s]));
export const DEFAULT_SKIN = 's000';
{ const want = { comum: 70, rara: 55, epica: 35, lendaria: 15, mitica: 5 }; for (const [r, n] of Object.entries(want)) if (SKINS.filter((s) => s.rarity === r).length !== n) console.warn('skins:', r); if (SKINS.length !== 180) console.warn('skins:', SKINS.length); }

// míticas que a conta ainda não tem (o esquilo mítico só aparece enquanto faltar alguma)
export const missingMythics = (owned) => SKINS.filter((s) => s.rarity === 'mitica' && !owned.includes(s.id));
// sorteio: escolhe a raridade pela chance e, dentro dela, qualquer uma (pode repetir); mítica nunca sai aqui
export function rollSkin(rnd = Math.random) {
  let r = rnd() * 100, rar = 'comum';
  for (const [k, v] of Object.entries(RARITIES)) { if (!v.chance) continue; if (r < v.chance) { rar = k; break; } r -= v.chance; }
  const pool = SKINS.filter((s) => s.rarity === rar);
  return pool[Math.floor(rnd() * pool.length)];
}
