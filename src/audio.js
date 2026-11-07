// Som do Richard Is Bored, todo sintetizado: músicas psicodélicas (eco com repetição, filtro que "respira",
// sintetizadores desafinados) que aceleram junto com o jogo, vinhetas entre minijogos e efeitos.
let ac = null, out = null, musicBus = null, sfxBus = null, echoIn = null;
const vol = { music: 0.7, sfx: 0.8 };
export function initAudio() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return ac; }
  try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { return null; }
  out = ac.createDynamicsCompressor(); out.connect(ac.destination);
  musicBus = ac.createGain(); sfxBus = ac.createGain(); musicBus.connect(out); sfxBus.connect(out);
  // eco psicodélico: atraso com repetição e um filtro que vai e volta
  echoIn = ac.createGain(); const dl = ac.createDelay(1.5), fb = ac.createGain(), wet = ac.createGain(), lp = ac.createBiquadFilter();
  dl.delayTime.value = 0.33; fb.gain.value = 0.45; wet.gain.value = 0.5; lp.type = 'lowpass'; lp.frequency.value = 2200;
  echoIn.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(wet); wet.connect(musicBus);
  const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 0.15; lg.gain.value = 0.012; lfo.connect(lg); lg.connect(dl.delayTime); lfo.start();
  applyVolume(); return ac;
}
export function setVolumes(m, s) { vol.music = m; vol.sfx = s; applyVolume(); }
function applyVolume() { if (musicBus) musicBus.gain.value = vol.music * 0.5; if (sfxBus) sfxBus.gain.value = vol.sfx * 0.55; }
export const audioReady = () => !!ac;
const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);

function voice({ f, at, d, type = 'square', v = 0.2, bus = musicBus, echo = 0, slide = 0, cutoff = 0, detune = 0, attack = 0.005 }) {
  if (!ac || !bus) return;
  const t = at ?? ac.currentTime, o = ac.createOscillator(), gn = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * slide), t + d); if (detune) o.detune.value = detune;
  gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(v, t + attack); gn.gain.exponentialRampToValueAtTime(0.0001, t + d);
  let node = o;
  if (cutoff) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 8; fl.frequency.setValueAtTime(cutoff * 3, t); fl.frequency.exponentialRampToValueAtTime(cutoff, t + d * 0.8); o.connect(fl); node = fl; }
  node.connect(gn); gn.connect(bus); if (echo && echoIn) { const e = ac.createGain(); e.gain.value = echo; gn.connect(e); e.connect(echoIn); }
  o.start(t); o.stop(t + d + 0.05);
}
function noise({ at, d = 0.05, v = 0.15, hp = 6000, bus = musicBus }) {
  if (!ac || !bus) return;
  const t = at ?? ac.currentTime, n = Math.max(1, Math.floor(ac.sampleRate * d)), b = ac.createBuffer(1, n, ac.sampleRate), ch = b.getChannelData(0);
  for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), gn = ac.createGain(); s.buffer = b; f.type = 'highpass'; f.frequency.value = hp; gn.gain.value = v;
  s.connect(f); f.connect(gn); gn.connect(bus); s.start(t);
}
const kick = (at, v = 0.7) => voice({ f: 150, at, d: 0.18, type: 'sine', v, slide: 0.25 });
const snare = (at, v = 0.25) => { noise({ at, d: 0.12, v, hp: 1800 }); voice({ f: 220, at, d: 0.08, type: 'triangle', v: v * 0.6, slide: 0.5 }); };

