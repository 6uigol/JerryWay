// As 450 skins do Jerry. Cada uma pode trocar as cores do pelo (pal), ter estampa no pelo (listras, manchas, máscara...),
// roupa no corpo (camisa, casaco, armadura, manto...), botas, olhos de outra cor, acessórios na cabeça e no pescoço (acc),
// um traje inteiro (suit) e, nas míticas, um efeito em volta dele (fx). Tudo é pintado pixel a pixel por jerry.js.
// Saem no sorteio (Sortear skin): 100 moedas por tentativa, podendo repetir.
// Raridade: comum, rara, épica, lendária e mítica. A chance é da raridade; dentro dela, todas têm a mesma chance.
// As míticas NÃO saem no sorteio: só pegando o esquilo mítico no caminho (muito raro; se passar da fileira dele, ele foge) e nunca repetem.
// Os ids (s000...s449) e a raridade de cada posição nunca mudam: quem já tem uma skin continua com ela (as novas entram sempre no fim).
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
  ['Breu', { ...look({ fur: '#2a2632', belly: '#5a5266', tail: '#2a2632', eye: '#ffe070', pat: [['pontaRabo', '#5a5266']] }), acc: A('cartola') }],   // o gato preto de cartola com fita vermelha
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

// ================================================================ 270 skins novas (s180 a s449): sempre no FIM da lista,
// para quem já tem uma skin continuar com ela. Total: 170 comuns, 135 raras, 90 épicas, 35 lendárias e 20 míticas.
Object.assign(ACC, {
  lacoAzul: (c, x, y) => { P(c, x + 1, y - 7, 3, 3, '#4a8aff'); P(c, x + 5, y - 7, 3, 3, '#4a8aff'); P(c, x + 4, y - 6, 1, 1, '#2a4aa8'); P(c, x + 1, y - 7, 1, 1, '#a8d0ff'); P(c, x + 5, y - 7, 1, 1, '#a8d0ff'); },
  boina: (c, x, y) => { P(c, x - 5, y - 6, 10, 2, '#c83a4a'); P(c, x - 4, y - 7, 8, 1, '#c83a4a'); P(c, x - 4, y - 7, 3, 1, '#ff6a7a'); P(c, x, y - 8, 1, 1, '#8a1a2a'); },
  gorroPom: (c, x, y) => { P(c, x - 4, y - 7, 9, 4, '#d83a3a'); P(c, x - 3, y - 8, 7, 1, '#d83a3a'); P(c, x - 4, y - 4, 9, 1, '#f4f4f8'); for (const i of [-3, 0, 3]) P(c, x + i, y - 6, 1, 2, '#a82a2a'); P(c, x - 1, y - 11, 3, 3, '#f4f4f8'); },
  chapeuCoco: (c, x, y) => { P(c, x - 6, y - 4, 13, 1, '#1a1a24'); P(c, x - 4, y - 8, 9, 4, '#2a2a32'); P(c, x - 3, y - 9, 7, 1, '#2a2a32'); P(c, x - 4, y - 5, 9, 1, '#5a4a3a'); P(c, x - 3, y - 8, 1, 2, '#4a4a5a'); },
  faixaCabeca: (c, x, y) => { P(c, x - 4, y - 4, 9, 2, '#f4f4f8'); P(c, x - 4, y - 4, 9, 1, '#d83a3a'); P(c, x + 5, y - 3, 2, 1, '#f4f4f8'); },
  gravataBorboleta: (c, x, y, v) => { if (!face(v)) return; P(c, x - 3, y + 3, 3, 3, '#2a4ab8'); P(c, x + 1, y + 3, 3, 3, '#2a4ab8'); P(c, x, y + 4, 1, 1, '#1a2a6a'); P(c, x - 3, y + 3, 1, 1, '#7aa0ff'); },
  colar: (c, x, y, v) => { P(c, x - 3, y + 3, 7, 1, '#ffcc3a'); if (face(v)) { P(c, x - 1, y + 4, 3, 2, '#ffcc3a'); P(c, x, y + 4, 1, 1, '#fff2a0'); } },
  oculosRedondos: (c, x, y, v) => { if (!face(v)) { P(c, x - 4, y - 1, 9, 1, '#8a6a3a'); return; } for (const ex of [-4, 1]) { P(c, ex + x, y - 2, 4, 1, '#8a6a3a'); P(c, ex + x, y + 1, 4, 1, '#8a6a3a'); P(c, ex + x, y - 1, 1, 2, '#8a6a3a'); P(c, ex + x + 3, y - 1, 1, 2, '#8a6a3a'); } P(c, x, y - 1, 1, 1, '#8a6a3a'); },
  tiaraCoracao: (c, x, y) => { P(c, x - 4, y - 5, 9, 1, '#ff5a8a'); P(c, x - 1, y - 7, 1, 1, '#ff3a6a'); P(c, x + 1, y - 7, 1, 1, '#ff3a6a'); P(c, x - 1, y - 6, 3, 1, '#ff3a6a'); P(c, x, y - 5, 1, 1, '#ff3a6a'); },
  folha: (c, x, y) => { P(c, x, y - 9, 1, 3, '#5a3a22'); P(c, x + 1, y - 10, 3, 2, '#5ad070'); P(c, x + 2, y - 11, 2, 1, '#5ad070'); P(c, x + 1, y - 10, 1, 1, '#a8f0a0'); },
  bandanaAzul: (c, x, y) => { P(c, x - 4, y - 4, 9, 2, '#2a6ad8'); P(c, x - 4, y - 4, 9, 1, '#5a9aff'); for (const i of [-3, 0, 3]) P(c, x + i, y - 3, 1, 1, '#ffffff'); P(c, x + 5, y - 3, 2, 1, '#2a6ad8'); P(c, x + 6, y - 2, 1, 2, '#2a6ad8'); },
  chapeuFesta: (c, x, y) => { P(c, x - 3, y - 6, 7, 2, '#ff5a8a'); P(c, x - 2, y - 8, 5, 2, '#ffd84a'); P(c, x - 1, y - 10, 3, 2, '#4aa8ff'); P(c, x, y - 12, 1, 2, '#ff5a8a'); P(c, x, y - 13, 1, 1, '#ffffff'); },
  coroaLouros: (c, x, y) => { P(c, x - 5, y - 5, 11, 1, '#4a9a4a'); for (const i of [-5, -3, -1, 1, 3, 5]) P(c, x + i, y - 6 - (Math.abs(i) < 2 ? 1 : 0), 1, 1, '#7ad860'); },
  orelhasUrso: (c, x, y) => { P(c, x - 5, y - 8, 3, 3, '#5a3a22'); P(c, x + 3, y - 8, 3, 3, '#5a3a22'); P(c, x - 4, y - 7, 1, 1, '#c8906a'); P(c, x + 4, y - 7, 1, 1, '#c8906a'); },
  oculos3D: (c, x, y, v) => { if (!face(v)) { P(c, x - 4, y - 1, 9, 1, '#f4f4f8'); return; } P(c, x - 5, y - 2, 11, 3, '#f4f4f8'); P(c, x - 4, y - 1, 4, 1, '#ff3a3a'); P(c, x + 1, y - 1, 4, 1, '#3aa8ff'); },
  cogumelo: (c, x, y) => { P(c, x - 5, y - 8, 11, 3, '#d83a3a'); P(c, x - 3, y - 9, 7, 1, '#d83a3a'); for (const [i, j] of [[-4, -7], [-1, -8], [2, -7], [4, -6]]) P(c, x + i, y + j, 1, 1, '#ffffff'); P(c, x - 1, y - 5, 3, 1, '#f4e8d0'); },
  viseira: (c, x, y, v, s) => { P(c, x - 4, y - 5, 9, 1, '#f4f4f8'); P(c, s > 0 ? x + 2 : x - 7, y - 4, 6, 1, '#2a8a4a'); if (v === 'front') P(c, x - 4, y - 4, 9, 1, '#2a8a4a'); },
  oculosCoracao: (c, x, y, v) => { if (!face(v)) { P(c, x - 4, y - 1, 9, 1, '#ff3a6a'); return; } for (const ex of [-4, 1]) { P(c, x + ex, y - 2, 1, 1, '#ff3a6a'); P(c, x + ex + 2, y - 2, 1, 1, '#ff3a6a'); P(c, x + ex, y - 1, 3, 1, '#ff3a6a'); P(c, x + ex + 1, y, 1, 1, '#ff3a6a'); } P(c, x, y - 1, 1, 1, '#ff3a6a'); },
  pluma: (c, x, y) => { P(c, x + 2, y - 11, 1, 6, '#ff5a5a'); P(c, x + 3, y - 12, 1, 5, '#ffd84a'); P(c, x + 4, y - 11, 1, 4, '#4aa8ff'); P(c, x + 1, y - 6, 4, 1, '#ffcc3a'); },
  orelhasRaposa: (c, x, y) => { P(c, x - 5, y - 9, 3, 4, '#e0702a'); P(c, x + 3, y - 9, 3, 4, '#e0702a'); P(c, x - 4, y - 8, 1, 2, '#f4f4f8'); P(c, x + 4, y - 8, 1, 2, '#f4f4f8'); P(c, x - 5, y - 9, 1, 1, '#1a1a24'); P(c, x + 5, y - 9, 1, 1, '#1a1a24'); },
  orelhasLobo: (c, x, y) => { P(c, x - 5, y - 9, 3, 4, '#5a5a66'); P(c, x + 3, y - 9, 3, 4, '#5a5a66'); P(c, x - 4, y - 8, 1, 2, '#c8c8d8'); P(c, x + 4, y - 8, 1, 2, '#c8c8d8'); },
  orelhasCoruja: (c, x, y) => { P(c, x - 5, y - 8, 2, 3, '#6a4a2a'); P(c, x + 4, y - 8, 2, 3, '#6a4a2a'); P(c, x - 6, y - 9, 1, 1, '#6a4a2a'); P(c, x + 6, y - 9, 1, 1, '#6a4a2a'); },
  quepe: (c, x, y, v, s) => { P(c, x - 5, y - 7, 11, 3, '#2a3a8a'); P(c, x - 4, y - 8, 9, 1, '#2a3a8a'); P(c, x - 5, y - 5, 11, 1, '#1a1a24'); P(c, x, y - 7, 1, 1, '#ffcc3a'); if (v === 'front') P(c, x - 4, y - 4, 9, 1, '#1a1a24'); else if (v !== 'back') P(c, s > 0 ? x + 3 : x - 7, y - 4, 5, 1, '#1a1a24'); },
  boneAmarelo: (c, x, y, v, s) => { P(c, x - 4, y - 6, 9, 3, '#ffd84a'); P(c, x - 3, y - 7, 7, 1, '#ffd84a'); P(c, x - 3, y - 6, 2, 1, '#fff2a0'); P(c, x, y - 6, 1, 2, '#2a4aa8'); if (v === 'front') P(c, x - 4, y - 3, 9, 1, '#c8a020'); else if (v !== 'back') P(c, s > 0 ? x + 3 : x - 7, y - 4, 5, 1, '#c8a020'); },
  chapeuSol: (c, x, y) => { P(c, x - 7, y - 4, 15, 1, '#f0d890'); P(c, x - 4, y - 7, 9, 3, '#f0d890'); P(c, x - 4, y - 5, 9, 1, '#5ad070'); P(c, x + 3, y - 6, 2, 2, '#ff8ad0'); },
  chapeuPescador: (c, x, y) => { P(c, x - 6, y - 4, 13, 1, '#6a7a4a'); P(c, x - 4, y - 7, 9, 3, '#7a8a5a'); P(c, x - 3, y - 8, 7, 1, '#7a8a5a'); P(c, x + 2, y - 6, 2, 1, '#ffcc3a'); P(c, x + 3, y - 5, 1, 1, '#d83a3a'); },
  capaceteMinerio: (c, x, y) => { P(c, x - 5, y - 7, 11, 4, '#ffd84a'); P(c, x - 4, y - 8, 9, 1, '#ffd84a'); P(c, x - 5, y - 4, 11, 1, '#c8a020'); P(c, x - 1, y - 8, 3, 3, '#f4f4f8'); P(c, x, y - 7, 1, 1, '#fff4a0'); },
  aviador: (c, x, y, v) => { P(c, x - 5, y - 7, 11, 4, '#8a5a32'); P(c, x - 4, y - 8, 9, 1, '#8a5a32'); P(c, x - 6, y - 4, 2, 4, '#8a5a32'); P(c, x + 5, y - 4, 2, 4, '#8a5a32'); P(c, x - 4, y - 5, 4, 2, '#3a3a4a'); P(c, x + 1, y - 5, 4, 2, '#3a3a4a'); P(c, x - 3, y - 5, 1, 1, '#a8e0ff'); P(c, x + 2, y - 5, 1, 1, '#a8e0ff'); },
  gorroNoel: (c, x, y, v, s) => { P(c, x - 4, y - 7, 9, 3, '#d83a3a'); P(c, x - 3, y - 9, 6, 2, '#d83a3a'); P(c, s < 0 ? x - 5 : x + 2, y - 10, 4, 2, '#d83a3a'); P(c, s < 0 ? x - 7 : x + 5, y - 10, 2, 2, '#f4f4f8'); P(c, x - 5, y - 4, 11, 2, '#f4f4f8'); },
  barba: (c, x, y, v) => { if (!face(v)) return; P(c, x - 4, y + 1, 9, 3, '#f4f4f8'); P(c, x - 3, y + 4, 7, 1, '#f4f4f8'); P(c, x - 1, y + 5, 3, 1, '#f4f4f8'); P(c, x - 1, y + 1, 3, 1, '#d83a3a'); },
  asas: (c, x, y, v, s) => { const col = '#e8fbff', hi = '#ffffff', ed = '#9ad0e8'; if (v === 'front' || v === 'back') { for (const d of [-1, 1]) { const bx = d < 0 ? x - 11 : x + 6; P(c, bx, y + 2, 6, 5, col); P(c, bx + (d < 0 ? 1 : 0), y + 7, 5, 2, col); P(c, bx + (d < 0 ? 0 : 5), y + 2, 1, 7, ed); P(c, bx + 2, y + 3, 2, 1, hi); } return; } const bx = s > 0 ? x - 10 : x + 4; P(c, bx, y + 1, 7, 5, col); P(c, bx + 1, y + 6, 5, 2, col); P(c, bx + 2, y + 2, 3, 1, hi); P(c, bx, y + 1, 7, 1, ed); },
  espinhos: (c, x, y) => { for (const [i, h] of [[-3, 2], [-1, 3], [1, 3], [3, 2]]) { P(c, x + i, y - 4 - h, 1, h, '#ffd84a'); P(c, x + i, y - 4 - h, 1, 1, '#fff2a0'); } },
  barbatana: (c, x, y) => { P(c, x - 1, y - 6, 3, 2, '#5a6a80'); P(c, x, y - 9, 2, 3, '#5a6a80'); P(c, x + 1, y - 11, 1, 2, '#5a6a80'); P(c, x, y - 9, 1, 2, '#8a9ab0'); },
  antenaRobo: (c, x, y) => { P(c, x, y - 10, 1, 5, '#9aa0b0'); P(c, x - 1, y - 12, 3, 2, '#ff3a3a'); P(c, x - 1, y - 12, 1, 1, '#ffb0b0'); P(c, x - 5, y - 5, 2, 2, '#6a7080'); P(c, x + 4, y - 5, 2, 2, '#6a7080'); },
  toucaNatacao: (c, x, y) => { P(c, x - 5, y - 7, 11, 4, '#ff5a8a'); P(c, x - 4, y - 8, 9, 1, '#ff5a8a'); P(c, x - 3, y - 7, 2, 1, '#ffb0c8'); },
  oculosNatacao: (c, x, y, v) => { P(c, x - 5, y - 2, 11, 1, '#2a2a32'); if (!face(v)) return; P(c, x - 4, y - 2, 4, 2, '#2ac0c8'); P(c, x + 1, y - 2, 4, 2, '#2ac0c8'); P(c, x - 3, y - 2, 1, 1, '#ffffff'); P(c, x + 2, y - 2, 1, 1, '#ffffff'); },
  capaceteBike: (c, x, y) => { P(c, x - 5, y - 7, 11, 3, '#2ac0c8'); P(c, x - 4, y - 8, 9, 1, '#2ac0c8'); for (const i of [-3, 0, 3]) P(c, x + i, y - 8, 1, 3, '#1a1a24'); P(c, x - 5, y - 4, 11, 1, '#1a7a88'); },
  perucaJuiz: (c, x, y) => { P(c, x - 5, y - 7, 11, 3, '#f4f4f8'); for (const ex of [-6, 5]) for (let k = 0; k < 3; k++) P(c, x + ex, y - 4 + k * 2, 2, 2, k % 2 ? '#d8d8e8' : '#f4f4f8'); },
  chapeuMaquinista: (c, x, y) => { P(c, x - 5, y - 4, 11, 1, '#2a3a6a'); P(c, x - 4, y - 8, 9, 4, '#3a4a8a'); for (let i = -4; i <= 4; i += 2) P(c, x + i, y - 8, 1, 4, '#f4f4f8'); },
  gorroElfo: (c, x, y, v, s) => { P(c, x - 4, y - 6, 9, 2, '#2a8a4a'); P(c, x - 3, y - 8, 6, 2, '#2a8a4a'); P(c, s < 0 ? x - 6 : x + 1, y - 10, 5, 2, '#2a8a4a'); P(c, s < 0 ? x - 7 : x + 5, y - 11, 2, 2, '#ffcc3a'); P(c, x - 4, y - 5, 9, 1, '#d83a3a'); },
  capuz: (c, x, y, v) => { P(c, x - 6, y - 7, 13, 2, '#3a3a4a'); P(c, x - 7, y - 5, 2, 7, '#3a3a4a'); P(c, x + 6, y - 5, 2, 7, '#3a3a4a'); P(c, x - 5, y - 8, 11, 1, '#4a4a5a'); },
  capuzPolar: (c, x, y) => { P(c, x - 6, y - 7, 13, 2, '#f4f4f8'); P(c, x - 7, y - 5, 2, 7, '#f4f4f8'); P(c, x + 6, y - 5, 2, 7, '#f4f4f8'); for (const i of [-5, -1, 3]) P(c, x + i, y - 7, 1, 1, '#d8d8e8'); },
  cabeloRosa: (c, x, y) => { P(c, x - 5, y - 6, 11, 3, '#ff7ab0'); P(c, x - 6, y - 4, 2, 7, '#ff7ab0'); P(c, x + 5, y - 4, 2, 7, '#ff7ab0'); P(c, x - 3, y - 6, 3, 1, '#ffb0d0'); },
  cabeloBranco: (c, x, y) => { P(c, x - 5, y - 6, 11, 3, '#e8e8f0'); P(c, x - 2, y - 9, 5, 3, '#e8e8f0'); P(c, x - 1, y - 9, 2, 1, '#ffffff'); },
  lanterna: (c, x, y, v, s) => { const lx = s < 0 ? x - 6 : x + 3; P(c, x, y - 8, 1, 3, '#3a3a4a'); P(c, x, y - 9, lx - x + 1, 1, '#3a3a4a'); P(c, lx, y - 9, 3, 3, '#ffe070'); P(c, lx + 1, y - 8, 1, 1, '#ffffff'); },
  chifreUnicornio: (c, x, y) => { for (let k = 0; k < 5; k++) P(c, x, y - 6 - k, 1, 1, k % 2 ? '#ffd84a' : '#fff4c0'); P(c, x - 1, y - 6, 3, 1, '#fff4c0'); },
  raio: (c, x, y) => { P(c, x + 2, y - 12, 2, 2, '#ffe070'); P(c, x + 1, y - 10, 2, 2, '#ffe070'); P(c, x + 2, y - 9, 2, 2, '#fff4a0'); P(c, x + 1, y - 7, 2, 2, '#ffe070'); },
  sol: (c, x, y) => { P(c, x - 2, y - 12, 5, 3, '#ffcc3a'); P(c, x - 1, y - 12, 3, 1, '#fff4a0'); for (const [i, j] of [[-4, -11], [4, -11], [0, -14], [-3, -13], [3, -13]]) P(c, x + i, y + j, 1, 1, '#ff9a3a'); },
  pluma2: (c, x, y) => { P(c, x - 3, y - 11, 1, 6, '#f4f4f8'); P(c, x - 2, y - 12, 1, 5, '#d8d8e8'); P(c, x - 4, y - 6, 3, 1, '#9aa0b0'); },
  nimbo: (c, x, y) => { P(c, x - 5, y - 11, 11, 2, '#e8f0ff'); P(c, x - 3, y - 12, 7, 1, '#ffffff'); P(c, x - 4, y - 9, 9, 1, '#c8d8f0'); },
  coroaPrata: (c, x, y) => { P(c, x - 4, y - 7, 9, 3, '#c8d0e0'); P(c, x - 4, y - 9, 1, 2, '#c8d0e0'); P(c, x, y - 10, 1, 3, '#c8d0e0'); P(c, x + 4, y - 9, 1, 2, '#c8d0e0'); P(c, x - 4, y - 7, 9, 1, '#ffffff'); P(c, x, y - 6, 1, 1, '#7af0ff'); },
  veu: (c, x, y) => { P(c, x - 6, y - 5, 13, 1, '#f0e0b0'); P(c, x - 4, y - 8, 9, 3, '#f0e0b0'); for (let k = 0; k < 4; k++) P(c, x - 6 + k * 4, y - 4, 1, 6, 'rgba(40,40,40,0.55)'); },
});
// estampas novas
Object.assign(PATTERNS, {
  bandagens: (k, c, x, y) => (FUR.has(k) || BELLY.has(k) || TAIL.has(k)) && ((y + (x >> 2)) % 3 === 0 ? '#c8bfa0' : null),
  xadrez: (k, c, x, y, tail, head, p) => !head && (FUR.has(k) || BELLY.has(k)) && (((x >> 1) + (y >> 1)) % 2 === 0) && tone(k.startsWith('belly') ? 'fur' : k, p),
  aurora: (k, c, x, y) => (FUR.has(k) || TAIL.has(k)) && tone(k, mix('#3ae8a0', '#a85ae8', Math.max(0, Math.min(1, (x + y - 10) / 30)))),
  raios: (k, c, x, y) => (FUR.has(k) || TAIL.has(k)) && (x * 2 + y) % 9 === 0 && '#fff27a',
  floco: (k, c, x, y) => (FUR.has(k) || TAIL.has(k)) && hsh(x, y, 17) < 0.12 && ((x + y) % 2 ? '#ffffff' : '#bfe8ff'),
  sakura: (k, c, x, y) => (FUR.has(k) || TAIL.has(k)) && hsh(x >> 1, y >> 1, 19) < 0.18 && '#ffd0e0',
});

