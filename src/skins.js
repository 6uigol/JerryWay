// As 180 skins do Jerry. Cada uma troca as cores do pelo (pal), pode ter um traje (suit), um acessório na cabeça (acc)
// e, nas mais raras, um efeito em volta dele (fx). Saem no sorteio (Sortear skin): 100 moedas por tentativa, podendo repetir.
// Raridade: comum, rara, épica, lendária e mítica. A chance é da raridade; dentro dela, todas têm a mesma chance.
// As míticas NÃO saem no sorteio: só pegando o esquilo mítico no caminho (muito raro; se passar da fileira dele, ele foge) e nunca repetem.
export const RARITIES = {
  comum: { name: 'Comum', color: '#c8c8d8', chance: 55 },
  rara: { name: 'Rara', color: '#5ab0ff', chance: 28 },
  epica: { name: 'Épica', color: '#c07aff', chance: 12.5 },
  lendaria: { name: 'Lendária', color: '#ffb84a', chance: 4.5 },
  mitica: { name: 'Mítica', color: '#ff5a8a', chance: 0, onlyRun: true },   // só no caminho
};
export const PULL_COST = 100;

// cores originais do Jerry (jerry.js) que a skin troca
const ORIG = { fur: '#d4843a', furD: '#a85a22', furL: '#eaa45a', belly: '#fbe6c0', bellyD: '#e8c890', tail: '#c8742e', tailD: '#8a4418', tailL: '#f2b870' };
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (a) => '#' + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, k) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * k));
// paleta inteira a partir de uma cor de pelo (e, se quiser, de outra para a barriga e para o rabo)
function pal(fur, belly = null, tail = null) {
  const t = tail || mix(fur, '#000000', 0.06), b = belly || mix(fur, '#ffffff', 0.72);
  return {
    [ORIG.fur]: fur, [ORIG.furD]: mix(fur, '#000000', 0.28), [ORIG.furL]: mix(fur, '#ffffff', 0.22),
    [ORIG.belly]: b, [ORIG.bellyD]: mix(b, '#000000', 0.12),
    [ORIG.tail]: t, [ORIG.tailD]: mix(t, '#000000', 0.38), [ORIG.tailL]: mix(t, '#ffffff', 0.3),
  };
}

