// Lyon no mesmo padrão dos moradores: cabeça grande, cabelo castanho-escuro curto com topete, olhos com brilho,
// túnica com luz e sombra, cachecol, mochila de couro nas costas e contorno escuro em volta de tudo.
// O quadro do herói continua sendo 16x16 (pés na linha 15); a cabeça passa por cima do quadro (até 7 pixels acima).

// Cores da túnica por armadura: [principal, clara, escura]
export const ARMOR = [
  ['#3a6ec0', '#5a90e0', '#28509a'], // Túnica de Viagem
  ['#8a94a8', '#c0c8d8', '#5a6278'], // Cota de Malha
  ['#b8323a', '#e85a5a', '#7a1a24'], // Armadura Real
  ['#6a4ab8', '#9a7ae8', '#43307e'], // Manto Lunar
];
const BASE = {
  skin: '#ecb890', skinD: '#d09a74', skinL: '#f8cca6', brow: '#2a1a10', eye: '#2a1a10', mouth: '#8a4a3a',
  hair: '#4a2e1c', hairD: '#2e1c10', hairL: '#6e4a30',
  scarf: '#ec7a26', scarfD: '#b8521a', scarfL: '#ffaa5a',
  pants: '#4a3a30', pantsD: '#3a2d25', boot: '#5a3a20', bootL: '#7a5230', belt: '#6a4024', gold: '#f0c860', bracer: '#7a5030',
  steel: '#c8d0e0', steelD: '#8a94aa', pack: '#8a5a32', packD: '#5e3a1e', packL: '#b07a46', roll: '#5a7a4a', rollD: '#3e5a34', strap: '#4a2e1a',
};
// Amigos no grupo: cada um com cachecol e cabelo de outra cor (0 = você/líder)
const VARIANTS = [
  {},
  { scarf: '#2aa8d8', scarfL: '#7ad8f4', scarfD: '#1a7aa0', hair: '#2a2438', hairL: '#4a4468', hairD: '#171322' },
  { scarf: '#4cb04a', scarfL: '#8ce07a', scarfD: '#2e7a2e', hair: '#d8b04a', hairL: '#f4d878', hairD: '#a07e2a' },
  { scarf: '#b25ad8', scarfL: '#e09af4', scarfD: '#7a3a9a', hair: '#b83a3a', hairL: '#e86a5a', hairD: '#7a2020' },
  { scarf: '#e8c42a', scarfL: '#ffe87a', scarfD: '#a8881a', hair: '#8a8a98', hairL: '#c0c0d0', hairD: '#5a5a68' },
  { scarf: '#e85a9a', scarfL: '#ff9ac4', scarfD: '#a83a6a', hair: '#2a5ab8', hairL: '#4a8ae0', hairD: '#1a3a80' },
];
export const VARIANT_COLORS = ['#ec7a26', '#2aa8d8', '#4cb04a', '#b25ad8', '#e8c42a', '#e85a9a'];
// Traje espacial (Lua): túnica, calça e botas viram macacão branco; faixa laranja no pescoço, cinto cinza com emblema azul e luvas cinza.
const SUIT = { pants: '#d8deea', pantsD: '#b4bfd2', boot: '#5a6278', bootL: '#8a94a8', belt: '#8a94a8', gold: '#5ab4ff', bracer: '#9aa4b8', hands: '#9aa4b8', scarf: '#ff8a2a', scarfL: '#ffb066', scarfD: '#c8641a' };
const SUIT_TUNIC = ['#eef2f8', '#ffffff', '#b4bfd2'];
// Roupa de mergulho (Marélia): macacão de neoprene azul-petróleo, punhos e vedação do pescoço amarelos, luvas escuras e nadadeiras amarelas.
const DIVE = { pants: '#1f6478', pantsD: '#14465a', boot: '#f0c040', bootL: '#ffe080', belt: '#2a2a3a', gold: '#9aa4b8', bracer: '#f0c040', hands: '#2a3a4a', scarf: '#f0c040', scarfL: '#ffe080', scarfD: '#b8902a' };
const DIVE_TUNIC = ['#1f6478', '#2f8ca2', '#14465a'];
// traje: true ou 'space' = espacial (Lua), 'dive' = mergulho (Marélia)
const outfitOf = (suit) => suit === 'dive' ? 'dive' : suit ? 'space' : '';
const OUTLINE = '#1a1226';