// ---------------------------------------------------------------- músicas (sequenciador em passos de 1/16)
// cada música: bpm base, escala, baixo, arpejo e bateria; `tempo` acelera tudo
const SONGS = {
  // título: sonho lento, pads desafinados e notas de vidro com muito eco
  title: { bpm: 84, steps: 32, play(s, at, st) {
    const prog = [57, 53, 50, 52][Math.floor(s / 8) % 4];
    if (s % 8 === 0) for (const k of [0, 7, 12, 15]) { voice({ f: hz(prog + k - 12), at, d: st * 8.5, type: 'sawtooth', v: 0.035, detune: -12, cutoff: 700, attack: 0.4 }); voice({ f: hz(prog + k - 12), at, d: st * 8.5, type: 'sawtooth', v: 0.035, detune: 12, cutoff: 700, attack: 0.4 }); }
    if (s % 2 === 0 && Math.sin(s * 1.7) > -0.2) voice({ f: hz(prog + [12, 19, 24, 27, 31, 24, 19, 15][(s / 2) % 8] + 12), at, d: st * 1.6, type: 'sine', v: 0.08, echo: 0.9 });
  } },
  // palco entre minijogos: groove "tum-tá" com baixo pulando oitavas e órgão psicodélico
  stage: { bpm: 128, steps: 16, play(s, at, st) {
    const root = [45, 45, 48, 43][Math.floor(s / 4) % 4];
    if (s % 4 === 0) kick(at); if (s % 8 === 4) snare(at); if (s % 2 === 1) noise({ at, d: 0.03, v: 0.06 });
    if (s % 2 === 0) voice({ f: hz(root + (s % 4 === 2 ? 12 : 0) - 12), at, d: st * 1.8, type: 'square', v: 0.12, cutoff: 500 });
    voice({ f: hz(root + [12, 15, 19, 22, 24, 22, 19, 15][s % 8] + 12), at, d: st * 0.9, type: 'triangle', v: 0.05, echo: 0.6 });
  } },
  // durante o minijogo: mais nervosa, arpejo rápido em escala frígia e um "wah" no baixo
  micro: { bpm: 140, steps: 16, play(s, at, st) {
    const root = [40, 41, 40, 43][Math.floor(s / 4) % 4];
    if (s % 4 === 0) kick(at, 0.6); if (s % 4 === 2) noise({ at, d: 0.04, v: 0.08 }); if (s % 8 === 4) snare(at, 0.2);
    voice({ f: hz(root - 12 + (s % 2 ? 12 : 0)), at, d: st * 0.9, type: 'sawtooth', v: 0.08, cutoff: 300 + (s % 8) * 140 });
    if (s % 2 === 0) voice({ f: hz(root + 24 + [0, 1, 5, 7, 8, 7, 5, 1][(s / 2) % 8]), at, d: st * 1.2, type: 'square', v: 0.04, echo: 0.5, detune: 8 });
  } },
  // chefe: tudo mais grave, sirene e bateria dobrada
  boss: { bpm: 150, steps: 16, play(s, at, st) {
    const root = [38, 38, 39, 36][Math.floor(s / 4) % 4];
    if (s % 2 === 0) kick(at, 0.65); if (s % 4 === 2) snare(at, 0.25); noise({ at, d: 0.02, v: 0.04 });
    voice({ f: hz(root - 12), at, d: st * 0.95, type: 'sawtooth', v: 0.1, cutoff: 400 });
    if (s % 8 === 0) voice({ f: hz(root + 24), at, d: st * 7, type: 'sawtooth', v: 0.04, slide: 1.5, echo: 0.6 });
    if (s % 4 === 1) voice({ f: hz(root + 19), at, d: st * 1.5, type: 'square', v: 0.035, echo: 0.6 });
  } },
};
let song = null, step = 0, nextAt = 0, tempo = 1, timer = 0;
export function playSong(name, tmp = 1) {
  tempo = tmp; if (song === SONGS[name]) return; song = SONGS[name] || null; step = 0; if (ac) nextAt = ac.currentTime + 0.05;
}
export const setTempo = (t) => { tempo = t; };
export function stopSong() { song = null; }
// chamado todo quadro: agenda as notas que tocam nos próximos 120 ms
export function pumpMusic() {
  if (!ac || !song) return;
  const st = 60 / (song.bpm * tempo) / 4;
  if (nextAt < ac.currentTime - 0.2) nextAt = ac.currentTime + 0.02;
  while (nextAt < ac.currentTime + 0.12) { song.play(step % song.steps, nextAt, st); step++; nextAt += st; }
}