const COMMON_FUR2 = [
  ['Mostarda', '#c8a030'], ['Ardósia', '#5a6070'], ['Ferro', '#6a6a72'], ['Linho', '#e0d4b8'], ['Mogno', '#7a3a2a'], ['Canela Clara', '#c8804a'],
  ['Biscoito', '#d8a868'], ['Tabaco', '#8a5a2a'], ['Prata Velha', '#a8a8b0'], ['Marfim', '#f0e8d8'], ['Cacau', '#5a3a2a'], ['Damasco', '#f0a860'],
  ['Telha', '#b85a3a'], ['Sépia', '#7a5a3a'], ['Avelã Escura', '#9a5a2a'], ['Mel Escuro', '#c08030'], ['Nuvem', '#d0d0d8'], ['Oliva', '#8a8a4a'],
  ['Castor', '#7a5a42'], ['Areia Rosa', '#e0b8a0'], ['Ébano', '#2a2228'], ['Cevada', '#d0b070'], ['Cinza Azulado', '#8a96a8'], ['Melado', '#a86a2a'], ['Cobre Velho', '#9a5a32'],
];
const MARKS2 = [['pontaRabo', 'Ponta Clara', 1], ['meias', 'de Meias', 1], ['sardas', 'Sardento', 0], ['mascara', 'Mascarado', 0], ['raboListrado', 'de Rabo Listrado', 0], ['barriga', 'de Peito Branco', 1], ['manchas', 'Malhado', 1], ['pintas', 'Pintado', 0], ['bicolor', 'Bicolor', 1], ['listras', 'Tigrado', 0]];
COMMON_FUR2.forEach(([n, c], i) => [0, 5].forEach((o) => { const [pt, pn, lt] = MARKS2[(i + o) % MARKS2.length]; add('comum', `${n} ${pn}`, look({ fur: c, pat: [[pt, lt ? light(c, 0.75) : dark(c, 0.55)]] })); }));
const SIMPLE2 = [['lacoAzul', 'Laço Azul'], ['boina', 'Boina'], ['gorroPom', 'Gorro de Pompom'], ['chapeuCoco', 'Chapéu-Coco'], ['faixaCabeca', 'Faixa'], ['gravataBorboleta', 'Gravata-Borboleta'], ['colar', 'Colar'], ['oculosRedondos', 'Óculos Redondos'], ['tiaraCoracao', 'Tiara de Coração'], ['folha', 'Folhinha'], ['bandanaAzul', 'Bandana Azul']];
COMMON_FUR2.forEach(([n, c], i) => [0, 6].forEach((o) => { const [a, an] = SIMPLE2[(i + o) % SIMPLE2.length]; add('comum', `${n} com ${an}`, { ...look({ fur: c, pat: (i + o) % 3 === 0 ? [['pontaRabo', light(c, 0.75)]] : [] }), acc: A(a) }); }));