function palette(armor, variant, outfit) {
  const [tun, tunL, tunD] = outfit === 'space' ? SUIT_TUNIC : outfit === 'dive' ? DIVE_TUNIC : (ARMOR[armor] || ARMOR[0]);
  const p = { ...BASE, ...(VARIANTS[variant] || {}), tun, tunL, tunD, ...(outfit === 'space' ? SUIT : outfit === 'dive' ? DIVE : {}) };
  p.hands = p.hands || p.skin;
  return p;
}

// Desenha o Lyon (sem contorno) com o canto do quadro 16x16 em x,y. dir: 0 frente, 1 costas, 3 lado (direita). step: 0 parado, 1/2 passos.
// o.noArm: tira o braço da espada (as poses de ataque redesenham o braço); o.outfit: 'space' ou 'dive' (no lugar da mochila vai o tanque de ar).
function paint(c, x, y, dir, step, P, o = {}) {
  const R = (xx, yy, w, h, col) => { c.fillStyle = col; c.fillRect(xx, yy, w, h); };
  const hy = y + (step ? 1 : 0), by = y, space = o.outfit === 'space', dive = o.outfit === 'dive', pack = !space && !dive;
  const lA = step === 1 ? -1 : step === 2 ? 1 : 0;
  if (dir === 0 || dir === 1) {
    // pernas afastadas e botas de cano alto
    R(x + 4, by + 12, 3, 3 + Math.min(0, lA), P.pants); R(x + 9, by + 12, 3, 3 - Math.max(0, lA), P.pants);
    R(x + 3, y + 13 + Math.min(0, lA), 4, 3, P.boot); R(x + 9, y + 13 - Math.max(0, lA), 4, 3, P.boot);
    R(x + 3, y + 13 + Math.min(0, lA), 4, 1, P.bootL); R(x + 9, y + 13 - Math.max(0, lA), 4, 1, P.bootL);
    // túnica com cinto
    R(x + 4, by + 8, 8, 5, P.tun); R(x + 4, by + 8, 8, 1, P.tunL); R(x + 4, by + 12, 8, 1, P.tunD); R(x + 11, by + 9, 1, 3, P.tunD);
    R(x + 4, by + 11, 8, 1, P.belt);
    if (dir === 0) R(x + 7, by + 11, 2, 1, P.gold);
    // braços, braçadeiras e mãos (o braço da direita da tela é o da espada)
    R(x + 2, by + 8, 2, 3, P.tunD); R(x + 2, by + 8, 1, 2, P.tun); R(x + 2, by + 10, 2, 1, P.bracer); R(x + 2, by + 11 + (lA > 0 ? 1 : 0), 2, 2, P.hands);
    if (!o.noArm) { R(x + 12, by + 8, 2, 3, P.tunD); R(x + 12, by + 10, 2, 1, P.bracer); R(x + 12, by + 11 + (lA < 0 ? 1 : 0), 2, 2, P.hands); }
    if (pack) { R(x + 1, by + 7, 4, 2, P.steelD); R(x + 1, by + 7, 3, 1, P.steel); R(x + 2, by + 7, 1, 1, '#ffffff'); }   // ombreira
    if (dir === 0 && space) { R(x + 6, by + 9, 4, 2, '#5a6278'); R(x + 6, by + 9, 1, 1, '#ff5a4a'); R(x + 8, by + 9, 1, 1, '#5ab4ff'); R(x + 9, by + 10, 1, 1, '#7af0a0'); }   // painel do peito
    if (dive) { R(x + 2, y + 15, 5, 1, P.boot); R(x + 9, y + 15, 5, 1, P.boot); R(x + 4, by + 12, 1, 3, P.tunL); R(x + 11, by + 12, 1, 3, P.tunL); }   // nadadeiras e listras da roupa
    if (dir === 0 && pack) { R(x + 5, by + 9, 1, 2, P.strap); R(x + 10, by + 9, 1, 2, P.strap); }   // alças da mochila
    // cabeça com as orelhas à mostra
    R(x + 2, hy + 2, 1, 3, P.skinD); R(x + 13, hy + 2, 1, 3, P.skinD);
    R(x + 3, hy - 1, 10, 9, P.skin); R(x + 12, hy, 1, 7, P.skinD); R(x + 4, hy + 7, 8, 1, P.skinD);
    if (dir === 0) {
      R(x + 4, hy - 1, 2, 1, P.skinL);
      // cabelo curto dos lados, topete penteado para o lado e franja caindo para a direita
      R(x + 3, hy - 3, 10, 3, P.hair); R(x + 4, hy - 4, 9, 1, P.hair); R(x + 6, hy - 5, 6, 1, P.hair); R(x + 12, hy - 4, 1, 1, P.hairD);
      R(x + 5, hy - 4, 5, 1, P.hairL); R(x + 7, hy - 5, 3, 1, P.hairL);
      R(x + 3, hy - 1, 1, 3, P.hairD); R(x + 12, hy - 1, 1, 3, P.hairD);
      R(x + 8, hy, 5, 1, P.hair); R(x + 11, hy + 1, 1, 1, P.hair);
      // rosto: sobrancelhas grossas, olhos com brilho e boca séria
      R(x + 4, hy + 2, 3, 1, P.brow); R(x + 9, hy + 2, 3, 1, P.brow);
      R(x + 5, hy + 3, 2, 2, P.eye); R(x + 9, hy + 3, 2, 2, P.eye); R(x + 6, hy + 3, 1, 1, '#ffffff'); R(x + 10, hy + 3, 1, 1, '#ffffff');
      R(x + 7, hy + 6, 2, 1, P.mouth);
      // cachecol com a ponta caindo
      R(x + 4, hy + 7, 8, 2, P.scarf); R(x + 4, hy + 7, 8, 1, P.scarfL); R(x + 4, hy + 8, 8, 1, P.scarfD);
      R(x + 10, hy + 9, 2, 2, P.scarf); R(x + 11, hy + 9, 1, 2, P.scarfD);
    } else {
      // costas: cabelo curto com o topete alto e a nuca aparecendo
      // (espelhado em relação à frente: visto de costas, o topete pende para o outro lado)
      R(x + 3, hy - 3, 10, 7, P.hair); R(x + 3, hy - 4, 9, 1, P.hair); R(x + 4, hy - 5, 6, 1, P.hair); R(x + 3, hy - 6, 6, 1, P.hair); R(x + 4, hy - 7, 3, 1, P.hair);
      R(x + 6, hy - 4, 5, 1, P.hairL); R(x + 5, hy - 6, 3, 1, P.hairL);
      R(x + 3, hy + 2, 1, 2, P.hairD); R(x + 12, hy + 2, 1, 2, P.hairD); R(x + 4, hy + 4, 8, 1, P.hairD);
      R(x + 4, hy + 7, 8, 2, P.scarf); R(x + 4, hy + 7, 8, 1, P.scarfL); R(x + 7, hy + 8, 2, 2, P.scarfD);
      if (space) {   // dois cilindros de oxigênio com tampa laranja
        for (const tx of [4, 9]) { R(x + tx, by + 5, 3, 7, '#d8deea'); R(x + tx, by + 5, 1, 7, '#ffffff'); R(x + tx + 2, by + 6, 1, 6, '#9aa4b8'); R(x + tx, by + 4, 3, 1, '#ff8a2a'); }
        R(x + 7, by + 7, 2, 1, '#8a94a8');
      }
      if (dive) {   // cilindro amarelo de ar com válvula
        R(x + 5, by + 5, 6, 7, '#f0c040'); R(x + 5, by + 5, 2, 7, '#ffe080'); R(x + 10, by + 6, 1, 6, '#b8902a'); R(x + 7, by + 3, 2, 2, '#9aa4b8'); R(x + 5, by + 8, 6, 1, '#2a2a3a');
      }
      if (pack) {   // mochila de couro com tampa, fivela, bolsos e o cobertor enrolado em cima
        R(x + 4, by + 7, 8, 5, P.pack); R(x + 4, by + 11, 8, 1, P.packD); R(x + 11, by + 8, 1, 3, P.packD);
        R(x + 4, by + 7, 8, 3, P.packL); R(x + 4, by + 10, 8, 1, P.packD); R(x + 7, by + 9, 2, 2, P.gold);
        R(x + 3, by + 9, 1, 2, P.packD); R(x + 12, by + 9, 1, 2, P.packD);
        R(x + 3, by + 5, 10, 2, P.roll); R(x + 3, by + 6, 10, 1, P.rollD); R(x + 5, by + 5, 1, 2, P.strap); R(x + 10, by + 5, 1, 2, P.strap);
      }
    }
    return;
  }
  // de lado (virado para a direita)
  const fx = step === 1 ? 2 : step === 2 ? -1 : 0;
  R(x + 6 - fx, by + 12, 3, 3, P.pants); R(x + 5 - fx, y + 14, 4, 2, P.boot); R(x + 5 - fx, y + 14, 4, 1, P.bootL);
  R(x + 7 + fx, by + 12, 3, 3, P.pantsD); R(x + 7 + fx, y + 14, 5, 2, P.boot); R(x + 7 + fx, y + 14, 5, 1, P.bootL);
  if (space) { R(x + 1, by + 5, 4, 7, '#d8deea'); R(x + 1, by + 5, 1, 7, '#ffffff'); R(x + 1, by + 4, 4, 1, '#ff8a2a'); R(x + 4, by + 6, 1, 6, '#9aa4b8'); }   // tanque de oxigênio
  if (dive) { R(x + 1, by + 5, 4, 7, '#f0c040'); R(x + 1, by + 5, 1, 7, '#ffe080'); R(x + 2, by + 3, 2, 2, '#9aa4b8'); R(x + 1, by + 8, 4, 1, '#2a2a3a'); R(x + 2 - fx, y + 15, 7, 1, P.boot); }   // cilindro e nadadeira
  if (pack) {   // mochila nas costas, com o cobertor enrolado em cima
    R(x + 1, by + 7, 4, 5, P.pack); R(x + 1, by + 7, 4, 2, P.packL); R(x + 1, by + 11, 4, 1, P.packD); R(x + 1, by + 9, 1, 2, P.packD);
    R(x + 1, by + 5, 3, 2, P.roll); R(x + 1, by + 6, 3, 1, P.rollD);
  }
  R(x + 5, by + 8, 7, 5, P.tun); R(x + 5, by + 8, 7, 1, P.tunL); R(x + 5, by + 12, 7, 1, P.tunD); R(x + 5, by + 11, 7, 1, P.belt);
  const arm = step === 1 ? 1 : step === 2 ? -1 : 0;
  if (!o.noArm) { R(x + 7 + arm, by + 8, 3, 3, P.tunD); R(x + 7 + arm, by + 8, 3, 1, P.tun); R(x + 8 + arm, by + 10, 2, 1, P.bracer); R(x + 8 + arm, by + 11, 2, 2, P.hands); }
  if (pack) { R(x + 6 + arm, by + 7, 4, 2, P.steelD); R(x + 6 + arm, by + 7, 3, 1, P.steel); }   // ombreira
  if (pack) R(x + 6, by + 9, 1, 3, P.strap);
  // cabeça de perfil: orelha à mostra e topete alto jogado para a frente
  R(x + 4, hy, 9, 8, P.skin); R(x + 4, hy + 7, 8, 1, P.skinD); R(x + 13, hy + 3, 1, 2, P.skin);
  const h = hy + 1;
  R(x + 4, h - 4, 8, 1, P.hair); R(x + 3, h - 3, 10, 2, P.hair); R(x + 3, h - 1, 9, 1, P.hair);
  R(x + 5, h - 5, 8, 1, P.hair); R(x + 7, h - 6, 7, 1, P.hair); R(x + 9, h - 7, 4, 1, P.hair); R(x + 12, h - 5, 2, 3, P.hair); R(x + 13, h - 3, 1, 1, P.hairD);
  R(x + 6, h - 5, 5, 1, P.hairL); R(x + 9, h - 6, 3, 1, P.hairL); R(x + 10, h - 7, 2, 1, P.hairL);
  R(x + 3, h, 3, 3, P.hair); R(x + 3, h + 3, 2, 1, P.hairD); R(x + 3, h + 1, 1, 2, P.hairD);
  R(x + 6, hy + 2, 2, 2, P.skinD); R(x + 6, hy + 2, 1, 1, P.skin);
  R(x + 9, hy + 2, 3, 1, P.brow);
  R(x + 10, hy + 3, 2, 2, P.eye); R(x + 11, hy + 3, 1, 1, '#ffffff');
  R(x + 11, hy + 6, 2, 1, P.mouth);
  R(x + 5, hy + 7, 7, 2, P.scarf); R(x + 5, hy + 7, 7, 1, P.scarfL);
  R(x + 3, hy + 7, 2, 2, P.scarf); R(x + 2, hy + 8, 1, 1, P.scarfD);
}

