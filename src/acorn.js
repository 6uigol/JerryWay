// A noz da Sorte em pixel art (32x32, ampliada): corpo sombreado com brilho, chapéu de escamas e cabinho.
// Parada ela flutua e brilha; ao tentar, treme cada vez mais, racha com a luz da raridade vazando,
// estoura em duas metades e a skin aparece no meio de raios de luz e confete.
const S = 32, OUT = '#2a160a';
const body = (x, y) => { const nx = (x + 0.5 - 16) / 8.6, ny = (y + 0.5 - 19.5) / 10; return nx * nx + ny * ny <= 1; };
const cap = (x, y) => { const nx = (x + 0.5 - 16) / 11, ny = (y + 0.5 - 11) / 5.2; return y <= 13 && nx * nx + ny * ny <= 1; };
const stem = (x, y) => x >= 15 && x <= 16 && y >= 3 && y <= 6;
// rachaduras (de cima para baixo), reveladas aos poucos
const CRACKS = [[[16, 13], [15, 16], [17, 19], [15, 22], [16, 25], [15, 28]], [[12, 15], [11, 18], [13, 21]], [[20, 16], [21, 19], [19, 22], [21, 25]]];

export function makeAcorn(canvas) {
  const c = canvas.getContext('2d'), img = c.createImageData(S, S), d = img.data;
  const base = document.createElement('canvas'); base.width = base.height = S;
  // desenha a noz uma vez (pixel a pixel, com contorno)
  const put = (x, y, hex) => { const i = (y * S + x) * 4; d[i] = parseInt(hex.slice(1, 3), 16); d[i + 1] = parseInt(hex.slice(3, 5), 16); d[i + 2] = parseInt(hex.slice(5, 7), 16); d[i + 3] = 255; };
  const solid = (x, y) => body(x, y) || cap(x, y) || stem(x, y);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    if (!solid(x, y)) { if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => solid(x + a, y + b))) put(x, y, OUT); continue; }
    if (stem(x, y)) { put(x, y, x === 15 ? '#7a4a22' : '#4a2a12'); continue; }
    if (cap(x, y)) {   // chapéu com escamas em xadrez, luz em cima à esquerda
      const nx = (x - 16) / 11, ny = (y - 11) / 5.2, l = -nx * 0.6 - ny * 0.8;
      const scale = (x + (y % 2) * 2) % 4 < 2;
      put(x, y, y === 13 ? '#3e2210' : l > 0.45 ? (scale ? '#b07a44' : '#9a6634') : l > -0.1 ? (scale ? '#8a5426' : '#74441c') : (scale ? '#5e3616' : '#4a2a10'));
      continue;
    }
    const nx = (x + 0.5 - 16) / 8.6, ny = (y + 0.5 - 19.5) / 10, l = -nx * 0.65 - ny * 0.6 + (1 - nx * nx - ny * ny) * 0.4;
    put(x, y, l > 0.75 ? '#f6cf86' : l > 0.4 ? '#e2a85a' : l > 0 ? '#c8863a' : l > -0.4 ? '#a2662a' : '#7a4a1e');
  }
  for (const [x, y] of [[11, 16], [12, 15], [11, 17], [12, 18]]) put(x, y, '#fff2c8');   // brilho
  put(16, 30, '#7a4a1e'); put(16, 31, OUT);                                                  // pontinha
  base.getContext('2d').putImageData(img, 0, 0);

  let mode = 'idle', t0 = performance.now(), color = '#ffffff', raf = 0, onBurst = null;
  const parts = [];
  function draw(now) {
    const t = (now - t0) / 1000, W = canvas.width, H = canvas.height, k = Math.floor(Math.min(W, H) / 48), cx = W / 2, cy = H / 2;
    c.clearRect(0, 0, W, H); c.imageSmoothingEnabled = false;
    const nut = (dx, dy, rot = 0, sx = 1, clip = 0) => {
      c.save(); c.translate(cx + dx, cy + dy); c.rotate(rot); c.scale(sx, 1);
      if (clip) { c.beginPath(); c.rect(clip < 0 ? -S * k / 2 : 0, -S * k / 2, S * k / 2, S * k); c.clip(); }
      c.drawImage(base, -S * k / 2, -S * k / 2, S * k, S * k); c.restore();
    };
    if (mode === 'idle') {
      const bob = Math.round(Math.sin(t * 2.2) * 2) * k / 2;
      c.globalAlpha = 0.25; c.fillStyle = '#000'; c.beginPath(); c.ellipse(cx, cy + 16 * k - bob * 0.3, 8 * k, 1.6 * k, 0, 0, 7); c.fill(); c.globalAlpha = 1;
      nut(0, bob);
      const sp = (t * 0.7) % 1; c.globalAlpha = Math.sin(sp * Math.PI); c.fillStyle = '#fff';   // brilhinho passando
      const sx = cx + (-6 + sp * 10) * k, sy = cy + (-8 + sp * 8) * k + bob; c.fillRect(sx - k / 2, sy - 2 * k, k, 4 * k); c.fillRect(sx - 2 * k, sy - k / 2, 4 * k, k); c.globalAlpha = 1;
    } else if (mode === 'shake') {
      const p = Math.min(1, t / 1.3), amp = (0.5 + p * 3) * k / 2, rot = Math.sin(t * (18 + p * 30)) * (0.04 + p * 0.12);
      c.globalAlpha = 0.25 + p * 0.4; const g = c.createRadialGradient(cx, cy, 0, cx, cy, 20 * k); g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.globalAlpha = 1;
      nut(Math.sin(t * 40) * amp, -Math.abs(Math.sin(t * 9)) * p * 3 * k, rot);
      // rachaduras com luz da raridade
      c.save(); c.translate(cx + Math.sin(t * 40) * amp, cy - Math.abs(Math.sin(t * 9)) * p * 3 * k); c.rotate(rot);
      const shown = p * CRACKS.length * 1.2;
      CRACKS.forEach((cr, i) => { const q = Math.max(0, Math.min(1, shown - i)); const n = Math.ceil(q * cr.length); c.strokeStyle = color; c.lineWidth = k; c.shadowColor = color; c.shadowBlur = 6 * k; c.beginPath(); cr.slice(0, n).forEach(([x, y], j) => { const X = (x - 16) * k, Y = (y - 16) * k; j ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.stroke(); });
      c.restore();
      if (p >= 1) { mode = 'burst'; t0 = now; for (let i = 0; i < 40; i++) parts.push({ a: Math.random() * 6.28, v: 40 + Math.random() * 120, s: 1 + Math.floor(Math.random() * 2), col: i % 3 ? color : '#ffffff' }); if (onBurst) onBurst(); }
    } else if (mode === 'burst' || mode === 'open') {
      // raios girando e confete; as duas metades da noz voam para os lados
      // tudo some em círculo antes da borda do canvas (sem cantos quadrados)
      const R = Math.min(W, H) / 2 - 2, pulse = 1 + Math.sin(t * 3) * 0.04;
      const ray = (col) => { const g = c.createRadialGradient(0, 0, 0, 0, 0, R * pulse); g.addColorStop(0, col); g.addColorStop(0.55, col); g.addColorStop(1, 'rgba(0,0,0,0)'); return g; };
      const rw = ray('#ffffff'), rc = ray(color);
      c.save(); c.translate(cx, cy); c.rotate(t * 0.6); c.globalAlpha = Math.min(1, t * 4) * 0.45;
      for (let i = 0; i < 12; i++) { c.fillStyle = i % 2 ? rc : rw; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R, i * Math.PI / 6, i * Math.PI / 6 + 0.17); c.closePath(); c.fill(); }
      c.restore(); c.globalAlpha = 1;
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.4, color + "77"); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
      if (t < 0.45) { const q = t / 0.45; c.globalAlpha = (1 - q) * (1 - q); nut(-q * 40 * k / 2, q * q * 30 * k / 2, -q * 1.4, 1, -1); nut(q * 40 * k / 2, q * q * 30 * k / 2, q * 1.4, 1, 1); c.globalAlpha = 1; }
      for (const pt of parts) { const r = Math.min(pt.v * Math.min(t, 1.6) * k / 3, Math.min(W, H) / 2 - 6 * k), x = cx + Math.cos(pt.a) * r, y = cy + Math.sin(pt.a) * r + t * t * 40 * k / 3; c.globalAlpha = Math.max(0, 1 - t / 1.8); c.fillStyle = pt.col; c.fillRect(Math.round(x), Math.round(y), pt.s * k, pt.s * k); }
      c.globalAlpha = 1;
      if (t > 0.3) mode = 'open';
    }
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);
  return {
    open(col, cb) { color = col; mode = 'shake'; t0 = performance.now(); parts.length = 0; onBurst = cb; },
    idle() { mode = 'idle'; t0 = performance.now(); parts.length = 0; },
    stop() { cancelAnimationFrame(raf); },
  };
}