// raras novas: estampas com acessórios novos (nomes nunca repetem) e 16 cores vivas "Cintilantes"
const RARE_ACC2 = [['chapeuFesta', 'Chapéu de Festa'], ['coroaLouros', 'Coroa de Louros'], ['orelhasUrso', 'Orelhas de Urso'], ['oculos3D', 'Óculos 3D'], ['cogumelo', 'Chapéu de Cogumelo'], ['viseira', 'Viseira'], ['oculosCoracao', 'Óculos de Coração'], ['pluma', 'Pluma'], ['orelhasRaposa', 'Orelhas de Raposa'], ['chapeuSol', 'Chapéu de Sol'], ['coroaPrata', 'Coroa de Prata']];
const RARE_PAT2 = [...RARE_PAT, ['escamas', 'Escamado', (c) => light(c, 0.5)], ['xadrez', 'Xadrez', (c) => dark(c, 0.45)]];
{ const names = new Set(SKINS.map((k) => k.name)), furs = [...COMMON_FUR2, ...COMMON_FUR]; let i = 0, made = 0;
  while (made < 64) { const [n, c] = furs[(i * 7 + 2) % furs.length], [pt, pn, pcol] = RARE_PAT2[i % RARE_PAT2.length], [a, an] = RARE_ACC2[(i * 3) % RARE_ACC2.length], name = `${n} ${pn} com ${an}`; i++;
    if (names.has(name)) continue; names.add(name); made++;
    add('rara', name, { ...look({ fur: c, pat: [[pt, pcol(c)]], boots: made % 4 === 1 ? dark(c, 0.5) : null }), acc: A(a) }); } }