// contorno escuro de 1 pixel em volta de tudo que foi pintado (como nos moradores)
function outline(cv) {
  const c = cv.getContext('2d'), W = cv.width, H = cv.height, img = c.getImageData(0, 0, W, H), a = img.data;
  const solid = (x, y) => x >= 0 && y >= 0 && x < W && y < H && a[(y * W + x) * 4 + 3] > 100;
  const out = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) out.push([x, y]);
  c.fillStyle = OUTLINE; for (const [x, y] of out) c.fillRect(x, y, 1, 1);
}

// quadro em cache: 20x28 com o canto do 16x16 em (2, 9)
const SW = 20, SH = 28, OX = 2, OY = 9;
const cache = new Map();
// o celular pode apagar canvas guardados quando o app vai para segundo plano
export function clearHeroCache() { cache.clear(); }
function sprite(dir, step, armor, flip, variant = 0, suit = false) {
  const outfit = outfitOf(suit), key = `${dir}|${step}|${armor}|${flip}|${variant}|${outfit}`;
  if (cache.has(key)) return cache.get(key);
  const cv = document.createElement('canvas'); cv.width = SW; cv.height = SH;
  const c = cv.getContext('2d');
  if (flip) { c.translate(SW, 0); c.scale(-1, 1); }
  paint(c, OX, OY, dir, step, palette(armor, variant, outfit), { outfit });
  c.setTransform(1, 0, 0, 1, 0, 0);
  outline(cv);
  cache.set(key, cv);
  return cv;
}
const WALK = [0, 1, 0, 2];
// rows: quantas linhas do quadro 16x16 aparecem (nadando e montado só a parte de cima); a cabeça acima do quadro sempre aparece
export function drawHeroSprite(ctx, x, y, dir, frame, armor = 0, rows = 16, variant = 0, suit = false) {
  const step = WALK[((frame % 4) + 4) % 4];
  const sideDir = dir === 2 || dir === 3;
  const img = sprite(sideDir ? 3 : dir, step, armor, dir === 2, variant, suit);
  const h = Math.min(SH, OY + rows);
  ctx.drawImage(img, 0, 0, SW, h, x - OX, y - OY, SW, h);
}
// segurando um item acima da cabeça (baú, coração, chave...): os dois braços erguidos ao lado da cabeça
export function drawHeroHold(ctx, x, y, armor = 0, variant = 0, suit = false) {
  const outfit = outfitOf(suit), key = `hold|${armor}|${variant}|${outfit}`;
  let cv = cache.get(key);
  if (!cv) {
    cv = document.createElement('canvas'); cv.width = SW; cv.height = SH;
    const c = cv.getContext('2d'), P = palette(armor, variant, outfit), R = (xx, yy, w, h, col) => { c.fillStyle = col; c.fillRect(xx, yy, w, h); };
    paint(c, OX, OY, 0, 0, P, { outfit, noArm: true });
    R(OX + 2, OY + 8, 2, 3, P.tun);   // cobre o braço esquerdo de baixo
    for (const ax of [0, 14]) { R(OX + ax, OY - 1, 2, 9, P.tunD); R(OX + ax, OY + 2, 2, 1, P.bracer); R(OX + ax, OY - 3, 2, 2, P.hands); }
    outline(cv);
    cache.set(key, cv);
  }
  ctx.drawImage(cv, x - OX, y - OY);
}

