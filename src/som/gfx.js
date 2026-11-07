// Pixel art procedural: tudo desenhado com retângulos, sem imagens externas.
import { TILE, COLS, ROWS, hash } from './util.js';
import { drawHeroSprite, drawHeroAttack, drawHeroHold, drawHeroPush, ARMOR } from './hero.js';
import { icon16Small, icon16Canvas, drawIcon16 } from './icons16.js';
export { drawIcon16, icon16Canvas, icon16Small };
import { drawFacade, drawFacadeFx, drawCourt, courtCovers } from './facades.js';
export { drawFacadeFx };
import { BOSS_ART, knightBody, drawOutlinedBoss, drawOutlinedAt, bossFxBack, bossFxFront, setBossWalking } from './bossart.js';

// sombras no chão vão direto para a tela principal quando o sprite está sendo desenhado para ganhar contorno
const SHADOW_RE = /^rgba\(0,\s*0,\s*0,/;
export const R = (ctx, x, y, w, h, c) => { if (ctx.shadowSink && SHADOW_RE.test(c)) ctx = ctx.shadowSink; ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

const MOB_LIGHT = {
  slime: '#7bff83', slimeRed: '#ff6677', zol: '#f18cff', gel: '#a8fff0', lunaslime: '#73eaff',
  bat: '#bd8cff', firebat: '#ff8240', skeleton: '#eee2bd', skelking: '#ffcc52', ghost: '#9fdcff', poe: '#b58cff', dustwisp: '#8cf7ff',
  sentinel: '#ff5656', moonbot: '#7af0ff', wolf: '#c7e8ff', yeti: '#e6f5ff', plant: '#ff647a', frog: '#8af08a',
  crab: '#ff9163', regolith: '#8ef2ff', scorpion: '#ffb35e', mummy: '#e8cc82', mage: '#9d73ff', knightS: '#ff5c72',
  moblin: '#ffc875', beetle: '#80aaff', tektite: '#ff78ca', snake: '#a7ed75', serpent: '#65ead7', armos: '#d8d8ff',
  leever: '#ff8de3', octo: '#85ff91', hardhat: '#ffe27a', blade: '#f15b68', cactus: '#7cff9b', lynel: '#ffad65',
  rootboss: '#8cff72', bigslime: '#d995ff', golem: '#ffb76b', pharaoh: '#ffd66c', icequeen: '#bceeff',
  lunarcolossus: '#9fe8ff', cryspider: '#dc9bff', moonking: '#fff2b0', conductor: '#77ddff', echo: '#be95ff',
  xenowisp: '#bd83ff', voidstalker: '#7af0ff',
};
export function drawMobGlow(ctx, type, t) {
  const color = MOB_LIGHT[type] || '#b8e6ff';
  ctx.save(); ctx.globalAlpha = 0.09 + (Math.sin(t * 5) + 1) * 0.025;
  ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(0, 4, 7.5, 2.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

// ---------------------------------------------------------------- temas
const BR = (brick, brickDark, mortar, brickHi, floor, floorDark, floorHi, moss) => ({ brick, brickDark, mortar, brickHi, floor, floorDark, floorHi, moss });
export const THEMES = {
  plains: { g: '#5a9e46', gd: '#4b8a3b', gl: '#6db352', bl: '#7cc45e', tree: 'tree', rock: ['#8a8a8a', '#6b6b6b', '#b4b4b4'], water: ['#3a7bd5', '#2f68b8'], ...BR('#8a857c', '#6c675f', '#4f4b45', '#a6a197', '#7a776a', '#66635a', '#8d8a7c') },
  forest: { g: '#3f7f3a', gd: '#336b30', gl: '#4f9446', bl: '#5fa652', tree: 'darktree', rock: ['#7a7a72', '#5c5c56', '#9c9c92'], water: ['#2f6aa8', '#275a92'], ...BR('#6f7a5c', '#58614a', '#3b4030', '#87916f', '#6a6a52', '#58584a', '#7c7c62') },
  shadow: { g: '#4a4a5c', gd: '#3c3c4c', gl: '#58586c', bl: '#64647a', tree: 'deadtree', rock: ['#6a6a78', '#4e4e5a', '#8a8a98'], water: ['#2a3a6a', '#22305a'], ...BR('#5a5668', '#46424f', '#2e2b36', '#716c82', '#55525e', '#45424e', '#64616e') },
  swamp: { g: '#5c6b3a', gd: '#4c5a30', gl: '#6a7a44', bl: '#7a8a4e', tree: 'mangrove', rock: ['#6e7262', '#55594a', '#8a8e7c'], water: ['#3c6a5a', '#30584a'], ...BR('#6a6e52', '#565a42', '#3a3d2c', '#80846a', '#5e604a', '#4e503c', '#6e705a') },
  mountain: { g: '#8a7a62', gd: '#766850', gl: '#9a8a70', bl: '#a89878', tree: 'pine', rock: ['#7c7468', '#5e584e', '#a09888'], water: ['#3a7bd5', '#2f68b8'], ...BR('#8a7e6e', '#6e6456', '#4a4238', '#a69a88', '#7e7262', '#6a6052', '#908474') },
  coast: { g: '#e2cf96', gd: '#d0bb80', gl: '#eedcaa', bl: '#f4e6bc', tree: 'palm', rock: ['#9a9488', '#7a756a', '#bcb6a8'], water: ['#2f8fd8', '#2878c0'], ...BR('#c8b88a', '#a89a70', '#7a6e50', '#ddd0a4', '#c0b088', '#a89870', '#d0c098') },
  desert: { g: '#d8945a', gd: '#c4804a', gl: '#e4a66c', bl: '#eeb87e', tree: 'cactus', rock: ['#a86a4a', '#8a523a', '#c4886a'], water: ['#3aa0c8', '#2f88b0'], ...BR('#c08a5a', '#a07048', '#704a30', '#d8a476', '#c89a6a', '#b08458', '#d8ac7c') },
  snow: { g: '#e8eef8', gd: '#cfd8e8', gl: '#ffffff', bl: '#dfe6f2', tree: 'snowpine', rock: ['#8a92a8', '#6a7288', '#b0b8cc'], water: ['#5a9ad8', '#4a86c4'], ...BR('#9aa4bc', '#7c86a0', '#56607a', '#b8c2d8', '#a8b4cc', '#909cb4', '#c0cade') },
  castleout: { cobble: true, g: '#5a9e46', gd: '#4b8a3b', gl: '#6db352', bl: '#7cc45e', tree: 'tree', rock: ['#8a8a8a', '#6b6b6b', '#b4b4b4'], water: ['#3a7bd5', '#2f68b8'], ...BR('#4d4566', '#3b3550', '#221d31', '#665c86', '#5c5674', '#4a4560', '#6c6688') },
  // masmorras
  dforest: { ...BR('#5c6a46', '#4a5638', '#2c3322', '#748458', '#5a5a42', '#4a4a36', '#6a6a50', '#4c7a34'), water: ['#2f6aa8', '#275a92'] },
  dcrypt: { ...BR('#5e5e66', '#4a4a52', '#2a2a30', '#76767e', '#504e56', '#403e46', '#5e5c64'), water: ['#2a3a6a', '#22305a'] },
  dswamp: { ...BR('#5a6648', '#48523a', '#2a3020', '#6e7c58', '#4e5640', '#3e4632', '#5c654c', '#5a7a3a'), water: ['#3c6a5a', '#30584a'] },
  dmine: { ...BR('#7a5e44', '#624a36', '#3a2a1e', '#947456', '#5e4a3a', '#4c3c2e', '#6c5644'), water: ['#3a6aa8', '#2f5a92'] },
  dtide: { ...BR('#3e6a8a', '#30566e', '#1c3444', '#5284a8', '#3a5a72', '#2e4a5e', '#46687e'), water: ['#2a7ac8', '#2268b0'] },
  dsun: { ...BR('#c09a52', '#a07e40', '#6a5228', '#d8b468', '#b08a4e', '#987640', '#c09a5c'), water: ['#3aa0c8', '#2f88b0'] },
  dice: { ...BR('#7aa8c8', '#6290b0', '#3a5a78', '#9ac4e0', '#a8c8e0', '#8eb0cc', '#bcd8ec'), water: ['#4a8ad0', '#3a78bc'] },
  castle: { ...BR('#4d4566', '#3b3550', '#221d31', '#665c86', '#4a4560', '#3a364d', '#5a5474'), water: ['#3a5ab5', '#2f4a98'] },
  house: { ...BR('#8a5a34', '#6e4626', '#2a180c', '#a87444', '#b4824e', '#946638', '#c8965e'), water: ['#4aa0d8', '#3a88c0'], planks: true },
  lighthouse: { ...BR('#e6dcc4', '#c8bca0', '#8a8068', '#f4ecd8', '#a8a49a', '#8a8678', '#c4c0b4'), water: ['#4aa0d8', '#3a88c0'], lighthouse: true },
  moondg: { ...BR('#5a6078', '#444a60', '#262a3c', '#7c84a2', '#4e5470', '#3e445c', '#6a7290'), water: ['#2a3a8a', '#222e70'] },
  moonmine: { ...BR('#4a4a74', '#383860', '#1e1e3a', '#6a6aa0', '#42426a', '#343456', '#5a5a8c'), water: ['#3a2a8a', '#2e2270'] },
  mooncastle: { ...BR('#8a8ab4', '#6c6c98', '#3e3e66', '#b0b0d8', '#605a88', '#4e4872', '#7a74a4'), water: ['#4a3aa8', '#3a2c90'] },
  train: { wagon: true, ...BR('#6a5a4a', '#54463a', '#2c231c', '#85705c', '#5a4a3c', '#463a2f', '#6e5c4a'), water: ['#3a5a88', '#2f4a70'] },
  moonpast: { g: '#cdb488', gd: '#b89c70', gl: '#dcc698', bl: '#e6d4aa', tree: 'deadtree', rock: ['#9a8a6a', '#7a6c52', '#c0b08a'], water: ['#3a3a5a', '#2c2c46'], ...BR('#9a8a6a', '#7e7054', '#544a38', '#b8a888', '#a89878', '#8e8062', '#c0b08c') },
  moon: { noChimney: true, roofC: ['#7d88a8', '#5d6786', '#b7c2dc'], wallC: ['#d9deea', '#aeb6cb', '#56607f', '#46506e'], g: '#b4b4c0', gd: '#a0a0b0', gl: '#c4c4d0', bl: '#d0d0dc', tree: 'deadtree', rock: ['#8a8a9a', '#6a6a7a', '#b0b0c0'], water: ['#2a2a4a', '#22223c'], ...BR('#8a8a9a', '#6e6e7e', '#4a4a58', '#a6a6b6', '#9a9aa8', '#84849a', '#b4b4c4') },
  lacrimora: { g: '#46527c', gd: '#35436d', gl: '#59618e', bl: '#8da1c9', tree: 'lacrystal', rock: ['#8b7cb2', '#665985', '#b8a4dc'], water: ['#c47fc4', '#e7aee0'], ...BR('#68658c', '#4e4b70', '#302e50', '#9288ba', '#514f78', '#3f3d68', '#706b9b') },
  abyss: { ...BR('#2e2a4e', '#24203e', '#120f22', '#423c6a', '#2a2644', '#201c36', '#363050'), water: ['#3a3aa8', '#2e2e90'] },
};
THEMES.castlefront = { style: 'court', ...THEMES.castleout, ...BR('#625879', '#39354f', '#272237', '#a396b8', '#514d68', '#39364f', '#77718e'), water: ['#3a5ab5','#2f4a98'] };
// Estilo de piso/parede de cada masmorra (os lugares de Lacrímora que copiam a mina herdam o estilo dela)
for (const [k, v] of Object.entries({ castle: 'castle', dforest: 'forest', dcrypt: 'crypt', dswamp: 'swamp', dmine: 'mine', dtide: 'tide', dsun: 'sun', dice: 'ice', moondg: 'metal', moonmine: 'crystal', mooncastle: 'lunar', abyss: 'abyss' })) THEMES[k].style = v;
// Cada bioma de Lacrímora: chão, árvore e as cores de telhado/parede das casas
// (mesmo desenho de casa do resto do jogo, só com a paleta da dimensão).
const lacPalette = {
  lacforest: ['#305c57','#234640','#477b6a','#8fcdb5','cedar',['#3f7f73','#2c5d55','#6fb3a0'],['#a58aa3','#86697f','#4e3a55','#5f4767']],
  lacmarsh: ['#355263','#293c52','#4a7184','#a3d9d6','mangrove',['#4a7ea6','#365d80','#79acd0'],['#9e95b4','#7f7596','#46405e','#575072']],
  lacash: ['#65505e','#4a3a47','#816575','#d7a281','burnt',['#8a4f5a','#683a45','#b87074'],['#a99083','#8a7266','#4a363a','#5c4448']],
  lacfungus: ['#58446b','#3c3356','#77608c','#d8a7df','fungus',['#a35c9e','#7c437a','#cf8bc6'],['#b49cb6','#937a96','#503c5a','#644a6e']],
  laccrystal: ['#414e79','#303d60','#576592','#9cceeb','quartz',['#6a62b0','#4f4888','#9a92dc'],['#a7a3c6','#8682a8','#403c62','#524d78']],
  lacroots: ['#475b48','#344238','#667955','#b5c99a','cedar',['#6b7f4a','#4f5f36','#97ad6c'],['#ab9a88','#8b7a69','#4a3e36','#5c4e44']],
};
for (const [name,[g,gd,gl,bl,tree,roofC,wallC]] of Object.entries(lacPalette)) {
  THEMES[name]={...THEMES.lacrimora,g,gd,gl,bl,tree:'lac-'+tree,roofC,wallC};
  THEMES[name+'cave']={...THEMES.dmine,...BR(gd,gd,'#201b32',gl,g,gd,bl),water:THEMES.lacrimora.water};
}
THEMES.lactower={lactowerIn:true,...THEMES.castle,...BR('#39324f','#272039','#171323','#5d5078','#62506f','#42394f','#79698a'),water:['#a45fd5','#773e9d']};
THEMES.lachome={...THEMES.house};
// Marélia (cidade submersa): areia azulada, corais, algas e cascos de navio.
const SEA_BASE = { sea: true, noChimney: true, rock: ['#5a7a94', '#44627a', '#7a9cb4'], water: ['#2a6aa8', '#2257a0'], tree: 'tree', kelp: ['#2f9a5a', '#46c27a'], ...BR('#48708a', '#385a72', '#1c3446', '#6a94ae', '#3b7f9a', '#2d6a86', '#58a0ba'),
  roofC: ['#e07aa0', '#b85a80', '#f4a8c4'], wallC: ['#e8dcc8', '#c9b8a0', '#5a6a8a', '#46506e'] };
THEMES.searreef = { g: '#3f86a2', gd: '#336f8a', gl: '#5aa4bf', bl: '#78bed6', ...SEA_BASE };
THEMES.seakelp = { g: '#337f86', gd: '#296a72', gl: '#4a9ea2', bl: '#68bcbc', ...SEA_BASE };
THEMES.seacave = { g: '#2f5c80', gd: '#254a69', gl: '#437aa0', bl: '#5c94bc', ...SEA_BASE, rock: ['#4a6684', '#38506c', '#6a88a8'] };
THEMES.seacurrent = { g: '#3b8cb0', gd: '#2f7494', gl: '#58a8cc', bl: '#7cc4e4', ...SEA_BASE };
THEMES.seawreck = { g: '#2e5f72', gd: '#244d5e', gl: '#437c92', bl: '#5c98ae', ...SEA_BASE, wreck: true };
THEMES.seatown = { g: '#4a98a8', gd: '#3b8190', gl: '#6ab4c2', bl: '#8cd0da', ...SEA_BASE };

// Interior das estações lunares: casco metálico, piso de grade e luzes frias.
THEMES.moonstation={style:'metal',...BR('#8d97b4','#6d7794','#2c3148','#b4bfdc','#5a6384','#4a5272','#7480a6'),water:['#2a3a8a','#222e70'],station:true};
THEMES.lighthouseTop = { ...THEMES.lighthouse, top: true };
const T = (name) => THEMES[name] || THEMES.plains;

// ---------------------------------------------------------------- tiles
// Chão do mundo: tom que varia suave (ruído contínuo entre tiles, em pontilhado ordenado) e detalhes do bioma:
// capim na grama, ondas de vento na areia, montinhos e brilho na neve, cascalho na montanha e lama no pântano.
const groundKind = (th) => th.groundKind || (th.tree === 'palm' || th.tree === 'cactus' ? 'sand' : th.tree === 'snowpine' ? 'snow' : th.tree === 'pine' ? 'rock' : th.tree === 'mangrove' ? 'swamp' : 'grass');
// O chão e o paredão de cada tile só dependem do tema e da posição do tile na tela (não dos vizinhos): o desenho
// pixel a pixel é feito uma vez por tema e posição, guardado numa folha do tamanho da sala, e depois só copiado.
const TILE_ATLAS = new Map();
function atlasTile(kind, raw, ctx, x, y, tx, ty, th) {
  if (typeof document === 'undefined' || x !== tx * 16 || y !== ty * 16 || tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return raw(ctx, x, y, tx, ty, th);
  let per = TILE_ATLAS.get(th); if (!per) { if (TILE_ATLAS.size > 64) TILE_ATLAS.clear(); TILE_ATLAS.set(th, per = {}); }
  let a = per[kind];
  if (!a) { const cv = document.createElement('canvas'); cv.width = COLS * 16; cv.height = ROWS * 16; a = per[kind] = { cv, cx: cv.getContext('2d'), done: new Uint8Array(COLS * ROWS) }; }
  const i = ty * COLS + tx;
  if (!a.done[i]) { a.cx.save(); a.cx.beginPath(); a.cx.rect(x, y, 16, 16); a.cx.clip(); raw(a.cx, x, y, tx, ty, th); a.cx.restore(); a.done[i] = 1; }   // recortado: o capim que passa da borda não suja o vizinho
  ctx.drawImage(a.cv, x, y, 16, 16, x, y, 16, 16);
}
const ground = (ctx, x, y, tx, ty, th) => atlasTile('g', groundRaw, ctx, x, y, tx, ty, th);
const MOON_KEY = {};
const moonGround = (ctx, x, y, tx, ty) => atlasTile('m', moonGroundRaw, ctx, x, y, tx, ty, MOON_KEY);
const cliff = (ctx, x, y, tx, ty, th) => atlasTile('c', cliffRaw, ctx, x, y, tx, ty, th);
export const clearTileAtlas = () => TILE_ATLAS.clear();
// Nos quadros de folga, adianta o chão (e o paredão das montanhas) do tema atual, alguns tiles por vez: quando o herói
// passa para a tela vizinha do mesmo tema, quase tudo já está pronto e a troca de tela não engasga.
const WARM = { theme: null, i: 0 };
export function warmTiles(theme, budgetMs = 1) {
  if (typeof document === 'undefined' || !theme || isDungeonTheme(theme)) return;
  if (WARM.theme !== theme) { WARM.theme = theme; WARM.i = 0; }
  if (WARM.i >= COLS * ROWS * 2) return;
  const th = T(theme), t0 = performance.now(), dummy = WARM.ctx || (WARM.ctx = document.createElement('canvas').getContext('2d'));
  while (WARM.i < COLS * ROWS * 2 && performance.now() - t0 < budgetMs) {
    const n = WARM.i++, cell = n % (COLS * ROWS), tx = cell % COLS, ty = (cell / COLS) | 0;
    if (n < COLS * ROWS) ground(dummy, tx * 16, ty * 16, tx, ty, th);
    else if (theme === 'mountain') cliff(dummy, tx * 16, ty * 16, tx, ty, th);
  }
}   // o celular pode apagar os canvas guardados ao ir para segundo plano
function groundRaw(ctx, x, y, tx, ty, th) {
  const kind = groundKind(th), base = th.g || th.floor;
  const tones = [th.gd, base, th.gl];
  for (let py = 0; py < 16; py++) for (let px = 0; px < 16; px++) {
    const wx = tx * 16 + px, wy = ty * 16 + py;
    let v = vnoise(wx, wy, 34, 31) * 0.75 + vnoise(wx, wy, 9, 32) * 0.25;
    if (kind === 'sand') v = v * 0.6 + (Math.sin(wy * 0.55 + Math.sin(wx * 0.07) * 3 + wx * 0.12) * 0.5 + 0.5) * 0.4;   // dunas
    const f = Math.max(0, Math.min(1.999, (v - 0.25) * 2.6)), k = Math.floor(f), dith = (f - k) * 16 > BAYER[(py % 4) * 4 + (px % 4)] ? 1 : 0;
    ctx.fillStyle = tones[Math.min(2, k + dith)]; ctx.fillRect(x + px, y + py, 1, 1);
  }
  const hh = (k) => hash(tx, ty, k);
  if (kind === 'grass' || kind === 'swamp') {
    // touceiras de capim com três tons (base escura, folha média, ponta clara)
    for (let i = 0; i < 2; i++) {
      if (hh(120 + i) > 0.6) continue;
      const gx = x + 2 + ((hh(122 + i) * 11) | 0), gy = y + 4 + ((hh(124 + i) * 9) | 0);
      R(ctx, gx, gy + 2, 5, 1, th.gd); R(ctx, gx, gy, 1, 2, th.gl); R(ctx, gx + 2, gy - 1, 1, 3, th.bl); R(ctx, gx + 4, gy, 1, 2, th.gl); R(ctx, gx + 1, gy + 1, 1, 1, th.gd); R(ctx, gx + 3, gy + 1, 1, 1, th.gd);
    }
    for (let i = 0; i < 3; i++) { const gx = x + ((hh(i + 40) * 14) | 0), gy = y + ((hh(i + 60) * 13) | 0); R(ctx, gx, gy, 1, 2, th.bl); R(ctx, gx + 1, gy + 1, 1, 1, th.gd); }
    if (kind === 'swamp' && hh(130) < 0.16) { const mx = x + 2 + ((hh(131) * 6) | 0), my = y + 4 + ((hh(132) * 6) | 0); R(ctx, mx + 1, my, 6, 4, '#4a4a2a'); R(ctx, mx, my + 1, 8, 2, '#4a4a2a'); R(ctx, mx + 2, my + 1, 3, 1, 'rgba(255,255,255,0.25)'); }
  } else if (kind === 'sand') {
    for (let i = 0; i < 3; i++) if (hh(140 + i) < 0.35) { const sx = x + ((hh(143 + i) * 14) | 0), sy = y + ((hh(146 + i) * 14) | 0); R(ctx, sx, sy, 1, 1, th.bl); R(ctx, sx + 1, sy, 1, 1, th.gd); }   // grãozinhos
    if (hh(150) < 0.05) { R(ctx, x + 6, y + 8, 3, 2, '#f4ece0'); R(ctx, x + 6, y + 10, 3, 1, th.gd); R(ctx, x + 7, y + 8, 1, 1, '#ffffff'); }   // conchinha
  } else if (kind === 'snow') {
    if (hh(160) < 0.25) { const sx = x + 2 + ((hh(161) * 8) | 0), sy = y + 4 + ((hh(162) * 8) | 0); R(ctx, sx, sy, 6, 1, '#ffffff'); R(ctx, sx - 1, sy + 1, 8, 1, '#ffffff'); R(ctx, sx, sy + 2, 6, 1, '#c8d4ea'); }   // montinho de neve
    for (let i = 0; i < 2; i++) if (hh(165 + i) < 0.3) R(ctx, x + ((hh(167 + i) * 15) | 0), y + ((hh(169 + i) * 15) | 0), 1, 1, '#ffffff');
  } else if (kind === 'rock') {
    for (let i = 0; i < 4; i++) if (hh(170 + i) < 0.5) { const sx = x + ((hh(174 + i) * 14) | 0), sy = y + ((hh(178 + i) * 14) | 0); R(ctx, sx, sy, 2, 1, th.rock ? th.rock[2] : th.gl); R(ctx, sx, sy + 1, 2, 1, th.rock ? th.rock[1] : th.gd); }
    if (hh(182) < 0.25) { const gx = x + 3 + ((hh(183) * 9) | 0), gy = y + 5 + ((hh(184) * 8) | 0); R(ctx, gx, gy, 1, 2, '#6a8a3a'); R(ctx, gx + 2, gy - 1, 1, 3, '#7a9a44'); }
  }
}
function path(ctx, x, y, tx, ty, tiles, th) {
  if (th && th.cobble) { // calçada de pedra clara com juntas, para o caminho real do castelo
    R(ctx, x, y, 16, 16, '#7e7996');
    for (let row = 0; row < 4; row++) for (let col = -1; col < 2; col++) {
      const ox = (row % 2 ? 4 : 0) + col * 8, tone = hash(tx * 3 + col, ty * 5 + row, 3) < 0.5 ? '#b6b2cc' : '#a8a4c0';
      const sx = Math.max(x, x + ox), ex = Math.min(x + 16, x + ox + 7); if (ex <= sx) continue;
      R(ctx, sx, y + row * 4, ex - sx, 3, tone); R(ctx, sx, y + row * 4, ex - sx, 1, '#d8d5ea'); R(ctx, sx, y + row * 4 + 2, ex - sx, 1, shadeHex(tone, 0.86));
      if (ox >= 0) R(ctx, x + ox, y + row * 4, 1, 1, '#7e7996');
      if (ox + 6 < 16) R(ctx, x + ox + 6, y + row * 4, 1, 1, '#7e7996');
    }
    R(ctx, x, y + 15, 16, 1, 'rgba(30,26,48,0.25)'); return;
  }
  R(ctx, x, y, 16, 16, '#d2b47c');
  // terra batida: manchas mais escuras em pontilhado e marcas de roda
  ctx.fillStyle = '#c4a46c';
  for (let py = 0; py < 16; py += 2) for (let px = (py >> 1) % 2; px < 16; px += 2) if (hash((tx * 16 + px) >> 2, (ty * 16 + py) >> 2, 71) < 0.3) ctx.fillRect(x + px, y + py, 1, 1);
  for (let i = 0; i < 9; i++) {
    const a = hash(tx, ty, i + 5), b = hash(tx, ty, i + 25);
    R(ctx, x + ((a * 15) | 0), y + ((b * 15) | 0), i % 3 ? 1 : 2, 1, i % 2 ? '#bf9f66' : '#e3c793');
  }
  // pedrinhas com brilho
  for (let i = 0; i < 2; i++) {
    if (hash(tx, ty, 60 + i) > 0.55) continue;
    const px = x + 2 + ((hash(tx, ty, 62 + i) * 11) | 0), py = y + 2 + ((hash(tx, ty, 64 + i) * 11) | 0);
    R(ctx, px, py, 3, 2, '#a8936a'); R(ctx, px, py, 2, 1, '#efdcae'); R(ctx, px + 1, py + 2, 2, 1, 'rgba(0,0,0,0.18)');
  }
  // borda suave com a grama (tufos invadindo o caminho)
  if (tiles && th && th.g) {
    const nb = (cx, cy) => (tiles[cy] ? tiles[cy][cx] : 'S');
    const grassy = (ch) => ch === '.' || ch === 'F' || ch === 'b' || ch === 'T';
    const edge = (fx, fy, w, h) => { for (let k = 0; k < Math.max(w, h); k += 2) { const ox = w > h ? k : 0, oy = w > h ? 0 : k; if (hash(tx * 3 + k, ty * 5 + w, 13) < 0.7) R(ctx, x + fx + ox, y + fy + oy, w > h ? 2 : 1 + ((hash(tx + k, ty, 14) * 2) | 0), w > h ? 1 + ((hash(tx + k, ty, 15) * 2) | 0) : 2, th.g); } };
    if (grassy(nb(tx, ty - 1))) edge(0, 0, 16, 1);
    if (grassy(nb(tx, ty + 1))) edge(0, 14, 16, 1);
    if (grassy(nb(tx - 1, ty))) edge(0, 0, 1, 16);
    if (grassy(nb(tx + 1, ty))) edge(14, 0, 1, 16);
  }
}
// Vagão por dentro: assoalho envernizado, passadeira vermelha com galões dourados, lambris de mogno,
// janelas com cortinas e a paisagem lá fora, arandelas acesas e corrimão de latão.
function trainFloor(ctx, x, y, tx, ty) {
  R(ctx, x, y, 16, 16, '#7a4a28');
  for (let k = 0; k < 4; k++) {
    const py = y + k * 4, tone = hash(tx, ty * 4 + k, 2) < 0.4 ? '#8a5a30' : '#966236';
    R(ctx, x, py, 16, 3, tone); R(ctx, x, py, 16, 1, '#b07a44'); R(ctx, x, py + 3, 16, 1, '#4a2c14');
    R(ctx, x + (((hash(tx, ty * 4 + k, 3) * 12) | 0) + 2), py, 1, 3, '#4a2c14');
    if (hash(tx * 2, ty * 4 + k, 4) < 0.3) R(ctx, x + 3 + ((hash(tx, ty + k, 5) * 8) | 0), py + 1, 3, 1, '#a86e3c');
  }
  if (tx % 5 === 2) {   // passadeira do corredor
    R(ctx, x + 2, y, 12, 16, '#8a1e28'); R(ctx, x + 3, y, 10, 16, '#a82a34');
    R(ctx, x + 3, y, 1, 16, '#e0b040'); R(ctx, x + 12, y, 1, 16, '#e0b040');
    const d = (ty % 2) * 8;
    for (let i = 0; i < 4; i++) { R(ctx, x + 8 - i, y + d + i, i * 2, 1, '#c8404a'); R(ctx, x + 8 - (3 - i), y + d + 4 + i, (3 - i) * 2, 1, '#c8404a'); }
    R(ctx, x + 7, y + d + 3, 2, 2, '#e0b040');
  }
}
function trainWall(ctx, x, y, tx, ty, below) {
  if (below !== undefined && below !== '#') {
    // lambri de mogno com friso de latão
    R(ctx, x, y, 16, 16, '#5a3018'); R(ctx, x, y, 16, 1, '#7a4422');
    for (let k = 0; k < 16; k += 8) { R(ctx, x + k + 1, y + 2, 6, 8, '#6a3a1e'); R(ctx, x + k + 1, y + 2, 6, 1, '#8a5430'); R(ctx, x + k + 1, y + 9, 6, 1, '#3a1e0c'); }
    R(ctx, x, y + 11, 16, 2, '#d8b04a'); R(ctx, x, y + 11, 16, 1, '#fff0a0'); R(ctx, x, y + 13, 16, 3, '#3a1e0c'); R(ctx, x, y + 13, 16, 1, '#5a3018');
    if (tx % 3 === 1) {
      // janela com a paisagem: céu, montanhas, campo e um poste de telégrafo
      R(ctx, x, y, 16, 11, '#c9a03a'); R(ctx, x + 1, y + 1, 14, 9, '#7a5a1e');
      R(ctx, x + 2, y + 1, 12, 8, '#8fd0f4'); R(ctx, x + 2, y + 1, 12, 3, '#bfe6ff');
      R(ctx, x + 2, y + 5, 5, 2, '#7a8ab8'); R(ctx, x + 4, y + 4, 2, 1, '#7a8ab8'); R(ctx, x + 9, y + 5, 5, 2, '#8a9ac4'); R(ctx, x + 10, y + 4, 2, 1, '#e8f0ff');
      R(ctx, x + 2, y + 7, 12, 2, '#4b8a3b'); R(ctx, x + 2, y + 7, 12, 1, '#6db352');
      R(ctx, x + 11, y + 3, 1, 5, '#5a3a22'); R(ctx, x + 10, y + 3, 3, 1, '#5a3a22');
      if (hash(tx, ty, 6) < 0.5) { R(ctx, x + 5, y + 2, 3, 1, '#ffffff'); R(ctx, x + 4, y + 3, 5, 1, '#ffffff'); }
      R(ctx, x + 7, y + 1, 2, 8, '#c9a03a'); R(ctx, x + 2, y + 1, 1, 8, 'rgba(255,255,255,0.35)');
      // cortinas presas
      R(ctx, x + 1, y + 1, 2, 9, '#a82a34'); R(ctx, x + 13, y + 1, 2, 9, '#8a1e28'); R(ctx, x + 1, y + 6, 3, 1, '#e0b040'); R(ctx, x + 12, y + 6, 3, 1, '#e0b040');
    } else if (tx % 3 === 2) {
      // arandela acesa
      R(ctx, x + 6, y + 5, 4, 1, '#c9a03a'); R(ctx, x + 7, y + 6, 2, 2, '#c9a03a'); R(ctx, x + 6, y + 2, 4, 3, '#ffe9a8'); R(ctx, x + 7, y + 2, 1, 2, '#fff8e0');
      ctx.globalAlpha = 0.18; R(ctx, x + 3, y, 10, 9, '#ffe0a0'); ctx.globalAlpha = 1;
    }
  } else {
    // parte de cima: bagageiro de latão e madeira escura
    R(ctx, x, y, 16, 16, '#2e180a'); R(ctx, x, y, 16, 1, '#5a3018');
    R(ctx, x, y + 6, 16, 1, '#c9a03a'); R(ctx, x, y + 10, 16, 1, '#8a6a1a');
    for (let k = 1; k < 16; k += 5) R(ctx, x + k, y + 6, 1, 5, '#8a6a1a');
    if (hash(tx, ty, 7) < 0.35) { R(ctx, x + 3, y + 2, 7, 4, '#6a4a2a'); R(ctx, x + 3, y + 2, 7, 1, '#8a6a42'); R(ctx, x + 5, y + 1, 3, 1, '#3a2a1a'); }   // mala
  }
}
function floor(ctx, x, y, tx, ty, th) {
  if (th.wagon) return trainFloor(ctx, x, y, tx, ty);
  if (th.planks) {
    // assoalho de tábuas
    R(ctx, x, y, 16, 16, th.floor);
    for (let k = 0; k < 4; k++) {
      R(ctx, x, y + k * 4 + 3, 16, 1, th.floorDark);
      const seam = x + (((hash(tx, ty * 4 + k, 3) * 12) | 0) + 2);
      R(ctx, seam, y + k * 4, 1, 3, th.floorDark);
      R(ctx, x, y + k * 4, 16, 1, th.floorHi);
    }
    if (hash(tx, ty, 8) < 0.3) R(ctx, x + 4 + ((hash(tx, ty, 9) * 8) | 0), y + 6, 1, 1, '#6e4626');
    return;
  }
  if (th.style && styledFloor(ctx, x, y, tx, ty, th)) return;
  R(ctx, x, y, 16, 16, th.floor);
  if ((tx + ty) % 2) { ctx.globalAlpha = 0.18; R(ctx, x, y, 16, 16, th.floorDark); ctx.globalAlpha = 1; }
  R(ctx, x + 2, y + 2, 5, 1, th.floorHi); R(ctx, x + 2, y + 2, 1, 5, th.floorHi);
  R(ctx, x + 10, y + 13, 4, 1, th.floorDark); R(ctx, x + 13, y + 10, 1, 4, th.floorDark);
  R(ctx, x, y, 16, 1, th.floorHi); R(ctx, x, y, 1, 16, th.floorHi);
  R(ctx, x, y + 15, 16, 1, th.floorDark); R(ctx, x + 15, y, 1, 16, th.floorDark);
  R(ctx, x + 8, y + 1, 1, 7, th.floorDark); R(ctx, x + 1, y + 8, 14, 1, th.floorDark);
  if (hash(tx, ty, 3) < 0.25) { const cx = x + 3 + ((hash(tx, ty, 4) * 8) | 0); R(ctx, cx, y + 10, 1, 3, th.floorDark); R(ctx, cx + 1, y + 12, 2, 1, th.floorDark); }
  if (th.moss && hash(tx, ty, 9) < 0.35) for (let i = 0; i < 4; i++) R(ctx, x + ((hash(tx, ty, 50 + i) * 14) | 0), y + ((hash(tx, ty, 60 + i) * 14) | 0), 2, 1, th.moss);
}
// Pisos com a cara de cada masmorra (usam as cores do tema, então as variações de Lacrímora continuam combinando)
function styledFloor(ctx, x, y, tx, ty, th) {
  const h = (k) => hash(tx, ty, 500 + k), f = th.floor, fd = th.floorDark, fh = th.floorHi;
  switch (th.style) {
    case 'castle': { // mármore em xadrez com bisel e veios, pontinhos dourados nos cantos
      const a = (tx + ty) % 2 ? f : shadeHex(fh, 1.04);
      R(ctx, x, y, 16, 16, a); R(ctx, x, y, 16, 1, shadeHex(fh, 1.15)); R(ctx, x, y, 1, 16, shadeHex(fh, 1.1)); R(ctx, x, y + 15, 16, 1, fd); R(ctx, x + 15, y, 1, 16, fd);
      if (h(1) < 0.22) { ctx.globalAlpha = 0.45; for (let i = 0; i < 5; i++) R(ctx, x + 3 + i * 2, y + 4 + i + ((h(2) * 3) | 0), 2, 1, shadeHex(a, 1.15)); ctx.globalAlpha = 1; }
      if ((tx + ty) % 2 === 0) { R(ctx, x + 14, y + 15, 2, 1, '#b8943a'); R(ctx, x + 15, y + 14, 1, 2, '#b8943a'); R(ctx, x + 15, y + 15, 1, 1, '#ffe08a'); }
      return true;
    }
    case 'court': case 'crypt': { // lajes grandes desencontradas, rachaduras e ossinhos (no pátio do castelo, sem ossos)
      R(ctx, x, y, 16, 16, th.mortar);
      for (let i = 0; i < 4; i++) { const sx = x + (i % 2) * 8, sy = y + (i >> 1) * 8, tone = hash(tx * 2 + (i % 2), ty * 2 + (i >> 1), 7) < 0.35 ? fd : f; R(ctx, sx, sy, 7, 7, tone); R(ctx, sx, sy, 7, 1, fh); R(ctx, sx, sy + 6, 7, 1, shadeHex(tone, 0.85)); }
      if (h(3) < 0.18) { R(ctx, x + 3, y + 5, 3, 1, th.mortar); R(ctx, x + 5, y + 6, 1, 3, th.mortar); R(ctx, x + 6, y + 9, 3, 1, th.mortar); }
      if (th.style === 'crypt' && h(4) < 0.06) { R(ctx, x + 9, y + 11, 4, 1, '#d8d4c4'); R(ctx, x + 9, y + 10, 1, 3, '#d8d4c4'); R(ctx, x + 12, y + 10, 1, 3, '#d8d4c4'); }
      return true;
    }
    case 'forest': { // terra batida com folhas, musgo e raízes
      R(ctx, x, y, 16, 16, f);
      for (let i = 0; i < 10; i++) R(ctx, x + ((h(10 + i) * 15) | 0), y + ((h(30 + i) * 15) | 0), 1 + (i % 2), 1, i % 3 ? fd : fh);
      if (h(5) < 0.3) { ctx.globalAlpha = 0.55; R(ctx, x + 2, y + 6, 10, 5, th.moss || '#4c7a34'); R(ctx, x + 4, y + 4, 6, 9, th.moss || '#4c7a34'); ctx.globalAlpha = 1; }
      if (h(6) < 0.25) { const ry = y + 3 + ((h(7) * 9) | 0); for (let i = 0; i < 16; i++) R(ctx, x + i, ry + Math.round(Math.sin(i * 0.6 + tx) * 1.5), 1, 1, '#5b3a22'); }
      if (h(8) < 0.35) for (let i = 0; i < 3; i++) R(ctx, x + ((h(40 + i) * 14) | 0), y + ((h(50 + i) * 14) | 0), 2, 1, ['#c8843a', '#e0a040', '#7aa84a'][i]);
      return true;
    }
    case 'swamp': { // pedras redondas com musgo nas frestas e poças
      R(ctx, x, y, 16, 16, th.moss || '#5a7a3a');
      for (const [sx, sy, w, hh] of [[1, 1, 7, 6], [9, 0, 6, 5], [8, 6, 7, 5], [0, 8, 7, 7], [8, 12, 6, 4]]) { const tone = hash(tx * 5 + sx, ty * 5 + sy, 9) < 0.4 ? fd : f; R(ctx, x + sx + 1, y + sy, w - 2, hh, tone); R(ctx, x + sx, y + sy + 1, w, hh - 2, tone); R(ctx, x + sx + 1, y + sy, w - 2, 1, fh); }
      if (h(2) < 0.12) { R(ctx, x + 3, y + 9, 8, 3, 'rgba(40,90,70,0.65)'); R(ctx, x + 4, y + 9, 3, 1, 'rgba(255,255,255,0.35)'); }
      return true;
    }
    case 'mine': case 'crystal': { // chão de terra com cascalho; às vezes tábuas
      R(ctx, x, y, 16, 16, f);
      if (h(1) < 0.12 && th.style === 'mine') { for (let k = 0; k < 4; k++) { R(ctx, x, y + k * 4, 16, 3, '#6a4a2e'); R(ctx, x, y + k * 4, 16, 1, '#8a6440'); R(ctx, x + ((h(60 + k) * 12) | 0) + 2, y + k * 4, 1, 3, '#4a321e'); } return true; }
      for (let i = 0; i < 8; i++) { const px = x + ((h(10 + i) * 14) | 0), py = y + ((h(30 + i) * 14) | 0); R(ctx, px, py, 2, 1, i % 2 ? fd : fh); if (i < 3) R(ctx, px, py + 1, 2, 1, shadeHex(fd, 0.8)); }
      if (h(5) < 0.08) { R(ctx, x + 6, y + 6, 3, 2, th.style === 'crystal' ? '#b48cff' : '#7af0ff'); R(ctx, x + 6, y + 6, 1, 1, '#ffffff'); }
      return true;
    }
    case 'tide': { // azulejos molhados; alguns com mosaico de onda
      R(ctx, x, y, 16, 16, th.mortar);
      for (let i = 0; i < 4; i++) { const sx = x + (i % 2) * 8, sy = y + (i >> 1) * 8; R(ctx, sx, sy, 7, 7, (i + tx + ty) % 2 ? f : fh); R(ctx, sx, sy, 3, 1, 'rgba(255,255,255,0.35)'); }
      if ((tx * 7 + ty * 3) % 11 === 0) { ctx.globalAlpha = 0.6; for (let k = 0; k < 16; k += 4) { R(ctx, x + k, y + 7, 2, 1, '#9fdcff'); R(ctx, x + k + 2, y + 8, 2, 1, '#9fdcff'); } ctx.globalAlpha = 1; }
      return true;
    }
    case 'sun': { // arenito em fiadas, areia acumulada e glifos gravados
      R(ctx, x, y, 16, 16, th.mortar);
      for (let row = 0; row < 2; row++) for (let k = -((row + ty) % 2) * 8; k < 16; k += 16) { const sx = Math.max(x, x + k), ex = Math.min(x + 16, x + k + 15); R(ctx, sx, y + row * 8, ex - sx, 7, row ? f : shadeHex(f, 1.05)); R(ctx, sx, y + row * 8, ex - sx, 1, fh); }
      if (h(2) < 0.15) { R(ctx, x + 5, y + 3, 1, 3, fd); R(ctx, x + 7, y + 3, 3, 1, fd); R(ctx, x + 7, y + 5, 3, 1, fd); R(ctx, x + 11, y + 2, 2, 2, fd); }
      if (h(3) < 0.3) { ctx.globalAlpha = 0.5; R(ctx, x + 1, y + 12, 14, 2, '#e8c890'); R(ctx, x + 4, y + 11, 8, 1, '#f0d8a0'); ctx.globalAlpha = 1; }
      return true;
    }
    case 'ice': { // gelo polido em placas com reflexo diagonal
      R(ctx, x, y, 16, 16, f); R(ctx, x, y, 16, 1, fh); R(ctx, x, y, 1, 16, fh); R(ctx, x, y + 15, 16, 1, fd); R(ctx, x + 15, y, 1, 16, fd);
      const k = ((tx * 3 + ty) % 4);
      for (let i = 0; i < 6; i++) R(ctx, x + 2 + i + k, y + 9 - i, 2, 1, 'rgba(255,255,255,0.55)');
      if (h(2) < 0.2) { R(ctx, x + 11, y + 3, 1, 3, '#ffffff'); R(ctx, x + 10, y + 4, 3, 1, '#ffffff'); }
      return true;
    }
    case 'metal': { // placas de metal com rebites e grade de ventilação
      R(ctx, x, y, 16, 16, f); R(ctx, x, y, 16, 1, fh); R(ctx, x, y, 1, 16, fh); R(ctx, x, y + 15, 16, 1, fd); R(ctx, x + 15, y, 1, 16, fd);
      for (const [rx, ry] of [[2, 2], [13, 2], [2, 13], [13, 13]]) { R(ctx, x + rx, y + ry, 1, 1, fh); R(ctx, x + rx + 1, y + ry + 1, 1, 1, fd); }
      if ((tx + ty * 3) % 5 === 0) { R(ctx, x + 4, y + 4, 8, 8, fd); for (let k = 5; k < 12; k += 2) R(ctx, x + 5, y + k, 6, 1, '#1e2234'); }
      return true;
    }
    case 'lunar': { // Castelo Lunar: losangos prateados com estrelinhas e, às vezes, uma lua crescente incrustada
      R(ctx, x, y, 16, 16, f);
      for (let i = 0; i < 8; i++) { R(ctx, x + 8 - i, y + i, i * 2, 1, (tx + ty) % 2 ? fh : shadeHex(f, 1.06)); R(ctx, x + 8 - (7 - i), y + 8 + i, (7 - i) * 2, 1, (tx + ty) % 2 ? fh : shadeHex(f, 1.06)); }
      R(ctx, x, y, 1, 1, '#e8e8ff'); R(ctx, x + 8, y + 8, 1, 1, '#bfe8ff');
      if (h(1) < 0.1) { R(ctx, x + 6, y + 5, 3, 6, '#e8c060'); R(ctx, x + 8, y + 5, 2, 6, (tx + ty) % 2 ? fh : shadeHex(f, 1.06)); R(ctx, x + 5, y + 6, 1, 4, '#e8c060'); }
      return true;
    }
    case 'abyss': { // lajes escuras com fendas violeta brilhando de leve e poeira de estrelas
      R(ctx, x, y, 16, 16, th.mortar);
      for (let i = 0; i < 4; i++) { const sx = x + (i % 2) * 8, sy = y + (i >> 1) * 8, tone = hash(tx * 2 + (i % 2), ty * 2 + (i >> 1), 7) < 0.4 ? fd : f; R(ctx, sx, sy, 7, 7, tone); R(ctx, sx, sy, 7, 1, fh); }
      if (h(1) < 0.22) { const cx = x + 2 + ((h(2) * 9) | 0), cy = y + 2 + ((h(3) * 9) | 0); ctx.globalAlpha = 0.65; R(ctx, cx, cy, 3, 1, '#b48cff'); R(ctx, cx + 2, cy + 1, 1, 2, '#b48cff'); R(ctx, cx + 3, cy + 3, 2, 1, '#8a5ad8'); ctx.globalAlpha = 1; }
      if (h(4) < 0.15) R(ctx, x + ((h(5) * 14) | 0), y + ((h(6) * 14) | 0), 1, 1, '#e8dcff');
      return true;
    }
  }
  return false;
}
// Detalhes da face da parede de cada masmorra (por cima dos tijolos)
function styledWallFace(ctx, x, y, tx, ty, th) {
  const h = (k) => hash(tx, ty, 600 + k);
  switch (th.style) {
    case 'castle': // pilastras a cada 4 tiles e rodapé de pedra lavrada
      R(ctx, x, y + 10, 16, 2, th.brickHi); R(ctx, x, y + 12, 16, 3, th.brickDark);
      if (tx % 4 === 0) { R(ctx, x + 4, y, 8, 15, th.brickDark); R(ctx, x + 5, y, 6, 15, th.brick); R(ctx, x + 5, y, 1, 15, th.brickHi); R(ctx, x + 3, y + 1, 10, 2, th.brickHi); R(ctx, x + 3, y + 12, 10, 3, th.brickHi); }
      break;
    case 'forest': // raízes e terra escorrendo
      for (let i = 0; i < 3; i++) { const rx = x + 2 + ((h(i) * 12) | 0), L = 4 + ((h(i + 5) * 8) | 0); R(ctx, rx, y, 1, L, '#5b3a22'); R(ctx, rx + 1, y + L - 2, 1, 2, '#5b3a22'); }
      break;
    case 'swamp': // lodo verde escorrendo
      for (let k = 0; k < 16; k += 3) { const L = 1 + ((h(k) * 5) | 0); R(ctx, x + k, y + 3, 2, L, '#5aa83a'); R(ctx, x + k, y + 3 + L, 1, 1, '#8ad85a'); }
      break;
    case 'mine': // escoras de madeira a cada 3 tiles
      if (tx % 3 === 1) { R(ctx, x + 5, y, 6, 16, '#6a4626'); R(ctx, x + 5, y, 1, 16, '#a8743e'); R(ctx, x + 10, y, 1, 16, '#3a2410'); R(ctx, x + 7, y + 4, 1, 1, '#4a4a56'); R(ctx, x + 7, y + 11, 1, 1, '#4a4a56'); }
      R(ctx, x, y + 2, 16, 3, '#6a4626'); R(ctx, x, y + 2, 16, 1, '#a8743e');
      break;
    case 'tide': // faixa de ondas em azulejo
      R(ctx, x, y + 6, 16, 4, '#2a6aa8'); for (let k = 0; k < 16; k += 6) { R(ctx, x + k, y + 7, 3, 1, '#7ac8f0'); R(ctx, x + k + 3, y + 8, 3, 1, '#7ac8f0'); }
      break;
    case 'sun': // faixa de hieróglifos azuis
      R(ctx, x, y + 5, 16, 6, shadeHex(th.brickDark, 0.85)); R(ctx, x, y + 5, 16, 1, th.brickHi);
      for (let k = 0; k < 3; k++) { const gx = x + 1 + k * 5; if (h(k) < 0.5) { R(ctx, gx, y + 7, 1, 3, '#2a5aa8'); R(ctx, gx + 1, y + 7, 2, 1, '#2a5aa8'); } else { R(ctx, gx, y + 7, 3, 1, '#2a5aa8'); R(ctx, gx + 1, y + 8, 1, 2, '#2a5aa8'); } }
      break;
    case 'ice': // brilho nos blocos e pingentes na base
      for (let i = 0; i < 5; i++) R(ctx, x + 2 + i, y + 7 - i, 1, 1, 'rgba(255,255,255,0.7)');
      for (let k = 1; k < 16; k += 4) R(ctx, x + k, y + 12, 1, 2 + ((h(k) * 3) | 0), '#e4f6ff');
      break;
    case 'lunar': // colunas prateadas com pedra-da-lua
      if (tx % 3 === 0) { R(ctx, x + 5, y, 6, 15, th.brickHi); R(ctx, x + 6, y, 1, 15, '#ffffff'); R(ctx, x + 10, y, 1, 15, th.brickDark); R(ctx, x + 7, y + 5, 2, 2, '#7af0ff'); }
      break;
    case 'metal': case 'crystal': // painéis com luzinha
      if (tx % 3 === 0) { R(ctx, x + 6, y + 4, 4, 3, '#1e2234'); R(ctx, x + 7, y + 5, 2, 1, th.style === 'crystal' ? '#b48cff' : '#7af0ff'); }
      break;
    case 'crypt': // nichos com caveira de vez em quando
      if (h(1) < 0.18) { R(ctx, x + 4, y + 3, 8, 8, '#1a1a20'); R(ctx, x + 5, y + 2, 6, 1, '#1a1a20'); R(ctx, x + 6, y + 6, 4, 4, '#d8d4c4'); R(ctx, x + 6, y + 7, 1, 1, '#1a1a20'); R(ctx, x + 9, y + 7, 1, 1, '#1a1a20'); }
      break;
  }
}
// Topo grosso das paredes: superfície contínua de pedra com borda clara só onde a parede termina
function wallTop(ctx, x, y, tx, ty, th, nb) {
  const wall = (c) => c === undefined || c === '#';
  R(ctx, x, y, 16, 16, th.brickDark);
  for (let i = 0; i < 6; i++) { const px = x + 1 + ((hash(tx, ty, 700 + i) * 13) | 0), py = y + 1 + ((hash(tx, ty, 710 + i) * 13) | 0); R(ctx, px, py, 2 + (i % 2), 1, i % 3 ? th.brick : th.mortar); }
  if (!wall(nb(tx, ty - 1))) { R(ctx, x, y, 16, 1, th.brickHi); R(ctx, x, y + 1, 16, 1, th.brick); }
  if (!wall(nb(tx - 1, ty))) { R(ctx, x, y, 1, 16, th.brickHi); R(ctx, x + 1, y, 1, 16, th.brick); }
  if (!wall(nb(tx + 1, ty))) { R(ctx, x + 15, y, 1, 16, th.mortar); R(ctx, x + 14, y, 1, 16, th.brick); }
  if (th.style === 'ice' && hash(tx, ty, 720) < 0.3) R(ctx, x + 5, y + 5, 3, 1, th.brickHi);
}
function bricks(ctx, x, y, tx, ty, th) {
  R(ctx, x, y, 16, 16, th.mortar);
  for (let row = 0; row < 4; row++) {
    const off = (row + ty) % 2 ? 4 : 0;
    for (let bx = -8; bx < 16; bx += 8) {
      const sx = Math.max(x, x + bx + off), ex = Math.min(x + 16, x + bx + off + 7);
      if (ex <= sx) continue;
      const shade = hash(tx * 4 + ((bx + 8) >> 3), ty * 4 + row, 7) < 0.3 ? th.brickDark : th.brick;
      R(ctx, sx, y + row * 4, ex - sx, 3, shade);
      R(ctx, sx, y + row * 4, ex - sx, 1, th.brickHi);
    }
  }
}
// Fachada do Castelo Silencioso: desenhada só sobre os tiles que são parede de verdade (linhas 0-3, menos o
// vestíbulo do portão nas colunas 7-12 das linhas 2-3); o pátio e os pilares dele ficam à mostra como são.
function drawCastleFacade(ctx) {
  const P = ['#26213a', '#4b4561', '#5e5778', '#706782', '#8c84a2', '#a69bb8', '#c4bad4'];
  const r = (x, y, w, h, c) => R(ctx, x, y, w, h, c);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 320, 32); ctx.rect(0, 32, 112, 32); ctx.rect(208, 32, 112, 32); ctx.clip();
  // muralha de blocos
  r(0, 0, 320, 64, P[1]);
  for (let row = 0, y = 0; y < 64; row++, y += 6) for (let x = row % 2 ? -8 : 0; x < 320; x += 16) {
    const tone = hash(x, y, 51) < 0.3 ? P[2] : P[3]; r(x + 1, y, 14, 5, tone); r(x + 1, y, 14, 1, P[4]); r(x + 1, y + 4, 14, 1, P[2]);
  }
  // torres redondas nas pontas (cilindro com luz da esquerda) e telhado cônico de ardósia
  for (const tx0 of [0, 260]) {
    const cols = [P[4], P[5], P[4], P[3], P[3], P[2], P[2], P[1]];
    for (let i = 0; i < 60; i++) { const k = Math.floor(i / 60 * cols.length); r(tx0 + i, 14, 1, 50, cols[k]); }
    for (let y = 18; y < 64; y += 6) for (let i = (y / 6) % 2 ? 4 : 0; i < 60; i += 10) r(tx0 + i, y, 1, 5, P[1]);
    for (let y = 18; y < 64; y += 6) r(tx0, y + 5, 60, 1, 'rgba(20,16,36,0.35)');
    for (let i = 0; i < 16; i++) { const w = Math.round(4 + i * 1.9); r(tx0 + 30 - w, i, w * 2, 1, i % 3 === 2 ? '#2e2a48' : '#3e3860'); r(tx0 + 30 - w, i, Math.max(2, Math.round(w * 0.6)), 1, '#5a5480'); }
    r(tx0 + 29, 0, 2, 3, '#d0b66b'); r(tx0 - 1, 14, 62, 3, P[0]); r(tx0 - 1, 14, 62, 1, P[5]);
    // seteiras com luz azul e estandarte com o brasão partido
    for (const sx of [tx0 + 10, tx0 + 46]) { r(sx, 22, 3, 12, P[0]); r(sx + 1, 23, 1, 9, '#9ad8e6'); }
    r(tx0 + 23, 18, 14, 2, '#d0b66b'); r(tx0 + 24, 20, 12, 22, '#7c3045'); r(tx0 + 26, 22, 8, 16, '#a94855'); r(tx0 + 24, 20, 2, 22, '#5a2032');
    r(tx0 + 27, 25, 6, 8, '#e0c879'); r(tx0 + 28, 26, 4, 6, '#5a355d'); r(tx0 + 29, 27, 1, 4, '#e0c879');
    r(tx0 + 24, 42, 5, 4, '#7c3045'); r(tx0 + 31, 42, 5, 4, '#7c3045');
    r(tx0 + 4, 50, 52, 2, P[5]); r(tx0 + 4, 52, 52, 2, P[0]);
  }
  // cortinas de muralha com ameias e vitrais góticos
  for (const wx of [60, 208]) {
    for (let x = wx + 2; x < wx + 52; x += 10) { r(x, 2, 6, 6, P[3]); r(x, 2, 6, 1, P[5]); r(x + 5, 2, 1, 6, P[1]); }
    r(wx, 8, 52, 3, P[0]); r(wx, 8, 52, 1, P[5]);
    const gx = wx === 60 ? wx + 14 : wx + 24;
    r(gx - 2, 15, 16, 30, P[0]); r(gx, 18, 12, 26, '#252337');
    for (let i = 0; i < 6; i++) r(gx + 6 - i, 13 + i, i * 2, 1, P[0]);
    r(gx + 1, 20, 10, 22, '#3a5a8a'); r(gx + 2, 21, 3, 20, '#7fb8d8'); r(gx + 7, 21, 3, 20, '#b48cff'); r(gx + 5, 21, 2, 20, '#d8c7eb');
    r(gx + 1, 29, 10, 1, '#252337'); r(gx + 1, 36, 10, 1, '#252337'); r(gx + 2, 24, 2, 2, '#e8f4ff');
    r(gx - 3, 45, 18, 3, P[5]); r(gx - 3, 47, 18, 1, P[1]);
    r(wx, 58, 52, 6, P[2]); r(wx, 58, 52, 1, P[4]);   // rodapé
  }
  // torre de menagem no meio: ameias altas, arco do portão com pedras de aduela, grade erguida e brasão
  r(112, 0, 96, 32, P[2]);
  for (let x = 114; x < 208; x += 12) { r(x, 0, 8, 5, P[4]); r(x, 0, 8, 1, P[6]); r(x + 7, 0, 1, 5, P[1]); }
  r(112, 5, 96, 2, P[0]); r(112, 5, 96, 1, P[5]);
  for (let row = 0, y = 8; y < 32; row++, y += 6) for (let x = 112 + (row % 2 ? 6 : 0); x < 208; x += 12) { r(x + 1, y, 10, 5, hash(x, y, 52) < 0.3 ? P[3] : P[4]); r(x + 1, y, 10, 1, P[5]); }
  // aduelas do arco
  for (let i = 0; i <= 12; i++) { const a = Math.PI * (i / 12); const ax = 160 - Math.cos(a) * 21, ay = 30 - Math.sin(a) * 21; r(Math.round(ax) - 3, Math.round(ay) - 3, 6, 6, i % 2 ? P[5] : P[4]); r(Math.round(ax) - 3, Math.round(ay) - 3, 6, 1, P[6]); }
  r(155, 6, 10, 6, '#c3ad68'); r(156, 7, 8, 4, '#e0c879');   // pedra-chave dourada
  // vão escuro do portão (continua no chão escuro da entrada logo abaixo)
  for (let y = 12; y < 32; y++) { const hw = y < 28 ? Math.round(Math.sqrt(Math.max(0, 256 - (28 - y) ** 2))) : 16; r(160 - hw, y, hw * 2, 1, y < 16 ? '#0c0a14' : '#171523'); }
  for (let x = 147; x < 175; x += 6) { r(x, 13, 2, 6, '#626076'); r(x, 19, 2, 2, '#8a8698'); }   // pontas da grade erguida
  r(146, 13, 28, 2, '#4a4658');
  // gárgulas nas laterais do portão
  for (const gx of [122, 190]) { r(gx, 14, 8, 7, P[1]); r(gx + 1, 12, 6, 4, P[3]); r(gx + 2, 13, 1, 1, '#e8344a'); r(gx + 5, 13, 1, 1, '#e8344a'); r(gx - 1, 20, 10, 3, P[0]); r(gx + 1, 21, 6, 1, P[5]); }
  // hera e musgo do castelo abandonado
  for (const [ix, iy, L] of [[64, 11, 14], [70, 11, 9], [252, 11, 12], [116, 7, 8], [200, 7, 10], [4, 17, 10], [312, 17, 14]]) for (let k = 0; k < L; k++) r(ix + (k % 3 === 1 ? 1 : 0), iy + k, 2, 1, k % 2 ? '#3a6a3a' : '#4c8a4a');
  ctx.restore();
  // vestíbulo do portão (chão de verdade): paredes laterais fazem sombra e um tapete leva até a porta
  r(112, 32, 96, 3, 'rgba(10,8,20,0.45)'); r(112, 32, 4, 32, 'rgba(10,8,20,0.35)'); r(204, 32, 4, 32, 'rgba(10,8,20,0.25)');
  r(146, 48, 28, 32, '#7c2a3a'); r(148, 48, 24, 32, '#9a3446'); r(146, 48, 2, 32, '#d0b66b'); r(172, 48, 2, 32, '#d0b66b');
  for (let y = 52; y < 80; y += 8) { r(158, y, 4, 4, '#d0b66b'); r(159, y + 1, 2, 2, '#9a3446'); }
}
// Paredão de rocha: pedras irregulares encaixadas (gomos com luz do alto à esquerda, contorno escuro nas frestas),
// posições sorteadas pela posição no mundo; musgo por cima nos biomas verdes.
function cliffRaw(ctx, x, y, tx, ty, th) {
  const [c, d, h] = th.rock;
  const pal = [shadeHex(d, 0.55), d, c, h, shadeHex(h, 1.15)];
  const lobes = [];
  for (let gy = -1; gy <= 1; gy++) for (let gx = -1; gx <= 1; gx++) {
    const cx = tx + gx, cy = ty + gy;
    for (let k = 0; k < 3; k++) {
      const lx = gx * 16 + (hash(cx, cy, 300 + k) * 16), ly = gy * 16 + (hash(cx, cy, 310 + k) * 16), r = 4.2 + hash(cx, cy, 320 + k) * 3.2;
      lobes.push([lx, ly, r, hash(cx, cy, 330 + k)]);
    }
  }
  for (let py = 0; py < 16; py++) for (let px = 0; px < 16; px++) {
    let best = null, bd = 1e9, second = 1e9;
    for (const l of lobes) { const dd = Math.hypot(px + 0.5 - l[0], py + 0.5 - l[1]) / l[2]; if (dd < bd) { second = bd; bd = dd; best = l; } else if (dd < second) second = dd; }
    let col;
    if (second - bd < 0.12 || bd > 1.15) col = pal[0];                         // fresta entre pedras
    else {
      const lit = -((px + 0.5 - best[0]) * 0.6 + (py + 0.5 - best[1]) * 0.8) / best[2] + (best[3] - 0.5) * 0.4;
      col = lit > 0.55 ? pal[4] : lit > 0.15 ? pal[3] : lit > -0.35 ? pal[2] : pal[1];
      if (hash(tx * 16 + px, ty * 16 + py, 340) < 0.05) col = pal[1];          // granulado
    }
    ctx.fillStyle = col; ctx.fillRect(x + px, y + py, 1, 1);
  }
  const mossy = th.moss || (th.tree === 'tree' || th.tree === 'darktree' || th.tree === 'mangrove' ? '#4c8a3c' : null);
  if (mossy && hash(tx, ty, 350) < 0.45) for (let i = 0; i < 5; i++) R(ctx, x + ((hash(tx, ty, 351 + i) * 14) | 0), y + ((hash(tx, ty, 356 + i) * 5) | 0), 2 + (i % 2), 1, i % 2 ? mossy : shadeHex(mossy, 1.25));
  R(ctx, x, y + 15, 16, 1, 'rgba(0,0,0,0.3)');
}
// Árvores: cada tipo vira um pequeno sprite 16x16 (3 variações) desenhado pixel a pixel uma vez só:
// copa em gomos redondos com luz do alto à esquerda, contorno escuro e textura de folhas.
const TREE_CACHE = new Map();
function treeCached(kind, v, draw) {
  const key = kind + v;
  let cv = TREE_CACHE.get(key);
  if (!cv) {
    cv = document.createElement('canvas'); cv.width = 16; cv.height = 16;
    const g = cv.getContext('2d'), grid = Array.from({ length: 16 }, () => Array(16).fill(null));
    draw(grid, v);
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) if (grid[yy][xx]) { g.fillStyle = grid[yy][xx]; g.fillRect(xx, yy, 1, 1); }
    TREE_CACHE.set(key, cv);
  }
  return cv;
}
// pinta gomos (círculos) numa grade com 5 tons: [contorno, sombra, meio, luz, brilho]
function paintLobes(grid, lobes, pal, seed = 0, outline = true) {
  const inside = (px, py) => lobes.some(([lx, ly, r]) => (px + 0.5 - lx) ** 2 + (py + 0.5 - ly) ** 2 <= r * r);
  const cells = [];
  for (let py = 0; py < 16; py++) for (let px = 0; px < 16; px++) {
    if (!inside(px, py)) continue;
    let best = null, bd = 1e9;
    for (const l of lobes) { const d = Math.hypot(px + 0.5 - l[0], py + 0.5 - l[1]) - l[2]; if (d < bd) { bd = d; best = l; } }
    const [lx, ly, r] = best, lv = -((px + 0.5 - lx) * 0.62 + (py + 0.5 - ly) * 0.85) / r;
    const edge = outline && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !inside(px + dx, py + dy));
    let k = edge ? 0 : lv > 0.5 ? 4 : lv > 0.12 ? 3 : lv > -0.38 ? 2 : 1;
    if (!edge && k > 1 && k < 4 && hash(px, py, 90 + seed) < 0.16) k -= 1;   // folhinhas escuras
    if (!edge && k === 1 && hash(px, py, 91 + seed) < 0.12) k = 2;
    cells.push([px, py, pal[k]]);
  }
  for (const [px, py, col] of cells) grid[py][px] = col;
}
const put1 = (grid, px, py, col) => { if (py >= 0 && py < 16 && px >= 0 && px < 16) grid[py][px] = col; };
const fillG = (grid, x, y, w, h, col) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) put1(grid, xx, yy, col); };
function trunk(grid, x0, y0, h, cols = ['#3a2412', '#5b3a22', '#7a5233', '#9a6a40']) {
  fillG(grid, x0 - 1, y0, 5, h, cols[0]); fillG(grid, x0, y0, 3, h, cols[1]); fillG(grid, x0, y0, 1, h, cols[2]);
  put1(grid, x0 - 2, y0 + h - 1, cols[0]); put1(grid, x0 + 4, y0 + h - 1, cols[0]); put1(grid, x0 - 1, y0 + h - 1, cols[1]); put1(grid, x0 + 3, y0 + h - 1, cols[1]);   // raízes
  put1(grid, x0 + 1, y0 + 1, cols[3]);
}
const LEAF = {
  tree: ['#173a1c', '#245524', '#2f7a30', '#4c9a43', '#7cc45e'],
  darktree: ['#0f2a16', '#1a3e20', '#23502a', '#356e34', '#4f8f46'],
  mangrove: ['#1c2a12', '#2a4220', '#3a5a2a', '#4e7a3a', '#6e9a4e'],
};
function treeSprite(ctx, x, y, tx, ty, kind) {
  R(ctx, x + 5, y + 13, 6, 1, 'rgba(0,0,0,0.12)'); R(ctx, x + 3, y + 14, 10, 1, 'rgba(0,0,0,0.18)'); R(ctx, x + 5, y + 15, 6, 1, 'rgba(0,0,0,0.12)');
  if (kind.startsWith('lac-')) { lacTree(ctx, x, y, tx, ty, kind); return; }
  const v = (hash(tx, ty, 2) * 3) | 0;
  let cv;
  switch (kind) {
    case 'lacrystal':
      R(ctx, x + 7, y + 9, 2, 6, '#8060a8'); R(ctx, x + 4, y + 5, 8, 7, '#4c75b6'); R(ctx, x + 2, y + 7, 12, 5, '#6552a0');
      R(ctx, x + 5, y + 2, 6, 6, '#6e9ed0'); R(ctx, x + 6, y + 1, 4, 4, '#8bd5e2'); R(ctx, x + 4, y + 4, 2, 4, '#b08ae0');
      R(ctx, x + 10, y + 6, 3, 3, '#bd91e8'); R(ctx, x + 11, y + 7, 1, 1, '#f2c8f2'); return;
    case 'cactus':
      cv = treeCached('cactus', v, (gr, v2) => {
        const O = '#1f4a26', D = '#2f6e3a', M = '#3c8a4a', L = '#5aa868', H = '#8ad09a';
        const col = (x0, y0, w, h) => { fillG(gr, x0 - 1, y0, w + 2, h, O); fillG(gr, x0, y0 - 1, w, h + 1, O); fillG(gr, x0, y0, w, h, M); fillG(gr, x0, y0, 1, h, L); fillG(gr, x0 + w - 1, y0, 1, h, D); };
        col(6, 2, 4, 13); col(2, 5 + v2, 3, 3); col(2, 8 + v2, 4, 2); col(11, 7 - v2, 3, 3); col(10, 9 - v2, 4, 2);
        fillG(gr, 7, 3, 1, 11, H); fillG(gr, 8, 3, 1, 11, '#4a9a58');
        for (let k = 0; k < 5; k++) put1(gr, 6 + (k % 2) * 3, 4 + k * 2, '#e8f0c8');                          // espinhos
        fillG(gr, 5, 15, 6, 1, '#8a6a3a');
        if (v2 === 2) { put1(gr, 7, 1, '#ff6a8a'); put1(gr, 8, 1, '#ff9ab0'); put1(gr, 7, 0, '#ff6a8a'); }      // flor
      }); break;
    case 'palm':
      cv = treeCached('palm', v, (gr, v2) => {
        const tk = ['#4a2e14', '#7a5028', '#a07038'];
        for (let r = 6; r < 16; r++) { const bx = 7 + Math.round(Math.sin((r - 6) * 0.35) * (v2 - 1)); put1(gr, bx - 1, r, tk[0]); put1(gr, bx, r, r % 2 ? tk[1] : tk[2]); put1(gr, bx + 1, r, tk[1]); put1(gr, bx + 2, r, tk[0]); }
        const fr = ['#1e5a28', '#2f8a3a', '#46b050', '#7ad078'];
        const frond = (pts) => pts.forEach(([px, py], i) => { put1(gr, px, py, i % 3 === 0 ? fr[3] : fr[2]); put1(gr, px, py + 1, fr[1]); put1(gr, px, py + 2, fr[0]); });
        frond([[7, 3], [6, 3], [5, 3], [4, 4], [3, 4], [2, 5], [1, 6], [1, 7]]);
        frond([[9, 3], [10, 3], [11, 3], [12, 4], [13, 4], [14, 5], [14, 6], [15, 7]]);
        frond([[7, 2], [6, 1], [5, 1], [4, 1], [3, 2]]); frond([[9, 2], [10, 1], [11, 1], [12, 1], [13, 2]]);
        frond([[6, 4], [5, 5], [4, 6], [4, 7], [3, 8]]); frond([[10, 4], [11, 5], [12, 6], [12, 7], [13, 8]]);
        fillG(gr, 7, 2, 3, 3, fr[2]); put1(gr, 7, 2, fr[3]);
        for (const [cx2, cy2] of [[7, 5], [9, 5], [8, 6]]) { put1(gr, cx2, cy2, '#6a4220'); put1(gr, cx2, cy2 - 1 + 1, '#8a5a2a'); }   // cocos
      }); break;
    case 'pine': case 'snowpine':
      cv = treeCached(kind, v, (gr, v2) => {
        const snow = kind === 'snowpine', P = snow ? ['#16302a', '#22463c', '#2e5e4e', '#3f7a64', '#5a9a7c'] : ['#0f2e1c', '#1a4a2c', '#24603a', '#2f7a46', '#4c9a5a'];
        fillG(gr, 7, 13, 2, 3, '#3a2412'); put1(gr, 7, 14, '#5b3a22'); put1(gr, 7, 15, '#5b3a22');
        const tiers = [[8, 6], [5, 6], [2, 5], [0, 4]];   // de baixo para cima: cada camada cobre o topo da de baixo
        for (const [a, h] of tiers) for (let i = 0; i < h; i++) {
          const half = 1 + i, yy = a + i, last = i === h - 1;
          for (let px = 8 - half; px < 8 + half; px++) {
            const edge = px === 8 - half || px === 8 + half - 1;
            put1(gr, px, yy, edge || last ? P[0] : px < 8 - half / 2 ? P[4 - (i > 2 ? 1 : 0)] : px < 8 ? P[3] : px < 8 + half / 2 ? P[2] : P[1]);
          }
          if (snow && i < 3) for (let px = 8 - half; px < 8 + Math.max(1, half - 2); px++) put1(gr, px, yy, px < 8 ? '#ffffff' : '#dce8f8');   // neve nos galhos
        }
        if (v2 === 1 && !snow) { put1(gr, 5, 8, '#8a5a2a'); put1(gr, 10, 11, '#8a5a2a'); }   // pinhas
      }); break;
    case 'deadtree':
      cv = treeCached('deadtree', v, (gr, v2) => {
        const O = '#241c1c', M = '#4a3e3a', L = '#6a5c56';
        const br = (pts) => pts.forEach(([px, py]) => { put1(gr, px, py, M); });
        fillG(gr, 6, 4, 4, 12, O); fillG(gr, 7, 4, 2, 12, M); fillG(gr, 7, 4, 1, 12, L);
        br([[6, 6], [5, 5], [4, 4], [4, 3], [3, 2], [5, 7]]); br([[9, 7], [10, 6], [11, 5], [12, 4], [12, 3], [13, 2]]);
        br([[8, 3], [8, 2], [9, 1]]); if (v2) br([[6, 9], [5, 9], [4, 8]]);
        for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) if (gr[yy][xx] === M && [[1, 0], [-1, 0], [0, -1]].some(([dx, dy]) => !gr[yy + dy]?.[xx + dx])) gr[yy][xx] = gr[yy][xx];
        put1(gr, 5, 15, O); put1(gr, 10, 15, O); put1(gr, 7, 8, '#1a1414'); put1(gr, 8, 11, '#1a1414');   // nó no tronco
      }); break;
    case 'mangrove':
      cv = treeCached('mangrove', v, (gr, v2) => {
        for (const [rx, rh] of [[3, 5], [12, 5], [5, 4], [10, 4]]) fillG(gr, rx, 16 - rh, 1, rh, '#4a3a24');
        fillG(gr, 7, 9, 2, 7, '#5a4a2c'); put1(gr, 7, 9, '#7a6a44');
        paintLobes(gr, [[8, 6, 5.5], [4, 7, 3.8], [12, 7, 3.8], [8, 3.5, 4]], LEAF.mangrove, v2);
        if (v2 === 2) { put1(gr, 5, 4, '#e8d0f0'); put1(gr, 11, 6, '#e8d0f0'); }
      }); break;
    default: {
      const dark = kind === 'darktree';
      cv = treeCached(dark ? 'darktree' : 'tree', v, (gr, v2) => {
        trunk(gr, 7, 11, 5);
        const lobes = v2 === 0 ? [[8, 6.2, 5.6], [4.4, 8, 3.9], [11.6, 8, 3.9], [8, 3.4, 3.6]]
          : v2 === 1 ? [[8, 6.5, 5.8], [4.8, 4.8, 3.6], [11, 5.2, 3.8], [8, 9.5, 4.2]]
            : [[7.6, 6, 5.4], [11.8, 7.6, 3.6], [4.2, 8.4, 3.4], [9.2, 3, 3.4]];
        paintLobes(gr, lobes, dark ? LEAF.darktree : LEAF.tree, v2);
        if (!dark && v2 === 1) for (const [ax, ay] of [[5, 5], [10, 8], [7, 9]]) { put1(gr, ax, ay, '#d23b3b'); put1(gr, ax, ay - 1, '#ff8a8a'); }   // maçãs
      });
    }
  }
  if (cv) ctx.drawImage(cv, x, y);
}
// Árvores de Lacrímora: um tile, sólidas e com o mesmo volume/sombreado das árvores do sobremundo.
const LAC_TREES = {
  'lac-cedar': ['#2f6a5e', '#4c9a83', '#22504a', '#8fd2c5'],
  'lac-mangrove': ['#3d7690', '#5e9cb6', '#2b5a70', '#a3d9d6'],
  'lac-quartz': ['#5a6fb3', '#86a6e0', '#414f8a', '#d8ecff'],
};
function lacTree(ctx, x, y, tx, ty, kind) {
  if (kind === 'lac-burnt') {
    // tronco fulminado com galhos e brasas
    R(ctx, x + 7, y + 3, 3, 12, '#3d303d'); R(ctx, x + 7, y + 3, 1, 12, '#5a4652');
    R(ctx, x + 3, y + 5, 4, 2, '#4a3846'); R(ctx, x + 3, y + 2, 2, 4, '#4a3846');
    R(ctx, x + 10, y + 7, 4, 2, '#4a3846'); R(ctx, x + 12, y + 4, 2, 4, '#4a3846');
    R(ctx, x + 6, y + 13, 5, 2, '#2c222c');
    if (hash(tx, ty, 2) < 0.5) { R(ctx, x + 3, y + 2, 1, 1, '#f0a060'); R(ctx, x + 13, y + 4, 1, 1, '#df975d'); }
    return;
  }
  if (kind === 'lac-fungus') {
    // cogumelo gigante: pé claro e chapéu com pintas
    R(ctx, x + 6, y + 8, 4, 7, '#d9c3d6'); R(ctx, x + 6, y + 8, 1, 7, '#f2e2ee'); R(ctx, x + 9, y + 8, 1, 7, '#a98aa6');
    R(ctx, x + 1, y + 4, 14, 5, '#a955a7'); R(ctx, x + 3, y + 2, 10, 3, '#c06fbc'); R(ctx, x + 5, y + 1, 6, 1, '#d48bce');
    R(ctx, x + 1, y + 8, 14, 1, '#753c82');
    R(ctx, x + 4, y + 3, 2, 2, '#f4d8e8'); R(ctx, x + 10, y + 5, 2, 2, '#f4d8e8'); R(ctx, x + 7, y + 2, 1, 1, '#f4d8e8');
    return;
  }
  const [c, hl, sh, glow] = LAC_TREES[kind] || LAC_TREES['lac-cedar'];
  // mesmo estilo das árvores do sobremundo (gomos sombreados com contorno), na paleta de Lacrímora
  const v = (hash(tx, ty, 2) * 3) | 0;
  ctx.drawImage(treeCached(kind, v, (gr, v2) => {
    trunk(gr, 7, 11, 5, ['#2e2228', '#59464b', '#8a6f78', '#a88e98']);
    if (kind === 'lac-mangrove') { fillG(gr, 3, 12, 1, 4, '#386878'); fillG(gr, 12, 12, 1, 4, '#386878'); }
    const lobes = v2 === 0 ? [[8, 6.2, 5.6], [4.4, 8, 3.9], [11.6, 8, 3.9], [8, 3.4, 3.6]] : v2 === 1 ? [[8, 6.5, 5.8], [4.8, 4.8, 3.6], [11, 5.2, 3.8], [8, 9.5, 4.2]] : [[7.6, 6, 5.4], [11.8, 7.6, 3.6], [4.2, 8.4, 3.4], [9.2, 3, 3.4]];
    paintLobes(gr, lobes, [shadeHex(sh, 0.6), sh, c, hl, glow], v2 + 3);
    if (kind === 'lac-quartz') { for (let k = 0; k < 4; k++) put1(gr, 10, 1 + k, glow); put1(gr, 5, 7, glow); put1(gr, 5, 8, glow); }
    else if (v2 === 1) { put1(gr, 10, 7, glow); put1(gr, 5, 5, glow); put1(gr, 10, 6, '#ffffff'); }
  }), x, y);
}
function water(ctx, x, y, tx, ty, th) {
  const [a, b] = th.water || THEMES.plains.water;
  R(ctx, x, y, 16, 16, a);
  // manchas mais fundas em pontilhado (sem costura entre tiles: o padrão segue a posição no mundo)
  ctx.fillStyle = b;
  for (let py = 0; py < 16; py += 2) for (let px = (py >> 1) % 2; px < 16; px += 2) if (hash((tx * 16 + px) >> 3, (ty * 16 + py) >> 2, 37) < 0.35) ctx.fillRect(x + px, y + py, 1, 1);
  // marolas em forma de onda (cristas claras com sombra embaixo)
  const hi = shadeHex(a, 1.28);
  for (let i = 0; i < 2; i++) {
    const wx = x + 1 + ((hash(tx, ty, i) * 9) | 0), wy = y + 3 + i * 7 + ((hash(tx, ty, i + 5) * 3) | 0);
    R(ctx, wx, wy + 1, 2, 1, hi); R(ctx, wx + 2, wy, 2, 1, hi); R(ctx, wx + 4, wy + 1, 2, 1, hi); R(ctx, wx + 1, wy + 2, 5, 1, b);
  }
  if (hash(tx, ty, 9) < 0.12) R(ctx, x + 3 + ((hash(tx, ty, 10) * 10) | 0), y + 5 + ((hash(tx, ty, 11) * 8) | 0), 1, 1, '#e8f4ff');
}
// Bloco de gelo das câmaras de gelo (paredes soltas e pilares no meio da sala), apoiado no próprio piso de gelo
function iceBlock(ctx, x, y, tx, ty) {
  // Cubo de gelo ocupando a peça inteira: sem sombra e sem fundo em volta. Topo claro, frente azul mais escura,
  // aresta brilhante entre os dois, brilho no canto e, às vezes, uma rachadura.
  R(ctx, x, y, 16, 9, '#bfe8fb'); R(ctx, x, y + 9, 16, 7, '#86bedc');
  R(ctx, x, y, 16, 1, '#e8f8ff'); R(ctx, x, y + 8, 16, 1, '#e8f8ff'); R(ctx, x, y + 15, 16, 1, '#6aa4c8');
  R(ctx, x, y, 1, 16, '#d8f2ff'); R(ctx, x + 15, y + 1, 1, 15, '#6aa4c8');
  R(ctx, x + 2, y + 2, 4, 1, '#ffffff'); R(ctx, x + 2, y + 3, 1, 2, '#ffffff'); R(ctx, x + 12, y + 10, 1, 3, '#b8e2f4');
  if (hash(tx, ty, 21) < 0.6) { R(ctx, x + 8, y + 10, 1, 2, '#5f96bc'); R(ctx, x + 9, y + 12, 1, 1, '#5f96bc'); R(ctx, x + 7, y + 9, 1, 1, '#5f96bc'); }
}

// Margem de todos os rios, lagos e mares, na pegada da praia: a borda continua o chão do lado (grama onde é grama,
// areia onde é areia ou caminho), ondulada, com a beira molhada mais escura, linha de espuma e água rasa mais clara;
// cantos de dentro arredondados. Nas masmorras (chão de pedra) fica só a espuma e a água rasa.
function coastalShore(ctx, x, y, tx, ty, th, tiles, themeName = 'coast') {
  const land = (xx, yy) => tiles[yy]?.[xx] !== undefined && !['W', 'Q', '=', 'I', 'v'].includes(tiles[yy][xx]);
  const stone = isDungeonTheme(themeName);
  const foam = '#eef8ff';
  // cor do chão vizinho: caminho é areia (ou calçada no castelo), o resto é o chão do lugar (grama, areia, neve...)
  const groundOf = (xx, yy) => { const c = tiles[yy]?.[xx]; return c === 'S' ? (th.cobble ? '#a8a4c0' : '#d2b47c') : (th.g || '#5a9e46'); };
  const side = (dx, dy, i, n) => {   // retângulo de 1 pixel de largura, n de profundidade a partir da borda
    if (dy < 0) return [x + i, y, 1, n]; if (dy > 0) return [x + i, y + 16 - n, 1, n];
    if (dx < 0) return [x, y + i, n, 1]; return [x + 16 - n, y + i, n, 1];
  };
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
    if (!land(tx + dx, ty + dy)) continue;
    const sand = groundOf(tx + dx, ty + dy), wet = shadeHex(sand, 0.8);
    for (let i = 0; i < 16; i++) {
      const wave = Math.sin(((dx ? ty : tx) * 16 + i) * 0.45) + Math.sin(((dx ? ty : tx) * 16 + i) * 0.17) * 0.6;
      const n = stone ? 0 : 2 + Math.round(wave * 0.7 + 0.4);
      ctx.globalAlpha = 0.28; R(ctx, ...side(dx, dy, i, n + 4), '#ffffff'); ctx.globalAlpha = 1;   // água rasa
      R(ctx, ...side(dx, dy, i, n + 1), foam);                                                   // espuma
      if (!stone) { R(ctx, ...side(dx, dy, i, n), wet); R(ctx, ...side(dx, dy, i, Math.max(1, n - 1)), sand); }
    }
  }
  // cantos de dentro: terra só na diagonal vira uma curvinha de areia com espuma
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    if (!land(tx + dx, ty + dy) || land(tx + dx, ty) || land(tx, ty + dy)) continue;
    const sand = groundOf(tx + dx, ty + dy), wet = shadeHex(sand, 0.8);
    const cx = dx < 0 ? x : x + 16, cy = dy < 0 ? y : y + 16;
    for (let py = 0; py < 6; py++) for (let px = 0; px < 6; px++) {
      const d = Math.hypot(px + 0.5, py + 0.5), X = dx < 0 ? cx + px : cx - 1 - px, Y = dy < 0 ? cy + py : cy - 1 - py;
      if (d < (stone ? 0 : 2.6)) R(ctx, X, Y, 1, 1, d < 1.8 ? sand : wet);
      else if (d < (stone ? 1.4 : 3.6)) R(ctx, X, Y, 1, 1, foam);
      else if (d < 5.8) { ctx.globalAlpha = 0.28; R(ctx, X, Y, 1, 1, '#ffffff'); ctx.globalAlpha = 1; }
    }
  }
}
// Pedra arredondada sombreada pixel a pixel (luz vindo do alto à esquerda)
function shadeHex(hex, k) { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; }
function boulder(ctx, x, y, tx, ty, base, opts = {}) {
  const cx = opts.cx ?? 7.5, cy = opts.cy ?? 8, rx = opts.rx ?? 6.8, ry = opts.ry ?? 6;
  const tones = [shadeHex(base, 0.55), shadeHex(base, 0.75), base, shadeHex(base, 1.18), shadeHex(base, 1.4)];
  { const sx = Math.round(x + cx), sy = Math.round(y + cy + ry - 1), w = Math.round(rx * 2 - 1); R(ctx, sx - Math.round(w * 0.3), sy, Math.round(w * 0.6), 1, 'rgba(0,0,0,0.16)'); R(ctx, sx - Math.round(w / 2), sy + 1, w, 1, 'rgba(0,0,0,0.22)'); R(ctx, sx - Math.round(w * 0.3), sy + 2, Math.round(w * 0.6), 1, 'rgba(0,0,0,0.14)'); }   // sombra oval
  for (let py = 0; py < 16; py++) for (let px = 0; px < 16; px++) {
    // borda levemente irregular
    const wob = (hash(tx * 31 + px, ty * 17 + py, 3) - 0.5) * 0.12;
    const nx = (px + 0.5 - cx) / rx, ny = (py + 0.5 - cy) / ry;
    const d2 = nx * nx + ny * ny;
    if (d2 > 1 + wob) continue;
    let tone;
    if (d2 > 0.86 + wob) tone = 0; // contorno escuro
    else {
      const light = -nx * 0.6 - ny * 0.8 + (1 - d2) * 0.5;
      tone = light > 0.75 ? 4 : light > 0.35 ? 3 : light > -0.15 ? 2 : 1;
      if (hash(tx * 13 + px, ty * 7 + py, 9) < 0.07 && tone > 1) tone--; // granulado
    }
    ctx.fillStyle = tones[tone]; ctx.fillRect(x + px, y + py, 1, 1);
  }
  if (opts.crack) {
    const k = '#1a1418';
    R(ctx, x + 7, y + 3, 1, 3, k); R(ctx, x + 8, y + 5, 1, 3, k); R(ctx, x + 6, y + 8, 2, 1, k); R(ctx, x + 5, y + 9, 1, 3, k); R(ctx, x + 9, y + 8, 1, 2, k); R(ctx, x + 10, y + 10, 1, 2, k);
  }
  if (opts.moss) for (let i = 0; i < 5; i++) R(ctx, x + 4 + ((hash(tx, ty, 40 + i) * 7) | 0), y + 2 + ((hash(tx, ty, 50 + i) * 3) | 0), 2, 1, opts.moss);
}
function rock(ctx, x, y, th, tx = 0, ty = 0) {
  const [c] = th.rock || THEMES.plains.rock;
  const small = hash(tx, ty, 21) < 0.35;
  boulder(ctx, x, y, tx, ty, c, small ? { cx: 8, cy: 9.5, rx: 5.5, ry: 4.6, moss: th.moss || (th.tree === 'tree' || th.tree === 'darktree' ? '#4c8a3a' : null) } : { moss: th.tree === 'darktree' ? '#3f7a34' : null });
}
function coastalReef(ctx, x, y, tx, ty, th, tiles) {
  const reefAt = (xx, yy) => tiles[yy]?.[xx] === 'Q';
  const n = reefAt(tx, ty - 1), s = reefAt(tx, ty + 1);
  const w = reefAt(tx - 1, ty), e = reefAt(tx + 1, ty);
  const base = (th.rock || THEMES.coast.rock)[0];
  const rim = shadeHex(base, 0.55), wet = shadeHex(base, 0.7);
  // A base une as pedras vizinhas e recorta as pontas livres da formação.
  for (let py = 0; py < 16; py++) for (let px = 0; px < 16; px++) {
    let edge = 2;
    if (n || s) {
      const gy = ty * 16 + py, cx = 7.5 + Math.sin(gy * 0.13 + tx) * 1.5;
      const cap = Math.min(n ? 1 : (py + 1) / 4, s ? 1 : (16 - py) / 4, 1);
      edge = Math.min(edge, Math.abs(px - cx) / ((5.6 + Math.sin(gy * 0.29) * 0.7) * cap));
    }
    if (w || e) {
      const gx = tx * 16 + px, cy = 7.5 + Math.sin(gx * 0.13 + ty) * 1.5;
      const cap = Math.min(w ? 1 : (px + 1) / 4, e ? 1 : (16 - px) / 4, 1);
      edge = Math.min(edge, Math.abs(py - cy) / ((5.6 + Math.sin(gx * 0.29) * 0.7) * cap));
    }
    if (edge <= 1) R(ctx, x + px, y + py, 1, 1, edge > 0.8 ? rim : wet);
  }
  const h = hash(tx, ty, 141), v = hash(tx, ty, 142);
  boulder(ctx, x, y, tx, ty, base, { cx: 6.5 + h * 3, cy: 6.5 + v * 3, rx: 4.5 + v, ry: 3.8 + h * 1.5 });
  const alongY = n || s || !(w || e);
  boulder(ctx, x, y, tx + 37, ty + 19, base, {
    cx: alongY ? 5 + v * 5 : h < 0.5 ? 2.8 : 12.2,
    cy: alongY ? h < 0.5 ? 2.8 : 12.2 : 5 + v * 5,
    rx: 2.7 + h, ry: 2.5 + v,
  });
}
export function bush(ctx, x, y, tx = 0, ty = 0) {
  // moita cheia: três tufos sombreados com folhas claras
  R(ctx, x + 4, y + 13, 8, 1, 'rgba(0,0,0,0.14)'); R(ctx, x + 2, y + 14, 12, 1, 'rgba(0,0,0,0.2)'); R(ctx, x + 4, y + 15, 8, 1, 'rgba(0,0,0,0.12)');
  for (const [cx, cy, r] of [[5, 9, 4.6], [11, 9, 4.6], [8, 6, 5]]) {
    for (let py = -6; py <= 6; py++) for (let px = -6; px <= 6; px++) {
      const d2 = (px * px + py * py) / (r * r);
      if (d2 > 1) continue;
      const light = -px * 0.5 - py * 0.8;
      ctx.fillStyle = d2 > 0.8 ? '#1f5a22' : light > 2 ? '#6cc060' : light > -1 ? '#3f8f3a' : '#2d6e2a';
      ctx.fillRect(x + cx + px, y + cy + py, 1, 1);
    }
  }
  for (let i = 0; i < 4; i++) R(ctx, x + 3 + ((hash(tx, ty, 70 + i) * 10) | 0), y + 3 + ((hash(tx, ty, 74 + i) * 8) | 0), 1, 1, '#a8e090');
}
// Casas: telhado de telhas em escama com cumeeira, beiral e oitões; parede de tábuas com cantoneiras,
// janela com floreira e porta com batente. Só a aparência depende dos vizinhos: os tiles (e a colisão) são os mesmos.
const WALLISH = new Set(['h', 'n', 'o', 'j']);
// Cada casa do campo tem seu jeito: cor e tipo de telhado, parede (madeira, reboco ou pedra) e chaminé ou não.
// O sorteio usa o canto de cima à esquerda da casa, então a casa inteira combina e é sempre a mesma.
const HOUSE_TILES = new Set(['r', 'h', 'n', 'o', 'j']);
const HOUSE_ROOFS = [['#b4433a', '#8f2f29', '#d0604f'], ['#4a6a9a', '#34507a', '#6a8ab8'], ['#4a8a4a', '#346a36', '#6aaa5a'], ['#8a5a3a', '#6a4028', '#aa7a52'], ['#7a4a8a', '#5a3468', '#9a6aaa'], ['#c8743a', '#a05428', '#e09450']];
const HOUSE_WALLS = [['#c89b62', '#a87d48', '#7a5230'], ['#9a6a42', '#7a5032', '#4e3420'], ['#e8e0cc', '#c8bca4', '#7a6a58'], ['#a8a8b0', '#86868e', '#5a5a64'], ['#e8d08a', '#c8b068', '#8a7240']];
let HOUSE_SEED = 0;
function houseTheme(th, tx, ty, nb) {
  if (th.roofC || th.noChimney) return th;   // casas com cor própria do lugar (Lua, Lacrímora...) ficam como estão
  let ax = tx, ay = ty, g = 0;
  while (HOUSE_TILES.has(nb(ax, ay - 1)) && g++ < 12) ay--;
  while (HOUSE_TILES.has(nb(ax - 1, ay)) && g++ < 24) ax--;
  let w = 1; while (HOUSE_TILES.has(nb(ax + w, ay)) && w < 12) w++;
  const hx0 = ax + HOUSE_SEED * 17;   // a mesma posição em telas diferentes dá casas diferentes
  const wi = Math.floor(hash(hx0, ay, 302) * HOUSE_WALLS.length);
  return { ...th, roofC: HOUSE_ROOFS[Math.floor(hash(hx0, ay, 301) * HOUSE_ROOFS.length)], wallC: HOUSE_WALLS[wi], wallStyle: wi === 3 ? 'stone' : wi === 2 ? 'plaster' : 'wood',
    roofStyle: Math.floor(hash(hx0, ay, 303) * 3), chimney: hash(hx0, ay, 304) < 0.65 && w >= 3 ? [ax + 1 + Math.floor(hash(hx0, ay, 305) * (w - 2)), ay] : null };
}
function roof(ctx, x, y, th, tx = 0, ty = 0, nb = () => undefined) {
  const [c, d, h] = th?.roofC || ['#b4433a', '#8f2f29', '#d0604f'];
  const top = nb(tx, ty - 1) !== 'r', bottom = nb(tx, ty + 1) !== 'r', left = nb(tx - 1, ty) !== 'r', right = nb(tx + 1, ty) !== 'r';
  const dd = shadeHex(d, 0.72), hh = shadeHex(h, 1.12);
  R(ctx, x, y, 16, 16, c);
  if (th?.roofStyle === 1) {   // sapê: palha em fileiras com fios soltos
    for (let r = 0; r < 4; r++) { const ry = y + r * 4; R(ctx, x, ry, 16, 3, shadeHex(c, 1.02 - r * 0.03)); R(ctx, x, ry + 3, 16, 1, d); for (let k = 0; k < 16; k += 2) R(ctx, x + k + ((r + ty) % 2), ry + 1 + ((k * 3 + tx) % 2), 1, 2, k % 4 ? h : shadeHex(c, 0.85)); }
  } else if (th?.roofStyle === 2) {   // ardósia: placas retangulares desencontradas
    for (let r = 0; r < 4; r++) { const ry = y + r * 4, off = (r + ty) % 2 ? 0 : 3; R(ctx, x, ry, 16, 3, shadeHex(c, 1.03 - r * 0.02)); R(ctx, x, ry + 3, 16, 1, d); for (let k = off; k < 16; k += 6) R(ctx, x + k, ry, 1, 3, d); R(ctx, x, ry, 16, 1, h); }
  } else
  // fileiras de telhas arredondadas, com sombra embaixo de cada fileira e brilho em cima
  for (let r = 0; r < 4; r++) {
    const ry = y + r * 4, off = (r + ty) % 2 ? 2 : 6, rowK = bottom && !top ? 1.08 - r * 0.07 : 1.04 - r * 0.03;
    R(ctx, x, ry, 16, 3, shadeHex(c, rowK));
    R(ctx, x, ry + 3, 16, 1, d);
    for (let k = off - 8; k < 16; k += 8) { if (k + 1 >= 0 && k + 1 < 16) R(ctx, x + k + 1, ry + 2, 1, 1, d); if (k + 5 >= 0 && k + 5 < 16) R(ctx, x + k + 5, ry + 2, 1, 1, d); }   // telha arredondada
    for (let k = off - 8; k < 16; k += 8) {
      const sx = x + k;
      if (k >= 0 && k < 16) R(ctx, sx, ry, 1, 3, d);
      R(ctx, Math.max(x, sx + 1), ry, Math.max(0, Math.min(6, x + 16 - sx - 1) - Math.max(0, x - sx - 1)), 1, h);
      if (sx + 6 >= x && sx + 6 < x + 16) R(ctx, sx + 6, ry + 1, 1, 2, shadeHex(c, 0.88));
    }
    if (hash(tx * 7 + r, ty, 41) < 0.18) R(ctx, x + 2 + ((hash(tx, ty * 3 + r, 42) * 10) | 0), ry + 1, 3, 2, shadeHex(c, 0.9));   // telha mais velha
  }
  if (top) { R(ctx, x, y, 16, 2, dd); R(ctx, x, y, 16, 1, hh); for (let k = 2; k < 16; k += 4) R(ctx, x + k, y + 1, 1, 1, h); }   // cumeeira
  if (bottom) { R(ctx, x, y + 13, 16, 2, dd); R(ctx, x, y + 15, 16, 1, 'rgba(0,0,0,0.45)'); R(ctx, x, y + 13, 16, 1, h); }        // beiral
  if (left) { R(ctx, x, y, 2, 16, dd); R(ctx, x + 2, y, 1, 16, hh); }                                                          // oitões
  if (right) { R(ctx, x + 14, y, 2, 16, dd); R(ctx, x + 13, y, 1, 16, shadeHex(d, 0.9)); }
  // chaminé: só em algumas casas, uma por casa, de pedra com contorno, tijolos, beiral de cima e a boca escura
  const hasChimney = th?.chimney ? (th.chimney[0] === tx && th.chimney[1] === ty) : (th?.chimney === undefined && top && !left && !right && !th?.noChimney && hash(tx, ty, 43) < 0.28);
  if (hasChimney) {
    const cx = x + 8, cy = y + 1, O = '#2a1a16';
    R(ctx, cx + 1, cy + 9, 6, 2, 'rgba(0,0,0,0.28)');                                   // sombra no telhado
    R(ctx, cx - 1, cy + 1, 7, 9, O);                                                      // contorno
    R(ctx, cx, cy + 2, 5, 7, '#9a5e48'); R(ctx, cx, cy + 2, 1, 7, '#c07a5e'); R(ctx, cx + 4, cy + 2, 1, 7, '#6e3e2e');
    R(ctx, cx + 1, cy + 4, 3, 1, '#6e3e2e'); R(ctx, cx, cy + 6, 2, 1, '#6e3e2e'); R(ctx, cx + 3, cy + 6, 2, 1, '#6e3e2e'); R(ctx, cx + 2, cy + 3, 1, 1, '#6e3e2e'); R(ctx, cx + 1, cy + 7, 1, 1, '#6e3e2e');
    R(ctx, cx - 2, cy - 1, 9, 3, O); R(ctx, cx - 1, cy, 7, 1, '#9a9aa8'); R(ctx, cx - 1, cy + 1, 7, 1, '#6a6a78');   // beiral de cima
    R(ctx, cx + 1, cy, 3, 1, '#1a1210');                                                  // boca
  }
}
function woodWall(ctx, x, y, th, tx = 0, ty = 0, nb = () => undefined) {
  const [c, d, e] = th?.wallC || ['#c89b62', '#a87d48', '#7a5230'];
  const left = !WALLISH.has(nb(tx - 1, ty)), right = !WALLISH.has(nb(tx + 1, ty));
  R(ctx, x, y, 16, 16, c);
  if (th?.wallStyle === 'stone') {   // pedras assentadas, desencontradas
    for (let k = 0; k < 4; k++) { const py = y + 2 + k * 3, off = (k + ty) % 2 ? 0 : 4; R(ctx, x, py + 2, 16, 1, d); for (let q = off; q < 16; q += 8) R(ctx, x + q, py, 1, 2, d); R(ctx, x, py, 16, 1, shadeHex(c, 1.1)); }
  } else if (th?.wallStyle === 'plaster') {   // reboco liso com manchinhas e vigas de madeira aparentes
    for (let k = 0; k < 3; k++) R(ctx, x + 2 + ((hash(tx, ty * 3 + k, 47) * 11) | 0), y + 4 + ((hash(tx * 5, ty + k, 48) * 7) | 0), 2, 1, shadeHex(c, 0.94));
    R(ctx, x, y + 7, 16, 1, '#7a5230'); if (hash(tx, ty, 49) < 0.5) R(ctx, x + 7, y + 2, 1, 11, '#7a5230');
  } else
  // tábuas na horizontal com veios e pregos
  for (let k = 0; k < 4; k++) {
    const py = y + 2 + k * 3;
    R(ctx, x, py + 2, 16, 1, d); R(ctx, x, py, 16, 1, shadeHex(c, 1.08));
    const seam = x + 2 + ((hash(tx, ty * 5 + k, 44) * 12) | 0); R(ctx, seam, py, 1, 2, d);
    if (hash(tx * 3 + k, ty, 45) < 0.4) R(ctx, x + 3 + ((hash(tx, ty + k, 46) * 9) | 0), py + 1, 2, 1, shadeHex(c, 0.92));
  }
  R(ctx, x, y, 16, 2, 'rgba(0,0,0,0.38)');                       // sombra do beiral
  R(ctx, x, y + 13, 16, 3, e); R(ctx, x, y + 13, 16, 1, shadeHex(e, 1.25));   // rodapé de pedra/madeira escura
  for (let k = 1; k < 16; k += 5) R(ctx, x + k, y + 14, 3, 1, shadeHex(e, 0.8));
  if (left) { R(ctx, x, y, 3, 16, e); R(ctx, x, y, 1, 16, shadeHex(e, 1.3)); R(ctx, x + 3, y, 1, 16, 'rgba(0,0,0,0.15)'); }
  if (right) { R(ctx, x + 13, y, 3, 16, e); R(ctx, x + 15, y, 1, 16, shadeHex(e, 0.7)); }
}
function houseWindow(ctx, x, y, th, tx, ty, nb, lit = '#ffd77a') {
  woodWall(ctx, x, y, th, tx, ty, nb);
  const fr = th.wallC?.[2] || '#5b3a22', shut = th.roofC?.[1] || '#8f2f29';
  R(ctx, x + 1, y + 3, 3, 9, shut); R(ctx, x + 12, y + 3, 3, 9, shut);                    // venezianas
  for (let k = 0; k < 4; k++) { R(ctx, x + 1, y + 4 + k * 2, 3, 1, shadeHex(shut, 0.75)); R(ctx, x + 12, y + 4 + k * 2, 3, 1, shadeHex(shut, 0.75)); }
  R(ctx, x + 4, y + 3, 8, 9, fr); R(ctx, x + 5, y + 4, 6, 7, lit); R(ctx, x + 5, y + 4, 6, 2, shadeHex(lit, 1.15));
  R(ctx, x + 7, y + 4, 2, 7, fr); R(ctx, x + 5, y + 7, 6, 1, fr); R(ctx, x + 5, y + 4, 2, 1, '#ffffff');
  // floreira com flores
  R(ctx, x + 3, y + 11, 10, 2, '#8a5a34'); R(ctx, x + 3, y + 11, 10, 1, '#b07a44');
  for (let k = 0; k < 4; k++) R(ctx, x + 4 + k * 2, y + 10, 1, 1, ['#ff6b8a', '#ffd93b', '#ffffff', '#c38bff'][(k + tx + ty) % 4]);
  R(ctx, x + 5, y + 10, 1, 1, '#4a9a36'); R(ctx, x + 9, y + 10, 1, 1, '#4a9a36');
}
function houseDoor(ctx, x, y, th, tx, ty, nb) {
  woodWall(ctx, x, y, th, tx, ty, nb);
  const fr = th.wallC?.[2] || '#5b3a22', wood = th.wallC?.[3] || '#6b4226';
  R(ctx, x + 2, y + 3, 12, 13, shadeHex(fr, 0.8)); R(ctx, x + 3, y + 2, 10, 1, shadeHex(fr, 0.8));      // batente com arco
  R(ctx, x + 3, y + 4, 10, 12, wood); R(ctx, x + 4, y + 3, 8, 1, wood);
  for (let k = 5; k < 12; k += 3) R(ctx, x + k, y + 4, 1, 12, shadeHex(wood, 0.78));
  R(ctx, x + 3, y + 4, 1, 12, shadeHex(wood, 1.2)); R(ctx, x + 4, y + 3, 8, 1, shadeHex(wood, 1.25));
  R(ctx, x + 3, y + 7, 10, 1, '#4a4a56'); R(ctx, x + 3, y + 12, 10, 1, '#4a4a56');                       // dobradiças de ferro
  R(ctx, x + 10, y + 9, 2, 2, '#e8c060'); R(ctx, x + 10, y + 9, 1, 1, '#fff0a0');                        // maçaneta
  R(ctx, x + 6, y + 5, 4, 1, shadeHex(wood, 0.6));                                                       // olho mágico
}
function flowers(ctx, x, y, tx, ty) {
  const cols = [['#ff6b6b', '#c83a4a'], ['#ffd93b', '#d8a020'], ['#ffffff', '#c8c8dc'], ['#c38bff', '#8a5ad0'], ['#ff9ad0', '#d8609a']];
  for (let i = 0; i < 3; i++) {
    const fx = x + 3 + ((hash(tx, ty, i + 70) * 10) | 0), fy = y + 3 + ((hash(tx, ty, i + 80) * 9) | 0);
    const [c, d] = cols[(hash(tx, ty, i + 90) * cols.length) | 0];
    R(ctx, fx, fy + 2, 1, 3, '#2f7a2a'); R(ctx, fx + 1, fy + 3, 2, 1, '#4caa3c'); R(ctx, fx - 1, fy + 4, 1, 1, '#4caa3c');   // caule e folhas
    R(ctx, fx - 1, fy, 3, 1, c); R(ctx, fx, fy - 1, 1, 3, c); R(ctx, fx - 1, fy + 1, 1, 1, d); R(ctx, fx + 1, fy + 1, 1, 1, d);
    R(ctx, fx, fy, 1, 1, '#f5a623');
  }
}
// Estado dos pilares de cor (0: vermelhos erguidos, 1: azuis erguidos)
let PEG = 0;
export const setPegState = (v) => { PEG = v; };
function peg(ctx, x, y, color, raised, th) {
  const [c, d, h] = color === 'red' ? ['#d8384a', '#8a1a2a', '#ff8a9a'] : ['#3a6ae0', '#1a347a', '#9ac0ff'];
  floor(ctx, x, y, 0, 0, th);
  if (raised) {
    R(ctx, x + 2, y + 13, 12, 3, 'rgba(0,0,0,0.35)');
    R(ctx, x + 2, y + 1, 12, 13, d); R(ctx, x + 3, y + 1, 10, 10, c); R(ctx, x + 3, y + 1, 10, 2, h); R(ctx, x + 6, y + 4, 4, 4, h);
  } else {
    R(ctx, x + 2, y + 6, 12, 6, d); R(ctx, x + 3, y + 7, 10, 4, c); R(ctx, x + 4, y + 8, 8, 1, h);
  }
}
const DUNGEON_THEMES = new Set(['lighthouseTop', 'dforest', 'dcrypt', 'dswamp', 'dmine', 'dtide', 'dsun', 'dice', 'castle', 'abyss', 'train', 'moondg', 'moonmine', 'mooncastle', 'house', 'lighthouse', 'lachome', 'lactower', 'moonstation', ...Object.keys(lacPalette).map(name=>name+'cave')]);
const isDungeonTheme = (n) => DUNGEON_THEMES.has(n);
// ---------------------------------------------------------------- móveis das casas
function woodPanel(ctx, x, y, th) {
  // papel de parede listrado com florzinhas em cima, lambri de madeira embaixo
  R(ctx, x, y, 16, 9, '#c8a878'); for (let k = 0; k < 16; k += 4) R(ctx, x + k, y, 2, 9, '#b8946a');
  R(ctx, x + 2, y + 3, 1, 1, '#a85a4a'); R(ctx, x + 10, y + 6, 1, 1, '#a85a4a'); R(ctx, x, y, 16, 1, '#8a6a48');
  R(ctx, x, y + 9, 16, 1, '#e0b878'); R(ctx, x, y + 10, 16, 6, '#7a4e2a');
  for (let k = 0; k < 16; k += 8) { R(ctx, x + k + 1, y + 11, 6, 3, '#8a5a32'); R(ctx, x + k + 1, y + 11, 6, 1, '#a87444'); }
  R(ctx, x, y + 14, 16, 2, '#4a2c14');
}
function stationFurniture(ctx, ch, x, y, tx, ty) {
  const sh = () => R(ctx, x + 1, y + 13, 14, 3, 'rgba(0,0,0,0.3)');
  switch (ch) {
    case 'q': // beliche com cobertor térmico
      sh(); R(ctx, x + 1, y + 1, 14, 14, '#3a4258'); R(ctx, x + 2, y + 2, 12, 4, '#e6ecf6'); R(ctx, x + 3, y + 3, 10, 2, '#ffffff');
      R(ctx, x + 2, y + 6, 12, 8, ['#d8803a', '#3a7ad0', '#4aa88a'][(tx + ty) % 3]); R(ctx, x + 2, y + 6, 12, 1, 'rgba(255,255,255,0.4)'); R(ctx, x + 1, y + 14, 14, 1, '#1c2030'); return;
    case 'd': // console com tela acesa
      sh(); R(ctx, x, y + 4, 16, 9, '#4a536e'); R(ctx, x, y + 4, 16, 2, '#7480a6'); R(ctx, x + 1, y + 12, 14, 1, '#1c2030');
      R(ctx, x + 2, y, 12, 6, '#1c2030'); R(ctx, x + 3, y + 1, 10, 4, '#2a6a8a'); R(ctx, x + 4, y + 2, 4, 1, '#9ff4ff'); R(ctx, x + 4, y + 3, 6, 1, '#6ad0e8'); R(ctx, x + 11, y + 2, 1, 2, '#ffe9a8');
      R(ctx, x + 3, y + 8, 3, 2, '#ff8a2a'); R(ctx, x + 8, y + 8, 5, 2, '#2c3148'); return;
    case 'l': // rack de dados
      R(ctx, x, y, 16, 16, '#1c2030'); R(ctx, x + 1, y + 1, 14, 14, '#4a536e');
      for (let r = 0; r < 4; r++) { R(ctx, x + 2, y + 2 + r * 3, 12, 2, '#2c3148'); R(ctx, x + 3, y + 2 + r * 3, 2, 1, ['#9ff4ff', '#ffe9a8', '#8aff9a', '#ff8a8a'][(tx + r) % 4]); R(ctx, x + 10, y + 2 + r * 3, 3, 1, '#7480a6'); }
      R(ctx, x + 1, y + 14, 14, 1, '#1c2030'); return;
    case 'f': // reator/aquecedor com brilho
      R(ctx, x, y, 16, 16, '#2c3148'); R(ctx, x + 1, y + 1, 14, 14, '#5a6384'); R(ctx, x + 3, y + 3, 10, 10, '#1c2030');
      R(ctx, x + 4, y + 4, 8, 8, '#2a8aff'); R(ctx, x + 5, y + 5, 6, 6, '#7fd0ff'); R(ctx, x + 7, y + 6, 2, 4, '#ffffff'); return;
    case 'x': // caixa de carga com faixa
      sh(); R(ctx, x + 1, y + 2, 14, 12, '#7a84a0'); R(ctx, x + 1, y + 2, 14, 2, '#a8b2cc'); R(ctx, x + 1, y + 12, 14, 2, '#505874');
      for (let i = 0; i < 5; i++) R(ctx, x + 2 + i * 3, y + 7, 2, 3, i % 2 ? '#1c2030' : '#ffd23a'); R(ctx, x + 6, y + 4, 4, 2, '#e6ecf6'); return;
    case 'p': // bandeja hidropônica
      sh(); R(ctx, x + 1, y + 8, 14, 7, '#4a536e'); R(ctx, x + 2, y + 9, 12, 4, '#2a6a8a'); R(ctx, x + 3, y + 4, 4, 6, '#3a9a4a'); R(ctx, x + 9, y + 2, 4, 8, '#4cc25a'); R(ctx, x + 5, y + 2, 2, 3, '#7ae08a'); R(ctx, x + 10, y + 3, 1, 3, '#b8ffb8'); return;
    case 'A': // bancada de ferramentas
      sh(); R(ctx, x, y + 5, 16, 8, '#4a536e'); R(ctx, x, y + 5, 16, 2, '#9aa4c4'); R(ctx, x + 2, y + 2, 3, 4, '#d8803a'); R(ctx, x + 7, y + 3, 5, 2, '#c8d0e8'); R(ctx, x + 1, y + 13, 14, 1, '#1c2030'); return;
  }
}
function furniture(ctx, ch, x, y, tx, ty, th) {
  floor(ctx, x, y, tx, ty, th);
  if (th.station) { stationFurniture(ctx, ch, x, y, tx, ty); return; }
  const sh = () => R(ctx, x + 1, y + 13, 14, 3, 'rgba(0,0,0,0.25)');
  switch (ch) {
    case 'q': { // cama com cabeceira, travesseiro fofo e colcha de retalhos
      const q = ['#c83a4a', '#3a6ac8', '#4a9a4a'][(tx + ty) % 3];
      sh(); R(ctx, x + 1, y, 14, 15, '#4a2a12'); R(ctx, x + 1, y, 14, 3, '#8a5a30'); R(ctx, x + 1, y, 14, 1, '#b07a44'); R(ctx, x + 2, y + 1, 1, 1, '#e8c060'); R(ctx, x + 13, y + 1, 1, 1, '#e8c060');
      R(ctx, x + 2, y + 3, 12, 11, '#f4eee0'); R(ctx, x + 3, y + 3, 10, 3, '#ffffff'); R(ctx, x + 3, y + 5, 10, 1, '#d8d0c0');
      R(ctx, x + 2, y + 6, 12, 8, q); R(ctx, x + 2, y + 6, 12, 1, '#f4eee0');
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) if ((i + j) % 2) R(ctx, x + 2 + i * 4, y + 7 + j * 4, 4, 4, shadeHex(q, 1.2));
      R(ctx, x + 2, y + 13, 12, 1, shadeHex(q, 0.7)); R(ctx, x + 1, y + 14, 14, 1, '#3a2010'); break;
    }
    case 'd': // mesa com toalha xadrez
      sh(); R(ctx, x, y + 3, 16, 9, '#8a5a2e'); R(ctx, x, y + 3, 16, 2, '#b07a44'); R(ctx, x, y + 11, 16, 1, '#5a3a1e');
      R(ctx, x + 2, y + 3, 12, 8, '#f4eee0'); for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) R(ctx, x + 2 + i * 2, y + 3 + j * 2, 2, 2, '#e07a7a');
      R(ctx, x + 2, y + 11, 12, 1, '#c8c0b0'); R(ctx, x + 3, y + 12, 2, 1, '#e07a7a'); R(ctx, x + 7, y + 12, 2, 1, '#e07a7a'); R(ctx, x + 11, y + 12, 2, 1, '#e07a7a');
      R(ctx, x + 1, y + 12, 2, 3, '#5a3a1e'); R(ctx, x + 13, y + 12, 2, 3, '#5a3a1e');
      if (hash(tx, ty, 1) < 0.5) { R(ctx, x + 5, y + 4, 5, 3, '#e8e0d0'); R(ctx, x + 6, y + 4, 3, 1, '#c84a3a'); } else { R(ctx, x + 6, y + 2, 3, 4, '#d8d8e8'); R(ctx, x + 6, y + 3, 3, 1, '#4a8ad8'); }
      break;
    case 'l': // estante
      R(ctx, x, y, 16, 16, '#4a2c14'); R(ctx, x + 1, y + 1, 14, 14, '#6a4020');
      for (const row of [2, 7]) { R(ctx, x + 1, y + row + 4, 14, 1, '#4a2c14'); for (let i = 0; i < 6; i++) R(ctx, x + 2 + i * 2, y + row, 2, 4, ['#c83a4a', '#3a6ac8', '#e0b030', '#4a9a4a', '#8a4ac8', '#e8e0d0'][(i + tx + row) % 6]); }
      R(ctx, x + 1, y + 12, 14, 3, '#3a2210'); break;
    case 'f': { // lareira de pedra com arco, lenha e brasas
      R(ctx, x, y, 16, 16, '#5a565e');
      for (let row = 0; row < 4; row++) for (let k = row % 2 ? -4 : 0; k < 16; k += 8) { const sx = Math.max(x, x + k), ex = Math.min(x + 16, x + k + 7); R(ctx, sx, y + row * 4, ex - sx, 3, (row + k) % 3 ? '#8a868e' : '#7a7680'); R(ctx, sx, y + row * 4, ex - sx, 1, '#a8a4ac'); }
      R(ctx, x - 0, y, 16, 2, '#6a4626'); R(ctx, x, y, 16, 1, '#a8743e');   // prateleira
      for (let yy = 0; yy < 10; yy++) { const hw = yy < 4 ? Math.round(Math.sqrt(16 - (4 - yy) ** 2)) + 1 : 5; R(ctx, x + 8 - hw, y + 5 + yy, hw * 2, 1, '#1a1010'); }
      R(ctx, x + 4, y + 13, 8, 2, '#6a4020'); R(ctx, x + 5, y + 12, 6, 1, '#8a5a30');
      R(ctx, x + 5, y + 9, 6, 4, '#ff8a1e'); R(ctx, x + 6, y + 7, 2, 5, '#ffd93b'); R(ctx, x + 9, y + 8, 2, 4, '#ffd93b'); R(ctx, x + 7, y + 10, 2, 2, '#fff4c0');
      R(ctx, x + 2, y + 15, 12, 1, '#3a3640');
      break;
    }
    case 'x': // barril
      sh(); R(ctx, x + 3, y + 1, 10, 14, '#8a5a2e'); R(ctx, x + 2, y + 3, 12, 10, '#8a5a2e'); R(ctx, x + 2, y + 4, 12, 1, '#4a4a52'); R(ctx, x + 2, y + 11, 12, 1, '#4a4a52');
      R(ctx, x + 4, y + 2, 2, 12, '#a87444'); R(ctx, x + 3, y + 1, 10, 1, '#b07e4a'); break;
    case 'p': // planta no vaso
      sh(); R(ctx, x + 4, y + 9, 8, 6, '#c8643a'); R(ctx, x + 4, y + 9, 8, 1, '#e08a5a');
      R(ctx, x + 3, y + 2, 10, 7, '#3a8a3a'); R(ctx, x + 5, y, 6, 4, '#4caa4a'); R(ctx, x + 6, y + 3, 2, 2, '#7ac86a'); R(ctx, x + 10, y + 5, 2, 2, '#7ac86a'); break;
    case 'A': // bigorna
      sh(); R(ctx, x + 2, y + 5, 12, 4, '#4a4a56'); R(ctx, x + 1, y + 5, 3, 2, '#4a4a56'); R(ctx, x + 2, y + 5, 12, 1, '#8a8a9a'); R(ctx, x + 5, y + 9, 6, 3, '#3a3a44'); R(ctx, x + 4, y + 12, 8, 2, '#2a2a34'); break;
  }
}

// Superfície da Lua: regolito com manchas, crateras, pedregulhos e paredões de rocha
// Superfície da Lua: regolito com variação suave de tom (ruído contínuo entre tiles, em pontilhado),
// pedrinhas com sombra, micro-crateras; crateras grandes com borda iluminada e pedregulhos sombreados.
function vnoise(wx, wy, sc, seed) {
  const gx = wx / sc, gy = wy / sc, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = hash(x0, y0, seed), b = hash(x0 + 1, y0, seed), c = hash(x0, y0 + 1, seed), d = hash(x0 + 1, y0 + 1, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
const MOON_TONES = ['#8e92aa', '#9ea2b8', '#adb1c6', '#bcc0d3', '#cacede'];
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function moonGroundRaw(ctx, x, y, tx, ty) {
  for (let py = 0; py < 16; py++) for (let px = 0; px < 16; px++) {
    const wx = tx * 16 + px, wy = ty * 16 + py;
    const v = vnoise(wx, wy, 40, 41) * 0.7 + vnoise(wx, wy, 11, 42) * 0.3;
    const f = v * 4.2, k = Math.floor(f), dith = (f - k) * 16 > BAYER[(py % 4) * 4 + (px % 4)] ? 1 : 0;
    ctx.fillStyle = MOON_TONES[Math.max(0, Math.min(4, k + dith))]; ctx.fillRect(x + px, y + py, 1, 1);
  }
  // pedrinhas com luz em cima e sombra embaixo
  for (let i = 0; i < 3; i++) if (hash(tx, ty, 50 + i) < 0.45) { const px = x + 1 + ((hash(tx, ty, 53 + i) * 13) | 0), py = y + 1 + ((hash(tx, ty, 56 + i) * 13) | 0); R(ctx, px, py, 2, 1, '#e2e4ee'); R(ctx, px, py + 1, 2, 1, '#7c8098'); }
  // micro-cratera
  if (hash(tx, ty, 91) < 0.18) {
    const px = x + 2 + ((hash(tx, ty, 92) * 8) | 0), py = y + 3 + ((hash(tx, ty, 93) * 8) | 0);
    R(ctx, px + 1, py, 3, 1, '#7c8098'); R(ctx, px, py + 1, 1, 2, '#7c8098'); R(ctx, px + 1, py + 1, 3, 2, '#9296ae'); R(ctx, px + 4, py + 1, 1, 2, '#dcdeea'); R(ctx, px + 1, py + 3, 3, 1, '#dcdeea');
  }
}
function moonCrater(ctx, x, y, tx, ty) {
  moonGround(ctx, x, y, tx, ty);
  // luz do alto à esquerda: dentro, a parede de cima/esquerda fica na sombra e a de baixo/direita, iluminada
  const cx = 8, cy = 8.5, rx = 7.2, ry = 5.4;
  for (let py = 0; py < 16; py++) for (let px = 0; px < 16; px++) {
    const nx = (px + 0.5 - cx) / rx, ny = (py + 0.5 - cy) / ry, d = nx * nx + ny * ny;
    let col = null;
    if (d <= 0.62) { const lit = nx * 0.6 + ny * 0.8; col = lit > 0.35 ? '#a4a8be' : lit > -0.05 ? '#8a8ea6' : lit > -0.4 ? '#72768e' : '#5e6278'; }
    else if (d <= 1) { const lit = -nx * 0.6 - ny * 0.8; col = lit > 0.2 ? '#e4e6f0' : lit > -0.3 ? '#c4c8d8' : '#9a9eb6'; }
    else if (d <= 1.3 && hash(tx * 16 + px, ty * 16 + py, 7) < 0.25) col = '#d4d6e4';   // material ejetado
    if (col) { ctx.fillStyle = col; ctx.fillRect(x + px, y + py, 1, 1); }
  }
}
function moonBoulder(ctx, x, y, tx, ty) {
  moonGround(ctx, x, y, tx, ty);
  boulder(ctx, x, y, tx, ty, '#9a9eb6', hash(tx, ty, 21) < 0.4 ? { cx: 8, cy: 9.5, rx: 5.8, ry: 4.8 } : {});
}
function moonCliff(ctx, x, y, tx, ty, tiles) {
  const at = (cx, cy) => (tiles && tiles[cy] ? tiles[cy][cx] : undefined), below = at(tx, ty + 1);
  if (below !== undefined && below !== '#') {
    // paredão visto de frente: rocha lunar em camadas, borda iluminada em cima e pé escuro
    cliff(ctx, x, y, tx, ty, { rock: ['#6e6e8a', '#55556e', '#a4a4c0'] });
    R(ctx, x, y, 16, 2, '#8a8aa6'); R(ctx, x, y, 16, 1, '#b4b4cc');
    R(ctx, x, y + 14, 16, 2, '#2a2a3c');
    return;
  }
  // topo do platô: regolito escuro com crateras miúdas e borda clara onde termina
  const TOP = ['#3e4258', '#474b62', '#50546c', '#5a5e76', '#646880'];
  for (let py = 0; py < 16; py++) for (let px = 0; px < 16; px++) {
    const v = vnoise(tx * 16 + px, ty * 16 + py, 24, 63), f = v * 4.2, k = Math.floor(f), dith = (f - k) * 16 > BAYER[(py % 4) * 4 + (px % 4)] ? 1 : 0;
    ctx.fillStyle = TOP[Math.max(0, Math.min(4, k + dith))]; ctx.fillRect(x + px, y + py, 1, 1);
  }
  for (let i = 0; i < 2; i++) if (hash(tx, ty, 70 + i) < 0.4) { const cx = x + 3 + ((hash(tx, ty, 72 + i) * 9) | 0), cy = y + 3 + ((hash(tx, ty, 74 + i) * 9) | 0); R(ctx, cx, cy, 4, 3, '#3a3a4e'); R(ctx, cx, cy + 3, 4, 1, '#6a6a84'); R(ctx, cx, cy, 4, 1, '#30303f'); }
  if (at(tx, ty - 1) !== undefined && at(tx, ty - 1) !== '#') { R(ctx, x, y, 16, 1, '#8a8aa6'); R(ctx, x, y + 1, 16, 1, '#5e5e76'); }
  if (at(tx - 1, ty) !== undefined && at(tx - 1, ty) !== '#') R(ctx, x, y, 1, 16, '#7a7a96');
  if (at(tx + 1, ty) !== undefined && at(tx + 1, ty) !== '#') R(ctx, x + 15, y, 1, 16, '#34344a');
}
function moonCrystal(ctx, x, y, tx, ty, t0) {
  moonGround(ctx, x, y, tx, ty);
  const pc = hash(tx, ty, 5) < 0.5 ? ['#1e5a6e', '#3ab0cc', '#7af0ff', '#d8ffff'] : ['#3a1e6e', '#8a4ad0', '#c08aff', '#f0dcff'];
  ctx.globalAlpha = 0.28; ctx.fillStyle = pc[2]; ctx.beginPath(); ctx.ellipse(x + 8, y + 13, 7, 2.5, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1;   // brilho no chão
  // prismas facetados: contorno escuro, face clara à esquerda, escura à direita, ponta branca
  const prism = (px, top, w, h) => {
    for (let i = 0; i < h; i++) {
      const ww = i < w / 2 ? Math.max(1, i * 2) : w, xx = px + ((w - ww) >> 1);
      R(ctx, xx - 1, y + top + i, ww + 2, 1, pc[0]);
      R(ctx, xx, y + top + i, Math.ceil(ww / 2), 1, pc[2]); R(ctx, xx + Math.ceil(ww / 2), y + top + i, Math.floor(ww / 2), 1, pc[1]);
    }
    R(ctx, px - 1, y + top + h, w + 2, 1, pc[0]); R(ctx, px + (w >> 1) - 1, y + top, 1, 2, pc[3]); R(ctx, px + 1, y + top + (w >> 1) + 1, 1, Math.max(1, h - w), pc[3]);
  };
  prism(2, 6, 4, 8); prism(10, 7, 4, 7); prism(6, 1, 4, 13);
  void t0;
}
// ---- Marélia: tiles do fundo do mar -----------------------------------------------------------------
const CORAL_TONES = [['#e0507a', '#ff8aa8', '#a83458'], ['#e8803a', '#ffb070', '#b05a22'], ['#8a5ad0', '#b88aff', '#5e3a9a'], ['#3ab8a8', '#7ae8d8', '#26887c']];
// Fundo do mar: areia com ondulações contínuas entre tiles e a rede de luz (cáusticas) que a superfície projeta
function seaSand(ctx, x, y, tx, ty, th) {
  R(ctx, x, y, 16, 16, th.g);
  for (let py = 0; py < 16; py++) for (let px = 0; px < 16; px++) {
    const wx = tx * 16 + px, wy = ty * 16 + py;
    const rip = Math.sin(wy * 0.7 + Math.sin(wx * 0.11) * 2.2 + wx * 0.05);
    const cau = Math.sin(wx * 0.19 + Math.sin(wy * 0.15) * 1.8) + Math.sin(wy * 0.21 + Math.sin(wx * 0.12) * 2.1);
    if (Math.abs(cau) < 0.07) { ctx.globalAlpha = 0.5; ctx.fillStyle = th.bl; ctx.fillRect(x + px, y + py, 1, 1); ctx.globalAlpha = 1; }
    else if (rip > 0.82) { ctx.fillStyle = th.gl; ctx.fillRect(x + px, y + py, 1, 1); }
    else if (rip < -0.86) { ctx.fillStyle = th.gd; ctx.fillRect(x + px, y + py, 1, 1); }
  }
  if (hash(tx, ty, 21) < 0.08) { R(ctx, x + 5, y + 9, 3, 2, '#e8dcc8'); R(ctx, x + 6, y + 9, 1, 1, '#ffffff'); R(ctx, x + 5, y + 11, 3, 1, th.gd); }   // concha
  else if (hash(tx, ty, 22) < 0.07) { R(ctx, x + 9, y + 5, 2, 2, th.rock[1]); R(ctx, x + 9, y + 5, 1, 1, th.rock[2]); R(ctx, x + 4, y + 11, 1, 1, th.rock[1]); }   // pedrinhas
  else if (hash(tx, ty, 23) < 0.06) { const [d, l] = th.kelp || ['#2f9a5a', '#46c27a']; R(ctx, x + 3, y + 10, 1, 4, d); R(ctx, x + 4, y + 9, 1, 5, l); R(ctx, x + 6, y + 11, 1, 3, d); }   // capim-marinho
}
// Parede fina no meio da tela (fileira de 1 casa, mesmo encostada na borda): é desenhada como pedras redondas.
// Continua sólida e o martelo não a quebra, então enigmas e caminhos de Marélia ficam iguais.
const SEA_WALL = new Set(['#', 'C']);
const OUTDOOR_THEMES = new Set(['plains', 'forest', 'shadow', 'swamp', 'mountain', 'coast', 'desert', 'snow', 'castleout']);
function seaThinWall(tiles, tx, ty) {
  if (!tiles || ty <= 0 || tx <= 0 || ty >= tiles.length - 1 || tx >= (tiles[0]?.length || 0) - 1) return false;
  const w = (cx, cy) => SEA_WALL.has(tiles[cy]?.[cx]);
  // faz parte de um bloco 2×2 de parede = parede grossa (borda, maciço): continua como paredão
  for (const [ox, oy] of [[-1, -1], [0, -1], [-1, 0], [0, 0]]) if (w(tx + ox, ty + oy) && w(tx + ox + 1, ty + oy) && w(tx + ox, ty + oy + 1) && w(tx + ox + 1, ty + oy + 1)) return false;
  return true;
}
function seaTile(ctx, ch, x, y, tx, ty, th, tiles) {
  const snb = (cx, cy) => (tiles && tiles[cy] ? tiles[cy][cx] : undefined);
  if ((ch === '#' || ch === 'C') && seaThinWall(tiles, tx, ty)) { seaSand(ctx, x, y, tx, ty, th); boulder(ctx, x, y, tx, ty, th.rock[0], { moss: '#3a9a6a' }); return; }
  const nb = (cx, cy) => (tiles[cy] ? tiles[cy][cx] : undefined);
  switch (ch) {
    case 'F': { // alga: três folhas que ondulam, atravessáveis
      seaSand(ctx, x, y, tx, ty, th);
      const [d, l] = th.kelp;
      for (const [fx, h, ph] of [[3, 12, 0], [7, 14, 1], [11, 11, 2]]) {
        for (let k = 0; k < h; k++) { const sway = Math.round(Math.sin(k * 0.5 + ph + hash(tx, ty, fx) * 4) * 1.2); R(ctx, x + fx + sway, y + 15 - k, 2, 1, k % 3 ? d : l); }
      }
      return;
    }
    case 'H': { // arco baixo de coral: só passa rolando
      seaSand(ctx, x, y, tx, ty, th);
      const [c, hi, sh] = CORAL_TONES[(hash(tx, ty, 5) * 4) | 0];
      R(ctx, x, y + 2, 16, 5, c); R(ctx, x, y + 2, 16, 1, hi); R(ctx, x + 1, y + 6, 14, 1, sh);
      R(ctx, x, y + 7, 16, 7, '#0a1a2c'); R(ctx, x + 2, y + 8, 12, 5, '#13304a'); R(ctx, x + 4, y + 10, 8, 1, '#2a6a9a');
      R(ctx, x, y + 6, 3, 8, c); R(ctx, x + 13, y + 6, 3, 8, c); R(ctx, x + 1, y + 7, 1, 5, hi);
      return;
    }
    case 'T': { // coral
      seaSand(ctx, x, y, tx, ty, th);
      const [c, hi, sh] = CORAL_TONES[(hash(tx, ty, 5) * 4) | 0], big = hash(tx, ty, 6) < 0.5;
      R(ctx, x + 2, y + 13, 12, 3, 'rgba(8,24,40,0.35)');
      R(ctx, x + 6, y + 8, 4, 7, sh);
      if (big) { R(ctx, x + 2, y + 5, 3, 7, c); R(ctx, x + 11, y + 4, 3, 8, c); R(ctx, x + 6, y + 1, 4, 9, c); R(ctx, x + 3, y + 5, 1, 4, hi); R(ctx, x + 7, y + 2, 1, 5, hi); R(ctx, x + 12, y + 4, 1, 4, hi); R(ctx, x + 2, y + 4, 3, 1, hi); R(ctx, x + 11, y + 3, 3, 1, hi); R(ctx, x + 6, y, 4, 1, hi); }
      else { R(ctx, x + 1, y + 7, 14, 6, c); R(ctx, x + 3, y + 4, 10, 5, c); R(ctx, x + 5, y + 2, 6, 3, c); R(ctx, x + 3, y + 5, 3, 1, hi); R(ctx, x + 6, y + 3, 3, 1, hi); R(ctx, x + 2, y + 8, 2, 1, hi); for (const [bx, by] of [[5, 7], [9, 6], [7, 10], [11, 9], [3, 10]]) R(ctx, x + bx, y + by, 2, 2, sh); }
      return;
    }
    case 'R': { seaSand(ctx, x, y, tx, ty, th); boulder(ctx, x, y, tx, ty, th.rock[0], { moss: '#3a9a6a' }); if (hash(tx, ty, 14) < 0.5) { R(ctx, x + 4, y + 6, 2, 1, '#e8dcc8'); R(ctx, x + 9, y + 8, 2, 1, '#e8dcc8'); } return; }
    case '#': cliff(ctx, x, y, tx, ty, { rock: [th.rock[1], shadeHex(th.rock[1], 0.8), th.rock[2]] }); R(ctx, x, y, 16, 16, 'rgba(14,40,70,0.25)'); return;
    case 'C': cliff(ctx, x, y, tx, ty, { rock: ['#7a98ac', '#5a788e', '#a8c4d4'] }); if (hash(tx, ty, 17) < 0.5) { R(ctx, x + 3, y + 9, 3, 2, '#3a9a6a'); R(ctx, x + 10, y + 3, 2, 3, '#3a9a6a'); } return;
    case 'S': path(ctx, x, y, tx, ty, tiles, { cobble: true }); R(ctx, x, y, 16, 16, 'rgba(20,70,120,0.18)'); return;
    case 'x': { seaSand(ctx, x, y, tx, ty, th); R(ctx, x + 2, y + 13, 12, 3, 'rgba(8,24,40,0.35)'); R(ctx, x + 2, y + 3, 12, 11, '#3a2a1c'); R(ctx, x + 3, y + 4, 10, 9, th.wreck ? '#6a4a32' : '#8a6a44'); R(ctx, x + 3, y + 7, 10, 1, '#2a1e14'); R(ctx, x + 3, y + 11, 10, 1, '#2a1e14'); R(ctx, x + 4, y + 4, 2, 9, '#8a6a4a'); R(ctx, x + 9, y + 5, 3, 2, '#3a9a6a'); return; }
    case 'h':
      if (th.wreck) { // tábuas escuras de um casco naufragado
        R(ctx, x, y, 16, 16, '#4a3322'); for (let k = 0; k < 4; k++) { R(ctx, x, y + k * 4, 16, 1, '#2a1c12'); R(ctx, x + ((hash(tx, ty + k, 3) * 12) | 0), y + k * 4 + 1, 1, 3, '#2a1c12'); }
        R(ctx, x, y, 16, 1, '#6a4a32'); if (hash(tx, ty, 8) < 0.5) R(ctx, x + 4, y + 5, 6, 2, '#2f6a52'); return;
      }
      woodWall(ctx, x, y, th, tx, ty, snb); return;
    case 'r': roof(ctx, x, y, th, tx, ty, snb); return;
    case 'n': houseWindow(ctx, x, y, th, tx, ty, snb, '#bfeaff'); return;
    case 'o': houseDoor(ctx, x, y, th, tx, ty, snb); return;
    default: seaSand(ctx, x, y, tx, ty, th);
  }
}

// Interior do Farol de Maré Mansa: pedra clara com listras vermelhas, vidraças enormes e vista para o mar.
function seaView(ctx, x, y) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, 16, 16); ctx.clip();
  const HZ = 78;
  for (let py = 0; py < 16; py += 2) {
    const Y = y + py, k = Y < HZ ? Y / HZ : (Y - HZ) / (176 - HZ);
    const c = Y < HZ ? [Math.round(130 + k * 90), Math.round(190 + k * 50), Math.round(236 + k * 14)] : [Math.round(70 - k * 40), Math.round(150 - k * 60), Math.round(205 - k * 55)];
    R(ctx, x, Y, 16, 2, `rgb(${c[0]},${c[1]},${c[2]})`);
  }
  R(ctx, x, HZ - 1, 16, 1, 'rgba(255,255,255,0.65)');
  for (const [cx, cy, w] of [[50, 22, 30], [150, 40, 38], [262, 16, 26], [236, 54, 22]]) { R(ctx, cx, cy, w, 5, '#f8fbff'); R(ctx, cx + 5, cy - 3, w - 12, 4, '#ffffff'); R(ctx, cx - 3, cy + 3, w - 4, 3, '#dceaf6'); }
  ctx.beginPath(); ctx.arc(284, 28, 9, 0, 7); ctx.fillStyle = '#fff3a8'; ctx.fill();
  R(ctx, 8, HZ - 5, 26, 5, '#4d7a6a'); R(ctx, 14, HZ - 8, 12, 4, '#5d8a72'); // ilhota
  for (let i = 0; i < 26; i++) { const sx = (i * 53 + 11) % 320, sy = HZ + 6 + ((i * 37) % 90); R(ctx, sx, sy, 6, 1, 'rgba(255,255,255,0.45)'); }
  ctx.restore();
}
// piso de tábuas do farol: tábuas horizontais com emendas desencontradas e veios
function woodFloor(ctx, x, y, tx, ty) {
  R(ctx, x, y, 16, 16, '#9a6a42');
  for (let r = 0; r < 4; r++) {
    const py = y + r * 4, tone = (tx * 3 + ty * 5 + r) % 3;
    R(ctx, x, py, 16, 4, tone === 0 ? '#9a6a42' : tone === 1 ? '#a87648' : '#8e6040');
    R(ctx, x, py, 16, 1, '#b8885a'); R(ctx, x, py + 3, 16, 1, '#6e4628');
    R(ctx, x + ((tx * 5 + ty * 3 + r * 7) % 16), py, 1, 4, '#5e3c22');
    if ((tx + r + ty) % 4 === 0) R(ctx, x + 3 + ((tx + r) % 9), py + 2, 3, 1, '#845634');
  }
}
// Torre das Treze Vozes por dentro: chão de pedra polida com frisos dourados, tapete da porta ao centro,
// círculo de runas no meio e paredes com janelas em arco violeta e estandartes
function lacTowerTile(ctx, ch, x, y, tx, ty, nb) {
  if (ch === '.') {
    R(ctx, x, y, 16, 16, (tx + ty) % 2 ? '#3a3052' : '#40355a');
    R(ctx, x, y, 16, 1, '#4c4068'); R(ctx, x, y, 1, 16, '#4c4068'); R(ctx, x + 15, y, 1, 16, '#2a2240'); R(ctx, x, y + 15, 16, 1, '#2a2240');
    if ((tx + ty) % 2 === 0) { R(ctx, x + 7, y + 7, 2, 2, '#8a6a3a'); R(ctx, x + 7, y + 7, 1, 1, '#c8a050'); }
    if ((tx * 7 + ty * 3) % 5 === 0) R(ctx, x + 3 + (tx % 4) * 2, y + 4 + (ty % 3) * 3, 2, 1, '#4a3e66');
    // tapete roxo com borda dourada, da porta até o círculo
    if ((tx === 9 || tx === 10) && ty >= 7) {
      R(ctx, x, y, 16, 16, '#5a2a6e'); R(ctx, x + (tx === 9 ? 0 : 13), y, 3, 16, '#c8a050'); R(ctx, x + (tx === 9 ? 3 : 12), y, 1, 16, '#3a1848');
      if (ty % 2) R(ctx, x + (tx === 9 ? 8 : 4), y + 6, 4, 4, '#7a3a8e');
    }
    // círculo de runas no centro da sala (desenhado em pedaços, um por casa)
    const cx = 160, cy = 88, d = Math.hypot(x + 8 - cx, y + 8 - cy);
    if (d < 64) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, 16, 16); ctx.clip();
      ctx.globalAlpha = 0.18; ctx.fillStyle = '#b27ef0'; ctx.beginPath(); ctx.arc(cx, cy, 40, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = '#cb8dfa'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 40, 0, 7); ctx.stroke();
      ctx.lineWidth = 1; ctx.strokeStyle = '#8a5ad0'; ctx.beginPath(); ctx.arc(cx, cy, 33, 0, 7); ctx.stroke();
      ctx.strokeStyle = '#9ae0f0'; ctx.beginPath();
      for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + k * 2 * Math.PI / 3; k ? ctx.lineTo(cx + Math.cos(a) * 31, cy + Math.sin(a) * 31) : ctx.moveTo(cx + Math.cos(a) * 31, cy + Math.sin(a) * 31); }
      ctx.closePath(); ctx.stroke();
      for (let k = 0; k < 13; k++) { const a = k * 2 * Math.PI / 13; R(ctx, Math.round(cx + Math.cos(a) * 37) - 1, Math.round(cy + Math.sin(a) * 37) - 1, 2, 2, '#efd6ff'); }
      ctx.restore();
    }
    return true;
  }
  if (ch === '#') {
    const below = nb(tx, ty + 1);
    if (ty === 0 && below !== undefined && below !== '#') { // parede do fundo, vista de frente
      R(ctx, x, y, 16, 16, '#4a3e66');
      for (let r = 0; r < 4; r++) { R(ctx, x, y + r * 4 + 3, 16, 1, '#2e2440'); R(ctx, x + ((r + tx) % 2 ? 5 : 12), y + r * 4, 1, 3, '#2e2440'); }
      R(ctx, x, y, 16, 1, '#6a5a8a'); R(ctx, x, y + 14, 16, 2, '#2a1a40');
      if (tx % 4 === 2) { // janela em arco com brilho violeta
        R(ctx, x + 4, y + 2, 8, 12, '#1c1528'); R(ctx, x + 5, y + 1, 6, 1, '#1c1528');
        R(ctx, x + 5, y + 3, 6, 10, '#7a4ab8'); R(ctx, x + 6, y + 2, 4, 1, '#7a4ab8'); R(ctx, x + 5, y + 3, 2, 6, '#cb8dfa'); R(ctx, x + 7, y + 3, 1, 10, '#1c1528');
      } else if (tx % 4 === 0 && tx > 0 && tx < 19) { // estandarte roxo com a lua
        R(ctx, x + 4, y + 1, 8, 1, '#c8a050'); R(ctx, x + 5, y + 2, 6, 11, '#5a2a6e'); R(ctx, x + 5, y + 13, 2, 2, '#5a2a6e'); R(ctx, x + 9, y + 13, 2, 2, '#5a2a6e');
        R(ctx, x + 7, y + 5, 3, 3, '#efd6ff'); R(ctx, x + 8, y + 5, 2, 2, '#5a2a6e');
      }
    } else { // paredes laterais e de baixo: blocos escuros com friso
      R(ctx, x, y, 16, 16, '#241c36'); R(ctx, x + 1, y + 1, 14, 14, '#30264a'); R(ctx, x + 1, y + 1, 14, 1, '#40355a');
      R(ctx, x + 4, y + 7, 8, 2, '#1c1528'); if ((tx + ty) % 3 === 0) R(ctx, x + 6, y + 7, 4, 1, '#8a6a3a');
    }
    return true;
  }
  return false;
}
function lighthouseTile(ctx, ch, x, y, tx, ty, th, nb) {
  switch (ch) {
    case '#': { // parede interna: reboco caiado, faixa vermelha do farol e rodapé de madeira
      const below = nb(tx, ty + 1);
      if (below !== undefined && below !== '#' && below !== 'B') {
        R(ctx, x, y, 16, 16, '#efe6d4'); R(ctx, x, y, 16, 1, '#fffaf0');
        if ((tx * 7 + ty * 3) % 5 === 0) R(ctx, x + 3 + (tx % 3) * 3, y + 2, 2, 1, '#d8ccb4');
        R(ctx, x, y + 5, 16, 3, '#c8382e'); R(ctx, x, y + 5, 16, 1, '#e8604e'); R(ctx, x, y + 7, 16, 1, '#8a2418');
        R(ctx, x, y + 11, 16, 5, '#7a5236'); R(ctx, x, y + 11, 16, 1, '#9a6a42'); R(ctx, x + (tx % 2 ? 4 : 11), y + 12, 1, 4, '#5a3a24'); R(ctx, x, y + 15, 16, 1, '#3a2418');
      } else { R(ctx, x, y, 16, 16, '#6e6656'); R(ctx, x + 1, y + 1, 14, 14, '#8a8068'); R(ctx, x + 1, y + 1, 14, 1, '#a89e84'); if ((tx + ty) % 2) R(ctx, x + 4, y + 6, 6, 1, '#7a705a'); }
      return true;
    }
    case 'B': { // parede externa da torre: faixas vermelhas e brancas
      if (th.top) { floor(ctx, x, y, tx, ty, th); return true; }   // na sacada, a torre é desenhada por cima (farolTop)
      const band = ty % 2 === 0;
      R(ctx, x, y, 16, 16, band ? '#c8382e' : '#f2eee4');
      for (let r = 0; r < 4; r++) { R(ctx, x, y + r * 4 + 3, 16, 1, band ? '#8a2418' : '#c8bca0'); const off = (r + tx) % 2 ? 4 : 10; R(ctx, x + off, y + r * 4, 1, 3, band ? '#8a2418' : '#c8bca0'); }
      R(ctx, x, y, 16, 1, band ? '#e05a4a' : '#ffffff'); R(ctx, x, y + 15, 16, 1, 'rgba(40,24,16,0.35)');
      return true;
    }
    case 'r': { // telhado vermelho da lanterna
      if (th.top) { floor(ctx, x, y, tx, ty, th); return true; }
      R(ctx, x, y, 16, 16, '#b8322a');
      for (let r = 0; r < 4; r++) { R(ctx, x, y + r * 4 + 3, 16, 1, '#8a2418'); R(ctx, x + ((r + tx) % 2 ? 3 : 9), y + r * 4, 1, 3, '#8a2418'); }
      R(ctx, x, y, 16, 2, '#e05a4a'); R(ctx, x, y + 15, 16, 1, '#5a1a12');
      return true;
    }
    case 'G': { // lanterna vista de fora: vidro quente, esquadria e brilho da lâmpada
      if (th.top) { floor(ctx, x, y, tx, ty, th); return true; }
      R(ctx, x, y, 16, 16, '#3a4258'); R(ctx, x + 1, y + 1, 14, 14, '#ffe58a'); R(ctx, x + 1, y + 1, 14, 3, '#fff6c0');
      R(ctx, x + 7, y + 1, 2, 14, '#3a4258'); R(ctx, x + 1, y + 8, 14, 1, '#3a4258'); R(ctx, x + 3, y + 3, 2, 2, '#ffffff');
      return true;
    }
    case ',': if (th.top) floor(ctx, x, y, tx, ty, th); else woodFloor(ctx, x, y, tx, ty); return true;
    case 'j': { // vigia redondo embutido na parede (mesmo reboco, faixa vermelha e rodapé da parede ao lado)
      R(ctx, x, y, 16, 16, '#efe6d4'); R(ctx, x, y, 16, 1, '#fffaf0');
      R(ctx, x, y + 5, 16, 3, '#c8382e'); R(ctx, x, y + 5, 16, 1, '#e8604e'); R(ctx, x, y + 7, 16, 1, '#8a2418');
      R(ctx, x, y + 11, 16, 5, '#7a5236'); R(ctx, x, y + 11, 16, 1, '#9a6a42'); R(ctx, x, y + 15, 16, 1, '#3a2418');
      ctx.save(); ctx.beginPath(); ctx.arc(x + 8, y + 6, 4.5, 0, 7); ctx.clip(); seaView(ctx, x + 3, y + 1); R(ctx, x, y + 1, 16, 10, 'rgba(140,200,240,0.55)'); ctx.restore();
      ctx.beginPath(); ctx.arc(x + 8, y + 6, 5, 0, 7); ctx.lineWidth = 1.5; ctx.strokeStyle = '#8a6a3a'; ctx.stroke();
      R(ctx, x + 7, y + 1, 2, 10, '#6a5a3a'); R(ctx, x + 3, y + 5, 10, 2, '#6a5a3a'); R(ctx, x + 6, y + 2, 1, 1, '#ffffff');
      return true;
    }
    case 'g': case 'e': case 'z': case 'D': {
      const open = (c) => c === ',' || c === 'D' || c === 'z';
      if (ch === 'z') { // grade da sacada: apoiada na borda do piso, com a vista do mar ao fundo
        floor(ctx, x, y, tx, ty, th);
        const side = { n: nb(tx, ty - 1) === 'e', s: nb(tx, ty + 1) === 'e', w: nb(tx - 1, ty) === 'e', e: nb(tx + 1, ty) === 'e' };
        R(ctx, x, y, 16, 16, 'rgba(60,60,80,0.18)');
        if (side.n) { R(ctx, x, y, 16, 3, '#6a6a7a'); R(ctx, x, y + 3, 16, 2, '#e8e8f0'); R(ctx, x, y + 5, 16, 1, '#9a9aa8'); for (const px of [1, 8, 14]) R(ctx, x + px, y + 5, 2, 6, '#4a4a5a'); }
        if (side.s) { R(ctx, x, y + 13, 16, 3, '#6a6a7a'); R(ctx, x, y + 9, 16, 2, '#e8e8f0'); R(ctx, x, y + 11, 16, 1, '#9a9aa8'); for (const px of [1, 8, 14]) R(ctx, x + px, y + 11, 2, 3, '#4a4a5a'); }
        if (side.w) { R(ctx, x, y, 3, 16, '#6a6a7a'); R(ctx, x + 3, y, 2, 16, '#e8e8f0'); for (const py of [1, 8, 14]) R(ctx, x + 3, y + py, 3, 2, '#4a4a5a'); }
        if (side.e) { R(ctx, x + 13, y, 3, 16, '#6a6a7a'); R(ctx, x + 11, y, 2, 16, '#e8e8f0'); for (const py of [1, 8, 14]) R(ctx, x + 10, y + py, 3, 2, '#4a4a5a'); }
        return true;
      }
      seaView(ctx, x, y);
      if (ch === 'g') { // vidraça enorme: esquadria de ferro alinhada, peitoril de pedra junto ao piso
        R(ctx, x + 2, y + 2, 4, 1, 'rgba(255,255,255,0.55)'); R(ctx, x + 2, y + 2, 1, 3, 'rgba(255,255,255,0.55)');
        const wall = nb(tx, ty + 1) === ',' || nb(tx, ty + 1) === 'D' || nb(tx, ty + 1) === '#';
        const sideL = open(nb(tx + 1, ty)), sideR = open(nb(tx - 1, ty));
        if (ty === 0) { R(ctx, x, y, 16, 3, '#3a4258'); R(ctx, x, y, 16, 1, '#7480a6'); }
        if (tx % 2 === 0) { R(ctx, x, y, 2, 16, '#3a4258'); R(ctx, x, y, 1, 16, '#7480a6'); }
        if (ty % 2 === 0 && !wall) { R(ctx, x, y + 14, 16, 2, '#3a4258'); R(ctx, x, y + 14, 16, 1, '#7480a6'); }
        if (wall) { R(ctx, x, y + 11, 16, 5, '#d8d0bc'); R(ctx, x, y + 11, 16, 1, '#ffffff'); R(ctx, x, y + 15, 16, 1, '#8a8068'); R(ctx, x, y + 9, 16, 2, '#3a4258'); }
        if (sideL) { R(ctx, x + 12, y, 4, 16, '#d8d0bc'); R(ctx, x + 12, y, 1, 16, '#ffffff'); R(ctx, x + 10, y, 2, 16, '#3a4258'); }
        if (sideR) { R(ctx, x, y, 4, 16, '#d8d0bc'); R(ctx, x + 3, y, 1, 16, '#8a8068'); R(ctx, x + 4, y, 2, 16, '#3a4258'); }
      } else if (ch === 'D') { // porta de madeira (a mesma dos dois lados)
        R(ctx, x, y, 16, 16, '#3a2210'); R(ctx, x + 1, y + 1, 14, 15, '#7a4e2a');
        for (let k = 4; k < 15; k += 4) R(ctx, x + k, y + 1, 1, 15, '#5a3a1e');
        R(ctx, x + 1, y + 1, 14, 1, '#a87444'); R(ctx, x + 1, y + 4, 14, 1, '#4a2e18'); R(ctx, x + 1, y + 11, 14, 1, '#4a2e18');
        R(ctx, x + 1, y + 3, 3, 3, '#c8984a'); R(ctx, x + 12, y + 3, 3, 3, '#c8984a'); // dobradiças
        R(ctx, x + 11, y + 8, 3, 3, '#e0c060'); R(ctx, x + 12, y + 9, 1, 1, '#8a6a1a'); // maçaneta
        R(ctx, x, y + 14, 16, 2, '#c8bca0'); // soleira
      }
      return true;
    }
  }
  return false;
}
// Paredes soltas ao ar livre (grupos de '#' que não encostam na borda da tela) são desenhadas como pedras:
// continuam bloqueando igual, só não parecem um muro no meio do nada. Calculado uma vez por mapa.
const STRAY = new WeakMap();
function strayWall(tiles, tx, ty) {
  let set = STRAY.get(tiles);
  if (!set) {
    set = new Set();
    const seen = new Set();
    for (let y0 = 0; y0 < ROWS; y0++) for (let x0 = 0; x0 < COLS; x0++) {
      if (tiles[y0]?.[x0] !== '#' || seen.has(x0 + ',' + y0)) continue;
      const comp = [], stack = [[x0, y0]]; let edge = false; seen.add(x0 + ',' + y0);
      while (stack.length) {
        const [cx, cy] = stack.pop(); comp.push(cx + ',' + cy);
        if (cx === 0 || cy === 0 || cx === COLS - 1 || cy === ROWS - 1) edge = true;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = cx + dx, ny = cy + dy, k = nx + ',' + ny; if (tiles[ny]?.[nx] === '#' && !seen.has(k)) { seen.add(k); stack.push([nx, ny]); } }
      }
      if (!edge) for (const k of comp) set.add(k);
    }
    STRAY.set(tiles, set);
  }
  return set.has(tx + ',' + ty);
}
export function drawTile(ctx, ch, tx, ty, themeName, tiles) {
  if ((themeName === 'moon' || themeName === 'moonpast') && !'rhno'.includes(ch)) {
    const x = tx * TILE, y = ty * TILE;
    switch (ch) {
      case 'O': moonCrater(ctx, x, y, tx, ty); break;
      case 'R': moonBoulder(ctx, x, y, tx, ty); break;
      case '#': if (tiles && (strayWall(tiles, tx, ty) || seaThinWall(tiles, tx, ty))) moonBoulder(ctx, x, y, tx, ty); else moonCliff(ctx, x, y, tx, ty, tiles); break;
      case 'Y': moonCrystal(ctx, x, y, tx, ty); break;
      default: moonGround(ctx, x, y, tx, ty);
    }
    // passado: tom dourado de foto antiga e um brilho mais quente
    if (themeName === 'moonpast') { R(ctx, x, y, 16, 16, 'rgba(222,170,82,0.34)'); if (hash(tx, ty, 61) < 0.07) R(ctx, x + 7, y + 7, 2, 2, 'rgba(255,240,190,0.7)'); }
    return;
  }
  const th = T(themeName);
  const x = tx * TILE, y = ty * TILE;
  if (th.sea) { seaTile(ctx, ch, x, y, tx, ty, th, tiles); return; }
  const base = () => (isDungeonTheme(themeName) || th.style === 'court' ? floor(ctx, x, y, tx, ty, th) : ground(ctx, x, y, tx, ty, th));
  const nb = (cx, cy) => (tiles[cy] ? tiles[cy][cx] : undefined);
  // só ao ar livre (Selênia): parede fina no meio da tela vira pedra no desenho (continua sólida, o martelo não quebra).
  // Masmorras, castelos, casas e torres ficam com as paredes originais.
  if ((ch === '#' || ch === 'C') && OUTDOOR_THEMES.has(themeName) && seaThinWall(tiles, tx, ty)) { base(); rock(ctx, x, y, th, tx, ty); return; }
  if (th.lighthouse && lighthouseTile(ctx, ch, x, y, tx, ty, th, nb)) return;
  if (th.lactowerIn && lacTowerTile(ctx, ch, x, y, tx, ty, nb)) return;
  if(ch==='#' && lacPalette[themeName]) { base(); if(['lacforest','lacfungus','lacroots'].includes(themeName))treeSprite(ctx,x,y,tx,ty,th.tree);else rock(ctx,x,y,th,tx,ty); return; }
  switch (ch) {
    case '.': base(); break;
    case 'F': base(); flowers(ctx, x, y, tx, ty); break;
    case 'S': path(ctx, x, y, tx, ty, tiles, th); break;
    case ',': floor(ctx, x, y, tx, ty, th); break;
    case '_': {
      R(ctx, x, y, 16, 16, '#8c2335');
      for (let k = 2; k < 16; k += 4) R(ctx, x + 4, y + k, 8, 1, '#a12d42');
      if (nb(tx - 1, ty) !== '_') R(ctx, x, y, 2, 16, '#c9993a');
      if (nb(tx + 1, ty) !== '_') R(ctx, x + 14, y, 2, 16, '#c9993a');
      break;
    }
    case '#': {
      if (th.wagon) { trainWall(ctx, x, y, tx, ty, nb(tx, ty + 1)); break; }
      if (!isDungeonTheme(themeName) && !th.cobble && th.style !== 'court' && tiles && strayWall(tiles, tx, ty)) { ground(ctx, x, y, tx, ty, th); boulder(ctx, x, y, tx, ty, (th.rock || THEMES.plains.rock)[0], { moss: th.tree === 'tree' || th.tree === 'darktree' ? '#4c8a3a' : null }); break; }
      // obstáculo no meio de uma sala de gelo (fora da moldura da sala, com gelo ou chão por perto) vira bloco de gelo
      const iceNear = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]].filter(([dx, dy]) => nb(tx + dx, ty + dy) === 'i').length;
      if (themeName === 'dice' && iceNear >= 1 && tx > 0 && ty > 0 && tx < COLS - 1 && ty < ROWS - 1) {
        iceBlock(ctx, x, y, tx, ty);
        break;
      }
      if (themeName === 'mountain') { cliff(ctx, x, y, tx, ty, th); break; }
      const below = nb(tx, ty + 1);
      if ((themeName === 'house' || themeName === 'lachome') && below !== undefined && below !== '#' && below !== 'j') { woodPanel(ctx, x, y, th); break; }
      if ((themeName === 'house' || themeName === 'lachome')) { R(ctx, x, y, 16, 16, '#1a0f08'); if (nb(tx, ty + 1) === '#' && [nb(tx - 1, ty), nb(tx + 1, ty), nb(tx, ty - 1)].some((c) => c !== undefined && c !== '#')) R(ctx, x, y, 16, 16, '#3a2414'); break; }
      if (below !== undefined && below !== '#' && isDungeonTheme(themeName)) {
        // face da parede virada para o jogador: tijolos + rodapé escuro (dá volume, estilo clássico)
        bricks(ctx, x, y, tx, ty, th);
        R(ctx, x, y, 16, 2, th.brickHi); R(ctx, x, y + 2, 16, 1, th.mortar);
        styledWallFace(ctx, x, y, tx, ty, th);
        ctx.globalAlpha = 0.35; R(ctx, x, y + 10, 16, 6, th.mortar); ctx.globalAlpha = 1;
        R(ctx, x, y + 15, 16, 1, '#0c0814');
      } else if (isDungeonTheme(themeName)) {
        // topo grosso da parede
        if (th.style) { wallTop(ctx, x, y, tx, ty, th, nb); break; }
        R(ctx, x, y, 16, 16, th.brickDark);
        R(ctx, x + 1, y + 1, 14, 14, th.brick);
        R(ctx, x + 1, y + 1, 14, 1, th.brickHi); R(ctx, x + 1, y + 1, 1, 14, th.brickHi);
        R(ctx, x + 3, y + 3, 10, 10, th.brickDark); R(ctx, x + 4, y + 4, 8, 8, th.brick);
        if (hash(tx, ty, 13) < 0.3) R(ctx, x + 6, y + 6, 4, 4, th.brickHi);
      } else if (th.rock && !th.cobble) cliff(ctx, x, y, tx, ty, th);   // ao ar livre: paredão de rocha da cor do bioma
      else bricks(ctx, x, y, tx, ty, th);
      break;
    }
    case 'T': base(); treeSprite(ctx, x, y, tx, ty, th.tree || 'tree'); break;
    case 'W': water(ctx, x, y, tx, ty, th); if (!th.sea) coastalShore(ctx, x, y, tx, ty, th, tiles, themeName); break;
    case 'Q': { // recife contínuo: pedras de tamanhos variados fecham a passagem na água
      water(ctx, x, y, tx, ty, th);
      coastalReef(ctx, x, y, tx, ty, th, tiles);
      break;
    }
    case 'R': base(); rock(ctx, x, y, th, tx, ty); break;
    case 'b': base(); bush(ctx, x, y, tx, ty); break;
    case 'r': roof(ctx, x, y, houseTheme(th, tx, ty, nb), tx, ty, nb); break;
    case 'h': woodWall(ctx, x, y, houseTheme(th, tx, ty, nb), tx, ty, nb); break;
    case 'n': houseWindow(ctx, x, y, houseTheme(th, tx, ty, nb), tx, ty, nb); break;
    case 'o': houseDoor(ctx, x, y, houseTheme(th, tx, ty, nb), tx, ty, nb); break;
    case '=': { // ponte de tábuas com cordas e pregos
      water(ctx, x, y, tx, ty, th);
      R(ctx, x, y + 14, 16, 2, 'rgba(0,0,0,0.25)');
      for (let k = 0; k < 16; k += 4) { const tone = hash(tx * 4 + k, ty, 3) < 0.4 ? '#946638' : '#a8743e'; R(ctx, x + k, y + 2, 4, 12, tone); R(ctx, x + k, y + 2, 4, 1, '#c8945c'); R(ctx, x + k + 3, y + 2, 1, 12, '#6e4a26'); R(ctx, x + k + 1, y + 3, 1, 1, '#4a4a56'); R(ctx, x + k + 1, y + 12, 1, 1, '#4a4a56'); }
      R(ctx, x, y + 1, 16, 1, '#d8c08a'); R(ctx, x, y + 14, 16, 1, '#b8a070'); R(ctx, x, y + 2, 16, 1, '#6e4a26');
      break;
    }
    case '|': if (th.wagon) { // barra de latão do vagão, com flanges e anéis
      base(); R(ctx, x + 3, y + 13, 10, 3, 'rgba(0,0,0,0.3)');
      R(ctx, x + 6, y, 4, 14, '#c9a03a'); R(ctx, x + 6, y, 1, 14, '#fff0a0'); R(ctx, x + 7, y, 1, 14, '#f0d068'); R(ctx, x + 9, y, 1, 14, '#8a6a1a');
      for (const ry of [3, 8]) { R(ctx, x + 5, y + ry, 6, 1, '#f0d068'); R(ctx, x + 5, y + ry + 1, 6, 1, '#8a6a1a'); }
      R(ctx, x + 4, y + 12, 8, 3, '#8a6a1a'); R(ctx, x + 4, y + 12, 8, 1, '#f0d068'); R(ctx, x + 3, y + 14, 10, 1, '#5a4410');
      break; }
      // obstáculo no meio de uma sala de gelo (fora da moldura da sala, com gelo ou chão por perto) vira bloco de gelo
      const iceNear = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]].filter(([dx, dy]) => nb(tx + dx, ty + dy) === 'i').length;
      if (themeName === 'dice' && iceNear >= 1 && tx > 0 && ty > 0 && tx < COLS - 1 && ty < ROWS - 1) {
        iceBlock(ctx, x, y, tx, ty);
        break;
      }
      base(); R(ctx, x + 2, y + 13, 12, 3, 'rgba(0,0,0,0.3)'); R(ctx, x + 3, y, 10, 15, '#8a84a8'); R(ctx, x + 3, y, 2, 15, '#aaa4c8'); R(ctx, x + 11, y, 2, 15, '#6b6589'); R(ctx, x + 2, y, 12, 2, '#aaa4c8'); R(ctx, x + 2, y + 13, 12, 2, '#6b6589'); break;
    case 'k': {
      R(ctx, x, y, 16, 16, '#4a2e1a');
      const bc = ['#b8423a', '#3a6fb8', '#3a9a5a', '#c9993a', '#7a4ab8', '#d8d0c0'];
      for (let s = 0; s < 2; s++) {
        let bx = x + 1;
        while (bx < x + 15) {
          const w = 1 + ((hash(tx * 9 + bx, ty, s) * 2.5) | 0), h = 5 + ((hash(bx, ty * 7, s + 3) * 2) | 0);
          R(ctx, bx, y + 1 + s * 8 + (7 - h), Math.min(w, x + 15 - bx), h, bc[(hash(bx, ty, s + 11) * bc.length) | 0]);
          bx += w + (hash(bx, ty, 31) < 0.15 ? 1 : 0);
        }
        R(ctx, x, y + 7 + s * 8, 16, 1, '#2d1a0e');
      }
      break;
    }
    case '^':
      base();
      R(ctx, x + 1, y + 1, 14, 14, 'rgba(20,18,30,0.35)');
      for (let i = 0; i < 4; i++) {
        const sx = x + 1 + (i % 2) * 8, sy = y + 1 + ((i / 2) | 0) * 8;
        R(ctx, sx, sy + 5, 6, 2, '#3a3a48'); R(ctx, sx + 1, sy + 6, 5, 1, 'rgba(0,0,0,0.35)');
        R(ctx, sx + 2, sy, 2, 6, '#9a9caf'); R(ctx, sx + 1, sy + 3, 4, 3, '#9a9caf'); R(ctx, sx + 2, sy, 1, 5, '#e8eaf4'); R(ctx, sx + 1, sy + 3, 1, 3, '#c7c9d6'); R(ctx, sx + 4, sy + 3, 1, 3, '#6a6c80');
      }
      break;
    case 'q': case 'd': case 'l': case 'f': case 'x': case 'p': case 'A': furniture(ctx, ch, x, y, tx, ty, th); break;
    case 'm': // tapete com losangos e franja dourada
      floor(ctx, x, y, tx, ty, th);
      R(ctx, x, y, 16, 16, '#a8323e');
      for (let i = 0; i < 6; i++) { R(ctx, x + 8 - i, y + 2 + i, i * 2, 1, '#c84a56'); R(ctx, x + 8 - (5 - i), y + 8 + i, (5 - i) * 2, 1, '#c84a56'); }
      R(ctx, x + 7, y + 7, 2, 2, '#e0b030'); R(ctx, x, y, 1, 1, '#7a1e2a'); R(ctx, x + 15, y + 15, 1, 1, '#7a1e2a');
      if (nb(tx - 1, ty) !== 'm') R(ctx, x, y, 2, 16, '#e0b030');
      if (nb(tx + 1, ty) !== 'm') R(ctx, x + 14, y, 2, 16, '#e0b030');
      if (nb(tx, ty - 1) !== 'm') R(ctx, x, y, 16, 2, '#e0b030');
      if (nb(tx, ty + 1) !== 'm') R(ctx, x, y + 14, 16, 2, '#e0b030');
      break;
    case 'j': // parede com janela
      if (!isDungeonTheme(themeName)) { houseWindow(ctx, x, y, th, tx, ty, nb, '#9ad0f0'); break; }
      woodPanel(ctx, x, y, th);
      R(ctx, x + 3, y + 1, 10, 10, '#4a2c14'); R(ctx, x + 4, y + 2, 8, 8, '#9ad0f0'); R(ctx, x + 4, y + 2, 8, 3, '#c8ecff'); R(ctx, x + 4, y + 7, 8, 3, '#7ab858');
      R(ctx, x + 7, y + 2, 2, 8, '#4a2c14'); R(ctx, x + 4, y + 5, 8, 1, '#4a2c14'); R(ctx, x + 5, y + 3, 2, 1, '#ffffff');
      R(ctx, x + 2, y + 1, 3, 10, '#c84a5a'); R(ctx, x + 11, y + 1, 3, 10, '#a83a4a'); R(ctx, x + 2, y + 1, 12, 1, '#8a2a3a'); R(ctx, x + 2, y + 6, 3, 1, '#e8c060'); R(ctx, x + 11, y + 6, 3, 1, '#e8c060');
      R(ctx, x + 3, y + 11, 10, 1, '#b07a44');
      break;
    case 'C': cliff(ctx, x, y, tx, ty, th.rock ? th : THEMES.mountain); break;
    case 'u': peg(ctx, x, y, 'red', PEG === 0, th); break;
    case 'y': peg(ctx, x, y, 'blue', PEG === 1, th); break;
    case 'i': // gelo polido (desliza)
      R(ctx, x, y, 16, 16, '#cbeafc'); R(ctx, x, y, 16, 1, '#ffffff'); R(ctx, x, y, 1, 16, '#ecf8ff'); R(ctx, x, y + 15, 16, 1, '#a0d0ec'); R(ctx, x + 15, y, 1, 16, '#a8d8f0');
      for (let i = 0; i < 7; i++) R(ctx, x + 3 + i + ((tx + ty) % 3), y + 11 - i, 2, 1, 'rgba(255,255,255,0.65)');
      R(ctx, x + 9, y + 12, 4, 1, '#b8e2f8');
      if (hash(tx, ty, 2) < 0.3) { R(ctx, x + 12, y + 3, 1, 3, '#ffffff'); R(ctx, x + 11, y + 4, 3, 1, '#ffffff'); }
      break;
    case 'L':
      R(ctx, x, y, 16, 16, '#c8361a');
      ctx.fillStyle = '#e8561e'; for (let py = 0; py < 16; py += 2) for (let px = (py >> 1) % 2; px < 16; px += 2) if (hash((tx * 16 + px) >> 2, (ty * 16 + py) >> 2, 44) < 0.5) ctx.fillRect(x + px, y + py, 1, 1);
      for (let i = 0; i < 3; i++) { const lx = x + ((hash(tx, ty, i) * 11) | 0), ly = y + ((hash(tx, ty, i + 5) * 12) | 0); R(ctx, lx, ly, 5, 2, '#ff8a2a'); R(ctx, lx + 1, ly, 3, 1, '#ffd23a'); }
      for (let i = 0; i < 2; i++) { const cx2 = x + 2 + ((hash(tx, ty, i + 9) * 11) | 0), cy2 = y + 2 + ((hash(tx, ty, i + 12) * 11) | 0); R(ctx, cx2, cy2, 3, 2, '#5a1a10'); R(ctx, cx2, cy2, 3, 1, '#8a2a14'); }   // crosta
      break;
    case ':':
      R(ctx, x, y, 16, 16, '#bfe4f8'); R(ctx, x, y, 16, 1, '#e8f6ff');
      R(ctx, x + 2 + ((hash(tx, ty, 1) * 6) | 0), y + 4, 6, 1, '#ffffff'); R(ctx, x + 6, y + 10, 5, 1, '#9fcde8');
      break;
    case '%':
      R(ctx, x, y, 16, 16, '#5a4a30');
      for (let i = 0; i < 5; i++) R(ctx, x + ((hash(tx, ty, i) * 13) | 0), y + ((hash(tx, ty, i + 7) * 13) | 0), 3, 2, i % 2 ? '#6a5a3a' : '#4a3c26');
      if (hash(tx, ty, 13) < 0.4) { const bx = x + 4 + ((hash(tx, ty, 14) * 7) | 0), by = y + 4 + ((hash(tx, ty, 15) * 7) | 0); R(ctx, bx, by, 3, 2, '#3a2e1c'); R(ctx, bx, by, 1, 1, '#8a7a5a'); }   // bolha de lama
      break;
    case 'Z': // rocha/parede rachada
      if (isDungeonTheme(themeName) || themeName === 'castleout') bricks(ctx, x, y, tx, ty, th); else { base(); rock(ctx, x, y, th); }
      R(ctx, x + 7, y + 2, 1, 4, '#1a1a1a'); R(ctx, x + 6, y + 5, 1, 3, '#1a1a1a'); R(ctx, x + 8, y + 7, 1, 4, '#1a1a1a');
      R(ctx, x + 9, y + 10, 2, 1, '#1a1a1a'); R(ctx, x + 5, y + 8, 1, 3, '#1a1a1a'); R(ctx, x + 4, y + 11, 1, 2, '#1a1a1a');
      break;
    case 'P': // pedregulho pesado (marrom, grande, com veios)
      base();
      boulder(ctx, x, y, tx, ty, '#7a6452', { rx: 7.4, ry: 7, cy: 8.2 });
      R(ctx, x + 4, y + 9, 3, 1, 'rgba(40,28,20,0.6)'); R(ctx, x + 9, y + 6, 2, 1, 'rgba(40,28,20,0.6)'); R(ctx, x + 10, y + 11, 3, 1, 'rgba(40,28,20,0.6)');
      break;
    case 'v': { // espinheiro seco: moita de galhos com espinhos (queima com fogo)
      base();
      R(ctx, x + 1, y + 13, 14, 3, 'rgba(0,0,0,0.3)');
      const rows = BRAMBLE[(tx + ty) & 1];
      const pal = { a: '#3a2410', b: '#6b4522', c: '#9a6a34', t: '#f0e0b0', l: '#d08a2a' };
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const k = rows[j][i]; if (k !== '.') R(ctx, x + i, y + j, 1, 1, pal[k]); }
      break;
    }
    case 'X': // estaca de ferro
      base();
      R(ctx, x + 3, y + 12, 10, 3, 'rgba(0,0,0,0.3)');
      R(ctx, x + 5, y + 3, 6, 11, '#4a4a5a'); R(ctx, x + 6, y + 3, 4, 11, '#6a6a7a'); R(ctx, x + 6, y + 3, 1, 11, '#9a9aaa'); R(ctx, x + 4, y + 2, 8, 3, '#7a7a8a'); R(ctx, x + 4, y + 2, 8, 1, '#c8c8d8'); R(ctx, x + 4, y + 4, 8, 1, '#3a3a48');
      R(ctx, x + 5, y + 9, 6, 1, '#3a3a48'); R(ctx, x + 7, y + 7, 2, 1, '#8a5a3a');   // ferrugem
      break;
    case 'I': // bloco de gelo
      base();
      R(ctx, x + 1, y + 13, 14, 3, 'rgba(40,90,140,0.3)');
      R(ctx, x + 1, y + 1, 14, 14, '#5a9ac8'); R(ctx, x + 2, y + 1, 12, 11, '#a8dcf4'); R(ctx, x + 2, y + 1, 12, 2, '#e4f6ff'); R(ctx, x + 2, y + 12, 12, 2, '#7cbce0');
      R(ctx, x + 4, y + 4, 2, 6, '#ffffff'); R(ctx, x + 6, y + 3, 1, 2, '#ffffff'); R(ctx, x + 10, y + 6, 3, 1, '#ffffff'); R(ctx, x + 11, y + 8, 1, 2, '#d4f0ff');
      R(ctx, x + 8, y + 7, 3, 1, '#7cbce0'); R(ctx, x + 9, y + 8, 1, 2, '#7cbce0');
      break;
    default: R(ctx, x, y, 16, 16, '#000');
  }
}

// moita de espinhos (2 variações para não parecer carimbada)
const BRAMBLE = [[
  '.....t....t.....',
  '..t.ab..t.ba.t..',
  '...abcb.abcba...',
  '.tabcabbacbcbat.',
  '..bcalbcbablcb..',
  '.abcbabtbcbabca.',
  'tbcabcbacbabcbat',
  '.bablcbabcalbcb.',
  '.acbabcbtbcbaba.',
  'tbcbcabcbabcbct.',
  '.abcbablcbacbab.',
  '..bacbcbabcbab..',
  '.tabcbabcbabca t',
  '...abbcbabcba...',
  '....aaabbaaa....',
  '................',
], [
  '...t.....t......',
  '....ba.t.ab..t..',
  '..tabcbabcba....',
  '..abcbalbcbcbat.',
  '.tbcbabcbabcba..',
  '.abcalbtbcablcb.',
  'tbcbabcbabcbcbat',
  '.bacbcbablcbab..',
  '.abcbabcbabcbcb.',
  'tbcblbcbatbacbat',
  '.abcbabcbabcbab.',
  '..bacbcbablcba..',
  '.tabcbabcbabcat.',
  '...abbcbabbca...',
  '....aaabbaaa....',
  '................',
]].map((v) => v.map((r) => r.replace(/ /g, '.')));

// ---------------------------------------------------------------- enfeites do cenário (só visual, não mexem na jogabilidade)
const px1 = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
function decorOutdoor(ctx, ch, tx, ty, theme, tiles) {
  const x = tx * 16, y = ty * 16, r = (k) => hash(tx, ty, 200 + k), ox = 2 + ((r(1) * 11) | 0), oy = 3 + ((r(2) * 10) | 0);
  const at = (cx, cy) => (tiles[cy] ? tiles[cy][cx] : undefined);
  if (ch === 'W') {
    if (theme === 'lacrimora' || theme.startsWith('lac')) { if (r(3) < 0.3) { px1(ctx, x + ox, y + oy, 5, 1, '#fff0fb'); px1(ctx, x + ox + 2, y + oy + 2, 3, 1, '#f5c6eb'); } return; }
    if (theme === 'swamp' && r(3) < 0.18) { px1(ctx, x + ox, y + oy, 5, 3, '#4a8a3a'); px1(ctx, x + ox + 1, y + oy - 1, 3, 1, '#6ab04a'); px1(ctx, x + ox + 4, y + oy + 1, 1, 1, '#3a7a2a'); if (r(4) < 0.4) px1(ctx, x + ox + 2, y + oy - 2, 1, 2, '#f4a8d0'); }
    if (theme === 'coast' && r(3) < 0.1) { px1(ctx, x + ox, y + oy, 3, 1, 'rgba(255,255,255,0.7)'); }
    return;
  }
  if (ch !== '.') return;
  const v = r(5);
  switch (theme) {
    case 'lacrimora': case 'lacforest': case 'lacmarsh': case 'lacash': case 'lacfungus': case 'laccrystal': case 'lacroots':
      if (v < 0.12) { px1(ctx, x + ox, y + oy, 2, 2, '#fff0fb'); px1(ctx, x + ox + 1, y + oy - 1, 1, 1, '#b9f4f4'); }
      else if (v < 0.19) { px1(ctx, x + ox, y + oy, 1, 3, '#8ee3eb'); px1(ctx, x + ox - 1, y + oy + 1, 3, 1, '#bd91e8'); px1(ctx, x + ox + 1, y + oy + 3, 1, 1, '#f2c8f2'); }
      break;
    case 'plains': case 'castleout':
      if (v < 0.07) { const cols = ['#ffffff', '#ffe060', '#ff8ac0', '#8ab8ff']; const c = cols[(r(6) * 4) | 0]; for (const [dx, dy] of [[0, 0], [2, 1], [1, 3], [-1, 2]]) { px1(ctx, x + ox + dx, y + oy + dy, 1, 1, c); px1(ctx, x + ox + dx, y + oy + dy + 1, 1, 2, '#3a7a2a'); } }
      else if (v < 0.13) { px1(ctx, x + ox, y + oy + 1, 3, 2, '#8a8a92'); px1(ctx, x + ox, y + oy, 3, 1, '#b8b8c0'); px1(ctx, x + ox + 1, y + oy + 2, 2, 1, '#6a6a72'); }
      else if (v < 0.22) { px1(ctx, x + ox, y + oy, 1, 3, '#3a7a2a'); px1(ctx, x + ox + 1, y + oy - 1, 1, 4, '#4a9a36'); px1(ctx, x + ox + 2, y + oy, 1, 3, '#3a7a2a'); }
      break;
    case 'forest':
      if (v < 0.07) { px1(ctx, x + ox + 1, y + oy + 2, 2, 3, '#e8e0c8'); px1(ctx, x + ox, y + oy, 4, 2, '#c8443a'); px1(ctx, x + ox + 1, y + oy, 1, 1, '#ffffff'); px1(ctx, x + ox + 3, y + oy + 1, 1, 1, '#ffffff'); }
      else if (v < 0.2) { for (let i = 0; i < 4; i++) px1(ctx, x + ((r(10 + i) * 14) | 0), y + ((r(14 + i) * 14) | 0), 2, 1, ['#c8843a', '#a8642a', '#e0a040', '#8a5a2a'][i]); }
      else if (v < 0.26) { px1(ctx, x + ox, y + oy, 1, 4, '#2f6a2f'); px1(ctx, x + ox - 2, y + oy + 1, 2, 1, '#2f6a2f'); px1(ctx, x + ox + 1, y + oy + 1, 2, 1, '#2f6a2f'); px1(ctx, x + ox - 3, y + oy + 2, 2, 1, '#3a8a3a'); px1(ctx, x + ox + 1, y + oy + 2, 3, 1, '#3a8a3a'); }
      break;
    case 'shadow':
      if (v < 0.08) { px1(ctx, x + ox, y + oy, 1, 3, '#2a2a3a'); px1(ctx, x + ox + 2, y + oy - 1, 1, 4, '#34344a'); px1(ctx, x + ox + 4, y + oy, 1, 3, '#2a2a3a'); }
      else if (v < 0.12) { px1(ctx, x + ox, y + oy, 3, 2, '#6a6a7a'); px1(ctx, x + ox + 1, y + oy - 1, 2, 1, '#8a8a9a'); }
      else if (v < 0.18) { ctx.globalAlpha = 0.18; ctx.fillStyle = '#8a8aff'; ctx.beginPath(); ctx.ellipse(x + 8, y + 9, 8, 4, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
      break;
    case 'swamp':
      if (v < 0.1) { px1(ctx, x + ox, y + oy - 4, 1, 8, '#6a8a3a'); px1(ctx, x + ox + 2, y + oy - 5, 1, 9, '#7a9a44'); px1(ctx, x + ox + 1, y + oy - 6, 2, 3, '#6a4a2a'); }
      else if (v < 0.2) { ctx.globalAlpha = 0.5; ctx.fillStyle = '#3a5a2a'; ctx.beginPath(); ctx.ellipse(x + 8, y + 10, 6, 3, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; px1(ctx, x + 6, y + 9, 3, 1, '#7a9a4a'); }
      break;
    case 'mountain':
      if (v < 0.12) { px1(ctx, x + ox, y + oy, 4, 3, '#7c7468'); px1(ctx, x + ox, y + oy, 4, 1, '#a09888'); px1(ctx, x + ox + 1, y + oy + 3, 3, 1, '#5e584e'); }
      else if (v < 0.2) { px1(ctx, x + ox, y + oy, 1, 2, '#9a8a52'); px1(ctx, x + ox + 2, y + oy - 1, 1, 3, '#aa9a5a'); }
      break;
    case 'coast':
      if (v < 0.07) { px1(ctx, x + ox, y + oy, 3, 2, '#ffd0d8'); px1(ctx, x + ox + 1, y + oy - 1, 1, 1, '#ffffff'); px1(ctx, x + ox + 2, y + oy + 1, 1, 1, '#e890a8'); }
      else if (v < 0.11) { px1(ctx, x + ox + 1, y + oy, 1, 4, '#e84a4a'); px1(ctx, x + ox - 1, y + oy + 1, 5, 1, '#e84a4a'); px1(ctx, x + ox, y + oy + 3, 1, 1, '#e84a4a'); px1(ctx, x + ox + 3, y + oy + 3, 1, 1, '#e84a4a'); }
      else if (v < 0.2) { px1(ctx, x + ox, y + oy, 6, 1, '#bfa66a'); px1(ctx, x + ox + 2, y + oy + 2, 5, 1, '#f0dca0'); }
      break;
    case 'desert':
      if (v < 0.14) { px1(ctx, x + 1, y + oy, 14, 1, '#c8844a'); px1(ctx, x + 3, y + oy + 1, 10, 1, '#e8a868'); }
      else if (v < 0.19) { px1(ctx, x + ox, y + oy, 5, 1, '#f0ead8'); px1(ctx, x + ox + 1, y + oy - 1, 1, 3, '#f0ead8'); px1(ctx, x + ox + 4, y + oy - 1, 1, 3, '#f0ead8'); }
      else if (v < 0.23) { px1(ctx, x + ox, y + oy, 3, 2, '#a86a4a'); px1(ctx, x + ox, y + oy, 3, 1, '#c8886a'); }
      break;
    case 'snow':
      if (v < 0.12) { ctx.globalAlpha = 0.85; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(x + 8, y + 10, 6, 3, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; px1(ctx, x + 4, y + 12, 8, 1, '#c8d4e8'); }
      else if (v < 0.2) { px1(ctx, x + ox, y + oy, 1, 1, '#bfe8ff'); px1(ctx, x + ox - 1, y + oy, 3, 1, '#ffffff'); px1(ctx, x + ox, y + oy - 1, 1, 3, '#ffffff'); }
      break;
    default: break;
  }
  void at;
}
function decorDungeon(ctx, ch, tx, ty, theme, tiles) {
  const x = tx * 16, y = ty * 16, r = (k) => hash(tx, ty, 300 + k), ox = 2 + ((r(1) * 11) | 0), oy = 3 + ((r(2) * 10) | 0);
  const at = (cx, cy) => (tiles[cy] ? tiles[cy][cx] : undefined);
  if (ch === '#') {
    const below = at(tx, ty + 1);
    if (below === undefined || below === '#' || ty === 0 && false) return;
    // frente da parede virada para o herói: bandeiras, musgo e teias
    const v = r(7);
    const banner = { castle: ['#8c2335', '#c9993a'], dcrypt: ['#4a3a6a', '#8a7ac8'], dsun: ['#c9993a', '#2a6ab8'], dtide: ['#2a7ac8', '#e8e0c8'], dice: ['#5a9ad8', '#e4f6ff'], abyss: ['#4a3a8a', '#b48cff'], moondg: ['#4a5a8a', '#7af0ff'], mooncastle: ['#6a5aa8', '#e8e8ff'] }[theme];
    if (banner && v < 0.14 && tx % 3 === 0) { px1(ctx, x + 4, y + 1, 8, 1, '#6a4a2a'); px1(ctx, x + 5, y + 2, 6, 9, banner[0]); px1(ctx, x + 5, y + 11, 2, 2, banner[0]); px1(ctx, x + 9, y + 11, 2, 2, banner[0]); px1(ctx, x + 7, y + 4, 2, 4, banner[1]); px1(ctx, x + 6, y + 5, 4, 2, banner[1]); }
    else if ((theme === 'dforest' || theme === 'dswamp') && v < 0.3) { for (let i = 0; i < 3; i++) px1(ctx, x + 2 + i * 5, y, 2, 2 + ((r(20 + i) * 5) | 0), '#3a7a2a'); px1(ctx, x + 1, y, 14, 1, '#4a9a36'); }
    else if ((theme === 'dcrypt' || theme === 'dmine') && v < 0.18) { px1(ctx, x + 1, y + 1, 1, 6, 'rgba(230,230,240,0.55)'); px1(ctx, x + 2, y + 1, 5, 1, 'rgba(230,230,240,0.55)'); px1(ctx, x + 3, y + 2, 1, 4, 'rgba(230,230,240,0.4)'); px1(ctx, x + 5, y + 2, 1, 3, 'rgba(230,230,240,0.4)'); }
    else if (theme === 'dice' && v < 0.3) { for (let i = 0; i < 3; i++) px1(ctx, x + 3 + i * 4, y + 12, 2, 3 + (i % 2) * 2, '#bfe8ff'); }
    else if (theme === 'dmine' && v < 0.34) { px1(ctx, x + ox, y + 4, 2, 2, '#7af0ff'); px1(ctx, x + ox + 4, y + 8, 2, 2, '#ffd23a'); }
    return;
  }
  if (ch !== ',') return;
  const v = r(5);
  // rachaduras e poeira em qualquer masmorra
  if (v < 0.07) { px1(ctx, x + ox, y + oy, 5, 1, 'rgba(0,0,0,0.35)'); px1(ctx, x + ox + 4, y + oy + 1, 1, 3, 'rgba(0,0,0,0.3)'); px1(ctx, x + ox + 2, y + oy + 3, 4, 1, 'rgba(0,0,0,0.25)'); return; }
  if (v < 0.1) { for (let i = 0; i < 5; i++) px1(ctx, x + ((r(30 + i) * 14) | 0), y + ((r(40 + i) * 14) | 0), 1, 1, 'rgba(255,255,255,0.18)'); return; }
  switch (theme) {
    case 'dforest': if (v < 0.22) { ctx.globalAlpha = 0.6; ctx.fillStyle = '#4c7a34'; ctx.beginPath(); ctx.ellipse(x + 8, y + 9, 6, 4, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; px1(ctx, x + ox, y + oy, 2, 1, '#7aa84a'); } break;
    case 'dcrypt': if (v < 0.15) { px1(ctx, x + ox, y + oy, 5, 2, '#e8e4d4'); px1(ctx, x + ox + 1, y + oy - 1, 2, 1, '#e8e4d4'); px1(ctx, x + ox + 4, y + oy + 1, 3, 1, '#c8c4b4'); px1(ctx, x + ox + 2, y + oy + 2, 1, 1, '#8a8678'); } break;
    case 'dswamp': if (v < 0.2) { ctx.globalAlpha = 0.55; ctx.fillStyle = '#2a4a3a'; ctx.beginPath(); ctx.ellipse(x + 8, y + 10, 6, 3, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; px1(ctx, x + 5, y + 9, 3, 1, 'rgba(255,255,255,0.3)'); } break;
    case 'dmine': if (v < 0.17) { px1(ctx, x + ox, y + oy, 3, 2, '#5a4a3a'); px1(ctx, x + ox + 1, y + oy - 1, 2, 1, '#8a7456'); px1(ctx, x + ox + 4, y + oy + 2, 2, 1, '#3a2a1e'); if (r(9) < 0.4) px1(ctx, x + ox + 1, y + oy, 1, 1, '#7af0ff'); } break;
    case 'dtide': if (v < 0.2) { ctx.globalAlpha = 0.5; ctx.fillStyle = '#2a7ac8'; ctx.beginPath(); ctx.ellipse(x + 8, y + 10, 6, 3, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; px1(ctx, x + 4, y + 9, 4, 1, 'rgba(255,255,255,0.45)'); } else if (v < 0.25) { px1(ctx, x + ox, y + oy - 3, 1, 6, '#2a8a5a'); px1(ctx, x + ox + 2, y + oy - 2, 1, 5, '#3aa874'); } break;
    case 'dsun': if (v < 0.2) { px1(ctx, x + 1, y + oy, 14, 1, '#a07e40'); px1(ctx, x + 4, y + oy + 1, 8, 1, '#d8b468'); } else if (v < 0.26) { px1(ctx, x + ox, y + oy, 1, 4, '#6a5228'); px1(ctx, x + ox + 2, y + oy, 3, 1, '#6a5228'); px1(ctx, x + ox + 2, y + oy + 2, 3, 1, '#6a5228'); } break;
    case 'dice': if (v < 0.2) { ctx.globalAlpha = 0.5; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(x + 8, y + 9, 6, 3, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; } else if (v < 0.26) { px1(ctx, x + ox, y + oy, 1, 3, '#bfe8ff'); px1(ctx, x + ox - 1, y + oy + 1, 3, 1, '#ffffff'); } break;
    case 'castle': case 'mooncastle': if (v < 0.12) { px1(ctx, x + ox, y + oy, 4, 1, 'rgba(140,35,53,0.4)'); px1(ctx, x + ox + 1, y + oy + 1, 2, 1, 'rgba(140,35,53,0.3)'); } else if (v < 0.16) { px1(ctx, x + ox, y + oy, 3, 2, '#3a364d'); } break;
    case 'abyss': case 'moondg': case 'moonmine': if (v < 0.1) { const c = theme === 'moondg' ? '#7af0ff' : '#b48cff'; ctx.globalAlpha = 0.35; px1(ctx, x + ox - 1, y + oy - 1, 3, 3, c); ctx.globalAlpha = 0.9; px1(ctx, x + ox, y + oy, 1, 1, '#ffffff'); ctx.globalAlpha = 1; } break;
    default: break;
  }
  void at;
}
// leve brilho no centro e escurecido nos cantos: dá profundidade à sala toda
function roomLight(ctx, dung, theme) {
  const warm = { dsun: '255,214,140', castle: '255,200,160', castlefront: '220,202,255', plains: '255,250,210', forest: '230,255,190', desert: '255,226,170', coast: '255,250,220', snow: '230,245,255', dice: '200,235,255', dtide: '170,220,255', moondg: '170,200,255', mooncastle: '200,190,255', searreef: '150,225,255', seakelp: '150,235,230', seacave: '130,170,255', seacurrent: '150,225,255', seawreck: '140,190,230', seatown: '170,235,255', moon: '200,215,255', moonpast: '255,226,170', moonstation: '190,220,255' }[theme] || '255,240,200';
  const gl = ctx.createRadialGradient(160, 88, 8, 160, 88, 190);
  gl.addColorStop(0, `rgba(${warm},${dung ? 0.1 : 0.07})`); gl.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gl; ctx.fillRect(0, 0, 320, 176);
}
// Mesmo conjunto de SOLID_TILES do world.js (importar de lá criaria um ciclo de módulos).
const FACADE_SOLID = new Set('#QYTWRbrhn|kZPvXIqdlfxpAjCgezGBH');
// region (opcional) = {x0, y0, x1, y1} em tiles: redesenha só esse pedaço (arbusto cortado, pedra quebrada...), recortado,
// com o mesmo resultado da sala inteira. Antes cada arbusto refazia a sala toda e o dash por vários arbustos travava o jogo.
// As últimas salas desenhadas ficam guardadas: voltar a uma tela já vista só copia a imagem (as construções grandes
// custavam caro para desenhar de novo a cada entrada). A chave inclui os tiles, então arbusto cortado/parede aberta gera outra.
const ROOM_CACHE = new Map();
// Telas de entrada (castelos, labirintos, grutas): desenhadas na tela de carregamento e guardadas no aparelho
// (IndexedDB). Nas próximas aberturas só são lidas de volta, sem redesenhar. Trocar ROOM_ART_REV quando a arte mudar.
const ROOM_ART_REV = '146';
const PERSIST = new Map();
export const clearRoomCache = () => { ROOM_CACHE.clear(); TILE_ATLAS.clear(); PERSIST.clear(); };
// o estado dos pilares (vermelho/azul) só entra na chave quando a sala tem pilares
const roomKey = (tiles, theme, facade) => { const t = tiles.map((r) => r.join('')).join(''); return theme + '|' + (facade || '') + '|' + (/[uy]/.test(t) ? PEG : '-') + '|' + t; };
let idbP = null;
function idb() {
  if (idbP) return idbP;
  idbP = new Promise((resolve) => {
    try {
      const rq = indexedDB.open('cw-rooms', 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore('r');
      rq.onsuccess = () => {
        const db = rq.result;
        // arte nova: o que estava guardado de outra versão é apagado
        const tx = db.transaction('r', 'readwrite'), st = tx.objectStore('r'), g = st.get('__rev');
        g.onsuccess = () => { if (g.result !== ROOM_ART_REV) { st.clear(); st.put(ROOM_ART_REV, '__rev'); } };
        tx.oncomplete = () => resolve(db); tx.onerror = () => resolve(null);
      };
      rq.onerror = () => resolve(null);
    } catch (_) { resolve(null); }
  });
  return idbP;
}
const idbGet = (db, k) => new Promise((resolve) => { try { const r = db.transaction('r').objectStore('r').get(k); r.onsuccess = () => resolve(r.result || null); r.onerror = () => resolve(null); } catch (_) { resolve(null); } });
const idbPut = (db, k, v) => { try { db.transaction('r', 'readwrite').objectStore('r').put(v, k); } catch (_) { /* sem espaço: segue sem guardar */ } };
const hashKey = (k) => { let h1 = 0x811c9dc5, h2 = 0x1234567; for (let i = 0; i < k.length; i++) { const c = k.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619); h2 = Math.imul(h2 ^ c, 2246822507); } return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36) + k.length; };
// prepara uma tela de entrada: lê do aparelho se já foi desenhada antes; senão desenha agora e guarda
export async function persistRoom(tiles, theme, facade) {
  if (typeof document === 'undefined') return;
  const key = roomKey(tiles, theme, facade);
  if (PERSIST.has(key)) return;
  const db = await idb(), hk = hashKey(key);
  if (db) {
    const blob = await idbGet(db, hk);
    if (blob && typeof createImageBitmap === 'function') { try { PERSIST.set(key, await createImageBitmap(blob)); return; } catch (_) { /* refaz abaixo */ } }
  }
  const cv = document.createElement('canvas'); cv.width = COLS * 16; cv.height = ROWS * 16;
  drawRoomCanvas(cv, cv.getContext('2d'), tiles, theme, facade, null);
  PERSIST.set(key, cv);
  if (db && cv.toBlob) cv.toBlob((b) => { if (b) idbPut(db, hk, b); }, 'image/png');
}
export function renderRoomCanvas(canvas, tiles, theme, facade, region) {
  const ctx0 = canvas.getContext('2d');
  const key = region ? null : roomKey(tiles, theme, facade);
  if (key && PERSIST.has(key)) { ctx0.clearRect(0, 0, canvas.width, canvas.height); ctx0.drawImage(PERSIST.get(key), 0, 0); return; }
  if (key && ROOM_CACHE.has(key)) {
    const img = ROOM_CACHE.get(key); ROOM_CACHE.delete(key); ROOM_CACHE.set(key, img);   // mais recente no fim
    ctx0.clearRect(0, 0, canvas.width, canvas.height); ctx0.drawImage(img, 0, 0);
    return;
  }
  const t0 = performance.now();
  // semente das casas desta tela: só pelo que nunca muda (casas, paredes e água), para a casa não trocar de cara ao cortar uma moita
  let seed = 7;
  for (let yy = 0; yy < tiles.length; yy++) for (let xx = 0; xx < tiles[yy].length; xx++) { const ch = tiles[yy][xx]; if ('rhno#W'.includes(ch)) seed = (Math.imul(seed, 31) + ch.charCodeAt(0) * (xx + 1) + yy * 97) | 0; }
  HOUSE_SEED = (seed >>> 0) % 9973;
  drawRoomCanvas(canvas, ctx0, tiles, theme, facade, region);
  const ms = performance.now() - t0; if (ms >= 15 && globalThis.__frameMarks) globalThis.__frameMarks.push('desenhar sala ' + Math.round(ms) + 'ms');
  if (key) {
    const copy = document.createElement('canvas'); copy.width = canvas.width; copy.height = canvas.height;
    copy.getContext('2d').drawImage(canvas, 0, 0);
    ROOM_CACHE.set(key, copy);
    while (ROOM_CACHE.size > 16) ROOM_CACHE.delete(ROOM_CACHE.keys().next().value);
  }
}
function drawRoomCanvas(canvas, ctx0, tiles, theme, facade, region) {
  if (region) { ctx0.save(); ctx0.beginPath(); ctx0.rect(region.x0 * 16, region.y0 * 16, (region.x1 - region.x0 + 1) * 16, (region.y1 - region.y0 + 1) * 16); ctx0.clip(); }
  // tiles que a construção da entrada cobre por inteiro: nem adianta desenhar o chão/pedra embaixo
  const covered = facade ? courtCovers(facade, (tx, ty) => tiles[ty]?.[tx], (tx, ty) => { const ch = tiles[ty]?.[tx]; return ch === undefined || FACADE_SOLID.has(ch); }) : null;
  renderRoomBase(canvas, tiles, theme, region, covered);
  // a fachada só é redesenhada se o pedaço encostar nela (grutas: canto de cima à direita; o resto: faixa de cima)
  const nearFacade = !region || (facade && (facade.startsWith('cave-') ? region.y0 <= 3 && region.x1 >= 12 : region.y0 <= 6));
  if (facade && nearFacade) {
    const th = T(theme);
    const fillTile = (kind, tx, ty, px, py) => {
      // com px/py: só a planta/pedra numa posição livre (o chão já foi pintado)
      const x = px ?? tx * 16, y = py ?? ty * 16;
      if (kind === 'moonrock') { moonBoulder(ctx0, x, y, tx, ty); return; }
      if (px === undefined) ground(ctx0, x, y, tx, ty, th);
      if (kind === 'ground') return;
      if (kind === 'cliff') { cliff(ctx0, x, y, tx, ty, th.rock ? th : THEMES.mountain); return; }   // paredão igual ao da região
      if (kind === 'rock') boulder(ctx0, x, y, tx, ty, (th.rock || THEMES.plains.rock)[0], {});
      else if (kind === 'lactree') treeSprite(ctx0, x, y, tx, ty, th.tree && th.tree.startsWith('lac-') ? th.tree : 'lac-cedar');
      else treeSprite(ctx0, x, y, tx, ty, kind);
    };
    const solidAt = (tx, ty) => { const ch = tiles[ty]?.[tx]; return ch === undefined || FACADE_SOLID.has(ch); };
    drawCourt(ctx0, facade, (tx, ty) => tiles[ty]?.[tx], solidAt, fillTile);   // a construção que toma o alto da tela
    drawFacade(ctx0, facade, fillTile, solidAt);
  }
  const dung = isDungeonTheme(theme) && theme !== 'house';
  const ctx = ctx0;
  const [rx0, ry0, rx1, ry1] = region ? [Math.max(0, region.x0), Math.max(0, region.y0), Math.min(COLS - 1, region.x1), Math.min(ROWS - 1, region.y1)] : [0, 0, COLS - 1, ROWS - 1];
  if (theme !== 'moon' && theme !== 'moonpast' && theme !== 'house' && theme !== 'train') {
    for (let ty = ry0; ty <= ry1; ty++) for (let tx = rx0; tx <= rx1; tx++) { const ch = tiles[ty][tx]; if (dung) decorDungeon(ctx, ch, tx, ty, theme, tiles); else decorOutdoor(ctx, ch, tx, ty, theme, tiles); }
  }
  if (theme !== 'house') roomLight(ctx, dung, theme);
  if (region) ctx0.restore();
}
function renderRoomBase(canvas, tiles, theme, region, covered) {
  const ctx = canvas.getContext('2d');
  const [rx0, ry0, rx1, ry1] = region ? [Math.max(0, region.x0), Math.max(0, region.y0), Math.min(COLS - 1, region.x1), Math.min(ROWS - 1, region.y1)] : [0, 0, COLS - 1, ROWS - 1];
  ctx.clearRect(rx0 * 16, ry0 * 16, (rx1 - rx0 + 1) * 16, (ry1 - ry0 + 1) * 16);
  for (let ty = ry0; ty <= ry1; ty++) for (let tx = rx0; tx <= rx1; tx++) if (!covered || !covered(tx, ty)) drawTile(ctx, tiles[ty][tx], tx, ty, theme, tiles);
  const tall = new Set(['#', 'T', 'r', 'h', 'n', 'o', 'k', '|', 'Z', 'P', 'X', 'I']);
  const at = (x, y) => (tiles[y] ? tiles[y][x] : undefined);
  const dung = isDungeonTheme(theme);
  for (let ty = ry0; ty <= ry1; ty++) for (let tx = rx0; tx <= rx1; tx++) {
    const ch = tiles[ty][tx];
    const x = tx * 16, y = ty * 16;
    if (tall.has(ch)) continue;
    // A margem vem do próprio terreno; um contorno por ladrilho cria linhas retas sobre a costa.
    if (ch === 'W') continue;
    // nas câmaras de gelo os blocos não projetam sombra no gelo
    if (ch === 'i' || (theme === 'dice' && [at(tx, ty - 1), at(tx - 1, ty)].some((c) => c === '|'))) continue;
    // sombra projetada pelas paredes (de cima e da esquerda), como luz vinda do alto à esquerda
    // (ao ar livre árvores e cercas já têm a própria sombra oval; a faixa reta virava um retângulo escuro à noite)
    const up = at(tx, ty - 1);
    if (tall.has(up) && (dung || (up !== 'T' && up !== 'Z' && up !== 'P'))) R(ctx, x, y, 16, dung ? 4 : 3, dung ? 'rgba(0,0,0,0.32)' : 'rgba(0,0,0,0.22)');
    if (dung && tall.has(at(tx - 1, ty))) R(ctx, x, y, 3, 16, 'rgba(0,0,0,0.22)');
  }
  if(theme==='castlefront') drawCastleFacade(ctx);
}

export function drawWaterShine(ctx, tiles, t, oy) {
  for (let ty = 0; ty < ROWS; ty++) for (let tx = 0; tx < COLS; tx++) {
    const ch = tiles[ty][tx];
    if (ch === 'L') {
      if (Math.sin(t * 2 + tx * 1.7 + ty) > 0.6) R(ctx, tx * 16 + ((hash(tx, ty, 4) * 12) | 0), ty * 16 + oy + ((hash(tx, ty, 6) * 12) | 0), 2, 2, '#ffd23a');
      continue;
    }
    if (ch !== 'W') continue;
    const h = hash(tx, ty, 99);
    const k = ((t * 6 + h * 16) % 16) | 0;
    R(ctx, tx * 16 + k, ty * 16 + oy + 2 + ((h * 10) | 0), 3, 1, 'rgba(180,215,255,0.8)');
    if (Math.sin(t * 3 + h * 10) > 0.7) R(ctx, tx * 16 + ((h * 13) | 0), ty * 16 + oy + 12, 1, 1, '#ffffff');
  }
}

// ---------------------------------------------------------------- herói
// Traje espacial: o macacão já vem pintado no próprio sprite (drawHeroSprite com suit); aqui só entram
// o capacete e a mochila. Capacete = aro de vidro em pixel art em volta da cabeça, sem película por cima
// do rosto (antes um véu azulado embaçava a cara do Lyon), com dois brilhos no alto.
const HELMET = (() => {
  const ring = [], edge = [];
  for (let y = -10; y <= 12; y++) for (let x = -2; x <= 17; x++) {
    const d = Math.hypot((x + 0.5 - 8) / 8.6, (y + 0.5 - 1.8) / 9);
    if (d <= 1 && d > 0.86) ring.push([x, y]); else if (d > 1 && d <= 1.13) edge.push([x, y]);
  }
  return { ring, edge };
})();
export function drawHelmet(ctx, x, y, rows = 16) {
  for (const [px, py] of HELMET.edge) if (py < rows - 5) R(ctx, x + px, y + py, 1, 1, 'rgba(26,18,38,0.55)');
  for (const [px, py] of HELMET.ring) if (py < rows - 5) R(ctx, x + px, y + py, 1, 1, py < 2 ? '#f4f8ff' : '#c8d6ea');
  R(ctx, x + 2, y - 4, 2, 1, '#ffffff'); R(ctx, x + 1, y - 3, 1, 2, '#ffffff');   // brilhos do vidro
  R(ctx, x + 13, y - 3, 1, 1, 'rgba(255,255,255,0.7)');
}
export function drawSuit(ctx, x, y, dir) {
  // o macacão e os cilindros de oxigênio já vêm pintados no próprio Lyon; aqui só entra o capacete
  drawHelmet(ctx, x, y);
}
// Corpo meio submerso (Jerry e Marcos nadando): só a parte de cima aparece, balançando de leve, com marolas e rastro na linha d'água.
// `top` = topo do sprite, `waterY` = linha d'água, `cx` = centro; `fn` desenha o personagem normalmente.
export function inWater(ctx, cx, top, waterY, t, moving, fn) {
  const bob = Math.round(Math.sin(t * (moving ? 9 : 3)) * (moving ? 1 : 0.6));
  ctx.save(); ctx.beginPath(); ctx.rect(cx - 20, top - 30, 40, waterY - top + 30); ctx.clip();
  ctx.translate(0, bob); fn(); ctx.restore();
  const st = Math.floor(t * (moving ? 8 : 3)) % 2;
  R(ctx, cx - 7, waterY, 14, 2, 'rgba(255,255,255,0.55)');
  R(ctx, cx - 6 + st, waterY + 2, 3, 1, '#ffffff'); R(ctx, cx + 3 - st, waterY + 2, 3, 1, '#ffffff');
  if (moving) { R(ctx, cx - 11 - st * 2, waterY + 1, 3, 1, 'rgba(255,255,255,0.6)'); R(ctx, cx + 8 + st * 2, waterY + 1, 3, 1, 'rgba(255,255,255,0.6)'); }
}
export function drawHero(ctx, x, y, dir, frame, opts = {}) {
  const armor = opts.armor || 0;
  if (opts.swim) {
    // só a cabeça e os ombros acima da água, com marolas
    const swimY = opts.suit ? y : y + 3;
    drawHeroSprite(ctx, x, swimY, dir, 0, armor, opts.suit ? 16 : 9, opts.variant || 0, opts.suit ? 'space' : opts.dive ? 'dive' : false);
    // Na Lua, mantenha o capacete e a roupa visíveis enquanto nada.
    // As marolas são desenhadas por cima da parte submersa do traje.
    if (opts.suit) drawSuit(ctx, x, swimY, dir);
    if (opts.dive) drawDiveGear(ctx, x, swimY, dir);
    const st = frame % 2;
    R(ctx, x + 1, y + 12, 14, 2, 'rgba(255,255,255,0.55)');
    R(ctx, x + 2 + st, y + 14, 3, 1, '#ffffff'); R(ctx, x + 11 - st, y + 14, 3, 1, '#ffffff');
    return;
  }
  R(ctx, x + 3, y + 14, 10, 2, 'rgba(0,0,0,0.28)');
  drawHeroSprite(ctx, x, y, dir, frame, armor, 16, opts.variant || 0, opts.suit ? 'space' : opts.dive ? 'dive' : false);
  if (opts.suit) drawSuit(ctx, x, y, dir);
  if (opts.dive) drawDiveGear(ctx, x, y, dir);
  if (opts.crown) {
    R(ctx, x + 5, y - 7, 6, 2, '#ffd23a'); R(ctx, x + 5, y - 8, 1, 1, '#ffd23a'); R(ctx, x + 7, y - 9, 2, 2, '#ffd23a'); R(ctx, x + 10, y - 8, 1, 1, '#ffd23a');
    R(ctx, x + 7, y - 7, 2, 1, '#e8344a');
  }
}

const SWORD_COLORS = [null, ['#dfe7f5', '#ffffff'], ['#b8c0d0', '#e8ecf4'], ['#e8eef8', '#ffffff'], ['#9fe8ff', '#ffffff'], ['#ffd23a', '#fff4b0']];
const SWORD_GEM = [null, '#e8344a', '#4ab0ff', '#7af0a0', '#ffffff', '#ff7ad9'];
const swordCache = new Map();
// Espada em pixel art desenhada uma vez por nível: pomo com joia, empunhadura enrolada, guarda dourada com pontas, lâmina com friso, fio brilhante e ponta fina.
function swordSprite(lvl) {
  if (swordCache.has(lvl)) return swordCache.get(lvl);
  const [c, h] = SWORD_COLORS[lvl] || SWORD_COLORS[1], shade = shadeHex(c.length === 7 ? c : '#b8c0d0', 0.7), len = 9 + Math.min(lvl, 4);
  const cv = document.createElement('canvas'); cv.width = 10 + len; cv.height = 11;
  const k = cv.getContext('2d'), P = (x, y, w, hh, col) => { k.fillStyle = col; k.fillRect(x, y, w, hh); };
  const cy = 5;
  // pomo com joia
  P(0, cy - 1, 2, 3, '#a9822a'); P(0, cy - 1, 1, 1, '#e0c060'); P(0, cy, 1, 1, SWORD_GEM[lvl] || SWORD_GEM[1]);
  // empunhadura enrolada
  P(2, cy - 1, 4, 3, '#4a2e1a'); for (let x = 2; x < 6; x += 2) P(x, cy - 1, 1, 3, '#7a5232'); P(2, cy - 1, 4, 1, '#6a4428');
  // guarda dourada com pontas viradas
  P(6, cy - 4, 2, 9, '#a9822a'); P(6, cy - 4, 1, 9, '#e0c060'); P(5, cy - 4, 1, 1, '#e0c060'); P(5, cy + 4, 1, 1, '#e0c060'); P(8, cy - 4, 1, 1, '#e0c060'); P(8, cy + 4, 1, 1, '#e0c060');
  P(6, cy - 1, 2, 3, '#ffe9a8');
  // lâmina: base, friso central, fio de cima brilhante e de baixo na sombra
  const bl = len - 5;
  P(8, cy - 1, bl, 3, c); P(8, cy - 1, bl, 1, h); P(8, cy + 1, bl, 1, shade); P(9, cy, bl - 2, 1, lvl >= 4 ? '#e8ffff' : shadeHex(c.length === 7 ? c : '#b8c0d0', 0.85));
  // ponta
  P(8 + bl, cy, 1, 1, c); P(8 + bl, cy - 1, 1, 1, h); P(9 + bl, cy, 1, 1, h);
  swordCache.set(lvl, cv);
  return cv;
}
export function drawSwordBlade(ctx, cx, cy, ang, lvl = 1) {
  const l = Math.max(1, Math.min(5, lvl)), cv = swordSprite(l);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(ang);
  if (l >= 4) { ctx.globalAlpha = 0.22 + 0.06 * Math.sin(ang * 3); ctx.fillStyle = l >= 5 ? '#ffd23a' : '#9fe8ff'; ctx.fillRect(7, -3, cv.width - 7, 7); ctx.globalAlpha = 1; }   // brilho das espadas lunares
  ctx.drawImage(cv, -2, -5);
  ctx.restore();
}
// Braço que segura a espada: do ombro até a mão (manga da cor da armadura e mão cor de pele), com contorno escuro; a lâmina sai da mão.
export function drawSwordArm(ctx, sx, sy, hx, hy, armor = 0) {
  const sleeve = (ARMOR[armor] || ARMOR[0])[0], n = Math.max(2, Math.round(Math.hypot(hx - sx, hy - sy)));
  for (const pass of [0, 1]) for (let i = 0; i <= n; i++) {
    const f = i / n, px = Math.round(sx + (hx - sx) * f), py = Math.round(sy + (hy - sy) * f);
    if (pass === 0) R(ctx, px - 1, py - 1, 3, 3, '#1a1226');
    else R(ctx, px - (i === n ? 0 : 0), py, 2, 2, f > 0.62 ? '#ecb890' : sleeve);
  }
}
// Golpe com rastro: arco de luz (pixels que somem para trás) seguindo a lâmina, do início do golpe até o ângulo atual.
export { drawHeroAttack, drawHeroHold, drawHeroPush };
export function drawSwordSwing(ctx, cx, cy, a0, a1, lvl = 1, fade = 1, noBlade = false) {
  const l = Math.max(1, Math.min(5, lvl)), len = 9 + Math.min(l, 4), steps = Math.max(2, Math.round(Math.abs(a1 - a0) / 0.07));
  const col = l >= 5 ? [255, 226, 120] : l >= 4 ? [150, 235, 255] : [225, 238, 255];
  ctx.save();
  for (let i = 0; i <= steps; i++) {
    const f = i / steps, a = a0 + (a1 - a0) * f, tail = Math.pow(f, 1.8) * fade;   // mais forte perto da lâmina
    if (tail < 0.06) continue;
    for (const [r, w] of [[len + 1, 2], [len - 2, 2], [len - 5, 1]]) {
      ctx.globalAlpha = Math.min(0.8, tail * (w === 2 ? 0.8 : 0.45));
      ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
      ctx.fillRect(Math.round(cx + Math.cos(a) * r) - 1, Math.round(cy + Math.sin(a) * r) - 1, w, w);
    }
  }
  ctx.restore();
  if (!noBlade) drawSwordBlade(ctx, cx, cy, a1, lvl);
  // faísca na ponta no fim do golpe
  if (fade < 0.9) { ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 1 - fade; ctx.fillRect(Math.round(cx + Math.cos(a1) * (len + 3)), Math.round(cy + Math.sin(a1) * (len + 3)), 2, 2); ctx.globalAlpha = 1; }
}
export function drawHammerSwing(ctx, cx, cy, ang) {
  // o mesmo martelo do inventário, girando com o cabo na mão do Lyon e a cabeça para fora
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang + Math.PI / 2); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(icon16Canvas('hammer'), -9, -17);
  ctx.restore();
}

// ---------------------------------------------------------------- inimigos
// ---- monstros básicos: mesmo tamanho e animações de antes, com volume (luz e sombra), olhos com brilho e mais detalhes;
// o contorno escuro de 1 pixel é colocado por quem desenha (entities.js)
// Toda a família dos slimes usa este desenho: Slime, Slime Rubro, Geleia Divisora, Gotinha, Geleia Lunar e o Lodo Gigante.
// opts.small = Gotinha (metade do tamanho, desenhada em pixels inteiros); opts.deco = 'moon' (Geleia Lunar)
const SLIME_COLORS = {
  green: ['#5ccf5c', '#3a9a3a', '#b8f5b8', '#2a6a2e'], red: ['#e05a5a', '#a83232', '#ffb3b3', '#7a2224'],
  blue: ['#5a8ae0', '#3a5aa8', '#b8d0ff', '#28407a'], purple: ['#a05ae0', '#6a32a8', '#e0b8ff', '#4a2278'],
  teal: ['#3ec8a4', '#23927a', '#b8f5e4', '#155a4a'], lunar: ['#86dcec', '#3e9cb6', '#e0fbff', '#235f78'],
};
export function drawSlime(ctx, x, y, t, color = 'green', squash = 0, opts = {}) {
  const [c, d, hi, dd] = SLIME_COLORS[color] || SLIME_COLORS.green, s = squash, wob = Math.sin(t * 5) * 0.4, small = !!opts.small;
  R(ctx, x + (small ? 4 : 2), y + 14, small ? 8 : 12, small ? 1 : 2, 'rgba(0,0,0,0.3)');
  // corpo em gota: arredondado em cima e achatado embaixo, com degradê de cima para baixo
  const k0 = small ? 0.58 : 1, rx = (6.6 + s * 2.4 + wob) * k0, ry = (6 - s * 2.2) * k0, cy = 14 - ry;
  for (let py = 0; py < 16; py++) for (let px = 0; px < 16; px++) {
    const dx = (px + 0.5 - 8) / rx, dy = (py + 0.5 - cy) / (py + 0.5 < cy ? ry : ry * 1.15);
    if (dx * dx + dy * dy > 1 || py > 14) continue;
    const k = (py - (cy - ry)) / (ry * 2 + 0.01);
    R(ctx, x + px, y + py, 1, 1, k > 0.78 ? dd : k > 0.55 ? d : px < (small ? 7 : 5) && k < 0.5 ? hi : c);
  }
  const top = Math.round(cy - ry), ey = Math.round(cy - 1);
  if (small) {   // Gotinha: brilho, olhinhos de 2 pixels com pontinho de luz
    R(ctx, x + 6, y + top + 1, 2, 1, '#ffffff');
    R(ctx, x + 6, y + ey, 1, 2, '#1d1d2b'); R(ctx, x + 9, y + ey, 1, 2, '#1d1d2b'); R(ctx, x + 6, y + ey, 1, 1, '#ffffff'); R(ctx, x + 9, y + ey, 1, 1, '#ffffff');
    return;
  }
  R(ctx, x + 4, y + top + 2, 3, 1, '#ffffff'); R(ctx, x + 3, y + top + 3, 2, 1, hi); R(ctx, x + 11, y + top + 4, 1, 1, hi);
  if (opts.deco === 'moon') {   // Lunar: lua crescente na testa e um brilhinho que pisca
    R(ctx, x + 7, y + top + 1, 2, 1, '#fff6c0'); R(ctx, x + 6, y + top + 2, 1, 2, '#fff6c0'); R(ctx, x + 7, y + top + 4, 2, 1, '#fff6c0');
    if (Math.sin(t * 4) > 0.3) { R(ctx, x + 12, y + top + 1, 1, 3, '#ffffff'); R(ctx, x + 11, y + top + 2, 3, 1, '#ffffff'); }
  }
  // olhos grandes com brilho e uma boquinha
  R(ctx, x + 4, y + ey, 3, 3, '#ffffff'); R(ctx, x + 9, y + ey, 3, 3, '#ffffff');
  R(ctx, x + 5, y + ey + 1, 2, 2, '#1d1d2b'); R(ctx, x + 10, y + ey + 1, 2, 2, '#1d1d2b'); R(ctx, x + 5, y + ey + 1, 1, 1, '#ffffff'); R(ctx, x + 10, y + ey + 1, 1, 1, '#ffffff');
  R(ctx, x + 7, y + ey + 3, 2, 1, dd);
  if (Math.sin(t * 3) > 0) { R(ctx, x + 12, y + ey + 2, 1, 1, hi); R(ctx, x + 6, y + 12, 1, 1, hi); }
}
// Yeti: pelo branco com sombra azulada e tufos, rosto azul com presas, braços compridos com garras.
// Anda com passada e balança os braços; quando vai arremessar bolas de neve, levanta os dois braços.
export function drawYeti(ctx, x, y, t, frame, throwing = false) {
  const W = '#f2f6ff', S = '#c6d4e8', D = '#8ea4c2', K = '#5f7696', face = '#86a8da', faceD = '#5878ac', st = frame % 2;
  R(ctx, x + 1, y + 14, 14, 2, 'rgba(0,0,0,0.3)');
  // pernas peludas em passada, pés escuros
  R(ctx, x + 4, y + 11, 3, 4 - st, W); R(ctx, x + 6, y + 11, 1, 4 - st, S); R(ctx, x + 3 - (1 - st), y + 15 - st, 4, 1, D);
  R(ctx, x + 9, y + 11, 3, 3 + st, W); R(ctx, x + 11, y + 11, 1, 3 + st, S); R(ctx, x + 9 + st, y + 14 + st, 4, 1, D);
  ctx.save(); ctx.translate(0, st);   // o corpo sobe e desce a cada passo
  // braços: pendurados balançando, ou os dois para cima na hora do arremesso
  const arm = (side, up, sway) => {
    const ax = x + side;
    const inner = side < 8 ? ax + 2 : ax;   // lado do braço encostado no corpo fica na sombra
    if (up) { R(ctx, ax, y + 1, 3, 7, W); R(ctx, inner, y + 2, 1, 6, D); for (let k = 0; k < 3; k++) R(ctx, ax + k, y, 1, 1, K); return; }
    R(ctx, ax, y + 5 + sway, 3, 7, W); R(ctx, inner, y + 6 + sway, 1, 6, D); R(ctx, ax + (side < 8 ? 0 : 1), y + 5 + sway, 2, 1, '#ffffff');
    R(ctx, ax, y + 11 + sway, 3, 1, S); for (let k = 0; k < 3; k += 2) R(ctx, ax + k, y + 12 + sway, 1, 1, K);   // garras
  };
  // tronco com tufos de pelo e barriga mais clara (os braços ficam por cima, separados pela sombra)
  R(ctx, x + 3, y + 5, 10, 8, W); R(ctx, x + 11, y + 6, 2, 6, S); R(ctx, x + 3, y + 12, 10, 1, S); R(ctx, x + 3, y + 5, 10, 1, S);
  R(ctx, x + 5, y + 7, 6, 4, '#ffffff'); for (const [fx, fy] of [[6, 10], [9, 9], [4, 8], [11, 8]]) R(ctx, x + fx, y + fy, 1, 1, S);
  arm(0, throwing, st ? -1 : 0); arm(13, throwing, st ? 0 : -1);
  // cabeça com topete de pelo e rosto azul
  R(ctx, x + 4, y, 8, 6, W); R(ctx, x + 3, y + 1, 10, 4, W); R(ctx, x + 6, y - 1, 4, 1, W); R(ctx, x + 7, y - 2, 1, 1, W); R(ctx, x + 11, y + 1, 2, 4, S);
  R(ctx, x + 5, y + 2, 6, 4, face); R(ctx, x + 5, y + 2, 6, 1, faceD); R(ctx, x + 5, y + 5, 6, 1, faceD);
  if ((t % 3) < 0.12) { R(ctx, x + 6, y + 3, 1, 1, faceD); R(ctx, x + 9, y + 3, 1, 1, faceD); }
  else { R(ctx, x + 6, y + 3, 1, 1, '#141a2e'); R(ctx, x + 9, y + 3, 1, 1, '#141a2e'); R(ctx, x + 6, y + 2, 1, 1, '#c8dcff'); R(ctx, x + 9, y + 2, 1, 1, '#c8dcff'); }
  R(ctx, x + 6, y + 4, 4, 2, '#2a1626'); R(ctx, x + 6, y + 4, 1, 1, '#ffffff'); R(ctx, x + 9, y + 4, 1, 1, '#ffffff');   // boca com presas
  if (throwing) { R(ctx, x + 6, y + 6, 4, 1, '#2a1626'); }   // rugido
  ctx.restore();
}
export function drawBat(ctx, x, y, t, tint) {
  const ph = Math.sin(t * 20), up = ph > 0.3, mid = Math.abs(ph) <= 0.3;
  R(ctx, x + 5, y + 15, 6, 1, 'rgba(0,0,0,0.22)');
  const body = tint || '#4a3b5c', bodyL = tint ? '#e8703a' : '#6a5a80', wing = tint ? '#9b402b' : '#3e2f52', membrane = tint ? '#ffad54' : '#8a6ab8', eye = tint ? '#ffe060' : '#ff5a70';
  // asas: braço, dedos e membrana recortada (três posições)
  const wy = up ? 2 : mid ? 5 : 7;
  for (const side of [-1, 1]) {
    const X = (px) => (side < 0 ? x + px : x + 15 - px);
    for (let k = 0; k < 5; k++) { const yy = y + wy + (up ? k : mid ? 0 : -Math.floor(k / 2)) ; R(ctx, X(5 - k), yy, 1, 1, wing); R(ctx, X(5 - k), yy + 1, 1, up ? 2 : 2, membrane); }
    R(ctx, X(0), y + wy + (up ? 4 : mid ? 0 : -2), 1, 3, wing); R(ctx, X(2), y + wy + (up ? 3 : mid ? 2 : 1), 1, 1, wing);
  }
  // corpo peludo, orelhas, olhos brilhando e presinhas
  R(ctx, x + 5, y + 6, 6, 6, body); R(ctx, x + 6, y + 5, 4, 1, body); R(ctx, x + 6, y + 6, 2, 3, bodyL); R(ctx, x + 6, y + 11, 4, 1, body);
  R(ctx, x + 5, y + 3, 2, 3, body); R(ctx, x + 9, y + 3, 2, 3, body); R(ctx, x + 5, y + 4, 1, 1, membrane); R(ctx, x + 10, y + 4, 1, 1, membrane);
  R(ctx, x + 6, y + 7, 2, 2, eye); R(ctx, x + 9, y + 7, 2, 2, eye); R(ctx, x + 6, y + 7, 1, 1, '#ffffff'); R(ctx, x + 9, y + 7, 1, 1, '#ffffff');
  R(ctx, x + 7, y + 10, 1, 1, '#ffffff'); R(ctx, x + 9, y + 10, 1, 1, '#ffffff');
}
export function drawSkeleton(ctx, x, y, dir, frame, crown = false) {
  const b = '#ece8dc', d = '#b8b4a6', dd = '#8e8b80', hole = '#241c2c', st = frame % 2, aL = st ? -1 : 1, aR = -aL;
  R(ctx, x + 3, y + 14, 10, 2, 'rgba(0,0,0,0.3)');
  // passada: uma perna à frente, a outra levantada atrás
  R(ctx, x + 5, y + 12, 2, 3 - st, d); R(ctx, x + 5, y + 12, 1, 2 - st, b); R(ctx, x + 4 - (1 - st), y + 15 - st, 3, 1, dd);
  R(ctx, x + 9, y + 12, 2, 2 + st, d); R(ctx, x + 9, y + 12, 1, 1 + st, b); R(ctx, x + 9 + st, y + 14 + st, 3, 1, dd);
  ctx.save(); ctx.translate(0, st);   // o corpo sobe e desce a cada passo
  // costelas, coluna e bacia
  R(ctx, x + 5, y + 8, 6, 4, hole); R(ctx, x + 7, y + 8, 2, 5, b);
  for (const ry of [8, 10]) { R(ctx, x + 5, y + ry, 6, 1, b); R(ctx, x + 5, y + ry, 1, 1, d); R(ctx, x + 10, y + ry, 1, 1, d); }
  R(ctx, x + 5, y + 12, 6, 1, d);
  // braços balançando ao contrário das pernas
  R(ctx, x + 3, y + 8, 2, 1, b); R(ctx, x + 3, y + 9, 1, 3 + aL, d); R(ctx, x + 2, y + 12 + aL, 2, 1, b);
  R(ctx, x + 11, y + 8, 2, 1, b); R(ctx, x + 12, y + 9, 1, 3 + aR, d); R(ctx, x + 12, y + 12 + aR, 2, 1, b);
  // crânio com sombra, órbitas, nariz e dentes (a mandíbula bate)
  R(ctx, x + 4, y + 1, 8, 6, b); R(ctx, x + 5, y, 6, 1, b); R(ctx, x + 11, y + 1, 1, 5, d); R(ctx, x + 5, y + 1, 2, 1, '#ffffff');
  const jaw = (frame % 4) === 1 ? 1 : 0;
  R(ctx, x + 5, y + 7 + jaw, 6, 1, d); R(ctx, x + 6, y + 7 + jaw, 1, 1, b); R(ctx, x + 8, y + 7 + jaw, 1, 1, b); R(ctx, x + 10, y + 7 + jaw, 1, 1, b);
  if (dir !== 1) {
    const o = dir === 2 ? -1 : dir === 3 ? 1 : 0, glow = crown ? '#ff4040' : '#ff8a3a';
    R(ctx, x + 5 + o, y + 3, 2, 2, hole); R(ctx, x + 9 + o, y + 3, 2, 2, hole); R(ctx, x + 6 + o, y + 4, 1, 1, glow); R(ctx, x + 9 + o, y + 4, 1, 1, glow);
    R(ctx, x + 7 + o, y + 5, 2, 1, dd);
  } else R(ctx, x + 6, y + 3, 4, 2, d);
  if (crown) { R(ctx, x + 4, y - 1, 8, 2, '#ffd23a'); R(ctx, x + 4, y - 3, 2, 2, '#ffd23a'); R(ctx, x + 7, y - 3, 2, 2, '#ffd23a'); R(ctx, x + 10, y - 3, 2, 2, '#ffd23a'); R(ctx, x + 7, y - 1, 2, 1, '#ff4040'); }
  ctx.restore();
}
export function drawGhost(ctx, x, y, t, alpha = 0.75) {
  const a0 = ctx.globalAlpha; ctx.globalAlpha = a0 * alpha;
  const c = '#dceaff', m = '#b4ccf4', d = '#8aa8e0';
  // cabeça redonda e um lençol que ondula embaixo
  for (let py = 0; py < 15; py++) for (let px = 1; px < 15; px++) {
    const head = ((px + 0.5 - 8) / 6.4) ** 2 + ((py + 0.5 - 7) / 6.4) ** 2 <= 1;
    const tail = py >= 7 && px >= 2 && px <= 13 && py <= 11 + Math.round(Math.sin(t * 6 + px * 0.9) * 1.5 + 1.5);
    if (!head && !tail) continue;
    R(ctx, x + px, y + py, 1, 1, px <= 4 && py < 9 ? c : px >= 12 || py >= 11 ? d : py >= 9 ? m : c);
  }
  R(ctx, x + 4, y + 2, 3, 1, '#ffffff'); R(ctx, x + 3, y + 3, 1, 2, '#ffffff');
  R(ctx, x + 5, y + 5, 2, 3, '#20203a'); R(ctx, x + 9, y + 5, 2, 3, '#20203a'); R(ctx, x + 5, y + 5, 1, 1, '#ffffff'); R(ctx, x + 9, y + 5, 1, 1, '#ffffff');
  R(ctx, x + 7, y + 9, 2, 2, '#20203a'); R(ctx, x + 4, y + 8, 1, 1, '#ffb8d0'); R(ctx, x + 11, y + 8, 1, 1, '#ffb8d0');
  ctx.globalAlpha = a0;
}
export function drawSentinel(ctx, x, y, lx, ly, flash, t = 0) {
  R(ctx, x + 1, y + 14, 14, 2, 'rgba(0,0,0,0.3)');
  // bloco de pedra entalhado, cantos chanfrados, runas e musgo
  const st = flash ? '#ffffff' : '#6e6888', stL = flash ? '#ffffff' : '#8e88a8', stD = flash ? '#e8e8f0' : '#4e4868';
  R(ctx, x + 1, y + 3, 14, 11, st); R(ctx, x + 2, y + 2, 12, 1, st); R(ctx, x + 2, y + 14, 12, 1, stD);
  R(ctx, x + 1, y + 3, 14, 2, stL); R(ctx, x + 1, y + 12, 14, 2, stD); R(ctx, x + 13, y + 4, 2, 9, stD); R(ctx, x + 1, y + 4, 1, 8, stL);
  R(ctx, x + 2, y + 12, 1, 1, '#5aa04a'); R(ctx, x + 3, y + 13, 2, 1, '#5aa04a'); R(ctx, x + 12, y + 3, 2, 1, '#5aa04a');
  const rune = Math.sin(t * 4) > 0 ? '#9ae0f0' : '#5a9ab8';   // runas pulsando
  R(ctx, x + 2, y + 6, 1, 3, rune); R(ctx, x + 13, y + 7, 1, 3, rune);
  // olho: pálpebras de pedra, branco com sombra, íris vermelha que segue o herói e pupila com brilho
  R(ctx, x + 3, y + 5, 10, 7, '#2a2438'); R(ctx, x + 4, y + 6, 8, 5, '#f4f0e8'); R(ctx, x + 4, y + 6, 8, 1, '#c8c2d4'); R(ctx, x + 4, y + 10, 8, 1, '#d8d2e0');
  const ix = x + 6 + Math.round(lx * 2), iy = y + 7 + Math.round(ly * 1.2);
  R(ctx, ix, iy, 4, 3, '#c0262d'); R(ctx, ix, iy, 4, 1, '#e8464a'); R(ctx, ix + 1, iy + 1, 2, 1, '#1d1d2b'); R(ctx, ix + 1, iy, 1, 1, '#ffffff');
  if ((t % 3.2) < 0.16) { R(ctx, x + 4, y + 6, 8, 5, stD); R(ctx, x + 4, y + 8, 8, 1, '#2a2438'); }   // pálpebra de pedra fechando
}
export function drawWolf(ctx, x, y, dir, frame, white) {
  const c = white ? '#e8eef8' : '#7a7a8a', d = white ? '#b8c2d4' : '#5a5a6a', dd = white ? '#8e98ac' : '#42424e', belly = white ? '#ffffff' : '#a7a8b8', st = frame % 2;
  R(ctx, x + 2, y + 14, 12, 2, 'rgba(0,0,0,0.3)');
  const f = dir === 2 ? -1 : 1, X = (px, w = 1) => (f > 0 ? x + px : x + 16 - px - w);
  // rabo peludo, corpo com dorso escuro e barriga clara, pernas com patas
  R(ctx, X(0, 3), y + 5 - st, 3, 3, c); R(ctx, X(0, 1), y + 4 - st, 1, 2, d); R(ctx, X(0, 2), y + 7 - st, 2, 1, belly);
  R(ctx, X(2, 10), y + 6, 10, 6, c); R(ctx, X(2, 10), y + 6, 10, 2, d); R(ctx, X(3, 7), y + 10, 7, 2, belly); R(ctx, X(4, 1), y + 7, 1, 1, dd); R(ctx, X(7, 1), y + 7, 1, 1, dd);
  R(ctx, X(3, 2), y + 12, 2, 3 - st, d); R(ctx, X(5, 2), y + 12, 2, 2 + st, dd); R(ctx, X(8, 2), y + 12, 2, 2 + st, d); R(ctx, X(10, 2), y + 12, 2, 3 - st, dd);
  for (const px of [3, 10]) R(ctx, X(px, 2), y + 14, 2, 1, '#332a35');
  // cabeça: orelhas com miolo rosa, olho que brilha, focinho comprido e presas
  R(ctx, X(10, 5), y + 3, 5, 5, c); R(ctx, X(10, 5), y + 3, 5, 1, d); R(ctx, X(13, 3), y + 6, 3, 2, c); R(ctx, X(13, 3), y + 8, 3, 1, belly);
  R(ctx, X(10, 2), y + 1, 2, 2, d); R(ctx, X(12, 2), y + 1, 2, 2, d); R(ctx, X(11, 1), y + 2, 1, 1, '#e89aa8');
  R(ctx, X(12, 1), y + 4, 1, 1, '#ffe06a'); R(ctx, X(15, 1), y + 6, 1, 1, '#1d1d2b'); R(ctx, X(13, 1), y + 9, 1, 1, '#ffffff'); R(ctx, X(15, 1), y + 9, 1, 1, '#ffffff');
  R(ctx, X(9, 2), y + 6, 2, 1, white ? '#e0c060' : '#c8382e');
}
export function drawPlant(ctx, x, y, t, open) {
  R(ctx, x + 3, y + 14, 10, 2, 'rgba(0,0,0,0.3)');
  const sway = Math.round(Math.sin(t * 2.4) * 1.5), lf = Math.sin(t * 3) > 0 ? 1 : 0;
  // folhas com nervura e caule curvo, balançando
  R(ctx, x + 2, y + 11 - lf, 5, 3, '#3a8a3a'); R(ctx, x + 3, y + 11 - lf, 4, 1, '#6aca5a'); R(ctx, x + 3, y + 12 - lf, 3, 1, '#2a6a2e');
  R(ctx, x + 9, y + 10 + lf, 5, 3, '#3a8a3a'); R(ctx, x + 9, y + 10 + lf, 4, 1, '#6aca5a'); R(ctx, x + 10, y + 11 + lf, 3, 1, '#2a6a2e');
  R(ctx, x + 7, y + 9, 2, 6, '#2a6a2e'); R(ctx, x + 7, y + 9, 1, 6, '#4caa4a');
  // cabeça: bulbo com pintas, lábios e dentes quando abre
  const hx = x + sway;
  R(ctx, hx + 3, y + 2, 10, 8, '#a02a4a'); R(ctx, hx + 4, y + 1, 8, 1, '#c03a5a'); R(ctx, hx + 3, y + 2, 10, 2, '#d04a6a'); R(ctx, hx + 4, y + 2, 2, 1, '#ff8aa8');
  R(ctx, hx + 4, y + 4, 1, 1, '#ffd0dc'); R(ctx, hx + 11, y + 3, 1, 1, '#ffd0dc'); R(ctx, hx + 6, y + 3, 1, 1, '#ffd0dc');
  if (open) {
    R(ctx, hx + 4, y + 5, 8, 4, '#3a0a1a'); R(ctx, hx + 5, y + 6, 6, 2, '#7a1a3a');
    for (const k of [4, 6, 8, 10]) { R(ctx, hx + k, y + 5, 1, 1, '#ffffff'); R(ctx, hx + k + 1, y + 8, 1, 1, '#ffffff'); }
  } else { R(ctx, hx + 4, y + 7, 8, 1, '#3a0a1a'); R(ctx, hx + 5, y + 8, 1, 1, '#ffffff'); R(ctx, hx + 10, y + 8, 1, 1, '#ffffff'); }
  R(ctx, hx + 3, y + 9, 10, 1, '#7a1a3a');
}
export function drawFrog(ctx, x, y, t, jump) {
  R(ctx, x + 2, y + 14, 12, 2, 'rgba(0,0,0,0.3)');
  const o = jump ? -3 : 0, c = '#4a9a5a', d = '#28633e', l = '#7ac87a';
  // corpo largo com pintas, barriga clara, patas com dedos
  R(ctx, x + 2, y + 8 + o, 12, 6, d); R(ctx, x + 3, y + 7 + o, 10, 6, c); R(ctx, x + 4, y + 7 + o, 6, 1, l);
  R(ctx, x + 5, y + 10 + o, 6, 3, '#d8e8a0'); R(ctx, x + 5, y + 10 + o, 6, 1, '#f0ffd0');
  R(ctx, x + 4, y + 9 + o, 1, 1, d); R(ctx, x + 11, y + 9 + o, 1, 1, d); R(ctx, x + 12, y + 8 + o, 1, 1, '#2a4a2e');
  R(ctx, x + 1, y + 12 + o, 3, 2, d); R(ctx, x + 12, y + 12 + o, 3, 2, d); for (const px of [1, 3, 12, 14]) R(ctx, x + px, y + 14 + o, 1, 1, l);
  // olhos grandes no alto da cabeça, com brilho, e uma boca larga
  R(ctx, x + 3, y + 4 + o, 4, 4, c); R(ctx, x + 9, y + 4 + o, 4, 4, c); R(ctx, x + 3, y + 4 + o, 4, 1, l); R(ctx, x + 9, y + 4 + o, 4, 1, l);
  R(ctx, x + 4, y + 5 + o, 2, 2, '#ffffff'); R(ctx, x + 10, y + 5 + o, 2, 2, '#ffffff'); R(ctx, x + 5, y + 5 + o, 1, 2, '#1d1d2b'); R(ctx, x + 10, y + 5 + o, 1, 2, '#1d1d2b');
  R(ctx, x + 5, y + 9 + o, 6, 1, d); R(ctx, x + 4, y + 8 + o, 1, 1, '#f09a8a'); R(ctx, x + 11, y + 8 + o, 1, 1, '#f09a8a');
  if (!jump && Math.sin(t * 5) > 0.2) { R(ctx, x + 6, y + 10, 4, 2, '#f0ffd0'); R(ctx, x + 5, y + 11, 6, 1, '#d8e8a0'); }   // papo inflando
  if ((t % 2.8) < 0.14) { R(ctx, x + 4, y + 5 + o, 2, 2, c); R(ctx, x + 10, y + 5 + o, 2, 2, c); R(ctx, x + 4, y + 6 + o, 2, 1, d); R(ctx, x + 10, y + 6 + o, 2, 1, d); }   // piscada
}
// Caranguejo em grade de pixels (16×16): pinças abrem e fecham, perninhas alternam
const CRAB_CLAW = { open: ['lb.l', 'bb.b', 'bbbb', 'dbbd', '.dd.', '..d.'], shut: ['.lb.', 'lbbb', 'bbbb', 'dbbd', '.dd.', '..d.'] };
const CRAB_BODY = [
  '....wGi..iGw....',
  '....wik..kiw....',
  '....www..www....',
  '.....d....d.....',
  '...dbbbbbbbbbd..',
  '..bbllwlbbbbbbb.',
  '.dbllbbbbbblbbd.',
  '.dbbbbbmmbbbbbd.',
  '..dbbbbbbbbbbd..',
  '...dddddddddd...',
];
const CRAB_LEGS = ['.d.d.d....d.d.d.', 'd.d.d......d.d.d'];
const CRAB_C = { d: '#8a2a22', b: '#e0603a', l: '#ffad68', w: '#f2eee4', G: '#ffffff', i: '#d8962a', k: '#1d1d2b', m: '#4a1010' };
export function drawCrab(ctx, x, y, t, moving = true) {
  R(ctx, x + 2, y + 14, 12, 2, 'rgba(0,0,0,0.3)');
  const s = moving && Math.sin(t * 10) > 0 ? 1 : 0, claw = CRAB_CLAW[Math.sin(t * 4) > 0 ? 'open' : 'shut'];   // parado, as perninhas descansam
  const put = (row, px, py) => { for (let i = 0; i < row.length; i++) { const c = CRAB_C[row[i]]; if (c) R(ctx, px + i, py, 1, 1, c); } };
  claw.forEach((row, j) => { put(row, x, y + j + s); put([...row].reverse().join(''), x + 12, y + j + s); });
  CRAB_BODY.forEach((row, j) => put(row, x, y + 2 + j));
  put(CRAB_LEGS[s], x, y + 12); put(CRAB_LEGS[1 - s], x, y + 13);
}
export function drawScorpion(ctx, x, y, t, dir) {
  R(ctx, x + 2, y + 14, 12, 2, 'rgba(0,0,0,0.3)');
  const c = '#a8402a', d = '#61211d', l = '#e08043', s = Math.sin(t * 6) * 1.5;
  // perninhas, carapaça em placas e pinças
  for (let i = 0; i < 3; i++) { R(ctx, x + 3 + i * 2, y + 13, 1, 2, d); R(ctx, x + 12 - i * 2, y + 13, 1, 2, d); }
  R(ctx, x + 4, y + 9, 8, 5, d); R(ctx, x + 4, y + 9, 8, 4, c); R(ctx, x + 5, y + 9, 6, 1, l); for (const px of [6, 8, 10]) R(ctx, x + px, y + 10, 1, 3, d);
  R(ctx, x + 1, y + 9, 4, 3, d); R(ctx, x + 1, y + 8, 3, 3, '#bd5632'); R(ctx, x + 1, y + 7, 1, 2, '#bd5632'); R(ctx, x + 1, y + 8, 2, 1, l);
  R(ctx, x + 11, y + 9, 4, 3, d); R(ctx, x + 12, y + 8, 3, 3, '#bd5632'); R(ctx, x + 14, y + 7, 1, 2, '#bd5632'); R(ctx, x + 13, y + 8, 2, 1, l);
  R(ctx, x + 6, y + 11, 1, 1, '#ffe06a'); R(ctx, x + 9, y + 11, 1, 1, '#ffe06a');
  // rabo em gomos curvado para cima, com o ferrão brilhando
  const segs = [[7, 7], [8, 5], [9, 3], [9, 1]];
  segs.forEach(([sx, sy], k) => { const yy = Math.round(sy + s * (k / 3)); R(ctx, x + sx, y + yy, 2, 2, k % 2 ? c : d); R(ctx, x + sx, y + yy, 1, 1, l); });
  const ty = Math.round(1 + s);
  R(ctx, x + 7, y + ty - 1, 3, 2, '#3a1a10'); R(ctx, x + 6, y + ty, 1, 1, '#3a1a10'); R(ctx, x + 7, y + ty - 1, 1, 1, '#ffca50'); R(ctx, x + 6, y + ty + 1, 1, 1, '#ffca50');
}
export function drawMummy(ctx, x, y, frame) {
  const st = frame % 2, band = '#eadfbe', bandD = '#c8bc98', bandL = '#f8f0dc';
  R(ctx, x + 3, y + 14, 10, 2, 'rgba(0,0,0,0.3)');
  // pernas enfaixadas
  R(ctx, x + 5, y + 12, 2, 3 - st, bandD); R(ctx, x + 9, y + 12, 2, 2 + st, bandD); R(ctx, x + 5, y + 12, 1, 2, band);
  // corpo com faixas na diagonal
  R(ctx, x + 4, y + 7, 8, 6, band); R(ctx, x + 4, y + 7, 8, 1, bandL); R(ctx, x + 11, y + 8, 1, 5, bandD);
  for (let k = 0; k < 3; k++) { R(ctx, x + 4 + k, y + 9 + k, 3, 1, bandD); R(ctx, x + 8 + k, y + 8 + k, 2, 1, bandD); }
  // dois braços esticados para a frente, subindo e descendo alternados
  const al = st ? -1 : 0, ar = st ? 0 : -1;
  R(ctx, x + 1, y + 8 + al, 3, 2, band); R(ctx, x + 12, y + 8 + ar, 3, 2, band); R(ctx, x + 1, y + 9 + al, 3, 1, bandD); R(ctx, x + 12, y + 9 + ar, 3, 1, bandD);
  // cabeça lisa e arredondada, só com duas faixas finas e os olhinhos acesos (balança de um lado para o outro)
  ctx.save(); ctx.translate(st ? 1 : 0, 0);
  R(ctx, x + 5, y + 1, 6, 6, band); R(ctx, x + 4, y + 2, 8, 4, band); R(ctx, x + 5, y + 1, 4, 1, bandL);
  R(ctx, x + 4, y + 2, 8, 1, bandD); R(ctx, x + 4, y + 5, 8, 1, bandD);
  R(ctx, x + 6, y + 3, 1, 2, '#ffcc3a'); R(ctx, x + 9, y + 3, 1, 2, '#ffcc3a');
  ctx.restore();
}
export function drawMage(ctx, x, y, t, cast) {
  R(ctx, x + 3, y + 14, 10, 2, 'rgba(0,0,0,0.3)');
  ctx.save(); ctx.translate(0, Math.round(Math.sin(t * 3) * 1.2));   // flutua
  const hem = Math.sin(t * 6) > 0 ? 1 : 0;   // barra do manto ondulando
  // manto com degradê, dobras e barra dourada com runas
  R(ctx, x + 3, y + 6, 10, 9, '#30164e'); R(ctx, x + 4, y + 6, 7, 8, '#7040a0'); R(ctx, x + 4, y + 6, 2, 7, '#9a6ad0'); R(ctx, x + 9, y + 7, 2, 7, '#5a2a8a');
  R(ctx, x + 2, y + 13, 12, 2, '#3e1a64'); R(ctx, x + 2, y + 13, 12, 1, '#e0c060'); R(ctx, x + 2 + hem * 9, y + 15, 3, 1, '#3e1a64'); R(ctx, x + 5, y + 13, 1, 1, '#7af0ff'); R(ctx, x + 9, y + 13, 1, 1, '#7af0ff');
  R(ctx, x + 6, y + 10, 4, 1, '#e0c060'); R(ctx, x + 7, y + 10, 2, 1, '#ffd23a');
  // capuz pontudo com sombra e olhos acesos
  R(ctx, x + 4, y + 2, 8, 5, '#30164e'); R(ctx, x + 5, y + 1, 6, 1, '#5a2a8a'); R(ctx, x + 7, y - 1, 2, 2, '#5a2a8a'); R(ctx, x + 8, y - 2, 1, 1, '#5a2a8a'); R(ctx, x + 5, y + 1, 2, 1, '#9a6ad0');
  R(ctx, x + 5, y + 3, 6, 4, '#120820'); const glow = cast && Math.sin(t * 30) > 0 ? '#ffffff' : '#7af0ff';
  R(ctx, x + 6, y + 4, 1, 1, glow); R(ctx, x + 9, y + 4, 1, 1, glow); R(ctx, x + 4, y + 6, 8, 1, '#c9993a');
  // mão e cajado com orbe brilhante
  R(ctx, x + 11, y + 8, 2, 2, '#d8b8e8'); R(ctx, x + 12, y + 3, 1, 12, '#5a3920'); R(ctx, x + 12, y + 4, 1, 9, '#ad7744');
  const orb = cast && Math.sin(t * 30) > 0 ? '#ffffff' : '#7af0ff';
  R(ctx, x + 11, y, 3, 3, orb); R(ctx, x + 11, y, 1, 1, '#ffffff'); R(ctx, x + 10, y + 1, 1, 1, '#3aa0c8'); R(ctx, x + 14, y + 1, 1, 1, '#3aa0c8');
  ctx.restore();
}
export function drawKnightS(ctx, x, y, dir, frame, white) {
  const a = white ? '#c8d0e0' : '#3a3a4e', h = white ? '#ffffff' : '#6a6a86', d = white ? '#8e98ac' : '#24243a', st = frame % 2;
  R(ctx, x + 3, y + 14, 10, 2, 'rgba(0,0,0,0.3)');
  // pernas com grevas e botas, em passada
  R(ctx, x + 5, y + 12, 2, 3 - st, a); R(ctx, x + 5, y + 12, 1, 1, h); R(ctx, x + 4 - (1 - st), y + 15 - st, 3, 1, d);
  R(ctx, x + 9, y + 12, 2, 2 + st, a); R(ctx, x + 9, y + 12, 1, 1, h); R(ctx, x + 9 + st, y + 14 + st, 3, 1, d);
  ctx.save(); ctx.translate(0, st);   // o corpo sobe e desce a cada passo
  // peitoral com brilho, ombreiras e cinto
  R(ctx, x + 4, y + 7, 8, 6, a); R(ctx, x + 5, y + 7, 3, 2, h); R(ctx, x + 10, y + 8, 2, 4, d); R(ctx, x + 4, y + 11, 8, 1, '#8a6a3a'); R(ctx, x + 7, y + 11, 2, 1, '#e0c060');
  R(ctx, x + 3, y + 7, 2, 3, a); R(ctx, x + 11, y + 7, 2, 3, a); R(ctx, x + 3, y + 7, 2, 1, h); R(ctx, x + 11, y + 7, 2, 1, h);
  // elmo com viseira acesa e penacho
  R(ctx, x + 4, y + 1, 8, 6, a); R(ctx, x + 5, y + 1, 4, 1, h); R(ctx, x + 11, y + 2, 1, 4, d);
  if (dir !== 1) { R(ctx, x + 5, y + 3, 6, 2, '#120c1a'); R(ctx, x + 6, y + 3, 4, 1, '#ff4a4a'); R(ctx, x + 6, y + 4, 1, 1, '#ff9a6a'); }
  R(ctx, x + 6, y - 2, 4, 3, white ? '#3a6ad0' : '#b8323a'); R(ctx, x + 7, y - 3, 3, 1, white ? '#6a9af0' : '#e85a5a');
  // escudo com o brasão
  const sx = dir === 2 ? x + 1 : dir === 3 ? x + 12 : x + 11;
  R(ctx, sx, y + 6, 4, 7, '#5a3a20'); R(ctx, sx, y + 6, 4, 1, '#c9993a'); R(ctx, sx + 1, y + 7, 2, 5, '#8a6a3a'); R(ctx, sx + 1, y + 8, 2, 2, '#e0c060');
  ctx.restore();
}

// Chefes (tamanho base 32x32)
// Serpente das Marés e Moreia-Rainha: o corpo segue o rastro da cabeça
function drawTrailBoss(ctx, type, x, y, t, state, heading, trail) {
  switch (type) {
    case 'moray': { // Moreia-Rainha: enguia comprida que serpenteia; o corpo segue o rastro da cabeça
      const path = [[0, 0], ...(trail || [])];
      const at = (wanted) => {
        let run = 0;
        for (let i = 1; i < path.length; i++) {
          const a = path[i - 1], b = path[i], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
          if (run + len >= wanted && len > 0) { const f = (wanted - run) / len; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; }
          run += len;
        }
        return path[path.length - 1] || [0, 0];
      };
      const segment = (distance, width, tone) => {
        const [sx, sy] = at(distance), before = at(Math.max(0, distance - 3)), after = at(distance + 3);
        const angle = Math.atan2(before[1] - after[1], before[0] - after[0]), wave = Math.sin(t * 6 - distance * 0.2) * 1.4;
        ctx.save(); ctx.translate(sx + Math.sin(angle) * wave, sy - Math.cos(angle) * wave); ctx.rotate(angle);
        R(ctx, -width / 2 - 1, -5, width + 2, 11, '#0f3a28');
        R(ctx, -width / 2, -4, width, 9, tone ? '#2f7a4c' : '#3a8a5a');
        R(ctx, -width / 2 + 1, -4, Math.max(2, width - 3), 2, '#8adcaa');
        R(ctx, -width / 2 + 1, 2, Math.max(2, width - 2), 2, '#e0d890');
        for (const dx of [-3, 2]) R(ctx, dx, -1, 2, 2, '#1f5a3a'); // manchas
        ctx.restore();
      };
      ctx.save(); ctx.translate(x + 16, y + 20);
      const distances = [11, 21, 31, 41, 51, 61, 71, 80, 89];
      distances.forEach((d, i) => segment(d, 14 - Math.floor(i * 0.9), i % 2));
      const [tx, ty] = at(98), tailNear = at(91), tailAngle = Math.atan2(tailNear[1] - ty, tailNear[0] - tx);
      ctx.save(); ctx.translate(tx, ty); ctx.rotate(tailAngle);
      R(ctx, -4, -3, 9, 6, '#0f3a28'); R(ctx, -3, -2, 7, 4, '#2f7a4c'); R(ctx, -7, -2, 4, 4, '#2f7a4c'); R(ctx, -9, -1, 3, 2, '#8adcaa'); ctx.restore();
      ctx.save(); ctx.rotate(heading);
      R(ctx, -6, -9, 14, 18, '#0f3a28'); R(ctx, -5, -8, 13, 16, '#3a8a5a'); R(ctx, -3, -7, 9, 4, '#8adcaa'); R(ctx, -4, 3, 10, 4, '#e0d890');
      const ec = state === 'stun' ? '#4a4a5a' : '#ffe060';
      R(ctx, 1, -7, 4, 4, '#fff3d0'); R(ctx, 1, 3, 4, 4, '#fff3d0'); R(ctx, 2, -6, 3, 3, ec); R(ctx, 2, 4, 3, 3, ec); R(ctx, 3, -5, 1, 2, '#1d1424'); R(ctx, 3, 5, 1, 2, '#1d1424');
      R(ctx, 6, -4, 8, 8, '#1d3a2a'); R(ctx, 7, -3, 8, 6, '#c8455a'); for (const k of [-3, 0, 2]) { R(ctx, 12, k, 3, 1, '#ffffff'); } // boca aberta com presas
      for (const [px, py] of [[-6, -6], [-6, -2], [-6, 2], [-6, 6]]) { R(ctx, px, py, 3, 3, '#fffbe8'); R(ctx, px, py, 1, 1, '#ffffff'); } // coroa de pérolas
      ctx.restore(); ctx.restore(); break;
    }
    case 'serpent': {
      const path = [[0, 0], ...(trail || [])];
      const at = (wanted) => {
        let run = 0;
        for (let i = 1; i < path.length; i++) {
          const a = path[i - 1], b = path[i], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
          if (run + len >= wanted && len > 0) { const f = (wanted - run) / len; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; }
          run += len;
        }
        const end = path[path.length - 1] || [0, 0]; return end;
      };
      const segment = (distance, width, tone) => {
        const [sx, sy] = at(distance), before = at(Math.max(0, distance - 3)), after = at(distance + 3);
        const angle = Math.atan2(before[1] - after[1], before[0] - after[0]);
        const wave = Math.sin(t * 5 - distance * 0.17) * 1.1;
        ctx.save(); ctx.translate(sx + Math.sin(angle) * wave, sy - Math.cos(angle) * wave); ctx.rotate(angle);
        R(ctx, -width / 2 - 1, -4, width + 2, 9, '#103a42');
        R(ctx, -width / 2, -3, width, 7, tone ? '#2d8d89' : '#42b6a7');
        R(ctx, -width / 2 + 1, -3, Math.max(2, width - 3), 2, '#91edcd');
        R(ctx, -width / 2 + 1, 2, Math.max(2, width - 2), 2, '#d4c889');
        R(ctx, -1, -3, 2, 1, '#d8fff0'); R(ctx, width / 2 - 2, 0, 1, 2, '#1c5d63');
        ctx.restore();
      };
      ctx.save(); ctx.translate(x + 16, y + 22);
      // O corpo segue o rastro real da cabeça: placas, barriga clara e cauda afinando.
      const distances = [10, 19, 28, 37, 46, 55, 64, 72];
      distances.forEach((d, i) => segment(d, 12 - Math.floor(i * 0.72), i % 2));
      const [tx, ty] = at(82), tailNear = at(76), tailAngle = Math.atan2(tailNear[1] - ty, tailNear[0] - tx);
      ctx.save(); ctx.translate(tx, ty); ctx.rotate(tailAngle);
      R(ctx, -4, -3, 8, 6, '#103a42'); R(ctx, -3, -2, 6, 4, '#268b83'); R(ctx, -2, -1, 4, 1, '#91edcd');
      R(ctx, -5, -2, 3, 1, '#d4c889'); R(ctx, -5, 1, 3, 1, '#d4c889'); ctx.restore();
      ctx.save(); ctx.rotate(heading);
      R(ctx, -5, -8, 12, 16, '#103a42'); R(ctx, -4, -7, 11, 14, '#268b83'); R(ctx, -2, -6, 8, 4, '#42b6a7');
      R(ctx, 1, -8, 3, 3, '#1c5d63'); R(ctx, 1, 5, 3, 3, '#1c5d63');
      R(ctx, 0, -5, 3, 3, '#ffe080'); R(ctx, 0, 3, 3, 3, '#ffe080');
      R(ctx, 1, -4, 1, 2, '#202030'); R(ctx, 1, 4, 1, 2, '#202030');
      R(ctx, 5, -2, 5, 4, '#16444b'); R(ctx, 6, -1, 5, 2, '#dd5972'); R(ctx, 10, -1, 3, 1, '#ff9eb0'); R(ctx, 10, 0, 3, 1, '#ff9eb0');
      R(ctx, 3, -5, 1, 1, '#ffffff'); R(ctx, 3, 4, 1, 1, '#ffffff');
      ctx.restore(); ctx.restore(); break;
    }
  }
}

export function drawBoss(ctx, type, x, y, t, flash, state, heading = 0, trail = [], walking = true) {
  setBossWalking(walking);
  const body = type === 'serpent' || type === 'moray' ? (c) => drawTrailBoss(c, type, 0, 0, t, state, heading, trail)
    : type === 'echo' ? (c) => knightBody(c, 4, 4, walking ? Math.floor(t * 5) : 0, state, t, true)
    : (c) => BOSS_ART[type]?.(c, t, state);
  bossFxBack(ctx, type, x, y, t);
  const long = type === 'serpent' || type === 'moray';
  const key = [state, walking ? 'w' : 's', long ? Math.floor(t * 30) + ':' + Math.round(heading * 8) + ':' + (trail || []).slice(0, 40).map(([a, b]) => Math.round(a) + ',' + Math.round(b)).join(';') : Math.floor(t * 15)].join('|');
  drawOutlinedBoss(ctx, x, y, t, flash, body, type === 'phantom' ? (state === 'hidden' ? 0.25 : 0.85) : 1, long, 'boss:' + type, key);
  bossFxFront(ctx, type, x, y, t);
}

export function drawKnight(ctx, x, y, frame, state, t, flash, echo = false) {
  R(ctx, x + 2, y + 25, 20, 3, 'rgba(0,0,0,0.35)');
  drawOutlinedBoss(ctx, x, y, t, flash, (c) => knightBody(c, 0, 0, frame, state, t, echo), 1, false, echo ? 'knight:echo' : 'knight', [frame, state, Math.floor(t * 15)].join('|'));
}

// ---------------------------------------------------------------- NPCs
const LOOKS = {
  sage: { skin: '#e8b98a', hair: '#e8e8e8', body: '#6a4a9c', bodyD: '#4f3578', beard: true, hat: '#4f3578' },
  baker: { skin: '#f2c28e', hair: '#8a4b20', body: '#d86a6a', bodyD: '#b04b4b', apron: true, bun: true },
  baker2: { skin: '#e8b080', hair: '#3a2a4a', body: '#6a8ad8', bodyD: '#4a6ab0', apron: true, bun: true },
  merchant: { skin: '#d9a070', hair: '#3a2a1a', body: '#3a8a5a', bodyD: '#2b6a44', cap: '#2b6a44', mustache: true },
  merchant2: { skin: '#b07850', hair: '#1a1a1a', body: '#c8443a', bodyD: '#a0302a', cap: '#ffd23a' },
  fisher: { skin: '#e0a878', hair: '#6a4a2a', body: '#5a7aa8', bodyD: '#46628a', straw: true },
  collector: { skin: '#f2c28e', hair: '#e86a9a', body: '#3ab0b0', bodyD: '#2a8a8a', bun: true },
  smith: { skin: '#c88a5a', hair: '#8a2a1a', body: '#5a4a3a', bodyD: '#3a2e24', apron: true },
  kid: { skin: '#f2c28e', hair: '#d8a03a', body: '#5ab05a', bodyD: '#3a8a3a', small: true },
  kid2: { skin: '#e0a878', hair: '#2a1a0a', body: '#8a6a4a', bodyD: '#6a4e34', small: true },
  guard: { skin: '#e8b98a', hair: '#5a3a1a', body: '#8a8a9a', bodyD: '#6a6a7a', cap: '#5a5a6a' },
  granny: { skin: '#e8c0a0', hair: '#d8d8d8', body: '#8a5a7a', bodyD: '#6a405a', bun: true },
  keeper: { skin: '#f2c28e', hair: '#c8642a', body: '#e8e4d8', bodyD: '#b8b4a6', cap: '#2a4a8a' },
  sailor: { skin: '#d8a070', hair: '#1a1a1a', body: '#2a3a6a', bodyD: '#1a2a4a', cap: '#c8443a', mustache: true },
  sailor2: { skin: '#c88a5a', hair: '#e8e8e8', body: '#3a5a8a', bodyD: '#2a4a6a', beard: true, cap: '#2a3a5a' },
  desert: { skin: '#a8704a', hair: '#1a1a1a', body: '#e8d8b0', bodyD: '#c8b890', turban: '#c8443a' },
  desert2: { skin: '#b07850', hair: '#2a1a0a', body: '#7a3ab0', bodyD: '#5a2a8a', bun: true },
  // visuais próprios para quem antes dividia o mesmo desenho
  sage2: { skin: '#d8a070', hair: '#c8c8c8', body: '#6a7a3a', bodyD: '#4e5a2a', beard: true, straw: true },                 // Seu Joaquim: lavrador de chapéu de palha
  sage3: { skin: '#c89070', hair: '#9a9aa8', body: '#4a4a5a', bodyD: '#34343f', beard: true, hat: '#2a2a34', glasses: true },  // Eremita: manto cinza, capuz escuro e óculos
  granny2: { skin: '#b07850', hair: '#b8c0d8', body: '#3a8a6a', bodyD: '#2a6a4e', bun: true, glasses: true },               // Dona Cida
  granny3: { skin: '#f0c8a8', hair: '#c8a8e0', body: '#d8803a', bodyD: '#b0602a', bun: true, hat: '#a04a7a' },             // Odete
  kid3: { skin: '#c88a5a', hair: '#1a1a1a', body: '#e86a9a', bodyD: '#c04a7a', small: true, bun: true },                   // Mel
  kid4: { skin: '#f2c28e', hair: '#7a4a2a', body: '#3a7ad8', bodyD: '#2a5ab0', small: true, cap: '#c8443a' },              // Tico
  kid5: { skin: '#f0c8a0', hair: '#e8c060', body: '#c8443a', bodyD: '#a0302a', small: true, straw: true },                 // Tom
  smith2: { skin: '#a8704a', hair: '#1a1a1a', body: '#2a3a5a', bodyD: '#1e2a44', apron: true, cap: '#5a3a2a', mustache: true },  // Duda
  merchant3: { skin: '#a8704a', hair: '#1a1a1a', body: '#2a9a8a', bodyD: '#1f7a6c', turban: '#f0ece0', mustache: true },   // Omar, da Casa de Banhos
  baker3: { skin: '#f2c8a0', hair: '#e8c060', body: '#e8903a', bodyD: '#c0702a', apron: true, bun: true },                 // Gilda
  hunter: { skin: '#c88a5a', hair: '#5a3a1a', body: '#3a5a2a', bodyD: '#2a4420', cap: '#6a4a2a', beard: true },            // Rui, caçador de Picoalto
  traveler2: { skin: '#e8b98a', hair: '#9a9aa8', body: '#3a5a9a', bodyD: '#2a4478', straw: true, glasses: true },          // Ulisses
  desert3: { skin: '#c08860', hair: '#1a1a1a', body: '#2a9a9a', bodyD: '#1f7a7a', bun: true, turban: '#e0b040' },   // Yasmin: véu dourado e vestido turquesa
  traveler: { skin: '#e0a878', hair: '#7a4a2a', body: '#7a6a3a', bodyD: '#5a4e2a', straw: true },
  farmer: { skin: '#e0a878', hair: '#a8432a', body: '#c87a3a', bodyD: '#a05a2a', straw: true },
  mystic: { skin: '#f2c28e', hair: '#d8e0ff', body: '#3a5aa8', bodyD: '#2a3e80', bun: true, hat: '#2a3e80' },
  scientist: { skin: '#f2c28e', hair: '#d8d8e8', body: '#3a7ab8', bodyD: '#2a5a90', glasses: true, bun: true },
  astroj: { skin: '#e8b98a', hair: '#7a4a2a', body: '#e8ecf4', bodyD: '#b8bccc', cap: '#ff8a2a' },
  astro: { skin: '#e8b98a', hair: '#e8e8e8', body: '#e8ecf4', bodyD: '#b8bccc', cap: '#ff8a2a', mustache: true },
  scholar: { skin: '#f2c28e', hair: '#7a7a7a', body: '#2a2a3a', bodyD: '#1a1a2a', glasses: true, mustache: true },
  ghost: { ghost: true },
  dog: { dog: true },
};
// Caixa do Breu: caixa de papelão com almofada; o gato preto de cartola só aparece quando "está em casa"
export function drawCatBox(ctx, x, y, t, cat) {
  R(ctx, x, y + 14, 16, 2, 'rgba(0,0,0,0.3)');
  if (cat) {
    const blink = (t % 3.4) < 0.18, tail = Math.sin(t * 2.4) > 0.2 ? 1 : 0;
    const OUT = '#6a5f8c', FUR = '#1b1526', FUR2 = '#2c2440';
    // rabo (curvado para cima, balança)
    R(ctx, x + 13, y + 6 - tail, 2, 5, OUT); R(ctx, x + 14, y + 5 - tail, 2, 3, FUR); R(ctx, x + 13, y + 7 - tail, 1, 4, FUR); R(ctx, x + 14, y + 4 - tail, 1, 1, OUT);
    // corpo escondido na caixa + patinhas na borda
    R(ctx, x + 3, y + 7, 10, 4, OUT); R(ctx, x + 4, y + 8, 8, 3, FUR);
    // cabeça com contorno claro (para não sumir no escuro)
    R(ctx, x + 2, y + 0, 12, 9, OUT); R(ctx, x + 3, y + 1, 10, 7, FUR);
    R(ctx, x + 2, y - 2, 1, 3, OUT); R(ctx, x + 3, y - 2, 2, 4, OUT); R(ctx, x + 11, y - 2, 2, 4, OUT); R(ctx, x + 13, y - 2, 1, 3, OUT);   // orelhas
    R(ctx, x + 3, y - 1, 1, 3, FUR); R(ctx, x + 4, y, 1, 2, FUR); R(ctx, x + 12, y - 1, 1, 3, FUR); R(ctx, x + 11, y, 1, 2, FUR);
    R(ctx, x + 3, y + 1, 1, 1, '#e08aa0'); R(ctx, x + 12, y + 1, 1, 1, '#e08aa0');
    // olhos amarelos grandes com pupila em fenda
    if (blink) { R(ctx, x + 4, y + 4, 3, 1, '#ffd84a'); R(ctx, x + 9, y + 4, 3, 1, '#ffd84a'); }
    else {
      R(ctx, x + 4, y + 3, 3, 3, '#ffd84a'); R(ctx, x + 9, y + 3, 3, 3, '#ffd84a');
      R(ctx, x + 5, y + 3, 1, 3, '#1b1526'); R(ctx, x + 10, y + 3, 1, 3, '#1b1526'); R(ctx, x + 4, y + 3, 1, 1, '#fff6c0'); R(ctx, x + 9, y + 3, 1, 1, '#fff6c0');
    }
    R(ctx, x + 7, y + 6, 2, 1, '#e08aa0'); R(ctx, x + 6, y + 7, 1, 1, FUR2); R(ctx, x + 9, y + 7, 1, 1, FUR2);   // focinho
    R(ctx, x, y + 5, 3, 1, '#cfc8e8'); R(ctx, x, y + 7, 3, 1, '#cfc8e8'); R(ctx, x + 13, y + 5, 3, 1, '#cfc8e8'); R(ctx, x + 13, y + 7, 3, 1, '#cfc8e8');   // bigodes
    // cartola inclinada
    R(ctx, x + 4, y - 1, 8, 2, '#4a4468'); R(ctx, x + 5, y - 7, 6, 6, '#2a2540'); R(ctx, x + 5, y - 7, 6, 1, '#6a6490'); R(ctx, x + 5, y - 3, 6, 1, '#c04a5a'); R(ctx, x + 6, y - 6, 1, 3, '#4a4468');
    // patinhas na borda da caixa
    R(ctx, x + 4, y + 9, 3, 2, '#cfc8e8'); R(ctx, x + 9, y + 9, 3, 2, '#cfc8e8');
  } else R(ctx, x + 3, y + 8, 10, 3, '#2a2030');
  // a caixa de papelão
  R(ctx, x + 1, y + 10, 14, 5, '#a8784a'); R(ctx, x + 1, y + 10, 14, 1, '#d8a870'); R(ctx, x + 1, y + 14, 14, 1, '#7a5230');
  R(ctx, x + 2, y + 12, 2, 2, '#8a6038'); R(ctx, x + 12, y + 12, 2, 2, '#8a6038'); R(ctx, x + 6, y + 12, 4, 1, '#e8cc98'); R(ctx, x + 6, y + 13, 4, 1, '#c89860');
  if (!cat) { R(ctx, x + 2, y + 8, 12, 2, '#8a6038'); R(ctx, x + 1, y + 9, 14, 1, '#d8a870'); }
}
function drawGus(ctx, x, y, t) {
  R(ctx,x-6,y+14,28,3,'rgba(0,0,0,0.3)');
  // Corpo muito redondo, pés curtos e asas pequenas que nunca o tiram do chão.
  for(let py=-7;py<=14;py++)for(let px=-5;px<=21;px++) {
    const d=((px-8)/13)**2+((py-4)/11)**2;
    if(d>1)continue;
    const belly=((px-8)/9)**2+((py-7)/8)**2;
    R(ctx,x+px,y+py,1,1,d>.84?'#4b342b':belly<1?'#e0c794':px<6?'#a27a50':'#805736');
  }
  R(ctx,x-1,y-9,4,5,'#59402e');R(ctx,x+14,y-9,4,5,'#59402e');
  R(ctx,x-1,y-4,8,7,'#e9d8b3');R(ctx,x+9,y-4,8,7,'#e9d8b3');
  const blink=Math.sin(t*.7)>.985;
  if(blink){R(ctx,x+2,y-1,3,1,'#29262a');R(ctx,x+11,y-1,3,1,'#29262a');}
  else for(const ex of [2,11]){R(ctx,x+ex-1,y-3,5,5,'#f0b030');R(ctx,x+ex-1,y-3,5,1,'#ffd870');R(ctx,x+ex,y-2,3,3,'#29262a');R(ctx,x+ex,y-2,1,1,'#ffffff');}   // olhos amarelos de coruja com brilho
  R(ctx,x,y-5,6,2,'#49342a');R(ctx,x+10,y-5,6,2,'#49342a');
  R(ctx,x+6,y+1,4,2,'#d79234');R(ctx,x+7,y+3,2,2,'#b06a28');
  const flap=Math.round(Math.sin(t*7));
  R(ctx,x-5,y+3+flap,3,5,'#5e442f');R(ctx,x+18,y+3-flap,3,5,'#5e442f');
  R(ctx,x+4,y+14,3,2,'#c28a36');R(ctx,x+10,y+14,3,2,'#c28a36');
  R(ctx,x+5,y+5,2,2,'#8a3c3b');R(ctx,x+9,y+5,2,2,'#8a3c3b');R(ctx,x+7,y+6,2,2,'#6b292e');
  for(const yy of [9,12])R(ctx,x+7,y+yy,2,1,'#99764e');
}
// todos os personagens com o mesmo contorno escuro do Lyon (os translúcidos com contorno fraco)
const SOFT_NPC = { ghost: 0.35, captain: 0.35 };
// Povos de Lacrímora e Marélia: "lacFae:2" = mesmo povo, mas com cores próprias e um acessório que distingue cada morador
const NPC_VARIANTS = [
  null,
  { hue: 55, sat: 1.1, acc: 'flower' }, { hue: 140, sat: 1, acc: 'scarf' }, { hue: -70, sat: 1.15, acc: 'glasses' },
  { hue: 200, sat: 0.9, acc: 'bag' }, { hue: -140, sat: 1.1, acc: 'band' },
];
let variantCv = null;
function npcAccessory(ctx, x, y, acc, t) {
  const hy = y + (Math.sin(t * 2) > 0.5 ? 1 : 0);
  if (acc === 'flower') { R(ctx, x + 11, hy - 3, 3, 3, '#ff7ab0'); R(ctx, x + 12, hy - 2, 1, 1, '#ffe08a'); }
  else if (acc === 'scarf') { R(ctx, x + 3, hy + 7, 10, 2, '#e04a4a'); R(ctx, x + 10, hy + 9, 2, 3, '#c03434'); R(ctx, x + 3, hy + 7, 10, 1, '#ff7a6a'); }
  else if (acc === 'glasses') { R(ctx, x + 4, hy + 3, 3, 1, '#1a1426'); R(ctx, x + 9, hy + 3, 3, 1, '#1a1426'); R(ctx, x + 7, hy + 3, 2, 1, '#1a1426'); R(ctx, x + 5, hy + 3, 1, 1, '#d8f0ff'); R(ctx, x + 10, hy + 3, 1, 1, '#d8f0ff'); }
  else if (acc === 'bag') { R(ctx, x + 4, hy + 8, 1, 4, '#6a4220'); R(ctx, x + 11, hy + 11, 4, 4, '#8a5a2c'); R(ctx, x + 11, hy + 11, 4, 1, '#b07a44'); R(ctx, x + 12, hy + 12, 2, 1, '#e8c060'); }
  else if (acc === 'band') { R(ctx, x + 3, hy - 1, 10, 1, '#ffd23a'); R(ctx, x + 7, hy - 2, 2, 2, '#7af0ff'); }
}
export function drawNPC(ctx, x, y, look, t) {
  const vi = typeof look === 'string' ? look.indexOf(':') : -1;
  if (vi > 0) {   // variante: desenha o povo base com outro tom de cor e o acessório do morador
    const base = look.slice(0, vi), V = NPC_VARIANTS[+look.slice(vi + 1)] || null;
    drawOutlinedAt(ctx, x, y, (c) => {
      if (!V) { drawNPCRaw(c, x, y, base, t); return; }
      variantCv ||= document.createElement('canvas'); variantCv.width = 40; variantCv.height = 40;
      const v = variantCv.getContext('2d'); v.clearRect(0, 0, 40, 40);
      v.save(); v.translate(12 - x, 14 - y); drawNPCRaw(v, x, y, base, t); v.restore();
      c.save(); c.filter = `hue-rotate(${V.hue}deg) saturate(${V.sat})`; c.drawImage(variantCv, x - 12, y - 14); c.restore();
      npcAccessory(c, x, y, V.acc, t);
    }, SOFT_NPC[base] ?? 1, 'npc:' + look + ':' + Math.round(x) + ',' + Math.round(y), String(Math.floor(t * 8)));
    return;
  } drawOutlinedAt(ctx, x, y, (c) => drawNPCRaw(c, x, y, look, t), SOFT_NPC[look] ?? 1, 'npc:' + look + ':' + Math.round(x) + ',' + Math.round(y), String(Math.floor(t * 8))); }
function drawNPCRaw(ctx, x, y, look, t) {
  if (look === 'gus') { drawGus(ctx,x,y,t); return; }
  if (look === 'richard' || look === 'richardCalm') { // Richard: mago velho de cabelo branco rebelde, barba e manto roxo, com papéis voando em volta (treme quando agitado)
    const shake = look === 'richard' && Math.sin(t * 13) > 0.82 ? 1 : 0, hy = y + (Math.sin(t * 2) > 0.6 ? 1 : 0);
    drawVillager(ctx, x + shake, y, { skin: '#d8bca6', hair: '#d6d1db', body: '#4a3a72', bodyD: '#3e315f', pants: '#2e2448', beard: true, glasses: true }, t);
    R(ctx, x + 2 + shake, hy - 5, 2, 3, '#e7e1e5'); R(ctx, x + 11 + shake, hy - 4, 3, 2, '#e7e1e5'); R(ctx, x + 6 + shake, hy - 6, 2, 2, '#e7e1e5'); R(ctx, x + 1 + shake, hy - 1, 2, 4, '#c3bdcf'); R(ctx, x + 13 + shake, hy, 2, 5, '#c3bdcf');
    R(ctx, x + 6, y + 9, 4, 1, '#c9a03a'); R(ctx, x + 7, y + 10, 2, 1, '#9a7ae8');
    for (let i = 0; i < 3; i++) { const px = x + Math.round(Math.sin(t + i * 2) * 12) + 7, py = y + Math.round(Math.cos(t + i * 2) * 7) + 7; R(ctx, px, py, 3, 4, '#e8dcbc'); R(ctx, px, py, 3, 1, '#fff4d8'); R(ctx, px + 1, py + 2, 1, 1, '#665873'); }
    return;
  }
  // Gustavo J: nerd de óculos, cabelo curto escuro e enrolado, blusa marrom de manga comprida e calça azul.
  if (look === 'nerd') {
    drawVillager(ctx, x, y, { skin: '#f2caa4', hair: '#1c1618', body: '#8a5a34', bodyD: '#6e4526', pants: '#3a5fa8' }, t);
    const hy = y + (Math.sin(t * 2) > 0.6 ? 1 : 0);
    for (let i = 0; i < 5; i++) R(ctx, x + 3 + i * 2, hy - 5 + (i % 2), 2, 1, '#1c1618');   // cachinhos
    R(ctx, x + 5, hy - 4, 1, 1, '#3a3034'); R(ctx, x + 9, hy - 4, 1, 1, '#3a3034');
    R(ctx, x + 7, y + 8, 2, 1, '#f2e8d0');   // gola da camisa
    // óculos de grau: armação fina com cantos arredondados; os olhos aparecem por dentro
    for (const lx of [4, 8]) {
      R(ctx, x + lx + 1, hy + 2, 2, 1, '#2a2a3a'); R(ctx, x + lx + 1, hy + 5, 2, 1, '#2a2a3a');
      R(ctx, x + (lx === 4 ? lx : lx + 3), hy + 3, 1, 2, '#2a2a3a');   // lado de fora
    }
    R(ctx, x + 7, hy + 3, 2, 1, '#2a2a3a');   // ponte sobre o nariz
    R(ctx, x + 3, hy + 3, 1, 1, '#2a2a3a'); R(ctx, x + 12, hy + 3, 1, 1, '#2a2a3a');   // hastes
    return;
  }
  // Juca: cabeçudo, camisa vermelha, calça jeans, cabelo castanho-escuro curto e ondulado, sorriso, sem barba.
  if (look === 'beach') {
    drawVillager(ctx, x, y, { skin: '#e6b78e', hair: '#3a2a22', body: '#c8382e', bodyD: '#a02a22', pants: '#3a5a8e' }, t);
    const hy = y + (Math.sin(t * 2) > 0.6 ? 1 : 0);
    const sway = Math.round(Math.sin(t * 1.6));
    R(ctx, x + 4 + sway, hy - 5, 2, 1, '#3a2a22'); R(ctx, x + 9, hy - 5, 2, 1, '#3a2a22'); R(ctx, x + 6, hy - 5, 1, 1, '#5a4234');   // ondinhas do cabelo
    R(ctx, x + 6, hy + 6, 4, 2, '#7a2a22'); R(ctx, x + 6, hy + 6, 4, 1, '#f4ecdc');   // sorrisão com dentes
    R(ctx, x + 5, hy + 6, 1, 1, '#a8584a'); R(ctx, x + 10, hy + 6, 1, 1, '#a8584a');
    return;
  }
  if (look === 'turtle') { // Tarta e Dona Concha: tartarugas anciãs de casco verde, coque branco, óculos redondos e bengala
    const bob = Math.sin(t * 1.8) > 0.6 ? 1 : 0, hy = y + 1 + bob, SK = '#8cbf6c', SD = '#6a9a50';
    R(ctx, x + 1, y + 15, 14, 2, 'rgba(0,0,0,0.3)');
    R(ctx, x + 1, y + 6 + bob, 14, 9, '#24462f'); R(ctx, x + 2, y + 5 + bob, 12, 9, '#3a6a48'); R(ctx, x + 2, y + 5 + bob, 12, 2, '#5a9466');
    for (const [px, py] of [[3, 8], [7, 7], [11, 8], [5, 11], [9, 11]]) { R(ctx, x + px, y + py + bob, 3, 2, '#6aa878'); R(ctx, x + px, y + py + bob, 3, 1, '#9ad0a6'); }
    R(ctx, x + 3, y + 13, 3, 3, SK); R(ctx, x + 10, y + 13, 3, 3, SK); R(ctx, x + 3, y + 15, 3, 1, SD); R(ctx, x + 10, y + 15, 3, 1, SD);
    R(ctx, x + 5, y + 9 + bob, 6, 5, '#e2d498'); R(ctx, x + 5, y + 11 + bob, 6, 1, '#c4b67a');
    R(ctx, x + 1, y + 9 + bob, 2, 4, SK); R(ctx, x + 13, y + 9 + bob, 2, 3, SK);
    R(ctx, x + 14, y + 5, 1, 11, '#8a5a2a'); R(ctx, x + 13, y + 4, 3, 1, '#c8984a');
    npcFace(ctx, x, hy - 1, t, SK, { eye: '#1d1424', mouth: '#4a6a3a', cheek: '#d8a090' });
    R(ctx, x + 4, hy - 3, 8, 2, '#f0f0f0'); R(ctx, x + 6, hy - 5, 4, 2, '#f0f0f0'); R(ctx, x + 7, hy - 5, 2, 1, '#ffffff');
    for (const lx of [4, 8]) { R(ctx, x + lx + 1, hy + 1, 2, 1, '#8a5a2a'); R(ctx, x + lx + 1, hy + 4, 2, 1, '#8a5a2a'); R(ctx, x + (lx === 4 ? lx : lx + 3), hy + 2, 1, 2, '#8a5a2a'); }   // óculos redondos fininhos
    R(ctx, x + 7, hy + 2, 2, 1, '#8a5a2a');
    return;
  }
  if (look === 'mermaid') { // Coralina e Marta: sereias de cabelo coral, conchas e cauda turquesa com escamas
    const sway = Math.round(Math.sin(t * 2.5)), bob = Math.sin(t * 2) > 0.5 ? 1 : 0, hy = y + bob, HR = '#e0507a', HD = '#a83258', HL = '#ff8aa8', SK = '#f2c8a0';
    R(ctx, x + 2, y + 15, 12, 2, 'rgba(0,0,0,0.25)');
    R(ctx, x + 2, hy, 12, 10, HD);
    R(ctx, x + 4, y + 9, 8, 4, '#2ab8a8'); R(ctx, x + 5, y + 12, 6, 2, '#1f9a8c'); R(ctx, x + 4, y + 9, 8, 1, '#7ae8d8');
    for (const [sx, sy] of [[5, 10], [8, 10], [6, 12], [9, 11]]) R(ctx, x + sx, y + sy, 2, 1, '#7ae8d8');
    R(ctx, x + 3 + sway, y + 14, 4, 2, '#7ae8d8'); R(ctx, x + 9 - sway, y + 14, 4, 2, '#7ae8d8'); R(ctx, x + 6, y + 14, 4, 1, '#1f9a8c');
    R(ctx, x + 4, hy + 7, 8, 3, SK);
    // conchas nos seios, no estilo da Concha da Lua (perolado lilás com gomo e brilho)
    for (const sx of [4, 9]) { R(ctx, x + sx, hy + 7, 3, 2, '#f2d4ec'); R(ctx, x + sx + 1, hy + 7, 1, 2, '#c890c0'); R(ctx, x + sx, hy + 7, 1, 1, '#ffffff'); R(ctx, x + sx + 1, hy + 9, 1, 1, '#d8a8d0'); }
    R(ctx, x + 2, hy + 7, 2, 4, SK); R(ctx, x + 12, hy + 7, 2, 4, SK);
    npcFace(ctx, x, hy, t, SK, { mouth: '#c8546a', seed: 1 });
    R(ctx, x + 3, hy - 2, 10, 3, HR); R(ctx, x + 4, hy - 3, 8, 1, HR); R(ctx, x + 5, hy - 3, 4, 1, HL); R(ctx, x + 2, hy, 2, 9, HR); R(ctx, x + 12, hy, 2, 9, HR); R(ctx, x + 2, hy + 1, 1, 6, HL);
    R(ctx, x + 11, hy - 2, 2, 2, '#fff0f4'); R(ctx, x + 11, hy - 2, 1, 1, '#ffffff');
    return;
  }
  if (look === 'merman') { // Rui, Orlo e Seu Barata: povo do mar de pele verde-água, gorro vermelho, colete azul e cauda marrom
    const sway = Math.round(Math.sin(t * 2)), bob = Math.sin(t * 2) > 0.5 ? 1 : 0, hy = y + bob, SK = '#7ab8a6';
    R(ctx, x + 2, y + 15, 12, 2, 'rgba(0,0,0,0.25)');
    R(ctx, x + 4, y + 10, 8, 4, '#7a5a3a'); R(ctx, x + 4, y + 10, 8, 1, '#a88a5a'); for (const k of [5, 8]) R(ctx, x + k, y + 12, 2, 1, '#a88a5a');
    R(ctx, x + 3 + sway, y + 14, 4, 2, '#a88a5a'); R(ctx, x + 9 - sway, y + 14, 4, 2, '#a88a5a');
    R(ctx, x + 3, hy + 7, 10, 4, '#3a6a9a'); R(ctx, x + 3, hy + 7, 10, 1, '#5a8aba'); R(ctx, x + 7, hy + 7, 2, 4, '#2a4a78'); R(ctx, x + 5, hy + 9, 1, 1, '#e0c060'); R(ctx, x + 10, hy + 9, 1, 1, '#e0c060');
    R(ctx, x + 1, hy + 8, 2, 4, SK); R(ctx, x + 13, hy + 8, 2, 4, SK);
    npcFace(ctx, x, hy, t, SK, { eye: '#1d1424', mouth: '#3a6a5a', cheek: '#5a9a8a', seed: 2 });
    R(ctx, x + 2, hy + 2, 1, 3, '#5a9a8a'); R(ctx, x + 13, hy + 2, 1, 3, '#5a9a8a');   // barbatanas das orelhas
    R(ctx, x + 3, hy - 3, 10, 3, '#c8382e'); R(ctx, x + 4, hy - 4, 8, 1, '#c8382e'); R(ctx, x + 3, hy - 1, 10, 1, '#8a2418'); R(ctx, x + 5, hy - 3, 1, 2, '#e0504a'); R(ctx, x + 9, hy - 3, 1, 2, '#e0504a'); R(ctx, x + 7, hy - 5, 2, 1, '#e8e0d0');
    const rise = Math.floor(t * 3) % 4; R(ctx, x + 14, y + 4 - rise, 1, 1, '#bfeaff'); R(ctx, x + 13, y + 7 - rise, 1, 1, '#e4f6ff');
    return;
  }
  if (look === 'merchild') { // Pipo e Perolino: peixinhos-lanterna redondos, de olho grande e luzinha na testa
    const bob = Math.round(Math.sin(t * 3)), fy = y + 6 + bob, O = '#e8883a', OD = '#b8602a', OL = '#ffb870', fin = Math.sin(t * 6) > 0 ? 1 : 0;
    R(ctx, x + 3, y + 15, 10, 2, 'rgba(0,0,0,0.25)');
    R(ctx, x + 13, fy + 2 - fin, 2, 4, OL); R(ctx, x + 15, fy + 1 - fin, 1, 6, OL);
    R(ctx, x + 3, fy + 1, 10, 7, OD); R(ctx, x + 4, fy, 8, 8, O); R(ctx, x + 3, fy + 2, 10, 5, O); R(ctx, x + 4, fy, 6, 2, OL); R(ctx, x + 4, fy + 7, 8, 1, OD);
    R(ctx, x + 5, fy + 5, 5, 2, '#ffe0b0'); R(ctx, x + 9, fy + 3, 2, 2, OL);
    R(ctx, x + 4, fy + 2, 4, 4, '#ffffff'); R(ctx, x + 5, fy + 3, 3, 3, '#1d1424'); R(ctx, x + 5, fy + 3, 1, 1, '#ffffff');
    R(ctx, x + 4, fy + 6, 2, 1, '#8a3a2a'); R(ctx, x + 5, fy + 6, 1, 1, '#ffffff');
    R(ctx, x + 7, fy - 4, 1, 4, '#8a6a4a'); R(ctx, x + 6, fy - 5, 1, 1, '#8a6a4a');
    ctx.globalAlpha = 0.25 + 0.15 * Math.sin(t * 4); R(ctx, x + 2, fy - 9, 7, 7, '#fff3a0'); ctx.globalAlpha = 1;
    R(ctx, x + 4, fy - 7, 3, 3, '#fff3a0'); R(ctx, x + 5, fy - 6, 1, 1, '#ffffff');
    return;
  }
  if (look === 'gunter') { drawGunterRaw(ctx, x, y, t, {}); return; }
  if (look === 'diver') { // Dino: cartógrafo de escafandro de latão (o rosto aparece na janelinha), com mapa e mangueira de ar
    const bob = Math.round(Math.sin(t * 2.4)), hy = y + bob, blink = (t % 3.3) < 0.12;
    R(ctx, x + 3, y + 15, 10, 2, 'rgba(0,0,0,0.25)');
    R(ctx, x + 3, y + 14, 4, 2, '#2a3a30'); R(ctx, x + 9, y + 14, 4, 2, '#2a3a30');
    R(ctx, x + 4, hy + 8, 8, 6, '#4a6a5a'); R(ctx, x + 4, hy + 8, 8, 1, '#7a9a8a'); R(ctx, x + 10, hy + 9, 2, 5, '#3a5448'); R(ctx, x + 4, hy + 11, 8, 1, '#c8984a');
    R(ctx, x + 2, hy + 9, 2, 4, '#4a6a5a'); R(ctx, x + 12, hy + 9, 2, 3, '#4a6a5a'); R(ctx, x + 12, hy + 11, 4, 3, '#f2ead0'); R(ctx, x + 13, hy + 12, 2, 1, '#c8382e'); R(ctx, x + 12, hy + 11, 4, 1, '#d8ccaa');
    R(ctx, x + 3, hy, 10, 9, '#a87830'); R(ctx, x + 4, hy - 1, 8, 1, '#a87830'); R(ctx, x + 4, hy, 8, 8, '#c8984a'); R(ctx, x + 4, hy, 3, 2, '#f0d078'); R(ctx, x + 11, hy + 1, 1, 6, '#8a6020');
    for (const [bx, by] of [[3, 3], [12, 3], [3, 6], [12, 6]]) R(ctx, x + bx, hy + by, 1, 1, '#f0d078');
    R(ctx, x + 5, hy + 2, 6, 5, '#2a3a5a'); R(ctx, x + 6, hy + 3, 4, 3, '#e8b88a');
    if (blink) { R(ctx, x + 6, hy + 4, 1, 1, '#a8784a'); R(ctx, x + 9, hy + 4, 1, 1, '#a8784a'); } else { R(ctx, x + 6, hy + 4, 1, 1, '#1d1424'); R(ctx, x + 9, hy + 4, 1, 1, '#1d1424'); }
    ctx.globalAlpha = 0.55; R(ctx, x + 6, hy + 3, 1, 1, '#ffffff'); R(ctx, x + 7, hy + 3, 1, 1, '#ffffff'); ctx.globalAlpha = 1;
    R(ctx, x + 7, hy - 2, 2, 1, '#c8984a'); R(ctx, x + 13, hy + 3, 2, 5, '#8a5a2a'); R(ctx, x + 14, hy + 8, 1, 2, '#8a5a2a');
    return;
  }
  if (look === 'captain') { // Capitão Ondino: eco do capitão, translúcido, de barba, casaco de oficial e quepe
    const a = ctx.globalAlpha; ctx.globalAlpha = a * (0.72 + 0.12 * Math.sin(t * 2));
    drawVillager(ctx, x, y, { skin: '#c8e6f4', hair: '#9ab8d0', body: '#3a5a9a', bodyD: '#2a4478', pants: '#24365e', beard: true }, t);
    const hy = y + (Math.sin(t * 2) > 0.6 ? 1 : 0);
    R(ctx, x + 2, hy - 3, 12, 3, '#1d2a4a'); R(ctx, x + 4, hy - 6, 8, 3, '#1d2a4a'); R(ctx, x + 4, hy - 6, 8, 1, '#2e3e66'); R(ctx, x + 7, hy - 5, 2, 2, '#e0c060'); R(ctx, x + 2, hy - 1, 12, 1, '#e0c060');
    R(ctx, x + 7, y + 9, 2, 1, '#e0c060'); R(ctx, x + 7, y + 11, 2, 1, '#e0c060'); R(ctx, x + 2, y + 8, 2, 1, '#e0c060'); R(ctx, x + 12, y + 8, 2, 1, '#e0c060');
    ctx.globalAlpha = a; return;
  }
  if (look === 'lacBeast') {   // Antigos: povo-fera de Lacrímora, peludo, de focinho claro, presas e olhos âmbar
    const bob = Math.sin(t * 2) > 0.5 ? 1 : 0, hy = y + bob, blink = (t % 3.6) < 0.14;
    const F = '#7e5876', FD = '#5c3d5a', FL = '#a07a96', M = '#d2b496', MD = '#a88a72';
    R(ctx, x + 2, y + 15, 12, 2, 'rgba(8,8,28,0.35)');
    // pés com garras
    R(ctx, x + 3, y + 13, 4, 3, FD); R(ctx, x + 9, y + 13, 4, 3, FD); R(ctx, x + 3, y + 15, 1, 1, '#efe0bd'); R(ctx, x + 6, y + 15, 1, 1, '#efe0bd'); R(ctx, x + 9, y + 15, 1, 1, '#efe0bd'); R(ctx, x + 12, y + 15, 1, 1, '#efe0bd');
    // corpo peludo com barriga clara
    R(ctx, x + 3, hy + 7, 10, 7, F); R(ctx, x + 2, hy + 8, 12, 5, F); R(ctx, x + 3, hy + 7, 10, 1, FL); R(ctx, x + 12, hy + 8, 2, 5, FD);
    R(ctx, x + 5, hy + 9, 6, 4, M); R(ctx, x + 6, hy + 13, 4, 1, MD); R(ctx, x + 2, hy + 12, 1, 1, FL); R(ctx, x + 13, hy + 7, 1, 1, FL);
    // braços fortes com mãos de garra
    R(ctx, x, hy + 8, 3, 5, FD); R(ctx, x + 1, hy + 8, 1, 4, F); R(ctx, x, hy + 13, 3, 1, '#efe0bd');
    R(ctx, x + 13, hy + 8, 3, 5, FD); R(ctx, x + 14, hy + 8, 1, 4, F); R(ctx, x + 13, hy + 13, 3, 1, '#efe0bd');
    // orelhas pontudas com interior rosado
    R(ctx, x + 2, hy - 2, 3, 4, FD); R(ctx, x + 3, hy - 3, 1, 1, FD); R(ctx, x + 3, hy - 1, 1, 2, '#d88aac');
    R(ctx, x + 11, hy - 2, 3, 4, FD); R(ctx, x + 12, hy - 3, 1, 1, FD); R(ctx, x + 12, hy - 1, 1, 2, '#d88aac');
    // cabeça com tufo, focinho claro, olhos âmbar, nariz e presas
    R(ctx, x + 3, hy, 10, 7, F); R(ctx, x + 4, hy - 1, 8, 1, F); R(ctx, x + 4, hy - 1, 6, 1, FL); R(ctx, x + 7, hy - 2, 2, 1, FL); R(ctx, x + 12, hy + 1, 1, 5, FD);
    R(ctx, x + 5, hy + 4, 6, 3, M); R(ctx, x + 6, hy + 7, 4, 1, MD);
    if (blink) { R(ctx, x + 4, hy + 3, 2, 1, '#2a1830'); R(ctx, x + 10, hy + 3, 2, 1, '#2a1830'); }
    else { R(ctx, x + 4, hy + 2, 2, 2, '#2a1830'); R(ctx, x + 10, hy + 2, 2, 2, '#2a1830'); R(ctx, x + 4, hy + 2, 1, 1, '#ffd06a'); R(ctx, x + 10, hy + 2, 1, 1, '#ffd06a'); }
    R(ctx, x + 7, hy + 4, 2, 1, '#2a1830'); R(ctx, x + 7, hy + 6, 2, 1, '#5a2a3a');
    R(ctx, x + 6, hy + 6, 1, 2, '#fff4e0'); R(ctx, x + 9, hy + 6, 1, 2, '#fff4e0');   // presas
    return;
  }
  if (look === 'lacFae') { // Mara e moradores de Lacrímora: fadas de pele azul-clara, cabelo de folhas, antenas e asinhas
    const bob = Math.sin(t * 2) > 0.5 ? 1 : 0, hy = y + bob, SK = '#7ad8e4', HR = '#c5f5e8', flap = Math.sin(t * 6) > 0 ? 1 : 0;
    R(ctx, x + 3, y + 15, 10, 2, 'rgba(8,8,28,0.35)');
    ctx.globalAlpha *= 0.8; R(ctx, x - 1 + flap, hy + 4, 4, 6, '#a3f1df'); R(ctx, x, hy + 3, 2, 1, '#d8fff4'); R(ctx, x + 13 - flap, hy + 4, 4, 6, '#d0b0ff'); R(ctx, x + 14, hy + 3, 2, 1, '#efe0ff'); ctx.globalAlpha /= 0.8;
    R(ctx, x + 4, hy + 8, 8, 6, '#5542a0'); R(ctx, x + 5, hy + 8, 6, 5, '#9470d4'); R(ctx, x + 4, hy + 8, 8, 1, '#b494ec'); R(ctx, x + 3, y + 13, 10, 2, '#5542a0'); R(ctx, x + 3, y + 14, 10, 1, '#3e2e80');
    R(ctx, x + 2, hy + 9, 2, 3, SK); R(ctx, x + 12, hy + 9, 2, 3, SK);
    npcFace(ctx, x, hy, t, SK, { eye: '#302247', cheek: '#c8a0ff', mouth: '#3a7a8a', seed: 3 });
    R(ctx, x + 2, hy + 2, 1, 2, SK); R(ctx, x + 13, hy + 2, 1, 2, SK);   // orelhas pontudas
    R(ctx, x + 3, hy - 2, 10, 3, HR); R(ctx, x + 4, hy - 3, 8, 1, HR); R(ctx, x + 3, hy + 1, 1, 3, HR); R(ctx, x + 12, hy + 1, 1, 3, HR); R(ctx, x + 5, hy - 2, 3, 1, '#ffffff');
    R(ctx, x + 5, hy - 6, 1, 4, '#8de7d1'); R(ctx, x + 4, hy - 7, 2, 1, '#c5f5e8'); R(ctx, x + 10, hy - 6, 1, 4, '#8de7d1'); R(ctx, x + 10, hy - 7, 2, 1, '#c5f5e8');
    return;
  }
  if (look === 'lacCrystal') { // Nara e Vela: povo de cristal, capuz escuro e uma coroa de cristais que brilha
    const bob = Math.sin(t * 2) > 0.5 ? 1 : 0, hy = y + bob, SK = '#9fe4f4', H = '#302858', g = Math.sin(t * 3) > 0 ? '#ffffff' : '#d4fbff';
    R(ctx, x + 3, y + 15, 10, 2, 'rgba(8,8,28,0.35)');
    R(ctx, x + 2, hy - 2, 12, 10, H); R(ctx, x + 3, hy - 3, 10, 1, H);
    R(ctx, x + 4, hy + 8, 8, 7, '#392e70'); R(ctx, x + 5, hy + 8, 6, 6, '#6652ad'); R(ctx, x + 5, hy + 8, 6, 1, '#8a76d0'); R(ctx, x + 7, hy + 9, 2, 4, '#82dcf4');
    R(ctx, x + 2, hy + 8, 2, 4, '#72d5ef'); R(ctx, x + 2, hy + 8, 1, 1, '#ffffff'); R(ctx, x + 12, hy + 8, 2, 4, '#bd8cff'); R(ctx, x + 13, hy + 8, 1, 1, '#f0d8ff');
    npcFace(ctx, x, hy, t, SK, { eye: '#231d3e', cheek: '#c08aff', mouth: '#5a7aa8', seed: 4 });
    R(ctx, x + 3, hy, 1, 7, H); R(ctx, x + 12, hy, 1, 7, H); R(ctx, x + 3, hy - 1, 10, 1, '#4a3f80');
    R(ctx, x + 7, hy - 6, 2, 5, '#d4fbff'); R(ctx, x + 7, hy - 6, 1, 5, g); R(ctx, x + 5, hy - 4, 2, 3, '#b18bff'); R(ctx, x + 9, hy - 4, 2, 3, '#82dcf4'); R(ctx, x + 5, hy - 4, 1, 1, '#f0d8ff');
    return;
  }
  if (look === 'lacMushroom') { // Doran e Sálvia: povo-cogumelo de chapéu rosa pintado, rosto verde-claro e roupa roxa
    const bob = Math.sin(t * 2) > 0.5 ? 1 : 0, hy = y + bob, SK = '#b5e7da';
    R(ctx, x + 3, y + 15, 10, 2, 'rgba(8,8,28,0.35)');
    R(ctx, x + 4, hy + 8, 8, 7, '#493a76'); R(ctx, x + 5, hy + 8, 6, 6, '#9270bf'); R(ctx, x + 5, hy + 8, 6, 1, '#b090d8'); R(ctx, x + 4, hy + 11, 8, 1, '#6a4a2a');
    R(ctx, x + 2, hy + 9, 2, 3, SK); R(ctx, x + 12, hy + 9, 2, 3, SK);
    npcFace(ctx, x, hy, t, SK, { eye: '#27223e', cheek: '#e8a0d0', mouth: '#5a7a6a', seed: 5 });
    R(ctx, x + 1, hy - 1, 14, 3, '#8a3a9a'); R(ctx, x + 2, hy - 3, 12, 3, '#b45bca'); R(ctx, x + 4, hy - 4, 8, 1, '#b45bca'); R(ctx, x + 3, hy - 3, 5, 1, '#d784dc');
    R(ctx, x + 4, hy - 2, 2, 1, '#f4c6f2'); R(ctx, x + 10, hy - 3, 2, 1, '#f4c6f2'); R(ctx, x + 7, hy - 1, 2, 1, '#f4c6f2'); R(ctx, x + 13, hy, 1, 1, '#f4c6f2');
    R(ctx, x + 2, hy + 2, 12, 1, '#e8c8e8');
    return;
  }
  if (look === 'lacMoth') { // Orvo e Maelis: povo-mariposa de asas grandes, gola fofa e antenas de pluma
    const bob = Math.sin(t * 2) > 0.5 ? 1 : 0, hy = y + bob, flap = Math.floor(t * 4) % 2, SK = '#d0b5ec';
    R(ctx, x + 3, y + 15, 10, 2, 'rgba(8,8,28,0.35)');
    R(ctx, x - flap, y + 4, 6, 9, '#46559a'); R(ctx, x + 1 - flap, y + 5, 4, 7, '#5869ad'); R(ctx, x + 2 - flap, y + 7, 2, 3, '#a4d9eb'); R(ctx, x + 2 - flap, y + 6, 1, 1, '#ffffff');
    R(ctx, x + 10 + flap, y + 4, 6, 9, '#6a4aa8'); R(ctx, x + 11 + flap, y + 5, 4, 7, '#8564c6'); R(ctx, x + 12 + flap, y + 7, 2, 3, '#d4a5ef'); R(ctx, x + 13 + flap, y + 6, 1, 1, '#ffffff');
    R(ctx, x + 4, hy + 8, 8, 7, '#34325f'); R(ctx, x + 5, hy + 9, 6, 5, '#4a4680'); R(ctx, x + 3, hy + 7, 10, 2, '#e8dcf4'); R(ctx, x + 4, hy + 9, 8, 1, '#c8b8e4');
    npcFace(ctx, x, hy, t, SK, { eye: '#241d3a', cheek: '#b088d8', mouth: '#7a5aa0', seed: 6 });
    R(ctx, x + 3, hy - 2, 10, 2, '#e8dcf4'); R(ctx, x + 4, hy - 3, 8, 1, '#f4ecff');
    R(ctx, x + 5, hy - 6, 1, 4, '#a7e7ed'); R(ctx, x + 4, hy - 6, 1, 2, '#a7e7ed'); R(ctx, x + 10, hy - 6, 1, 4, '#a7e7ed'); R(ctx, x + 11, hy - 6, 1, 2, '#a7e7ed');
    return;
  }
  if (look === 'celitao') {   // Celitão: topete castanho, barba preta com fios grisalhos, blusão azul e shorts pretos
    drawVillager(ctx, x, y, { skin: '#e7c2a5', hair: '#38251f', body: '#3473bd', bodyD: '#285b9b', pants: '#171923', mustache: true, eye: '#3a8ae0' }, t);
    const hy = y + (Math.sin(t * 2) > 0.6 ? 1 : 0);
    R(ctx, x + 7, hy - 6, 6, 2, '#4a2d23'); R(ctx, x + 10, hy - 7, 3, 1, '#4a2d23'); R(ctx, x + 8, hy - 6, 3, 1, '#6a4436');   // topete
    // barba curta, só no rosto: costeletas, bigode e queixo, sem passar do queixo
    R(ctx, x + 3, hy + 3, 1, 5, '#211d20'); R(ctx, x + 12, hy + 3, 1, 5, '#211d20'); R(ctx, x + 4, hy + 6, 8, 2, '#211d20');
    R(ctx, x + 7, hy + 6, 2, 1, '#8a4a40');   // boca
    R(ctx, x + 5, hy + 7, 1, 1, '#aaa5a1'); R(ctx, x + 10, hy + 6, 1, 1, '#aaa5a1'); R(ctx, x + 12, hy + 5, 1, 1, '#8a8582');   // fios grisalhos
    R(ctx, x + 7, y + 9, 2, 3, '#4b8bd2'); R(ctx, x + 8, y + 9, 1, 3, '#263b5a');   // zíper do blusão
    R(ctx, x + 5, y + 14, 2, 1, '#e0b99c'); R(ctx, x + 9, y + 14, 2, 1, '#d3aa8d');   // pernas de shorts
    return;
  }
  if (look === 'rocker') {   // Monice: cabelo preto comprido, piercings, barba rala, camiseta de banda e guitarra
    const hair = '#14121c', metal = '#e5f4ff', skin = '#f4d2b8';
    const hy = y + (Math.sin(t * 2) > 0.6 ? 1 : 0);
    R(ctx, x + 2, hy - 2, 12, 12, hair); R(ctx, x + 2, hy, 1, 9, '#34303e'); R(ctx, x + 13, hy, 1, 9, '#292633');   // cabelo atrás, até os ombros
    drawVillager(ctx, x, y, { skin, hair, body: '#1c1b27', bodyD: '#111018', pants: '#3d6089' }, t);
    R(ctx, x + 2, hy - 1, 2, 10, hair); R(ctx, x + 12, hy - 1, 2, 10, hair); R(ctx, x + 3, hy + 1, 1, 7, '#34303e');
    R(ctx, x + 4, hy - 1, 4, 2, hair);   // risca lateral
    for (const [dx, dy] of [[5, 7], [7, 8], [9, 8], [11, 7]]) R(ctx, x + dx, hy + dy, 1, 1, '#a88a84');   // barba rala
    R(ctx, x + 11, hy + 2, 1, 1, metal); R(ctx, x + 6, hy + 6, 1, 1, metal); R(ctx, x + 9, hy + 6, 1, 1, metal);   // piercings
    R(ctx, x + 6, y + 9, 4, 1, '#dfd9e5'); R(ctx, x + 7, y + 10, 2, 1, '#c5344c');   // estampa da banda
    // guitarra preta na cintura
    R(ctx, x + 1, y + 11, 6, 4, '#08080e'); R(ctx, x + 2, y + 10, 3, 6, '#08080e'); R(ctx, x + 2, y + 12, 4, 1, '#50505f'); R(ctx, x + 3, y + 13, 1, 1, '#c5344c');
    R(ctx, x + 6, y + 11, 8, 2, '#08080e'); R(ctx, x + 7, y + 11, 7, 1, '#9a9aaa'); R(ctx, x + 13, y + 10, 3, 2, '#262632'); R(ctx, x + 14, y + 10, 1, 1, '#9a9aaa');
    R(ctx, x + 3, y + 10, 2, 1, skin); R(ctx, x + 11, y + 11, 2, 1, skin);
    return;
  }
  const L = LOOKS[look] || LOOKS.sage;
  if (L.ghost) { drawGhost(ctx, x, y - 2 + Math.sin(t * 2) * 1.5, t, 0.6); R(ctx, x + 6, y + 2, 4, 2, '#5a5a8a'); return; }   // Escriba (cemitério, a caminho da Cripta)
  if (L.dog) { // Rufus II: cachorro caramelo de coleira vermelha, rabo abanando e língua de fora
    const w = Math.sin(t * 8) > 0 ? 1 : 0, pant = Math.sin(t * 3) > 0.3, C = '#c8843a', CD = '#9a5e26', CL = '#e0a45a', blink = (t % 3) < 0.12;
    R(ctx, x + 2, y + 14, 12, 2, 'rgba(0,0,0,0.25)');
    R(ctx, x + 1, y + 6 - w, 2, 3, C); R(ctx, x + 1, y + 6 - w, 1, 1, CL); R(ctx, x, y + 5 - w, 1, 2, C);
    R(ctx, x + 3, y + 8, 9, 5, C); R(ctx, x + 3, y + 8, 9, 1, CL); R(ctx, x + 3, y + 12, 9, 1, CD); R(ctx, x + 5, y + 11, 5, 1, '#f0d0a0');
    R(ctx, x + 4, y + 13, 2, 2, CD); R(ctx, x + 6, y + 13, 1, 2, C); R(ctx, x + 9, y + 13, 2, 2, CD); R(ctx, x + 11, y + 13, 1, 2, C);
    R(ctx, x + 10, y + 4, 5, 5, C); R(ctx, x + 10, y + 4, 5, 1, CL); R(ctx, x + 14, y + 7, 2, 2, '#f0d0a0'); R(ctx, x + 15, y + 7, 1, 1, '#1d1d2b');
    R(ctx, x + 10, y + 3, 2, 4, CD); R(ctx, x + 10, y + 3, 1, 1, CL);
    if (blink) R(ctx, x + 12, y + 6, 2, 1, '#1d1d2b'); else { R(ctx, x + 12, y + 5, 2, 2, '#1d1d2b'); R(ctx, x + 12, y + 5, 1, 1, '#ffffff'); }
    R(ctx, x + 10, y + 9, 3, 1, '#c8382e'); R(ctx, x + 11, y + 10, 1, 1, '#ffd23a');
    if (pant) R(ctx, x + 14, y + 9, 1, 2, '#e86a8a');
    return;
  }
  drawVillager(ctx, x, y, L, t);
}
// Rosto no padrão novo (cabeça 10×9 a partir de x+3, hy-1): pele com sombra, olhos 2×2 com brilho que piscam, bochechas e boca.
function npcFace(ctx, x, hy, t, skin, o = {}) {
  const sD = shade(skin, 0.84), sL = shade(skin, 1.08), eye = o.eye || '#2a1a10';
  R(ctx, x + 3, hy - 1, 10, 9, skin); R(ctx, x + 12, hy, 1, 7, sD); R(ctx, x + 4, hy + 7, 8, 1, sD); R(ctx, x + 4, hy - 1, 2, 1, sL);
  if (((t + (o.seed || 0)) % 3.7) < 0.12) { R(ctx, x + 5, hy + 4, 2, 1, eye); R(ctx, x + 9, hy + 4, 2, 1, eye); }
  else { R(ctx, x + 5, hy + 3, 2, 2, eye); R(ctx, x + 9, hy + 3, 2, 2, eye); R(ctx, x + 5, hy + 3, 1, 1, '#ffffff'); R(ctx, x + 9, hy + 3, 1, 1, '#ffffff'); }
  if (o.cheek !== false) { R(ctx, x + 4, hy + 5, 1, 1, o.cheek || '#f09a8a'); R(ctx, x + 11, hy + 5, 1, 1, o.cheek || '#f09a8a'); }
  if (o.mouth !== false) R(ctx, x + 7, hy + 6, 2, 1, o.mouth || shade(skin, 0.6));
}
// Moradores no mesmo padrão do Juca e do Celitão: cabeça grande com cabelo de verdade, olhos com brilho,
// sobrancelhas, bochechas e boca; camisa com luz e sombra, braços com mãos, calça ou saia, pernas e sapatos.
// Cada morador ganha os próprios detalhes: avental, chapéu de mago, boné, turbante, palha, barba, bigode, óculos e coque.
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = (v) => Math.max(0, Math.min(255, Math.round(v * k))); return '#' + ((f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).padStart(6, '0'); };
function drawVillager(ctx, x, y, L, t) {
  const bob = Math.sin(t * 2) > 0.6 ? 1 : 0, sway = Math.round(Math.sin(t * 1.6) * 0.6);
  const kid = !!L.small, dress = !!(L.bun && !L.beard && !L.mustache), oy = kid ? 3 : 0;
  const skin = L.skin, skinD = shade(skin, 0.84), skinL = shade(skin, 1.07), hair = L.hair, hairD = shade(hair, 0.72), hairL = shade(hair, 1.25);
  const body = L.body, bodyD = L.bodyD, bodyL = shade(body, 1.18), pants = L.pants || (dress ? body : shade(bodyD, 0.62)), shoe = '#3a2a22';
  const by = y + oy, hy = y + oy + bob;
  R(ctx, x + 2, y + 15, 12, 2, 'rgba(0,0,0,0.3)');
  // pernas e sapatos (ou saia comprida até os tornozelos)
  if (dress) {
    R(ctx, x + 4, by + 11, 8, 4, bodyD); R(ctx, x + 4, by + 11, 8, 1, body); R(ctx, x + 3, by + 13, 10, 2, bodyD); R(ctx, x + 3, by + 14, 10, 1, shade(bodyD, 0.8));
    R(ctx, x + 5, y + 15, 2, 1, shoe); R(ctx, x + 9, y + 15, 2, 1, shoe);
  } else {
    R(ctx, x + 5, by + 12, 6, Math.max(2, 4 - oy), pants); R(ctx, x + 7, by + 13, 2, Math.max(1, 3 - oy), shade(pants, 0.75)); R(ctx, x + 5, by + 12, 6, 1, shade(pants, 1.2));
    R(ctx, x + 4, y + 15, 4, 1, shoe); R(ctx, x + 8, y + 15, 4, 1, shoe);
  }
  // camisa com luz em cima e sombra embaixo, mangas e mãos
  R(ctx, x + 4, by + 8, 8, 4, body); R(ctx, x + 4, by + 8, 8, 1, bodyL); R(ctx, x + 4, by + 11, 8, 1, bodyD); R(ctx, x + 11, by + 9, 1, 2, bodyD);
  R(ctx, x + 2, by + 8, 2, 3, bodyD); R(ctx, x + 12, by + 8, 2, 3, bodyD); R(ctx, x + 2, by + 8, 1, 2, body);
  R(ctx, x + 2, by + 11 + (sway > 0 ? 1 : 0), 2, 2, skin); R(ctx, x + 12, by + 11 + (sway < 0 ? 1 : 0), 2, 2, skin);
  if (L.apron) { R(ctx, x + 5, by + 9, 6, dress ? 6 : 5, '#f4f0e8'); R(ctx, x + 5, by + 9, 6, 1, '#ffffff'); R(ctx, x + 10, by + 10, 1, 4, '#d8d2c4'); R(ctx, x + 4, by + 10, 8, 1, '#d8d2c4'); }
  // cabeça grande: pele com sombra num lado, cabelo por cima e dos lados
  R(ctx, x + 3, hy - 1, 10, 9, skin); R(ctx, x + 12, hy, 1, 7, skinD); R(ctx, x + 4, hy + 7, 8, 1, skinD); R(ctx, x + 4, hy - 1, 2, 1, skinL);
  R(ctx, x + 3, hy - 3, 10, 3, hair); R(ctx, x + 4, hy - 4, 8, 1, hair); R(ctx, x + 5, hy - 3, 4, 1, hairL);
  R(ctx, x + 2, hy - 1, 1, dress ? 7 : 4, hair); R(ctx, x + 13, hy - 1, 1, dress ? 7 : 4, hairD); R(ctx, x + 3, hy, 1, 2, hair); R(ctx, x + 12, hy, 1, 2, hairD);
  if (L.bun) { R(ctx, x + 6, hy - 6, 4, 3, hair); R(ctx, x + 7, hy - 6, 2, 1, hairL); }
  // rosto: sobrancelhas, olhos com brilho (piscando de vez em quando), bochechas e boca
  const blink = (t % 3.5) < 0.12;
  R(ctx, x + 5, hy + 2, 2, 1, hairD); R(ctx, x + 9, hy + 2, 2, 1, hairD);
  if (blink) { R(ctx, x + 5, hy + 4, 2, 1, '#2a1a10'); R(ctx, x + 9, hy + 4, 2, 1, '#2a1a10'); }
  else {
    const iris = L.eye || '#2a1a10';
    R(ctx, x + 5, hy + 3, 2, 2, iris); R(ctx, x + 9, hy + 3, 2, 2, iris);
    if (L.eye) { R(ctx, x + 6, hy + 4, 1, 1, '#1a1a2a'); R(ctx, x + 10, hy + 4, 1, 1, '#1a1a2a'); }   // pupila no olho colorido
    R(ctx, x + 5, hy + 3, 1, 1, '#ffffff'); R(ctx, x + 9, hy + 3, 1, 1, '#ffffff');
  }
  R(ctx, x + 4, hy + 5, 1, 1, '#f09a8a'); R(ctx, x + 11, hy + 5, 1, 1, '#f09a8a');
  if (!L.beard && !L.mustache) R(ctx, x + 7, hy + 6, 2, 1, '#a8584a');
  if (L.glasses) { R(ctx, x + 4, hy + 3, 4, 3, '#c9a03a'); R(ctx, x + 8, hy + 3, 4, 3, '#c9a03a'); R(ctx, x + 5, hy + 4, 2, 1, '#2a1a10'); R(ctx, x + 9, hy + 4, 2, 1, '#2a1a10'); R(ctx, x + 5, hy + 3, 1, 1, '#e8f4ff'); R(ctx, x + 9, hy + 3, 1, 1, '#e8f4ff'); }
  if (L.mustache) { R(ctx, x + 5, hy + 6, 6, 1, hair); R(ctx, x + 4, hy + 7, 1, 1, hair); R(ctx, x + 11, hy + 7, 1, 1, hair); }
  if (L.beard) { R(ctx, x + 4, hy + 6, 8, 3, '#f0f0f0'); R(ctx, x + 5, hy + 9, 6, 2, '#f0f0f0'); R(ctx, x + 6, hy + 11, 4, 1, '#d8d8d8'); R(ctx, x + 7, hy + 6, 2, 1, '#c8c8c8'); }
  // chapéus
  if (L.hat) { // chapéu pontudo de mago, com aba e estrela
    R(ctx, x + 1, hy - 3, 14, 2, L.hat); R(ctx, x + 1, hy - 3, 14, 1, shade(L.hat, 1.3)); R(ctx, x + 4, hy - 6, 8, 3, L.hat); R(ctx, x + 5, hy - 9, 6, 3, L.hat); R(ctx, x + 7, hy - 12, 3, 3, L.hat); R(ctx, x + 9, hy - 13, 2, 2, L.hat);
    R(ctx, x + 5, hy - 6, 1, 3, shade(L.hat, 1.3)); R(ctx, x + 7, hy - 7, 2, 2, '#ffd23a');
  }
  if (L.cap) { R(ctx, x + 3, hy - 4, 10, 3, L.cap); R(ctx, x + 4, hy - 5, 8, 1, L.cap); R(ctx, x + 5, hy - 4, 4, 1, shade(L.cap, 1.3)); R(ctx, x + 2, hy - 1, 7, 1, shade(L.cap, 0.75)); }
  if (L.turban) { R(ctx, x + 2, hy - 5, 12, 4, L.turban); R(ctx, x + 3, hy - 6, 10, 1, L.turban); R(ctx, x + 3, hy - 4, 10, 1, shade(L.turban, 1.3)); R(ctx, x + 2, hy - 2, 12, 1, shade(L.turban, 0.75)); R(ctx, x + 7, hy - 5, 2, 2, '#ffd23a'); }
  if (L.straw) { R(ctx, x, hy - 2, 16, 2, '#e8cf7a'); R(ctx, x, hy - 1, 16, 1, '#c9a84a'); R(ctx, x + 4, hy - 5, 8, 3, '#e8cf7a'); R(ctx, x + 4, hy - 3, 8, 1, '#c8443a'); R(ctx, x + 5, hy - 5, 3, 1, '#f8e8a8'); }
}

// ---------------------------------------------------------------- objetos
export function drawChest(ctx, x, y, open, big = false) {
  R(ctx, x + 1, y + 13, 14, 3, 'rgba(0,0,0,0.3)');
  const w = big ? '#5a3a8a' : '#9a5a2a', wd = big ? '#3a2460' : '#6b3a18', top = big ? '#7a52b0' : '#b06a34', g = big ? '#ffd23a' : '#e0c060', gd = big ? '#b88a1a' : '#a8862a', ol = '#2a160c';
  if (!open) {
    R(ctx, x + 1, y + 3, 14, 12, ol);
    R(ctx, x + 2, y + 4, 12, 4, top); R(ctx, x + 2, y + 4, 12, 1, shadeHex(top, 1.25)); R(ctx, x + 3, y + 3, 10, 1, top);   // tampa abaulada
    R(ctx, x + 2, y + 8, 12, 6, w); R(ctx, x + 2, y + 8, 12, 1, wd); R(ctx, x + 2, y + 13, 12, 1, wd);
    for (const k of [5, 10]) R(ctx, x + k, y + 9, 1, 4, wd);                                                                 // tábuas
    R(ctx, x + 2, y + 4, 2, 10, g); R(ctx, x + 12, y + 4, 2, 10, gd); R(ctx, x + 2, y + 4, 1, 10, shadeHex(g, 1.2));           // cantoneiras
    R(ctx, x + 6, y + 6, 4, 5, g); R(ctx, x + 6, y + 6, 4, 1, shadeHex(g, 1.25)); R(ctx, x + 7, y + 8, 2, 2, '#1d1d2b');         // fechadura
    if (big) { R(ctx, x + 7, y + 4, 2, 1, '#ffffff'); }
  } else {
    R(ctx, x + 1, y + 1, 14, 6, ol); R(ctx, x + 2, y + 2, 12, 4, wd); R(ctx, x + 2, y + 2, 12, 1, g); R(ctx, x + 2, y + 2, 2, 4, g); R(ctx, x + 12, y + 2, 2, 4, gd);
    R(ctx, x + 1, y + 6, 14, 9, ol); R(ctx, x + 2, y + 7, 12, 7, w); R(ctx, x + 3, y + 7, 10, 3, '#1a0c04'); R(ctx, x + 3, y + 7, 10, 1, '#3a2010');
    R(ctx, x + 2, y + 7, 2, 7, g); R(ctx, x + 12, y + 7, 2, 7, gd); R(ctx, x + 2, y + 13, 12, 1, wd);
  }
}
export function drawSign(ctx, x, y) {
  R(ctx, x + 3, y + 13, 10, 3, 'rgba(0,0,0,0.25)');
  R(ctx, x + 7, y + 9, 2, 6, '#4a2c14'); R(ctx, x + 7, y + 9, 1, 6, '#6b4226');
  R(ctx, x, y + 1, 16, 10, '#4a2c14');
  R(ctx, x + 1, y + 2, 14, 8, '#a8743e'); R(ctx, x + 1, y + 2, 14, 1, '#d8a46a'); R(ctx, x + 1, y + 6, 14, 1, '#8a5a30'); R(ctx, x + 1, y + 9, 14, 1, '#7a4e28');
  R(ctx, x + 1, y + 3, 1, 1, '#4a4a56'); R(ctx, x + 14, y + 3, 1, 1, '#4a4a56'); R(ctx, x + 1, y + 8, 1, 1, '#4a4a56'); R(ctx, x + 14, y + 8, 1, 1, '#4a4a56');
  R(ctx, x + 3, y + 4, 9, 1, '#5a3418'); R(ctx, x + 3, y + 7, 6, 1, '#5a3418'); R(ctx, x + 10, y + 7, 3, 1, '#5a3418');
}
// Textos que são papel, não placa: diários, registros, cartas, receitas, bilhetes e anotações.
const PAPER_DIARY = /^(di[aá]rio|caderno|registro|[uú]ltimo registro|[uú]ltima p[aá]gina|livro de|transcri)/i;
const PAPER_LETTER = /^(carta|mensagem|bilhete)(?![a-zà-ú])/i;
const PAPER_NOTE = /^(receita|lista de|quadro de|painel de|amostra|escala|instru|anota|cartaz|aviso|[uú]ltimo aviso|melodia|o s[ií]mbolo|senha|ligue|quatro pedras|nota|pista|p[aá]gina|relat|manuscrito)/i;
export function paperKind(o) {
  const title = String(Array.isArray(o.text) ? o.text[0] : o.text || '');
  if (/^placa/i.test(title)) return null;
  if (o.look === 'paper') return 'note';
  if (PAPER_LETTER.test(title)) return 'letter';
  if (o.record || PAPER_DIARY.test(title)) return 'diary';
  if (o.stLog || o.memory || PAPER_NOTE.test(title)) return 'note';
  return null;
}
export function drawPaper(ctx, x, y, kind, t = 0) {
  R(ctx, x + 2, y + 13, 12, 3, 'rgba(0,0,0,0.25)');
  if (kind === 'diary') { // caderno de capa de couro com fita
    R(ctx, x + 2, y + 3, 12, 11, '#3a2410'); R(ctx, x + 3, y + 3, 10, 10, '#7a4a28'); R(ctx, x + 3, y + 3, 10, 1, '#a8703c'); R(ctx, x + 3, y + 3, 2, 10, '#5e3a1e');
    R(ctx, x + 6, y + 5, 6, 6, '#e8dcb8'); R(ctx, x + 7, y + 6, 4, 1, '#8a7a5a'); R(ctx, x + 7, y + 8, 3, 1, '#8a7a5a'); R(ctx, x + 10, y + 11, 2, 4, '#c8382e');
    R(ctx, x + 6, y + 5, 6, 1, '#fffbe8'); return;
  }
  if (kind === 'letter') { // envelope lacrado
    R(ctx, x + 1, y + 5, 14, 9, '#5e5238'); R(ctx, x + 2, y + 6, 12, 7, '#f2ead0'); R(ctx, x + 2, y + 6, 12, 1, '#fffbe8');
    for (let i = 0; i < 5; i++) { R(ctx, x + 2 + i, y + 7 + (i >> 1), 1, 1, '#b8a888'); R(ctx, x + 13 - i, y + 7 + (i >> 1), 1, 1, '#b8a888'); }
    R(ctx, x + 6, y + 9, 4, 4, '#a82a2a'); R(ctx, x + 7, y + 10, 2, 2, '#e05a5a'); return;
  }
  // folha solta pregada com um alfinete, presa por uma pedrinha
  R(ctx, x + 3, y + 2, 11, 12, '#5e5238'); R(ctx, x + 4, y + 3, 9, 10, '#f2ead0'); R(ctx, x + 4, y + 3, 9, 1, '#fffbe8');
  R(ctx, x + 11, y + 2, 3, 3, '#cfc29a'); R(ctx, x + 11, y + 4, 3, 1, '#a89a70');
  for (const [lx, ly, lw] of [[5, 6, 7], [5, 8, 6], [5, 10, 7]]) R(ctx, x + lx, y + ly, lw, 1, '#8a7a5a');
  R(ctx, x + 7, y + 3, 2, 2, '#c8382e'); R(ctx, x + 7, y + 3, 1, 1, '#ff8a7a');
  R(ctx, x + 2, y + 12, 3, 2, '#8a8a98'); R(ctx, x + 2, y + 12, 3, 1, '#b4b4c4');
}
export function drawGrave(ctx, x, y) {
  R(ctx, x + 2, y + 13, 12, 3, 'rgba(0,0,0,0.25)');
  R(ctx, x + 2, y + 4, 12, 11, '#3e404c'); R(ctx, x + 3, y + 2, 10, 2, '#3e404c'); R(ctx, x + 5, y + 1, 6, 1, '#3e404c');
  R(ctx, x + 3, y + 4, 10, 10, '#8d8f9a'); R(ctx, x + 4, y + 3, 8, 1, '#8d8f9a'); R(ctx, x + 6, y + 2, 4, 1, '#a8aab6');
  R(ctx, x + 3, y + 4, 2, 10, '#b4b6c2'); R(ctx, x + 11, y + 4, 2, 10, '#6e707c'); R(ctx, x + 4, y + 3, 3, 1, '#c4c6d2');
  R(ctx, x + 7, y + 5, 2, 7, '#5e606c'); R(ctx, x + 5, y + 7, 6, 2, '#5e606c'); R(ctx, x + 7, y + 5, 1, 7, '#4a4c58');
  R(ctx, x + 2, y + 13, 12, 2, '#5a5c68'); R(ctx, x + 3, y + 14, 3, 1, '#4c8a3c'); R(ctx, x + 11, y + 13, 2, 2, '#4c8a3c');   // musgo na base
  R(ctx, x + 10, y + 9, 1, 3, '#4a4c58');   // rachadura
}
export function drawDoor(ctx, x, y, kind, side) {
  if (kind === 'boss') {
    // portão do chefe: madeira vermelha com faixas e cravos de ouro e um selo de caveira
    R(ctx, x, y, 16, 16, '#2a0c12'); R(ctx, x + 1, y + 1, 14, 15, '#7a2232'); R(ctx, x + 1, y + 1, 14, 1, '#a83a4a');
    for (let k = 4; k < 16; k += 4) R(ctx, x + k, y + 1, 1, 15, '#5a1a24');
    for (const ry of [3, 12]) { R(ctx, x + 1, y + ry, 14, 2, '#c9993a'); R(ctx, x + 1, y + ry, 14, 1, '#f0d068'); for (let k = 2; k < 15; k += 4) R(ctx, x + k, y + ry, 1, 1, '#fff0a0'); }
    R(ctx, x + 4, y + 5, 8, 7, '#e0c060'); R(ctx, x + 5, y + 6, 6, 5, '#7a2232'); R(ctx, x + 6, y + 6, 4, 3, '#e8e4d4'); R(ctx, x + 6, y + 7, 1, 1, '#1d1d2b'); R(ctx, x + 9, y + 7, 1, 1, '#1d1d2b'); R(ctx, x + 7, y + 9, 2, 2, '#1d1d2b');
  } else if (kind === 'oneway') {
    R(ctx, x, y, 16, 16, '#1a1424');
    for (let k = 1; k < 16; k += 4) { R(ctx, x + k, y, 2, 16, '#5a5470'); R(ctx, x + k, y, 1, 16, '#7a7490'); }
    R(ctx, x + 3, y + 4, 10, 8, '#1a1424'); R(ctx, x + 4, y + 5, 8, 6, '#2a2434');
    R(ctx, x + 5, y + 7, 6, 2, '#e8344a'); R(ctx, x + 9, y + 6, 1, 4, '#e8344a'); R(ctx, x + 10, y + 7, 1, 2, '#e8344a');
  } else if (kind === 'shutter') {
    R(ctx, x, y, 16, 16, '#2a2a34');
    for (let k = 0; k < 16; k += 3) { R(ctx, x + 1, y + k, 14, 2, '#5a5a6a'); R(ctx, x + 1, y + k, 14, 1, '#8a8a9a'); }
    R(ctx, x, y + 6, 16, 3, '#2a2a34'); R(ctx, x + 2, y + 7, 2, 1, '#e8c040'); R(ctx, x + 6, y + 7, 2, 1, '#2a2a34'); R(ctx, x + 10, y + 7, 2, 1, '#e8c040');
  } else {
    // porta trancada: madeira, ferragens e cadeado
    R(ctx, x, y, 16, 16, '#2a160a'); R(ctx, x + 1, y + 1, 14, 15, '#7a4a22'); R(ctx, x + 1, y + 1, 14, 1, '#a8743e');
    for (let k = 4; k < 16; k += 4) { R(ctx, x + k, y + 1, 1, 15, '#5b3416'); R(ctx, x + k + 1, y + 1, 1, 15, '#8a5a30'); }
    for (const ry of [3, 11]) { R(ctx, x + 1, y + ry, 14, 2, '#3a3a44'); R(ctx, x + 1, y + ry, 14, 1, '#6a6a78'); }
    R(ctx, x + 5, y + 6, 6, 6, '#a8862a'); R(ctx, x + 5, y + 6, 6, 1, '#f0d068'); R(ctx, x + 6, y + 4, 4, 3, '#a8862a'); R(ctx, x + 7, y + 5, 2, 1, '#2a160a');
    R(ctx, x + 7, y + 8, 2, 2, '#1d1d2b'); R(ctx, x + 7, y + 10, 2, 1, '#1d1d2b');
  }
}
export function drawGate(ctx, x, y, openK = 0) {
  const lift = Math.round(openK * 14), h = 16 - lift;
  if (h <= 0) return;
  R(ctx, x, y + h - 1, 16, 1, 'rgba(0,0,0,0.3)');
  for (let k = 1; k < 16; k += 4) { R(ctx, x + k, y, 2, h, '#3a3a48'); R(ctx, x + k, y, 1, h, '#8a8a9a'); if (h > 3) R(ctx, x + k, y + h - 3, 2, 3, '#5a5a6a'); R(ctx, x + k, y + h - 1, 2, 1, '#c8c8d8'); }
  if (h > 4) { R(ctx, x, y + 3, 16, 2, '#2a2a36'); R(ctx, x, y + 3, 16, 1, '#6a6a7a'); }
  if (h > 11) { R(ctx, x, y + 10, 16, 2, '#2a2a36'); R(ctx, x, y + 10, 16, 1, '#6a6a7a'); }
}
export function drawSeal(ctx, x, y, t) {
  // barreira mágica: placa com runas e moldura violeta que pulsa
  const a = 0.5 + Math.sin(t * 3 + x) * 0.25;
  R(ctx, x, y, 16, 16, '#24143e'); R(ctx, x + 1, y + 1, 14, 14, '#3a2068');
  ctx.globalAlpha = a; R(ctx, x + 1, y + 1, 14, 14, '#7a4ad8'); ctx.globalAlpha = 1;
  R(ctx, x + 1, y + 1, 14, 1, '#b48cff'); R(ctx, x + 1, y + 14, 14, 1, '#24143e');
  R(ctx, x + 7, y + 3, 2, 10, '#e8d8ff'); R(ctx, x + 3, y + 7, 10, 2, '#e8d8ff'); R(ctx, x + 5, y + 5, 6, 6, '#e8d8ff'); R(ctx, x + 6, y + 6, 4, 4, '#7a4ad8'); R(ctx, x + 7, y + 7, 2, 2, '#ffffff');
  for (const [cx, cy] of [[2, 2], [12, 2], [2, 12], [12, 12]]) R(ctx, x + cx, y + cy, 2, 2, '#d8b8ff');
}
export function drawEye(ctx, x, y, on, t) {
  // olho de pedra na parede: pálpebra lavrada; resolvido, ele se fecha e acende uma linha verde
  R(ctx, x + 1, y + 2, 14, 12, '#2a2836'); R(ctx, x + 2, y + 3, 12, 10, '#6a6878'); R(ctx, x + 2, y + 3, 12, 1, '#9a98a8'); R(ctx, x + 2, y + 12, 12, 1, '#4a4858');
  R(ctx, x + 3, y + 5, 10, 6, '#2a2836');
  if (on) { R(ctx, x + 3, y + 7, 10, 2, '#4a4858'); R(ctx, x + 4, y + 8, 8, 1, '#7fd37f'); R(ctx, x + 5, y + 7, 6, 1, '#5a5868'); }
  else {
    R(ctx, x + 4, y + 6, 8, 4, '#f4f0e8'); R(ctx, x + 5, y + 5, 6, 1, '#f4f0e8'); R(ctx, x + 5, y + 10, 6, 1, '#d8d4cc');
    const lx = Math.round(Math.sin(t * 1.3) * 2);
    R(ctx, x + 6 + lx, y + 5, 4, 6, '#c0262d'); R(ctx, x + 7 + lx, y + 6, 2, 4, '#1d1d2b'); R(ctx, x + 7 + lx, y + 6, 1, 1, '#ffffff');
  }
}
export function drawBlock(ctx, x, y) {
  R(ctx, x, y + 13, 16, 3, 'rgba(0,0,0,0.3)');
  R(ctx, x, y, 16, 15, '#3e3a56'); R(ctx, x + 1, y, 14, 12, '#8a84a8'); R(ctx, x + 1, y, 14, 2, '#bcb6d8'); R(ctx, x + 1, y, 1, 12, '#aaa4c8'); R(ctx, x + 14, y + 1, 1, 11, '#6c6688');
  R(ctx, x + 1, y + 12, 14, 2, '#5c5678'); R(ctx, x + 1, y + 12, 14, 1, '#4a4466');
  R(ctx, x + 4, y + 3, 8, 7, '#6c6688'); R(ctx, x + 5, y + 4, 6, 5, '#7a7498'); R(ctx, x + 4, y + 3, 8, 1, '#5c5678'); R(ctx, x + 4, y + 9, 8, 1, '#aaa4c8');   // relevo
  R(ctx, x + 7, y + 5, 2, 3, '#5c5678');
}
export function drawPlate(ctx, x, y, pressed) {
  R(ctx, x + 1, y + 1, 14, 14, '#1e1a2a');
  const c = pressed ? ['#3a6a3a', '#4c8a4c', '#6cb06c'] : ['#6a5a2a', '#8a7a3a', '#c8b460'];
  if (pressed) { R(ctx, x + 2, y + 2, 12, 12, c[1]); R(ctx, x + 2, y + 2, 12, 1, c[0]); R(ctx, x + 2, y + 2, 1, 12, c[0]); }
  else { R(ctx, x + 2, y + 2, 12, 11, c[1]); R(ctx, x + 2, y + 2, 12, 1, c[2]); R(ctx, x + 2, y + 2, 1, 11, c[2]); R(ctx, x + 2, y + 12, 12, 2, c[0]); }
  R(ctx, x + 5, y + 5, 6, 6, c[0]); R(ctx, x + 6, y + 6, 4, 4, pressed ? '#9ae09a' : '#e0c870'); R(ctx, x + 7, y + 7, 2, 2, pressed ? '#ffffff' : '#fff0a0');
}
export function drawPot(ctx, x, y) {
  R(ctx, x + 2, y + 13, 12, 3, 'rgba(0,0,0,0.3)');
  R(ctx, x + 2, y + 6, 12, 8, '#5a2a14'); R(ctx, x + 3, y + 4, 10, 11, '#5a2a14'); R(ctx, x + 4, y + 2, 8, 3, '#5a2a14');
  R(ctx, x + 3, y + 6, 10, 7, '#b5653a'); R(ctx, x + 4, y + 5, 8, 9, '#b5653a'); R(ctx, x + 5, y + 3, 6, 2, '#c8784a');
  R(ctx, x + 5, y + 3, 6, 1, '#e8a070'); R(ctx, x + 6, y + 4, 4, 1, '#3a1a0a');                         // boca
  R(ctx, x + 4, y + 6, 2, 4, '#e8a070'); R(ctx, x + 5, y + 5, 1, 1, '#f4c098');                           // brilho
  R(ctx, x + 11, y + 6, 2, 7, '#8a4a28'); R(ctx, x + 4, y + 13, 8, 1, '#8a4a28');
  R(ctx, x + 3, y + 9, 10, 1, '#8a4a28'); for (let k = 4; k < 12; k += 2) R(ctx, x + k, y + 10, 1, 1, '#e0c060');   // faixa pintada
}
export function drawTorch(ctx, x, y, t, lit = true) {
  R(ctx, x + 4, y + 13, 8, 3, 'rgba(0,0,0,0.3)');
  R(ctx, x + 5, y + 13, 6, 2, '#3a3a48'); R(ctx, x + 5, y + 13, 6, 1, '#6a6a7a');                        // base de ferro
  R(ctx, x + 7, y + 7, 2, 7, '#5b3a22'); R(ctx, x + 7, y + 7, 1, 7, '#8a5a34');
  R(ctx, x + 4, y + 5, 8, 3, '#4a4a58'); R(ctx, x + 4, y + 5, 8, 1, '#8a8a9a'); R(ctx, x + 5, y + 8, 6, 1, '#3a3a48');   // braseiro
  if (!lit) { R(ctx, x + 5, y + 4, 6, 1, '#2a2a2a'); R(ctx, x + 6, y + 3, 1, 1, '#5a5a5a'); return; }
  const f = Math.sin(t * 18) > 0 ? 1 : 0, s2 = Math.sin(t * 11) > 0 ? 1 : 0;
  ctx.globalAlpha = 0.18 + 0.05 * f; ctx.fillStyle = '#ffb04a'; ctx.beginPath(); ctx.arc(x + 8, y + 2, 7, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  R(ctx, x + 4, y + 2 + f, 8, 3 - f, '#e8461e'); R(ctx, x + 5, y + f, 6, 4, '#ff8a1e'); R(ctx, x + 6, y - 2 + f, 4, 4, '#ffc53a'); R(ctx, x + 7 - s2, y - 4 + f, 2, 3, '#fff2a8'); R(ctx, x + 7, y - 1 + f, 2, 2, '#ffffff');
  if (Math.sin(t * 7 + x) > 0.8) R(ctx, x + 6 + s2 * 3, y - 6, 1, 1, '#ffd23a');   // fagulha
}
export function drawStatue(ctx, x, y, t, solved) {
  R(ctx, x + 1, y + 12, 14, 4, 'rgba(0,0,0,0.3)');
  R(ctx, x, y + 10, 16, 6, '#4a4660'); R(ctx, x + 1, y + 10, 14, 5, '#6e6a80'); R(ctx, x + 1, y + 10, 14, 1, '#a8a4bc'); R(ctx, x + 1, y + 13, 14, 1, '#5a566c');   // pedestal
  R(ctx, x + 3, y + 3, 10, 8, '#5a566c'); R(ctx, x + 4, y + 4, 8, 7, '#9a96ac'); R(ctx, x + 4, y + 4, 2, 7, '#b8b4ca'); R(ctx, x + 10, y + 4, 2, 7, '#7a7690');    // corpo/capa
  R(ctx, x + 4, y - 3, 8, 8, '#5a566c'); R(ctx, x + 5, y - 2, 6, 6, '#aaa6bc'); R(ctx, x + 5, y - 2, 2, 6, '#c8c4d8');                                          // cabeça
  R(ctx, x + 4, y - 5, 8, 3, '#8a86a0'); R(ctx, x + 5, y - 6, 2, 1, '#8a86a0'); R(ctx, x + 9, y - 6, 2, 1, '#8a86a0');                                             // elmo com chifres
  R(ctx, x + 2, y + 5, 2, 5, '#8a86a0'); R(ctx, x + 12, y + 5, 2, 5, '#7a7690');                                                                                   // braços
  R(ctx, x + 6, y + 6, 4, 3, '#7a7690'); R(ctx, x + 7, y + 7, 2, 1, solved ? '#7fd37f' : '#b66cff');                                                               // emblema
  const e = solved ? '#7fd37f' : (Math.sin(t * 3) > 0 ? '#d8a0ff' : '#7a3ac0');
  R(ctx, x + 6, y + 0, 1, 1, e); R(ctx, x + 9, y + 0, 1, 1, e);
  if (!solved && Math.sin(t * 3) > 0) { ctx.globalAlpha = 0.25; R(ctx, x + 5, y - 1, 6, 3, '#b66cff'); ctx.globalAlpha = 1; }
}
export function drawCrystal(ctx, x, y, t) {
  // cristal grande flutuando sobre um pedestal dourado, com facetas, contorno e brilho que pulsa
  const g = 0.6 + Math.sin(t * 3) * 0.2, bob = Math.round(Math.sin(t * 2) * 1);
  R(ctx, x + 2, y + 13, 12, 3, 'rgba(0,0,0,0.3)');
  R(ctx, x + 3, y + 10, 10, 5, '#5a4418'); R(ctx, x + 4, y + 10, 8, 4, '#c9a03a'); R(ctx, x + 4, y + 10, 8, 1, '#ffe08a'); R(ctx, x + 5, y + 14, 6, 1, '#5a4418');
  ctx.globalAlpha = 0.22 * g + 0.1; ctx.fillStyle = '#7fd3ff'; ctx.beginPath(); ctx.arc(x + 8, y + 1 + bob, 10, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  const cy = y - 8 + bob;
  for (let i = 0; i < 16; i++) {
    const w = i < 6 ? 2 + i : 16 - i < 6 ? Math.max(1, (16 - i)) : 8;
    const xx = x + 8 - (w >> 1);
    R(ctx, xx - 1, cy + i, w + 2, 1, '#1e3a6a');
    R(ctx, xx, cy + i, w >> 1, 1, '#b8ecff'); R(ctx, xx + (w >> 1), cy + i, w - (w >> 1), 1, '#4a8ad0');
  }
  R(ctx, x + 6, cy + 3, 1, 9, '#ffffff'); R(ctx, x + 8, cy + 6, 2, 1, '#7fd3ff');
  ctx.globalAlpha = g; R(ctx, x + 5, cy + 2, 1, 1, '#ffffff'); R(ctx, x + 11, cy + 9, 1, 1, '#ffffff'); ctx.globalAlpha = 1;
}
export function drawPedestal(ctx, x, y) {
  R(ctx, x + 4, y + 13, 8, 1, 'rgba(0,0,0,0.14)'); R(ctx, x + 2, y + 14, 12, 1, 'rgba(0,0,0,0.2)'); R(ctx, x + 4, y + 15, 8, 1, 'rgba(0,0,0,0.12)');
  R(ctx, x + 1, y + 8, 14, 7, '#4a2c14'); R(ctx, x + 2, y + 9, 12, 5, '#8a5a2a'); R(ctx, x + 2, y + 9, 12, 1, '#c8945c'); R(ctx, x + 2, y + 11, 12, 1, '#6b4226');
  R(ctx, x + 2, y + 14, 2, 2, '#4a2c14'); R(ctx, x + 12, y + 14, 2, 2, '#4a2c14'); R(ctx, x + 7, y + 12, 2, 1, '#e0c060');
}
// Foguete (3 tiles de altura; a base fica no tile do objeto). `fire` > 0 acende a chama.
// Foguete da Dra. Estela: sprite de 16x46 montado uma vez (corpo redondo com luz da esquerda, cone vermelho,
// escotilha de latão, faixas, aletas e tubeira) e guardado num canvas; por cima só o pisca-pisca e a chama.
const RK_PAL = {
  body: ['#ffffff', '#eef0f8', '#d6dae8', '#aeb4ca', '#7c839e'], red: ['#ff8a6a', '#e8483c', '#c23434', '#962630', '#6a1a26'],
  noz: ['#a4a4b8', '#7a7a90', '#5a5a6e', '#40404e', '#2c2c38'], ring: '#e8c060', ringD: '#9a7424', glass: ['#e8fbff', '#8fdcff', '#4aa0d8', '#285a96'], line: '#231c34',
};
let rocketCv = null;
function rocketSprite() {
  if (rocketCv) return rocketCv;
  const PAL_BODY = RK_PAL.body, PAL_RED = RK_PAL.red;
  const W0 = 18, H0 = 48, px = Array.from({ length: H0 }, () => Array(W0).fill(null));
  const put = (c, r, col) => { if (r >= 0 && r < H0 && c >= 0 && c < W0) px[r][c] = col; };
  const cx = 9;   // o corpo fica entre as colunas 1 e 16; coluna 0 e 17 sobram para o contorno
  const hwAt = (r) => r < 10 ? [1, 1, 2, 2, 3, 3, 4, 4, 5, 5][r] : r < 39 ? 5 : r === 39 ? 4 : r < 42 ? 0 : 0;
  const ramp = (u, pal) => pal[u < 0.14 ? 0 : u < 0.36 ? 1 : u < 0.66 ? 2 : u < 0.86 ? 3 : 4];
  for (let r = 0; r < 40; r++) {
    const hw = hwAt(r);
    for (let c = cx - hw; c < cx + hw; c++) {
      const u = (c - (cx - hw) + 0.5) / (hw * 2);
      let pal = PAL_BODY;
      if (r < 10 || (r >= 13 && r <= 14) || (r >= 33 && r <= 34)) pal = PAL_RED;
      let col = ramp(u, pal);
      if (r === 10) col = ramp(u, PAL_RED.map((h) => shadeHex(h, 0.7)));            // gola escura sob o cone
      if (r === 39) col = ramp(u, RK_PAL.noz);                                       // saia de metal
      if ((r === 22 || r === 29) && (c - cx) % 2 === 0 && u > 0.1 && u < 0.9) col = shadeHex(col, 0.78);   // rebites
      put(c, r, col);
    }
  }
  // escotilha redonda de latão com vidro azul e reflexo
  for (let r = 15; r <= 21; r++) for (let c = cx - 4; c <= cx + 3; c++) {
    const dx = c + 0.5 - cx, dy = r + 0.5 - 18.5, d = Math.hypot(dx, dy);
    if (d <= 3.1) put(c, r, d > 2.2 ? (dx + dy < 0 ? RK_PAL.ring : RK_PAL.ringD) : dx + dy < -1.6 ? RK_PAL.glass[0] : dx + dy < 0.4 ? RK_PAL.glass[1] : dx + dy < 2 ? RK_PAL.glass[2] : RK_PAL.glass[3]);
  }
  // janelinha de serviço e listra fina
  put(cx - 2, 25, RK_PAL.glass[1]); put(cx - 1, 25, RK_PAL.glass[2]); put(cx - 2, 26, RK_PAL.glass[2]); put(cx - 1, 26, RK_PAL.glass[3]);
  for (let c = cx - 5; c < cx + 5; c++) put(c, 31, shadeHex(px[31][c] || '#d6dae8', 0.88));
  // tubeira em sino
  for (let r = 40; r < 45; r++) { const hw = [2, 2, 3, 3, 4][r - 40]; for (let c = cx - hw; c < cx + hw; c++) put(c, r, ramp((c - (cx - hw) + 0.5) / (hw * 2), RK_PAL.noz)); }
  for (let c = cx - 3; c < cx + 3; c++) put(c, 44, c < cx ? '#8a8aa0' : '#40404e');
  // aletas varridas: a da esquerda pega luz, a da direita fica na sombra
  for (let r = 27; r < 46; r++) {
    const reach = Math.min(4, Math.floor((r - 27) / 3) + 1), bottom = r >= 43;
    for (let k = 1; k <= reach; k++) {
      if (bottom && k > 46 - r + 1) continue;
      put(cx - 5 - k, r, r >= 44 ? PAL_RED[4] : k === reach ? PAL_RED[0] : PAL_RED[1]);
      put(cx + 4 + k, r, r >= 44 ? PAL_RED[4] : k === reach ? PAL_RED[3] : PAL_RED[2]);
    }
    if (r >= 36 && r < 44) { put(cx - 5, r, PAL_RED[r === 43 ? 4 : 1]); put(cx + 4, r, PAL_RED[r === 43 ? 4 : 3]); }
  }
  // contorno escuro em volta de tudo
  const out = px.map((row) => row.slice());
  for (let r = 0; r < H0; r++) for (let c = 0; c < W0; c++) if (!px[r][c] && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => px[r + dy]?.[c + dx])) out[r][c] = RK_PAL.line;
  rocketCv = document.createElement('canvas'); rocketCv.width = W0; rocketCv.height = H0;
  const g = rocketCv.getContext('2d');
  for (let r = 0; r < H0; r++) for (let c = 0; c < W0; c++) if (out[r][c]) { g.fillStyle = out[r][c]; g.fillRect(c, r, 1, 1); }
  return rocketCv;
}
// chama em camadas (vermelho, laranja, amarelo e miolo branco) que tremula e afina na ponta
export function drawRocketFlame(ctx, cx, top, t, fire) {
  if (fire <= 0) return;
  const len = 5 + fire * 17 + Math.sin(t * 38) * 1.6 + Math.sin(t * 61) * 1;
  const layers = [['#e8402a', 4.2, 1], ['#ff8a2a', 3.4, 0.86], ['#ffd23a', 2.4, 0.64], ['#fff8d8', 1.3, 0.4]];
  for (const [col, w0, lk] of layers) {
    const L = len * lk;
    for (let i = 0; i < L; i++) {
      const k = i / L, w = Math.max(0.5, w0 * (1 - k * k * 0.85) + Math.sin(t * 50 + i * 1.3) * 0.35 * k);
      const wob = Math.round(Math.sin(t * 27 + i * 0.7) * k * 1.2);
      R(ctx, Math.round(cx - w + wob), top + i, Math.max(1, Math.round(w * 2)), 1, col);
    }
  }
  // fagulhas
  for (let i = 0; i < 4; i++) { const a = (t * 3.1 + i * 0.27) % 1; ctx.globalAlpha = (1 - a) * fire; R(ctx, Math.round(cx - 3 + Math.sin(i * 7 + t * 9) * 4), Math.round(top + len * (0.5 + a * 0.7)), 1, 1, i % 2 ? '#ffd23a' : '#ffffff'); }
  ctx.globalAlpha = 1;
}
export function drawRocket(ctx, x, y, t, fire = 0) {
  const by = y + 16;
  R(ctx, x - 3, y + 13, 22, 3, 'rgba(0,0,0,0.28)'); R(ctx, x - 1, y + 12, 18, 1, 'rgba(0,0,0,0.18)');
  ctx.drawImage(rocketSprite(), x - 1, by - 47);
  // pisca-pisca na ponta do cone
  if (Math.floor(t * 2) % 2 === 0) { R(ctx, x + 7, by - 48, 2, 1, '#ff5a5a'); ctx.globalAlpha = 0.35; R(ctx, x + 6, by - 49, 4, 3, '#ff8a8a'); ctx.globalAlpha = 1; }
  drawRocketFlame(ctx, x + 8, by - 2, t, fire);
}
// Plataforma de lançamento no chão do laboratório (Terra) e da base (Lua): só um desenho, não ocupa espaço.
export function drawLaunchPad(ctx, x, y, t, moon = false) {
  const cx = x + 8, cy = y + 14;
  ctx.fillStyle = moon ? '#6a6a80' : '#6a6672'; ctx.beginPath(); ctx.ellipse(cx, cy, 15, 5, 0, 0, 7); ctx.fill();
  ctx.fillStyle = moon ? '#9a9ab0' : '#9894a2'; ctx.beginPath(); ctx.ellipse(cx, cy - 1, 14, 4, 0, 0, 7); ctx.fill();
  ctx.fillStyle = moon ? '#b4b4c8' : '#b2aebc'; ctx.beginPath(); ctx.ellipse(cx, cy - 1, 11, 3, 0, 0, 7); ctx.fill();
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; R(ctx, Math.round(cx + Math.cos(a) * 12.5), Math.round(cy - 1 + Math.sin(a) * 3.6), 2, 1, i % 2 ? '#1c1c24' : '#e8c040'); }
  const blink = Math.floor(t * 1.5) % 2 === 0;
  R(ctx, cx - 15, cy - 1, 2, 2, blink ? '#ff5a4a' : '#7a2a2a'); R(ctx, cx + 13, cy - 1, 2, 2, blink ? '#7a2a2a' : '#ff5a4a');
}
// Pilar do Tempo: coluna de pedra com anel de runas e um brilho que gira
export function drawPillar(ctx, x, y, t, past) {
  const c = past ? ['#e8c060', '#fff0b0', '#a07820'] : ['#7af0ff', '#d8ffff', '#3a90b0'];
  R(ctx, x - 1, y + 13, 18, 3, 'rgba(0,0,0,0.3)');
  R(ctx, x + 2, y + 10, 12, 5, '#6a6a80'); R(ctx, x + 2, y + 10, 12, 1, '#9a9ab4');
  R(ctx, x + 4, y - 14, 8, 25, '#8a8aa4'); R(ctx, x + 4, y - 14, 2, 25, '#b4b4cc'); R(ctx, x + 10, y - 14, 2, 25, '#62627c');
  R(ctx, x + 3, y - 16, 10, 3, '#a4a4bc'); R(ctx, x + 3, y - 16, 10, 1, '#d0d0e4');
  for (let i = 0; i < 4; i++) { const on = Math.floor(t * 3 + i) % 4 === 0; R(ctx, x + 6, y - 10 + i * 5, 4, 2, on ? c[1] : c[0]); }
  const a = 0.35 + 0.25 * Math.sin(t * 3);
  ctx.globalAlpha = a; ctx.fillStyle = c[0]; ctx.beginPath(); ctx.ellipse(x + 8, y + 12, 11, 4, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  const ang = t * 2; R(ctx, x + 8 + Math.round(Math.cos(ang) * 10), y + 12 + Math.round(Math.sin(ang) * 3), 2, 2, c[1]);
  R(ctx, x + 8 + Math.round(Math.cos(ang + 3.14) * 10), y + 12 + Math.round(Math.sin(ang + 3.14) * 3), 2, 2, c[1]);
}
export function drawSeed(ctx, x, y, t, planted) {
  R(ctx, x + 2, y + 12, 12, 3, 'rgba(0,0,0,0.25)');
  R(ctx, x + 3, y + 9, 10, 5, '#a8884e'); R(ctx, x + 3, y + 9, 10, 1, '#c8a866');
  if (planted) { R(ctx, x + 7, y + 3, 2, 7, '#5ac86a'); R(ctx, x + 4, y + 3, 4, 2, '#7ae88a'); R(ctx, x + 8, y + 5, 4, 2, '#7ae88a'); }
  else { const g = 0.5 + 0.5 * Math.sin(t * 4); R(ctx, x + 6, y + 6, 4, 4, '#7af0ff'); R(ctx, x + 7, y + 5, 2, 1, '#d8ffff'); ctx.globalAlpha = 0.4 * g; R(ctx, x + 4, y + 4, 8, 8, '#7af0ff'); ctx.globalAlpha = 1; }
}
// Objetos exclusivos de Lacrímora precisam de silhuetas próprias: sem estes
// desenhos ainda eram interativos, mas invisíveis no mapa durante o jogo.
export function drawLacrSeed(ctx, x, y, t) {
  const pulse = 0.45 + 0.35 * Math.sin(t * 5);
  R(ctx, x + 2, y + 13, 12, 3, 'rgba(12,8,28,0.55)');
  ctx.globalAlpha = pulse; R(ctx, x + 2, y + 3, 12, 11, '#a85cff'); ctx.globalAlpha = 1;
  R(ctx, x + 5, y + 4, 7, 9, '#281c52'); R(ctx, x + 6, y + 3, 5, 9, '#56dcff');
  R(ctx, x + 7, y + 4, 3, 6, '#d9ffff'); R(ctx, x + 5, y + 8, 7, 4, '#c17cff');
  R(ctx, x + 7, y + 5, 2, 3, '#fff4a8');
  R(ctx, x + 2, y + 5 + (Math.floor(t * 4) % 2), 2, 2, '#fff4a8');
  R(ctx, x + 13, y + 7 - (Math.floor(t * 4) % 2), 2, 2, '#ffffff');
}
// Props da superfície lunar: painéis solares, antenas parabólicas, tanques, caixas e lanternas de pouso.
export function drawMoonProp(ctx, x, y, t, kind) {
  R(ctx, x + 2, y + 14, 12, 2, 'rgba(20,20,40,0.35)'); R(ctx, x + 4, y + 15, 8, 1, 'rgba(20,20,40,0.25)');
  const O = '#161a28';
  switch (kind) {
    case 'solar': // painel inclinado com células, moldura e pé
      R(ctx, x + 6, y + 9, 4, 6, O); R(ctx, x + 7, y + 9, 2, 6, '#7480a6'); R(ctx, x + 4, y + 14, 8, 1, '#5a6384');
      R(ctx, x, y + 1, 16, 10, O); R(ctx, x + 1, y + 2, 14, 8, '#b4bfdc');
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const cx = x + 2 + i * 4, cy = y + 3 + j * 3; R(ctx, cx, cy, 3, 2, '#2a4ea8'); R(ctx, cx, cy, 3, 1, '#6aa4ff'); R(ctx, cx + 2, cy + 1, 1, 1, '#1c3478'); }
      R(ctx, x + 2, y + 3, 1, 1, '#ffffff'); break;
    case 'dish': // antena parabólica com pisca
      R(ctx, x + 6, y + 8, 4, 7, O); R(ctx, x + 7, y + 8, 2, 7, '#8a94b4'); R(ctx, x + 3, y + 13, 10, 2, O); R(ctx, x + 4, y + 13, 8, 1, '#aeb6cb');
      R(ctx, x + 1, y + 2, 14, 7, O); R(ctx, x + 2, y + 3, 12, 5, '#e6ecf6'); R(ctx, x + 3, y + 4, 10, 3, '#aeb6cb'); R(ctx, x + 5, y + 5, 6, 2, '#7480a6'); R(ctx, x + 2, y + 3, 4, 1, '#ffffff');
      R(ctx, x + 7, y - 1, 2, 5, '#5a6384');
      R(ctx, x + 7, y - 2, 2, 2, Math.sin(t * 4) > 0 ? '#ff6a6a' : '#6a2a2a'); if (Math.sin(t * 4) > 0) { ctx.globalAlpha = 0.3; R(ctx, x + 6, y - 3, 4, 4, '#ff6a6a'); ctx.globalAlpha = 1; } break;
    case 'tank': // tanque cilíndrico com faixa e válvula
      R(ctx, x + 2, y + 2, 12, 13, O); R(ctx, x + 3, y + 3, 10, 11, '#c4cadc'); R(ctx, x + 3, y + 3, 3, 11, '#f4f7ff'); R(ctx, x + 6, y + 3, 1, 11, '#e2e6f2'); R(ctx, x + 11, y + 3, 2, 11, '#9aa2ba');
      R(ctx, x + 3, y + 7, 10, 3, '#2a66c0'); R(ctx, x + 3, y + 7, 10, 1, '#6aa4ff'); R(ctx, x + 3, y + 3, 10, 1, '#ffffff');
      R(ctx, x + 6, y, 4, 3, O); R(ctx, x + 7, y, 2, 2, '#e05050'); R(ctx, x + 5, y + 12, 6, 1, '#7480a6'); break;
    case 'crate': // caixa de carga com faixas de aviso
      R(ctx, x + 1, y + 3, 14, 12, O); R(ctx, x + 2, y + 4, 12, 10, '#7a84a0'); R(ctx, x + 2, y + 4, 12, 2, '#b4bed6'); R(ctx, x + 2, y + 12, 12, 2, '#5a6280');
      for (let i = 0; i < 6; i++) R(ctx, x + 2 + i * 2, y + 8, 2, 3, i % 2 ? '#1c2030' : '#ffd23a');
      R(ctx, x + 2, y + 4, 1, 10, '#c8d0e4'); R(ctx, x + 6, y + 6, 4, 1, '#e6ecf6'); break;
    case 'lamp': // poste de luz com halo
      R(ctx, x + 6, y + 4, 4, 11, O); R(ctx, x + 7, y + 4, 2, 11, '#7480a6'); R(ctx, x + 4, y + 13, 8, 2, O); R(ctx, x + 5, y + 13, 6, 1, '#aeb6cb');
      R(ctx, x + 3, y, 10, 5, O); { const on = Math.sin(t * 2 + x) > -0.5; R(ctx, x + 4, y + 1, 8, 3, on ? '#d8f4ff' : '#6aa0c0'); R(ctx, x + 4, y + 1, 3, 1, '#ffffff'); if (on) { ctx.globalAlpha = 0.18; ctx.fillStyle = '#bfeaff'; ctx.beginPath(); ctx.arc(x + 8, y + 3, 9, 0, 7); ctx.fill(); ctx.globalAlpha = 1; } } break;
    case 'cairn': // pilha de pedras da expedição
      for (const [bx, by, w, h, c] of [[2, 10, 12, 5, '#8a8ea6'], [4, 6, 9, 5, '#a4a8be'], [6, 3, 6, 4, '#bcc0d3'], [7, 1, 3, 3, '#d2d6e4']]) { R(ctx, x + bx - 1, y + by - 1, w + 2, h + 1, O); R(ctx, x + bx, y + by, w, h, c); R(ctx, x + bx, y + by, w, 1, shadeHex(c, 1.15)); R(ctx, x + bx + w - 2, y + by + 1, 2, h - 1, shadeHex(c, 0.8)); }
      break;
    default: // bandeira da expedição (arame esticado no alto, porque na Lua não venta)
      R(ctx, x + 2, y, 3, 16, O); R(ctx, x + 3, y, 1, 16, '#e6ecf6'); R(ctx, x + 3, y + 1, 10, 1, '#aeb6cb');
      R(ctx, x + 4, y + 1, 10, 8, O); R(ctx, x + 5, y + 2, 8, 6, '#2a66c0'); R(ctx, x + 5, y + 2, 8, 1, '#6aa4ff');
      R(ctx, x + 7, y + 3, 3, 3, '#ffffff'); R(ctx, x + 8, y + 3, 2, 2, '#2a66c0'); R(ctx, x + 11, y + 5, 1, 1, '#ffd23a'); R(ctx, x + 2, y + 15, 3, 1, '#7c8098'); break;
  }
}
// Marcas no regolito (não bloqueiam): trilhas de rover, pegadas e chão queimado.
export function drawMoonDecal(ctx, x, y, kind, dir) {
  ctx.save(); ctx.translate(x + 8, y + 8); if (dir) ctx.rotate(Math.PI / 2); ctx.globalAlpha = 0.5;
  if (kind === 'tracks') { for (const oy of [-4, 3]) for (let i = -8; i < 8; i += 2) R(ctx, i, oy, 1, 2, '#7a7a8e'); }
  else if (kind === 'steps') { for (let i = 0; i < 4; i++) { R(ctx, -7 + i * 4, i % 2 ? 1 : -3, 3, 2, '#7a7a8e'); R(ctx, -7 + i * 4, (i % 2 ? 1 : -3) + 2, 2, 1, '#6a6a7e'); } }
  else { R(ctx, -5, -3, 10, 7, '#5a5a6e'); R(ctx, -3, -5, 6, 11, '#5a5a6e'); R(ctx, -2, -1, 4, 3, '#44445a'); }
  ctx.globalAlpha = 1; ctx.restore();
}
// ---- Marélia: farol, bolhas de ar, correntezas e marcos
export function drawLighthouse(ctx, x, y, t, lit) {
  // 48 × 96, desenhado na largura certa: rochas com espuma, base de pedra, torre listrada com sombra de cilindro,
  // janelinhas, sacada com grade, lanterna de vidro com a lente, cúpula vermelha e para-raios; porta em arco à esquerda
  const P = (px, py, w, h, c) => R(ctx, x + px, y + py, w, h, c);
  const A = ctx.globalAlpha;   // respeita a transparência de quem chamou (herói atrás da torre)
  const cx = 24;
  // sombra no chão e rochas da base, com a espuma do mar batendo
  ctx.globalAlpha = 0.3 * A; P(-6, 90, 60, 6, '#14243a'); ctx.globalAlpha = A;
  for (const [rx, ry, rw, rh] of [[14, 86, 14, 9], [30, 85, 14, 10], [40, 83, 12, 12], [22, 88, 14, 7]]) {
    P(rx, ry, rw, rh, '#4a5868'); P(rx + 1, ry, rw - 2, 2, '#7a8ea4'); P(rx + 1, ry + 2, 3, 2, '#94a8be'); P(rx, ry + rh - 2, rw, 2, '#34404e');
  }
  for (let i = 0; i < 5; i++) { const fx = 14 + i * 8 + Math.round(Math.sin(t * 2 + i) * 2); P(fx, 94, 5, 2, '#e8f4fa'); }
  // base de pedra (plinto) com fiadas de blocos
  P(4, 72, 40, 14, '#8a8678'); P(4, 72, 40, 2, '#c4c0b4'); P(3, 84, 42, 2, '#6a6a5e');
  for (let r = 0; r < 3; r++) { P(4, 76 + r * 4, 40, 1, '#6e6a5e'); for (let k = 0; k < 5; k++) P(6 + k * 9 + (r % 2) * 4, 77 + r * 4, 1, 3, '#6e6a5e'); }
  P(4, 74, 2, 10, '#a8a49a'); P(40, 74, 4, 10, '#6a665a');
  // torre: estreita em cima, larga embaixo; faixas vermelhas e brancas com luz à esquerda e sombra à direita
  for (let yy = 22; yy < 73; yy++) {
    const k = (yy - 22) / 50, hw = Math.round(11 + k * 6), band = Math.floor((yy - 22) / 9) % 2 === 1;
    const base = band ? '#c8382e' : '#f2eee4', lite = band ? '#e8604e' : '#ffffff', dark = band ? '#8a2418' : '#c8c2b4', deep = band ? '#5e1810' : '#9a9488';
    P(cx - hw, yy, hw * 2, 1, base); P(cx - hw + 2, yy, 3, 1, lite); P(cx + hw - 7, yy, 4, 1, dark); P(cx + hw - 3, yy, 2, 1, deep);
    P(cx - hw - 1, yy, 1, 1, '#3a2a28'); P(cx + hw - 1, yy, 1, 1, '#3a2a28');
    if ((yy - 22) % 9 === 0) P(cx - hw, yy, hw * 2, 1, band ? '#9a2a20' : '#d8d2c4');
  }
  // janelinhas com moldura e um brilho
  for (const [wx, wy] of [[cx - 2, 31], [cx + 3, 49], [cx - 4, 63]]) { P(wx - 1, wy - 1, 6, 8, '#5a4a3a'); P(wx, wy, 4, 6, lit ? '#ffd36a' : '#1d2a4a'); P(wx, wy, 4, 1, '#5a4a3a'); P(wx, wy + 1, 1, 2, lit ? '#fff3b0' : '#4a6a9a'); }
  // entrada: alpendre de pedra no chão, à esquerda da torre, com telhadinho vermelho, porta em arco, lampião e degrau
  ctx.globalAlpha = 0.3 * A; P(-6, 88, 22, 4, '#14243a'); ctx.globalAlpha = A;
  P(-4, 66, 18, 23, '#a8a49a'); P(-4, 66, 2, 23, '#c4c0b4'); P(12, 66, 2, 23, '#7a7668');
  for (let r = 0; r < 4; r++) P(-4, 70 + r * 5, 18, 1, '#8a8678');
  P(-6, 61, 22, 3, '#c8382e'); P(-5, 59, 20, 2, '#e05a4a'); P(-6, 64, 22, 2, '#8a2418'); P(-3, 57, 14, 2, '#c8382e');
  P(-1, 70, 10, 19, '#3a2a1c'); P(0, 69, 8, 1, '#3a2a1c'); P(0, 71, 8, 18, '#7a5236'); P(0, 71, 8, 1, '#9a6a42');
  P(3, 71, 1, 18, '#5a3a24'); P(6, 79, 1, 2, '#e0c060');
  P(-4, 72, 2, 3, '#22283a'); P(-4, 72, 2, 1, lit ? '#ffe58a' : '#c8984a');
  P(-8, 88, 16, 3, '#94a8be'); P(-8, 88, 16, 1, '#c4d0dc'); P(-8, 90, 16, 1, '#6a7a8e');
  // sacada: plataforma escura com grade de ferro
  P(7, 18, 34, 5, '#3a4258'); P(7, 18, 34, 1, '#7480a6'); P(8, 22, 32, 1, '#22283a');
  P(7, 12, 34, 1, '#22283a'); for (let px = 7; px <= 40; px += 3) P(px, 12, 1, 6, '#2a3044');
  // lanterna: esquadria escura, vidros e a lente dentro
  P(14, 4, 20, 14, '#22283a');
  const glass = lit ? '#ffe58a' : '#5a7090', glass2 = lit ? '#fff6c0' : '#7a90b0';
  for (const gx of [15, 21, 28]) { P(gx, 5, gx === 21 ? 6 : 5, 12, glass); P(gx, 5, 2, 12, glass2); }
  P(21, 7, 6, 9, lit ? '#fffbe0' : '#c8a050'); P(22, 8, 4, 7, lit ? '#ffffff' : '#e0c070'); P(23, 6, 2, 1, '#8a6a32');
  // cúpula vermelha, respiro e para-raios
  P(13, 2, 22, 3, '#8a2418'); P(15, 0, 18, 2, '#c8382e'); P(17, -2, 14, 2, '#c8382e'); P(20, -4, 8, 2, '#c8382e');
  P(16, 0, 4, 1, '#e8604e'); P(18, -2, 3, 1, '#e8604e'); P(30, 0, 3, 2, '#8a2418');
  P(22, -7, 4, 3, '#3a4258'); P(23, -7, 1, 1, '#7480a6'); P(23, -13, 2, 6, '#22283a'); P(21, -12, 6, 1, '#22283a');
  if (lit) { // brilho da lanterna e o facho de luz girando
    const pulse = 0.55 + 0.2 * Math.sin(t * 4);
    ctx.globalAlpha = 0.35 * pulse * A; ctx.fillStyle = '#fff3a0'; ctx.beginPath(); ctx.arc(x + cx, y + 11, 22, 0, Math.PI * 2); ctx.fill();
    const a = t * 1.3, reach = Math.cos(a) * 130, spread = 12 + Math.abs(Math.sin(a)) * 10;
    ctx.globalAlpha = (0.2 + 0.12 * Math.abs(Math.cos(a))) * A;
    ctx.beginPath(); ctx.moveTo(x + cx, y + 9); ctx.lineTo(x + cx + reach, y + 11 - spread); ctx.lineTo(x + cx + reach, y + 11 + spread); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = A;
  }
}
export function drawFarolLamp(ctx, x, y, t, lit) {
  // lente de Fresnel sobre um pedestal de latão (cresce para cima e para os lados da célula)
  R(ctx, x - 6, y + 13, 28, 4, 'rgba(0,0,0,0.3)');
  R(ctx, x - 4, y + 8, 24, 7, '#8a6a42'); R(ctx, x - 4, y + 8, 24, 2, '#c8984a'); R(ctx, x - 2, y + 14, 20, 2, '#5a4632');
  R(ctx, x - 1, y - 20, 18, 28, '#2a3250');
  const glass = lit ? '#fff3a0' : '#7a8caa';
  R(ctx, x, y - 19, 16, 26, glass);
  for (let k = 0; k < 6; k++) { R(ctx, x, y - 19 + k * 4, 16, 1, lit ? '#ffffff' : '#aab8d0'); R(ctx, x + 3 + k % 2, y - 19 + k * 4, 1, 4, lit ? '#ffe070' : '#5a6a8a'); }
  R(ctx, x + 7, y - 19, 2, 26, lit ? '#ffffff' : '#c8d4e6'); R(ctx, x - 2, y - 22, 20, 4, '#c8984a'); R(ctx, x + 2, y - 26, 12, 5, '#c8382e'); R(ctx, x + 6, y - 29, 4, 3, '#8a2418');
  R(ctx, x - 2, y + 6, 20, 2, '#c8984a');
  if (lit) { const a = 0.22 + 0.1 * Math.sin(t * 5); ctx.globalAlpha = a; R(ctx, x - 22, y - 34, 60, 56, '#fff8c0'); ctx.globalAlpha = a * 0.8; const ph = (t * 1.2) % 6.28; ctx.beginPath(); ctx.moveTo(x + 8, y - 8); ctx.lineTo(x + 8 + Math.cos(ph) * 130, y - 8 + Math.sin(ph) * 60 - 20); ctx.lineTo(x + 8 + Math.cos(ph + 0.35) * 130, y - 8 + Math.sin(ph + 0.35) * 60 + 10); ctx.closePath(); ctx.fillStyle = '#fffbd0'; ctx.fill(); ctx.globalAlpha = 1; }
}
export function drawMareLore(ctx, x, y, t, read) { // tábua de coral gravada: pedra com topo arredondado, corais crescendo e letras que brilham
  R(ctx, x + 2, y + 14, 12, 2, 'rgba(10,30,60,0.4)');
  R(ctx, x + 2, y + 3, 12, 12, '#2a2440'); R(ctx, x + 3, y + 2, 10, 1, '#2a2440'); R(ctx, x + 4, y + 1, 8, 1, '#2a2440');
  R(ctx, x + 3, y + 3, 10, 11, '#8a7a9a'); R(ctx, x + 4, y + 2, 8, 1, '#aa9aba'); R(ctx, x + 3, y + 3, 2, 11, '#aa9aba'); R(ctx, x + 11, y + 3, 2, 11, '#6a5a78');
  for (const [k, w] of [[5, 6], [7, 5], [9, 6], [11, 4]]) R(ctx, x + 5, y + k, w, 1, read ? '#5a4a68' : '#7ae0e8');
  R(ctx, x + 1, y + 10, 3, 5, '#e0507a'); R(ctx, x, y + 11, 1, 2, '#e0507a'); R(ctx, x + 1, y + 10, 1, 1, '#ff8aa8');   // coral
  R(ctx, x + 12, y + 11, 3, 4, '#3ab8a8'); R(ctx, x + 14, y + 10, 1, 2, '#3ab8a8'); R(ctx, x + 12, y + 11, 1, 1, '#7ae8d8');
  if (!read) { ctx.globalAlpha = 0.2 + 0.15 * Math.sin(t * 3 + x); R(ctx, x + 3, y + 3, 10, 11, '#bfeaff'); ctx.globalAlpha = 1; }
}
const OYSTER_PHASES = ['nova', 'crescente', 'cheia', 'minguante'];
export function drawMarePed(ctx, x, y, t, idx, lit) { // ostra com a fase da lua
  R(ctx, x + 1, y + 13, 14, 3, 'rgba(10,30,60,0.4)');
  R(ctx, x + 1, y + 7, 14, 8, '#9a8a9e'); R(ctx, x + 2, y + 5, 12, 4, '#c8b8cc'); R(ctx, x + 1, y + 9, 14, 1, '#6a5a70');
  ctx.beginPath(); ctx.arc(x + 8, y + 7, 4, 0, 7); ctx.fillStyle = lit ? '#fffbe8' : '#1d2a4a'; ctx.fill();
  if (idx === 1) { R(ctx, x + 6, y + 4, 3, 7, '#fffbe8'); } if (idx === 3) { R(ctx, x + 8, y + 4, 3, 7, '#fffbe8'); } if (idx === 2) { ctx.beginPath(); ctx.arc(x + 8, y + 7, 4, 0, 7); ctx.fillStyle = '#fffbe8'; ctx.fill(); }
  if (lit) { ctx.globalAlpha = 0.3 + 0.2 * Math.sin(t * 4); R(ctx, x - 1, y + 1, 18, 14, '#bfeaff'); ctx.globalAlpha = 1; }
}
export function drawMareValve(ctx, x, y, t, flipped) { // válvula de bronze que inverte a correnteza
  R(ctx, x + 1, y + 13, 14, 3, 'rgba(10,30,60,0.4)');
  R(ctx, x + 6, y + 6, 4, 9, '#6a4a2a'); R(ctx, x + 3, y + 12, 10, 3, '#8a6a42');
  const a = flipped ? 0.9 : -0.9; ctx.save(); ctx.translate(x + 8, y + 6); ctx.rotate(a);
  R(ctx, -7, -1, 14, 2, '#c8984a'); R(ctx, -8, -2, 3, 4, '#e0b860'); R(ctx, 5, -2, 3, 4, '#e0b860'); ctx.restore();
  R(ctx, x + 6, y + 4, 4, 4, '#c8984a'); R(ctx, x + 7, y + 5, 2, 2, '#fff3a0');
  R(ctx, x + 3, y + 1, 10, 2, flipped ? '#7ad8ff' : '#4a8ad8'); R(ctx, flipped ? x + 10 : x + 3, y + 1, 3, 2, '#e4f8ff');
}
export function drawMareBell(ctx, x, y, t, idx, lit) { // sino de bronze verde do templo
  R(ctx, x + 2, y + 14, 12, 2, 'rgba(10,30,60,0.4)');
  R(ctx, x + 6, y, 4, 3, '#5a4a2a'); R(ctx, x + 3, y + 3, 10, 9, lit ? '#e0c070' : '#4a8a6a'); R(ctx, x + 4, y + 3, 8, 2, lit ? '#fff3a8' : '#6ab08a'); R(ctx, x + 2, y + 10, 12, 3, lit ? '#c8984a' : '#3a7a5a');
  R(ctx, x + 7, y + 11, 2, 3, '#2a3a30'); R(ctx, x + 5, y + 6, 1, 4, lit ? '#fffbe8' : '#8acaa8');
  if (lit) { ctx.globalAlpha = 0.3 + 0.2 * Math.sin(t * 5); R(ctx, x - 1, y - 1, 18, 16, '#fff3a8'); ctx.globalAlpha = 1; }
}
export function drawMareVent(ctx, x, y, t, charge, solved) { // respiradouro: boca de coral que sopra bolhas
  R(ctx, x + 1, y + 13, 14, 3, 'rgba(10,30,60,0.4)');
  R(ctx, x + 2, y + 8, 12, 7, '#7a5a8a'); R(ctx, x + 3, y + 7, 10, 3, '#a888b8'); R(ctx, x + 4, y + 9, 8, 4, '#1d2a4a');
  const on = charge > 0 || solved;
  if (on) {
    ctx.globalAlpha = 0.5; R(ctx, x + 3, y + 3, 10, 8, '#bfeaff'); ctx.globalAlpha = 1;
    for (let i = 0; i < 4; i++) { const yy = ((t * 18 + i * 7) % 20); ctx.globalAlpha = 0.8 - yy / 30; R(ctx, x + 4 + i * 2 + Math.round(Math.sin(t * 4 + i)), y + 6 - yy, 2, 2, '#ffffff'); }
    ctx.globalAlpha = 1;
    if (!solved) { R(ctx, x + 2, y + 15, 12, 1, '#2a3a5a'); R(ctx, x + 2, y + 15, Math.round(12 * charge), 1, '#7ad8ff'); }
  } else R(ctx, x + 6, y + 5, 4, 2, '#4a5a7a');
}
export function drawTideGate(ctx, x, y, t) { // portão de maré: grade de coral com contorno, água-viva brilhando no meio
  R(ctx, x, y, 16, 16, '#1e1430'); R(ctx, x + 1, y + 1, 14, 14, '#3a2a58');
  for (const k of [2, 6, 10]) { R(ctx, x + k, y + 1, 3, 14, '#6a4a9a'); R(ctx, x + k, y + 1, 1, 14, '#b89ae0'); R(ctx, x + k + 2, y + 1, 1, 14, '#4a3278'); }
  R(ctx, x + 1, y + 7, 14, 2, '#4a3278'); R(ctx, x + 1, y + 7, 14, 1, '#9a7ad0');
  const b = Math.round(Math.sin(t * 3 + x) * 1);
  ctx.globalAlpha = 0.85; R(ctx, x + 5, y + 4 + b, 6, 4, '#ff9ad8'); R(ctx, x + 6, y + 3 + b, 4, 1, '#ffc8ec'); for (let k = 0; k < 3; k++) R(ctx, x + 6 + k * 2, y + 8 + b, 1, 3, '#ff9ad8'); ctx.globalAlpha = 1;
  ctx.globalAlpha = 0.18 + 0.12 * Math.sin(t * 4 + x); R(ctx, x, y, 16, 16, '#bfeaff'); ctx.globalAlpha = 1;
}
// Marcos, o homem-peixe aliado: azul, de bigode, com braços e punhos, pernas de pés palmados e andar animado nas 4 direções.
// `st`: { dir 0 baixo/1 cima/2 esquerda/3 direita, moving, slap (golpe), stun, flash, space }
export function drawGunter(ctx, x, y, t, st = {}) { drawOutlinedAt(ctx, x, y, (c) => drawGunterRaw(c, x, y, t, st), 1, 'gunter', Math.floor(t * 10) + JSON.stringify(st)); }
function drawGunterRaw(ctx, x, y, t, st = {}) {
  const dir = st.dir ?? 0, side = dir >= 2, stun = st.stun > 0;
  let SK = '#4a8ac8', DK = '#2a5a98', LT = '#7ab8e8', FIN = '#9ad4f4', BELLY = '#e8d8a8', FIST = '#6aa8e0';
  const HEAD = { SK, DK, LT, FIN };   // a cabeça fica azul dentro do capacete; o resto do corpo vira traje de astronauta
  const SUIT = st.space && !stun;
  if (SUIT) { SK = '#eef1f8'; DK = '#b8c0d4'; LT = '#ffffff'; FIN = '#7f8aa6'; BELLY = '#cfd6e6'; FIST = '#98a3bd'; }
  // o Marcos é homem-peixe: nunca usa roupa de mergulho (só o traje espacial na Lua)
  // parado: respira (o corpo sobe 1px), pisca, mexe as barbatanas e olha para os lados de vez em quando
  const idle = !st.moving && !(st.slap > 0), breath = Math.sin(t * 2.6) > 0.2;
  const f = st.moving ? Math.floor(t * 9) % 2 : 0, bob = st.moving ? (f ? -1 : 0) : (breath ? -1 : 0);
  const blink = idle && (t % 3.2) < 0.14, look = idle ? [0, 0, -1, 0, 1, 0][Math.floor(t / 1.1) % 6] : 0, finUp = idle ? Math.floor(t * 3) % 4 === 0 : f;
  // a sombra vai antes do espelhamento, em coordenada de tela: o cache de contorno guarda a sombra à parte e não conhece o translate
  R(ctx, x + 2, y + 15, 12, 2, 'rgba(0,0,0,0.3)');
  ctx.save(); ctx.translate(x + 8, 0); if (dir === 2) ctx.scale(-1, 1); ctx.translate(-8, 0);
  if (st.flash > 0 && Math.floor(t * 30) % 2) ctx.globalAlpha = 0.5;
  if (stun) { // caído, de barriga para cima, com estrelinhas
    R(ctx, 1, y + 11, 14, 4, DK); R(ctx, 2, y + 9, 10, 4, SK); R(ctx, 3, y + 9, 8, 1, LT); R(ctx, 5, y + 10, 4, 2, BELLY);
    R(ctx, 10, y + 6, 6, 6, SK); R(ctx, 11, y + 8, 1, 1, '#1d1424'); R(ctx, 14, y + 8, 1, 1, '#1d1424'); R(ctx, 11, y + 10, 4, 1, '#3a2412'); R(ctx, 8, y + 3, 2, 3, FIN);
    R(ctx, 0, y + 13, 3, 2, FIN); R(ctx, 3, y + 8, 3, 3, FIST); // pés e punho de lado
    for (let k = 0; k < 3; k++) { const a = t * 4 + k * 2.1; R(ctx, 9 + Math.round(Math.cos(a) * 5), y + Math.round(Math.sin(a) * 2), 2, 2, '#ffe58a'); }
    ctx.restore(); ctx.globalAlpha = 1; return;
  }
  const hit = st.slap > 0 ? Math.min(6, Math.round((0.28 - st.slap) * 26) + 1) : 0;
  // pernas: alternam ao andar; pés palmados
  const l1 = f ? 1 : 0, l2 = f ? 0 : 1;
  if (!side) {
    R(ctx, 5, y + 11, 3, 4 - l1, DK); R(ctx, 4, y + 15 - l1, 4, 1, FIN);
    R(ctx, 8, y + 11, 3, 4 - l2, DK); R(ctx, 8, y + 15 - l2, 4, 1, FIN);
  } else {
    R(ctx, 5 + (f ? 1 : -1), y + 11, 3, 4, DK); R(ctx, 5 + (f ? 1 : -1), y + 15, 5, 1, FIN);
    R(ctx, 8 + (f ? -1 : 1), y + 11, 3, 4, SK); R(ctx, 8 + (f ? -1 : 1), y + 15, 5, 1, FIN);
  }
  // tronco
  const tw = side ? 6 : 8, tx = side ? 5 : 4;
  R(ctx, tx, y + 5 + bob, tw, 7, SK); R(ctx, tx, y + 5 + bob, tw, 1, LT); R(ctx, tx, y + 11 + bob, tw, 1, DK);
  if (dir === 0) R(ctx, 6, y + 7 + bob, 4, 4, BELLY); else if (dir === 1) { R(ctx, 7, y + 5 + bob, 2, 7, DK); R(ctx, 6, y + 6 + bob, 4, 1, LT); } else R(ctx, 8, y + 7 + bob, 3, 4, BELLY);
  R(ctx, tx, y + 10 + bob, tw, 1, SUIT ? '#ff8a2a' : '#c8382e'); // faixa de campeão (laranja no traje)
  if (SUIT) { // mochila de oxigênio e luzinha do peito
    if (dir === 1) R(ctx, 5, y + 6 + bob, 6, 5, '#d8dce8'); else if (dir === 0) R(ctx, 7, y + 7 + bob, 2, 1, '#ff8a2a'); else R(ctx, 2, y + 6 + bob, 3, 6, '#d8dce8');
    R(ctx, tx, y + 4 + bob, tw, 1, '#d0d6e6');   // gola do traje
  }
  // braços e punhos (balançam ao andar; no golpe o braço estica para a frente)
  const sw = st.moving ? (f ? 1 : -1) : 0;
  if (!side) {
    const punchR = hit && dir !== 1, punchU = hit && dir === 1;
    R(ctx, 1, y + 6 + bob + sw, 3, 5, SK); R(ctx, 1, y + 6 + bob + sw, 3, 1, LT); R(ctx, 0, y + 10 + bob + sw, 4, 4, FIST); R(ctx, 1, y + 10 + bob + sw, 2, 1, FIN); // esquerdo
    if (punchR) { R(ctx, 12, y + 7 + bob, 3, 5 + hit, SK); R(ctx, 11, y + 11 + bob + hit, 5, 5, FIST); R(ctx, 12, y + 11 + bob + hit, 3, 1, FIN); }
    else if (punchU) { R(ctx, 12, y + 4 + bob - hit, 3, 7 + hit, SK); R(ctx, 11, y + 1 + bob - hit, 5, 5, FIST); R(ctx, 12, y + 1 + bob - hit, 3, 1, FIN); }
    else { R(ctx, 12, y + 6 + bob - sw, 3, 5, SK); R(ctx, 12, y + 6 + bob - sw, 3, 1, LT); R(ctx, 12, y + 10 + bob - sw, 4, 4, FIST); R(ctx, 13, y + 10 + bob - sw, 2, 1, FIN); }
  } else {
    R(ctx, 4, y + 6 + bob - sw, 3, 5, DK); R(ctx, 4, y + 10 + bob - sw, 4, 3, '#4a78b0'); // braço de trás
    if (hit) { R(ctx, 9, y + 7 + bob, 3 + hit, 3, SK); R(ctx, 9, y + 7 + bob, 3 + hit, 1, LT); R(ctx, 11 + hit, y + 6 + bob, 5, 5, FIST); R(ctx, 11 + hit, y + 6 + bob, 5, 1, FIN); }
    else { R(ctx, 9, y + 6 + bob + sw, 3, 5, SK); R(ctx, 9, y + 6 + bob + sw, 3, 1, LT); R(ctx, 9, y + 10 + bob + sw, 5, 4, FIST); R(ctx, 9, y + 10 + bob + sw, 5, 1, FIN); }
  }
  // cabeça: peixe-homem de cabeça larga, barbatana no topo, olhos grandes e bigode
  ({ SK, DK, LT, FIN } = HEAD);
  R(ctx, side ? 5 : 4, y - 2 + bob, side ? 7 : 8, 7, SK); R(ctx, side ? 5 : 4, y - 2 + bob, side ? 7 : 8, 1, LT);
  R(ctx, 7, y - 5 + bob - (finUp ? 1 : 0), 2, 3 + (finUp ? 1 : 0), FIN); R(ctx, 6, y - 4 + bob, 4, 1, FIN);
  if (dir === 0) {
    const fl = finUp ? 1 : 0;
    R(ctx, 3 - fl, y + 0 + bob, 1, 3, FIN); R(ctx, 12 + fl, y + 0 + bob, 1, 3, FIN);
    if (blink) { R(ctx, 5, y + 1 + bob, 2, 1, '#1d1424'); R(ctx, 9, y + 1 + bob, 2, 1, '#1d1424'); }
    else { R(ctx, 5, y - 1 + bob, 2, 3, '#fffbe8'); R(ctx, 9, y - 1 + bob, 2, 3, '#fffbe8'); R(ctx, 6 + (look < 0 ? -1 : 0), y + bob, 1, 2, '#1d1424'); R(ctx, 10 + (look < 0 ? -1 : 0), y + bob, 1, 2, '#1d1424'); }
    R(ctx, 5, y + 3 + bob, 6, 1, '#3a2412'); R(ctx, 4, y + 4 + bob, 2, 1, '#3a2412'); R(ctx, 10, y + 4 + bob, 2, 1, '#3a2412'); R(ctx, 7, y + 4 + bob, 2, 1, '#1d2a4a'); // bigode
  } else if (dir === 1) {
    R(ctx, 4, y - 2 + bob, 8, 2, DK); R(ctx, 7, y - 1 + bob, 2, 5, FIN);
  } else {
    R(ctx, 3 - (finUp ? 1 : 0), y + 1 + bob, 2, 3, FIN);
    if (blink) R(ctx, 9, y + 1 + bob, 2, 1, '#1d1424'); else { R(ctx, 9, y - 1 + bob, 2, 3, '#fffbe8'); R(ctx, 10, y + bob, 1, 2, '#1d1424'); }
    R(ctx, 8, y + 3 + bob, 5, 1, '#3a2412'); R(ctx, 12, y + 4 + bob, 2, 1, '#3a2412'); R(ctx, 9, y + 4 + bob, 3, 1, '#1d2a4a');
  }
  if (st.space) { ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(8, y + 2 + bob, 8, 0, 7); ctx.fillStyle = '#bfeaff'; ctx.fill(); ctx.globalAlpha = 0.9; ctx.lineWidth = 1; ctx.strokeStyle = '#e8f6ff'; ctx.stroke(); R(ctx, 5, y - 4 + bob, 2, 1, '#ffffff'); ctx.globalAlpha = 1; }
  ctx.restore(); ctx.globalAlpha = 1;
}
// Eduardo: boneco de treino magrelo, de tábuas e saco de estopa, com alvo pintado no peito (só madeira, estopa e corda).
export function drawDummy(ctx, x, y, t, shake) { drawOutlinedAt(ctx, x, y, (c) => drawDummyRaw(c, x, y, t, shake), 1, 'dummy:' + Math.round(x) + ',' + Math.round(y), shake > 0 ? 'S' + Math.floor(t * 60) : 'parado'); }
function drawDummyRaw(ctx, x, y, t, shake) {
  const sx = shake > 0 ? Math.round(Math.sin(t * 60) * 2 * Math.min(1, shake * 3)) : 0;
  R(ctx, x + 1, y + 14, 14, 2, 'rgba(0,0,0,0.28)');
  R(ctx, x + 2, y + 13, 12, 2, '#5a4a3a'); R(ctx, x + 2, y + 13, 12, 1, '#7a6a52'); R(ctx, x + 5, y + 12, 6, 1, '#4a3a2a'); // base de tábuas em cruz
  R(ctx, x + 7 + sx, y + 5, 2, 8, '#a08a62'); R(ctx, x + 7 + sx, y + 5, 1, 8, '#c8b488'); // poste de tábua fina
  R(ctx, x + 5 + sx, y + 6, 6, 5, '#a89a78'); R(ctx, x + 5 + sx, y + 6, 6, 1, '#c8bc9c'); R(ctx, x + 5 + sx, y + 10, 6, 1, '#8a7c5c'); // tronco de estopa
  ctx.beginPath(); ctx.arc(x + 8 + sx, y + 8.5, 2.6, 0, 7); ctx.fillStyle = '#f2ead0'; ctx.fill(); ctx.beginPath(); ctx.arc(x + 8 + sx, y + 8.5, 1.8, 0, 7); ctx.fillStyle = '#c8382e'; ctx.fill(); ctx.beginPath(); ctx.arc(x + 8 + sx, y + 8.5, 0.8, 0, 7); ctx.fillStyle = '#f2ead0'; ctx.fill(); // alvo
  R(ctx, x + 2 + sx, y + 6, 12, 1, '#8a7a5a'); R(ctx, x + 1 + sx, y + 7, 2, 2, '#c8b488'); R(ctx, x + 13 + sx, y + 7, 2, 2, '#c8b488'); // braço de tábua com mãos de pano
  R(ctx, x + 6 + sx, y + 0, 4, 5, '#c8b488'); R(ctx, x + 6 + sx, y + 0, 4, 1, '#e0d0a8'); R(ctx, x + 9 + sx, y + 1, 1, 4, '#a89460'); // cabeça de saco
  R(ctx, x + 6 + sx, y + 2, 1, 1, '#2a1a10'); R(ctx, x + 8 + sx, y + 2, 1, 1, '#2a1a10'); R(ctx, x + 7 + sx, y + 4, 2, 1, '#6a3a1a'); R(ctx, x + 6 + sx, y + 5, 4, 1, '#8a2418'); // olhos e boca costurados; cordão
  R(ctx, x + 7 + sx, y - 1, 2, 1, '#8a7a5a'); R(ctx, x + 5 + sx, y + 9, 1, 1, '#6a5a3a'); R(ctx, x + 10 + sx, y + 7, 1, 1, '#6a5a3a'); // remendos
}
// Âncora Prismática em miniatura (para a animação de viagem entre mundos): haste, argola, travessa e unhas, com brilho violeta.
export function drawAnchorProp(ctx, x, y, rot, t) {
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(rot);
  ctx.globalAlpha = 0.35 + 0.15 * Math.sin(t * 8); ctx.fillStyle = '#c47bff'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  R(ctx, -1, -5, 2, 10, '#dfe6f4'); R(ctx, -1, -5, 1, 10, '#ffffff');
  R(ctx, -3, -7, 6, 1, '#b8c4dc'); R(ctx, -3, -7, 1, 3, '#b8c4dc'); R(ctx, 2, -7, 1, 3, '#b8c4dc');
  R(ctx, -3, -3, 6, 1, '#dfe6f4');
  R(ctx, -4, 3, 2, 1, '#c8d2e8'); R(ctx, -3, 4, 1, 1, '#c8d2e8'); R(ctx, -2, 5, 4, 1, '#c8d2e8'); R(ctx, 2, 4, 1, 1, '#c8d2e8'); R(ctx, 2, 3, 2, 1, '#c8d2e8');
  R(ctx, -1, 4, 2, 1, '#9a78e0');
  ctx.restore();
}
export function drawAirBubble(ctx, x, y, t) {
  const bob = Math.round(Math.sin(t * 3 + x) * 1.5), pulse = 0.5 + 0.3 * Math.sin(t * 4 + y);
  ctx.globalAlpha = pulse * 0.6; R(ctx, x + 1, y + 1 + bob, 14, 14, '#bfeaff'); ctx.globalAlpha = 1;
  for (const [bx, by, r] of [[4, 8, 4], [10, 6, 3], [8, 11, 2]]) {
    for (let py = -r; py <= r; py++) for (let px = -r; px <= r; px++) {
      const d = px * px + py * py;
      if (d > r * r + 1) continue;
      ctx.fillStyle = d > (r - 1) * (r - 1) ? '#e4f8ff' : 'rgba(150,215,255,0.55)'; ctx.fillRect(x + bx + px, y + by + py + bob, 1, 1);
    }
    R(ctx, x + bx - 1, y + by - r + 1 + bob, 1, 1, '#ffffff');
  }
}
export function drawCurrent(ctx, x, y, w, h, dir, t) {
  // dir: 0 baixo, 1 cima, 2 esquerda, 3 direita
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w * 16, h * 16); ctx.clip();
  const horiz = dir >= 2, sign = dir === 3 || dir === 0 ? 1 : -1, len = (horiz ? w : h) * 16;
  ctx.globalAlpha = 0.14; ctx.fillStyle = '#bfeaff'; ctx.fillRect(x, y, w * 16, h * 16); ctx.globalAlpha = 0.5;
  for (let lane = 0; lane < (horiz ? h : w) * 2; lane++) for (let k = -1; k < len / 28 + 1; k++) {
    const off = ((t * 30 * sign + k * 28 + lane * 11) % (len + 28) + len + 28) % (len + 28) - 14;
    const px = horiz ? x + off : x + lane * 8 + 3, py = horiz ? y + lane * 8 + 3 : y + off;
    ctx.fillStyle = '#e4f8ff';
    if (horiz) { ctx.fillRect(px, py, 6, 1); ctx.fillRect(px + (sign > 0 ? 4 : 0), py - 1, 1, 3); }
    else { ctx.fillRect(px, py, 1, 6); ctx.fillRect(px - 1, py + (sign > 0 ? 4 : 0), 3, 1); }
  }
  ctx.restore();
}
export function drawMareRest(ctx, x, y, t) {
  R(ctx, x + 1, y + 13, 14, 3, 'rgba(10,30,60,0.4)');
  R(ctx, x + 1, y + 6, 14, 8, '#e8b0c0'); R(ctx, x + 2, y + 5, 12, 2, '#f8d0dc'); for (const k of [4, 7, 10]) R(ctx, x + k, y + 6, 1, 7, '#c8849c');
  R(ctx, x + 2, y + 9, 12, 5, '#8a4a62'); R(ctx, x + 4, y + 4, 8, 3, '#f8d0dc');
  const g = 0.6 + 0.3 * Math.sin(t * 3); ctx.globalAlpha = g * 0.5; R(ctx, x + 4, y + 2, 8, 8, '#bfeaff'); ctx.globalAlpha = 1;
  R(ctx, x + 6, y + 5, 4, 4, '#fffbe8'); R(ctx, x + 7, y + 6, 2, 2, '#ffffff'); R(ctx, x + 6, y + 5, 1, 1, '#bfeaff');
}
export function drawMareQuestItem(ctx, x, y, t, questId, index) {
  const bob = Math.round(Math.sin(t * 3 + index) * 1.5);
  R(ctx, x + 2, y + 13, 12, 3, 'rgba(10,30,60,0.4)');
  if (questId === 'bottles') { // garrafa com mensagem
    R(ctx, x + 6, y + 2 + bob, 4, 3, '#8a5a2a'); R(ctx, x + 5, y + 5 + bob, 6, 2, '#3a8a5a'); R(ctx, x + 3, y + 7 + bob, 10, 7, '#3a8a5a'); R(ctx, x + 4, y + 8 + bob, 2, 5, '#7ae0a8'); R(ctx, x + 7, y + 8 + bob, 4, 4, '#f2ead0'); R(ctx, x + 8, y + 9 + bob, 2, 1, '#8a7a5a');
  } else if (questId === 'pearls') { // pérola dentro de uma concha
    R(ctx, x + 2, y + 8 + bob, 12, 6, '#e8b0c0'); R(ctx, x + 3, y + 7 + bob, 10, 2, '#f8d0dc'); R(ctx, x + 5, y + 4 + bob, 6, 6, '#fffbe8'); R(ctx, x + 6, y + 5 + bob, 3, 3, '#ffffff'); R(ctx, x + 10, y + 8 + bob, 1, 1, '#bfeaff');
    ctx.globalAlpha = 0.3 + 0.2 * Math.sin(t * 4); R(ctx, x + 3, y + 2 + bob, 10, 10, '#bfeaff'); ctx.globalAlpha = 1;
  } else if (questId === 'lanterns') { // lanterna de pérola num poste de coral
    R(ctx, x + 7, y + 7, 2, 8, '#8a6a52'); R(ctx, x + 4, y + 14, 8, 2, '#6a4a32');
    R(ctx, x + 4, y + 2 + bob, 8, 8, '#2a3250'); R(ctx, x + 5, y + 3 + bob, 6, 6, '#8aa0c8'); R(ctx, x + 6, y + 4 + bob, 3, 3, '#e8f4ff');
    ctx.globalAlpha = 0.18 + 0.1 * Math.sin(t * 3); R(ctx, x - 1, y - 2, 18, 16, '#bfeaff'); ctx.globalAlpha = 1;
  } else if (questId === 'bell') { // pedaço do sino de bronze
    R(ctx, x + 3, y + 5 + bob, 10, 8, '#8a6a3a'); R(ctx, x + 2, y + 11 + bob, 12, 3, '#a8824a'); R(ctx, x + 6, y + 2 + bob, 4, 4, '#6a4a2a');
    R(ctx, x + 4, y + 6 + bob, 2, 5, '#e0c070'); R(ctx, x + 10, y + 7 + bob, 2, 4, '#5a3a1e'); R(ctx, x + 7, y + 7 + bob, 3, 2, '#5aa88a');
  } else { // página do diário, ondulando
    const w = Math.round(Math.sin(t * 2.5 + index));
    R(ctx, x + 3, y + 3 + bob, 10, 11, '#4a3a1c'); R(ctx, x + 4 + w, y + 4 + bob, 8, 9, '#f2ead0'); R(ctx, x + 4 + w, y + 4 + bob, 8, 1, '#fffbe8');
    for (const k of [6, 8, 10]) R(ctx, x + 5 + w, y + k + bob, 6, 1, '#8a7a5a'); R(ctx, x + 10 + w, y + 3 + bob, 2, 2, '#c8382e');
  }
}
// Cardume decorativo: peixinhos que cruzam a tela em linha ondulada.
export function drawFishSchool(ctx, o, t, wet, oy) {
  if (!wet) return;
  const sp = o.speed || 14, dir = o.dir || 1, n = o.n || 5;
  for (let i = 0; i < n; i++) {
    const base = ((t * sp * dir + (o.seed || 0) * 97 + i * 11) % 360 + 360) % 360 - 20;
    const fx = dir > 0 ? base : 320 - base, fy = o.py + oy + 8 + Math.round(Math.sin(t * 2 + i * 1.3 + (o.seed || 0)) * 5) + (i % 2) * 4;
    const col = ['#f4c06a', '#9ad8ff', '#ffa8c0'][(o.seed || 0) % 3];
    R(ctx, Math.round(fx), fy, 4, 2, col); R(ctx, Math.round(fx) + (dir > 0 ? -2 : 4), fy, 2, 2, col); R(ctx, Math.round(fx) + (dir > 0 ? 3 : 0), fy, 1, 1, '#1d1424');
  }
}
// Capacete de mergulho de latão e tanque de ar, como o traje espacial na Lua.
export function drawDiveGear(ctx, x, y, dir) {
  R(ctx, x + 3, y + 8, 10, 2, '#c9a050'); R(ctx, x + 3, y + 8, 10, 1, '#f0d078');
  ctx.fillStyle = 'rgba(190,235,255,0.28)'; ctx.beginPath(); ctx.ellipse(x + 8, y + 1.5, 8.6, 8.8, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#c9a050'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(x + 8, y + 1.5, 8.4, 8.6, 0, 0, 7); ctx.stroke();
  R(ctx, x - 1, y + 1, 1, 1, '#f0d078'); R(ctx, x + 16, y + 1, 1, 1, '#f0d078'); R(ctx, x + 7, y - 8, 2, 1, '#f0d078'); R(ctx, x + 2, y - 4, 2, 1, '#ffffff'); R(ctx, x + 1, y - 3, 1, 2, '#ffffff');
}
// Marco de história: obelisco de pedra com runa; a runa acende depois de lido.
export function drawLacrMonument(ctx, x, y, t, read) {
  R(ctx, x + 1, y + 14, 14, 2, 'rgba(10,8,28,0.45)');
  R(ctx, x + 3, y + 12, 10, 3, '#4b4268'); R(ctx, x + 3, y + 12, 10, 1, '#7a6e9c');
  R(ctx, x + 5, y + 2, 6, 10, '#1d1a36'); R(ctx, x + 6, y, 4, 2, '#1d1a36');
  R(ctx, x + 6, y + 2, 4, 10, '#8a7fae'); R(ctx, x + 7, y + 1, 2, 1, '#8a7fae'); R(ctx, x + 6, y + 2, 1, 10, '#b5aad4'); R(ctx, x + 9, y + 2, 1, 10, '#5e5482');
  const c = read ? '#9ff4ff' : (Math.sin(t * 3) > 0.6 ? '#ffe9a8' : '#3a3358');
  R(ctx, x + 7, y + 4, 2, 1, c); R(ctx, x + 7, y + 6, 2, 3, c); R(ctx, x + 6, y + 7, 4, 1, c);
}
// Santuário da Memória: pilar de pedra com runa que acende depois de despertado.
export function drawLacrShrine(ctx, x, y, t, lit) {
  R(ctx, x + 1, y + 13, 14, 3, 'rgba(10,8,28,0.45)');
  R(ctx, x + 2, y + 12, 12, 3, '#4b4268'); R(ctx, x + 2, y + 12, 12, 1, '#7a6e9c');
  R(ctx, x + 4, y + 2, 8, 11, '#1d1a36'); R(ctx, x + 5, y + 1, 6, 1, '#1d1a36');
  R(ctx, x + 5, y + 2, 6, 10, '#6a5f8e'); R(ctx, x + 5, y + 2, 1, 10, '#9a8fc0'); R(ctx, x + 10, y + 2, 1, 10, '#4b4268');
  const g = lit ? (Math.sin(t * 3) > 0 ? '#aaf6ff' : '#7fe8ff') : '#3a3358';
  R(ctx, x + 7, y + 4, 2, 5, g); R(ctx, x + 6, y + 6, 4, 1, g); R(ctx, x + 7, y + 10, 2, 1, g);
  if (lit) { ctx.globalAlpha = 0.25 + 0.15 * Math.sin(t * 3); R(ctx, x + 3, y + 1, 10, 12, '#7fe8ff'); ctx.globalAlpha = 1; }
}
export function drawLacrPlanter(ctx, x, y, t, grown) {
  if (grown) { drawCrystalTree(ctx, x, y, t); return; }
  R(ctx, x + 1, y + 12, 14, 3, 'rgba(12,8,28,0.4)');
  R(ctx, x + 2, y + 7, 12, 6, '#49345e'); R(ctx, x + 3, y + 6, 10, 2, '#d7a8f2');
  R(ctx, x + 4, y + 8, 8, 3, '#271e3c');
  R(ctx, x + 5, y + 5, 6, 2, '#8a62bd'); R(ctx, x + 7, y + 2, 2, 4, '#a6f6ff');
  const a = 0.35 + 0.3 * Math.sin(t * 4); ctx.globalAlpha = a; R(ctx, x + 5, y + 1, 6, 7, '#9d76ff'); ctx.globalAlpha = 1;
  R(ctx, x + 7, y + 3, 2, 2, '#ffffff');
}
export function drawLacrQuestItem(ctx, x, y, t, questId, index) {
  const color = questId === 'gardener' ? '#75e99a' : questId === 'miners' ? '#ffc56b' : questId === 'archivist' ? '#ff9de0' : '#73eaff';
  const bob = Math.round(Math.sin(t * 4 + index) * 2);
  R(ctx, x + 2, y + 13, 12, 3, 'rgba(12,8,28,0.5)');
  R(ctx, x + 4, y + 7 + bob, 8, 7, '#292443'); R(ctx, x + 5, y + 5 + bob, 6, 8, color);
  R(ctx, x + 6, y + 6 + bob, 4, 1, '#fff5d0'); R(ctx, x + 7, y + 9 + bob, 2, 3, '#443458');
  R(ctx, x + 2, y + 8 + bob, 2, 2, color); R(ctx, x + 12, y + 6 + bob, 2, 2, '#ffffff');
}
export function drawLacrBook(ctx, x, y, t) { // livro aberto num atril de cristal, com runas flutuando
  const glow = 0.35 + 0.25 * Math.sin(t * 4);
  R(ctx, x + 2, y + 13, 12, 3, 'rgba(12,8,28,0.5)');
  R(ctx, x + 6, y + 9, 4, 5, '#3a2a5a'); R(ctx, x + 4, y + 13, 8, 2, '#3a2a5a'); R(ctx, x + 6, y + 9, 1, 5, '#7a5aaa');
  ctx.globalAlpha = glow; R(ctx, x + 1, y + 1, 14, 10, '#b174ff'); ctx.globalAlpha = 1;
  R(ctx, x + 1, y + 4, 14, 7, '#2a1848'); R(ctx, x + 2, y + 4, 6, 6, '#f1d8ff'); R(ctx, x + 8, y + 4, 6, 6, '#d1b0f2'); R(ctx, x + 7, y + 4, 2, 7, '#633d91');
  for (const k of [6, 8]) { R(ctx, x + 3, y + k, 4, 1, '#8c63bd'); R(ctx, x + 9, y + k, 4, 1, '#8c63bd'); }
  const f = (t * 0.8) % 1; ctx.globalAlpha = 1 - f; R(ctx, x + 4 + Math.round(Math.sin(t * 2) * 2), y + 2 - Math.round(f * 6), 1, 2, '#e0c8ff'); R(ctx, x + 11, y + 1 - Math.round(f * 5), 2, 1, '#a6f6ff'); ctx.globalAlpha = 1;
}
export function drawCapsule(ctx, x, y, t, past, state) {
  R(ctx, x + 1, y + 12, 14, 3, 'rgba(0,0,0,0.25)');
  if (past) { R(ctx, x + 2, y + 9, 12, 5, '#a8884e'); R(ctx, x + 2, y + 9, 12, 1, '#c8a866'); if (state !== 'buried') { R(ctx, x + 12, y + 2, 2, 9, '#6b4226'); R(ctx, x + 10, y + 1, 5, 3, '#aab0c0'); } else { R(ctx, x + 6, y + 6, 4, 3, '#c8c8d8'); } return; }
  R(ctx, x + 3, y + 7, 10, 7, '#9aa0b4'); R(ctx, x + 3, y + 7, 10, 2, '#c8ccdc'); R(ctx, x + 6, y + 10, 4, 2, state === 'open' ? '#1a1a2a' : '#ffd23a');
  if (state === 'ready') { const a = 0.4 + 0.3 * Math.sin(t * 5); ctx.globalAlpha = a; R(ctx, x + 2, y + 5, 12, 10, '#ffd23a'); ctx.globalAlpha = 1; }
}
export function drawCrystalTree(ctx, x, y, t) {
  R(ctx, x - 2, y + 12, 20, 4, 'rgba(0,0,0,0.3)');
  R(ctx, x + 6, y + 2, 4, 12, '#6a5aa0'); R(ctx, x + 6, y + 2, 1, 12, '#9a8ad0');
  const cols = ['#7af0ff', '#c08aff', '#ffffff', '#7af0ff'];
  for (const [dx, dy, h, ci] of [[0, 4, 8, 0], [12, 3, 9, 1], [3, -6, 10, 2], [9, -9, 12, 3], [-2, -1, 6, 1], [14, 8, 6, 0]]) { R(ctx, x + dx, y + dy, 3, h, cols[ci]); R(ctx, x + dx, y + dy, 1, h, '#ffffff'); }
  const a = 0.25 + 0.2 * Math.sin(t * 3); ctx.globalAlpha = a; ctx.fillStyle = '#c8f8ff'; ctx.beginPath(); ctx.ellipse(x + 8, y + 2, 14, 12, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
}
// Antena de Selene: prato, mastro e três luzes que acendem com os cristais
export function drawAntenna(ctx, x, y, t, placed, done) {
  R(ctx, x - 1, y + 13, 18, 3, 'rgba(0,0,0,0.3)');
  R(ctx, x + 3, y + 10, 10, 5, '#6a6a7c'); R(ctx, x + 3, y + 10, 10, 1, '#9a9aae');
  R(ctx, x + 7, y - 8, 2, 19, '#8a8a9c'); R(ctx, x + 7, y - 8, 1, 19, '#b4b4c6');
  ctx.fillStyle = '#c8c8d8'; ctx.beginPath(); ctx.ellipse(x + 8, y - 8, 9, 4, -0.3, 0, 7); ctx.fill();
  ctx.fillStyle = '#9a9aae'; ctx.beginPath(); ctx.ellipse(x + 8, y - 7, 7, 2.6, -0.3, 0, 7); ctx.fill();
  R(ctx, x + 7, y - 14, 2, 6, '#8a8a9c');
  const cols = ['#7af0ff', '#c08aff', '#ffffff'];
  for (let i = 0; i < 3; i++) {
    const on = done || i < placed, pulse = on ? (0.7 + 0.3 * Math.sin(t * 4 + i)) : 0.25;
    ctx.globalAlpha = pulse; R(ctx, x + 4 + i * 3, y + 6, 2, 3, on ? cols[i] : '#3a3a4a'); ctx.globalAlpha = 1;
  }
  if (done || placed > 0) { ctx.globalAlpha = 0.4 + 0.3 * Math.sin(t * 5); R(ctx, x + 6, y - 16, 4, 2, '#ffffff'); ctx.globalAlpha = 1; }
}
// Bilheteria do Trem Infinito
export function drawTicket(ctx, x, y, t) {
  R(ctx, x, y + 13, 16, 3, 'rgba(0,0,0,0.3)');
  R(ctx, x + 1, y + 5, 14, 9, '#8a5a34'); R(ctx, x + 1, y + 5, 14, 1, '#a87444');
  R(ctx, x + 3, y + 7, 10, 4, '#ffe9a8'); R(ctx, x + 3, y + 7, 10, 1, '#fff6d0');
  R(ctx, x, y + 2, 16, 4, '#a8433a'); R(ctx, x, y + 2, 16, 1, '#d0605a');
  R(ctx, x + 6, y - 2, 4, 4, '#3a3a48'); R(ctx, x + 7, y - 4 - Math.floor(t * 3) % 2, 2, 2, 'rgba(230,230,240,0.7)');
}
// ---------------------------------------------------------------- estação: trilhos, trem e mobília
import { TRAIN, TRAIN_PITCH, trainState } from './train.js';
// Leito de brita com dormentes e dois trilhos, de ponta a ponta da tela (linhas 7 e 8)
export function drawTrack(ctx, oy) {
  const y0 = 112 + oy;
  R(ctx, 0, y0, 320, 32, '#7e786c');
  for (let i = 0; i < 160; i++) { const x = (i * 37) % 320, y = y0 + 1 + ((i * 53) % 30); R(ctx, x, y, 2, 1, i % 3 ? '#9a9486' : '#5e584e'); }
  R(ctx, 0, y0, 320, 1, '#5e584e'); R(ctx, 0, y0 + 31, 320, 1, '#5e584e');
  for (let x = 2; x < 320; x += 11) { R(ctx, x, y0 + 4, 5, 24, '#5a3c22'); R(ctx, x, y0 + 4, 5, 2, '#7a5430'); }
  for (const ry of [y0 + 10, y0 + 22]) { R(ctx, 0, ry, 320, 3, '#b8bccc'); R(ctx, 0, ry, 320, 1, '#e8ecf4'); R(ctx, 0, ry + 3, 320, 1, '#3a3a48'); }
}
function wheel(ctx, cx, cy, r, ang) {
  ctx.fillStyle = '#1a1a24'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
  ctx.fillStyle = '#6a6a7c'; ctx.beginPath(); ctx.arc(cx, cy, r - 1.5, 0, 7); ctx.fill();
  ctx.strokeStyle = '#c8ccd8'; ctx.lineWidth = 1;
  for (let k = 0; k < 3; k++) { const a = ang + k * Math.PI / 3; ctx.beginPath(); ctx.moveTo(cx - Math.cos(a) * (r - 2), cy - Math.sin(a) * (r - 2)); ctx.lineTo(cx + Math.cos(a) * (r - 2), cy + Math.sin(a) * (r - 2)); ctx.stroke(); }
  ctx.fillStyle = '#c9a03a'; ctx.fillRect(cx - 1, cy - 1, 2, 2);
}
// Vagões sem fim passando da esquerda para a direita, sem nenhuma brecha
export function drawTrain(ctx, oy, t, st = null) {   // `st` (opcional): posição própria {off, n0, ang} para a tela de transição
  const { off, n0 } = st || trainState(), by = TRAIN.rowY + 10 + oy, cw = TRAIN.carW;
  const colors = [['#c8443a', '#e8685a', '#8a2a24'], ['#3a6ac0', '#5a8ae0', '#264a8a'], ['#d8a830', '#f0c850', '#9a7418'], ['#3a9a5a', '#5ac07a', '#246a3a']];
  const ang = st && st.ang !== undefined ? st.ang : -(off + n0 * TRAIN_PITCH) * 0.12;
  for (let k = -1; k * TRAIN_PITCH - TRAIN_PITCH < 320; k++) {
    const x0 = off + k * TRAIN_PITCH, n = n0 - k, [c, hi, lo] = colors[((n % 4) + 4) % 4];
    if (x0 > 322 || x0 + cw < -2) continue;
    // sanfona entre os vagões e engate
    R(ctx, x0 + cw, by - 26, TRAIN.gap, 20, '#2a2a34'); for (let yy = by - 25; yy < by - 7; yy += 3) R(ctx, x0 + cw, yy, TRAIN.gap, 1, '#4a4a58');
    R(ctx, x0 + cw - 1, by - 14, TRAIN.gap + 2, 3, '#1a1a24');
    // chassi e truques das rodas
    R(ctx, x0, by - 5, cw, 3, '#2a2a34'); R(ctx, x0 + 1, by - 5, cw - 2, 1, '#4a4a58');
    for (const bx of [x0 + 5, x0 + cw - 21]) { R(ctx, bx, by - 4, 16, 3, '#1a1a24'); R(ctx, bx + 1, by - 4, 14, 1, '#3a3a48'); }
    // caixa do vagão: teto arredondado, faixa clara, saia escura e friso dourado
    R(ctx, x0 + 1, by - 29, cw - 2, 24, c); R(ctx, x0 + 1, by - 29, cw - 2, 2, hi); R(ctx, x0 + 1, by - 9, cw - 2, 4, lo);
    R(ctx, x0 + 1, by - 29, 2, 24, hi); R(ctx, x0 + cw - 3, by - 29, 2, 24, lo);
    R(ctx, x0 + 1, by - 11, cw - 2, 1, '#f0d068'); R(ctx, x0 + 1, by - 26, cw - 2, 1, shadeHex(lo, 1.1));
    R(ctx, x0 + 2, by - 32, cw - 4, 3, '#8a8a9c'); R(ctx, x0 + 1, by - 31, cw - 2, 2, '#8a8a9c'); R(ctx, x0 + 3, by - 33, cw - 6, 1, '#c8ccd8'); R(ctx, x0 + 2, by - 32, cw - 4, 1, '#b0b4c4');
    for (const vx of [x0 + 12, x0 + cw - 16]) { R(ctx, vx, by - 35, 5, 2, '#6a6a7c'); R(ctx, vx, by - 35, 5, 1, '#a8acbc'); }   // respiros no teto
    // janelas iluminadas com cantos arredondados e, às vezes, um passageiro
    for (let w = 0; w < 4; w++) {
      const wx = x0 + 6 + w * 11;
      R(ctx, wx, by - 24, 8, 10, '#1e1e28'); R(ctx, wx + 1, by - 23, 6, 8, '#ffe9a8'); R(ctx, wx + 1, by - 23, 6, 2, '#fff6d0');
      R(ctx, wx, by - 24, 1, 1, c); R(ctx, wx + 7, by - 24, 1, 1, c); R(ctx, wx, by - 15, 1, 1, c); R(ctx, wx + 7, by - 15, 1, 1, c);
      if (hash(n, w, 3) < 0.45) { R(ctx, wx + 2, by - 20, 3, 2, '#3a2a3a'); R(ctx, wx + 2, by - 18, 4, 3, '#4a3a5a'); }
      R(ctx, wx + 1, by - 17, 6, 1, '#e8c070');
    }
    // número do vagão
    R(ctx, x0 + cw / 2 - 3, by - 8, 6, 3, '#f0d068'); R(ctx, x0 + cw / 2 - 2, by - 7, 4, 1, lo);
    for (const wx of [x0 + 8, x0 + 16, x0 + cw - 16, x0 + cw - 8]) wheel(ctx, wx, by - 1, 3.5, ang);
  }
}
export function drawSignal(ctx, x, y, t, warn) {
  R(ctx, x + 2, y + 13, 12, 3, 'rgba(0,0,0,0.3)');
  R(ctx, x + 7, y - 8, 2, 22, '#4a4a58'); R(ctx, x + 7, y - 8, 1, 22, '#7a7a90');
  R(ctx, x + 1, y - 6, 14, 3, '#f0f0f8'); R(ctx, x + 6, y - 11, 4, 12, '#f0f0f8'); R(ctx, x + 1, y - 6, 14, 1, '#c84a3a');     // cruz de aviso
  const on = warn && Math.floor(t * 4) % 2 === 0, off = warn && !on;
  R(ctx, x + 1, y - 1, 5, 5, '#1a1a24'); R(ctx, x + 10, y - 1, 5, 5, '#1a1a24');
  R(ctx, x + 2, y, 3, 3, on ? '#ff3a3a' : '#5a2020'); R(ctx, x + 11, y, 3, 3, off ? '#ff3a3a' : '#5a2020');
  if (warn) { ctx.globalAlpha = 0.25; R(ctx, on ? x - 2 : x + 8, y - 3, 10, 10, '#ff3a3a'); ctx.globalAlpha = 1; }
}
export function drawLampPost(ctx, x, y, t) {
  R(ctx, x + 3, y + 13, 10, 3, 'rgba(0,0,0,0.3)');
  R(ctx, x + 5, y + 11, 6, 4, '#2a2a36'); R(ctx, x + 4, y + 14, 8, 1, '#2a2a36'); R(ctx, x + 5, y + 11, 6, 1, '#5a5a6e');   // base
  R(ctx, x + 7, y - 6, 2, 17, '#2a2a36'); R(ctx, x + 7, y - 6, 1, 17, '#5a5a6e'); R(ctx, x + 6, y + 2, 4, 1, '#3a3a48');
  // lanterna de vidro com telhadinho e pináculo
  R(ctx, x + 4, y - 13, 8, 8, '#1a1a24'); R(ctx, x + 5, y - 12, 6, 6, '#ffe9a8'); R(ctx, x + 5, y - 12, 2, 6, '#fff6d8'); R(ctx, x + 7, y - 12, 1, 6, '#1a1a24'); R(ctx, x + 8, y - 12, 1, 6, '#e8c870');
  R(ctx, x + 3, y - 15, 10, 2, '#3a3a48'); R(ctx, x + 5, y - 16, 6, 1, '#3a3a48'); R(ctx, x + 7, y - 18, 2, 2, '#5a5a6e'); R(ctx, x + 3, y - 15, 10, 1, '#6a6a7e');
  R(ctx, x + 4, y - 5, 8, 1, '#3a3a48');
  ctx.globalAlpha = 0.16 + 0.06 * Math.sin(t * 5); ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(x + 8, y - 9, 13, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
}
export function drawBench(ctx, x, y) {
  R(ctx, x - 2, y + 12, 20, 3, 'rgba(0,0,0,0.28)');
  // pés de ferro fundido com voluta
  for (const lx of [x, x + 14]) { R(ctx, lx, y + 2, 2, 12, '#2a2a36'); R(ctx, lx, y + 2, 1, 12, '#4a4a5c'); R(ctx, lx - 1, y + 13, 4, 1, '#2a2a36'); R(ctx, lx + (lx === x ? 1 : -1), y + 9, 2, 1, '#2a2a36'); }
  // encosto e assento de ripas
  for (const [ry, c, hi] of [[y - 1, '#9a6a3a', '#c8945c'], [y + 2, '#8a5a30', '#b07e44']]) { R(ctx, x - 1, ry, 18, 2, c); R(ctx, x - 1, ry, 18, 1, hi); R(ctx, x + 16, ry, 1, 2, '#5a3a1e'); }
  R(ctx, x - 1, y + 6, 18, 2, '#a8743e'); R(ctx, x - 1, y + 6, 18, 1, '#d8a46a'); R(ctx, x - 1, y + 8, 18, 2, '#8a5a30'); R(ctx, x - 1, y + 10, 18, 1, '#5a3a1e');
  for (const k of [3, 8, 13]) R(ctx, x + k, y + 7, 1, 1, '#5a3a1e');
}
export function drawWell(ctx, x, y, t, active) {
  R(ctx, x - 1, y + 13, 18, 3, 'rgba(0,0,0,0.3)');
  // telhado de telhas sobre dois postes
  R(ctx, x + 1, y - 3, 2, 11, '#4a2e18'); R(ctx, x + 13, y - 3, 2, 11, '#4a2e18'); R(ctx, x + 1, y - 3, 1, 11, '#7a5230'); R(ctx, x + 13, y - 3, 1, 11, '#6b4226');
  R(ctx, x - 1, y - 6, 18, 3, '#8f2f29'); R(ctx, x, y - 7, 16, 2, '#b4433a'); R(ctx, x + 2, y - 8, 12, 1, '#d0604f');
  for (let k = 1; k < 16; k += 3) R(ctx, x + k, y - 6, 1, 2, '#6e2420');
  R(ctx, x - 1, y - 4, 18, 1, '#5a1e1a');
  // sarilho com corda e balde
  R(ctx, x + 3, y - 1, 10, 2, '#7a5230'); R(ctx, x + 3, y - 1, 10, 1, '#a07040'); R(ctx, x + 14, y - 2, 2, 2, '#4a4a56');
  R(ctx, x + 8, y + 1, 1, 4, '#d8c08a');
  R(ctx, x + 6, y + 4, 5, 3, '#6b4226'); R(ctx, x + 6, y + 4, 5, 1, '#9a6a3a'); R(ctx, x + 6, y + 5, 5, 1, '#4a4a56');
  // boca do poço e água
  R(ctx, x + 1, y + 6, 14, 4, '#3a3a48'); R(ctx, x + 2, y + 7, 12, 3, active ? '#5a3ab8' : '#1c2a44');
  R(ctx, x + 3, y + 8, 10, 2, active ? '#7a5ad8' : '#2a4a70');
  if (active) { if (Math.sin(t * 4) > 0) R(ctx, x + 5, y + 8, 4, 1, '#d8c8ff'); ctx.globalAlpha = 0.25 + 0.15 * Math.sin(t * 3); R(ctx, x + 2, y + 2, 12, 6, '#b89aff'); ctx.globalAlpha = 1; }
  else if (Math.sin(t * 2) > 0.3) R(ctx, x + 4, y + 8, 3, 1, '#8ab8e8');
  // anel de pedras em duas fileiras, cada pedra com luz em cima e sombra embaixo
  const stones = (sy, off, h) => { for (let k = -off; k < 16; k += 5) { const sx = Math.max(x, x + k), w = Math.min(x + 16, x + k + 4) - sx; if (w <= 0) continue; const tone = hash(x + k, sy, 3) < 0.4 ? '#7c7c8c' : '#9494a4'; R(ctx, sx, sy, w, h, tone); R(ctx, sx, sy, w, 1, '#c4c4d2'); R(ctx, sx, sy + h - 1, w, 1, '#5a5a6a'); } };
  R(ctx, x, y + 9, 16, 7, '#4a4a58');
  stones(y + 9, 0, 3); stones(y + 12, 2, 3);
  R(ctx, x, y + 6, 16, 1, '#b0b0c0'); R(ctx, x, y + 6, 1, 4, '#9494a4'); R(ctx, x + 15, y + 6, 1, 4, '#6a6a7a');
  R(ctx, x + 2, y + 13, 2, 1, '#4c8a3c'); R(ctx, x + 12, y + 14, 2, 1, '#4c8a3c');   // musgo
}
// Círculo da área segura (ponto de retorno): anel dourado pulsando com uma bolota no meio
export function drawSafeRing(ctx, cx, cy, t) {
  const k = 0.55 + Math.sin(t * 2.4) * 0.2;
  ctx.save();
  ctx.globalAlpha = 0.35 * k; ctx.fillStyle = '#ffe08a';
  ctx.beginPath(); ctx.ellipse(cx, cy, 13, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 0.9 * k; ctx.strokeStyle = '#ffd04a'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(cx, cy, 13, 7, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, cy, 9, 4.5, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 1;
  // bolota
  R(ctx, cx - 2, cy - 3, 5, 2, '#6a4020'); R(ctx, cx - 1, cy - 4, 3, 1, '#6a4020'); R(ctx, cx, cy - 5, 1, 1, '#4a2a10');
  R(ctx, cx - 2, cy - 1, 5, 3, '#c8843a'); R(ctx, cx - 1, cy + 2, 3, 1, '#c8843a'); R(ctx, cx - 1, cy - 1, 1, 2, '#e8b060');
  for (let i = 0; i < 3; i++) { const a = t * 1.5 + i * 2.1; R(ctx, Math.round(cx + Math.cos(a) * 11), Math.round(cy + Math.sin(a) * 5 - 2 - ((t * 10 + i * 7) % 6)), 1, 1, '#fff2b0'); }
  ctx.restore();
}
export function drawFountain(ctx, x, y, t) {
  // Axolote Lunar: um bichinho cor-de-rosa que brilha na água da gruta; gotas de luz sobem dele
  for (let i = 0; i < 6; i++) {
    const k = (t * 0.55 + i / 6) % 1;
    const fx = x + 8 + Math.sin(t * 2 + i * 1.7) * 14, fy = y - 4 - k * 38;
    ctx.globalAlpha = 1 - k; R(ctx, Math.round(fx), Math.round(fy), 2, 2, i % 2 ? '#ffd0e4' : '#7af0d8'); ctx.globalAlpha = 1;
  }
  const cx = x + 8, bob = Math.round(Math.sin(t * 2.4) * 3), top = y - 34 + bob, left = cx - 11;
  const pulse = 0.14 + Math.sin(t * 3) * 0.05;
  ctx.globalAlpha = pulse; ctx.fillStyle = '#7af0d8'; ctx.beginPath(); ctx.ellipse(cx, top + 13, 15, 17, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  // reflexo na água (fica menor quando ele sobe)
  ctx.globalAlpha = 0.3; R(ctx, cx - 6 + bob, y + 1, 12 - bob * 2, 2, '#7af0d8'); ctx.globalAlpha = 1;
  // flutuando em pé sobre a água, de frente: brânquias que ondulam (pontas piscando), olhos, bracinhos, perninhas e o rabo balançando
  const sway = Math.round(Math.sin(t * 4)), tip = 0.6 + Math.sin(t * 5) * 0.4;
  const px = (k, xx, yy) => { if (k === 't') ctx.globalAlpha = tip; R(ctx, xx, yy, 1, 1, AXO_COLORS[k]); if (k === 't') ctx.globalAlpha = 1; };
  for (const [i, j, k] of AXO_BODY) {
    const gill = k === 'g' || k === 'G' || k === 't';
    px(k, left + j, top + i + (gill && i < 9 ? sway * (j < 11 ? 1 : -1) * (i < 4 ? 1 : i > 5 ? -1 : 0) : 0));
  }
  for (const [i, j, k] of AXO_TAIL) px(k, left + j + Math.round(Math.sin(t * 4 - i * 0.7) * (i + 1) / 2.5), top + AXO_TAIL_Y + i);
}
const AXO_COLORS = { o: '#9c3f66', p: '#ffb3cc', P: '#ffd8e6', s: '#ef8fb2', g: '#e8457a', G: '#ff86ad', t: '#8ff5e0', e: '#1e0a18', w: '#ffffff', c: '#ff7fa6', m: '#7a2a4a', b: '#ffe6ef' };
const axoCells = (rows) => rows.flatMap((row, i) => [...row].map((k, j) => [i, j, k]).filter(([, , k]) => k !== '.'));
const AXO_BODY = axoCells([
  't....................t',
  'Gg..................gG',
  '.Gg.....oooooo.....gG.',
  '..gg..ooPPPPPPoo..gg..',
  'tGGggoPPPppppPPPoggGGt',
  '..ggoPppppppppppPogg..',
  '.Gg.opweppppppwepo.gG.',
  'Gg..opeeppppppeepo..gG',
  't...ocpppmppmpppco...t',
  '....ospppsmmspppso....',
  '.....osssssssssso.....',
  '......opbbbbbbpo......',
  '....ppopbbbbbbpopp....',
  '...pPp.opbbbbpo.pPp...',
  '..pp...opbbbbpo...pp..',
  '.......opbbbbpo.......',
  '......ospbbbbpso......',
  '.....ppospbbpsopp.....',
  '....pPp.osppso.pPp....',
  '....pp...osso...pp....',
]);
const AXO_TAIL_Y = 20;
const AXO_TAIL = axoCells([
  '........osppso........',
  '........GsppsG........',
  '.........GssG.........',
  '.........GssG.........',
  '..........GG..........',
]);
// Portal dimensional de 2 × 2 blocos: disco violeta circular com redemoinho e aro luminoso.
export function drawDimensionPortal(ctx, x, y, t) {
  const C = 7.5;
  for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
    const dx = xx - C, dy = yy - C, d = Math.hypot(dx, dy);
    if (d > 7.9) continue;
    let color;
    if (d > 6.6) color = (xx + yy + Math.floor(t * 6)) % 4 === 0 ? '#f6d4ff' : '#c47bff';
    else {
      const ang = Math.atan2(dy, dx), wave = Math.sin(ang * 3 + d * 1.1 - t * 3.2) + Math.cos(d * 1.6 - t * 1.7);
      color = d < 1.8 ? '#f0b5ff' : wave > 1.0 ? '#d77bff' : wave > 0.2 ? '#b653e8' : wave > -0.7 ? '#913bc6' : '#69239c';
    }
    R(ctx, x + xx * 2, y + yy * 2, 2, 2, color);
  }
  for (let i = 0; i < 6; i++) {
    const a = t * 1.4 + i * 1.05, r = 5 + (i % 3) * 3;
    R(ctx, x + Math.round(16 + Math.cos(a) * r), y + Math.round(16 + Math.sin(a) * r), 1, 1, '#ffffff');
  }
}
export function drawWarp(ctx, x, y, look, t) {
  if (look === 'dimensionPortal') return drawDimensionPortal(ctx, x, y, t);
  if (look === 'house') return; // a própria porta da casa já está desenhada
  if (look === 'temple') return; // a porta faz parte da fachada desenhada no cenário
  if (look === 'whirl') { // redemoinho de luz aberto pelo farol aceso
    const k = (i) => 0.5 + 0.5 * Math.sin(t * 3 + i);
    ctx.globalAlpha = 0.22 + 0.1 * k(0); R(ctx, x - 14, y - 10, 44, 36, '#d8f4ff');
    ctx.globalAlpha = 0.35 + 0.15 * k(1); R(ctx, x - 6, y - 4, 28, 24, '#ffffff');
    ctx.globalAlpha = 1; R(ctx, x + 1, y + 2, 14, 12, '#2a8ae0'); R(ctx, x + 3, y + 4, 10, 8, '#7ad0ff'); R(ctx, x + 5, y + 6, 6, 4, '#ffffff'); R(ctx, x + 7, y + 7, 2, 2, '#fffbd0');
    for (let i = 0; i < 8; i++) { const a = t * 2.6 + i * 0.8, r = 3 + (i % 4) * 2; R(ctx, x + 7 + Math.round(Math.cos(a) * r * 1.3), y + 7 + Math.round(Math.sin(a) * r), 2, 2, i % 2 ? '#ffffff' : '#9fe4ff'); }
    for (let i = 0; i < 3; i++) { const yy = ((t * 12 + i * 9) % 26); ctx.globalAlpha = 0.7 - yy / 40; R(ctx, x + 2 + i * 5, y - yy, 2, 2, '#ffffff'); }
    ctx.globalAlpha = 1; return;
  }
  if (look === 'hole') {
    // buraco com borda de terra e escada de madeira descendo para o escuro
    R(ctx, x + 1, y + 1, 14, 14, '#4a3420'); R(ctx, x + 2, y + 2, 12, 12, '#0a0812'); R(ctx, x + 2, y + 2, 12, 2, '#2a1c10');
    R(ctx, x + 1, y + 1, 14, 1, '#7a5a34');
    R(ctx, x + 4, y + 3, 1, 11, '#8a5a30'); R(ctx, x + 11, y + 3, 1, 11, '#6b4226');
    for (let k = 0; k < 3; k++) { R(ctx, x + 4, y + 4 + k * 4, 8, 2, '#8a5a30'); R(ctx, x + 4, y + 4 + k * 4, 8, 1, '#b07a44'); }
    R(ctx, x + 2, y + 12, 12, 2, 'rgba(0,0,0,0.5)');
    return;
  }
  if (look === 'cave') {
    // boca de caverna em arco: breu que clareia perto do chão, borda de rocha, estalactites e olhinhos que piscam
    for (let yy = 0; yy < 16; yy++) { const hw = yy < 7 ? Math.round(Math.sqrt(49 - (7 - yy) ** 2)) + 1 : 8; R(ctx, x, y + yy, 16, 1, '#3a3040'); R(ctx, x + 8 - hw, y + yy, hw * 2, 1, yy > 12 ? '#1a1424' : '#0a0812'); }
    for (let yy = 1; yy < 16; yy++) { const hw = yy < 7 ? Math.round(Math.sqrt(49 - (7 - yy) ** 2)) + 1 : 8; if (hw < 8) { R(ctx, x + 7 - hw, y + yy, 1, 1, '#5a4e60'); R(ctx, x + 8 + hw, y + yy, 1, 1, '#241c2c'); } }
    for (const [sx, L] of [[4, 3], [7, 2], [10, 4], [12, 2]]) { R(ctx, x + sx, y + 2, 1, L, '#3a3040'); R(ctx, x + sx, y + 2, 1, 1, '#5a4e60'); }
    if (Math.floor(t * 0.7) % 5 !== 0) { R(ctx, x + 5, y + 8, 1, 1, '#ffe08a'); R(ctx, x + 10, y + 8, 1, 1, '#ffe08a'); }
    return;
  }
  if (look === 'exit') {
    // saída: faixa de luz do dia entrando pela porta, com setinha
    ctx.globalAlpha = 0.22 + Math.sin(t * 3) * 0.08;
    R(ctx, x, y, 16, 16, '#ffe8a8'); R(ctx, x + 2, y + 4, 12, 12, '#fff4d0');
    ctx.globalAlpha = 0.5 + Math.sin(t * 4) * 0.25; const k = Math.round(Math.sin(t * 4)); R(ctx, x + 6, y + 9 + k, 4, 1, '#fff4d0'); R(ctx, x + 7, y + 10 + k, 2, 1, '#fff4d0');
    ctx.globalAlpha = 1;
  } else if (look === 'anchor') {
    ctx.globalAlpha = 0.75 + Math.sin(t * 4) * 0.2;
    R(ctx, x + 3, y + 4, 10, 10, '#252040'); R(ctx, x + 6, y + 2, 4, 11, '#9c78df');
    R(ctx, x + 7, y + 3, 2, 8, '#d8c4ff'); R(ctx, x + 4, y + 7, 8, 2, '#6de0e8'); R(ctx, x + 5, y + 12, 6, 2, '#47376f');
    ctx.globalAlpha = 1;
  } else if (look === 'portal' || look === 'stairs') {
    if (look === 'stairs') {
      // escada de pedra descendo: degraus que escurecem conforme afundam
      R(ctx, x, y, 16, 16, '#0a0812');
      for (let k = 0; k < 4; k++) { const tone = ['#6a6488', '#4e4a68', '#363250', '#24203a'][k]; R(ctx, x + 1 + k, y + 1 + k * 4, 14 - k * 2, 3, tone); R(ctx, x + 1 + k, y + 1 + k * 4, 14 - k * 2, 1, shadeHex(tone, 1.35)); }
      R(ctx, x, y, 1, 16, '#2a2440'); R(ctx, x + 15, y, 1, 16, '#2a2440');
    } else {
      // portal de saída: anel de luz que gira com miolo branco
      ctx.globalAlpha = 0.35 + Math.sin(t * 5) * 0.15; R(ctx, x, y, 16, 16, '#7af0ff'); ctx.globalAlpha = 1;
      R(ctx, x + 3, y + 3, 10, 10, '#2a8ab8'); R(ctx, x + 4, y + 4, 8, 8, '#7af0ff'); R(ctx, x + 6, y + 6, 4, 4, '#ffffff');
      for (let i = 0; i < 6; i++) { const an = t * 3 + i * Math.PI / 3; R(ctx, x + 7 + Math.round(Math.cos(an) * 6), y + 7 + Math.round(Math.sin(an) * 6), 2, 2, i % 2 ? '#ffffff' : '#bff4ff'); }
    }
  } else {
    R(ctx, x, y, 16, 16, '#0a0812');
    R(ctx, x, y + 12, 16, 4, '#1a1624');
  }
}


// ---------------------------------------------------------------- efeitos
// Partículas: as maiores viram estrelinhas em cruz com miolo claro no começo da vida e somem aos poucos
export function drawParticles(ctx, parts, oy) {
  for (const q of parts) {
    const k = q.life / q.max, x = Math.round(q.x), y = Math.round(q.y) + oy;
    ctx.globalAlpha = Math.min(1, k * 1.5);
    if (q.size >= 3) {   // fumaça/poeira: bolinha com sombra embaixo e brilho em cima
      const s = q.size + (k < 0.5 ? 1 : 0);
      R(ctx, x, y + 1, s, s - 1, shadeHex(q.color.length === 7 ? q.color : '#808080', 0.75)); R(ctx, x + 1, y, s - 1, s - 1, q.color); R(ctx, x + 1, y, 1, 1, 'rgba(255,255,255,0.35)');
    } else if (q.size === 2) {
      R(ctx, x, y - 1, 1, 3, q.color); R(ctx, x - 1, y, 3, 1, q.color);
      if (k > 0.55) R(ctx, x, y, 1, 1, '#ffffff');
    } else R(ctx, x, y, 1, 1, q.color);
  }
  ctx.globalAlpha = 1;
}
// Explosão de bomba em pixel: clarão, bola de fogo em anéis (amarelo, laranja, vermelho) e anel de choque
export function drawBoom(ctx, x, y, k) {
  x = Math.round(x); y = Math.round(y);
  const disc = (rad, col) => { rad = Math.max(1, Math.round(rad)); ctx.fillStyle = col; for (let dy = -rad; dy <= rad; dy++) { const hw = Math.round(Math.sqrt(rad * rad - dy * dy)); ctx.fillRect(x - hw, y + dy, hw * 2, 1); } };
  if (k < 0.25) { ctx.globalAlpha = 0.5 * (1 - k * 4); disc(30, '#fff6d0'); }
  ctx.globalAlpha = Math.max(0, 1 - k * 0.9);
  const R0 = 8 + k * 18;
  disc(R0, '#c8361a'); disc(R0 * 0.8, '#ff8a1e'); disc(R0 * 0.55, '#ffd23a'); if (k < 0.6) disc(R0 * 0.3, '#ffffff');
  // anel de choque pontilhado
  ctx.globalAlpha = Math.max(0, 0.8 - k); ctx.fillStyle = '#fff2c0';
  const rr = 10 + k * 30;
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; ctx.fillRect(Math.round(x + Math.cos(a) * rr), Math.round(y + Math.sin(a) * rr * 0.7), 2, 1); }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- ícones (8x8 aprox.)
export function drawIcon(ctx, name, x, y) {
  if (name && name.startsWith('sp:')) return drawSpellIcon(ctx, name.slice(3), x, y);
  // itens redesenhados (src/icons16.js): o mesmo desenho do inventário, reduzido para caber no espaço de 8x8 (HUD, chão, lojas)
  { const small = icon16Small(name, 10); if (small) { ctx.drawImage(small, x - 1, y - 1); return; } }
  switch (name) {
    case 'castleArchives': case 'castleQuarters': case 'castleObservatory': { const col = { castleArchives: '#7af0ff', castleQuarters: '#ffe080', castleObservatory: '#ce9fff' }[name]; R(ctx, x + 2, y, 5, 5, col); R(ctx, x + 3, y + 1, 3, 3, '#fff'); R(ctx, x + 4, y + 4, 1, 4, col); R(ctx, x + 4, y + 6, 3, 1, col); break; }

    case 'heart': case 'half': case 'empty': {
      const c = name === 'empty' ? '#3a2a3a' : '#e8344a', ol = '#1a0810';
      // contorno escuro em volta do coração
      R(ctx, x, y - 1, 3, 1, ol); R(ctx, x + 4, y - 1, 3, 1, ol); R(ctx, x + 3, y, 1, 1, ol); R(ctx, x - 1, y, 1, 3, ol); R(ctx, x + 7, y, 1, 3, ol); R(ctx, x, y, 1, 1, ol); R(ctx, x + 6, y, 1, 1, ol);
      R(ctx, x, y + 3, 1, 1, ol); R(ctx, x + 6, y + 3, 1, 1, ol); R(ctx, x + 1, y + 4, 1, 1, ol); R(ctx, x + 5, y + 4, 1, 1, ol); R(ctx, x + 2, y + 5, 1, 1, ol); R(ctx, x + 4, y + 5, 1, 1, ol); R(ctx, x + 3, y + 6, 1, 1, ol);
      R(ctx, x + 1, y, 2, 1, c); R(ctx, x + 4, y, 2, 1, c); R(ctx, x, y + 1, 7, 2, c); R(ctx, x + 1, y + 3, 5, 1, c); R(ctx, x + 2, y + 4, 3, 1, c); R(ctx, x + 3, y + 5, 1, 1, c);
      if (name !== 'empty') { R(ctx, x + 4, y + 2, 2, 1, '#b01e30'); R(ctx, x + 3, y + 3, 3, 1, '#b01e30'); R(ctx, x + 3, y + 4, 2, 1, '#b01e30'); }
      if (name === 'half') { const e = '#3a2a3a'; R(ctx, x + 4, y, 2, 1, e); R(ctx, x + 4, y + 1, 3, 2, e); R(ctx, x + 4, y + 3, 2, 1, e); R(ctx, x + 4, y + 4, 1, 1, e); }
      if (name !== 'empty') { R(ctx, x + 1, y + 1, 1, 1, '#ffd0d8'); R(ctx, x + 2, y + 1, 1, 1, '#ff8090'); }
      break;
    }
    case 'heartc': drawIcon(ctx, 'heart', x, y); R(ctx, x - 1, y - 1, 1, 1, '#ffffff'); R(ctx, x + 7, y + 5, 1, 1, '#ffffff'); break;
    case 'heartPiece': R(ctx, x, y + 1, 3, 2, '#e8344a'); R(ctx, x + 1, y, 2, 1, '#e8344a'); R(ctx, x + 1, y + 3, 2, 1, '#e8344a'); R(ctx, x + 2, y + 4, 1, 1, '#e8344a'); R(ctx, x + 4, y + 1, 3, 2, '#5a2a3a'); R(ctx, x + 4, y, 2, 1, '#5a2a3a'); R(ctx, x + 4, y + 3, 2, 1, '#5a2a3a'); break;
    case 'coin': R(ctx, x + 1, y - 1, 4, 9, '#3a2a08'); R(ctx, x - 1, y + 1, 8, 5, '#3a2a08'); R(ctx, x, y, 6, 7, '#3a2a08'); R(ctx, x + 1, y, 4, 7, '#e0b030'); R(ctx, x, y + 1, 6, 5, '#e0b030'); R(ctx, x + 2, y + 1, 1, 4, '#fff0a0'); R(ctx, x + 4, y + 2, 1, 4, '#a07a10'); R(ctx, x + 1, y + 1, 1, 1, '#ffffff'); break;
    case 'coin5': R(ctx, x + 1, y, 4, 7, '#3aa0e0'); R(ctx, x, y + 1, 6, 5, '#3aa0e0'); R(ctx, x + 2, y + 1, 1, 4, '#c0f0ff'); R(ctx, x + 4, y + 2, 1, 4, '#1a6aa0'); break;
    case 'coin50': R(ctx, x, y, 7, 7, '#e0b030'); R(ctx, x + 1, y + 1, 5, 5, '#ffe08a'); R(ctx, x + 3, y + 2, 1, 3, '#a07818'); break;
    case 'coin20': R(ctx, x + 1, y, 4, 7, '#e05a5a'); R(ctx, x, y + 1, 6, 5, '#e05a5a'); R(ctx, x + 2, y + 1, 1, 4, '#ffc0c0'); break;
    case 'coins20': case 'coins50': case 'coins100': case 'coins200': case 'coins1000': drawIcon(ctx, 'coin', x - 2, y); drawIcon(ctx, 'coin', x + 3, y + 1); break;
    case 'keys': R(ctx, x, y, 4, 4, '#e0c060'); R(ctx, x + 1, y + 1, 2, 2, '#1d1d2b'); R(ctx, x + 3, y + 2, 4, 1, '#e0c060'); R(ctx, x + 5, y + 3, 1, 2, '#e0c060'); R(ctx, x + 6, y + 3, 1, 1, '#e0c060'); break;
    case 'bigKey': case 'masterKey': R(ctx, x - 1, y - 1, 6, 6, '#c0262d'); R(ctx, x, y, 4, 4, '#ff6060'); R(ctx, x + 1, y + 1, 2, 2, '#1d1d2b'); R(ctx, x + 4, y + 2, 5, 2, '#e0c060'); R(ctx, x + 6, y + 4, 1, 2, '#e0c060'); R(ctx, x + 8, y + 4, 1, 2, '#e0c060'); break;
    case 'bombs': R(ctx, x + 1, y + 2, 6, 6, '#2a2a3a'); R(ctx, x, y + 3, 8, 4, '#2a2a3a'); R(ctx, x + 2, y + 3, 2, 2, '#6a6a8a'); R(ctx, x + 4, y + 1, 2, 1, '#8a6a3a'); R(ctx, x + 6, y, 1, 1, '#ffb030'); break;
    case 'arrows': R(ctx, x, y + 7, 1, 1, '#ffffff'); for (let i = 0; i < 6; i++) R(ctx, x + 1 + i, y + 6 - i, 1, 1, '#c8a060'); R(ctx, x + 6, y, 2, 2, '#dfe7f5'); R(ctx, x, y + 5, 2, 1, '#e0e0e0'); R(ctx, x + 1, y + 6, 1, 2, '#e0e0e0'); break;
    case 'bow': R(ctx, x + 1, y, 2, 1, '#9a5a2a'); R(ctx, x + 3, y + 1, 2, 1, '#9a5a2a'); R(ctx, x + 5, y + 2, 1, 4, '#9a5a2a'); R(ctx, x + 3, y + 6, 2, 1, '#9a5a2a'); R(ctx, x + 1, y + 7, 2, 1, '#9a5a2a'); R(ctx, x + 1, y + 1, 1, 6, '#e8e8e8'); break;
    case 'potion': R(ctx, x + 2, y, 3, 2, '#c8a060'); R(ctx, x + 2, y + 2, 3, 1, '#c0c8e0'); R(ctx, x + 1, y + 3, 5, 5, '#c0c8e0'); R(ctx, x + 1, y + 4, 5, 4, '#e83a7a'); R(ctx, x + 2, y + 4, 1, 2, '#ffb0d0'); break;
    case 'elixir': R(ctx, x + 2, y, 3, 2, '#c8a060'); R(ctx, x + 2, y + 2, 3, 1, '#c0c8e0'); R(ctx, x + 1, y + 3, 5, 5, '#c0c8e0'); R(ctx, x + 1, y + 4, 5, 4, '#3a8ae8'); R(ctx, x + 2, y + 4, 1, 2, '#b0d8ff'); break;
    case 'lantern': R(ctx, x + 2, y, 3, 1, '#5a5a6a'); R(ctx, x + 1, y + 1, 5, 1, '#5a5a6a'); R(ctx, x + 1, y + 2, 5, 5, '#ffd040'); R(ctx, x + 1, y + 2, 1, 5, '#8a8a9a'); R(ctx, x + 5, y + 2, 1, 5, '#8a8a9a'); R(ctx, x + 1, y + 7, 5, 1, '#5a5a6a'); break;
    case 'sword': for (let i = 0; i < 6; i++) R(ctx, x + 2 + i, y + 5 - i, 1, 1, '#dfe7f5'); R(ctx, x + 1, y + 5, 3, 1, '#e0c060'); R(ctx, x + 2, y + 4, 1, 3, '#e0c060'); R(ctx, x, y + 7, 2, 1, '#6b4226'); break;
    case 'moonsword': for (let i = 0; i < 7; i++) R(ctx, x + 1 + i, y + 6 - i, 1, 1, '#9fe8ff'); R(ctx, x + 1, y + 5, 3, 1, '#ffd23a'); R(ctx, x + 2, y + 4, 1, 3, '#ffd23a'); R(ctx, x + 6, y, 2, 2, '#ffffff'); break;
    case 'glove': R(ctx, x + 1, y + 2, 6, 5, '#c8843a'); R(ctx, x + 1, y, 1, 3, '#c8843a'); R(ctx, x + 3, y, 1, 3, '#c8843a'); R(ctx, x + 5, y, 1, 3, '#c8843a'); R(ctx, x + 1, y + 6, 6, 2, '#8a5420'); break;
    case 'flippers': R(ctx, x, y + 3, 3, 5, '#3a8ae8'); R(ctx, x + 4, y + 3, 3, 5, '#3a8ae8'); R(ctx, x, y + 7, 3, 1, '#2a6ac0'); R(ctx, x + 4, y + 7, 3, 1, '#2a6ac0'); R(ctx, x + 1, y + 1, 1, 2, '#f2c28e'); R(ctx, x + 5, y + 1, 1, 2, '#f2c28e'); break;
    case 'firerod': R(ctx, x + 1, y + 3, 1, 5, '#8a5a2a'); for (let i = 0; i < 4; i++) R(ctx, x + 2 + i, y + 3 - i, 1, 1, '#8a5a2a'); R(ctx, x + 5, y, 3, 3, '#ff6a1e'); R(ctx, x + 6, y, 1, 1, '#ffe060'); break;
    case 'hammer': R(ctx, x + 3, y + 3, 1, 5, '#7a5230'); R(ctx, x, y, 7, 3, '#6a6a7a'); R(ctx, x, y, 7, 1, '#9a9aaa'); break;
    case 'map': R(ctx, x, y + 1, 8, 6, '#e8d8a8'); R(ctx, x + 2, y + 2, 2, 2, '#c03a3a'); R(ctx, x + 1, y + 5, 6, 1, '#8a7a5a'); R(ctx, x + 5, y + 2, 1, 3, '#8a7a5a'); break;
    case 'compass': R(ctx, x + 1, y, 6, 8, '#c9a03a'); R(ctx, x + 2, y + 1, 4, 6, '#e8e8f0'); R(ctx, x + 3, y + 2, 2, 2, '#c03a3a'); R(ctx, x + 3, y + 4, 2, 2, '#3a3a5a'); break;
    case 'nut': {   // noz que o Jerry acha: casca marrom arredondada com o risco do meio e um brilho
      R(ctx, x + 2, y, 4, 1, '#3a1e0e'); R(ctx, x + 1, y + 1, 6, 6, '#3a1e0e'); R(ctx, x + 2, y + 7, 4, 1, '#3a1e0e');
      R(ctx, x + 2, y + 1, 4, 6, '#b8783a'); R(ctx, x + 2, y + 2, 1, 4, '#d8a060'); R(ctx, x + 5, y + 2, 1, 4, '#8a5428');
      R(ctx, x + 4, y + 1, 1, 6, '#6a3a1a'); R(ctx, x + 3, y + 2, 1, 1, '#f0c890');
      break;
    }
    case 'moongem': {   // Cristal Lunar: cristal facetado azul-violeta, com contorno e brilho
      R(ctx, x + 2, y - 1, 4, 1, '#1d1430'); R(ctx, x + 1, y, 6, 1, '#1d1430'); R(ctx, x, y + 1, 8, 5, '#1d1430'); R(ctx, x + 1, y + 6, 6, 1, '#1d1430'); R(ctx, x + 2, y + 7, 4, 1, '#1d1430'); R(ctx, x + 3, y + 8, 2, 1, '#1d1430');
      R(ctx, x + 2, y, 4, 1, '#c8f6ff'); R(ctx, x + 1, y + 1, 6, 5, '#7ad8ff'); R(ctx, x + 4, y + 1, 3, 5, '#a58aff'); R(ctx, x + 2, y + 6, 4, 1, '#8a6ae0'); R(ctx, x + 3, y + 7, 2, 1, '#6a4ac8');
      R(ctx, x + 2, y + 1, 1, 3, '#ffffff'); R(ctx, x + 3, y + 1, 1, 1, '#e8fbff'); R(ctx, x + 4, y + 3, 1, 1, '#e0d6ff');
      break;
    }
    case 'shard': R(ctx, x + 2, y, 4, 8, '#9fe8ff'); R(ctx, x + 1, y + 2, 6, 4, '#9fe8ff'); R(ctx, x + 3, y + 1, 1, 5, '#ffffff'); break;
    case 'lacrAnchor': R(ctx, x + 3, y, 2, 2, '#d6a8ff'); R(ctx, x + 2, y + 1, 4, 2, '#9c6ee0'); R(ctx, x + 3, y + 3, 2, 3, '#d6a8ff'); R(ctx, x + 1, y + 5, 2, 2, '#9c6ee0'); R(ctx, x + 5, y + 5, 2, 2, '#9c6ee0'); R(ctx, x + 1, y + 7, 6, 1, '#e8d0ff'); break;
    case 'shell': case 'shell3': R(ctx, x + 1, y + 2, 6, 5, '#f4d8e8'); R(ctx, x + 2, y + 1, 4, 1, '#f4d8e8'); R(ctx, x + 2, y + 3, 1, 4, '#d8a8c8'); R(ctx, x + 4, y + 2, 1, 5, '#d8a8c8'); R(ctx, x + 3, y + 7, 2, 1, '#c890b0'); break;
    case 'ore': case 'ore3': case 'ore5': R(ctx, x + 1, y + 2, 6, 5, '#6a6a7a'); R(ctx, x + 2, y + 1, 4, 1, '#6a6a7a'); R(ctx, x + 2, y + 3, 2, 2, '#ff9a3a'); R(ctx, x + 5, y + 4, 1, 2, '#ffd23a'); break;
    case 'whistle': R(ctx, x + 1, y + 3, 6, 3, '#c8a060'); R(ctx, x, y + 4, 2, 1, '#8a6a3a'); R(ctx, x + 4, y + 2, 2, 1, '#1d1424'); R(ctx, x + 6, y + 3, 1, 3, '#e0c060'); R(ctx, x + 2, y + 6, 3, 2, '#a8433a'); break;
    case 'mp': R(ctx, x + 2, y, 3, 2, '#c8a060'); R(ctx, x + 1, y + 2, 5, 6, '#3a8ae8'); R(ctx, x + 3, y + 3, 1, 3, '#ffffff'); break;
    case 'frags': R(ctx, x, y, 7, 8, '#f0e6c8'); R(ctx, x, y, 7, 1, '#c8b88a'); R(ctx, x + 1, y + 2, 5, 1, '#8a7a5a'); R(ctx, x + 1, y + 4, 4, 1, '#8a7a5a'); R(ctx, x + 1, y + 6, 5, 1, '#8a7a5a'); break;
    case 'armor': R(ctx, x + 1, y + 1, 6, 6, '#8a92a8'); R(ctx, x, y + 1, 2, 3, '#8a92a8'); R(ctx, x + 6, y + 1, 2, 3, '#8a92a8'); R(ctx, x + 3, y + 1, 2, 2, '#5a6278'); break;
    case 'boomerang': R(ctx, x, y + 5, 3, 3, '#c8843a'); R(ctx, x + 1, y + 3, 3, 3, '#c8843a'); R(ctx, x + 3, y + 1, 3, 3, '#c8843a'); R(ctx, x + 5, y, 3, 2, '#c8843a'); R(ctx, x + 4, y + 3, 4, 2, '#c8843a'); R(ctx, x + 1, y + 6, 1, 1, '#e8b060'); R(ctx, x + 6, y, 1, 1, '#e8b060'); break;
    case 'boots': R(ctx, x + 1, y, 4, 5, '#3a8ac8'); R(ctx, x + 1, y + 5, 7, 3, '#3a8ac8'); R(ctx, x + 1, y + 7, 7, 1, '#1a4a7a'); R(ctx, x, y + 1, 1, 2, '#bfefff'); R(ctx, x + 2, y + 1, 2, 1, '#bfefff'); R(ctx, x + 6, y + 2, 2, 1, '#ffffff'); break;
    case 'mshield': R(ctx, x + 1, y, 6, 6, '#9ab0c8'); R(ctx, x + 2, y + 6, 4, 1, '#9ab0c8'); R(ctx, x + 3, y + 7, 2, 1, '#9ab0c8'); R(ctx, x + 2, y + 1, 4, 4, '#dff4ff'); R(ctx, x + 3, y + 2, 1, 2, '#ffffff'); R(ctx, x + 1, y, 6, 1, '#e0c060'); break;
    case 'blusa': // camiseta azul: ombros, mangas, gola em V e barra
      R(ctx, x + 1, y, 2, 1, '#2458a0'); R(ctx, x + 5, y, 2, 1, '#2458a0'); R(ctx, x, y + 1, 8, 1, '#2458a0');
      R(ctx, x + 1, y + 1, 2, 2, '#5a9aff'); R(ctx, x + 5, y + 1, 2, 2, '#5a9aff'); R(ctx, x + 3, y + 1, 2, 1, '#bfe4ff');
      R(ctx, x, y + 2, 2, 2, '#3976c8'); R(ctx, x + 6, y + 2, 2, 2, '#3976c8'); R(ctx, x + 2, y + 2, 4, 6, '#4b88dc');
      R(ctx, x + 3, y + 2, 2, 1, '#2458a0'); R(ctx, x + 2, y + 2, 1, 5, '#6aa6f0'); R(ctx, x + 5, y + 3, 1, 5, '#3470bc');
      R(ctx, x + 2, y + 7, 4, 1, '#2458a0'); R(ctx, x + 1, y + 4, 1, 1, '#2458a0'); R(ctx, x + 6, y + 4, 1, 1, '#2458a0'); break;
    case 'jaleco': R(ctx, x + 1, y + 2, 6, 6, '#8a9ab0'); R(ctx, x + 2, y + 1, 4, 7, '#f4f4fa'); R(ctx, x + 3, y + 1, 2, 3, '#d8d8e8'); R(ctx, x + 2, y + 5, 1, 2, '#c8a46a'); R(ctx, x + 5, y + 6, 1, 1, '#7a5a30'); break;
    case 'tridente': R(ctx, x + 3, y + 4, 2, 6, '#8a6a42'); R(ctx, x + 1, y + 1, 1, 4, '#9ae8ff'); R(ctx, x + 3, y, 2, 5, '#bff4ff'); R(ctx, x + 6, y + 1, 1, 4, '#9ae8ff'); R(ctx, x + 1, y + 4, 6, 1, '#7ad0e8'); R(ctx, x + 3, y + 10, 2, 1, '#5a4a2a'); R(ctx, x + 3, y, 2, 1, '#ffffff'); break;
    case 'dragon': R(ctx, x + 2, y + 1, 4, 1, '#3a1a10'); R(ctx, x + 1, y + 2, 6, 5, '#3a1a10'); R(ctx, x + 2, y + 7, 4, 1, '#3a1a10'); R(ctx, x + 2, y + 2, 4, 5, '#e8603a'); R(ctx, x + 3, y + 2, 2, 2, '#ffd23a'); R(ctx, x + 3, y + 5, 2, 1, '#a82a1a'); R(ctx, x + 2, y + 2, 1, 1, '#ffb090'); break;
    case 'ring': R(ctx, x + 2, y + 3, 4, 1, '#e0b030'); R(ctx, x + 1, y + 4, 1, 3, '#e0b030'); R(ctx, x + 6, y + 4, 1, 3, '#e0b030'); R(ctx, x + 2, y + 7, 4, 1, '#e0b030'); R(ctx, x + 3, y, 2, 3, '#e83a5a'); R(ctx, x + 3, y, 1, 1, '#ffb0c0'); break;
    case 'bottle': case 'fairy': R(ctx, x + 3, y, 2, 2, '#c8a060'); R(ctx, x + 2, y + 2, 4, 1, '#c0d8e8'); R(ctx, x + 1, y + 3, 6, 5, '#c0d8e8'); R(ctx, x + 2, y + 4, 4, 3, name === 'fairy' ? '#5ae0c8' : '#e8f4ff'); if (name === 'fairy') R(ctx, x + 3, y + 5, 2, 1, '#e8fff8'); break;
    case 'la': R(ctx, x + 1, y + 1, 6, 6, '#e85a8a'); R(ctx, x, y + 2, 8, 4, '#e85a8a'); R(ctx, x + 2, y + 2, 4, 1, '#ffa0c0'); R(ctx, x + 1, y + 4, 6, 1, '#b83a6a'); R(ctx, x + 6, y + 6, 2, 2, '#e85a8a'); break;
    case 'pena': for (let i = 0; i < 7; i++) R(ctx, x + i, y + 7 - i, 1, 1, '#6a4a2a'); R(ctx, x + 3, y + 1, 4, 3, '#e8e0d0'); R(ctx, x + 2, y + 2, 3, 3, '#c8b898'); R(ctx, x + 5, y, 2, 2, '#ffffff'); break;
    case 'lamparina': R(ctx, x + 1, y + 4, 6, 3, '#e0b030'); R(ctx, x + 2, y + 3, 4, 1, '#e0b030'); R(ctx, x + 6, y + 3, 2, 1, '#e0b030'); R(ctx, x + 3, y, 2, 3, '#ff8a1e'); R(ctx, x + 3, y + 1, 1, 1, '#ffe060'); break;
    case 'mapa': R(ctx, x, y + 1, 8, 6, '#e8d8a8'); R(ctx, x + 1, y + 2, 2, 1, '#8a6a3a'); R(ctx, x + 3, y + 3, 2, 1, '#8a6a3a'); R(ctx, x + 5, y + 4, 1, 1, '#e83a3a'); R(ctx, x, y + 1, 1, 6, '#c8b888'); break;
    case 'espelho': R(ctx, x + 2, y, 4, 2, '#bfefff'); R(ctx, x + 1, y + 2, 6, 3, '#9ad8f8'); R(ctx, x + 2, y + 5, 3, 2, '#bfefff'); R(ctx, x + 3, y + 1, 1, 3, '#ffffff'); break;
    default: break;
  }
}

// ---------------------------------------------------------------- peças dos quebra-cabeças
export function drawOrb(ctx, x, y, t, sw) {
  const [c, h] = sw ? ['#3a6ae0', '#9ac0ff'] : ['#d8384a', '#ff9aa8'];
  R(ctx, x + 2, y + 13, 12, 3, 'rgba(0,0,0,0.3)');
  R(ctx, x + 4, y + 11, 8, 4, '#6a6488'); R(ctx, x + 3, y + 13, 10, 2, '#4a4468');
  const b = Math.round(Math.sin(t * 3));
  R(ctx, x + 4, y + 2 + b, 8, 9, c); R(ctx, x + 3, y + 4 + b, 10, 5, c); R(ctx, x + 5, y + 3 + b, 3, 3, h); R(ctx, x + 5, y + 3 + b, 1, 1, '#ffffff');
}
export function drawPad(ctx, x, y, t, ice = false) {
  // plataforma de teletransporte: disco de pedra com anel de luz girando e runas nos quatro lados
  const [base, rim, glow, core, mark] = ice ? ['#3a2a14', '#8a6a34', '#d8ac45', '#fff3c4', '#eedc8a'] : ['#1a1430', '#4a3a7a', '#7a5ad8', '#e8dcff', '#b8a0ff'];
  R(ctx, x + 1, y + 2, 14, 12, base); R(ctx, x + 2, y + 1, 12, 14, base);
  R(ctx, x + 2, y + 2, 12, 12, rim); R(ctx, x + 3, y + 3, 10, 10, base); R(ctx, x + 2, y + 2, 12, 1, shadeHex(rim, 1.3));
  const a = 0.55 + Math.sin(t * 4) * 0.25;
  ctx.globalAlpha = a; R(ctx, x + 4, y + 4, 8, 8, glow); ctx.globalAlpha = Math.min(1, a + 0.2); R(ctx, x + 6, y + 6, 4, 4, core); ctx.globalAlpha = 1;
  for (let i = 0; i < 4; i++) { const an = t * 2 + i * Math.PI / 2; R(ctx, x + 7 + Math.round(Math.cos(an) * 5), y + 7 + Math.round(Math.sin(an) * 5), 2, 2, core); }
  R(ctx, x + 7, y, 2, 2, mark); R(ctx, x + 7, y + 14, 2, 2, mark); R(ctx, x, y + 7, 2, 2, mark); R(ctx, x + 14, y + 7, 2, 2, mark);
}
export function drawArrowDecal(ctx, x, y, dir) {
  ctx.save(); ctx.translate(x + 8, y + 8);
  ctx.rotate({ e: 0, s: Math.PI / 2, w: Math.PI, n: -Math.PI / 2 }[dir] || 0);
  ctx.globalAlpha = 0.65;
  R(ctx, -5, -1, 7, 3, '#e8e0ff'); R(ctx, 2, -4, 2, 9, '#e8e0ff'); R(ctx, 4, -2, 2, 5, '#e8e0ff');
  ctx.globalAlpha = 1; ctx.restore();
}
export function drawPips(ctx, x, y, n) {
  const w = n * 4 - 1;
  for (let i = 0; i < n; i++) { R(ctx, x + 8 - w / 2 + i * 4, y, 3, 3, '#3a2a10'); R(ctx, x + 8 - w / 2 + i * 4, y, 2, 2, '#ffd23a'); }
}

// ---------------------------------------------------------------- runas e magia
export const SPELL_COLORS = { spark: '#ffe85a', gale: '#bff0d0', lume: '#fff2b0', frost: '#9fe8ff', drain: '#e85a8a', aegis: '#9ab8ff', quake: '#c8a070', heal: '#7fe07f', blink: '#b48cff', orbs: '#ff8a1e', slow: '#d8c8ff', fury: '#ff5a4a' };
// Glifo de cada runa (8x8): traços simples, legíveis em 1x
const GLYPHS = {
  spark: [[4, 0, 1, 3], [3, 3, 3, 1], [3, 4, 1, 4], [2, 6, 1, 2]],
  gale: [[0, 1, 6, 1], [5, 0, 2, 1], [1, 4, 7, 1], [0, 7, 5, 1], [4, 6, 2, 1]],
  lume: [[3, 0, 2, 8], [0, 3, 8, 2], [1, 1, 1, 1], [6, 1, 1, 1], [1, 6, 1, 1], [6, 6, 1, 1]],
  frost: [[3, 0, 2, 8], [0, 3, 8, 2], [1, 1, 2, 2], [5, 5, 2, 2], [5, 1, 2, 2], [1, 5, 2, 2]],
  drain: [[2, 0, 4, 1], [1, 1, 2, 2], [1, 3, 1, 2], [1, 5, 2, 2], [2, 7, 4, 1], [5, 3, 2, 2]],
  aegis: [[1, 0, 6, 1], [0, 1, 1, 4], [7, 1, 1, 4], [1, 5, 2, 1], [5, 5, 2, 1], [3, 6, 2, 2], [3, 2, 2, 2]],
  quake: [[0, 6, 8, 2], [1, 3, 1, 3], [4, 1, 1, 5], [6, 4, 1, 2]],
  heal: [[3, 0, 2, 8], [0, 3, 8, 2]],
  blink: [[0, 0, 2, 2], [2, 2, 2, 2], [4, 4, 2, 2], [6, 6, 2, 2], [5, 0, 3, 1], [7, 0, 1, 3]],
  orbs: [[2, 0, 2, 2], [4, 1, 2, 2], [1, 3, 6, 3], [2, 6, 4, 2], [3, 4, 2, 1]],
  slow: [[1, 0, 6, 1], [1, 7, 6, 1], [2, 1, 4, 1], [3, 2, 2, 2], [2, 5, 4, 2]],
  fury: [[0, 0, 2, 2], [6, 0, 2, 2], [2, 2, 4, 1], [3, 3, 2, 3], [1, 6, 6, 2]],
};
export function drawSpellIcon(ctx, id, x, y, dim = false) {
  const c = dim ? '#5a5470' : SPELL_COLORS[id] || '#ffffff';
  for (const [a, b, w, h] of GLYPHS[id] || []) R(ctx, x + a, y + b, w, h, c);
}
export function drawAltar(ctx, x, y, t, active, learned, spell) {
  R(ctx, x, y + 13, 16, 3, 'rgba(0,0,0,0.3)');
  // base de pedra lavrada com degrau
  R(ctx, x, y + 8, 16, 8, '#2e2a42'); R(ctx, x + 1, y + 9, 14, 6, '#6a6488'); R(ctx, x + 1, y + 9, 14, 1, '#a8a2c4'); R(ctx, x + 1, y + 12, 14, 1, '#5a5478');
  R(ctx, x + 3, y + 14, 10, 2, '#4a4468'); for (let k = 3; k < 14; k += 5) R(ctx, x + k, y + 10, 1, 2, '#4a4468');
  // tabuleta
  R(ctx, x + 2, y, 12, 9, '#1e1a2e'); R(ctx, x + 3, y + 1, 10, 8, learned ? '#3a3450' : '#2a2440'); R(ctx, x + 3, y + 1, 10, 1, '#5a5478');
  if (!learned) {
    const glow = active ? 0.65 + Math.sin(t * 5) * 0.3 : 0.25;
    ctx.globalAlpha = glow; drawSpellIcon(ctx, spell, x + 4, y + 1, !active); ctx.globalAlpha = 1;
    if (active) { ctx.globalAlpha = 0.18 + 0.1 * Math.sin(t * 5); R(ctx, x + 1, y - 1, 14, 11, SPELL_COLORS[spell]); ctx.globalAlpha = 1; }
    if (active && Math.sin(t * 3) > 0.6) R(ctx, x + 7, y - 3 - Math.round((t * 8) % 4), 2, 2, SPELL_COLORS[spell]);
  }
}
export function drawRunestone(ctx, x, y, t, spell, learned) {
  R(ctx, x + 2, y + 13, 12, 3, 'rgba(0,0,0,0.3)');
  R(ctx, x + 2, y + 1, 12, 15, '#3a3448'); R(ctx, x + 3, y, 10, 1, '#3a3448');
  R(ctx, x + 3, y + 1, 10, 14, '#7a7488'); R(ctx, x + 3, y + 1, 3, 14, '#9a94a8'); R(ctx, x + 11, y + 2, 2, 13, '#5a5468'); R(ctx, x + 4, y + 1, 6, 1, '#b4aec4');
  R(ctx, x + 4, y + 3, 8, 10, '#6a6478');   // face rebaixada
  R(ctx, x + 2, y + 12, 3, 4, '#4f7a3a'); R(ctx, x + 10, y + 13, 3, 3, '#4f7a3a'); R(ctx, x + 3, y + 11, 1, 1, '#6aa04a');
  ctx.globalAlpha = learned ? 0.5 : 0.55 + Math.sin(t * 2) * 0.25;
  drawSpellIcon(ctx, spell, x + 4, y + 4); ctx.globalAlpha = 1;
}
export function drawLamp(ctx, x, y, t, on) {
  R(ctx, x + 2, y + 13, 12, 3, 'rgba(0,0,0,0.3)');
  R(ctx, x + 3, y + 11, 10, 4, '#4a4468'); R(ctx, x + 3, y + 11, 10, 1, '#6a6488');
  const [c, h] = on ? ['#7af0ff', '#ffffff'] : ['#2a3450', '#4a5a7a'];
  R(ctx, x + 5, y + 1, 6, 10, c); R(ctx, x + 4, y + 4, 8, 5, c); R(ctx, x + 6, y + 2, 2, 5, h);
  if (on && Math.sin(t * 4 + x) > 0.5) R(ctx, x + 10, y, 1, 1, '#ffffff');
}
const GROUP_COL = ['#ff5a6a', '#5a8aff', '#7fd37f', '#ffd23a', '#d87aff', '#ff9a3a'];
export function drawMirror(ctx, x, y, state, group, linked) {
  // espelho giratório: base de pedra com eixo e moldura de latão em volta do vidro inclinado
  R(ctx, x + 1, y + 12, 14, 4, '#2a2436'); R(ctx, x + 2, y + 12, 12, 3, '#5a5468'); R(ctx, x + 2, y + 12, 12, 1, '#8a84a0');
  for (let i = 0; i < 12; i++) {
    const px = state ? x + 2 + i : x + 13 - i, py = y + 1 + i;
    R(ctx, px - 1, py, 4, 1, '#8a6a1a'); R(ctx, px, py, 2, 1, '#dff4ff'); R(ctx, px + (state ? 1 : 0), py, 1, 1, '#ffffff');
  }
  R(ctx, x + 7, y + 6, 2, 7, '#5a5468');
  if (linked) { R(ctx, x + 6, y + 13, 4, 3, '#1d1424'); R(ctx, x + 7, y + 13, 2, 2, GROUP_COL[group % GROUP_COL.length]); }
}
export function drawPrism(ctx, x, y, t, lit) {
  R(ctx, x + 2, y + 13, 12, 3, 'rgba(0,0,0,0.3)');
  const c = lit ? '#ffe08a' : '#8a7ac8';
  R(ctx, x + 7, y + 1, 2, 2, c); R(ctx, x + 5, y + 3, 6, 4, c); R(ctx, x + 3, y + 7, 10, 5, c); R(ctx, x + 6, y + 4, 1, 6, '#ffffff');
  R(ctx, x + 3, y + 12, 10, 2, '#4a4468');
  if (lit && Math.sin(t * 6) > 0) R(ctx, x + 12, y + 2, 1, 1, '#ffffff');
}
export function drawBeamTarget(ctx, x, y, t, hit) {
  R(ctx, x + 2, y + 13, 12, 3, 'rgba(0,0,0,0.3)');
  R(ctx, x + 1, y + 1, 14, 14, '#1a1426'); R(ctx, x + 2, y + 2, 12, 12, '#4a4058'); R(ctx, x + 2, y + 2, 12, 1, '#7a7090');
  R(ctx, x + 3, y + 3, 10, 10, hit ? '#ffe08a' : '#5a3a6a'); R(ctx, x + 5, y + 5, 6, 6, hit ? '#ffffff' : '#8a5aa8'); R(ctx, x + 7, y + 7, 2, 2, hit ? '#ffe08a' : '#2a2440');
  if (hit) { ctx.globalAlpha = 0.3 + 0.2 * Math.sin(t * 8); R(ctx, x, y, 16, 16, '#ffe08a'); ctx.globalAlpha = 1; }
}
export function drawEmitter(ctx, x, y, t, d) {
  R(ctx, x + 1, y + 1, 14, 14, '#1a1426'); R(ctx, x + 2, y + 2, 12, 12, '#4a4058'); R(ctx, x + 2, y + 2, 12, 1, '#7a7090');
  for (const [cx, cy] of [[3, 3], [11, 3], [3, 11], [11, 11]]) R(ctx, x + cx, y + cy, 2, 2, '#8a84a0');
  R(ctx, x + 4, y + 4, 8, 8, '#c9a03a'); R(ctx, x + 5, y + 5, 6, 6, '#ffe08a');
  ctx.globalAlpha = 0.6 + Math.sin(t * 8) * 0.3; R(ctx, x + 6, y + 6, 4, 4, '#ffffff'); ctx.globalAlpha = 1;
  void d;
}
export function drawGlyph(ctx, x, y, i, lit) {
  const cols = [['#e8344a', '#ff9aa8'], ['#3a6ae0', '#9ac0ff'], ['#3aa04a', '#9ae0a0'], ['#e0b030', '#fff0a0']][i];
  R(ctx, x + 1, y + 1, 14, 14, '#1d1424');
  R(ctx, x + 2, y + 2, 12, 12, lit ? cols[1] : cols[0]); R(ctx, x + 2, y + 2, 12, 1, lit ? '#ffffff' : shadeHex(cols[0], 1.3)); R(ctx, x + 2, y + 13, 12, 1, shadeHex(cols[0], 0.6));
  ctx.globalAlpha = lit ? 1 : 0.55;
  R(ctx, x + 7, y + 3, 2, 10, '#1d1424'); R(ctx, x + 4, y + 6, 8, 2, '#1d1424'); R(ctx, x + 5, y + 11, 6, 1, '#1d1424');
  ctx.globalAlpha = 1;
  if (lit) { ctx.globalAlpha = 0.25; R(ctx, x, y, 16, 16, cols[1]); ctx.globalAlpha = 1; }
}
export function drawObelisk(ctx, x, y, t, color) {
  R(ctx, x + 2, y + 13, 12, 3, 'rgba(0,0,0,0.3)');
  R(ctx, x + 4, y - 8, 8, 22, '#5a5468'); R(ctx, x + 5, y - 10, 6, 2, '#5a5468'); R(ctx, x + 6, y - 11, 4, 1, '#5a5468');
  R(ctx, x + 4, y - 8, 2, 22, '#7a7488'); R(ctx, x + 3, y + 12, 10, 3, '#4a4458');
  R(ctx, x + 6, y - 4, 4, 6, color || '#2a2440');
  if (color) { ctx.globalAlpha = 0.4; R(ctx, x + 2, y - 8, 12, 14, color); ctx.globalAlpha = 1; }
}
export function drawUrn(ctx, x, y, n, open) {
  R(ctx, x + 2, y + 13, 12, 3, 'rgba(0,0,0,0.3)');
  R(ctx, x + 4, y + 3, 8, 11, '#8a6a4a'); R(ctx, x + 3, y + 6, 10, 6, '#8a6a4a'); R(ctx, x + 5, y + 1, 6, 2, open ? '#1d1424' : '#a8885a');
  R(ctx, x + 4, y + 4, 2, 6, '#a8885a'); R(ctx, x + 5, y + 13, 6, 1, '#5a4430');
  // número da urna em pontinhos
  for (let i = 0; i < n; i++) R(ctx, x + 8 - n + i * 2, y + 8, 1, 2, '#ffe08a');
}

// ---------------------------------------------------------------- Hermes, o cavalo
// Pixel art desenhada à mão: baio com crina negra, meias brancas, sela vermelha com
// detalhes dourados, manta azul e rédea de couro. Os sprites são montados uma vez e guardados.
const HP = {
  K: '#24140e', D: '#6a3a1a', B: '#a05e2a', L: '#c98345', H: '#e8b070', M: '#1c1218', m: '#4a3646', n: '#6e5468',
  W: '#f6f0e4', w: '#cfc6b6', E: '#0e0808', N: '#7a4a3c', S: '#b8343a', s: '#7a1e26', G: '#f0cc5a', g: '#b08a2a',
  C: '#3a5ab0', c: '#24387a', R: '#3a2214', O: '#2c2428',
};
const HORSE_SIDE = [
  '........................K..K....',
  '.......................KLKKLK...',
  '......................MKBBBBK...',
  '.....................MMKBHBBBK..',
  '....................MnmKBBBBBBK.',
  '...................MMmKBBEWBBBBK',
  '...................MmKBBBEEBBBBK',
  '..................MMmKBRRRRRGBLK',
  '..................MmKBBBBDBBBLLK',
  '.................MnmKBBBBKKBLNNK',
  '.................MmKBBBBK..KNNNK',
  '..........KKKKKKMmKBBBBBK...KKK.',
  '...KKK...KsSSSSSKmKBBBBBBK......',
  '..KmMMK.KLsSGGGSSKBBBBBBBK......',
  '.KmMnMMKLHLsSSSsCKLBBBBBBK......',
  '.KMMmMKKBLHcCCCCCKDBBBBBBK......',
  'KMMmMK.KBBLcCGGCcKDBBBBBDK......',
  'KMnMK..KBBBBcccKKDDBBBBDK.......',
  'KMmMK..KDBBBBBBBBBBBBBBDK.......',
  'KMMK...KDDBBBBBBBBBBBBDDK.......',
  '.KMK....KDDDBBBBBBBBDDDK........',
  '..K......KKDDK....KDDKK.........',
];
const HORSE_DOWN = [
  '..................',
  '......KKKKKK......',
  '....KKBHBBBBKK....',
  '...KBLLBBBBBBDK...',
  '..KBLBBBBBBBBDDK..',
  '..KBSSSSSSSSSSDK..',
  '..KsSGGGGGGGGSsK..',
  '..KCSSSSSSSSSSCK..',
  '..KCCsSSSSSSsCCK..',
  '..KBCCcCCCCcCCDK..',
  '..KBBBBMMMMBBBDK..',
  '...KBBBMnmMBBDK...',
  '....KKBBMMBBKK....',
  '....KLK....KLK....',
  '....KBKKKKKKBK....',
  '...KBBMMnMMMBBK...',
  '...KBLBMmMMBBDK...',
  '..KBEWBBMMBBEWBK..',
  '..KBEEBBBBBBEEBK..',
  '..KRRBBBWWBBBRRK..',
  '...KBGLBWWBBGBK...',
  '...KBLBBWWBBBDK...',
  '....KBLNNNNLDK....',
  '....KNNKNNKNNK....',
  '.....KKKKKKKK.....',
];
const HORSE_UP = [
  '.....KLK..KLK.....',
  '.....KBKKKKBK.....',
  '.....KBMMnMBK.....',
  '......KBMMBK......',
  '......KBmMBK......',
  '.....KBBMMBBK.....',
  '....KBBBMnBBBK....',
  '...KBLBBBBBBBDK...',
  '..KBSSSSSSSSSSDK..',
  '..KsSGGGGGGGGSsK..',
  '..KCSSSSSSSSSSCK..',
  '..KCCsSSSSSSsCCK..',
  '..KBCCcCCCCcCCDK..',
  '..KLBBBBBBBBBBDK..',
  '..KLHBBBBBBBBDDK..',
  '..KLBBBBMMBBBDDK..',
  '..KBBBBMMnMBBDDK..',
  '..KDBBBMMmMBBDDK..',
  '...KDBKMmMMKBDK...',
  '...KDDKMMnMKDDK...',
  '....KK.KMMK.KK....',
  '.......KMmK.......',
  '........KK........',
];
const horseCache = new Map();
function horseArt(rows) {
  if (horseCache.has(rows)) return horseCache.get(rows);
  const cv = document.createElement('canvas'); cv.width = rows[0].length; cv.height = rows.length;
  const c = cv.getContext('2d');
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (HP[ch]) { c.fillStyle = HP[ch]; c.fillRect(x, y, 1, 1); } }));
  horseCache.set(rows, cv);
  return cv;
}
// uma perna: contorno escuro, pelo, meia branca e casco; lift > 0 dobra o joelho para frente
function horseLeg(ctx, x, top, len, lift, fur, sock) {
  const bottom = top + len - lift;
  for (let y = top; y <= bottom; y++) {
    const dx = lift && y > top + 2 ? 1 : 0;
    const isHoof = y === bottom, isSock = sock && y >= bottom - 2 && !isHoof;
    R(ctx, x - 1 + dx, y, 4, 1, HP.K);
    R(ctx, x + dx, y, 2, 1, isHoof ? HP.O : isSock ? HP.W : fur);
    if (isSock) R(ctx, x + 1 + dx, y, 1, 1, HP.w);
  }
}
// Arte do Hermes de astronauta: o corpo inteiro (tronco, pescoço e patas) vira traje branco com manta laranja e botas cinzas; só a cabeça fica à mostra.
const HPS = { ...HP, a: '#eef1f8', f: '#ffffff', b: '#cfd6e6', d: '#9aa4bc', t: '#6e788f', o: '#ff8a2a', p: '#c0601a', y: '#ffe9a8', u: '#6a8ad8', q: '#3f5aa0' };
const SUIT_MAP = { B: 'a', L: 'f', H: 'f', D: 'd', N: 'b', S: 'o', s: 'p', G: 'y', g: 'y', C: 'u', c: 'q', O: 't', R: 't' };
const suitCache = new Map();
function horseSuitArt(rows, from, to = rows.length) {
  const key = rows[0] + rows.length + ':' + from + ':' + to;
  if (suitCache.has(key)) return suitCache.get(key);
  const cv = document.createElement('canvas'); cv.width = rows[0].length; cv.height = rows.length;
  const c = cv.getContext('2d');
  rows.forEach((r, y) => [...r].forEach((ch, x) => {
    const m = y >= from && y < to && SUIT_MAP[ch] ? SUIT_MAP[ch] : ch;
    if (HPS[m]) { c.fillStyle = HPS[m]; c.fillRect(x, y, 1, 1); }
  }));
  suitCache.set(key, cv);
  return cv;
}
// Hermes de astronauta (na Lua): capacete de vidro em volta da cabeça, manta branca com faixa laranja na sela e tanque de oxigênio nas costas.
function drawHorseSuit(ctx, cx, cy, dir) {
  ctx.save();
  const bubble = (hx, hy) => {
    ctx.fillStyle = 'rgba(190,235,255,0.30)'; ctx.beginPath(); ctx.arc(hx, hy, 8, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(245,250,255,0.95)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(hx, hy, 7.5, 0, 7); ctx.stroke();
    R(ctx, hx - 5, hy - 5, 2, 1, '#ffffff'); R(ctx, hx - 6, hy - 4, 1, 2, '#ffffff');
    R(ctx, hx - 4, hy + 6, 8, 1, '#d0d6e6');   // gola do capacete
  };
  if (dir === 2 || dir === 3) {
    const f = dir === 2 ? -1 : 1;
    const tx = f > 0 ? cx - 13 : cx + 10;
    R(ctx, tx, cy - 24, 4, 9, '#d0d6e6'); R(ctx, tx, cy - 24, 4, 1, '#ff8a2a'); R(ctx, tx + 1, cy - 22, 1, 5, '#9aa4bc');   // tanque de oxigênio
    R(ctx, f > 0 ? cx - 10 : cx + 9, cy - 17, 2, 3, '#9aa4bc');                                                          // mangueira
    bubble(cx + f * 10, cy - 22);
  } else if (dir === 1) {
    R(ctx, cx - 5, cy - 20, 10, 9, '#d0d6e6'); R(ctx, cx - 5, cy - 20, 10, 1, '#ff8a2a'); R(ctx, cx - 1, cy - 19, 2, 7, '#9aa4bc');   // tanque visto de trás
    bubble(cx, cy - 24);
  } else {
    bubble(cx, cy - 9);
  }
  ctx.restore();
}
export function drawHorse(ctx, cx, cy, dir, frame, part = 'all', suit = false) {
  if (part === 'head') return;
  const k = ((frame % 4) + 4) % 4, la = [0, 1, 2, 1][k], lb = [2, 1, 0, 1][k];
  ctx.save();
  ctx.globalAlpha = 0.28; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(cx, cy, dir >= 2 ? 13 : 8, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  if (dir === 2 || dir === 3) {
    ctx.translate(cx, cy); if (dir === 2) ctx.scale(-1, 1);
    const ox = -15, oy = -28;
    // pernas de trás do lado de lá ficam mais escuras
    horseLeg(ctx, ox + 11, oy + 21, 6, lb, suit ? HPS.d : HP.D, false);
    horseLeg(ctx, ox + 19, oy + 21, 6, la, suit ? HPS.d : HP.D, true);
    ctx.drawImage(suit ? horseSuitArt(HORSE_SIDE, 11) : horseArt(HORSE_SIDE), ox, oy);
    horseLeg(ctx, ox + 8, oy + 21, 6, la, suit ? HPS.a : HP.B, true);
    horseLeg(ctx, ox + 22, oy + 21, 6, lb, suit ? HPS.a : HP.B, true);
  } else {
    const art = horseArt(dir === 1 ? HORSE_UP : HORSE_DOWN), ox = cx - 9, oy = cy - 27;
    if (dir === 1) { horseLeg(ctx, ox + 4, oy + 19, 7, la, suit ? HPS.d : HP.D, false); horseLeg(ctx, ox + 12, oy + 19, 7, lb, suit ? HPS.d : HP.D, false); }
    else { horseLeg(ctx, ox + 4, oy + 18, 9, la, suit ? HPS.a : HP.B, true); horseLeg(ctx, ox + 12, oy + 18, 9, lb, suit ? HPS.a : HP.B, true); }
    ctx.drawImage(suit ? horseSuitArt(dir === 1 ? HORSE_UP : HORSE_DOWN, dir === 1 ? 5 : 1, dir === 1 ? 99 : 13) : art, ox, oy);
  }
  ctx.restore();
  if (suit) drawHorseSuit(ctx, cx, cy, dir);
}
// Ray, a arraia-manta voadora de Lacrímora: grande e majestosa, vista de cima, com as asas batendo, dorso de luz prismática e cauda longa.
// A arte é desenhada de frente para +x e girada conforme `dir` (0 baixo, 1 cima, 2 esquerda, 3 direita).
const RAY_N = 6, RAY_CX = 44, RAY_CY = 27;
const rayCache = new Map();
function rayArt(phase) {
  if (rayCache.has(phase)) return rayCache.get(phase);
  const W = 66, H = 54, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d'), f = Math.sin(phase / RAY_N * Math.PI * 2), HALF = 23;
  const cells = new Map();   // "x,y" -> { d: distância à borda, ... }
  // asas largas em crescente (como uma manta de verdade): bordo de ataque quase reto que recua só nas pontas, bordo de fuga côncavo, cabeça arredondada na frente
  const lead = (ay) => Math.max(12 - 25 * Math.pow(Math.min(1, ay / HALF), 1.4), ay <= 6 ? 15 - 0.22 * ay * ay : -99);
  const trail = (ay) => (ay <= 3 ? -14 : -13.5 + 5.5 * Math.sin(Math.min(1, ay / HALF) * Math.PI));
  for (let py = -HALF - 2; py <= HALF + 2; py++) for (let px = -16; px <= 20; px++) {
    // bater de asas: as pontas sobem/descem (encurtam a envergadura e recuam um pouco)
    const k = 1 - 0.13 * Math.abs(f), ay0 = Math.abs(py) / k, ty = ay0 / HALF, sx = px - Math.round(f * ty * ty * 3.2);
    if (ay0 > HALF) continue;
    if (sx <= lead(ay0) && sx >= trail(ay0)) cells.set(px + ',' + py, { ay: ay0, sx });
  }
  // cabeça: dois "chifres" (aletas cefálicas) curvos para a frente
  for (const sgn of [-1, 1]) for (let i = 0; i < 6; i++) cells.set((17 + i) + ',' + (sgn * (5 - Math.floor(i * 0.6))), { ay: 5, sx: 17 + i, horn: 1 });
  // cauda: longa, fina, ondulando
  for (let i = 0; i <= 30; i++) { const px = -14 - i, py = Math.round(Math.sin(phase / RAY_N * Math.PI * 2 + i * 0.28) * (1 + i * 0.07)); cells.set(px + ',' + py, { ay: 0, sx: px, tail: i }); if (i < 9) cells.set(px + ',' + (py + 1), { ay: 1, sx: px, tail: i }); }
  const has = (x, y) => cells.has(x + ',' + y);
  const paint = (px, py, col) => { c.fillStyle = col; c.fillRect(RAY_CX + px, RAY_CY + py, 1, 1); };
  for (const [k, cell] of cells) {
    const [px, py] = k.split(',').map(Number);
    const edge = ![[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]) => has(px + dx, py + dy));
    if (cell.tail !== undefined) { paint(px, py, edge || cell.tail > 26 ? '#1b2f55' : cell.tail % 4 === 0 ? '#bff2ff' : '#5a8fd0'); continue; }
    if (cell.horn) { paint(px, py, edge ? '#16294a' : '#6fb4e8'); continue; }
    if (edge) { paint(px, py, '#122344'); continue; }
    const t = cell.ay / HALF;   // 0 no meio do corpo, 1 na ponta da asa
    let col = t < 0.18 ? '#bff2ff' : t < 0.35 ? '#7fd0f0' : t < 0.6 ? '#4a9ad8' : t < 0.82 ? '#2f74bd' : '#24539a';
    // costelas de luz nas asas (listras que se afastam do corpo)
    if (t > 0.2 && t < 0.92 && (Math.round(cell.sx * 0.9 + Math.abs(py) * 0.55) % 6 === 0)) col = t < 0.6 ? '#9ee0ff' : '#5aa6e6';
    // pintas claras no dorso
    if ((px * 7 + py * 13 + 100) % 17 === 0 && t > 0.2) col = '#dff6ff';
    paint(px, py, col);
  }
  // sombra suave nas bordas da frente (volume)
  for (const [k, cell] of cells) { const [px, py] = k.split(',').map(Number); if (cell.tail !== undefined || cell.horn) continue; if (!has(px - 1, py) && has(px + 1, py)) paint(px + 1, py, '#1b3f77'); }
  // brilho prismático na borda de trás das asas (cores diferentes por fase)
  const gem = ['#ff7ad9', '#7af0ff', '#ffe27a', '#b48cff', '#7affb0', '#ff9a7a'];
  for (const [k, cell] of cells) {
    const [px, py] = k.split(',').map(Number);
    if (cell.tail !== undefined || cell.horn || cell.ay < 8 || has(px - 1, py)) continue;
    if ((Math.abs(py) + phase) % 4 === 0) paint(px, py, gem[(Math.abs(py) + phase) % gem.length]);
  }
  // cabeça: olhos e coroa de cristal no dorso
  for (const sgn of [-1, 1]) { paint(11, sgn * 6, '#ffffff'); paint(12, sgn * 6, '#16294a'); paint(11, sgn * 7, '#16294a'); }
  paint(6, 0, '#ffffff'); paint(5, 0, '#ffe27a'); paint(7, 0, '#ffe27a'); paint(6, -1, '#9ee0ff'); paint(6, 1, '#9ee0ff');   // joia da testa/dorso
  rayCache.set(phase, cv);
  return cv;
}
export function drawRay(ctx, cx, cy, dir, frame, t = 0) {
  const bob = Math.round(Math.sin(t * 4) * 1.5), ph = ((frame % RAY_N) + RAY_N) % RAY_N, ang = [Math.PI / 2, -Math.PI / 2, Math.PI, 0][dir] || 0;
  ctx.save();
  ctx.globalAlpha = 0.3; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(cx, cy + 5, 20, 4.5, 0, 0, Math.PI * 2); ctx.fill();
  // aura prismática suave sob as asas
  ctx.globalAlpha = 0.16; ctx.fillStyle = '#7af0ff'; ctx.beginPath(); ctx.ellipse(cx, cy - 6 + bob, 21, 15, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  ctx.translate(cx, cy - 9 + bob); ctx.rotate(ang);
  ctx.drawImage(rayArt(ph), -RAY_CX, -RAY_CY);
  ctx.restore();
}
export function drawRider(ctx, x, y, dir, frame, opts = {}) {
  if (opts.ray) {   // montado na Ray: ela voa baixo e o herói fica sentado nas costas dela
    // parada, a Ray continua pairando e batendo as asas devagar
    const tt = opts.t ?? frame * 0.25, fr = opts.moving === false ? Math.floor(tt * 3) : frame;
    const cx = x + 8, cy = y + 18, bob = Math.round(Math.sin(tt * 4) * 1.5), mid = cy - 9 + bob;   // `mid` = centro do corpo da Ray (o herói senta ali)
    drawRay(ctx, cx, cy, dir, fr, tt);
    const hx = dir === 3 ? x - 1 : dir === 2 ? x + 1 : x, hy = mid - 11;
    drawHeroSprite(ctx, hx, hy, dir, 0, opts.armor || 0, 12, opts.variant || 0, opts.dive ? 'dive' : false);
    if (opts.dive) drawDiveGear(ctx, hx, hy, dir);
    // crista de luz do dorso da Ray cobrindo a cintura do herói: ele fica "dentro" da sela de luz, sem flutuar
    const fwd = dir === 2 || dir === 3;
    // sela de luz na cintura (deitada, na largura do corpo): o herói senta nela
    ctx.save(); ctx.globalAlpha = 0.9; ctx.fillStyle = '#bff2ff';
    ctx.fillRect(hx + (fwd ? 3 : 2), hy + 10, fwd ? 10 : 12, 2);
    ctx.fillStyle = '#7fd0f0'; ctx.fillRect(hx + (fwd ? 4 : 3), hy + 12, fwd ? 8 : 10, 1);
    ctx.restore();
    if (opts.crown) { R(ctx, hx + 5, hy - 7, 6, 2, '#ffd23a'); R(ctx, hx + 7, hy - 9, 2, 2, '#ffd23a'); }
    return;
  }
  // herói montado: a metade de cima dele aparece sentada na sela
  const cx = x + 8, cy = y + 16;
  drawHorse(ctx, cx, cy, dir, frame, 'all', !!opts.suit);
  const hx = dir === 3 ? x - 2 : dir === 2 ? x + 2 : x, hy = cy - (dir === 0 ? 30 : dir === 1 ? 28 : 26);
  drawHeroSprite(ctx, hx, hy, dir, 0, opts.armor || 0, 12, opts.variant || 0, opts.suit ? 'space' : opts.dive ? 'dive' : false);
  if (opts.suit) drawHelmet(ctx, hx, hy, 16);   // capacete na Lua
  if (opts.crown) { R(ctx, hx + 5, hy - 7, 6, 2, '#ffd23a'); R(ctx, hx + 7, hy - 9, 2, 2, '#ffd23a'); }
}

// Sapinho pacífico do Pântano
const FROG_COLS = [['#4aa84a', '#7ad86a', '#2a6a3a'], ['#5ab0a0', '#8ae0cc', '#2a7a6a'], ['#9ab04a', '#c8dc6a', '#5a7a2a']];
export function drawCritterFrog(ctx, f, oy, t) {
  const c = FROG_COLS[f.hue % 3], x = Math.round(f.x) - 4, z = Math.round(f.z), y = Math.round(f.y) - 5 + oy - z;
  R(ctx, x + 1, Math.round(f.y) + oy + 1, 7, 2, 'rgba(0,0,0,0.3)');
  const up = f.hop > 0;
  // pernas de trás: dobradas parado, esticadas no pulo
  if (up) { R(ctx, x - 1 + (f.dir > 0 ? 0 : 1), y + 4, 3, 2, c[2]); R(ctx, x + 6 - (f.dir > 0 ? 0 : 1), y + 4, 3, 2, c[2]); }
  else { R(ctx, x, y + 4, 3, 2, c[2]); R(ctx, x + 6, y + 4, 3, 2, c[2]); }
  R(ctx, x + 1, y + 1, 7, 5, c[0]); R(ctx, x + 2, y + 1, 5, 1, c[1]); R(ctx, x + 2, y + 5, 5, 1, c[2]);
  // olhos saltados, que piscam de vez em quando
  R(ctx, x + 1, y - 1, 2, 2, c[1]); R(ctx, x + 6, y - 1, 2, 2, c[1]);
  if (f.blink > 0) { R(ctx, x + 1, y, 2, 1, '#1d1424'); R(ctx, x + 6, y, 2, 1, '#1d1424'); } else { R(ctx, x + 2 - (f.dir < 0 ? 1 : 0), y - 1, 1, 1, '#1d1424'); R(ctx, x + 7 - (f.dir < 0 ? 1 : 0), y - 1, 1, 1, '#1d1424'); }
  // barriguinha clara
  R(ctx, x + 3, y + 4, 3, 1, '#e8f4b8');
}

export function drawLacrTower(ctx, x, y, t) {
  // Torre das Treze Vozes (Richard), 96 × 112: base larga de pedra com degraus e porta em arco, corpo redondo
  // com sombra de cilindro, janelas em arco que brilham subindo em espiral, anel de sacada, telhado cônico de
  // ardósia roxa e um cristal no alto. A porta fica no meio da base (x 48–64), como antes.
  const P = (px, py, w, h, c) => R(ctx, x + px, y + py, w, h, c), A = ctx.globalAlpha;
  const glow = (k) => 0.55 + 0.45 * Math.sin(t * 2 + k);
  ctx.globalAlpha = 0.3 * A; P(0, 106, 96, 8, '#120e1e'); ctx.globalAlpha = A;
  // corpo redondo: fiadas de pedra com luz à esquerda e sombra à direita
  const tones = ['#8a78a6', '#76648f', '#64547c', '#55466c', '#47395c', '#3a2e4c'];
  for (let yy = 24; yy < 82; yy++) {
    const half = 21 + Math.round((yy - 24) / 58 * 4), L = 48 - half, W = half * 2, course = Math.floor((yy - 24) / 6);
    for (let k = 0; k < W; k++) { const f = k / W, tone = f < 0.12 ? 0 : f < 0.3 ? 1 : f < 0.62 ? 2 : f < 0.8 ? 3 : f < 0.93 ? 4 : 5; P(L + k, yy, 1, 1, tones[tone]); }
    if ((yy - 24) % 6 === 0) P(L, yy, W, 1, '#2e2440');
    else for (let b = 0; b < 4; b++) { const bx = L + ((b * 13 + course * 6) % W); P(bx, yy, 1, 1, '#2e2440'); }
    P(L - 1, yy, 1, 1, '#1c1528'); P(L + W, yy, 1, 1, '#1c1528');
  }
  // janelas em arco subindo em espiral, com brilho violeta
  for (const [wx, wy, k] of [[34, 60, 0], [52, 46, 1.3], [38, 32, 2.6]]) {
    P(wx - 1, wy - 1, 10, 15, '#2e2440'); P(wx, wy + 2, 8, 12, '#1a1428'); P(wx + 1, wy, 6, 2, '#1a1428');
    ctx.globalAlpha = A * glow(k); P(wx + 1, wy + 3, 6, 10, '#cb8dfa'); P(wx + 2, wy + 1, 4, 2, '#cb8dfa'); ctx.globalAlpha = A;
    P(wx + 1, wy + 3, 2, 6, '#efd6ff'); P(wx + 4, wy + 3, 1, 10, '#2e2440'); P(wx + 1, wy + 8, 6, 1, '#2e2440'); P(wx - 1, wy + 13, 10, 2, '#9a86b4');
  }
  // anel de sacada perto do topo, com grade
  P(22, 26, 52, 4, '#2e2440'); P(22, 26, 52, 1, '#a894c4'); P(24, 30, 48, 1, '#1c1528');
  P(22, 21, 52, 1, '#2e2440'); for (let px = 22; px <= 73; px += 4) P(px, 21, 1, 5, '#3a2e4c');
  // telhado cônico de ardósia roxa, com fileiras de telhas, e a ponta
  for (let yy = -10; yy < 22; yy++) {
    const half = Math.max(1, Math.round((yy + 10) / 32 * 30)), L = 48 - half, W = half * 2, row = Math.floor((yy + 10) / 4);
    P(L, yy, W, 1, '#4a2f6e'); P(L, yy, Math.max(1, Math.round(W * 0.28)), 1, '#6e4a9a'); P(L + Math.round(W * 0.78), yy, Math.max(1, Math.round(W * 0.22)), 1, '#33204e');
    if ((yy + 10) % 4 === 3) P(L, yy, W, 1, '#2a1a40');
    else if (row % 2 && W > 8) for (let q = L + 3; q < L + W - 2; q += 7) P(q, yy, 1, 1, '#2a1a40');
  }
  P(18, 21, 60, 2, '#2a1a40');
  // cristal flutuando sobre a ponta
  const bob = Math.round(Math.sin(t * 2.2) * 1), cy = -15 + bob;
  ctx.globalAlpha = A * (0.25 + 0.15 * Math.sin(t * 3)); ctx.fillStyle = '#cb8dfa'; ctx.beginPath(); ctx.arc(x + 48, y + cy + 5, 8, 0, 7); ctx.fill(); ctx.globalAlpha = A;
  P(46, cy, 4, 2, '#e8c8ff'); P(45, cy + 2, 6, 6, '#b27ef0'); P(46, cy + 2, 2, 5, '#f4e4ff'); P(47, cy + 8, 2, 2, '#8a5ad0');
  // base larga de pedra com runas acesas
  P(6, 78, 84, 32, '#55466c'); P(6, 78, 84, 3, '#9a86b4'); P(6, 81, 4, 29, '#76648f'); P(84, 81, 6, 29, '#3a2e4c'); P(6, 108, 84, 3, '#2e2440');
  for (let r = 0; r < 4; r++) { P(6, 86 + r * 6, 84, 1, '#3a2e4c'); for (let b = 0; b < 7; b++) P(10 + b * 12 + (r % 2) * 6, 87 + r * 6, 1, 5, '#3a2e4c'); }
  for (const [rx, k] of [[14, 0], [30, 1], [70, 2], [80, 3]]) { ctx.globalAlpha = A * glow(k * 1.7); P(rx, 92, 3, 5, '#9ae0f0'); P(rx - 1, 94, 5, 1, '#9ae0f0'); ctx.globalAlpha = A; }
  // porta em arco com moldura, degraus e lampiões
  P(44, 82, 24, 30, '#9a86b4'); P(45, 81, 22, 2, '#b8a4cf');
  P(47, 86, 18, 26, '#1c1528'); P(49, 84, 14, 3, '#1c1528');
  P(49, 87, 14, 25, '#6a4a3a'); P(49, 87, 14, 1, '#8a6a52'); P(55, 87, 2, 25, '#4a3226'); P(52, 99, 1, 2, '#e0c060'); P(59, 99, 1, 2, '#e0c060');
  P(42, 110, 28, 3, '#76648f'); P(40, 112, 32, 2, '#55466c');
  for (const lx of [40, 69]) { P(lx, 88, 3, 6, '#2e2440'); ctx.globalAlpha = A * glow(lx); P(lx, 89, 3, 3, '#ffd88a'); ctx.globalAlpha = A; }
  // faíscas mágicas subindo
  for (let i = 0; i < 6; i++) {
    const k = (t * 0.35 + i / 6) % 1, sx = 48 + Math.sin(t * 1.5 + i * 2.1) * 30, sy = 70 - k * 100;
    ctx.globalAlpha = A * (1 - k) * 0.8; P(Math.round(sx), Math.round(sy), 1, 2, i % 2 ? '#cb8dfa' : '#9ae0f0');
  }
  ctx.globalAlpha = A;
}
export function drawLacrArchive(ctx, x, y, t, read) { // escrivaninha com pergaminho aberto e pena
  R(ctx, x + 1, y + 13, 14, 3, 'rgba(12,8,28,0.45)');
  R(ctx, x + 1, y + 9, 14, 5, '#3a2a40'); R(ctx, x + 2, y + 9, 12, 4, '#665079'); R(ctx, x + 2, y + 9, 12, 1, '#8a74a0'); R(ctx, x + 2, y + 13, 2, 3, '#3a2a40'); R(ctx, x + 12, y + 13, 2, 3, '#3a2a40');
  R(ctx, x + 3, y + 2, 10, 8, '#7a6a52'); R(ctx, x + 3, y + 3, 10, 6, '#e7d5ad'); R(ctx, x + 2, y + 2, 2, 8, '#bba98e'); R(ctx, x + 12, y + 2, 2, 8, '#bba98e');
  for (let k = 0; k < 3; k++) R(ctx, x + 5, y + 4 + k * 2, 6 - (k % 2) * 2, 1, '#69536a');
  R(ctx, x + 12, y, 1, 6, '#f4f0e8'); R(ctx, x + 13, y, 1, 3, '#d8d0c8');   // pena
  if (!read) { const b = Math.round(Math.sin(t * 3)); R(ctx, x + 7, y - 3 + b, 2, 2, '#cda1fa'); R(ctx, x + 7, y - 3 + b, 1, 1, '#ffffff'); }
}
export function drawLacrRest(ctx, x, y, t) { // pedra de descanso: banco de pedra com cristal que pulsa
  R(ctx, x + 1, y + 13, 14, 3, 'rgba(12,8,28,0.45)');
  R(ctx, x + 1, y + 9, 14, 6, '#3a2a40'); R(ctx, x + 2, y + 10, 12, 4, '#6d5069'); R(ctx, x + 2, y + 10, 12, 1, '#96819a');
  const on = Math.sin(t * 3) > 0, c = on ? '#94e4c2' : '#d7b5ed';
  R(ctx, x + 5, y + 1, 6, 9, '#2a1e3a'); R(ctx, x + 6, y + 2, 4, 8, c); R(ctx, x + 6, y + 2, 2, 8, '#ffffff'); R(ctx, x + 7, y, 2, 2, c);
  ctx.globalAlpha = 0.2 + 0.1 * Math.sin(t * 3); R(ctx, x + 3, y - 1, 10, 12, c); ctx.globalAlpha = 1;
}
// Bichinhos de Lacrímora: mariposa, lagarto, luzinha e besouro (pacíficos, só passeiam). dir = para onde olham.
export function drawLacrCritter(ctx, f, oy, t) {
  const x = Math.round(f.x), gy = Math.round(f.y + oy), y = gy - Math.round(f.z || 0), d = f.dir < 0 ? -1 : 1, X = (dx) => (d > 0 ? x + dx : x - dx - 1);
  const P = (dx, dy, w, h, c) => { for (let i = 0; i < w; i++) R(ctx, X(dx + i), y + dy, 1, h, c); };   // pixel espelhado conforme a direção
  if (f.lacKind === 'moth') {   // mariposa: asas de cima maiores, rosa e azul com pintas, batendo
    const up = Math.sin(t * 14 + f.t) > 0, fy = y - 6 + Math.round(Math.sin(t * 3 + f.t) * 1.5);
    R(ctx, x - 3, gy + 1, 6, 1, 'rgba(8,8,28,0.25)');
    const wing = (side, c1, c2) => {
      const sx = side < 0 ? x - 1 : x + 1, W = (dx, dy, w, h, c) => R(ctx, side < 0 ? sx - dx - w + 1 : sx + dx, fy + dy, w, h, c);
      if (up) { W(0, -3, 3, 3, c1); W(1, -4, 3, 1, c1); W(0, 0, 2, 2, c2); W(1, -2, 1, 1, '#ffffff'); }
      else { W(0, -1, 4, 3, c1); W(1, -2, 3, 1, c1); W(0, 2, 3, 2, c2); W(2, 0, 1, 1, '#ffffff'); }
    };
    wing(-1, '#e7a6dc', '#c77fc0'); wing(1, '#9fe0ea', '#6fbccd');
    R(ctx, x, fy - 3, 1, 6, '#4a3a66'); R(ctx, x, fy - 3, 1, 1, '#8a76b0');
    R(ctx, x - 1, fy - 5, 1, 2, '#4a3a66'); R(ctx, x + 1, fy - 5, 1, 2, '#4a3a66');   // anteninhas
    return;
  }
  if (f.lacKind === 'wisp') {   // luzinha: núcleo branco, brilho azul em volta e um rastrinho
    const wy = y - 6 + Math.round(Math.sin(t * 3 + f.t) * 2), pulse = 0.25 + 0.15 * Math.sin(t * 5 + f.t);
    R(ctx, x - 2, gy + 1, 4, 1, 'rgba(120,220,240,0.25)');
    ctx.globalAlpha = pulse; R(ctx, x - 3, wy - 2, 7, 5, '#9fdfe9'); R(ctx, x - 2, wy - 3, 5, 7, '#9fdfe9'); ctx.globalAlpha = 1;
    R(ctx, x - 1, wy - 1, 3, 3, '#c8f4f8'); R(ctx, x, wy, 1, 1, '#ffffff'); R(ctx, x - 1, wy - 1, 1, 1, '#ffffff');
    ctx.globalAlpha = 0.6; R(ctx, x - d * 3, wy + 1, 1, 1, '#c8f4f8'); R(ctx, x - d * 5, wy + 2, 1, 1, '#9fdfe9'); ctx.globalAlpha = 1;
    return;
  }
  if (f.lacKind === 'lizard') {   // lagarto: corpo comprido, listra nas costas, perninhas, rabo que balança
    const w = Math.round(Math.sin(t * 6 + f.t)), step = f.hop > 0 ? (Math.floor(t * 12) % 2) : 0;
    R(ctx, x - 6, gy + 1, 11, 1, 'rgba(8,8,28,0.3)');
    P(-7, -1 + w, 2, 1, '#b39467'); P(-5, -1, 2, 1, '#b39467'); P(-8, -2 + w, 1, 1, '#b39467');   // rabo
    P(-3, -2, 7, 3, '#c9ab7f'); P(-3, -2, 7, 1, '#e3c9a2'); P(-2, -1, 5, 1, '#8f7458');            // corpo e listra
    P(3, -3, 3, 3, '#d8bd94'); P(4, -3, 2, 1, '#ecd6b2'); P(5, -2, 1, 1, '#221d31'); P(6, -1, 1, 1, '#c9ab7f');   // cabeça e olho
    P(-2, 1, 1, 1 + step, '#8f7458'); P(2, 1, 1, 2 - step, '#8f7458'); P(-2, -3, 1, 1 - step, '#8f7458'); P(2, -3, 1, 1, '#8f7458');   // patinhas
    return;
  }
  // besouro: carapaça roxa brilhante dividida ao meio, cabeça com chifrinho e seis perninhas
  const st = f.hop > 0 ? Math.floor(t * 12) % 2 : 0;
  R(ctx, x - 4, gy + 1, 8, 1, 'rgba(8,8,28,0.3)');
  for (const lx of [-2, 0, 2]) { P(lx, -4 - ((lx + st) & 1), 1, 1, '#2f2440'); P(lx, 1 + ((lx + st) & 1), 1, 1, '#2f2440'); }
  P(-3, -3, 6, 4, '#5a3f86'); P(-2, -4, 4, 1, '#5a3f86'); P(-2, 1, 4, 1, '#3e2b60');
  P(-3, -3, 6, 1, '#9b74d0'); P(-2, -2, 1, 1, '#d8c6f4'); P(0, -3, 1, 4, '#2f2440');                    // brilho e divisão das asas
  P(3, -2, 2, 2, '#3a2b54'); P(5, -3, 1, 1, '#9b74d0'); P(4, -2, 1, 1, '#ffd06a');                    // cabeça, chifre e olhinho
}

// enfeites do farol por dentro (sólidos como barris)
export function drawFarolDeco(ctx, x, y, kind, t) {
  const P = (px, py, w, h, c) => R(ctx, x + px, y + py, w, h, c);
  if (kind === 'ancora') { // âncora de ferro encostada
    P(2, 14, 12, 2, 'rgba(0,0,0,0.25)');
    P(7, 1, 2, 12, '#4a5060'); P(7, 1, 1, 12, '#7a8090'); P(5, 3, 6, 2, '#4a5060'); P(6, 0, 4, 2, '#7a8090');
    P(2, 10, 3, 2, '#4a5060'); P(11, 10, 3, 2, '#4a5060'); P(3, 12, 10, 2, '#4a5060'); P(1, 8, 2, 3, '#4a5060'); P(13, 8, 2, 3, '#4a5060'); P(3, 12, 10, 1, '#7a8090');
  } else if (kind === 'corda') { // rolo de corda
    P(1, 12, 14, 3, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = '#c8a46a'; ctx.beginPath(); ctx.ellipse(x + 8, y + 10, 7, 4.5, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 1; for (const r of [6, 4, 2]) { ctx.beginPath(); ctx.ellipse(x + 8, y + 10, r, r * 0.62, 0, 0, 7); ctx.stroke(); }
    P(12, 6, 3, 2, '#c8a46a'); P(13, 4, 2, 3, '#b8945a');
  } else if (kind === 'boia') { // boia salva-vidas pendurada na parede
    const cy = y - 6;
    ctx.lineWidth = 4;
    for (let i = 0; i < 4; i++) { ctx.strokeStyle = i % 2 ? '#f2eee4' : '#d8402e'; ctx.beginPath(); ctx.arc(x + 8, cy + 8, 5, i * Math.PI / 2, (i + 1) * Math.PI / 2); ctx.stroke(); }
    ctx.lineWidth = 1; ctx.strokeStyle = '#8a2418'; ctx.beginPath(); ctx.arc(x + 8, cy + 8, 7, 0, 7); ctx.stroke();
    P(7, -8, 2, 2, '#5a3a24');
  } else if (kind === 'mapa') { // carta náutica aberta sobre a mesa, com bússola
    P(-2, -3, 18, 11, '#e8dcb4'); P(-2, -3, 18, 1, '#fff4d0'); P(-2, 7, 18, 1, '#b8a47a');
    P(1, -1, 5, 3, '#8ab8c8'); P(8, 1, 6, 4, '#8ab8c8'); P(3, 3, 3, 2, '#a8c890'); P(10, 2, 2, 2, '#a8c890');
    P(5, 0, 1, 1, '#c8382e'); P(6, 1, 1, 1, '#c8382e'); P(7, 2, 1, 1, '#c8382e');
    P(12, -2, 4, 4, '#c8984a'); P(13, -1, 2, 2, '#f2eee4'); P(14, -1, 1, 1, '#c8382e');
  }
}
// sacada: a torre vista de cima (48 × 64), cúpula vermelha redonda, anel de vidro com a luz e a porta embaixo
export function drawFarolTop(ctx, x, y, t, lit) {
  const cx = x + 24, cy = y + 22;
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(cx + 3, cy + 6, 25, 23, 0, 0, 7); ctx.fill();
  // parede da torre (anel listrado visto de cima) e a porta
  R(ctx, x + 6, y + 30, 36, 30, '#f2eee4'); for (let k = 0; k < 3; k++) R(ctx, x + 6, y + 36 + k * 9, 36, 4, '#c8382e');
  R(ctx, x + 6, y + 30, 3, 30, '#ffffff'); R(ctx, x + 38, y + 30, 4, 30, '#b8b2a4');
  R(ctx, x + 18, y + 48, 12, 16, '#3a2a1c'); R(ctx, x + 19, y + 49, 10, 15, '#7a5236'); R(ctx, x + 24, y + 49, 1, 15, '#5a3a24'); R(ctx, x + 26, y + 56, 1, 2, '#e0c060');
  // anel de vidro da lanterna
  ctx.fillStyle = '#22283a'; ctx.beginPath(); ctx.arc(cx, cy, 22, 0, 7); ctx.fill();
  ctx.fillStyle = lit ? '#ffe58a' : '#5a7090'; ctx.beginPath(); ctx.arc(cx, cy, 20, 0, 7); ctx.fill();
  ctx.strokeStyle = '#22283a'; ctx.lineWidth = 2; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14); ctx.lineTo(cx + Math.cos(a) * 21, cy + Math.sin(a) * 21); ctx.stroke(); }
  // cúpula vermelha com brilho e o respiro no topo
  ctx.fillStyle = '#8a2418'; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 7); ctx.fill();
  ctx.fillStyle = '#c8382e'; ctx.beginPath(); ctx.arc(cx - 1, cy - 1, 12, 0, 7); ctx.fill();
  ctx.fillStyle = '#e8604e'; ctx.beginPath(); ctx.arc(cx - 5, cy - 5, 4, 0, 7); ctx.fill();
  ctx.fillStyle = '#3a4258'; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 7); ctx.fill();
  if (lit) { ctx.globalAlpha = 0.25 + 0.1 * Math.sin(t * 4); ctx.fillStyle = '#fff3a0'; ctx.beginPath(); ctx.arc(cx, cy, 30, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
}

// Casa do Aldo e do herói: o cesto em que Aldo achou o bebê, a caminha do Jerry, os ganchos com as duas capas e as marcas de altura
export function drawHomeDeco(ctx, x, y, kind, t = 0) {
  switch (kind) {
    case 'cradle': { // cesto de vime com a mantinha azul bordada
      R(ctx, x + 1, y + 13, 14, 3, 'rgba(0,0,0,0.3)');
      R(ctx, x + 1, y + 6, 14, 8, '#6a4220'); R(ctx, x + 2, y + 7, 12, 6, '#b8864a');
      for (let i = 0; i < 6; i++) R(ctx, x + 2 + i * 2, y + 7 + (i % 2), 1, 5, '#8a5a2c');            // trama do vime
      R(ctx, x + 2, y + 9, 12, 1, '#d8a868'); R(ctx, x + 2, y + 12, 12, 1, '#7a4a22');
      R(ctx, x + 3, y + 3, 10, 5, '#4a6ab8'); R(ctx, x + 3, y + 3, 10, 1, '#7a9ae0'); R(ctx, x + 4, y + 4, 8, 1, '#5a7ac8'); // mantinha
      R(ctx, x + 5, y + 5, 1, 1, '#f4e070'); R(ctx, x + 8, y + 5, 1, 1, '#f4e070'); R(ctx, x + 11, y + 5, 1, 1, '#f4e070'); // lua e estrelas bordadas
      R(ctx, x + 2, y + 2, 1, 5, '#6a4220'); R(ctx, x + 13, y + 2, 1, 5, '#6a4220'); R(ctx, x + 3, y + 1, 10, 1, '#6a4220'); // alça
      break;
    }
    case 'nest': { // caminha do Jerry: cestinho com folhas e bolotas
      R(ctx, x + 2, y + 12, 12, 3, 'rgba(0,0,0,0.28)');
      R(ctx, x + 2, y + 8, 12, 6, '#5a3a1a'); R(ctx, x + 3, y + 9, 10, 4, '#8a5e30');
      R(ctx, x + 4, y + 8, 8, 2, '#c87a2a'); R(ctx, x + 5, y + 7, 3, 2, '#e09a3a'); R(ctx, x + 9, y + 7, 2, 2, '#a8c050');  // folhas
      for (const [ax, ay] of [[3, 12], [11, 12], [12, 10]]) { R(ctx, x + ax, y + ay, 2, 2, '#9a5a24'); R(ctx, x + ax, y + ay - 1, 2, 1, '#5a3412'); } // bolotas
      R(ctx, x + 5, y + 3, 6, 4, '#f4eee0'); R(ctx, x + 5, y + 3, 6, 1, '#c84a3a'); R(ctx, x + 6, y + 4, 4, 1, '#3a2a1a'); // plaquinha "JERRY"
      R(ctx, x + 7, y + 7, 2, 1, '#6a4220');
      break;
    }
    case 'pegs': { // ganchos na parede: a capa grande do Aldo e o casaco verde do herói (ocupa um tile e meio)
      R(ctx, x - 5, y + 1, 26, 2, '#5a3418'); R(ctx, x - 5, y + 1, 26, 1, '#9a6a38');
      R(ctx, x - 1, y + 3, 1, 2, '#d8d8e0'); R(ctx, x + 13, y + 3, 1, 2, '#d8d8e0');
      // capa do Aldo: longa, marrom, com capuz caído
      R(ctx, x - 5, y + 4, 9, 12, '#3a1e0a'); R(ctx, x - 4, y + 4, 7, 11, '#8a5430'); R(ctx, x - 4, y + 4, 7, 3, '#6a3a1e'); R(ctx, x - 3, y + 5, 5, 1, '#4a2810');
      R(ctx, x - 2, y + 8, 1, 7, '#6a3a1e'); R(ctx, x + 1, y + 7, 1, 8, '#a8683c'); R(ctx, x - 4, y + 15, 7, 1, '#2a1406');
      // casaco do herói: menor, verde, mangas e botões dourados
      R(ctx, x + 9, y + 4, 10, 10, '#1e5a2a'); R(ctx, x + 10, y + 4, 8, 9, '#3a9a4a'); R(ctx, x + 10, y + 4, 8, 1, '#5aba5a');
      R(ctx, x + 9, y + 6, 2, 6, '#2a7a3a'); R(ctx, x + 17, y + 6, 2, 6, '#2a7a3a'); R(ctx, x + 13, y + 5, 2, 8, '#2a7a3a');
      R(ctx, x + 15, y + 7, 1, 1, '#f0c840'); R(ctx, x + 15, y + 10, 1, 1, '#f0c840');
      break;
    }
    case 'heights': { // riscos de altura gravados na parede, com a faca ainda espetada ao lado
      for (let i = 0; i < 6; i++) { const yy = y + 15 - i * 2 - (i > 3 ? 1 : 0), w = i === 5 ? 7 : 5; R(ctx, x + 4, yy, w, 1, '#3a2010'); R(ctx, x + 4, yy + 1, w, 1, 'rgba(255,230,180,0.35)'); }
      R(ctx, x + 12, y + 3, 1, 5, '#c8c8d8'); R(ctx, x + 12, y + 3, 1, 1, '#ffffff'); R(ctx, x + 11, y + 8, 3, 1, '#6a4220'); R(ctx, x + 12, y + 9, 1, 3, '#8a5a2c'); // faca
      break;
    }
  }
}