const VIVID_FUR2 = [['Rubi', '#c8283a'], ['Safira', '#2a4ad8'], ['Esmeralda', '#2aa860'], ['Topázio', '#f0b83a'], ['Jade', '#3ac090'], ['Magenta', '#d83aa8'], ['Índigo', '#4a3ab8'], ['Pistache', '#a8d060'],
  ['Salmão', '#ff8a6a'], ['Anil', '#3a6ae8'], ['Tangerina', '#ff8a2a'], ['Malva', '#c08ad8'], ['Ciano', '#3ad8e8'], ['Framboesa', '#e83a6a'], ['Hortelã', '#7ae0b0'], ['Pervinca', '#8a8af0']];
VIVID_FUR2.forEach(([n, c], i) => add('rara', `${n} Cintilante`, { ...look({ fur: c, belly: light(c, 0.8), pat: [['degrade', mix(c, '#ffffff', 0.4)], 'estrelas'] }), acc: i % 2 ? A('tiara') : [] }));

// 55 épicas novas: profissões, esportes, festas e bichos
const EPIC2 = [
  ['Policial', { fur: '#8a5a32', outfit: ['camisa', '#2a3a8a', '#ffcc3a'], boots: '#1a1a24' }, ['quepe', 'medalha']],
  ['Carteiro', { fur: '#d8b060', outfit: ['camisa', '#ffd84a', '#2a4aa8'], boots: '#2a4aa8' }, ['boneAmarelo']],
  ['Jardineiro', { fur: '#c87a32', outfit: ['macacao', '#3a8a4a'], boots: '#6a4a2a' }, ['chapeuSol']],
  ['Pescador', { fur: '#a8703a', outfit: ['casaco', '#6a8a5a', '#e8d0a0'], boots: '#3a5a3a' }, ['chapeuPescador']],
  ['Mecânico', { fur: '#d4843a', outfit: ['macacao', '#3a5ab8'], pat: [['sardas', '#3a3a4a']], boots: '#1a1a24' }, ['bone']],
  ['Pintor', { fur: '#e8d0a0', outfit: ['camisa', '#f4f4f8', '#ff5a8a'], pat: [['pintas', '#4aa8ff']] }, ['boina']],
  ['Rapper', { fur: '#5a3a2a', outfit: ['moletom', '#1a1a24'], boots: '#f4f4f8' }, ['oculosEscuros', 'colar']],
  ['DJ', { fur: '#3a3440', outfit: ['jaqueta', '#7a3ab8'], eye: '#7af0ff' }, ['fone', 'oculos3D']],
  ['Bailarina', { fur: '#f0e0b0', outfit: ['vestido', '#ffb0d0', '#ffffff'], boots: '#ffb0d0' }, ['tiara', 'laco']],
  ['Professor', { fur: '#a09aa8', outfit: ['terno', '#6a4a3a', '#d83a3a'] }, ['oculosRedondos', 'gravataBorboleta']],
  ['Juiz', { fur: '#8a8a96', outfit: ['manto', '#1a1a24', '#f4f4f8'] }, ['perucaJuiz']],
  ['Confeiteiro', { fur: '#f0a070', outfit: ['jaleco', '#ffd0e0', '#ff7ab0'] }, ['chef', 'laco']],
  ['Ferreira', { fur: '#a8422a', outfit: ['casaco', '#5a3a2a', '#c8ccd8'], boots: '#2a2a32', pat: [['sardas', '#3a2a22']] }, ['bandana']],
  ['Lenhador', { fur: '#7a4a2a', outfit: ['listrada', '#c83a3a', '#1a1a24'], boots: '#3a2418' }, ['gorroPom', 'barba']],
  ['Escoteiro', { fur: '#c89868', outfit: ['camisa', '#a8885a', '#3a8a4a'], boots: '#6a4a2a' }, ['safari', 'medalha']],
  ['Apicultor', { fur: '#e0a040', outfit: ['macacao', '#f4f4f8'], boots: '#f4f4f8' }, ['veu']],
  ['Mineiro', { fur: '#8a5a32', outfit: ['macacao', '#6a5a3a'], pat: [['sardas', '#2a2a32']], boots: '#2a2a32' }, ['capaceteMinerio']],
  ['Aviador', { fur: '#c87a32', outfit: ['jaqueta', '#8a5a32'], boots: '#3a2418' }, ['aviador', 'cachecol']],
  ['Rainha', { fur: '#e8d0a0', outfit: ['vestido', '#8a2ab8', '#ffcc3a'] }, ['arminho', 'coroa']],
  ['Fada', { fur: '#c8e8a0', outfit: ['vestido', '#5ad070', '#ffffff'], pat: [['brilho', '#ffffff']] }, ['asas', 'tiara']],
  ['Elfo', { fur: '#e0a040', outfit: ['casaco', '#2a8a4a', '#ffcc3a'], boots: '#d83a3a' }, ['gorroElfo']],
  ['Papai Noel', { fur: '#d4843a', outfit: ['casaco', '#d83a3a', '#f4f4f8'], boots: '#1a1a24' }, ['gorroNoel', 'barba']],
  ['Boneco de Neve', { fur: '#f4f4f8', belly: '#ffffff', tail: '#e8e8f0', eye: '#1a1a24' }, ['chapeuCoco', 'cachecol']],
  ['Abóbora', { fur: '#e0702a', belly: '#ffb05a', pat: [['listras', '#a84a1a']], eye: '#ffe070' }, ['folha']],
  ['Múmia', { fur: '#e8e0c8', belly: '#f4f0e0', tail: '#d8d0b8', pat: ['bandagens'], eye: '#7aff9a' }, []],
  ['Zumbi', { fur: '#7aa860', belly: '#a8c890', outfit: ['camisa', '#6a7a8a', '#3a4a5a'], eye: '#ff3a3a' }, []],
  ['Frankenstein', { fur: '#6aa870', outfit: ['terno', '#2a2a32', '#1a1a24'], boots: '#1a1a24' }, ['capuz']],
  ['Lobisomem', { fur: '#5a4a3a', belly: '#8a7a6a', tail: '#3a2a22', eye: '#ffe070' }, ['orelhasLobo', 'juba']],
  ['Dragãozinho', { fur: '#3aa860', belly: '#c8f0a0', pat: [['escamas', '#8ae070']], eye: '#ffe070' }, ['chifres', 'espinhos']],
  ['Dinossauro', { fur: '#5ac0a0', belly: '#e0f8e8', pat: [['escamas', '#2a8a7a']] }, ['espinhos']],
  ['Coruja', { fur: '#8a6a4a', belly: '#e8d0a8', pat: [['pintas', '#5a3a22']], eye: '#ffcc3a' }, ['orelhasCoruja', 'oculosRedondos']],
  ['Raposa', { fur: '#e0702a', belly: '#ffffff', pat: [['pontaRabo', '#ffffff'], ['meias', '#3a2a22']] }, ['orelhasRaposa']],
  ['Lobo', { fur: '#7a7a86', belly: '#d8d8e0', pat: [['mascara', '#4a4a56']], eye: '#7af0ff' }, ['orelhasLobo']],
  ['Leão', { fur: '#e0a040', belly: '#f8e0a0', pat: [['pontaRabo', '#5a3a22']] }, ['juba', 'coroinha']],
  ['Urso', { fur: '#7a4a2a', belly: '#c8906a', tail: '#6a3a22' }, ['orelhasUrso', 'cachecol']],
  ['Sapo Príncipe', { fur: '#5ab040', belly: '#e8f0a0', eye: '#ffe070' }, ['coroinha']],
  ['Tartaruga', { fur: '#6a9a5a', outfit: ['armadura', '#3a6a3a', '#8ac070'] }, ['oculosRedondos']],
  ['Tubarão', { fur: '#7a8aa0', belly: '#f4f4f8', tail: '#5a6a80' }, ['barbatana']],
  ['Arara', { fur: '#d83a3a', tail: '#ffd84a', pat: [['degrade', '#3a7ad8']] }, ['pluma']],
  ['Flamingo', { fur: '#ff8ab0', belly: '#ffd0e0', boots: '#d85a8a' }, ['pluma', 'oculosEscuros']],
  ['Pavão', { fur: '#2a6ad8', tail: '#2aa860', pat: [['escamas', '#7af0ff']] }, ['pluma']],
  ['Robô', { fur: '#9aa0b0', belly: '#c8ccd8', pat: ['metal'], eye: '#7af0ff' }, ['antenaRobo']],
  ['Alienígena', { fur: '#7ad860', belly: '#c8f0a0', eye: '#1a1a24' }, ['antenas']],
  ['Boxeador', { fur: '#a8703a', outfit: ['regata', '#d83a3a'], boots: '#d83a3a' }, ['faixaCabeca']],
  ['Tenista', { fur: '#e0c070', outfit: ['regata', '#f4f4f8'], boots: '#f4f4f8' }, ['viseira']],
  ['Ciclista', { fur: '#c06a3a', outfit: ['camisa', '#ffd84a', '#1a1a24'], boots: '#1a1a24' }, ['capaceteBike', 'oculosEscuros']],
  ['Skatista', { fur: '#8a8a96', outfit: ['moletom', '#2ac0c8'], boots: '#f4f4f8' }, ['bone']],
  ['Nadador', { fur: '#d4843a', outfit: ['regata', '#2a4ab8'] }, ['toucaNatacao', 'oculosNatacao']],
  ['Goleiro', { fur: '#c87a32', outfit: ['camiseta10', '#2a8a4a', '#ffffff'], boots: '#f4f4f8' }, ['faixaCabeca']],
  ['Maquinista', { fur: '#8a5a32', outfit: ['macacao', '#3a4a8a'], boots: '#1a1a24' }, ['chapeuMaquinista', 'bandana']],
  ['Mágico', { fur: '#5a5a66', outfit: ['terno', '#1a1a24', '#d83a3a'] }, ['cartola', 'gravataBorboleta']],
  ['Explorador Polar', { fur: '#d4843a', outfit: ['casaco', '#d83a3a', '#f4f4f8'], boots: '#1a1a24' }, ['capuzPolar']],
  ['Astrônomo', { fur: '#4a3a8a', outfit: ['manto', '#1a2a5a', '#ffcc3a'], pat: ['estrelas'] }, ['oculosRedondos']],
  ['Hacker', { fur: '#3a3440', outfit: ['moletom', '#1a1a24'], eye: '#7aff7a' }, ['capuz', 'oculos']],
  ['Carnavalesco', { fur: '#ffcc3a', outfit: ['listrada', '#ff5a8a', '#4aa8ff'] }, ['pluma', 'oculosCoracao']],
];
EPIC2.forEach(([n, o, accs]) => add('epica', n, { ...look(o), acc: A(...accs) }));

