// Fachadas das entradas de masmorra: cada templo, cripta, mina, pirâmide, palácio e castelo tem o seu desenho.
// Só aparência: tudo é pintado por cima dos tiles '#' do bloco da entrada (6x3 tiles) e a porta fica
// exatamente sobre os dois tiles de entrada, então a colisão e a passagem não mudam.
import { hash } from './util.js';

const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = (v) => Math.max(0, Math.min(255, Math.round(v * k))); return '#' + ((f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).padStart(6, '0'); };

// bloco 96x48 (Terra: colunas 7-12, linhas 2-4) ou na Lua (colunas 2-7, linhas 1-3); porta nos 32 px do meio, embaixo
const ORIGIN = { mk1: [32, 16], mk2: [32, 16], mc: [32, 16] };
const W = 96, H = 48, DX = 32, DW = 32, DY = 32;

function painter(ctx, ox, oy) {
  const r = (x, y, w, h, c) => { if (w <= 0 || h <= 0) return; ctx.fillStyle = c; ctx.fillRect(ox + x, oy + y, w, h); };
  const p = (x, y, c) => r(x, y, 1, 1, c);
  // blocos de pedra desencontrados com luz em cima e sombra embaixo
  const blocks = (x, y, w, h, pal, bw = 8, bh = 4, seed = 0) => {
    const [mortar, base, dark, hi] = pal;
    r(x, y, w, h, mortar);
    for (let row = 0, yy = y; yy < y + h; row++, yy += bh) {
      const off = row % 2 ? bw / 2 : 0;
      for (let xx = x - off; xx < x + w; xx += bw) {
        const sx = Math.max(x, xx), ex = Math.min(x + w, xx + bw - 1), hh = Math.min(bh - 1, y + h - yy);
        if (ex <= sx || hh <= 0) continue;
        const tone = hash(xx * 3 + seed, yy * 7, 5) < 0.3 ? dark : base;
        r(sx, yy, ex - sx, hh, tone); r(sx, yy, ex - sx, 1, hi);
        if (hh > 2) r(sx, yy + hh - 1, ex - sx, 1, shade(tone, 0.82));
      }
    }
  };
  // vão em arco (ou reto) escuro, com fundo que some no breu
  const opening = (x, y, w, h, round, deep = '#07060c', mid = '#14121e') => {
    const cx = x + w / 2;
    for (let yy = 0; yy < h; yy++) {
      let half = w / 2;
      if (round && yy < w / 2) half = Math.round(Math.sqrt(Math.max(0, (w / 2) ** 2 - (w / 2 - yy - 0.5) ** 2)));
      r(Math.round(cx - half), y + yy, Math.round(half * 2), 1, yy > h - 5 ? mid : deep);
    }
  };
  const archRim = (x, y, w, h, c, hi, lo) => {
    const cx = x + w / 2, R0 = w / 2 + 2;
    for (let yy = -2; yy < h; yy++) {
      const inA = yy < w / 2;
      const half = inA ? Math.sqrt(Math.max(0, R0 * R0 - (w / 2 - yy - 0.5) ** 2)) : R0;
      const ih = inA ? Math.sqrt(Math.max(0, (w / 2) ** 2 - (w / 2 - yy - 0.5) ** 2)) : w / 2;
      if (half <= 0) continue;
      const L = Math.round(cx - half), Ri = Math.round(cx + half), il = Math.round(cx - ih), ir = Math.round(cx + ih);
      r(L, y + yy, il - L, 1, yy < 2 ? hi : c); r(ir, y + yy, Ri - ir, 1, yy < 2 ? c : lo);
      if (ih <= 0.5) r(il, y + yy, ir - il, 1, yy < 0 ? hi : c);
    }
  };
  const tri = (cx, top, half, h, col, edge) => { for (let i = 0; i < h; i++) { const w = Math.round(half * (i + 1) / h); r(cx - w, top + i, w * 2, 1, col); if (edge) { p(cx - w, top + i, edge[0]); p(cx + w - 1, top + i, edge[1]); } } };
  const disc = (cx, cy, rad, col) => { for (let dy = -rad; dy <= rad; dy++) { const hw = Math.round(Math.sqrt(rad * rad - dy * dy)); r(cx - hw, cy + dy, hw * 2, 1, col); } };
  return { r, p, blocks, opening, archRim, tri, disc };
}

