// Abertura da marca Song of Moonlight, no espírito do "G" do GameCube: uma luazinha brilhante quica sobre o escuro e,
// a cada quique, revela um pedaço do nome com uma notinha; a linha do "of" se abre do meio; no fim a luazinha voa
// para a lua crescente do "Moonlight", vira a própria lua com um acorde, uma luz passa pelas letras e tudo escurece.
// Toque ou tecla pula.
const T = { bg: 0.35, l1: [0.35, 1.25], of: [1.25, 1.55], l2: [1.55, 2.65], fly: [2.65, 2.95], flash: 2.95, shine: [3.05, 3.75], out: [3.75, 4.2] };
// áreas do logotipo (em pixels da imagem 900x366): linha "Song", linha do "of" e "Moonlight"; a lua crescente
const L1 = { x0: 160, x1: 612, y0: 0, y1: 172, base: 166, hop: 70, n: 4 };
const OF = { x0: 300, x1: 610, y0: 150, y1: 205 };
const L2 = { x0: 0, x1: 900, y0: 172, y1: 366, base: 318, hop: 92, n: 6 };
const MOON = { x: 272, y: 262, r: 46 };
const NOTES1 = [523.25, 659.25, 783.99, 880], NOTES2 = [587.33, 659.25, 783.99, 880, 1046.5, 1174.66];

function sounds() {
  let ac;
  try { ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (_) { return null; }
  const out = ac.createGain(); out.gain.value = 0.2; out.connect(ac.destination);
  const t0 = ac.currentTime + 0.05;
  const note = (f, at, d = 0.35, v = 0.5, type = 'sine') => {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type;
    o.frequency.setValueAtTime(f * 1.02, t0 + at); o.frequency.exponentialRampToValueAtTime(f, t0 + at + 0.05);   // um "plim" de marimba
    g.gain.setValueAtTime(0.0001, t0 + at); g.gain.exponentialRampToValueAtTime(v, t0 + at + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + d);
    o.connect(g); g.connect(out); o.start(t0 + at); o.stop(t0 + at + d + 0.05);
  };
  // quiques das duas linhas (subindo de tom)
  NOTES1.forEach((f, i) => note(f, T.l1[0] + (i + 1) * (T.l1[1] - T.l1[0]) / L1.n, 0.3, 0.45));
  NOTES2.forEach((f, i) => note(f, T.l2[0] + (i + 1) * (T.l2[1] - T.l2[0]) / L2.n, 0.28, 0.42));
  // o "of" se abrindo: um sopro curto
  try {
    const n = Math.floor(ac.sampleRate * 0.3), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / n) * 0.5;
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = b; f.type = 'bandpass'; f.frequency.setValueAtTime(800, t0 + T.of[0]); f.frequency.exponentialRampToValueAtTime(3200, t0 + T.of[1]); g.gain.value = 0.5;
    s.connect(f); f.connect(g); g.connect(out); s.start(t0 + T.of[0]);
  } catch (_) { /* sem sopro */ }
  // a luazinha virando a lua: acorde de sino com brilho
  for (const [f, d, v] of [[523.25, 1.8, 0.5], [659.25, 1.7, 0.36], [783.99, 1.6, 0.3], [1046.5, 1.4, 0.22], [2093, 0.6, 0.06]]) note(f, T.flash, d, v);
  setTimeout(() => ac.close().catch(() => {}), 5200);
  return ac;
}

const clamp = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => 1 - Math.pow(1 - clamp(v), 3);

