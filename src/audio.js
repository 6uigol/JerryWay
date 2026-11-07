// Sons sintetizados na hora (nada de arquivo de áudio): pulo, moeda, splash, batida, portal, trem, sorte e uma musiquinha.
let ac = null, master = null, musicGain = null, muted = false;
// volumes (0 a 1) escolhidos em Configurações; ficam no aparelho
const VOL_KEY = 'jw_audio';
const vol = { music: 1, sfx: 1 };
try { Object.assign(vol, JSON.parse(localStorage.getItem(VOL_KEY) || '{}')); } catch (_) { /* padrão */ }
function applyVol() { if (master) master.gain.value = muted ? 0 : 0.5 * vol.sfx; if (musicGain) musicGain.gain.value = muted ? 0 : 0.5 * 0.22 * vol.music; }
export const getVolume = (k) => vol[k];
export function setVolume(k, v) { vol[k] = Math.max(0, Math.min(1, Math.round(v * 10) / 10)); applyVol(); try { localStorage.setItem(VOL_KEY, JSON.stringify(vol)); } catch (_) { /* ok */ } }
export function initAudio() {
  if (ac) { if (ac.state === 'suspended' && !hiddenNow) ac.resume(); return; }
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.connect(ac.destination);
    musicGain = ac.createGain(); musicGain.connect(ac.destination);   // a música tem volume próprio, separado dos efeitos
    applyVol();
  } catch (_) { ac = null; }
}
export function setMuted(m) { muted = m; applyVol(); }
export const isMuted = () => muted;

function tone(freq, dur, type = 'square', vol = 0.3, slide = 0, delay = 0, dest = null) {
  if (!ac) return;
  const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, vol = 0.3, filt = 1200, delay = 0) {
  if (!ac) return;
  const t = ac.currentTime + delay, n = Math.floor(ac.sampleRate * dur), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = b; f.type = 'lowpass'; f.frequency.value = filt; g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(master); s.start(t);
}
export const sfx = {
  hop: () => tone(520 + Math.random() * 60, 0.07, 'square', 0.12, 260),
  bump: () => tone(140, 0.08, 'square', 0.15, -40),
  coin: () => { tone(988, 0.07, 'square', 0.14); tone(1319, 0.12, 'square', 0.14, 0, 0.06); },
  bigcoin: () => { [988, 1319, 1568, 1976].forEach((f, i) => tone(f, 0.09, 'square', 0.13, 0, i * 0.05)); },
  splash: () => { noise(0.45, 0.4, 900); tone(300, 0.3, 'sine', 0.2, -200); },
  hit: () => { noise(0.25, 0.45, 500); tone(110, 0.3, 'square', 0.25, -60); },
  roar: () => { noise(0.9, 0.4, 260); tone(70, 0.9, 'sawtooth', 0.22, -30); tone(55, 1.1, 'square', 0.12, -20, 0.1); },   // o monstro chegou
  ding: () => { tone(1760, 0.18, 'triangle', 0.12); tone(1760, 0.18, 'triangle', 0.12, 0, 0.25); },
  horn: () => { tone(330, 0.5, 'sawtooth', 0.12); tone(415, 0.5, 'sawtooth', 0.1); },
  portal: () => { for (let i = 0; i < 8; i++) tone(300 + i * 90, 0.25, 'sine', 0.12, 400, i * 0.07); },
  pass: () => { tone(784, 0.08, 'square', 0.12); tone(1047, 0.16, 'square', 0.12, 0, 0.08); },
  tick: () => tone(1200 + Math.random() * 400, 0.03, 'square', 0.08),
  reveal: (rank) => { const base = [523, 587, 659, 784, 1047][rank] || 523; [0, 4, 7, 12].forEach((s, i) => tone(base * Math.pow(2, s / 12), 0.22, 'square', 0.13, 0, i * 0.09)); if (rank >= 3) noise(0.6, 0.15, 6000, 0.3); },
  dup: () => { tone(330, 0.15, 'square', 0.12); tone(262, 0.25, 'square', 0.12, 0, 0.12); },
  click: () => tone(880, 0.04, 'square', 0.08),
  record: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.14, 'square', 0.13, 0, i * 0.08)); },
};

export const audioCtx = () => ac;
export const musicBus = () => musicGain;
// app em segundo plano (outra aba, minimizado, celular bloqueado ou outro app na frente): tudo fica em silêncio
let hiddenNow = false;
export function setBackground(hidden) {
  hiddenNow = hidden;
  if (!ac) return;
  if (hidden) { if (ac.state === 'running') ac.suspend(); }
  else if (ac.state === 'suspended') ac.resume().then(() => resumeHooks.forEach((f) => f()));
}
export const isBackground = () => hiddenNow;
const resumeHooks = new Set();
export const onResume = (f) => resumeHooks.add(f);