// ---------------------------------------------------------------- Terra
// Toca das Raízes: tronco colossal e retorcido com a copa por cima, raízes abraçando a entrada e lanternas
function rootTemple(P) {
  const { r, p, disc, opening } = P;
  // mesmas cores da floresta em volta (courtJungle), para a toca fazer parte dela em vez de parecer colada por cima
  const bark = ['#1e1208', '#3a2412', '#55361a', '#6e4824', '#8e6234'];
  // raízes grossas espalhadas na base, se enfiando no chão
  for (const [x0, w, dir] of [[10, 16, -1], [70, 18, 1], [26, 10, -1], [62, 10, 1], [40, 6, -1], [56, 6, 1]]) for (let i = 0; i < 12; i++) {
    const xx = Math.round(x0 + (dir < 0 ? -i : i) * w / 12), yy = 36 + Math.round(i * 0.9), th = Math.max(2, 6 - Math.floor(i / 3));
    r(xx, yy, 2, th + 1, bark[0]); r(xx, yy, 1, th, i % 3 ? bark[2] : bark[3]);
  }
  // tronco enorme: alarga embaixo, sombreado cilíndrico escuro e casca em placas
  for (let y = -2; y < 46; y++) {
    const half = 20 + Math.max(0, (y - 26)) * 0.9 + Math.sin(y * 0.4) * 1.5, cx = 48 + Math.sin(y * 0.15) * 2;
    const L = Math.round(cx - half), Rr = Math.round(cx + half), w = Rr - L;
    r(L - 1, y, w + 2, 1, bark[0]);
    r(L, y, Math.round(w * 0.14), 1, bark[2]); r(L + Math.round(w * 0.14), y, Math.round(w * 0.3), 1, bark[3]); r(L + Math.round(w * 0.44), y, Math.round(w * 0.28), 1, bark[2]); r(L + Math.round(w * 0.72), y, w - Math.round(w * 0.72), 1, bark[1]);
    if (y % 2 === 0) r(L + Math.round(w * 0.2), y, 2, 1, bark[4]);   // luz na quina do tronco
  }
  // placas de casca e sulcos verticais
  for (let k = 0; k < 9; k++) { const xx = 29 + k * 5; for (let y = 0; y < 42; y++) if ((y + k * 4) % 10 < 7) p(xx + Math.round(Math.sin((y + k) * 0.3) * 1.5), y, bark[0]); }
  for (let k = 0; k < 14; k++) { const xx = 30 + ((hash(k, 2, 41) * 38) | 0), yy = 4 + ((hash(k, 3, 41) * 30) | 0); r(xx, yy, 3, 1, bark[4]); }
  // musgo escorrendo no tronco
  for (let k = 0; k < 7; k++) { const xx = 30 + k * 6, L = 4 + ((hash(k, 5, 42) * 9) | 0); for (let y = 0; y < L; y++) p(xx + (y % 4 === 0 ? 1 : 0), y, y < 2 ? '#4a9440' : '#2e5a24'); }
  // copa: os mesmos tons escuros da floresta, emendando com ela dos dois lados
  const lobes = [[4, 4, 13], [22, 0, 13], [40, -4, 15], [58, -4, 15], [76, 0, 13], [94, 4, 13]];
  for (const [cx, cy, rad] of lobes) disc(cx, cy, rad + 1, '#06140a');
  for (const [cx, cy, rad] of lobes) { disc(cx, cy, rad, '#17401c'); disc(cx - 2, cy - 2, rad - 3, '#215a26'); disc(cx - 4, cy - 4, Math.max(2, rad - 8), '#2f7432'); }
  for (const [cx, cy, rad] of lobes) for (let i = 0; i < rad * 2; i++) { const a = hash(cx, i, 5) * 6.28, d = hash(i, cy, 6) * rad * 0.85; p(Math.round(cx + Math.cos(a) * d), Math.round(cy + Math.sin(a) * d), hash(i, cx, 7) < 0.5 ? '#4a9440' : '#0f2a14'); }
  for (let x = 6; x < 92; x += 5) { const L = 4 + ((hash(x, 1, 7) * 9) | 0); for (let y = 10; y < 10 + L; y++) p(x + (y % 6 === 0 ? 1 : 0), y, y % 3 ? '#2e5a24' : '#4a8a36'); p(x, 10 + L, '#7cc45e'); }   // cipós
  // boca da toca: arco de raízes, fundo bem escuro e olhos brilhando lá dentro
  P.archRim(DX, DY - 12, DW, 28, bark[2], bark[3], bark[0]);
  opening(DX, DY - 12, DW, 28, true, '#050302', '#140d06');
  for (let i = 0; i < 6; i++) r(DX + 3 + i * 5, DY - 11 + (i % 2), 2, 4 + (i % 3), bark[0]);
  r(DX + 10, DY + 2, 2, 1, '#c8ff8a'); r(DX + 20, DY + 2, 2, 1, '#c8ff8a');
  // lanternas penduradas e runa verde no tronco
  for (const lx of [24, 70]) { r(lx, 14, 1, 6, '#3a2a18'); r(lx - 2, 20, 5, 5, '#2a1a0c'); r(lx - 1, 21, 3, 3, '#ffd27a'); p(lx - 1, 21, '#fff6d0'); }
  r(46, 10, 4, 1, '#7cf08a'); r(47, 8, 2, 5, '#7cf08a'); r(45, 12, 1, 1, '#7cf08a'); r(50, 12, 1, 1, '#7cf08a');
}
// Cripta Esquecida: catedral gótica com agulha central, duas torres pontudas, contrafortes e vitrais roxos
function cryptTemple(P) {
  const { r, p, blocks, tri, opening } = P;
  const stone = ['#1e1e26', '#5e5e6a', '#4a4a56', '#8e8e9c'];
  // torres laterais pontudas
  for (const tx0 of [6, 72]) {
    blocks(tx0, 8, 18, 40, stone, 6, 4, tx0);
    tri(tx0 + 9, -10, 10, 18, '#3e3e4c', ['#8e8e9c', '#1e1e26']);
    r(tx0 + 8, -14, 2, 5, '#2a2a34'); r(tx0 + 6, -12, 6, 1, '#2a2a34');   // cruz
    r(tx0 + 6, 14, 6, 12, '#1e1e26'); r(tx0 + 7, 15, 4, 10, '#4a2a7a'); r(tx0 + 8, 16, 2, 8, '#8a5ad8'); for (let i = 0; i < 3; i++) r(tx0 + 7 + i, 14 - i, 4 - i * 2 > 0 ? 4 - i * 2 : 1, 1, '#1e1e26');
    r(tx0 - 1, 8, 20, 2, '#8e8e9c');
  }
  // nave central com frontão alto e agulha
  blocks(24, 10, 48, 38, stone, 8, 5, 3);
  tri(48, -12, 26, 24, '#4a4a58', ['#a8a8b6', '#1e1e26']);
  r(47, -16, 2, 6, '#2a2a34'); r(45, -14, 6, 1, '#2a2a34');
  // contrafortes
  for (const bx of [24, 70]) { r(bx, 10, 3, 38, '#3a3a46'); r(bx, 10, 1, 38, '#8e8e9c'); }
  // rosácea violeta
  P.disc(48, 2, 6, '#1e1e26'); P.disc(48, 2, 5, '#4a2a7a'); P.disc(48, 2, 2, '#c8a0ff'); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; p(Math.round(48 + Math.cos(a) * 4), Math.round(2 + Math.sin(a) * 4), '#8a5ad8'); }
  // porta em ogiva com grade
  P.archRim(DX, DY - 14, DW, 30, '#5a5a66', '#b4b4c2', '#2a2a34');
  opening(DX, DY - 14, DW, 30, true, '#07060c', '#141222');
  for (let x = DX + 3; x < DX + DW - 2; x += 5) p(x, DY - 13, '#7a7a8a');   // grade erguida: só as pontas aparecem no alto do arco
  r(45, 17, 6, 5, '#e8e4d4'); p(46, 19, '#1e1e26'); p(49, 19, '#1e1e26'); r(46, 22, 4, 1, '#c8c4b4');
  // gárgulas e velas
  for (const gx of [27, 64]) { r(gx, 18, 5, 4, '#3a3a46'); p(gx + 1, 19, '#c8a0ff'); p(gx + 3, 19, '#c8a0ff'); }
  for (const cx of [21, 74]) { r(cx, 40, 3, 6, '#e8e4d4'); p(cx + 1, 38, '#ffd23a'); p(cx + 1, 39, '#ff8a2a'); }
}
// Santuário do Lodo: cabana redonda sobre palafitas com telhado cônico de palha, totens e lodo brilhante
function swampTemple(P) {
  const { r, p, tri, opening } = P;
  r(0, 40, 96, 8, '#2a4a3e'); for (let x = 2; x < 96; x += 6) r(x, 42 + (x % 3 ? 1 : 0), 4, 1, '#4a7a6a');
  for (const x of [20, 34, 60, 74]) { r(x, 28, 4, 20, '#2a1e10'); r(x, 28, 1, 20, '#5a4a2c'); }
  r(14, 26, 68, 4, '#5a4a2c'); r(14, 26, 68, 1, '#8a7a4a');
  // parede arredondada
  for (let y = 10; y < 27; y++) { const half = 26 - Math.max(0, 14 - y) * 0.3; r(Math.round(48 - half), y, Math.round(half * 2), 1, y % 4 === 0 ? '#4a3e26' : '#6a5a3a'); r(Math.round(48 - half), y, 3, 1, '#8a7a4a'); r(Math.round(48 + half) - 3, y, 3, 1, '#3a2e1a'); }
  // telhado cônico de palha (bem alto)
  tri(48, -16, 34, 30, '#8a7a3a', ['#c8b868', '#4a3a14']);
  for (let y = -12; y < 14; y += 3) { const w = Math.round(34 * (y + 16) / 30); for (let x = 48 - w + 2; x < 48 + w - 2; x += 4) p(x + ((y / 3) % 2 ? 2 : 0), y, '#6a5a2a'); }
  for (let x = 16; x < 82; x += 4) { const L = 2 + ((hash(x, 9, 1) * 5) | 0); r(x, 14, 2, L, '#5aa83a'); p(x, 14 + L, '#8ad85a'); }
  r(46, -18, 4, 4, '#3a6a2a'); p(47, -17, '#d8ff8a');   // amuleto na ponta
  // máscara-totem e porta
  r(42, 2, 12, 9, '#2a4a1a'); r(43, 3, 10, 7, '#5a9a3a'); r(44, 5, 3, 2, '#d8ff8a'); r(49, 5, 3, 2, '#d8ff8a'); r(45, 8, 6, 1, '#1a2a10');
  P.archRim(DX + 2, 18, DW - 4, 30, '#5a4a2c', '#8a7a4a', '#2a1e10');
  opening(DX + 2, 18, DW - 4, 30, true, '#050a05', '#0e1a0c');
  r(DX + 4, 26, DW - 8, 2, 'rgba(120,255,120,0.2)');
  // totens dos lados
  for (const tx0 of [4, 84]) { r(tx0, 12, 8, 36, '#3a2a14'); r(tx0 + 1, 13, 6, 34, '#7a5a2a'); for (let k = 0; k < 3; k++) { r(tx0 + 1, 15 + k * 10, 6, 2, '#c84a3a'); p(tx0 + 2, 18 + k * 10, '#d8ff8a'); p(tx0 + 5, 18 + k * 10, '#d8ff8a'); } r(tx0 - 2, 10, 12, 3, '#c84a3a'); }
}
// Mina Abandonada: morro de rocha com torre de extração (roldana) e a boca escorada
function mineTemple(P) {
  const { r, p, opening } = P;
  // a boca é escavada no próprio paredão da montanha: sombra funda em volta, escoras de madeira e trilhos saindo
  for (let y = 4; y < 48; y++) { const t = (y - 4) / 44, half = Math.round(24 + Math.sqrt(t) * 4); r(48 - half, y, half * 2, 1, y < 8 ? 'rgba(20,14,10,0.35)' : 'rgba(20,14,10,0.5)'); }
  opening(DX - 2, 10, DW + 4, 38, false, '#060504', '#120e0a');
  r(DX - 6, 8, DW + 12, 5, '#6a4626'); r(DX - 6, 8, DW + 12, 1, '#a8743e'); r(DX - 6, 12, DW + 12, 1, '#3a2410');
  for (const x of [DX - 6, DX + DW + 1]) { r(x, 12, 5, 36, '#6a4626'); r(x, 12, 1, 36, '#a8743e'); r(x + 4, 12, 1, 36, '#3a2410'); }
  for (const x of [DX - 8, DX + DW + 4]) { for (let i = 0; i < 10; i++) p(x + (x < 48 ? -i : i), 13 + i * 3, '#4a3220'); }   // escoras inclinadas
  r(40, 1, 16, 6, '#3a2410'); r(41, 2, 14, 4, '#c8945c'); r(43, 3, 3, 2, '#3a2410'); r(48, 3, 5, 1, '#3a2410');
  for (let k = 0; k < 4; k++) r(DX + 4 - k, 34 + k * 4, 24 + k * 2, 2, '#5a3c22');
  r(DX + 8, 30, 1, 18, '#b8bccc'); r(DX + 23, 30, 1, 18, '#b8bccc');
  for (const lx of [DX - 12, DX + DW + 10]) { r(lx, 14, 1, 4, '#3a3a48'); r(lx - 2, 18, 5, 6, '#2a2a34'); r(lx - 1, 19, 3, 4, '#ffd27a'); p(lx - 1, 19, '#ffffff'); }
  for (const [x, y, c] of [[16, 30, '#7af0ff'], [80, 26, '#ffd23a'], [74, 40, '#c060ff'], [20, 42, '#ffd23a']]) { r(x, y, 2, 2, c); p(x + 2, y + 1, '#ffffff'); }   // veios de cristal na rocha
}
// Templo das Marés: templo de cúpula azul com colunatas, duas torres de concha e o arco de vieira
function tideTemple(P) {
  const { r, p, blocks, opening, disc } = P;
  // torres em espiral (conchas) nas pontas
  for (const tx0 of [8, 76]) {
    for (let y = 4; y < 48; y++) { const w = Math.min(12, 4 + Math.round((y - 4) * 0.4)); r(tx0 + 6 - (w >> 1), y, w, 1, (y >> 2) % 2 ? '#f4c4b0' : '#ffd8c8'); p(tx0 + 6 - (w >> 1), y, '#a87060'); }
    r(tx0 + 5, -2, 2, 6, '#ffd8c8'); p(tx0 + 5, -3, '#ffffff');
  }
  // corpo do templo com colunas
  blocks(20, 18, 56, 30, ['#8a9eac', '#d8d4c4', '#c4c0ae', '#f0ecdc'], 12, 6, 5);
  r(18, 16, 60, 4, '#2a6aa8'); for (let x = 18; x < 78; x += 6) { r(x, 17, 3, 1, '#7ac8f0'); r(x + 3, 18, 3, 1, '#7ac8f0'); }
  for (const cx of [22, 34, 58, 70]) { r(cx, 20, 5, 28, '#e8e4d4'); r(cx, 20, 2, 28, '#ffffff'); r(cx + 4, 20, 1, 28, '#a8a494'); }
  // cúpula azul com brilho e lanterna no topo
  for (let y = -12; y < 17; y++) { const half = Math.round(Math.sqrt(Math.max(0, 28 * 28 - (y - 16) * (y - 16))) * 0.85); if (!half) continue; r(48 - half, y, half * 2, 1, '#1c4a7a'); r(48 - half + 1, y, half * 2 - 2, 1, y < 2 ? '#3a8ac8' : '#2a6aa8'); r(48 - half + 2, y, Math.max(1, Math.round(half * 0.5)), 1, '#7ac8f0'); }
  for (let k = -3; k <= 3; k++) r(48 + k * 7, -2 + Math.abs(k) * 2, 1, 18 - Math.abs(k) * 2, '#1c4a7a');
  r(46, -16, 4, 5, '#e0c060'); p(47, -17, '#fff0a0');
  // arco de vieira e porta de água
  for (let i = 0; i < 9; i++) { const a = Math.PI * (0.05 + i * 0.9 / 8); for (let k = 12; k < 18; k++) p(Math.round(48 - Math.cos(a) * k), Math.round(DY + 2 - Math.sin(a) * k), k > 16 ? '#e88a8a' : i % 2 ? '#f4c4b0' : '#ffd8c8'); }
  opening(DX + 2, DY - 12, DW - 4, 28, true, '#06101c', '#0c2a44');
  for (let i = 0; i < 3; i++) r(DX + 7 + i * 7, DY + 10 - i, 5, 1, '#4aa0d8');
  for (const [sx, sy, c] of [[4, 42, '#ff8a6a'], [88, 40, '#ffb04a']]) { r(sx, sy + 1, 5, 1, c); r(sx + 2, sy - 1, 1, 5, c); }
}
// Pirâmide do Sol: pirâmide de verdade em degraus, com o sol no topo, obeliscos e esfinges guardando a porta
function sunTemple(P) {
  const { r, p } = P;
  for (let i = 0; i < 12; i++) {
    const y = -14 + i * 5, half = 6 + i * 4;
    r(48 - half, y, half * 2, 5, i % 2 ? '#c89a5a' : '#d8ac6a'); r(48 - half, y, half * 2, 1, '#f4d090'); r(48 - half, y + 4, half * 2, 1, '#9a7040');
    r(48, y + 1, half, 3, i % 2 ? '#b08448' : '#c09456');   // lado da sombra
    for (let x = 48 - half + (i % 2) * 4; x < 48 + half; x += 8) r(x, y + 1, 1, 3, '#a87e48');
  }
  // sol dourado no topo
  P.disc(48, -12, 5, '#a07020'); P.disc(48, -12, 4, '#ffd23a'); P.disc(47, -13, 1, '#fff2a0');
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; p(Math.round(48 + Math.cos(a) * 6), Math.round(-11 + Math.sin(a) * 6), '#ffd23a'); }
  // faixa de hieróglifos
  r(26, 22, 44, 5, '#8a6a3a'); r(26, 22, 44, 1, '#c8a060');
  for (let k = 0; k < 7; k++) for (let b = 0; b < 4; b++) if ('1010011011111001'[(k * 4 + b) % 16] === '1') p(29 + k * 6 + (b % 2), 23 + (b >> 1) * 2, '#2a5aa8');
  // porta trapezoidal com moldura azul e dourada
  for (let yy = 0; yy < 20; yy++) { const inset = Math.round((20 - yy) * 0.3); r(DX + inset - 2, 28 + yy, DW - inset * 2 + 4, 1, yy < 2 ? '#2a5aa8' : '#e0c060'); }
  for (let yy = 0; yy < 18; yy++) { const inset = Math.round((18 - yy) * 0.3); r(DX + inset, 30 + yy, DW - inset * 2, 1, yy > 14 ? '#1a120a' : '#0a0604'); }
  // obeliscos e esfinges
  for (const ox of [4, 86]) { r(ox, 0, 6, 48, '#a07048'); r(ox, 0, 2, 48, '#e4b888'); r(ox + 1, -4, 4, 4, '#e0c060'); p(ox + 2, -5, '#fff0a0'); for (let y = 6; y < 44; y += 6) p(ox + 3, y, '#2a5aa8'); }
  for (const sx of [14, 74]) { r(sx, 38, 9, 10, '#c89a5a'); r(sx + 1, 33, 6, 6, '#d8ac6a'); r(sx, 33, 2, 6, '#2a5aa8'); r(sx + 5, 33, 2, 6, '#2a5aa8'); p(sx + 2, 35, '#1a120a'); p(sx + 5, 35, '#1a120a'); r(sx - 1, 46, 11, 2, '#9a7040'); }
}
// Palácio de Gelo: agulhas de cristal de alturas diferentes, ponte de gelo e portal congelado
function iceTemple(P) {
  const { r, p, blocks, tri, opening } = P;
  for (const [cx, top, w] of [[8, -6, 10], [88, -6, 10], [22, -12, 10], [74, -12, 10], [36, -2, 8], [60, -2, 8], [48, -18, 12]]) {
    r(cx - w / 2, top + w, w, 48 - top - w, '#a8d4f0'); r(cx - w / 2, top + w, 2, 48 - top - w, '#e4f6ff'); r(cx + w / 2 - 2, top + w, 2, 48 - top - w, '#6aa8d8');
    tri(cx, top, w / 2 + 1, w + 2, '#d4f0ff', ['#ffffff', '#6aa8d8']);
    r(cx - 1, top + w + 4, 2, 4, '#3a78bc'); p(cx - 1, top + w + 4, '#bfe8ff');
  }
  blocks(14, 22, 68, 26, ['#6a9ac0', '#bfe4f8', '#a8d4f0', '#ffffff'], 12, 6, 7);
  r(12, 20, 72, 3, '#ffffff'); for (let x = 14; x < 82; x += 4) r(x, 23, 1, 1 + ((hash(x, 5, 2) * 4) | 0), '#e4f6ff');
  P.archRim(DX, DY - 12, DW, 28, '#7cbce0', '#ffffff', '#4a8ac0');
  opening(DX, DY - 12, DW, 28, true, '#0a1428', '#1a2c4a');
  for (let i = 0; i < 4; i++) r(DX + 5 + i * 7, DY - 10 + (i % 2) * 2, 1, 3 + (i % 2), '#e4f6ff');
  r(47, 13, 2, 7, '#ffffff'); r(44, 16, 8, 1, '#ffffff'); p(45, 14, '#ffffff'); p(50, 14, '#ffffff'); p(45, 18, '#ffffff'); p(50, 18, '#ffffff');
  for (let i = 0; i < 6; i++) p(10 + i * 15, 6 + (i * 7) % 14, '#ffffff');
}
// Portões dos caminhos confusos: cada um com silhueta própria e a vegetação da região em volta
// Cemitério Labiríntico: capela-portaria de pedra escura com telhado pontudo, torrezinha do sino, muros com
// grade de ferro dos lados, porta de ferro em ogiva e lápides tortas na frente
function cemeteryGate(P) {
  const { r, p, blocks, tri, opening, disc } = P;
  const stone = ['#1e1c26', '#4e4c5e', '#3e3c4c', '#7a788c'];
  // muros baixos com grade de ferro nas laterais
  for (const [x0, x1] of [[2, 26], [70, 94]]) { blocks(x0, 30, x1 - x0, 18, stone, 8, 4, x0); r(x0, 28, x1 - x0, 2, '#7a788c'); for (let x = x0 + 1; x < x1; x += 3) { r(x, 18, 1, 10, '#2e2c3a'); r(x - 1, 17, 3, 1, '#6a687a'); } r(x0, 22, x1 - x0, 1, '#2e2c3a'); }
  // capela no meio
  blocks(24, 12, 48, 36, stone, 8, 5, 4);
  tri(48, -10, 28, 24, '#2e2c3a', ['#7a788c', '#14121c']);
  for (let y = -6; y < 14; y += 4) { const w = Math.round(28 * (y + 10) / 24); r(48 - w + 2, y, w * 2 - 4, 1, '#3e3c4c'); }
  // torrezinha do sino com cruz
  r(44, -12, 8, 6, '#1e1c26'); r(45, -11, 6, 5, '#4e4c5e'); r(46, -10, 4, 3, '#14121c'); r(47, -9, 2, 2, '#c8a85a'); r(47, -17, 2, 5, '#2a2834'); r(45, -15, 6, 1, '#2a2834');
  // pilastras e vitrais
  for (const x of [24, 69]) { r(x, 12, 3, 36, '#2e2c3a'); r(x, 12, 1, 36, '#7a788c'); }
  for (const x of [28, 62]) { r(x, 18, 6, 10, '#14121c'); r(x + 1, 19, 4, 8, '#4a2a7a'); r(x + 2, 20, 2, 6, '#8a5ad8'); }
  // porta de ferro em ogiva, do tamanho da entrada
  P.archRim(DX + 2, DY - 12, DW - 4, 28, '#5e5c70', '#a8a6b8', '#2a2834');
  opening(DX + 2, DY - 12, DW - 4, 28, true, '#05050a', '#0e0c16');
  for (let x = DX + 5; x < DX + DW - 4; x += 4) p(x, DY - 11, '#7a788c');   // grade erguida
  disc(48, 14, 3, '#d8d4c4'); p(47, 14, '#1e1c26'); p(49, 14, '#1e1c26');
  // velas roxas e lápides
  for (const cx of [20, 75]) { r(cx, 40, 2, 6, '#e8e4d4'); p(cx, 38, '#c8a0ff'); p(cx, 39, '#8a6ad8'); }
  for (const [x, y, tilt] of [[6, 38, 1], [86, 38, -1]]) { r(x + tilt, y, 6, 9, '#1e1c26'); r(x + 1 + tilt, y + 1, 4, 8, '#7e7e8c'); r(x + 1 + tilt, y + 4, 4, 1, '#5a5a66'); r(x + 2 + tilt, y + 2, 2, 5, '#5a5a66'); }
}
const BAY4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
// Bosque Perdido: entrada de um labirinto de sebe. Muro de sebe aparada com topiarias nos cantos, portal de pedra
// antiga coberto de musgo com runa verde na pedra-chave, e lá dentro um corredor de sebe que vira e some na névoa
function forestGate(P) {
  const { r, p, disc } = P;
  const L = ['#081a0c', '#123216', '#1c4a1e', '#286428', '#38822f', '#52a03e', '#86c862'];
  const dith = (x, y) => BAY4[(y & 3) * 4 + (x & 3)] / 16;
  // bloco de sebe: tampo claro, frente com cachos de folha, base escura e contorno
  const hedge = (x0, x1, top, bot, seed) => {
    for (let y = top - 1; y <= bot; y++) for (let x = x0 - 1; x <= x1; x++) {
      const bump = Math.round(1.2 * Math.sin(x * 0.9 + seed) + hash(x, seed, 7));
      const t = top - bump;
      if (y < t - 1) continue;
      if (y === t - 1 || x === x0 - 1 || x === x1) { p(x, y, L[0]); continue; }
      const face = y - t < 4 ? 'top' : 'front';
      const ck = hash(Math.floor((x + (Math.floor(y / 3) & 1) * 2) / 4), Math.floor(y / 3), seed) - 0.5;
      let v = face === 'top' ? 5.6 - (y - t) * 0.3 : 3.6 - (y - t - 4) / (bot - t) * 1.8;
      v += ck * 1.1 + (dith(x, y) - 0.5) * 0.9 - ((y + 1) % 3 === 0 && face === 'front' ? 0.5 : 0) - (x - x0 < 2 ? 0.6 : 0) + (x1 - x < 2 ? -0.9 : 0);
      p(x, y, L[Math.max(1, Math.min(6, Math.round(v)))]);
    }
    for (let x = x0; x < x1; x++) p(x, bot, L[0]);
  };
  const ball = (cx, cy, rr) => {
    for (let y = cy - rr - 1; y <= cy + rr + 1; y++) for (let x = cx - rr - 1; x <= cx + rr + 1; x++) {
      const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy);
      if (d > rr + 0.6) continue;
      if (d > rr - 0.6) { p(x, y, L[0]); continue; }
      const v = 3.4 - 1.6 * (dx + dy * 1.2) / rr + (hash(x >> 1, y >> 1, 9) - 0.5) * 1.1 + (dith(x, y) - 0.5) * 0.8;
      p(x, y, L[Math.max(1, Math.min(6, Math.round(v)))]);
    }
  };
  // corredor de sebe lá dentro (perspectiva): chão de terra afunilando, paredes de sebe e um muro no fundo que faz a curva
  for (let y = -8; y < 48; y++) for (let x = 34; x < 62; x++) {
    if (y < 4 && Math.hypot((x - 48) / 15, (y - 4) / 11) > 1) continue;
    const t = Math.max(0, (y - 4) / 44), half = 3 + t * 11, d = dith(x, y);
    const dx = Math.abs(x - 48);
    let c;
    if (y < 20) c = y < 12 ? (d < 0.5 ? '#0b2a14' : '#0e3118') : (hash(x >> 1, y >> 1, 4) < 0.5 ? L[2] : L[1]);   // muro do fundo
    else if (dx < half) c = d < 0.15 + t * 0.5 ? '#6a5434' : hash(x, y, 8) < 0.25 ? '#4a6a2a' : '#4c3a22';            // trilha
    else c = L[Math.max(1, Math.min(4, Math.round(1 + t * 2.6 + (hash(x >> 1, y / 3 | 0, 6) - 0.5) * 1.2 - (dx - half) * 0.08)))];
    p(x, y, c);
  }
  r(34, 20, 28, 1, L[0]);
  // a sebe do fundo faz a curva para a direita: uma fresta de luz mostra o caminho que continua
  for (let y = -4; y < 20; y++) for (let x = 34; x < 62; x++) {
    if (Math.hypot((x - 48) / 15, (y - 4) / 11) > 1 && y < 4) continue;
    if (x >= 53 && y >= 4) { const e = (x - 53) / 9 + dith(x, y) * 0.3; p(x, y, e > 0.7 ? '#7cc890' : e > 0.35 ? '#4a9a62' : '#2e6a40'); continue; }
    const v = 2.4 + (y - 4) * 0.06 + (hash(x >> 1, y / 3 | 0, 12) - 0.5) * 1.2 - (x > 50 ? 0.8 : 0) + (dith(x, y) - 0.5) * 0.6;
    p(x, y, L[Math.max(1, Math.min(4, Math.round(v)))]);
  }
  r(52, 4, 1, 16, L[0]);
  // muros de sebe dos dois lados, mais altos nos cantos com topiaria redonda em cima
  hedge(-2, 24, 12, 47, 1); hedge(72, 98, 12, 47, 2);
  hedge(-3, 9, 2, 47, 3); hedge(87, 99, 2, 47, 4);
  ball(3, -4, 6); ball(93, -4, 6);
  // portal de pedra: dois pilares e um arco com aduelas, musgo pingando e runa na pedra-chave
  const st = ['#2a2c30', '#5a5e64', '#74797e', '#9aa0a4', '#bcc2c2'];
  for (const x0 of [24, 62]) {
    for (let y = 2; y < 48; y += 5) for (let x = x0; x < x0 + 10; x += 5) {
      const off = ((y / 5) | 0) % 2 ? 2 : 0, bx = Math.max(x0, x - off), w = Math.min(x0 + 10, x - off + 5) - bx - 1;
      r(bx, y, w + 1, 5, st[0]); r(bx, y, w, 4, hash(bx, y, 3) < 0.3 ? st[1] : st[2]); r(bx, y, w, 1, st[3]); p(bx, y, st[4]);
    }
    r(x0 - 1, 44, 12, 4, st[0]); r(x0 - 1, 44, 12, 1, st[3]); r(x0, 45, 10, 2, st[1]);   // base
    r(x0 - 1, 0, 12, 3, st[0]); r(x0 - 1, 0, 12, 1, st[3]); r(x0, 1, 10, 1, st[2]);       // capitel
  }
  for (let i = 0; i < 9; i++) {   // arco de aduelas
    const a0 = Math.PI * (i / 9), a1 = Math.PI * ((i + 1) / 9);
    for (let a = a0; a < a1; a += 0.02) for (let rr = 15; rr < 24; rr++) {
      const x = Math.round(48 - Math.cos(a) * rr), y = Math.round(4 - Math.sin(a) * rr * 0.72);
      const edge = a - a0 < 0.04 || rr === 23 || rr === 15;
      p(x, y, edge ? st[0] : rr < 17 ? st[1] : rr > 21 ? st[3] : st[2]);
    }
  }
  r(44, -16, 8, 9, st[0]); r(45, -15, 6, 7, st[3]); r(45, -15, 6, 1, st[4]);   // pedra-chave
  r(47, -14, 2, 5, '#7cff9a'); r(46, -12, 4, 1, '#7cff9a'); p(47, -14, '#e8ffe8');
  // musgo pingando do arco e dos pilares, com cipó e flores
  for (const [x, y, n] of [[28, -6, 4], [33, -11, 3], [40, -13, 5], [56, -13, 3], [62, -11, 6], [67, -6, 3], [25, 8, 5], [70, 14, 4]]) {
    r(x - 1, y, 4, 2, L[4]); p(x, y, L[6]);
    for (let k = 0; k < n; k++) p(x + (k % 3 === 2 ? 1 : 0), y + 2 + k, k % 2 ? L[3] : L[5]);
  }
  for (const [x, y, c] of [[30, -7, '#ff8ab8'], [59, -12, '#ffe08a'], [66, -7, '#c8a0ff'], [26, 10, '#9fe8ff']]) { r(x, y, 2, 2, c); p(x, y, '#ffffff'); }
  // lanternas nos pilares
  for (const lx of [21, 74]) { r(lx, 18, 1, 3, '#2a1a0c'); r(lx - 2, 21, 5, 1, '#2a1a0c'); r(lx - 2, 22, 5, 5, '#3a2a14'); r(lx - 1, 22, 3, 4, '#d8ff8a'); p(lx - 1, 22, '#ffffff'); r(lx - 2, 27, 5, 1, '#2a1a0c'); }
  // flores e cogumelos na base da sebe
  for (const [x, y, c] of [[12, 45, '#ff6b8a'], [17, 46, '#ffd93b'], [78, 46, '#c38bff'], [84, 45, '#ffffff']]) { r(x, y, 2, 1, c); p(x, y + 1, '#3a7a2a'); }
  for (const [x, y, c] of [[3, 44, '#9fe8ff'], [92, 44, '#ff8ab8']]) { r(x, y + 2, 1, 2, '#e8e0c8'); r(x - 1, y, 3, 2, c); p(x - 1, y, '#ffffff'); }
}
// Nevasca Eterna: santuário de pedra coberto de gelo, com telhado de duas águas cheio de neve, dois pilares com
// lanternas de runa azul, porta em arco e bandeirolas batendo no vento
function snowGate(P) {
  const { r, p, blocks, tri, opening, disc } = P;
  for (const [cx, cy, rad] of [[8, 50, 12], [88, 50, 12]]) { disc(cx, cy, rad, '#c4cee0'); disc(cx - 2, cy - 2, rad - 2, '#ffffff'); }
  // corpo do santuário
  blocks(18, 14, 60, 34, ['#3a4258', '#7a84a0', '#6a7290', '#a8b2cc'], 10, 5, 6);
  r(18, 14, 60, 3, '#ffffff'); for (let x = 20; x < 76; x += 3) r(x, 17, 1, 1 + ((hash(x, 4, 2) * 4) | 0), '#e4f6ff');
  // telhado de duas águas com neve grossa e beiral de gelo
  tri(48, -14, 36, 28, '#46506e', ['#8a92a8', '#2a3248']);
  for (let y = -14; y < 14; y++) { const w = Math.round(36 * (y + 15) / 28); r(48 - w, y, Math.min(w, 8), 1, '#ffffff'); r(48 - w + 1, y, 3, 1, '#e8f0ff'); }
  for (const [cx, rad] of [[24, 3], [36, 4], [60, 4], [72, 3]]) { const y = Math.round(-14 + (Math.abs(cx - 48) / 36) * 28) - 2; disc(cx, y + 2, rad, '#ffffff'); }
  for (let x = 14; x < 82; x += 3) r(x, 14, 1, 2 + ((hash(x, 9, 2) * 5) | 0), '#bfe8ff');
  // janela redonda com runa
  disc(48, 2, 4, '#2a3248'); disc(48, 2, 3, '#3a78bc'); r(47, 0, 2, 4, '#7af0ff'); r(46, 1, 4, 1, '#7af0ff');
  // pilares com lanterna de runa
  for (const x of [10, 80]) { r(x, 4, 6, 44, '#2a3248'); r(x + 1, 5, 4, 43, '#7a84a0'); r(x + 1, 5, 1, 43, '#a8b2cc'); r(x - 1, 0, 8, 5, '#2a3248'); r(x, 1, 6, 3, '#7af0ff'); p(x + 1, 1, '#ffffff'); r(x - 1, -2, 8, 2, '#ffffff'); }
  // bandeirolas
  for (const [x, c] of [[24, '#3a78bc'], [30, '#e8f0ff'], [36, '#3a78bc'], [60, '#3a78bc'], [66, '#e8f0ff'], [72, '#3a78bc']]) { r(x, 18, 3, 4, c); p(x + 1, 22, c); }
  // porta em arco do tamanho da entrada
  P.archRim(DX + 2, DY - 12, DW - 4, 28, '#a8b2cc', '#ffffff', '#46506e');
  opening(DX + 2, DY - 12, DW - 4, 28, true, '#0a1020', '#162034');
  for (let i = 0; i < 5; i++) r(DX + 7 + i * 5, DY - 10 + (i % 2) * 2, 1, 2 + (i % 2), '#e4f6ff');
  for (let i = 0; i < 4; i++) p(DX + 8 + i * 5, DY + (i * 5) % 10, '#ffffff');
}
// Labirinto das Dunas: portal de caravana em ruínas: duas torres de adobe com cúpulas, muro com ameias
// quebradas, toldo listrado sobre a porta, potes de barro e areia acumulada
function duneGate(P) {
  const { r, p, blocks, opening, disc } = P;
  const adobe = ['#704a30', '#c08a5a', '#a87448', '#e4b888'];
  // muro do meio com ameias, uma delas quebrada
  blocks(22, 10, 52, 38, adobe, 10, 5, 8);
  for (let x = 22; x < 74; x += 8) if (x !== 54) { r(x, 4, 6, 6, adobe[1]); r(x, 4, 6, 1, adobe[3]); r(x + 5, 4, 1, 6, adobe[0]); }
  r(54, 7, 4, 3, adobe[1]); r(58, 8, 2, 2, adobe[2]);
  // torres com cúpula
  for (const tx0 of [6, 72]) {
    blocks(tx0, 0, 18, 48, adobe, 6, 5, tx0);
    for (let y = -14; y < 1; y++) { const half = Math.round(Math.sqrt(Math.max(0, 100 - (y + 1) ** 2)) * 0.95); r(tx0 + 9 - half, y, half * 2, 1, '#b8743e'); r(tx0 + 9 - half, y, Math.max(1, Math.round(half * 0.6)), 1, '#e09a5a'); }
    r(tx0 + 8, -16, 2, 2, '#e0c060'); p(tx0 + 8, -17, '#fff0a0');
    r(tx0 + 6, 10, 6, 9, '#2a1a10'); for (let i = 0; i < 3; i++) r(tx0 + 7 + i, 9 - i, 4 - i * 2 > 0 ? 4 - i * 2 : 1, 1, '#2a1a10');
    r(tx0 + 7, 12, 4, 6, '#3a2410'); p(tx0 + 8, 13, '#ffd27a');
  }
  // toldo listrado sobre a porta
  for (let x = DX - 2; x < DX + DW + 2; x++) { r(x, 12, 1, 5, ((x - DX) >> 2) % 2 ? '#e8e0c8' : '#c84a3a'); p(x, 17, ((x - DX) >> 2) % 2 ? '#c8c0a8' : '#8a2a24'); }
  r(DX - 3, 11, DW + 6, 1, '#704a30');
  // porta em arco
  P.archRim(DX + 2, DY - 12, DW - 4, 28, adobe[2], adobe[3], adobe[0]);
  opening(DX + 2, DY - 12, DW - 4, 28, true, '#1a0e06', '#3a2410');
  // potes de barro e areia acumulada na porta
  for (const [px, py] of [[24, 40], [66, 41]]) { r(px, py, 6, 7, '#5a2a14'); r(px + 1, py + 1, 4, 6, '#b5653a'); r(px + 1, py + 1, 1, 4, '#e8a070'); r(px + 1, py - 1, 4, 1, '#5a2a14'); }
  for (let i = 0; i < 3; i++) r(DX + 4 + i * 8, 45 - (i % 2), 7, 3, '#e4a66c');
}


