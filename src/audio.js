// Sons sintetizados na hora (nada de arquivo de áudio): pulo, moeda, splash, batida, portal, trem, sorte e uma musiquinha.
let ac = null, master = null, musicGain = null, muted = false, musicOn = true, musicTimer = null;
export function initAudio() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = muted ? 0 : 0.5; master.connect(ac.destination);
    musicGain = ac.createGain(); musicGain.gain.value = 0.16; musicGain.connect(master);
  } catch (_) { ac = null; }
}
export function setMuted(m) { muted = m; if (master) master.gain.value = m ? 0 : 0.5; }
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

// musiquinha alegre em loop (melodia + baixo), feita de notas curtas
const MEL = [76, 79, 81, 79, 76, 74, 72, 74, 76, 76, 79, 81, 84, 81, 79, 0, 74, 76, 77, 76, 74, 72, 71, 72, 74, 74, 76, 79, 76, 74, 72, 0];
const BASS = [48, 48, 55, 55, 53, 53, 55, 55];
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
let step = 0;
export function setMusic(on) { musicOn = on; if (!on) stopMusic(); else startMusic(); }
export const musicEnabled = () => musicOn;
export function startMusic() {
  if (!ac || !musicOn || musicTimer) return;
  const beat = 0.16;
  musicTimer = setInterval(() => {
    if (!ac || muted) return;
    const n = MEL[step % MEL.length]; if (n) tone(midi(n), beat * 0.9, 'square', 0.5, 0, 0, musicGain);
    if (step % 4 === 0) tone(midi(BASS[(step / 4) % BASS.length]), beat * 3.5, 'triangle', 0.9, 0, 0, musicGain);
    step++;
  }, 160);
}
export function stopMusic() { clearInterval(musicTimer); musicTimer = null; }