// empurrando um bloco: corpo inclinado, pernas fazendo força (passos alternados) e os dois braços esticados até o bloco
export function drawHeroPush(ctx, x, y, dir, frame, armor = 0, variant = 0, suit = false) {
  const step = frame % 2 ? 1 : 2, sideDir = dir === 2 || dir === 3, base = sideDir ? 3 : dir;
  const outfit = outfitOf(suit), key = `push|${base}|${step}|${armor}|${variant}|${outfit}`;
  let cv = cache.get(key);
  if (!cv) {
    cv = document.createElement('canvas'); cv.width = SW; cv.height = SH;
    const c = cv.getContext('2d'), P = palette(armor, variant, outfit), R = (xx, yy, w, h, col) => { c.fillStyle = col; c.fillRect(xx, yy, w, h); };
    const x0 = OX, y0 = OY;
    if (base === 3) {   // de lado: o corpo vai 1 pixel para a frente e os dois braços ficam na horizontal, com as mãos no bloco
      paint(c, x0 + 1, y0, 3, step, P, { outfit, noArm: true });
      R(x0 + 9, y0 + 8, 5, 2, P.tunD); R(x0 + 9, y0 + 8, 5, 1, P.tun); R(x0 + 12, y0 + 8, 1, 2, P.bracer); R(x0 + 14, y0 + 8, 2, 3, P.hands);
      R(x0 + 9, y0 + 10, 5, 2, P.tunD); R(x0 + 14, y0 + 10, 2, 2, P.hands);
    } else if (base === 0) {   // de frente: os braços descem esticados para a frente, mãos na beira de baixo
      paint(c, x0, y0, 0, step, P, { outfit, noArm: true });
      c.clearRect(x0 + 1, y0 + 7, 3, 7);   // tira o braço esquerdo de antes (os dois braços são redesenhados)
      for (const ax of [3, 11]) { R(x0 + ax, y0 + 9, 2, 4, P.tunD); R(x0 + ax, y0 + 12, 2, 1, P.bracer); R(x0 + ax, y0 + 13, 2, 2, P.hands); }
    } else {   // de costas: os braços sobem pelos lados da cabeça até o bloco acima
      paint(c, x0, y0, 1, step, P, { outfit, noArm: true });
      c.clearRect(x0 + 1, y0 + 7, 3, 7);
      // por fora da cabeça (as orelhas vão até a coluna 2 e 13): braços nas colunas 0-1 e 14-15, mãos acima da cabeça
      for (const ax of [0, 14]) { R(x0 + ax, y0 + 1, 2, 8, P.tunD); R(x0 + ax, y0 + 2, 2, 1, P.bracer); R(x0 + ax, y0 - 1, 2, 2, P.hands); }
    }
    outline(cv);
    cache.set(key, cv);
  }
  if (dir === 2) { ctx.save(); ctx.translate(x * 2 + 16, 0); ctx.scale(-1, 1); ctx.drawImage(cv, x - OX, y - OY); ctx.restore(); }
  else ctx.drawImage(cv, x - OX, y - OY);
}