// ---------------------------------------------------------------- grutas
// Cada gruta tem formato e acabamento próprios. Tudo é desenhado só onde há rocha de verdade: a linha de cima
// inteira (colunas 13-17) e, embaixo, os dois pilares e a boca (colunas 14-16); as bordas são arredondadas
// dentro dessa área, então não aparece corte reto. A boca fica exatamente no tile de entrada (centro, embaixo).
const PALS = {
  moss: ['#1e261c', '#3e4a38', '#566450', '#6e8066', '#90a484'],
  dirt: ['#2a1a10', '#5a3a22', '#7a5232', '#9a6a40', '#bc8a5a'],
  crypt: ['#16161e', '#3a3a46', '#50505e', '#6a6a7a', '#8e8e9e'],
  swamp: ['#1a2014', '#36402a', '#4a5838', '#5e7046', '#7a8e5a'],
  mine: ['#2a2018', '#5a4632', '#76604a', '#947a5e', '#b49a7a'],
  tide: ['#162430', '#365066', '#4e6e86', '#6e90a8', '#98b8cc'],
  lava: ['#200c08', '#4a1e14', '#6a2e1c', '#8a3e24', '#aa5a34'],
  ice: ['#2a3a58', '#5a7aa0', '#7ea2c8', '#a8cce8', '#e4f6ff'],
};
// maciço de rocha: silhueta = união de círculos; dentro, pedras encaixadas (Voronoi) com luz do alto à esquerda
function rockMass(P, lobes, K, x0, x1, y0, y1) {
  const { p } = P;
  const inside = (x, y) => lobes.some(([cx, cy, rad]) => (x - cx) ** 2 + (y - cy) ** 2 <= rad * rad);
  const seeds = [];
  for (let gy = y0 - 8; gy < y1 + 8; gy += 7) for (let gx = x0 - 8; gx < x1 + 8; gx += 8) seeds.push([gx + hash(gx, gy, 71) * 7, gy + hash(gx, gy, 72) * 6, hash(gx, gy, 73)]);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    if (!inside(x + 0.5, y + 0.5)) continue;
    if (!inside(x - 0.5, y + 0.5) || !inside(x + 1.5, y + 0.5) || !inside(x + 0.5, y - 0.5) || !inside(x + 0.5, y + 1.5)) { p(x, y, K[0]); continue; }
    let b = null, bd = 1e9, sd = 1e9;
    for (const sp of seeds) { const d = (x - sp[0]) ** 2 + (y - sp[1]) ** 2; if (d < bd) { sd = bd; bd = d; b = sp; } else if (d < sd) sd = d; }
    if (Math.sqrt(sd) - Math.sqrt(bd) < 0.9) { p(x, y, K[0]); continue; }
    const lit = -((x - b[0]) * 0.6 + (y - b[1]) * 0.8) / 5 + (b[2] - 0.5) * 0.6 - (y - y0) / (y1 - y0) * 0.8;
    p(x, y, lit > 0.45 ? K[4] : lit > 0.05 ? K[3] : lit > -0.4 ? K[2] : K[1]);
  }
}
// cristal facetado e inclinado: ponta em cima, face clara à esquerda, escura à direita, contorno escuro e brilho
function shard(P, bx, by, h, w, lean, pal) {
  const { p } = P, [c, hi, dk] = pal, tip = Math.max(2, Math.round(w * 0.8));
  const rows = [];
  for (let i = 0; i < h; i++) { const ww = i < tip ? Math.max(1, Math.round(w * (i + 1) / tip)) : w, cx = bx + Math.round(lean * (h - i) / h); rows.push([cx - (ww >> 1), ww, by - h + i]); }
  for (const [x, ww, y] of rows) { p(x - 1, y, dk); p(x + ww, y, dk); }
  p(rows[0][0], rows[0][2] - 1, dk);
  for (const [x, ww, y] of rows) for (let k = 0; k < ww; k++) p(x + k, y, k < ww / 2 ? hi : k === ww - 1 ? dk : c);
  const mid = rows[Math.min(rows.length - 1, tip + 1)]; if (mid) for (let i = tip; i < h - 1; i++) p(rows[i][0] + 1, rows[i][2], '#ffffff');
}
// boca escura em arco com estalactites e olhinhos
function caveHole(P, w = 8, lip = '#1e1e26', teeth = '#3a3a46') {
  const { r, p } = P;
  for (let yy = 32 - 18; yy < 32; yy++) { const half = yy < 22 ? Math.round(Math.sqrt(Math.max(0, w * w - (22 - yy) ** 2))) : w; r(40 - half - 1, yy, half * 2 + 2, 1, lip); r(40 - half, yy, half * 2, 1, yy > 28 ? '#1a1424' : '#07060c'); }
  for (const [sx, L] of [[35, 3], [38, 2], [42, 4], [45, 2]]) if (Math.abs(sx - 40) < w) { r(sx, 15, 1, L, teeth); }
  p(37, 24, '#ffe08a'); p(43, 24, '#ffe08a');
}
const clumps = (P, pts, c1, c2) => { for (const [x, y, n] of pts) { P.disc(x, y, n, c1); P.disc(x - 1, y - 1, Math.max(1, n - 1), c2); } };
function caveMouth(P, theme, id) {
  const { r, p, disc } = P;
  switch (id) {
    case 'cv1': { // Gruta do Vale: colina de pedra musgosa com uma árvore crescendo em cima e hera na boca
      rockMass(P, [[40, 6, 20], [14, 6, 10], [66, 6, 10], [40, 22, 14]], PALS.moss, 0, 80, -16, 32);
      clumps(P, [[22, -4, 4], [36, -10, 5], [52, -8, 4], [62, -2, 3], [12, 0, 3]], '#2f6a2f', '#4c9a43');
      r(55, -6, 3, 6, '#5b3a22'); disc(56, -9, 6, '#1a3e20'); disc(56, -9, 5, '#2f7a30'); disc(54, -11, 2, '#4c9a43');
      caveHole(P, 8);
      for (let k = 0; k < 5; k++) { const x = 32 + k * 4, L = 3 + (k % 3) * 2; r(x, 13, 1, L, '#3a7a2a'); p(x, 13 + L, '#7cc45e'); }
      break;
    }
    case 'cv2': { // Toca da Raposa: morro de terra com capim no alto, raízes e toca redonda
      rockMass(P, [[40, 10, 18], [20, 8, 10], [60, 8, 10], [40, 24, 13]], PALS.dirt, 0, 80, -16, 32);
      for (let x = 12; x < 70; x += 2) { const top = 10 - Math.round(Math.sqrt(Math.max(0, 324 - (x - 40) ** 2))); r(x, top - 1, 2, 2, '#4c9a43'); if (x % 6 === 0) r(x, top - 3, 1, 2, '#7cc45e'); }
      for (const [x0, dir] of [[26, -1], [54, 1]]) for (let i = 0; i < 8; i++) p(x0 + dir * i, 12 + Math.round(i * 0.7), '#3a2410');
      caveHole(P, 7, '#3a2410', '#5a3a22');
      r(30, 28, 3, 2, '#e8e0c8'); r(48, 29, 2, 1, '#e8e0c8');   // ossinhos na entrada
      break;
    }
    case 'cv3': { // Cripta Rasa: rochedo escuro com lápides tortas, caveira na chave do arco e velas roxas
      rockMass(P, [[40, 4, 18], [16, 8, 9], [64, 8, 9], [40, 22, 14], [28, -6, 8], [52, -6, 8]], PALS.crypt, 0, 80, -16, 32);
      for (const [x, y, tilt] of [[12, -2, 0], [64, -4, 1], [24, -12, 0]]) { r(x + tilt, y, 6, 8, '#2a2a34'); r(x + 1 + tilt, y + 1, 4, 7, '#7e7e8c'); r(x + 2 + tilt, y + 2, 2, 4, '#5a5a66'); r(x + 1 + tilt, y + 3, 4, 1, '#5a5a66'); }
      r(37, 4, 6, 5, '#e8e4d4'); p(38, 6, '#16161e'); p(41, 6, '#16161e'); r(38, 9, 4, 1, '#c8c4b4');
      caveHole(P, 8, '#16161e', '#3a3a46');
      for (const cx of [24, 55]) { r(cx, 22, 2, 6, '#e8e4d4'); p(cx, 20, '#c8a0ff'); p(cx, 21, '#8a6ad8'); }
      break;
    }
    case 'cv4': { // Caverna do Brejo: raízes retorcidas de um mangue gigante formando o arco, lodo e cogumelos
      rockMass(P, [[40, 8, 18], [16, 8, 9], [64, 8, 9], [40, 22, 13]], PALS.swamp, 0, 80, -16, 32);
      disc(40, -4, 12, '#1c2a12'); disc(40, -4, 11, '#3a5a2a'); disc(36, -7, 7, '#4e7a3a'); disc(32, -9, 3, '#6e9a4e');
      for (const [x0, dx] of [[28, -1], [34, -1], [46, 1], [52, 1]]) for (let i = 0; i < 18; i++) { const x = x0 + Math.round(dx * i * 0.5), y = -2 + i; r(x, y, 2, 1, '#4a3a24'); p(x, y, '#6a5a34'); }
      caveHole(P, 8, '#1a2014', '#36402a');
      for (let x = 26; x < 56; x += 3) { const L = 1 + ((hash(x, 9, 1) * 4) | 0); r(x, 13, 1, L, '#5aa83a'); p(x, 13 + L, '#8ad85a'); }
      for (const [mx, my] of [[18, 10], [62, 9]]) { r(mx, my, 4, 2, '#c8443a'); p(mx + 1, my, '#ffffff'); r(mx + 1, my + 2, 2, 2, '#e8e0c8'); }
      break;
    }
    case 'cv5': { // Mina Esquecida: paredão quebrado com boca escorada, tábuas pregadas e lampião
      rockMass(P, [[40, 6, 22], [12, 6, 11], [68, 6, 11], [40, 24, 14]], PALS.mine, 0, 80, -16, 32);
      caveHole(P, 8, '#2a1a10', '#5a4632');
      r(30, 12, 20, 3, '#6a4626'); r(30, 12, 20, 1, '#a8743e'); for (const x of [30, 47]) { r(x, 15, 3, 17, '#6a4626'); r(x, 15, 1, 17, '#a8743e'); }
      r(22, 8, 1, 4, '#3a3a48'); r(20, 12, 5, 5, '#2a2a34'); r(21, 13, 3, 3, '#ffd27a'); p(21, 13, '#fff6d0');
      r(56, 0, 12, 5, '#8a5a30'); r(57, 1, 10, 3, '#c8945c'); r(58, 2, 3, 1, '#3a2410'); r(62, 2, 4, 1, '#3a2410');
      break;
    }
    case 'cv6': { // Gruta das Marés: arco de pedra do mar com cracas, corais, estrela-do-mar e água pingando
      rockMass(P, [[40, 6, 19], [14, 8, 9], [66, 8, 9], [24, 20, 8], [56, 20, 8]], PALS.tide, 0, 80, -16, 32);
      for (let i = 0; i < 16; i++) { const x = 6 + (i * 23) % 68, y = -6 + (i * 11) % 18; r(x, y, 2, 2, '#e8e4d4'); p(x, y, '#ffffff'); }   // cracas
      for (const [cx, cy, c] of [[12, 4, '#e0507a'], [68, 2, '#e8803a'], [22, -8, '#3ab8a8'], [58, -10, '#8a5ad0']]) { r(cx, cy, 2, 6, c); r(cx - 2, cy + 2, 2, 3, c); r(cx + 2, cy + 1, 2, 3, c); p(cx, cy, '#ffffff'); }
      r(48, -4, 5, 1, '#ff8a6a'); r(50, -6, 1, 5, '#ff8a6a');
      caveHole(P, 9, '#162430', '#365066');
      for (const x of [34, 41, 47]) r(x, 16 + (x % 3), 1, 2, '#9fdcff');
      break;
    }
    case 'cv7': { // Caverna Escaldante: rocha vulcânica com rachaduras de lava brilhando e fumacinha
      rockMass(P, [[40, 4, 20], [16, 8, 10], [64, 8, 10], [40, 22, 14]], PALS.lava, 0, 80, -16, 32);
      for (const pts of [[[20, -4], [24, 0], [22, 4], [26, 8]], [[56, -6], [52, -1], [56, 3], [54, 8]], [[40, -12], [38, -7], [42, -3]]]) for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; for (let k = 0; k <= 6; k++) { const x = Math.round(x0 + (x1 - x0) * k / 6), y = Math.round(y0 + (y1 - y0) * k / 6); r(x, y, 2, 1, '#ff8a1e'); p(x, y, '#ffd23a'); } }
      caveHole(P, 8, '#200c08', '#4a1e14');
      r(32, 28, 16, 3, '#ff6a1e'); r(34, 28, 12, 1, '#ffd23a');   // brilho de lava lá dentro
      for (let i = 0; i < 3; i++) { r(30 + i * 9, -10 - i, 3, 2, '#5a4a4a'); r(31 + i * 9, -12 - i, 2, 2, '#7a6a6a'); }
      break;
    }
    case 'lac': { // grutas de Lacrímora: rocha violeta com veios de cristal ciano e cogumelos que brilham
      rockMass(P, [[40, 6, 19], [14, 8, 10], [66, 8, 10], [40, 22, 13]], ['#1a1430', '#3a2e5a', '#4e4078', '#665896', '#8a7cb8'], 0, 80, -16, 32);
      const LC = ['#2a9ac0', '#c8f8ff', '#0c3448'], LV = ['#8a4ad0', '#e0c8ff', '#2a1048'];
      shard(P, 20, 2, 12, 4, -2, LC); shard(P, 60, 2, 12, 4, 2, LV); shard(P, 40, 0, 14, 5, 0, LC);
      for (const pts of [[[10, -2], [16, 4], [14, 9]], [[66, -4], [62, 2], [68, 8]]]) for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; for (let k = 0; k <= 5; k++) p(Math.round(x0 + (x1 - x0) * k / 5), Math.round(y0 + (y1 - y0) * k / 5), '#7af0ff'); }
      caveHole(P, 8, '#1a1430', '#4e4078');
      for (const [mx, my, c] of [[24, 12, '#d8a7df'], [56, 12, '#7af0ff']]) { r(mx, my, 4, 2, c); p(mx + 1, my, '#ffffff'); r(mx + 1, my + 2, 2, 2, '#e8e0f0'); }
      break;
    }
    case 'cv8': default: { // Gruta de Cristal: caverna de gelo com cristais pontudos saindo do alto e pingentes
      rockMass(P, [[40, 8, 19], [14, 8, 10], [66, 8, 10], [40, 22, 13]], PALS.ice, 0, 80, -16, 32);
      const IC = ['#7ac8f0', '#e4f6ff', '#2a5a8a'];
      shard(P, 22, 2, 16, 5, -3, IC); shard(P, 40, 0, 15, 6, 0, IC); shard(P, 58, 2, 15, 5, 3, IC); shard(P, 12, 6, 9, 4, -2, IC); shard(P, 68, 6, 9, 4, 2, IC);
      caveHole(P, 8, '#2a3a58', '#a8cce8');
      for (let x = 30; x < 52; x += 3) r(x, 13, 1, 2 + (x % 4), '#e4f6ff');
      r(0, 14, 16, 2, '#ffffff'); r(64, 14, 16, 2, '#ffffff');
      break;
    }
  }
}
// ---------------------------------------------------------------- Lua
// Cratera do Eco: domo da base lunar meio enterrado na rocha, com antena alta e luzes de pista
function moonCrater(P) {
  const { r, p, opening, disc } = P;
  for (const [cx, cy, rad] of [[10, 40, 14], [86, 40, 14]]) { disc(cx, cy, rad, '#72768e'); disc(cx - 2, cy - 2, rad - 4, '#8e92aa'); }
  // domo
  for (let y = -6; y < 42; y++) { const half = Math.round(Math.sqrt(Math.max(0, 40 * 40 - (y - 42) * (y - 42)))); if (!half) continue; r(48 - half, y, half * 2, 1, '#3e4258'); r(48 - half + 1, y, half * 2 - 2, 1, '#c4cadc'); r(48 - half + 2, y, Math.round(half * 0.55), 1, '#e6ecf6'); r(48 + half - Math.round(half * 0.3), y, Math.round(half * 0.3) - 1, 1, '#9aa2ba'); }
  for (let k = -3; k <= 3; k++) { const xx = 48 + k * 11; for (let y = 2 + Math.abs(k) * 3; y < 42; y++) p(xx, y, '#9aa2ba'); }
  for (let y = 10; y < 42; y += 10) r(10, y, 76, 1, '#9aa2ba');
  for (const [wx, wy] of [[24, 18], [64, 18], [36, 8], [56, 8]]) { r(wx, wy, 6, 4, '#1c2030'); r(wx + 1, wy + 1, 4, 2, '#7fd3ff'); p(wx + 1, wy + 1, '#ffffff'); }
  r(0, 42, 96, 6, '#8e92aa'); r(0, 42, 96, 1, '#b4b8cc');
  // antena alta passando do bloco
  r(80, -16, 1, 30, '#c8c8d8'); r(74, -16, 13, 2, '#e8e8f2'); r(76, -10, 9, 1, '#c8c8d8'); p(80, -18, '#7af0ff'); p(80, -17, '#7af0ff');
  // comporta
  P.archRim(DX, DY - 12, DW, 28, '#9aa2ba', '#e6ecf6', '#5a6280');
  opening(DX, DY - 12, DW, 28, true, '#05060e', '#10121e');
  r(DX + 2, DY + 12, DW - 4, 2, '#2a2e44'); for (let k = DX + 4; k < DX + DW - 4; k += 6) r(k, DY + 12, 3, 1, '#ffd23a');
  for (let i = 0; i < 4; i++) { r(DX - 4, DY - 4 + i * 5, 2, 2, '#7af0ff'); r(DX + DW + 2, DY - 4 + i * 5, 2, 2, '#7af0ff'); }
}
// Mina de Cristal: morro de rocha lunar com cachos de cristais inclinados saindo das fendas, boca escorada
// com vigas de metal, brilho violeta lá dentro, trilhos e um carrinho de minério
function moonMine(P) {
  const { r, p } = P;
  const K = ['#1e1e34', '#3e3e66', '#50508a', '#6a6aa8', '#8a8ac8'];
  rockMass(P, [[10, 32, 16], [86, 32, 16], [28, 14, 16], [68, 14, 16], [48, 4, 18], [48, 28, 22]], K, -4, 100, -16, 48);
  const V = ['#8a4ad0', '#e0c8ff', '#2a1048'], C = ['#2a9ac0', '#c8f8ff', '#0c3448'];
  // cachos de cristais (cada um com 3 pontas de tamanhos e inclinações diferentes)
  const cluster = (x, y, s2, pal) => { shard(P, x - 4, y, Math.round(12 * s2), 4, -3, pal); shard(P, x + 5, y, Math.round(11 * s2), 4, 3, pal); shard(P, x, y + 1, Math.round(18 * s2), 6, 0, pal); };
  cluster(12, 40, 1.4, V); cluster(84, 40, 1.4, C); cluster(48, 2, 1, V); cluster(26, 14, 0.8, C); cluster(70, 14, 0.8, V);
  // boca escorada com vigas de metal
  for (let yy = 14; yy < 48; yy++) { const half = yy < 26 ? Math.round(Math.sqrt(Math.max(0, 144 - (26 - yy) ** 2))) + 1 : 13; r(48 - half, yy, half * 2, 1, yy > 42 ? '#14102a' : '#07061a'); }
  r(34, 18, 28, 3, '#8a92b4'); r(34, 18, 28, 1, '#c8d0e8'); for (const x of [34, 59]) { r(x, 21, 3, 27, '#8a92b4'); r(x, 21, 1, 27, '#c8d0e8'); p(x + 1, 26, '#4a5070'); p(x + 1, 36, '#4a5070'); }
  r(40, 30, 16, 1, '#6a4ad8'); r(42, 33, 12, 1, '#4a2a9a'); p(44, 26, '#e0c8ff'); p(52, 28, '#c8f8ff');
  for (let k = 0; k < 5; k++) r(40 - k, 36 + k * 3, 16 + k * 2, 1, '#5a4a3a');
  for (let yy = 34; yy < 48; yy++) { p(41 - Math.round((yy - 34) * 0.35), yy, '#c8ccd8'); p(54 + Math.round((yy - 34) * 0.35), yy, '#c8ccd8'); }
  r(66, 40, 14, 7, '#1c2030'); r(67, 41, 12, 5, '#7480a6'); r(67, 41, 12, 1, '#b4bed6'); shard(P, 71, 41, 6, 3, 0, V); shard(P, 76, 41, 5, 3, 1, C);
}
// Castelo Lunar: fortaleza prateada com torres finas e altas, ameias, bandeiras e a Lua crescente no portão
function moonCastle(P) {
  const { r, p, blocks, tri, opening } = P;
  for (const [cx, top, w] of [[8, -6, 12], [88, -6, 12], [28, 0, 10], [68, 0, 10]]) {
    blocks(cx - w / 2, top + 8, w, 48 - top - 8, ['#3e3e66', '#9a9ac4', '#7c7ca8', '#c8c8e8'], 6, 4, cx);
    tri(cx, top - 4, w / 2 + 2, 12, '#5a4aa8', ['#8a7ad8', '#2e2668']);
    r(cx - 1, top + 12, 2, 5, '#2a2a4a'); p(cx - 1, top + 13, '#7af0ff');
    r(cx, top - 10, 1, 6, '#c8c8e8'); r(cx + 1, top - 10, 4, 3, '#e8c060');
  }
  blocks(14, 12, 68, 36, ['#3e3e66', '#8a8ab4', '#6c6c98', '#b0b0d8'], 10, 5, 11);
  for (let x = 16; x < 80; x += 8) { r(x, 8, 5, 4, '#8a8ab4'); r(x, 8, 5, 1, '#c8c8e8'); }
  P.archRim(DX, DY - 14, DW, 30, '#6c6c98', '#e8e8ff', '#3e3e66');
  opening(DX, DY - 14, DW, 30, true, '#06061a', '#12122c');
  for (let x = DX + 4; x < DX + DW - 3; x += 6) r(x, DY - 13, 2, 1, '#b0b0d8');   // grade erguida
  P.disc(48, 14, 5, '#e8c060'); P.disc(50, 13, 4, '#8a8ab4'); p(45, 12, '#fff2b0');
  for (const x of [20, 74]) { r(x, 18, 1, 16, '#c8c8e8'); r(x + 1, 18, 5, 8, '#5a4aa8'); r(x + 1, 18, 5, 1, '#8a7ad8'); p(x + 3, 21, '#fff2b0'); }
}
// fundo que preenche o bloco inteiro (atrás da construção): mata fechada, rocha ou neve, nada que pareça chão
function backdrop(P, kind) {
  const { r, disc } = P;
  const lobes = (pal, seed) => {
    r(0, 0, W, H, pal[0]);
    for (let i = 0; i < 26; i++) { const cx = (i * 37 + seed * 11) % 100 - 2, cy = (i * 23 + seed * 7) % 52 - 2, rad = 6 + (i % 4) * 2; disc(cx, cy, rad, pal[1]); disc(cx - 1, cy - 1, rad - 2, pal[2]); disc(cx - 2, cy - 3, Math.max(1, rad - 5), pal[3]); }
  };
  const rocks = (pal, seed) => {
    r(0, 0, W, H, pal[0]);
    for (let row = 0; row < 10; row++) for (let x = -((row * 7 + seed) % 11); x < W; x += 9 + (row % 3)) { const w = 8 + ((hash(x, row + seed, 3) * 4) | 0); r(Math.max(0, x), row * 5, w, 4, hash(x, row, 4 + seed) < 0.35 ? pal[1] : pal[2]); r(Math.max(0, x), row * 5, w, 1, pal[3]); }
  };
  if (kind === 'leaf') lobes(['#14301a', '#1a3e20', '#245524', '#356e34'], 1);
  else if (kind === 'dark') lobes(['#16141e', '#22202e', '#2c2a3a', '#3a3848'], 2);
  else if (kind === 'swamp') lobes(['#1c2a12', '#2a4220', '#3a5a2a', '#4e7a3a'], 3);
  else if (kind === 'sand') rocks(['#704a30', '#a86a4a', '#c08a5a', '#d8a476'], 4);
  else if (kind === 'coast') rocks(['#6a6458', '#9a9488', '#b0aa9c', '#d4cebe'], 5);
  else if (kind === 'snow') rocks(['#8a92a8', '#c4cee0', '#dfe6f2', '#ffffff'], 6);
  else if (kind === 'moon') rocks(['#50546c', '#72768e', '#8a8ea6', '#b4b8cc'], 7);
}
const BACK = { d1: 'leaf', 'lost-bosque': 'leaf', d2: 'dark', 'lost-cemiterio': 'dark', d3: 'swamp', d5: 'coast', d6: 'sand', 'lost-dunas': 'sand', d7: 'snow', 'lost-nevasca': 'snow', mk1: 'moon', mc: 'moon', mk2: 'moon' };