// ---------------------------------------------------------------- acessórios (pintados no quadro 28x28, cabeça em hx, hy)
const P = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const ACC = {
  laco: (c, x, y) => { P(c, x + 1, y - 6, 2, 2, '#ff5a9a'); P(c, x + 4, y - 6, 2, 2, '#ff5a9a'); P(c, x + 3, y - 6, 1, 2, '#c02a6a'); },
  bone: (c, x, y, v, s) => { P(c, x - 3, y - 6, 7, 2, '#3a7ad8'); P(c, x - 2, y - 7, 5, 1, '#3a7ad8'); if (v === 'side' || v === 'left') P(c, s > 0 ? x + 3 : x - 6, y - 5, 4, 1, '#2a5aa8'); else if (v === 'front') P(c, x - 3, y - 4, 7, 1, '#2a5aa8'); },
  oculos: (c, x, y, v) => { if (v === 'back') { P(c, x - 3, y - 2, 7, 1, '#1a1a22'); return; } P(c, x - 3, y - 2, 7, 1, '#1a1a22'); P(c, x - 3, y - 2, 3, 2, '#1a1a22'); P(c, x + 1, y - 2, 3, 2, '#1a1a22'); P(c, x - 2, y - 2, 1, 1, '#8ad0ff'); P(c, x + 2, y - 2, 1, 1, '#8ad0ff'); },
  cachecol: (c, x, y) => { P(c, x - 4, y + 3, 9, 2, '#e04848'); P(c, x - 4, y + 3, 9, 1, '#ff7a6a'); P(c, x + 2, y + 5, 2, 3, '#e04848'); },
  bandana: (c, x, y) => { P(c, x - 4, y - 4, 9, 2, '#d83a3a'); P(c, x - 4, y - 4, 2, 1, '#ffffff'); P(c, x + 1, y - 4, 1, 1, '#ffffff'); },
  gorro: (c, x, y) => { P(c, x - 4, y - 6, 9, 3, '#4aa860'); P(c, x - 4, y - 4, 9, 1, '#e8e8e8'); P(c, x, y - 8, 2, 2, '#ffffff'); },
  palha: (c, x, y) => { P(c, x - 6, y - 4, 13, 1, '#e8c860'); P(c, x - 3, y - 7, 7, 3, '#e8c860'); P(c, x - 3, y - 5, 7, 1, '#c84a3a'); },
  fone: (c, x, y) => { P(c, x - 4, y - 7, 9, 1, '#2a2a3a'); P(c, x - 5, y - 4, 2, 3, '#ff5a5a'); P(c, x + 4, y - 4, 2, 3, '#ff5a5a'); },
  flor: (c, x, y) => { P(c, x + 2, y - 7, 3, 3, '#ff8ad0'); P(c, x + 3, y - 6, 1, 1, '#ffe070'); },
  tiara: (c, x, y) => { P(c, x - 3, y - 6, 7, 1, '#e8e8f8'); P(c, x, y - 7, 1, 1, '#7af0ff'); },
  chifres: (c, x, y) => { P(c, x - 3, y - 8, 1, 3, '#f4e8d0'); P(c, x + 3, y - 8, 1, 3, '#f4e8d0'); P(c, x - 4, y - 9, 1, 1, '#f4e8d0'); P(c, x + 4, y - 9, 1, 1, '#f4e8d0'); },
  antenas: (c, x, y) => { P(c, x - 2, y - 9, 1, 4, '#3a3a4a'); P(c, x + 2, y - 9, 1, 4, '#3a3a4a'); P(c, x - 3, y - 10, 2, 2, '#ffe070'); P(c, x + 2, y - 10, 2, 2, '#ffe070'); },
  coroa: (c, x, y) => { P(c, x - 3, y - 7, 7, 2, '#ffcc3a'); P(c, x - 3, y - 9, 1, 2, '#ffcc3a'); P(c, x, y - 9, 1, 2, '#ffcc3a'); P(c, x + 3, y - 9, 1, 2, '#ffcc3a'); P(c, x, y - 7, 1, 1, '#ff3a5a'); },
  mago: (c, x, y) => { P(c, x - 5, y - 5, 11, 1, '#6a3ab8'); P(c, x - 3, y - 8, 7, 3, '#6a3ab8'); P(c, x - 2, y - 10, 5, 2, '#6a3ab8'); P(c, x - 1, y - 12, 3, 2, '#6a3ab8'); P(c, x, y - 13, 1, 1, '#6a3ab8'); P(c, x, y - 8, 1, 1, '#ffe070'); },
  cartola: (c, x, y) => { P(c, x - 5, y - 5, 11, 1, '#1a1a24'); P(c, x - 3, y - 11, 7, 6, '#1a1a24'); P(c, x - 3, y - 7, 7, 1, '#c83a4a'); },
  aureola: (c, x, y) => { P(c, x - 3, y - 10, 7, 1, '#fff27a'); P(c, x - 4, y - 9, 1, 1, '#fff27a'); P(c, x + 4, y - 9, 1, 1, '#fff27a'); P(c, x - 3, y - 8, 7, 1, '#e8c83a'); },
  mascara: (c, x, y, v) => { if (v === 'back') { P(c, x - 4, y - 2, 9, 1, '#1a1a22'); return; } P(c, x - 4, y - 3, 9, 2, '#1a1a22'); P(c, x - 2, y - 2, 1, 1, '#ffffff'); P(c, x + 2, y - 2, 1, 1, '#ffffff'); },
  capa: (c, x, y, v) => { if (v === 'front') { P(c, x - 4, y + 3, 9, 1, '#c83a4a'); P(c, x, y + 3, 1, 1, '#ffcc3a'); return; } P(c, x - 4, y + 3, 9, 8, '#c83a4a'); P(c, x - 4, y + 3, 9, 1, '#ff6a6a'); },
  orelhasGato: (c, x, y) => { P(c, x - 4, y - 8, 2, 3, '#1a1a24'); P(c, x + 3, y - 8, 2, 3, '#1a1a24'); P(c, x - 3, y - 7, 1, 1, '#ff9ab0'); P(c, x + 3, y - 7, 1, 1, '#ff9ab0'); },
  topete: (c, x, y) => { P(c, x - 3, y - 7, 6, 2, '#5a3a22'); P(c, x - 1, y - 9, 4, 2, '#5a3a22'); P(c, x + 1, y - 10, 2, 1, '#7a5232'); },
  estrela: (c, x, y) => { P(c, x - 1, y - 10, 3, 1, '#ffe070'); P(c, x, y - 11, 1, 3, '#ffe070'); },
  cristais: (c, x, y) => { P(c, x - 3, y - 8, 2, 3, '#7af0ff'); P(c, x + 2, y - 9, 2, 4, '#c08aff'); P(c, x - 3, y - 8, 1, 1, '#ffffff'); },
  chama: (c, x, y) => { P(c, x - 2, y - 9, 5, 3, '#ff8a2a'); P(c, x - 1, y - 11, 3, 2, '#ffc83a'); P(c, x, y - 12, 1, 1, '#fff4a0'); },
  pirata: (c, x, y) => { P(c, x - 5, y - 5, 11, 2, '#1a1a24'); P(c, x - 3, y - 7, 7, 2, '#1a1a24'); P(c, x, y - 7, 1, 1, '#ffffff'); },
};
const ACC_NAME = {
  laco: 'Laço', bone: 'Boné', oculos: 'Óculos', cachecol: 'Cachecol', bandana: 'Bandana', gorro: 'Gorro', palha: 'Chapéu de Palha', fone: 'Fone',
  flor: 'Flor', tiara: 'Tiara', chifres: 'Chifres', antenas: 'Antenas', coroa: 'Coroa', mago: 'Chapéu de Mago', cartola: 'Cartola', aureola: 'Auréola',
  mascara: 'Máscara', capa: 'Capa', pirata: 'Pirata',
};

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