// 20 lendárias novas: o povo e os lugares do universo Song of Moonlight
const LEG2 = [
  ['Aldo, o Sábio', { ...look({ fur: '#c8c0b0', belly: '#f4f4f8', outfit: ['manto', '#4a2a8a', '#ffcc3a'], eye: '#3a5ad8' }), acc: A('mago', 'barba') }],
  ['Selene Rúnica', { ...look({ fur: '#d8c8b0', outfit: ['manto', '#2a4aa8', '#ffcc3a'], pat: ['runas'] }), acc: A('mago') }],
  ['Richard das Vozes', { ...look({ fur: '#a09aa8', outfit: ['casaco', '#3a2a5a', '#c8b8ff'], eye: '#c8b8ff' }), acc: A('cabeloBranco', 'oculosRedondos') }],
  ['Cavaleiro Sombrio', { ...look({ fur: '#3a3440', outfit: ['armadura', '#2a2632', '#8a2a3a'], boots: '#1a1a24', eye: '#ff3a5a' }), acc: A('cavaleiro', 'capaVampiro') }],
  ['Marcos das Marés', { ...look({ fur: '#4a90d8', belly: '#c8e8ff', tail: '#2a6ab8', pat: [['escamas', '#a8e0ff']], eye: '#ffe070' }), acc: A('concha') }],
  ['Ray Veloz', { ...look({ fur: '#5ab0ff', belly: '#e8f8ff', tail: '#2a7ad8', pat: [['degrade', '#ffffff'], ['brilho', '#ffffff']] }), acc: A('nimbo') }],
  ['Coralina', { ...look({ fur: '#ff8ab0', belly: '#ffe0ec', tail: '#2ac0a8', pat: [['escamas', '#ffd0e0']] }), acc: A('cabeloRosa', 'concha') }],
  ['Doran das Minas', { ...look({ fur: '#a88ae8', belly: '#e8d8ff', outfit: ['macacao', '#5a3a8a'] }), acc: A('cogumelo', 'capaceteMinerio') }],
  ['Mara Jardineira', { ...look({ fur: '#7ad8c8', belly: '#e8fff8', outfit: ['vestido', '#7a5ac8', '#c8f0a0'], pat: ['sakura'] }), acc: A('antenas') }],
  ['Gus Rabugento', { ...look({ fur: '#8a6a4a', belly: '#e8d0a8', pat: [['pintas', '#5a3a22']], eye: '#ffcc3a' }), acc: A('orelhasCoruja', 'monoculo') }],
  ['Pipo Lanterna', { ...look({ fur: '#ff9a3a', belly: '#ffe0a0', tail: '#ffcc3a', pat: [['escamas', '#ffd06a']] }), acc: A('lanterna') }],
  ['Maquinista do Trem Infinito', { ...look({ fur: '#5a5a66', outfit: ['casaco', '#2a3a6a', '#ffcc3a'], boots: '#1a1a24' }), acc: A('chapeuMaquinista', 'medalha') }],
  ['Aurora', { ...look({ fur: '#3ae8a0', belly: '#e0fff0', tail: '#a85ae8', pat: ['aurora', ['brilho', '#ffffff']] }), acc: A('tiara') }],
  ['Tempestade', { ...look({ fur: '#5a6070', belly: '#a8b0c0', tail: '#3a4050', pat: ['raios'], eye: '#fff27a' }), acc: A('raio') }],
  ['Sol Nascente', { ...look({ fur: '#ffb83a', belly: '#fff4c0', tail: '#ff7a2a', pat: [['degrade', '#ff5a3a']], eye: '#d83a1a' }), acc: A('sol') }],
  ['Eclipse', { ...look({ fur: '#1a1a24', belly: '#f4ecc8', tail: '#2a2a32', pat: [['bicolor', '#f4ecc8']], eye: '#ffcc3a' }), acc: A('aureola') }],
  ['Guardião dos Sinos', { ...look({ fur: '#c8a040', outfit: ['armadura', '#e8b830', '#3a5ad8'], boots: '#8a6a1c' }), acc: A('sino', 'coroaLouros') }],
  ['Lyon, o Herói', { ...look({ fur: '#d4843a', outfit: ['casaco', '#2a6ad8', '#ff8a2a'], boots: '#6a4a2a' }), acc: A('topete', 'capa') }],
  ['Monice Rockstar', { ...look({ fur: '#2a2632', outfit: ['jaqueta', '#1a1a24'], boots: '#d83a3a', pat: [['pontaRabo', '#d83a3a']] }), acc: A('moicano', 'colar') }],
  ['Nico do Farol', { ...look({ fur: '#a8703a', outfit: ['marinheiro', '#ffffff', '#2a4aa8'], pat: [['sardas', '#5a3a22']] }), acc: A('bone', 'lanterna') }],
];
LEG2.forEach(([n, o]) => add('lendaria', n, o));