const ART = {
  d1: rootTemple, d2: cryptTemple, d3: swampTemple, d4: mineTemple, d5: tideTemple, d6: sunTemple, d7: iceTemple,
  'lost-cemiterio': cemeteryGate, 'lost-bosque': forestGate, 'lost-nevasca': snowGate, 'lost-dunas': duneGate,
  mk1: moonCrater, mk2: moonMine, mc: moonCastle,
};
// ---------------------------------------------------------------- construções maiores (10x4 tiles)
// Cada castelo ocupa as colunas 5-14 e as linhas 1-4 da tela (toda essa área é sólida no mapa). O corpo principal fica
// no meio (onde sempre esteve) e estas partes completam a construção para os lados e para cima, sem nada cortado.
// Coordenadas locais: 0-160 x 0-64; o corpo principal ocupa x 32-128, y 16-64.
const BW = 160, BH = 64;
const leafy = (P, lobes, pal) => {
  const { disc, p } = P;
  for (const [x, y, rr] of lobes) disc(x, y, rr + 1, pal[0]);
  for (const [x, y, rr] of lobes) { disc(x, y, rr, pal[1]); disc(x - 1, y - 1, rr - 2, pal[2]); disc(x - 3, y - 3, Math.max(2, rr - 6), pal[3]); }
  for (const [x, y, rr] of lobes) for (let i = 0; i < rr; i++) { const a = hash(x, i, 5) * 6.28, d = hash(i, y, 6) * rr * 0.8; p(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d), hash(i, x, 7) < 0.5 ? pal[4] : pal[0]); }
};
const flame = (P, x, y) => { const { r, p } = P; r(x - 1, y - 3, 3, 3, '#ff8a2a'); r(x, y - 5, 1, 3, '#ffd060'); p(x, y - 2, '#fff6c0'); };
function rootsExt(P) {
  const { r, p, disc } = P;
  const bark = ['#1e1208', '#3a2412', '#5a3a1e', '#7a5230', '#9a6e40'];
  leafy(P, [[14, 10, 12], [36, 4, 12], [124, 4, 12], [146, 10, 12], [60, 2, 10], [100, 2, 10]], ['#0a1e0e', '#17401c', '#215a26', '#2f7432', '#78bc5c']);
  // raízes grossas saindo da base e se espalhando
  for (const [sx, dir, yb, th] of [[44, -1, 60, 5], [40, -1, 52, 4], [116, 1, 60, 5], [120, 1, 52, 4]]) for (let i = 0; i < 44; i++) {
    const x = sx + dir * i, y = yb + Math.round(Math.sin(i / 7) * 2) + Math.round(i * 0.06), w = Math.max(2, th - Math.floor(i / 12));
    if (x < 0 || x >= BW) continue;
    r(x, y - w, 1, w + 1, bark[0]); r(x, y - w + 1, 1, w - 1, bark[2]); p(x, y - w + 1, bark[4]);
  }
  // casinhas-cogumelo dos dois lados, com porta redonda acesa
  for (const cx of [17, 143]) {
    r(cx - 8, 40, 16, 24, bark[0]); r(cx - 7, 40, 14, 24, '#d8c8a0'); r(cx - 7, 40, 4, 24, '#ece0c0'); r(cx + 4, 40, 3, 24, '#b4a27a');
    disc(cx, 58, 4, '#2a1a0c'); r(cx - 4, 58, 8, 6, '#2a1a0c'); disc(cx, 58, 3, '#ffb84a'); r(cx - 3, 58, 6, 6, '#ffb84a'); p(cx, 57, '#fff0c0');
    r(cx - 5, 46, 4, 4, '#2a1a0c'); r(cx - 4, 47, 2, 2, '#ffd27a');
    for (let y = 0; y < 16; y++) { const hw = Math.round(Math.sqrt(Math.max(0, 1 - ((16 - y) / 16) ** 2)) * 17); r(cx - hw - 1, 26 + y, hw * 2 + 2, 1, '#3a0e0e'); r(cx - hw, 26 + y, hw * 2, 1, y < 4 ? '#e04a3a' : '#b8322a'); r(cx - hw, 26 + y, Math.max(1, hw / 2), 1, '#ff6a52'); }
    r(cx - 17, 42, 34, 2, '#7a1e18');
    for (const [dx, dy, rr] of [[-8, 33, 2], [3, 30, 2], [9, 36, 1], [-1, 37, 1], [-13, 39, 1]]) disc(cx + dx, dy, rr, '#fff4e4');
  }
  for (const [x, y] of [[30, 30], [128, 26], [8, 22], [152, 30], [70, 6]]) { p(x, y, '#d8ff8a'); p(x + 1, y, '#fffbc0'); }
}
function cryptExt(P) {
  const { r, p, blocks, tri, disc } = P;
  const pal = ['#16161e', '#50505e', '#3a3a46', '#7a7a8a'];
  for (const [x0, dir] of [[2, 1], [124, -1]]) {
    blocks(x0, 28, 34, 36, pal, 8, 4, x0);
    tri(x0 + 17, 10, 19, 18, '#2a2a34', ['#5a5a66', '#16161e']);
    for (let i = 0; i < 18; i += 3) p(x0 + 17 - Math.round(19 * i / 18), 10 + i, '#6a6a7a');
    // vitral em ogiva
    const wx = x0 + 12; r(wx - 1, 34, 12, 18, pal[0]); for (let y = 0; y < 17; y++) { const hw = y < 5 ? Math.round(5 * Math.sqrt(y / 5)) : 5; r(wx + 5 - hw, 35 + y, hw * 2, 1, y % 5 === 4 ? '#3a2a5a' : '#8a5ad8'); }
    r(wx + 5, 35, 1, 17, '#2a1a3a'); p(wx + 3, 40, '#e0c8ff'); p(wx + 7, 46, '#e0c8ff');
    // pináculo na ponta de fora e arcobotante até o corpo principal
    const px = dir > 0 ? x0 + 1 : x0 + 27; r(px, 0, 6, 64, pal[0]); r(px + 1, 2, 4, 62, pal[1]); r(px + 1, 2, 1, 62, pal[3]); tri(px + 3, -14, 4, 14, '#2a2a34'); p(px + 3, -15, '#8a8a9e');
    for (let i = 0; i < 9; i++) { const x = dir > 0 ? x0 + 30 + i : x0 + 4 - i, y = 22 - Math.round(Math.sin((i / 8) * 1.5) * 6); r(x, y, 1, 3, pal[0]); p(x, y + 1, pal[3]); }
    // gárgula
    const gx = dir > 0 ? x0 + 30 : x0 + 2; r(gx, 26, 4, 3, '#2a2a34'); p(gx + (dir > 0 ? 3 : 0), 27, '#c8a0ff');
    // velas e lápides na frente
    r(x0 + 6 + (dir > 0 ? 0 : 16), 58, 2, 6, '#e8e4d4'); p(x0 + 6 + (dir > 0 ? 0 : 16), 56, '#c8a0ff');
  }
}
function swampExt(P) {
  const { r, p, tri, disc } = P;
  // água parada embaixo das palafitas
  for (const [a, b] of [[0, 36], [124, 160]]) { r(a, 56, b - a, 8, '#26361e'); for (let x = a; x < b; x += 5) r(x, 58 + (x % 3), 3, 1, '#4a6a3a'); }
  for (const cx of [17, 143]) {
    for (const sx of [-8, -1, 7]) { r(cx + sx, 40, 2, 22, '#2a1a0c'); r(cx + sx, 40, 1, 22, '#6a4a2a'); }
    r(cx - 11, 38, 22, 3, '#3a2a18'); r(cx - 11, 38, 22, 1, '#8a6a3e');
    r(cx - 9, 24, 18, 14, '#2a1a0c'); r(cx - 8, 25, 16, 13, '#6a4a2a'); for (let x = cx - 8; x < cx + 8; x += 3) r(x, 25, 1, 13, '#4a3220');
    r(cx - 2, 29, 5, 9, '#1a1008'); r(cx - 1, 30, 3, 8, '#ffb84a');
    for (let y = 0; y < 16; y++) { const hw = Math.round((y + 1) * 13 / 16); r(cx - hw, 9 + y, hw * 2, 1, y % 3 === 2 ? '#6a5a2a' : '#9a8a4a'); p(cx - hw, 9 + y, '#3a3018'); p(cx + hw - 1, 9 + y, '#3a3018'); }
    for (let i = 0; i < 9; i++) r(cx - 12 + i * 3, 25, 1, 2 + (i % 3), '#7a6a3a');
    p(cx, 8, '#c8b060');
  }
  // pontes de corda até a cabana principal
  for (const [x0, x1] of [[28, 44], [116, 132]]) for (let x = x0; x <= x1; x++) { const t = (x - x0) / (x1 - x0), y = 38 + Math.round(Math.sin(t * Math.PI) * 4); p(x, y - 4, '#c8a868'); r(x, y, 1, 2, x % 3 ? '#6a4a2a' : '#2a1a0c'); }
  for (const lx of [36, 124]) { r(lx, 30, 1, 4, '#2a1a0c'); r(lx - 1, 34, 3, 3, '#8ad85a'); p(lx, 35, '#e8ffd0'); }
}
function mineExt(P) {
  const { r, p, disc } = P;
  // torre de extração com roda encostada no paredão
  const tx = 10; for (const x of [tx, tx + 18]) { r(x, 10, 3, 54, '#2a1a0c'); r(x + 1, 10, 1, 54, '#8a6238'); }
  for (let y = 16; y < 60; y += 10) { for (let i = 0; i < 18; i++) p(tx + 2 + i, y + Math.round(i * 0.5), '#5a3a1e'); r(tx, y, 21, 2, '#3a2412'); }
  disc(tx + 10, 8, 8, '#2a1a0c'); disc(tx + 10, 8, 6, '#6a4a2a'); disc(tx + 10, 8, 4, '#2a1a0c'); for (let a = 0; a < 6; a++) { const ang = a * Math.PI / 3; r(tx + 10 + Math.round(Math.cos(ang) * 5), 8 + Math.round(Math.sin(ang) * 5), 1, 1, '#9a7448'); }
  r(tx + 9, 8, 2, 2, '#c8c8c8'); r(tx + 10, 10, 1, 40, '#b8bccc');
  // plataforma de tábuas com vagonete de minério do outro lado
  r(126, 50, 30, 3, '#3a2412'); r(126, 50, 30, 1, '#9a7448'); for (const x of [128, 152]) r(x, 53, 2, 11, '#3a2412');
  r(132, 40, 18, 10, '#2a2a30'); r(133, 41, 16, 8, '#5a5a66'); r(133, 41, 16, 1, '#8a8a96'); disc(136, 51, 2, '#1a1a1e'); disc(146, 51, 2, '#1a1a1e');
  for (const [x, c] of [[135, '#c060ff'], [139, '#ffd060'], [143, '#60e0ff'], [146, '#c060ff']]) { r(x, 37, 3, 3, c); p(x, 37, '#ffffff'); }
  r(140, 22, 10, 8, '#6a4a2a'); r(140, 22, 10, 1, '#9a7448'); r(144, 22, 1, 8, '#3a2412');
}
function tideExt(P) {
  const { r, p, disc } = P;
  for (const [x0, dir] of [[2, 1], [124, -1]]) {
    r(x0, 60, 34, 4, '#8aa0b0'); r(x0, 60, 34, 1, '#d0dee4');
    r(x0, 22, 34, 6, '#c8d6dc'); r(x0, 22, 34, 1, '#ffffff'); r(x0, 27, 34, 1, '#7890a0');
    for (let i = 0; i < 4; i++) { const cx = x0 + 3 + i * 9; r(cx, 28, 5, 32, '#6e8496'); r(cx + 1, 28, 3, 32, '#e4eef2'); r(cx + 1, 28, 1, 32, '#ffffff'); r(cx - 1, 28, 7, 2, '#b0c4cc'); r(cx - 1, 58, 7, 2, '#b0c4cc'); }
    // cúpula azul na ponta
    const dx = dir > 0 ? x0 + 8 : x0 + 26; for (let y = 0; y < 12; y++) { const hw = Math.round(Math.sqrt(Math.max(0, 144 - (12 - y) ** 2)) * 0.9); r(dx - hw, 10 + y, hw * 2, 1, '#2a6aa8'); r(dx - hw, 10 + y, Math.round(hw * 0.7), 1, '#4a9ad8'); }
    r(dx - 1, 4, 2, 6, '#e0c060'); p(dx - 1, 3, '#fff0a0');
    for (const [sx, c] of [[x0 + 8, '#ffb0c0'], [x0 + 20, '#ffffff'], [x0 + 28, '#ffd0a0']]) { r(sx, 61, 3, 2, c); p(sx + 1, 60, c); }
    for (let i = 0; i < 4; i++) r(x0 + 2 + i * 9, 50 + (i % 2) * 3, 1, 10 - (i % 2) * 3, '#3a8a5a');
  }
}
function sunExt(P) {
  const { r, p } = P;
  const st = ['#5a3a18', '#d8a85a', '#b8863e', '#f4d48a'];
  for (let k = 0; k < 3; k++) { const y = 46 + k * 6, inset = 18 - k * 9; r(inset, y, BW - inset * 2, 6, st[0]); r(inset + 1, y, BW - inset * 2 - 2, 5, st[1]); r(inset + 1, y, BW - inset * 2 - 2, 1, st[3]); r(inset + 1, y + 4, BW - inset * 2 - 2, 1, st[2]); }
  for (const ox of [6, 146]) {   // obeliscos com ponta de ouro
    for (let y = 2; y < 46; y++) { const hw = 4 - Math.floor(y / 22); r(ox + 4 - hw, y, hw * 2, 1, st[2]); r(ox + 4 - hw, y, 2, 1, st[3]); }
    r(ox + 2, -6, 4, 8, st[1]); r(ox + 3, -10, 2, 4, '#e0c060'); p(ox + 3, -11, '#fff0a0'); r(ox + 2, -6, 2, 8, '#f4d48a');
    for (let y = 8; y < 40; y += 6) { r(ox + 3, y, 2, 1, '#3a2410'); p(ox + 4, y + 2, '#3ac0b0'); }
  }
  for (const [sx, dir] of [[20, 1], [124, -1]]) {   // esfinges deitadas
    r(sx, 38, 16, 8, st[0]); r(sx + 1, 38, 14, 7, st[1]); r(sx + 1, 38, 14, 1, st[3]);
    const hx = dir > 0 ? sx + 12 : sx; r(hx - 1, 28, 6, 11, st[0]); r(hx, 29, 4, 9, st[1]); r(hx - 2, 30, 8, 5, '#3a6ab8'); r(hx - 1, 30, 6, 1, '#e0c060'); r(hx, 31, 4, 4, st[3]); p(hx + 1, 32, '#2a1a0c');
  }
  for (const bx of [40, 118]) { r(bx, 36, 4, 10, '#6a4a22'); r(bx - 1, 34, 6, 2, '#2a1a0c'); flame(P, bx + 2, 34); }
}
function iceExt(P) {
  const { r } = P;
  const pal = ['#9ad8ff', '#e8f8ff', '#3a6aa8'];
  for (const [cx, dir] of [[16, 1], [144, -1]]) {
    for (const [dx, h, w, lean] of [[0, 46, 7, 0], [-8, 30, 5, -3], [8, 34, 5, 3], [-12, 18, 4, -4], [12, 20, 4, 4]]) shard(P, cx + dx * dir, 64, h, w, lean * dir, pal);
  }
  for (const [x0, x1] of [[0, 34], [126, 160]]) for (let x = x0; x < x1; x++) { const h = 4 + Math.round(2 * Math.sin(x * 0.3) + hash(x, 2, 9) * 2); r(x, 64 - h, 1, h, '#ffffff'); r(x, 64 - h, 1, 1, '#c8dcf0'); }
  for (const lx of [34, 124]) { r(lx, 24, 2, 40, '#2a3248'); r(lx - 2, 20, 6, 5, '#2a3248'); r(lx - 1, 21, 4, 3, '#7af0ff'); r(lx - 3, 18, 8, 2, '#ffffff'); }
}
function cemeteryExt(P) {
  const { r, p, blocks, tri, disc } = P;
  const pal = ['#16161e', '#5a5a6a', '#46465a', '#8a8a9e'];
  for (const [x0, dir] of [[2, 1], [128, -1]]) {
    // mausoléu com frontão e colunas
    r(x0 - 1, 60, 32, 4, pal[0]); r(x0, 60, 30, 1, pal[3]);
    blocks(x0 + 2, 30, 26, 30, pal, 8, 5, x0);
    tri(x0 + 15, 16, 17, 14, '#3a3a46', ['#8a8a9e', '#16161e']); r(x0 - 2, 29, 34, 2, '#2a2a34'); r(x0 - 2, 29, 34, 1, pal[3]);
    disc(x0 + 15, 24, 2, '#c8a0ff'); p(x0 + 15, 24, '#ffffff');
    for (const cx of [x0 + 3, x0 + 23]) { r(cx, 31, 4, 29, pal[0]); r(cx + 1, 31, 2, 29, '#a8a8b8'); }
    r(x0 + 10, 40, 10, 20, '#0a0a12'); r(x0 + 10, 40, 10, 2, pal[0]); for (let y = 0; y < 4; y++) r(x0 + 11 + y, 36 + y, 8 - y * 2, 1, '#0a0a12');
    // grade de ferro até o portão
    const fx0 = dir > 0 ? x0 + 31 : x0 - 4, fx1 = fx0 + 4;
    for (let x = fx0; x < fx1 + 0; x += 2) { r(x, 42, 1, 22, '#1a1822'); p(x, 41, '#8a8a9e'); }
    r(fx0, 46, 5, 1, '#1a1822'); r(fx0, 56, 5, 1, '#1a1822');
    // árvore seca torta em cima
    const tx = dir > 0 ? x0 + 4 : x0 + 26; r(tx, 2, 2, 14, '#2a2220'); for (let i = 0; i < 8; i++) { p(tx + 2 + i * dir, 4 - Math.round(i * 0.5), '#2a2220'); p(tx - 1 - i * dir, 8 - Math.round(i * 0.4), '#2a2220'); }
  }
}
function bosqueExt(P) {
  const { r, p } = P;
  // sebes em curva descendo para os lados, com topiarias em espiral e cones altos atrás
  for (const [cx, top] of [[20, 0], [140, 0]]) for (let y = top; y < 30; y++) { const hw = Math.round((y - top + 2) * 0.32); for (let x = cx - hw; x <= cx + hw; x++) p(x, y, x === cx - hw || x === cx + hw ? HEDGE_PAL[0] : HEDGE_PAL[(x - cx + hw) < hw ? 5 : 3 + ((y >> 1) & 1)]); }
  for (let x = 0; x < 34; x++) { const top = 44 - Math.round(Math.sin((x / 34) * Math.PI / 2) * 16); hedgeCol(P, x, top, 64, x === 0 || x === 33, 3); }
  for (let x = 126; x < 160; x++) { const top = 44 - Math.round(Math.cos(((x - 126) / 34) * Math.PI / 2) * 16); hedgeCol(P, x, top, 64, x === 126 || x === 159, 4); }
  for (const [cx, cy] of [[6, 36], [154, 36]]) for (let k = 0; k < 3; k++) { const rr = 5 - k; const yy = cy - k * 9; for (let y = -rr; y <= rr; y++) for (let x = -rr; x <= rr; x++) if (x * x + y * y <= rr * rr) p(cx + x, yy + y, x * x + y * y > (rr - 1) ** 2 ? HEDGE_PAL[0] : x + y < 0 ? HEDGE_PAL[5] : HEDGE_PAL[3]); r(cx, yy + rr, 1, 4, '#3a2a14'); }
  for (const [x, y, c] of [[12, 58, '#ff8ab8'], [24, 52, '#ffe08a'], [136, 52, '#c8a0ff'], [148, 58, '#9fe8ff'], [30, 48, '#ffffff'], [130, 47, '#ff8ab8']]) { r(x, y, 2, 2, c); p(x, y, '#ffffff'); }
}
const HEDGE_PAL = ['#081a0c', '#123216', '#1c4a1e', '#286428', '#38822f', '#52a03e', '#86c862'];
function hedgeCol(P, x, top, bot, edge, seed) {
  const { p } = P;
  p(x, top - 1, HEDGE_PAL[0]);
  for (let y = top; y < bot; y++) {
    if (edge) { p(x, y, HEDGE_PAL[0]); continue; }
    const v = (y - top < 3 ? 5 : 3.4 - (y - top) / (bot - top) * 1.6) + (hash(x >> 2, (y / 3) | 0, seed) - 0.5) * 1.2 - ((y + 1) % 3 === 0 ? 0.4 : 0);
    p(x, y, HEDGE_PAL[Math.max(1, Math.min(6, Math.round(v)))]);
  }
}
function snowExt(P) {
  const { r, p, disc } = P;
  for (const [x0, x1] of [[0, 40], [120, 160]]) for (let x = x0; x < x1; x++) { const h = 6 + Math.round(3 * Math.sin(x * 0.2) + hash(x, 4, 2) * 2); r(x, 64 - h, 1, h, '#ffffff'); p(x, 64 - h, '#c8dcf0'); }
  for (const ox of [10, 144]) {   // obeliscos de runa com neve
    r(ox, 8, 8, 50, '#2a3248'); r(ox + 1, 9, 6, 49, '#6a7290'); r(ox + 1, 9, 2, 49, '#a8b2cc');
    for (let y = 0; y < 6; y++) r(ox + y, 2 + y, 8 - y * 2 > 0 ? 8 - y * 2 : 1, 1, '#2a3248');
    r(ox - 1, 6, 10, 3, '#ffffff');
    for (let y = 14; y < 50; y += 9) { r(ox + 3, y, 2, 5, '#7af0ff'); r(ox + 2, y + 2, 4, 1, '#7af0ff'); p(ox + 3, y, '#ffffff'); }
  }
  for (const [cx, cy] of [[30, 30], [130, 30]]) { r(cx, cy, 1, 30, '#3a2a18'); r(cx - 3, cy - 5, 7, 5, '#2a3248'); r(cx - 2, cy - 4, 5, 3, '#ffe08a'); r(cx - 4, cy - 7, 9, 2, '#ffffff'); }
}
function duneExt(P) {
  const { r, p, disc } = P;
  for (const [cx, c1, c2] of [[18, '#c83a2a', '#f0e0b0'], [142, '#2a6ab8', '#f0e0b0']]) {   // tendas listradas
    for (let y = 0; y < 30; y++) { const hw = Math.round((y + 1) * 17 / 30); for (let x = -hw; x < hw; x++) p(cx + x, 30 + y, ((x + 40) >> 2) % 2 ? c1 : c2); p(cx - hw, 30 + y, '#3a2410'); p(cx + hw - 1, 30 + y, '#3a2410'); }
    r(cx, 22, 1, 8, '#3a2410'); r(cx + 1, 22, 5, 3, c1);
    r(cx - 4, 50, 8, 10, '#2a1a10'); r(cx - 3, 51, 6, 9, '#4a2a14');
    r(cx - 18, 60, 36, 4, '#8a5a8a'); for (let x = cx - 16; x < cx + 16; x += 4) p(x, 61, '#e0c060');
  }
  for (const [px, py] of [[44, 56], [50, 58], [112, 57]]) { disc(px, py, 3, '#8a4a2a'); disc(px - 1, py - 1, 2, '#c07a4a'); r(px - 1, py - 4, 3, 1, '#5a2a14'); }
  // palmeira
  for (let y = 4; y < 26; y++) r(36 - Math.round((26 - y) * 0.15), y, 3, 1, y % 3 ? '#8a6a3a' : '#5a4022');
  for (const [dx, dy] of [[-10, 4], [-7, -1], [0, -3], [7, -1], [10, 4]]) for (let i = 0; i < 8; i++) r(36 + Math.round(dx * i / 8), 3 + Math.round(dy * i / 8 + (i * i) / 16), 2, 1, i < 5 ? '#3a8a3a' : '#2a6a2a');
}
const EXT = { d1: rootsExt, d2: cryptExt, d3: swampExt, d4: mineExt, d5: tideExt, d6: sunExt, d7: iceExt, 'lost-cemiterio': cemeteryExt, 'lost-bosque': bosqueExt, 'lost-nevasca': snowExt, 'lost-dunas': duneExt };