// mostra a abertura; a promessa resolve quando ela termina (ou é pulada)
export function brandIntro(logo = 'icons/brand-logo.png') {
  return new Promise((done) => {
    if (document.getElementById('brand-intro')) return done();
    const el = document.createElement('div'); el.id = 'brand-intro';
    el.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;padding:0;border:0;z-index:2147483647;background:#000;cursor:pointer;overflow:hidden';
    const cv = document.createElement('canvas'); cv.style.cssText = 'width:100%;height:100%;display:block';
    el.appendChild(cv); document.body.appendChild(el);
    // camada do topo do navegador: fica por cima de qualquer coisa do jogo (canvas, telas de carregamento, menus)
    try { el.popover = 'manual'; el.showPopover(); } catch (_) { /* navegador antigo: z-index máximo */ }
    const img = new Image(); img.src = logo;
    let over = false, raf = 0, start = 0;
    const end = () => { if (over) return; over = true; cancelAnimationFrame(raf); el.remove(); removeEventListener('keydown', key, true); done(); };
    const key = (e) => { e.stopImmediatePropagation(); e.preventDefault(); end(); };   // a tecla que pula não chega ao jogo
    el.addEventListener('pointerdown', end);
    addEventListener('keydown', key, true);
    setTimeout(end, 6500);   // garantia
    const stars = Array.from({ length: 60 }, (_, i) => ({ x: (i * 37.7 % 100) / 100, y: ((i * 61.3 + 7) % 100) / 100, p: i * 0.9, s: i % 6 === 0 ? 2 : 1 }));
    const trail = [];
    let mask = null;
    const begin = () => { start = performance.now(); sounds(); raf = requestAnimationFrame(frame); };
    img.onload = begin; img.onerror = end;

    function frame(now) {
      if (over) return;
      const t = (now - start) / 1000, dpr = Math.min(devicePixelRatio || 1, 2);
      const W = Math.round(innerWidth * dpr), H = Math.round(innerHeight * dpr);
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; mask = null; }
      const c = cv.getContext('2d');
      // logotipo: até 64% da largura, no centro
      const lw = Math.min(W * 0.64, 620 * dpr), k = lw / img.width, lh = img.height * k, lx = (W - lw) / 2, ly = (H - lh) / 2;
      const P = (x, y) => [lx + x * k, ly + y * k];
      if (!mask) { mask = document.createElement('canvas'); mask.width = Math.ceil(lw); mask.height = Math.ceil(lh); mask.getContext('2d').drawImage(img, 0, 0, lw, lh); }
      // fundo: escuro → luar → escuro
      c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
      const bg = t < T.bg ? t / T.bg : t > T.out[0] ? 1 - clamp((t - T.out[0]) / (T.out[1] - T.out[0])) : 1;
      if (bg > 0) {
        const g = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
        g.addColorStop(0, '#3a4ab0'); g.addColorStop(0.32, '#1a2066'); g.addColorStop(0.62, '#070a24'); g.addColorStop(0.85, '#000');
        c.globalAlpha = bg; c.fillStyle = g; c.fillRect(0, 0, W, H);
        for (const s of stars) { c.globalAlpha = bg * (0.35 + 0.65 * Math.abs(Math.sin(t * 2.4 + s.p))); c.fillStyle = '#e8eeff'; c.fillRect(s.x * W, s.y * H, s.s * dpr, s.s * dpr); }
        c.globalAlpha = 1;
      }
      // posição da luazinha e quanto do nome já apareceu
      let ox = 0, oy = 0, orb = 0, r1 = 0, rOf = 0, r2 = 0;
      const bounce = (L, a, b) => {
        const p = clamp((t - a) / (b - a)), seg = p * L.n, i = Math.min(L.n - 1, Math.floor(seg)), f = seg - i;
        const x = L.x0 + (L.x1 - L.x0) * p, y = L.base - Math.sin(f * Math.PI) * L.hop * (1 - i * 0.08);
        return [x, y, p];
      };
      if (t >= T.l1[0] && t < T.l1[1]) { const [x, y] = bounce(L1, ...T.l1); ox = x; oy = y; orb = 1; r1 = x; }
      if (t >= T.l1[1]) r1 = 900;
      if (t >= T.of[0]) rOf = ease((t - T.of[0]) / (T.of[1] - T.of[0]));
      if (t >= T.of[0] && t < T.of[1]) { const p = (t - T.of[0]) / (T.of[1] - T.of[0]); ox = L1.x1 + (L2.x0 + 10 - L1.x1) * p; oy = 200 - Math.sin(p * Math.PI) * 60; orb = 1; }
      if (t >= T.l2[0] && t < T.l2[1]) { const [x, y] = bounce(L2, ...T.l2); ox = x; oy = y; orb = 1; r2 = x; }
      if (t >= T.l2[1]) r2 = 900;
      if (t >= T.fly[0] && t < T.fly[1]) { const p = ease((t - T.fly[0]) / (T.fly[1] - T.fly[0])); ox = L2.x1 + (MOON.x - L2.x1) * p; oy = L2.base - 120 * Math.sin(p * Math.PI) + (MOON.y - L2.base) * p; orb = 1 - p * 0.4; }
      // nome revelado (prateado) até onde a luazinha passou
      const fade = t > T.out[0] ? 1 - clamp((t - T.out[0]) / (T.out[1] - T.out[0])) : 1;
      c.save(); c.globalAlpha = fade; c.beginPath();
      if (r1 > 0) { const [x0, y0] = P(0, L1.y0), [x1, y1] = P(Math.min(r1, 900), L1.y1); c.rect(x0, y0, x1 - x0, y1 - y0); }
      if (rOf > 0) { const cx = (OF.x0 + OF.x1) / 2, hw = (OF.x1 - OF.x0) / 2 * rOf, [x0, y0] = P(cx - hw, OF.y0), [x1, y1] = P(cx + hw, OF.y1); c.rect(x0, y0, x1 - x0, y1 - y0); }
      if (r2 > 0) { const [x0, y0] = P(0, L2.y0), [x1, y1] = P(Math.min(r2, 900), L2.y1); c.rect(x0, y0, x1 - x0, y1 - y0); }
      c.clip();
      c.shadowColor = 'rgba(170,190,255,0.6)'; c.shadowBlur = 18 * dpr;
      c.filter = 'brightness(0.86)'; c.drawImage(img, lx, ly, lw, lh); c.filter = 'none';
      c.restore();
      // a lua crescente acende quando a luazinha chega
      if (t >= T.flash) {
        const p = t - T.flash, [mx, my] = P(MOON.x, MOON.y), rr = MOON.r * k * (1 + Math.max(0, 0.6 - p) * 1.2);
        const g = c.createRadialGradient(mx, my, 0, mx, my, rr * 1.6);
        g.addColorStop(0, `rgba(235,242,255,${0.75 * fade * Math.max(0.45, 1 - p)})`); g.addColorStop(0.5, `rgba(150,175,255,${0.3 * fade})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g; c.fillRect(mx - rr * 2, my - rr * 2, rr * 4, rr * 4);
        if (p < 0.2) { c.globalAlpha = (0.2 - p) * 1.4; c.fillStyle = '#dfe8ff'; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }   // clarão suave
      }
      // faixa de luz passando pelas letras
      if (t >= T.shine[0] && t < T.shine[1]) {
        const p = (t - T.shine[0]) / (T.shine[1] - T.shine[0]), bx = -0.3 * lw + p * 1.6 * lw;
        const s = document.createElement('canvas'); s.width = mask.width; s.height = mask.height; const sc = s.getContext('2d');
        const g = sc.createLinearGradient(bx - lw * 0.12, 0, bx + lw * 0.12, lh * 0.3);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        sc.fillStyle = g; sc.fillRect(0, 0, s.width, s.height); sc.globalCompositeOperation = 'destination-in'; sc.drawImage(mask, 0, 0);
        c.globalCompositeOperation = 'lighter'; c.drawImage(s, lx, ly); c.globalCompositeOperation = 'source-over';
      }
      // a luazinha e o rastro de brilho
      if (orb > 0) {
        const [x, y] = P(ox, oy), rr = 11 * k * orb;
        trail.push({ x, y }); while (trail.length > 14) trail.shift();
        trail.forEach((q, i) => { c.globalAlpha = (i / trail.length) * 0.35; c.fillStyle = '#bcd0ff'; c.beginPath(); c.arc(q.x, q.y, rr * (i / trail.length), 0, 7); c.fill(); });
        c.globalAlpha = 1;
        const g = c.createRadialGradient(x, y, 0, x, y, rr * 3);
        g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, '#e6eeff'); g.addColorStop(0.55, 'rgba(150,175,255,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g; c.beginPath(); c.arc(x, y, rr * 3, 0, 7); c.fill();
      } else trail.length = 0;
      if (t >= T.out[1]) return end();
      raf = requestAnimationFrame(frame);
    }
  });
}