// 15 míticas novas: cada uma com um efeito próprio em volta dela
const MYTH2 = [
  ['Dragão Celeste', { ...look({ fur: '#e8b830', belly: '#fff4c0', tail: '#d8a020', pat: [['escamas', '#fff4a0'], 'brilho'], eye: '#d83a1a' }), acc: A('chifres', 'espinhos'), fx: 'gold' }],
  ['Unicórnio', { ...look({ fur: '#f8f0ff', belly: '#ffffff', tail: '#ff9ad0', pat: ['arcoIris'] }), acc: A('chifreUnicornio'), fx: 'rainbow' }],
  ['Kitsune', { ...look({ fur: '#f4f4f8', belly: '#ffffff', tail: '#c8c8f0', pat: [['pontaRabo', '#7a8aff']], eye: '#7a8aff' }), acc: A('orelhasRaposa'), fx: 'spirit' }],
  ['Anjo', { ...look({ fur: '#fff4e0', belly: '#ffffff', tail: '#f8ecd0', eye: '#7ab0ff' }), acc: A('asas', 'aureola'), fx: 'feathers' }],
  ['Demônio das Sombras', { ...look({ fur: '#2a1a2a', belly: '#4a2a3a', tail: '#1a0a1a', pat: [['brilho', '#ff3a5a']], eye: '#ff3a5a' }), acc: A('chifresDiabo', 'capaVampiro'), fx: 'shadow' }],
  ['Espírito do Inverno', { ...look({ fur: '#e0f4ff', belly: '#ffffff', tail: '#bfe8ff', pat: ['floco'], eye: '#2a6ad8' }), acc: A('coroaGelo'), fx: 'snow' }],
  ['Raio Vivo', { ...look({ fur: '#fff27a', belly: '#ffffff', tail: '#ffcc3a', pat: ['raios', ['brilho', '#ffffff']], eye: '#3a7ad8' }), acc: A('raio'), fx: 'electric' }],
  ['Fada da Floresta', { ...look({ fur: '#7ad860', belly: '#e8ffd0', tail: '#3aa860', pat: ['sakura'], eye: '#ff8ad0' }), acc: A('asas', 'coroaFlores'), fx: 'leaves' }],
  ['Leviatã', { ...look({ fur: '#1a4a8a', belly: '#7ac0e8', tail: '#0a2a5a', pat: [['escamas', '#3ae8e8']], eye: '#3ae8e8' }), acc: A('barbatana'), fx: 'bubbles' }],
  ['Sakura', { ...look({ fur: '#ffc0d8', belly: '#fff0f6', tail: '#ff9ac0', pat: ['sakura', ['brilho', '#ffffff']] }), acc: A('flor', 'tiara'), fx: 'petals' }],
  ['Esquilo Cósmico', { ...look({ fur: '#1a0a3a', belly: '#5a3a9a', tail: '#3a1a6a', pat: ['aurora', 'estrelas'], eye: '#7af0ff' }), acc: A('estrela', 'nimbo'), fx: 'stars' }],
  ['Sol Eterno', { ...look({ fur: '#ffd23a', belly: '#fff8d0', tail: '#ff9a2a', pat: ['chamas'], eye: '#fff4a0' }), acc: A('sol', 'coroa'), fx: 'sun' }],
  ['Coração de Lacrímora', { ...look({ fur: '#5a2a9a', belly: '#c8a8ff', tail: '#3a1a6a', pat: ['runas', ['brilho', '#e0a8ff']], eye: '#e0a8ff' }), acc: A('cristais', 'aureola'), fx: 'runes' }],
  ['Guardião de Selênia', { ...look({ fur: '#f4ecc8', outfit: ['armadura', '#c8d0e0', '#3a5ad8'], pat: [['brilho', '#ffffff']], eye: '#3a5ad8' }), acc: A('coroaPrata', 'capaRoxa'), fx: 'moon' }],
  ['Fênix de Gelo', { ...look({ fur: '#7ad0ff', belly: '#e8fbff', tail: '#3a9ae8', pat: [['degrade', '#ffffff'], 'floco'], eye: '#ffffff' }), acc: A('pluma2', 'coroaGelo'), fx: 'snow' }],
];
MYTH2.forEach(([n, o]) => add('mitica', n, o));