// Ao redor de cada castelo de chefe, os tiles do bloco (que são sólidos) ganham a vegetação/pedras da região:
// assim a construção aparece com a silhueta dela (pirâmide, catedral, cúpula...) e não como um retângulo.
const FILL = { d1: 'darktree', d2: 'deadtree', d3: 'mangrove', d4: 'cliff', d5: 'palm', d6: 'cactus', d7: 'snowpine', mk1: 'moonrock', mk2: 'moonrock', mc: 'moonrock', 'lost-bosque': 'darktree', 'lost-cemiterio': 'deadtree', 'lost-nevasca': 'snowpine', 'lost-dunas': 'rock' };
const OVER = 18;   // quanto as torres e agulhas podem subir acima do bloco
// O que passa do bloco só é desenhado sobre tiles sólidos: onde o herói anda nunca fica coberto pela fachada.
function clipSolid(ctx, x0, y0, x1, y1, solid) {
  for (let ty = Math.floor(y0 / 16); ty * 16 < y1; ty++) for (let tx = Math.floor(x0 / 16); tx * 16 < x1; tx++) {
    if (solid && !solid(tx, ty)) continue;
    const ax = Math.max(x0, tx * 16), ay = Math.max(y0, ty * 16);
    ctx.rect(ax, ay, Math.min(x1, tx * 16 + 16) - ax, Math.min(y1, ty * 16 + 16) - ay);
  }
}
export function drawFacade(ctx, id, fill, solid) {
  if (id.startsWith('cave-')) {
    // linha 1 inteira (colunas 13-17) e, na linha 2, só os pilares (14 e 16) e a boca (15); acima pode subir sobre a borda
    const ox = 208, oy = 16;
    const kind = { dforest: 'darktree', dcrypt: 'deadtree', dswamp: 'mangrove', dmine: 'rock', dtide: 'rock', dsun: 'cactus', dice: 'snowpine', lacrimora: 'lactree' }[id.slice(5).split(':')[0]] || 'rock';
    if (fill) for (const [tx, ty] of [[13, 1], [14, 1], [15, 1], [16, 1], [17, 1], [14, 2], [16, 2]]) fill(kind, tx, ty);
    ctx.save(); ctx.beginPath(); clipSolid(ctx, ox, 0, ox + 80, 32, solid); ctx.rect(ox + 16, oy + 16, 48, 16); ctx.clip();
    caveMouth(painter(ctx, ox, oy), id.slice(5).split(':')[0], id.split(':')[1]);
    ctx.restore();
    return true;
  }
  const [base, low] = id.split('@'), dy = low ? 16 : 0;
  const art = ART[base];
  if (!art) return false;
  if (EXT[base]) {
    // construção grande: 10x4 tiles (colunas 5-14, linhas 1-4, ou 2-5 quando desce uma linha), tudo sólido no mapa
    const bx = 80, by = 16 + dy;
    if (FILL[base] && fill && !COURT[base]) {
      // atrás da construção: chão e um arvoredo/pedregal denso e irregular (nada de fileira certinha)
      for (let ty = 0; ty < 4; ty++) for (let tx = 0; tx < 10; tx++) fill(FILL[base] === 'cliff' ? 'cliff' : 'ground', bx / 16 + tx, by / 16 + ty);
      const spots = [];
      if (FILL[base] !== 'cliff') for (let ty = 0; ty < 4; ty++) for (let tx = 0; tx < 10; tx++) for (const [ox, oy] of [[0, 0], [8, 7]]) {
        if (oy && ty === 3) continue;
        const jx = Math.round((hash(tx, ty + oy, 61) - 0.5) * 8), jy = Math.round((hash(tx + oy, ty, 62) - 0.5) * 6);
        spots.push([Math.max(bx, Math.min(bx + BW - 16, bx + tx * 16 + ox + jx)), Math.max(by, Math.min(by + BH - 16, by + ty * 16 + oy + jy)), tx, ty]);
      }
      spots.sort((a, b) => a[1] - b[1]);
      for (const [px, py, tx, ty] of spots) fill(FILL[base], bx / 16 + tx, by / 16 + ty, px, py);
    }
    ctx.save(); ctx.beginPath(); ctx.rect(bx, by, BW, BH);
    if (!dy) clipSolid(ctx, bx, 2, bx + BW, by, solid);   // pináculos podem subir sobre a borda da tela
    ctx.clip();
    if (!(COURT[base] && base === 'lost-bosque')) EXT[base](painter(ctx, bx, by));   // o jardim de fora já faz as sebes em volta do portal
    art(painter(ctx, bx + 32, by + 16));
    ctx.restore();
    return true;
  }
  const [ox, oy] = ORIGIN[base] || [112, 32];
  if (FILL[base] && fill && !COURT[base]) for (let ty = 0; ty < 3; ty++) for (let tx = 0; tx < 6; tx++) fill(FILL[base], ox / 16 + tx, oy / 16 + ty);
  ctx.save(); ctx.beginPath();
  if (FILL[base]) { ctx.rect(ox, oy, W, H); clipSolid(ctx, ox - 4, Math.max(0, oy - OVER), ox + W + 4, oy + H, (tx, ty) => (tx < ox / 16 || tx >= (ox + W) / 16 || ty < oy / 16) && (!solid || solid(tx, ty))); }
  else ctx.rect(ox, oy, W, H);
  ctx.clip();
  const P = painter(ctx, ox, oy);
  if (BACK[base] && !FILL[base]) backdrop(P, BACK[base]);
  art(P);
  ctx.restore();
  return true;
}