// ---------------------------------------------------------------- vinhetas e efeitos
const seq = (notes, gap, o = {}) => { if (!ac) return; const t0 = ac.currentTime + 0.02; notes.forEach((n, i) => n != null && voice({ f: hz(n), at: t0 + i * gap, d: gap * 1.6, bus: sfxBus, ...o })); };
export const sfx = {
  win: () => { seq([72, 76, 79, 84], 0.07, { type: 'square', v: 0.18 }); voice({ f: hz(96), at: ac && ac.currentTime + 0.3, d: 0.4, type: 'triangle', v: 0.12, bus: sfxBus }); },
  lose: () => { seq([67, 66, 65, 60], 0.12, { type: 'sawtooth', v: 0.14 }); noise({ d: 0.4, v: 0.15, hp: 300, bus: sfxBus }); },
  tick: () => voice({ f: 1400, d: 0.03, type: 'square', v: 0.08, bus: sfxBus }),
  blip: () => voice({ f: 880, d: 0.06, type: 'triangle', v: 0.18, bus: sfxBus, slide: 1.5 }),
  hit: () => { noise({ d: 0.12, v: 0.25, hp: 900, bus: sfxBus }); voice({ f: 120, d: 0.15, type: 'square', v: 0.15, slide: 0.5, bus: sfxBus }); },
  catch: () => seq([84, 91], 0.05, { type: 'square', v: 0.14 }),
  jump: () => voice({ f: 300, d: 0.16, type: 'square', v: 0.12, slide: 2.5, bus: sfxBus }),
  zap: () => voice({ f: 1600, d: 0.12, type: 'sawtooth', v: 0.08, slide: 0.3, bus: sfxBus }),
  whoosh: () => { noise({ d: 0.35, v: 0.12, hp: 1200, bus: sfxBus }); voice({ f: 200, d: 0.35, type: 'sine', v: 0.1, slide: 4, bus: sfxBus }); },
  slam: () => { kick(ac && ac.currentTime, 0.9); noise({ d: 0.2, v: 0.2, hp: 2000, bus: sfxBus }); },
  // "mais rápido!": sirene subindo
  speed: () => { for (let i = 0; i < 8; i++) seq([60 + i * 3], 0, { type: 'square', v: 0.08, at: ac && ac.currentTime + i * 0.06 }); voice({ f: 200, d: 0.6, type: 'sawtooth', v: 0.08, slide: 6, bus: sfxBus }); },
  boss: () => { voice({ f: hz(38), d: 1.2, type: 'sawtooth', v: 0.18, bus: sfxBus, cutoff: 600 }); seq([62, 63, 62, 63, 62, 63], 0.1, { type: 'square', v: 0.1 }); },
  clear: () => seq([72, 76, 79, 84, 79, 84, 88, 91], 0.09, { type: 'square', v: 0.16, echo: 0.6 }),
  over: () => seq([64, 63, 62, 61, 60, 59, 58, 57, null, 45], 0.14, { type: 'triangle', v: 0.2, echo: 0.8 }),
  // nota de cada runa do quebra-cabeça do chefe (escala pentatônica, com eco)
  note: (i) => voice({ f: hz(64 + [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26][i % 12]), d: 0.35, type: 'triangle', v: 0.22, bus: sfxBus, echo: 0.4 }),
  // a vela que apaga (perdeu uma vida)
  snuff: () => { noise({ d: 0.5, v: 0.12, hp: 400, bus: sfxBus }); voice({ f: 500, d: 0.4, type: 'sine', v: 0.08, slide: 0.3, bus: sfxBus }); },
};