// ---------------------------------------------------------------- poderes (um diferente para cada uma das 450 skins)
// Cada tipo de poder tem uma lista de variações (números diferentes); cada skin fica com uma variação que nenhuma outra tem.
// Os ativos (botão PODER) têm tempo de espera proporcional à força, para todos valerem parecido; a raridade NÃO deixa o
// poder mais forte. O tipo combina com a skin (pelo nome: Ninja teleporta, Fênix voa, Gelo para o tempo...).
const rng = (a, b, st) => { const out = []; for (let v = a; v <= b + 1e-9; v += st) out.push(Math.round(v * 100) / 100); return out; };
const cross = (A, B) => A.flatMap((x) => B.map((y) => [x, y]));
const n1 = (v) => String(v).replace('.', ',');
export const POWER_TYPES = {
  // ---- passivos (sempre ligados)
  ima:          { name: 'Ímã', vars: rng(40, 100, 2.5), desc: (p) => `${n1(p)}% de chance de puxar as moedas das casas do lado ao pousar.` },
  sorte:        { name: 'Sortudo', vars: rng(12, 36, 1), desc: (p) => `${p}% das moedas valem o dobro.` },
  faro:         { name: 'Faro de Tesouro', vars: rng(16, 40, 1), desc: (p) => `${p}% das moedas do caminho são grandes (valem 5).` },
  explorador:   { name: 'Explorador', vars: rng(1.2, 2.4, 0.05), desc: (p) => `Portais de dimensão bônus aparecem ${n1(p)}x mais.` },
  caminhante:   { name: 'Caminhante', vars: rng(5, 29, 1), desc: (p) => `Ganha 1 moeda a cada ${p} fileiras.` },
  pechincha:    { name: 'Pechincheiro', vars: rng(30, 60, 1.25), desc: (p) => `Reviver custa ${Math.round(p)} moedas em vez de 70.` },
  casco:        { name: 'Casco Duro', vars: rng(0.8, 3.2, 0.1), desc: (p) => `1 vez por partida aguenta uma batida e fica ${n1(p)} s protegido.` },
  nadador:      { name: 'Nadador', vars: rng(0.8, 3.2, 0.1), desc: (p) => `1 vez por partida, se cair na água, nada até a margem (${n1(p)} s protegido).` },
  calmo:        { name: 'Sangue-Frio', vars: rng(5, 17, 0.5), desc: (p) => `A tela sobe ${n1(p)}% mais devagar.` },
  equilibrio:   { name: 'Pés Firmes', vars: rng(8.5, 14.5, 0.25), desc: (p) => `Margem de ${n1(p)} px para pousar e ficar nos troncos.` },
  reflexo:      { name: 'Reflexo', vars: rng(4, 14, 0.5), desc: (p) => `Carroças, slimes e trens ${n1(p)}% mais devagar.` },
  ligeiro:      { name: 'Ligeiro', vars: rng(8, 32, 1), desc: (p) => `Pula ${p}% mais rápido.` },
  moedaInicial: { name: 'Cofrinho', vars: rng(4, 28, 1), desc: (p) => `Começa cada partida com ${p} moedas.` },
  escudoInicio: { name: 'Largada Segura', vars: rng(3, 9, 0.25), desc: (p) => `Começa cada partida com ${n1(p)} s de proteção.` },
  recorde:      { name: 'Campeão', vars: rng(6, 30, 1), desc: (p) => `Ganha ${p} moedas quando bate o próprio recorde.` },
  // ---- ativos (botão PODER; espera = cd segundos)
  teleporte:    { name: 'Teleporte', active: true, vars: cross([2, 3, 4], [0, 0.5, 1, 1.5, 2]), cd: ([a, b]) => 7 * a + 3 * b, desc: ([a, b]) => `Some e aparece ${a} fileiras à frente${b ? ` com ${n1(b)} s de proteção` : ''}.` },
  voo:          { name: 'Voo', active: true, vars: cross([2, 3, 4, 5], [0, 0.5, 1, 1.5]), cd: ([a, b]) => 6 * a + 3 * b, desc: ([a, b]) => `Voa ${a} fileiras por cima de tudo${b ? ` e pousa com ${n1(b)} s de proteção` : ''}.` },
  tempo:        { name: 'Parar o Tempo', active: true, vars: rng(1.5, 5, 0.25), cd: (a) => 6 * a, desc: (a) => `Para carroças, rios, trens e a tela por ${n1(a)} s.` },
  escudo:       { name: 'Escudo', active: true, vars: rng(2.5, 8, 0.25), cd: (a) => 4 * a, desc: (a) => `Fica protegido de batidas por ${n1(a)} s.` },
  turbo:        { name: 'Turbo', active: true, vars: rng(2.5, 8, 0.25), cd: (a) => 3.5 * a, desc: (a) => `Pula o dobro de rápido por ${n1(a)} s.` },
  imaAtivo:     { name: 'Ímã Poderoso', active: true, vars: rng(4, 12, 0.5), cd: (a) => 3 * a, desc: (a) => `Puxa moedas de até 2 casas de distância por ${n1(a)} s.` },
  agua:         { name: 'Andar na Água', active: true, vars: rng(2.5, 8, 0.25), cd: (a) => 4 * a, desc: (a) => `Anda sobre a água por ${n1(a)} s.` },
  recuar:       { name: 'Fôlego', active: true, vars: rng(1.5, 5, 0.25), cd: (a) => 8 * a, desc: (a) => `A tela volta ${n1(a)} fileiras para trás.` },
  chuva:        { name: 'Chuva de Moedas', active: true, vars: cross([3, 4, 5, 6, 7, 8], [0, 1]), cd: ([a, b]) => 6 * a + 4 * b, desc: ([a, b]) => `Faz cair ${a} moedas${b ? ' (uma delas grande)' : ''} logo à frente.` },
  dash:         { name: 'Investida', active: true, vars: cross([2, 3, 4], [0, 0.5, 1, 1.5]), cd: ([a, b]) => 4 * a + 3 * b, desc: ([a, b]) => `Dispara ${a} casas para o lado${b ? ` com ${n1(b)} s de proteção` : ''}.` },
  lento:        { name: 'Câmera Lenta', active: true, vars: rng(2, 7, 0.25), cd: (a) => 4.5 * a, desc: (a) => `Tudo fica na metade da velocidade por ${n1(a)} s.` },
};
// palavras do nome que puxam cada tipo de poder (a ordem importa: as primeiras que baterem mandam)
const THEMES = [
  [/Ninja|Kitsune|Sombra|Mágico|Fantasma|Hacker|Eclipse|Mascarad|Demônio|Breu|Vampiro/, ['teleporte', 'dash', 'reflexo']],
  [/Fênix|Anjo|Fada|Arara|Flamingo|Pavão|Aviador|Abelha|Joaninha|Dragão|Hélice|Pluma|Asas|Coelh|Unicórnio|Ray|Astronauta/, ['voo', 'ligeiro', 'explorador']],
  [/Gelo|Inverno|Neve|Pinguim|Esquiador|Polar|Mago|Selene|Aldo|Astrônomo|Bruxa|Cristal|Lacrímora|Gorro|Cachecol|Prata|Lua|Selênia/, ['tempo', 'lento', 'calmo']],
  [/Cavaleiro|Armadura|Viking|Samurai|Tartaruga|Rei|Rainha|Guardião|Policial|Bombeiro|Robô|Chifres|Vaquinha|Urso|Peito Branco|Juiz/, ['escudo', 'casco', 'escudoInicio']],
  [/Tigr|Ciclista|Skatista|Tenista|Craque|Goleiro|Boxeador|Raio|Leão|Lobo|Tempestade|Ligeir|de Meias|Raposa|Rapper|Gamer/, ['turbo', 'ligeiro', 'dash']],
  [/Dourad|Pirata|Topázio|Coroa|Sol|Colar|Medalha|Rubi|Safira|Esmeralda|Cintilante|Brilhante/, ['imaAtivo', 'ima', 'faro']],
  [/Marinheiro|Mergulhador|Sereia|Surfista|Tubarão|Nadador|Pescador|Sapo|Marcos|Coralina|Leviatã|Pipo|Oceano|Concha|Nico/, ['agua', 'nadador', 'equilibrio']],
  [/Professor|Detetive|Cientista|Médico|Richard|Coruja|Gus|Óculos|Monóculo/, ['recuar', 'reflexo', 'faro']],
  [/Confeiteiro|Chef|Carnaval|Festa|Arco-Íris|Palhaço|Sakura|Flor|Laço|Algodão/, ['chuva', 'sorte', 'moedaInicial']],
  [/Fone|Bailarina|Monice|DJ|Roqueiro|Aurora|Zen|Panda|Gus/, ['lento', 'calmo', 'reflexo']],
  [/Explorador|Escoteiro|Mineiro|Safari|Antenas|Cósmico|Galáxia|Alien|Doran|Mara|Trem|Maquinista/, ['explorador', 'faro', 'caminhante']],
  [/Fazendeiro|Carteiro|Jardineiro|Sardento|Palha|Lenhador|Apicultor|Hermes|Lyon/, ['caminhante', 'pechincha', 'moedaInicial']],
  [/Gravat|Terno|Ferreira|Mecânico|Pintor|Elfo|Papai Noel/, ['pechincha', 'recorde', 'moedaInicial']],
  [/Pintad|Malhad|Trevo|Abóbora/, ['sorte', 'faro']],
  [/Ponta Clara|Bicolor|Escamad/, ['equilibrio', 'dash']],
  [/Rabo Listrado|Guaxinim|Zebra/, ['reflexo', 'calmo']],
  [/Tiara|Auréola|Louros|Boné|Viseira/, ['escudoInicio', 'recorde', 'turbo']],
];
{
  const left = Object.fromEntries(Object.entries(POWER_TYPES).map(([k, t]) => [k, [...t.vars]]));
  // ordem de escolha: as raras primeiro (míticas, lendárias, épicas...), para os temas fortes pegarem o poder que combina
  const order = [...SKINS].sort((a, b) => ['mitica', 'lendaria', 'epica', 'rara', 'comum'].indexOf(a.rarity) - ['mitica', 'lendaria', 'epica', 'rara', 'comum'].indexOf(b.rarity));
  const rot = Object.keys(POWER_TYPES);
  order.forEach((sk, i) => {
    const pref = THEMES.filter(([re]) => re.test(sk.name)).flatMap(([, ts]) => ts);
    const fallback = [...rot].sort((a, b) => left[b].length - left[a].length);   // sem tema: o tipo com mais variações sobrando
    const type = [...pref, ...fallback].find((t) => left[t].length);
    const vs = left[type], v = vs.splice((i * 7) % vs.length, 1)[0];   // pega uma variação ainda livre
    const T = POWER_TYPES[type];
    sk.power = { type, v, active: !!T.active, cd: T.active ? Math.round(T.cd(v) * 10) / 10 : 0, name: T.name, desc: T.desc(v) + (T.active ? ` Espera ${n1(Math.round(T.cd(v) * 10) / 10)} s.` : '') };
  });
}
export const powerOf = (s) => (typeof s === 'string' ? (SKINS.find((k) => k.id === s) || SKINS[0]) : s || SKINS[0]).power;