// ---------------------------------------------------------------- área externa das entradas de chefe
// Como nos clássicos: a construção toma o alto da tela de uma borda à outra (as células que o mundo fechou com '#',
// mais a borda de cima) e a porta fica encaixada no meio dela. Onde o caminho precisa passar, a muralha abre um portão.
const COURT = {
  d1: { kind: 'jungle' }, d3: { kind: 'stilts' }, d4: { kind: 'cliff' },
  d2: { kind: 'castle', pal: ['#14141c', '#54546a', '#40404f', '#8a8a9e'], roof: ['#2a2838', '#4a4660', '#14121c'], shape: 'spire', glow: '#a070ff', banner: '#5a2a8a' },
  d5: { kind: 'castle', pal: ['#3a4a5a', '#d8e2e6', '#b4c4cc', '#ffffff'], roof: ['#2a6aa8', '#4a9ad8', '#163a60'], shape: 'dome', glow: '#7af0ff', banner: '#2a6ab8' },
  d6: { kind: 'castle', pal: ['#5a3a18', '#d8a85a', '#b8863e', '#f4d48a'], roof: ['#b8863e', '#e0c060', '#6a4a20'], shape: 'pyramid', glow: '#ffd27a', banner: '#3ac0b0' },
  d7: { kind: 'castle', pal: ['#3a4a6a', '#b8d0ea', '#94b0d4', '#ecf8ff'], roof: ['#9ad8ff', '#e8f8ff', '#3a6aa8'], shape: 'ice', glow: '#7af0ff', banner: '#3a78bc' },
  mc: { kind: 'castle', pal: ['#10122a', '#4a4e70', '#383c5a', '#7a80a8'], roof: ['#3a2a6a', '#6a4ab0', '#1a1236'], shape: 'spire', glow: '#5af0ff', banner: '#6a4ab0' },
  mk1: { kind: 'moon' }, mk2: { kind: 'crystal' },
  // entradas dos labirintos
  'lost-bosque': { kind: 'hedge' },
  'lost-cemiterio': { kind: 'castle', pal: ['#14141c', '#54546a', '#40404f', '#8a8a9e'], roof: ['#2a2838', '#4a4660', '#14121c'], shape: 'spire', glow: '#c8a0ff', banner: '#3a2a5a' },
  'lost-nevasca': { kind: 'castle', pal: ['#3a4a6a', '#b8d0ea', '#94b0d4', '#ecf8ff'], roof: ['#9ad8ff', '#e8f8ff', '#3a6aa8'], shape: 'ice', glow: '#7af0ff', banner: '#3a78bc' },
  'lost-dunas': { kind: 'castle', pal: ['#5a3a22', '#c08a5a', '#a87448', '#e4b888'], roof: ['#b8743e', '#e09a5a', '#6a3a1e'], shape: 'dome', glow: '#ffd27a', banner: '#c83a2a' },
};
// jardim-labirinto: sebe alta aparada (tampo claro, frente com cachos e divisões entre os blocos), pilares de pedra com
// lanterna, pontas arrematadas por pilar e topiaria, canteiro de flores embaixo e a mata escura atrás
function courtHedge(P, x0, x1, y0, y1, ends) {
  const { r, p, disc } = P;
  r(x0, y0, x1 - x0, y1 - y0, '#0a1a0c');
  for (let x = x0 - 4; x < x1 + 8; x += 11) { const yy = y0 + 6 + ((hash(x, 1, 3) * 5) | 0); disc(x, yy, 9, '#0e2414'); disc(x - 2, yy - 2, 6, '#163a1c'); disc(x - 4, yy - 4, 2, '#1f4a26'); }
  const top = (x) => y0 + 12 + Math.round(1.5 * Math.sin(x * 0.11) + hash(x >> 2, 2, 4));
  const bed = y1 - 6;
  for (let x = x0; x < x1; x++) {
    const t = top(x);
    p(x, t - 1, HEDGE_PAL[0]);
    for (let y = t; y < bed; y++) {
      let v;
      if (y - t < 4) v = 5.4 - (y - t) * 0.5 + (hash(x >> 1, y, 7) - 0.5) * 1.2;   // tampo aparado, mais claro
      else v = 3.6 - (y - t - 4) / (bed - t) * 1.8 + (hash((x + ((y / 3) & 1) * 2) >> 2, (y / 3) | 0, 5) - 0.5) * 1.3 - ((y + 1) % 3 === 0 ? 0.45 : 0);
      if ((x - x0) % 16 === 0 && y - t > 4) v -= 1.2;   // divisão entre os blocos da sebe
      p(x, y, HEDGE_PAL[Math.max(1, Math.min(6, Math.round(v)))]);
    }
    p(x, t + 4, HEDGE_PAL[2]);
  }
  // canteiro de flores na base
  r(x0, bed, x1 - x0, 6, '#2a2014'); r(x0, bed, x1 - x0, 1, '#3a5a26');
  for (let x = x0 + 1; x < x1; x += 3) { p(x, bed + 2 + (x % 2), ['#ff8ab8', '#ffe08a', '#c8a0ff', '#ffffff', '#9fe8ff'][(x * 7 >> 2) % 5]); p(x + 1, bed + 3, '#3a7a2a'); }
  const pillar = (cx, ball) => {
    const t = top(cx) - 4;
    r(cx - 3, t, 7, bed - t, '#2a2c30'); r(cx - 2, t, 5, bed - t, '#7a7e84'); r(cx - 2, t, 1, bed - t, '#a8acb0'); r(cx + 2, t, 1, bed - t, '#5a5e64');
    for (let y = t + 5; y < bed; y += 6) r(cx - 2, y, 5, 1, '#5a5e64');
    r(cx - 4, t - 2, 9, 3, '#2a2c30'); r(cx - 3, t - 2, 7, 1, '#bcc2c2');
    if (ball) topiary(P, cx, t - 7, 5);
    else { r(cx, t + 7, 1, 3, '#2a1a0c'); r(cx - 2, t + 10, 5, 5, '#3a2a14'); r(cx - 1, t + 11, 3, 3, '#d8ff8a'); p(cx - 1, t + 11, '#ffffff'); }
  };
  for (let cx = x0 + 40; cx < x1 - 24; cx += 56) pillar(cx, false);
  if (ends[0]) pillar(x0 + 4, true);
  if (ends[1]) pillar(x1 - 5, true);
}
function topiary(P, cx, cy, rr) {
  const { p } = P;
  for (let y = cy - rr - 1; y <= cy + rr + 1; y++) for (let x = cx - rr - 1; x <= cx + rr + 1; x++) {
    const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy);
    if (d > rr + 0.6) continue;
    if (d > rr - 0.6) { p(x, y, HEDGE_PAL[0]); continue; }
    const v = 3.4 - 1.6 * (dx + dy * 1.2) / rr + (hash(x >> 1, y >> 1, 9) - 0.5) * 1.1;
    p(x, y, HEDGE_PAL[Math.max(1, Math.min(6, Math.round(v)))]);
  }
}
function courtTower(P, cx, y0, y1, st) {
  const { r, p, blocks, tri, disc } = P, [k, base, dark, hi] = st.pal, [rc, rh, rd] = st.roof, w = 20, x = cx - 10;
  const top = y0 + 14;
  blocks(x, top, w, y1 - top, st.pal, 6, 4, cx);
  r(x - 1, top, 1, y1 - top, k); r(x + w, top, 1, y1 - top, k); r(x + w - 3, top, 3, y1 - top, shade(dark, 0.85));
  r(x - 2, top - 2, w + 4, 3, k); r(x - 1, top - 2, w + 2, 1, hi);
  if (st.shape === 'dome') { for (let y = 0; y < 12; y++) { const hw = Math.round(Math.sqrt(Math.max(0, 1 - ((12 - y) / 12) ** 2)) * 11); r(cx - hw, y0 + 2 + y, hw * 2, 1, rc); r(cx - hw, y0 + 2 + y, Math.round(hw * 0.6), 1, rh); } r(cx - 1, y0, 2, 3, '#e0c060'); }
  else if (st.shape === 'pyramid') { for (let i = 0; i < 4; i++) { r(x + i * 2, top - 4 - i * 3, w - i * 4, 3, i % 2 ? base : dark); r(x + i * 2, top - 4 - i * 3, w - i * 4, 1, hi); } r(cx - 2, y0, 4, 2, '#e0c060'); }
  else if (st.shape === 'ice') { for (const [dx, h] of [[-6, 10], [0, 14], [6, 9]]) shard(P, cx + dx, top, h, 5, 0, [rc, rh, rd]); }
  else { tri(cx, y0, 12, top - y0, rc, [rh, rd]); for (let i = 2; i < top - y0; i += 3) r(cx - Math.round(12 * i / (top - y0)) + 1, y0 + i, Math.round(12 * i / (top - y0)) * 2 - 2, 1, rd); p(cx, y0, rh); }
  // janelas da torre e estandarte
  for (let y = top + 8; y < y1 - 14; y += 18) { r(cx - 2, y, 4, 7, k); r(cx - 1, y + 1, 2, 5, st.glow); p(cx - 1, y + 1, '#ffffff'); }
  r(cx - 5, top + 2, 10, 14, st.banner); for (let i = 0; i < 5; i++) r(cx - 5 + i, top + 16, 10 - i * 2, 1, st.banner);
  r(cx - 5, top + 2, 10, 1, hi); r(cx - 1, top + 6, 2, 5, hi);
}
function courtCastle(P, x0, x1, y0, y1, ends, st) {
  const { r, p, blocks, tri } = P, [k, base, dark, hi] = st.pal, [rc, rh, rd] = st.roof, w = x1 - x0;
  if (y1 - y0 <= 20) {   // só a faixa de cima (sobre um portão): passadiço com ameias e arco
    blocks(x0, y0, w, y1 - y0, st.pal, 8, 4, x0); r(x0, y1 - 3, w, 3, k);
    for (let x = x0 + 1; x < x1 - 3; x += 7) { r(x, y0, 4, 3, hi); }
    return;
  }
  // telhados dos prédios de dentro, atrás da muralha
  for (let x = x0 - 8; x < x1; x += 30) { const hx = x + 15; if (st.shape === 'dome') { for (let y = 0; y < 10; y++) { const hw = Math.round(Math.sqrt(Math.max(0, 1 - ((10 - y) / 10) ** 2)) * 12); r(hx - hw, y0 + 4 + y, hw * 2, 1, rd); r(hx - hw, y0 + 4 + y, Math.round(hw * 0.5), 1, rc); } } else if (st.shape === 'ice') shard(P, hx, y0 + 18, 14, 6, 0, [rc, rh, rd]); else if (st.shape === 'pyramid') { for (let i = 0; i < 3; i++) r(hx - 12 + i * 4, y0 + 8 + i * 3, 24 - i * 8, 3, i % 2 ? dark : base); } else tri(hx, y0 + 2, 14, 16, rd, [rc, k]); }
  // muralha: parapeito com ameias, corpo com janelas em arco, contrafortes e embasamento
  const wt = y0 + 16;
  blocks(x0, wt, w, y1 - wt, st.pal, 8, 4, x0 + 3);
  r(x0, wt, w, 3, k); r(x0, wt, w, 1, hi);
  for (let x = x0 + 2; x < x1 - 4; x += 9) { r(x - 1, wt - 7, 7, 7, k); r(x, wt - 6, 5, 6, base); r(x, wt - 6, 5, 1, hi); r(x + 4, wt - 6, 1, 6, dark); }
  for (let x = x0 + 14; x < x1 - 10; x += 28) {
    const wy = wt + 12; r(x - 1, wy - 1, 9, 15, k); for (let y = 0; y < 13; y++) { const hw = y < 4 ? [1, 3, 3, 4][y] : 4; r(x + 4 - hw, wy + y, hw * 2 - (hw * 2 > 7 ? 1 : 0), 1, y > 9 ? shade(st.glow, 0.6) : st.glow); }
    r(x + 3, wy, 1, 13, k); r(x, wy + 6, 7, 1, k); p(x + 1, wy + 3, '#ffffff');
  }
  for (let x = x0 + 27; x < x1 - 6; x += 28) { r(x, wt + 4, 5, y1 - wt - 4, dark); r(x, wt + 4, 1, y1 - wt - 4, hi); r(x - 1, y1 - 10, 7, 10, k); r(x, y1 - 10, 5, 9, base); }
  r(x0, y1 - 6, w, 6, shade(dark, 0.8)); r(x0, y1 - 6, w, 1, hi); r(x0, y1 - 1, w, 1, k);
  if (st.shape === 'ice') for (let x = x0; x < x1; x++) { if (hash(x, 1, 3) < 0.3) r(x, wt + 3, 1, 2 + ((hash(x, 2, 3) * 4) | 0), '#cfeaff'); p(x, wt - 8 + (x % 9 < 5 ? 0 : 7), '#ffffff'); }
  for (let i = 0; i < 2; i++) { const sx = i ? x1 - 10 : x0 + 10; if (ends[i]) courtTower(P, sx, y0, y1, st); }
  if (w >= 112) courtTower(P, x0 + Math.round(w / 2), y0, y1, st);
}
function courtJungle(P, x0, x1, y0, y1, ends) {
  const { r, p, disc } = P, bark = ['#1e1208', '#3a2412', '#55361a', '#6e4824', '#8e6234'];
  r(x0, y0, x1 - x0, y1 - y0, '#0a1a0c');
  for (let x = x0; x < x1; x += 3) for (let y = y0 + 20; y < y1; y += 3) if (hash(x, y, 4) < 0.5) r(x, y, 2, 2, hash(x, y, 5) < 0.5 ? '#12301a' : '#0e2414');
  // troncos gigantes com raízes
  for (let cx = x0 + 10 + ((x0 / 7) | 0) % 9; cx < x1 - 4; cx += 26) {
    const hw = 5 + ((hash(cx, 1, 2) * 3) | 0);
    for (let y = y0 + 16; y < y1; y++) { const fl = y > y1 - 10 ? Math.round((y - (y1 - 10)) * 0.8) : 0; for (let x = cx - hw - fl; x <= cx + hw + fl; x++) { const u = (x - (cx - hw - fl)) / (2 * (hw + fl)); p(x, y, x === cx - hw - fl || x === cx + hw + fl ? bark[0] : bark[u < 0.25 ? 4 : u < 0.55 ? 3 : u < 0.85 ? 2 : 1]); } }
    for (let y = y0 + 20; y < y1 - 6; y += 7) p(cx - 1 + ((y / 7) % 3), y, bark[0]);
  }
  // copa fechada em cima
  const lobes = []; for (let x = x0 - 6; x < x1 + 8; x += 13) lobes.push([x, y0 + 8 + ((hash(x, 3, 1) * 8) | 0), 11 + ((hash(x, 4, 1) * 4) | 0)]);
  for (const [x, y, rr] of lobes) disc(x, y, rr + 1, '#06140a');
  for (const [x, y, rr] of lobes) { disc(x, y, rr, '#17401c'); disc(x - 2, y - 2, rr - 3, '#215a26'); disc(x - 4, y - 4, Math.max(2, rr - 7), '#2f7432'); }
  for (const [x, y, rr] of lobes) for (let i = 0; i < rr * 2; i++) { const a = hash(x, i, 5) * 6.28, d = hash(i, y, 6) * rr * 0.85; p(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d), hash(i, x, 7) < 0.5 ? '#4a9440' : '#0f2a14'); }
  // cipós, flores que brilham e samambaias embaixo
  for (let x = x0 + 5; x < x1 - 2; x += 11) { const L = 8 + ((hash(x, 9, 2) * 18) | 0); for (let y = y0 + 22; y < y0 + 22 + L && y < y1; y++) p(x + (y % 6 === 0 ? 1 : 0), y, y % 3 ? '#2e5a24' : '#4a8a36'); p(x, y0 + 22 + L, ['#ff8ab8', '#ffe08a', '#c8a0ff', '#9fe8ff'][x % 4]); }
  for (let x = x0; x < x1; x += 5) { const h = 4 + ((hash(x, 7, 2) * 6) | 0); for (let i = 0; i < h; i++) { p(x + Math.round(i * 0.4), y1 - 1 - i, '#2f7a30'); p(x - Math.round(i * 0.4) + 2, y1 - 1 - i, '#245524'); } }
}
function courtStilts(P, x0, x1, y0, y1) {
  const { r, p } = P;
  if (y1 - y0 <= 20) {   // só a faixa de cima (atrás de uma passagem): paliçada baixa contínua com musgo
    r(x0, y0, x1 - x0, y1 - y0, '#1c2618');
    for (let x = x0; x < x1; x += 4) { r(x, y0 + 3, 1, y1 - y0 - 3, '#1e1408'); r(x + 1, y0 + 3, 1, y1 - y0 - 3, '#8a6a3e'); r(x + 2, y0 + 3, 2, y1 - y0 - 3, '#6a4a2a'); r(x + 1, y0 + 1, 2, 2, '#2a1a0c'); }
    r(x0, y0 + 7, x1 - x0, 1, '#c8a868'); for (let x = x0; x < x1; x++) if (hash(x, 5, 2) < 0.6) r(x, y1 - 3, 1, 3, '#3a5a2a');
    return;
  }
  r(x0, y0, x1 - x0, y1 - y0, '#1c2618');
  if (x1 - x0 < 48) {   // trecho estreito (ao lado/dentro de uma passagem): só a paliçada, de cima a baixo, sem copa verde
    for (let x = x0; x < x1; x += 5) {
      const top = y0 + 2 + ((hash(x, 1, 3) * 3) | 0);
      r(x + 1, top - 2, 2, 2, '#2a1a0c'); r(x, top, 1, y1 - top, '#1e1408'); r(x + 1, top, 1, y1 - top, '#8a6a3e'); r(x + 2, top, 2, y1 - top, '#6a4a2a');
      if (hash(x, 2, 3) < 0.5) r(x + 1, top + 6, 2, 3 + ((hash(x, 4, 3) * 6) | 0), '#4a6a2a');
    }
    for (const yy of [y0 + 10, y1 - 12]) if (yy > y0 && yy < y1) { r(x0, yy, x1 - x0, 1, '#c8a868'); r(x0, yy + 1, x1 - x0, 1, '#7a6038'); }
    for (let x = x0 + 3; x < x1; x += 7) { r(x, y1 - 9, 1, 9, '#4a6a2a'); p(x, y1 - 10, '#8a6a3a'); }
    return;
  }
  for (let x = x0; x < x1; x += 4) for (let y = y0; y < y0 + 26; y += 3) if (hash(x, y, 8) < 0.6) r(x, y, 4, 3, hash(x, y, 9) < 0.5 ? '#2a3a22' : '#334628');
  // cabanas em palafitas no alto
  for (let cx = x0 + 16; cx < x1 - 10; cx += 40) {
    r(cx - 9, y0 + 14, 18, 12, '#2a1a0c'); r(cx - 8, y0 + 15, 16, 11, '#6a4a2a'); r(cx - 2, y0 + 18, 4, 8, '#ffb84a');
    for (let y = 0; y < 13; y++) { const hw = Math.round((y + 1) * 12 / 13); r(cx - hw, y0 + 1 + y, hw * 2, 1, y % 3 === 2 ? '#6a5a2a' : '#9a8a4a'); }
  }
  // paliçada de troncos com corda
  for (let x = x0; x < x1; x += 5) {
    const top = y0 + 26 + ((hash(x, 1, 3) * 4) | 0);
    r(x + 1, top - 2, 2, 2, '#2a1a0c'); r(x, top, 1, y1 - top, '#1e1408'); r(x + 1, top, 1, y1 - top, '#8a6a3e'); r(x + 2, top, 2, y1 - top, '#6a4a2a');
    if (hash(x, 2, 3) < 0.5) r(x + 1, top + 3, 2, 3 + ((hash(x, 4, 3) * 6) | 0), '#4a6a2a');
  }
  for (const yy of [y0 + 36, y1 - 12]) if (yy < y1) { r(x0, yy, x1 - x0, 1, '#c8a868'); r(x0, yy + 1, x1 - x0, 1, '#7a6038'); }
  for (let x = x0 + 3; x < x1; x += 7) { r(x, y1 - 9, 1, 9, '#4a6a2a'); p(x, y1 - 10, '#8a6a3a'); }
  for (let x = x0 + 20; x < x1 - 4; x += 40) { r(x, y0 + 30, 1, 5, '#2a1a0c'); r(x - 1, y0 + 35, 3, 3, '#8ad85a'); p(x, y0 + 36, '#e8ffd0'); }
}
function courtCliffProps(P, x0, x1, y0, y1) {
  const { r, p } = P;
  for (let x = x0 + 14; x < x1 - 14; x += 52) {   // andaimes com escada e lanterna encostados no paredão
    if (y1 - y0 < 40) continue;
    for (const px of [x, x + 16]) { r(px, y0 + 20, 2, y1 - y0 - 20, '#3a2412'); r(px, y0 + 20, 1, y1 - y0 - 20, '#8a6238'); }
    for (let y = y0 + 24; y < y1; y += 12) { r(x, y, 18, 2, '#4a3220'); r(x, y, 18, 1, '#9a7448'); }
    for (let y = y0 + 22; y < y1 - 2; y += 3) r(x + 6, y, 6, 1, '#6a4a2a');
    r(x + 7, y0 + 14, 1, 6, '#2a1a0c'); r(x + 5, y0 + 20, 5, 5, '#3a2a14'); r(x + 6, y0 + 21, 3, 3, '#ffd27a');
  }
}
function courtMoon(P, x0, x1, y0, y1, crystal) {
  const { r, p, disc } = P;
  rockMass(P, (() => { const l = []; for (let x = x0 - 6; x < x1 + 8; x += 10) { l.push([x, y0 + 10 + hash(x, 1, 2) * 8, 10 + hash(x, 2, 2) * 3]); l.push([x + 5, y1 + 2, 14]); } return l; })(), MOONK, x0, x1, y0, y1);
  if (crystal) for (let x = x0 + 6; x < x1 - 4; x += 11) shard(P, x, y0 + 16 + ((hash(x, 4, 4) * 10) | 0), 10 + ((hash(x, 2, 6) * 10) | 0), 5, (hash(x, 3, 6) - 0.5) * 6, ['#b48cff', '#e8d8ff', '#4a2a8a']);
  else for (let x = x0 + 20; x < x1 - 16; x += 48) {   // módulos da base com cúpula e antena
    if (y1 - y0 < 30) continue;
    const by = y1 - 18; r(x - 12, by, 24, 14, '#8a8e9e'); r(x - 12, by, 24, 1, '#d8dce8'); r(x - 12, by + 13, 24, 1, '#3a3e4a');
    for (let y = 0; y < 9; y++) { const hw = Math.round(Math.sqrt(Math.max(0, 1 - ((9 - y) / 9) ** 2)) * 10); r(x - hw, by - 9 + y, hw * 2, 1, '#c8ccd8'); r(x - hw, by - 9 + y, Math.round(hw * 0.5), 1, '#eef0f6'); }
    for (const dx of [-8, -2, 4]) { r(x + dx, by + 4, 3, 3, '#1a2a3a'); r(x + dx, by + 4, 3, 1, '#5af0ff'); }
    r(x + 9, by - 16, 1, 16, '#6a6e7a'); disc(x + 9, by - 17, 2, '#c8ccd8'); p(x + 9, by - 18, '#ff6a5a');
  }
}
const MOONK = ['#14141a', '#45454f', '#62626e', '#82828e', '#a8a8b4'];
// Quais tiles a construção da entrada cobre por inteiro (fundo opaco): o chão embaixo deles não precisa ser desenhado.
// A rocha da Lua tem recortes e fica de fora.
export function courtCovers(id, tileAt, solid) {
  const st = COURT[id.split('@')[0]];
  if (!st || st.kind === 'moon' || st.kind === 'crystal') return null;
  const maxRow = 4 + (id.includes('@') ? 1 : 0);
  // no castelo a faixa de cima da muralha (ameias e telhados) tem recortes: só conta o que fica abaixo dela
  const above = (tx, ty) => solid(tx, 0) || [...Array(ty - 1)].some((_, i) => tileAt(tx, i + 1) === '#');
  return (tx, ty) => ty >= 1 && ty <= maxRow && tx >= 1 && tx <= 18 && tileAt(tx, ty) === '#' && (st.kind !== 'castle' || above(tx, ty));
}
export function drawCourt(ctx, id, tileAt, solid, fill) {
  const [base, low] = id.split('@'), st = COURT[base];
  if (!st) return;
  const moon = !!ORIGIN[base], dy = low ? 1 : 0;
  const [kx, ky, kw, kh] = moon ? [2, 1, 6, 3] : [5, 1 + dy, 10, 4];
  const maxRow = moon ? 3 : 4 + dy;
  const inKeep = (tx, ty) => tx >= kx && tx < kx + kw && ty >= ky && ty < ky + kh;
  // inclui o bloco do meio: a construção de fora continua por trás dele (sem caixa reta em volta)
  const body = (tx, ty) => tx >= 0 && tx < 20 && ty >= 1 && ty <= maxRow && (tx === 0 || tx === 19 ? solid(tx, ty) && tileAt(tx, ty) !== 'W' : tileAt(tx, ty) === '#');
  // a borda de cima só entra onde a construção tem corpo logo abaixo; sobre passagens fica a borda natural
  const isWall = (tx, ty) => ty === 0 ? solid(tx, 0) && tileAt(tx, 0) !== 'W' && (body(tx, 1) || st.kind === 'castle' || st.kind === 'stilts') : body(tx, ty);
  const span = (tx) => { const rs = []; for (let ty = 0; ty <= maxRow; ty++) if (isWall(tx, ty)) rs.push(ty); return rs.length ? [rs[0], rs.at(-1)] : null; };   // o recorte deixa de fora o chão do meio
  const P = painter(ctx, 0, 0);
  ctx.save(); ctx.beginPath();
  for (let tx = 0; tx < 20; tx++) for (let ty = 0; ty <= maxRow; ty++) if (isWall(tx, ty)) ctx.rect(tx * 16, ty * 16, 16, 16);
  ctx.clip();
  if (st.kind === 'cliff' && fill) for (let tx = 0; tx < 20; tx++) for (let ty = 0; ty <= maxRow; ty++) if (isWall(tx, ty)) fill('cliff', tx, ty);
  for (let tx = 0; tx < 20;) {
    const sp = span(tx);
    if (!sp) { tx++; continue; }
    let te = tx; while (te + 1 < 20 && String(span(te + 1)) === String(sp)) te++;
    const x0 = tx * 16, x1 = (te + 1) * 16, y0 = sp[0] * 16, y1 = (sp[1] + 1) * 16;
    const ends = [tx > 0 && !inKeep(tx - 1, sp[1]) && (!span(tx - 1) || span(tx - 1)[1] < sp[1]), te < 19 && !inKeep(te + 1, sp[1]) && (!span(te + 1) || span(te + 1)[1] < sp[1])];
    if (st.kind === 'castle') courtCastle(P, x0, x1, y0, y1, ends, st);
    else if (st.kind === 'jungle') courtJungle(P, x0, x1, y0, y1, ends);
    else if (st.kind === 'hedge') courtHedge(P, x0, x1, y0, y1, ends);
    else if (st.kind === 'stilts') courtStilts(P, x0, x1, y0, y1);
    else if (st.kind === 'cliff') courtCliffProps(P, x0, x1, y0, y1);
    else courtMoon(P, x0, x1, y0, y1, st.kind === 'crystal');
    tx = te + 1;
  }
  ctx.restore();
  if (GROUND[base]) groundFacade(ctx, GROUND[base], (tx, ty) => ty <= maxRow && isWall(tx, ty));
}