// ---------------------------------------------------------------- a lista
export const SKINS = [];
const add = (rarity, name, opts) => SKINS.push({ id: 's' + String(SKINS.length).padStart(3, '0'), rarity, name, ...opts });
const withAcc = (a) => ACC[a];

// 70 comuns: as 35 cores puras e as mesmas cores com um acessório simples
COMMON_FUR.forEach(([n, c]) => add('comum', n, { pal: pal(c) }));
const SIMPLE = ['laco', 'bone', 'oculos', 'cachecol', 'bandana'];
COMMON_FUR.forEach(([n, c], i) => { const a = SIMPLE[i % SIMPLE.length]; add('comum', `${n} com ${ACC_NAME[a]}`, { pal: pal(c), acc: withAcc(a) }); });

// 55 raras: cores comuns e vivas com acessórios melhores
const RARE_ACC = ['gorro', 'palha', 'fone', 'flor', 'tiara', 'chifres', 'antenas', 'pirata'];
for (let i = 0; i < 43; i++) { const [n, c] = COMMON_FUR[(i * 8 + 3) % COMMON_FUR.length]; const a = RARE_ACC[i % RARE_ACC.length]; add('rara', `${n} com ${ACC_NAME[a]}`, { pal: pal(c), acc: withAcc(a) }); }
VIVID_FUR.forEach(([n, c]) => add('rara', n, { pal: pal(c) }));

// 35 épicas: cores vivas com acessórios especiais
const EPIC_ACC = ['coroa', 'mago', 'cartola', 'aureola', 'mascara', 'capa'];
for (let i = 0; i < 35; i++) { const [n, c] = VIVID_FUR[(i * 5 + Math.floor(i / 12)) % VIVID_FUR.length]; const a = EPIC_ACC[i % EPIC_ACC.length]; add('epica', `${n} com ${ACC_NAME[a]}`, { pal: pal(c), acc: withAcc(a) }); }