// ---------------------------------------------------------------------------------------------------------------------------
// Poses de ataque: o PRÓPRIO Lyon segurando a espada. Cada pose é um quadro de 64x64 com o herói no centro:
// corpo com o passo à frente, braço saindo do ombro, mão na empunhadura e a lâmina nos 8 ângulos (de 45 em 45 graus).
const SW_COL = [null, ['#dfe7f5', '#ffffff'], ['#b8c0d0', '#e8ecf4'], ['#e8eef8', '#ffffff'], ['#9fe8ff', '#ffffff'], ['#ffd23a', '#fff4b0']];
// a = deslocamento do ângulo da espada em relação à direção em que o herói olha; l = passo à frente (px); arm = comprimento do braço (px)
export const ATTACK_POSES = [
  { a: -90, l: 0, arm: 4 }, { a: -45, l: 0, arm: 4 }, { a: 0, l: 1, arm: 4 }, { a: 45, l: 2, arm: 4 }, { a: 90, l: 1, arm: 4 },   // 0-4: o golpe
  { a: 0, l: 2, arm: 5 },    // 5: estocada (dash com Botas Leves)
  { a: 0, l: 0, arm: 3 },    // 6: pronto / carregando
  { a: { 0: -180, 1: 0, 3: -90 }, l: 0, arm: 7 },   // 7: braço erguido para cima (pegando o bumerangue no alto)
];
// ombro da espada em coordenadas do quadro 16x16, por direção base (0 frente, 1 costas, 3 lado/direita)
const ATK_SHOULDER = { 0: [12, 9], 1: [13, 9], 3: [8, 9] };
const ATK_FACE = { 0: [0, 1], 1: [0, -1], 3: [1, 0] };
const atkCache = new Map();
export const swordLength = (lvl = 1) => 11 + Math.max(1, Math.min(4, lvl));
// A lâmina, o brilho e o rastro usam a mesma mão e o mesmo ângulo em todas as direções.
export function attackGeometry(dir, pose, lvl = 1) {
  if (dir === 2) {
    const g = attackGeometry(3, pose, lvl);
    return { ...g, hand: [15 - g.hand[0], g.hand[1]], angle: Math.PI - g.angle, dx: -g.dx };
  }
  const p = ATTACK_POSES[pose], [fx, fy] = ATK_FACE[dir], shoulder = ATK_SHOULDER[dir];
  const angle = ({ 0: 90, 1: -90, 3: 0 }[dir] + (typeof p.a === 'object' ? p.a[dir] : p.a)) * Math.PI / 180;
  const vx = Math.cos(angle), vy = Math.sin(angle);
  const snap = (v) => Math.abs(v) < 0.4 ? 0 : Math.sign(v), dx = snap(vx), dy = snap(vy);
  const hand = [Math.round(shoulder[0] + fx * p.l + vx * p.arm), Math.round(shoulder[1] + fy * p.l + vy * p.arm)];
  const steps = dx && dy ? Math.round((swordLength(lvl) - 1) / Math.SQRT2) + 1 : swordLength(lvl);
  return { hand, angle, dx, dy, steps };
}
function attackSprite(dir, pose, armor, variant, lvl, suit, noBlade = false) {
  const outfit = outfitOf(suit), key = `${dir}|${pose}|${armor}|${variant}|${lvl}|${outfit}|${noBlade ? 1 : 0}`;
  if (atkCache.has(key)) return atkCache.get(key);
  const O = 24, P = ATTACK_POSES[pose], cv = document.createElement('canvas'); cv.width = 64; cv.height = 64;
  const c = cv.getContext('2d'), pal = palette(armor, variant, outfit);
  const put = (x, y, col) => { c.fillStyle = col; c.fillRect(O + x, O + y, 1, 1); };
  const [fx, fy] = ATK_FACE[dir], lx = fx * P.l, ly = fy * P.l, [sx0, sy0] = ATK_SHOULDER[dir];
  const sh = [sx0 + lx, sy0 + ly];
  const { hand, dx, dy, steps } = attackGeometry(dir, pose, lvl);
  const [bc, bh] = SW_COL[Math.max(1, Math.min(5, lvl))] || SW_COL[1];
  const diag = dx !== 0 && dy !== 0;
  const drawBlade = () => {
    for (let i = 0; i < 2; i++) put(hand[0] + dx * i, hand[1] + dy * i, '#4a2e1a');   // empunhadura
    const gx = hand[0] + dx * 2, gy = hand[1] + dy * 2;
    for (const k of [-2, -1, 0, 1, 2]) put(gx - dy * k, gy + dx * k, k === 0 ? '#ffe9a8' : '#e0c060');   // guarda dourada
    for (let i = 3; i < steps; i++) {
      const x = hand[0] + dx * i, y = hand[1] + dy * i, tip = i >= steps - 2;
      put(x, y, tip ? bh : bc);
      if (tip) continue;
      if (diag) {
        const A = [x + dx, y], B = [x, y + dy], aFirst = A[0] + A[1] <= B[0] + B[1];
        put(...(aFirst ? A : B), bh); put(...(aFirst ? B : A), '#8a94ac');
      } else { put(x - dy, y + dx, bh); put(x + dy, y - dx, '#8a94ac'); }
    }
    put(hand[0] - dx, hand[1] - dy, '#e0c060');   // pomo
  };
  const drawBody = () => {   // corpo sem o braço da espada, com contorno próprio
    const b = document.createElement('canvas'); b.width = 64; b.height = 64;
    paint(b.getContext('2d'), O + lx, O + ly, dir, 0, pal, { noArm: true, outfit });
    outline(b);
    c.drawImage(b, 0, 0);
  };
  const drawArm = () => {
    const n = Math.max(2, Math.round(Math.hypot(hand[0] - sh[0], hand[1] - sh[1])));
    for (let i = 0; i <= n; i++) { const f = i / n, x = Math.round(sh[0] + (hand[0] - sh[0]) * f), y = Math.round(sh[1] + (hand[1] - sh[1]) * f); for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1], [-1, -1]]) put(x + ox, y + oy, OUTLINE); }
    for (let i = 0; i <= n; i++) { const f = i / n, x = Math.round(sh[0] + (hand[0] - sh[0]) * f), y = Math.round(sh[1] + (hand[1] - sh[1]) * f); put(x, y, f > 0.6 ? pal.hands : i % 2 ? pal.tunL : pal.tun); put(x + 1, y, f > 0.6 ? pal.skinD : pal.tunD); }
    put(hand[0], hand[1], pal.hands);
  };
  // sem lâmina: a mesma pose com o braço esticado e a mão vazia (para segurar arco, bastão, martelo, bumerangue...)
  if (noBlade && pose === 7 && dir !== 1) { drawArm(); drawBody(); }   // braço erguido passa por trás da cabeça (não cobre o rosto)
  else if (noBlade) { drawBody(); drawArm(); }
  else if (dir === 1) { drawBlade(); drawBody(); drawArm(); } else { drawBody(); drawBlade(); drawArm(); }
  atkCache.set(key, cv);
  return cv;
}
export function clearAttackCache() { atkCache.clear(); }
// desenha o herói na pose de ataque `pose` (0-6); x,y = canto do herói como em drawHeroSprite
export function drawHeroAttack(ctx, x, y, dir, pose, armor = 0, variant = 0, lvl = 1, suit = false, noBlade = false) {
  const sideDir = dir === 2 || dir === 3, img = attackSprite(sideDir ? 3 : dir, pose, armor, variant, lvl, suit, noBlade);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(x + 8, y + 8);
  ctx.scale(dir === 2 ? -1 : 1, 1);
  ctx.drawImage(img, -32, -32);
  ctx.restore();
}