// Profundidade na base da construção (Toca das Raízes e Lua): a parede não termina numa linha reta sobre o chão.
// Sombra de contato que cai no chão, a base escurecida, e coisas do lugar passando da linha: raízes e tufos na floresta,
// poeira e pedrinhas na Lua.
const GROUND = { d1: 'jungle', mk1: 'moon', mk2: 'moon', mc: 'moon' };
function groundFacade(ctx, kind, wall) {
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  for (let tx = 0; tx < 20; tx++) for (let ty = 1; ty <= 5; ty++) {
    if (!wall(tx, ty) || wall(tx, ty + 1)) continue;
    const x = tx * 16, y = (ty + 1) * 16;   // linha onde a parede encontra o chão
    // base da parede mais escura (oclusão) e sombra suave no chão
    for (let k = 0; k < 4; k++) R(x, y - 4 + k, 16, 1, `rgba(8,6,16,${0.08 + k * 0.07})`);
    for (let k = 0; k < 9; k++) R(x, y + k, 16, 1, `rgba(8,6,16,${(0.42 * (1 - k / 9)).toFixed(3)})`);
    if (kind === 'jungle') {
      // raízes que descem da parede para o chão e tufos de capim na emenda
      if (hash(tx, ty, 31) < 0.6) { const rx = x + 2 + Math.floor(hash(tx, ty, 32) * 11); R(rx, y - 3, 2, 7, '#3a2414'); R(rx, y - 3, 1, 6, '#6a4424'); R(rx + 1, y + 3, 3, 1, '#3a2414'); R(rx - 2, y + 2, 2, 1, '#3a2414'); }
      for (let i = 0; i < 4; i++) { const gx = x + Math.floor(hash(tx, i, 33) * 15), h = 2 + Math.floor(hash(tx, i, 34) * 3); R(gx, y - h + 1, 1, h + 1, '#2e5a24'); R(gx + 1, y - h + 2, 1, h, '#4a7a34'); }
      if (hash(tx, ty, 35) < 0.3) { const mx = x + 4 + Math.floor(hash(tx, ty, 36) * 8); R(mx, y + 1, 3, 2, '#e8e0d0'); R(mx, y, 3, 1, '#c83a2a'); }   // cogumelinho
    } else {
      // poeira acumulada e pedrinhas no pé da parede
      R(x, y, 16, 1, 'rgba(200,204,220,0.35)');
      for (let i = 0; i < 3; i++) { const px = x + Math.floor(hash(tx, i, 37) * 14), w = 1 + Math.floor(hash(tx, i, 38) * 2); R(px, y + 1, w + 1, w, '#5a5e74'); R(px, y + 1, w, 1, '#a8acc0'); }
    }
  }
}