// 15 lendárias: as do universo Song of Moonlight
const LEG = [
  ['Astronauta', { suit: 'space' }], ['Mergulhador', { suit: 'dive' }],
  ['Dourado', { pal: pal('#e8b830', '#fff4c0', '#d8a020') }], ['Prata Lunar', { pal: pal('#c8d0e0', '#ffffff', '#a8b0c8'), acc: ACC.estrela }],
  ['Cristal', { pal: pal('#7ad8f0', '#e8fbff', '#9a7ae8'), acc: ACC.cristais }], ['Lava', { pal: pal('#3a2a2a', '#ff8a2a', '#d84a1a'), acc: ACC.chama }],
  ['Gelo', { pal: pal('#a8e0ff', '#ffffff', '#e8f8ff') }], ['Breu', { pal: pal('#2a2632', '#5a5266', '#2a2632'), acc: ACC.orelhasGato }],
  ['Fã do Lyon', { pal: pal('#d4843a'), acc: ACC.topete }], ['Hermes', { pal: pal('#8a5a32', '#e8d0a8', '#3a2418') }],
  ['Sereia de Marélia', { pal: pal('#2aa8a0', '#a8f0e0', '#2a7ab8'), acc: ACC.flor }], ['Lacrímora', { pal: pal('#7a4ab8', '#d8c0ff', '#4a2a8a'), acc: ACC.cristais }],
  ['Rei Jerry', { pal: pal('#d4843a'), acc: (c, x, y, v, s) => { ACC.capa(c, x, y, v, s); ACC.coroa(c, x, y, v, s); } }],
  ['Mago Supremo', { pal: pal('#4a3a8a', '#c8b8ff', '#2a1a5a'), acc: ACC.mago }], ['Sombra', { pal: pal('#1a1a24', '#3a3a4a', '#1a1a24'), acc: ACC.mascara }],
];
LEG.forEach(([n, o]) => add('lendaria', n, o));

// 5 míticas: com efeito brilhando em volta
const MYTH = [
  ['Arco-Íris', { pal: pal('#ff5a8a', '#fff4c0', '#5ab0ff'), fx: 'rainbow' }],
  ['Galáxia', { pal: pal('#2a1a5a', '#8a6ae8', '#1a0a3a'), acc: ACC.estrela, fx: 'stars' }],
  ['Fantasma', { pal: pal('#e8e8ff', '#ffffff', '#c8c8f0'), fx: 'ghost' }],
  ['Fênix', { pal: pal('#ff6a2a', '#ffe070', '#ffb83a'), acc: ACC.chama, fx: 'fire' }],
  ['Coração da Lua', { pal: pal('#f4ecc8', '#ffffff', '#e8d898'), acc: ACC.aureola, fx: 'moon' }],
];
MYTH.forEach(([n, o]) => add('mitica', n, o));

export const SKIN_BY_ID = Object.fromEntries(SKINS.map((s) => [s.id, s]));
export const DEFAULT_SKIN = 's000';
if (SKINS.length !== 180) console.warn('skins:', SKINS.length);

// míticas que a conta ainda não tem (o esquilo mítico só aparece enquanto faltar alguma)
export const missingMythics = (owned) => SKINS.filter((s) => s.rarity === 'mitica' && !owned.includes(s.id));
// sorteio: escolhe a raridade pela chance e, dentro dela, qualquer uma (pode repetir); mítica nunca sai aqui
export function rollSkin(rnd = Math.random) {
  let r = rnd() * 100, rar = 'comum';
  for (const [k, v] of Object.entries(RARITIES)) { if (!v.chance) continue; if (r < v.chance) { rar = k; break; } r -= v.chance; }
  const pool = SKINS.filter((s) => s.rarity === rar);
  return pool[Math.floor(rnd() * pool.length)];
}
