// A fonte do jogo (Press Start 2P) espreme as MAIÚSCULAS com acento (Í, É, Ê, Ã...) para caber o acento na mesma
// casa, e elas ficam esquisitas. Aqui a letra é desenhada normal e o acento vai por cima dela, em pixel.
const UPPER_ACCENT = /[ÀÁÂÃÄÇÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÑ]/;
export const hasUpperAccent = (s) => typeof s === 'string' && UPPER_ACCENT.test(s);
// marca de cada acento, em pixels de uma letra de 8x8 (x, y, largura, altura); y negativo = acima da letra
const MARK = {
  '́': [[4, -3, 2, 1], [3, -2, 2, 1]],                         // agudo
  '̀': [[2, -3, 2, 1], [3, -2, 2, 1]],                         // grave
  '̂': [[3, -3, 2, 1], [2, -2, 1, 1], [5, -2, 1, 1]],          // circunflexo
  '̃': [[1, -2, 1, 1], [2, -3, 2, 1], [4, -2, 1, 1], [5, -3, 1, 1]],   // til
  '̈': [[1, -2, 2, 1], [4, -2, 2, 1]],                         // trema
  '̧': [[3, 7, 2, 1], [4, 8, 1, 1], [2, 9, 3, 1]],             // cedilha (embaixo)
};
// separa cada letra em base + marca (só as maiúsculas acentuadas)
function split(s) {
  let plain = ''; const marks = [];
  for (const ch of s) {
    if (UPPER_ACCENT.test(ch)) { const d = ch.normalize('NFD'); marks.push([plain.length, d[1]]); plain += d[0]; }
    else plain += ch;
  }
  return { plain, marks };
}
export function plainUpper(s) { return split(s).plain; }
// desenha só os acentos de `s` (que começa em x, alinhado à esquerda, textBaseline 'top'), com o fillStyle atual
export function drawAccents(ctx, s, x, y, size) {
  const { plain, marks } = split(s), k = size / 8;
  for (const [i, m] of marks) {
    const lx = x + ctx.measureText(plain.slice(0, i)).width;
    for (const [mx, my, mw, mh] of MARK[m] || []) ctx.fillRect(Math.round(lx + mx * k), Math.round(y + my * k), Math.max(1, Math.round(mw * k)), Math.max(1, Math.round(mh * k)));
  }
}
// fillText que já cuida das maiúsculas com acento (respeita textAlign; textBaseline deve ser 'top')
export function fillTextAccents(ctx, s, x, y, size) {
  if (!hasUpperAccent(s)) { ctx.fillText(s, x, y); return; }
  const { plain } = split(s), w = ctx.measureText(plain).width, al = ctx.textAlign;
  const x0 = al === 'center' ? x - w / 2 : al === 'right' || al === 'end' ? x - w : x;
  ctx.textAlign = 'left'; ctx.fillText(plain, x0, y); drawAccents(ctx, s, x0, y, size); ctx.textAlign = al;
}