// ---------------------------------------------------------------- animação das entradas (desenhada a cada quadro)
// Pó de luz colorido caindo devagar no Bosque Perdido, vaga-lumes, bolhas, neve e brilhos de cristal.
// Tudo calculado só pelo tempo, então não guarda estado e não interfere em nada do jogo.
const fr = (x) => x - Math.floor(x);
// cada partícula é um desenho pronto (halo, cruz de brilho e miolo) copiado de uma vez: no celular isso pesa bem menos
// do que várias camadas de transparência por partícula
const MOTE_SPRITES = new Map();
function moteSprite(col, size) {
  const k = col + size;
  if (MOTE_SPRITES.has(k)) return MOTE_SPRITES.get(k);
  const c = document.createElement('canvas'); c.width = c.height = size * 3; const x = c.getContext('2d');
  x.fillStyle = col; x.globalAlpha = 0.14; x.fillRect(0, 0, size * 3, size * 3);
  x.globalAlpha = 0.6; x.fillRect(0, size, size * 3, size); x.fillRect(size, 0, size, size * 3);
  x.globalAlpha = 1; x.fillRect(size, size, size, size);
  MOTE_SPRITES.set(k, c); return c;
}
function motes(ctx, ox, oy, t, n, cfg) {
  const { x0, x1, y0, y1, speed, sway, cols, size = 1, up = false } = cfg;
  if (typeof document === 'undefined') return;
  for (let i = 0; i < n; i++) {
    const seed = hash(i, 7, 91), ph = fr(t * speed * (0.6 + seed * 0.8) + i / n);
    const x = x0 + hash(i, 3, 92) * (x1 - x0) + Math.sin(t * 1.7 + i * 2.3) * sway * (0.5 + ph);
    const y = up ? y1 - ph * (y1 - y0) : y0 + ph * (y1 - y0);
    const a = Math.sin(ph * Math.PI) * (0.55 + 0.45 * Math.sin(t * 6 + i * 1.9));
    if (a <= 0.05) continue;
    ctx.globalAlpha = Math.min(1, a);
    ctx.drawImage(moteSprite(cols[i % cols.length], size), Math.round(ox + x) - size, Math.round(oy + y) - size);
  }
  ctx.globalAlpha = 1;
}
export function drawFacadeFx(ctx, id, t, yOff) {
  const cave = id.startsWith('cave-'), [base, low] = id.split('@'), cid = cave ? id.split(':')[1] : base;
  const [ox, oy0] = cave ? [208, 16] : ORIGIN[base] || [112, 32 + (low ? 16 : 0)], oy = oy0 + yOff;
  switch (cid) {
    case 'lost-bosque': // pó de luz colorido caindo das copas
      motes(ctx, ox, oy, t, 18, { x0: 4, x1: 92, y0: -4, y1: 46, speed: 0.1, sway: 5, size: 2, cols: ['#ff9ad0', '#ffe08a', '#c8a0ff', '#ffffff', '#b8ff9a', '#9fe8ff'] });
      break;
    case 'd1': // vaga-lumes subindo da toca
      motes(ctx, ox, oy, t, 12, { x0: 20, x1: 76, y0: 0, y1: 44, speed: 0.1, sway: 6, size: 2, cols: ['#d8ff8a', '#fff6a0'], up: true });
      break;
    case 'd3': // bolhas verdes do lodo
      motes(ctx, ox, oy, t, 8, { x0: 30, x1: 66, y0: 6, y1: 40, speed: 0.15, sway: 2, cols: ['#8ad85a', '#c8ff9a'], up: true });
      break;
    case 'lost-nevasca': case 'd7': case 'cv8': // neve caindo devagar
      motes(ctx, ox, oy, t, 16, { x0: 0, x1: cave ? 80 : 96, y0: -16, y1: cave ? 32 : 48, speed: 0.1, sway: 5, cols: ['#ffffff', '#e4f6ff'] });
      break;
    case 'mk2': case 'lac': // brilhos de cristal piscando
      motes(ctx, ox, oy, t, 10, { x0: 4, x1: cave ? 76 : 92, y0: -6, y1: 30, speed: 0.08, sway: 1, cols: ['#e0c8ff', '#c8f8ff', '#ffffff'] });
      break;
  }
}