export const SKIN_BY_ID = Object.fromEntries(SKINS.map((s) => [s.id, s]));
export const DEFAULT_SKIN = 's000';
{ const want = { comum: 170, rara: 135, epica: 90, lendaria: 35, mitica: 20 }; for (const [r, n] of Object.entries(want)) if (SKINS.filter((s) => s.rarity === r).length !== n) console.warn('skins:', r, SKINS.filter((s) => s.rarity === r).length); if (SKINS.length !== 450) console.warn('skins:', SKINS.length); if (new Set(SKINS.map((s) => s.name)).size !== SKINS.length) console.warn('skins: nome repetido'); }

// míticas que a conta ainda não tem (o esquilo mítico só aparece enquanto faltar alguma)
export const missingMythics = (owned) => SKINS.filter((s) => s.rarity === 'mitica' && !owned.includes(s.id));
// sorteio: escolhe a raridade pela chance e, dentro dela, qualquer uma (pode repetir); mítica nunca sai aqui
export function rollSkin(rnd = Math.random) {
  let r = rnd() * 100, rar = 'comum';
  for (const [k, v] of Object.entries(RARITIES)) { if (!v.chance) continue; if (r < v.chance) { rar = k; break; } r -= v.chance; }
  const pool = SKINS.filter((s) => s.rarity === rar);
  return pool[Math.floor(rnd() * pool.length)];
}
