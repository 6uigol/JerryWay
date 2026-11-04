// Trilha do Jerry's Way: 15 músicas compostas por regras, cada uma com nome, andamento, tom, modo, timbres e uma forma
// longa (introdução, A, A', B, B', ponte, A'', B'', variação e final), de 2 a 3 minutos e meio. Tocam uma depois da
// outra numa ordem embaralhada; a melodia muda a cada parte, então nada fica repetindo em loop curto.
import { audioCtx, musicBus } from './audio.js';

export const SONGS = [
  { name: 'Caminho Sem Fim', bpm: 124, root: 60, mode: 'major', lead: 'pulse25', feel: 'drive', seed: 101 },
  { name: 'Campo de Brumavale', bpm: 112, root: 62, mode: 'major', lead: 'square', feel: 'bounce', seed: 202 },
  { name: 'Floresta Sombria', bpm: 92, root: 57, mode: 'dorian', lead: 'triangle', feel: 'shuffle', seed: 303 },
  { name: 'Dunas ao Meio-Dia', bpm: 104, root: 62, mode: 'phrygianDom', lead: 'pulse25', feel: 'march', seed: 404 },
  { name: 'Picos Gelados', bpm: 98, root: 64, mode: 'major', lead: 'triangle', feel: 'soft', seed: 505 },
  { name: 'Lacrímora', bpm: 86, root: 58, mode: 'minor', lead: 'sine', feel: 'soft', seed: 606 },
  { name: 'Valsa da Lua', bpm: 90, root: 65, mode: 'lydian', lead: 'triangle', feel: 'soft', seed: 707 },
  { name: 'Trem Infinito', bpm: 140, root: 57, mode: 'minor', lead: 'square', feel: 'drive', seed: 808 },
  { name: 'Moedinhas', bpm: 120, root: 67, mode: 'major', lead: 'pulse25', feel: 'bounce', seed: 909 },
  { name: 'Rio de Troncos', bpm: 108, root: 60, mode: 'mixolydian', lead: 'square', feel: 'shuffle', seed: 1010 },
  { name: 'Marélia', bpm: 94, root: 63, mode: 'dorian', lead: 'sine', feel: 'soft', seed: 1111 },
  { name: 'Noite em Selênia', bpm: 84, root: 55, mode: 'minor', lead: 'triangle', feel: 'soft', seed: 1212 },
  { name: 'Corrida das Carroças', bpm: 136, root: 62, mode: 'mixolydian', lead: 'pulse25', feel: 'drive', seed: 1313 },
  { name: 'Sorte Grande', bpm: 116, root: 65, mode: 'major', lead: 'square', feel: 'bounce', seed: 1414 },
  { name: 'Rabo de Esquilo', bpm: 128, root: 59, mode: 'dorian', lead: 'pulse25', feel: 'march', seed: 1515 },
];
const SCALES = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], mixolydian: [0, 2, 4, 5, 7, 9, 10], lydian: [0, 2, 4, 6, 7, 9, 11], phrygianDom: [0, 1, 4, 5, 7, 8, 10] };
const PROGS = {
  bright: [[0, 4, 5, 3], [0, 5, 3, 4], [5, 3, 0, 4], [0, 3, 4, 4], [3, 4, 2, 5], [0, 2, 3, 4], [3, 0, 4, 5], [5, 4, 3, 4]],
  dark: [[0, 5, 2, 6], [0, 3, 6, 2], [0, 6, 5, 4], [0, 2, 6, 5], [5, 6, 0, 0], [3, 4, 0, 6], [0, 3, 4, 0], [5, 3, 6, 4]],
};
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const pick = (r, a) => a[Math.floor(r() * a.length)];

// ---------------------------------------------------------------- composição (lista de notas da música inteira)
// passo = semicolcheia (16 por compasso); evento = { s: passo, d: duração, n: nota MIDI, i: instrumento, v: volume }
export function compose(song) {
  const r = rng(song.seed), sc = SCALES[song.mode], dark = ['minor', 'dorian', 'phrygianDom'].includes(song.mode);
  const deg = (d, oct = 0) => song.root + sc[((d % 7) + 7) % 7] + 12 * (Math.floor(d / 7) + oct);
  const progs = [...PROGS[dark ? 'dark' : 'bright']].sort(() => r() - 0.5);
  const forms = [['intro', 4, 0], ['A', 8, 0], ['A2', 8, 0], ['B', 8, 1], ['B2', 8, 1], ['C', 8, 2], ['A3', 8, 0], ['B3', 8, 1], ['D', 8, 3], ['outro', 4, 0]];
  const ev = [];
  const motifs = {};
  // ritmos de frase (2 compassos): mais densos nas músicas rápidas
  const RHY = song.feel === 'soft' ? [[0, 4, 8, 12, 20, 24], [0, 6, 8, 16, 20, 28], [0, 8, 12, 16, 24], [0, 4, 6, 8, 16, 24, 28]]
    : [[0, 2, 4, 6, 8, 12, 16, 20, 24, 28], [0, 3, 6, 8, 10, 12, 16, 19, 22, 24], [0, 4, 6, 8, 12, 14, 16, 18, 20, 24, 28], [0, 2, 4, 8, 10, 12, 16, 18, 20, 22, 24, 26]];
  const makeMotif = () => {
    const rh = pick(r, RHY), steps = [];
    let d = Math.floor(r() * 5);
    for (const s of rh) { d += pick(r, [-2, -1, -1, 1, 1, 2, 0, 3, -3]); d = Math.max(-2, Math.min(9, d)); steps.push([s, d]); }
    return steps;
  };
  let bar0 = 0;
  for (const [name, bars, part] of forms) {
    const prog = progs[part % progs.length], chordOf = (b) => prog[b % 4];
    const key = name.replace(/\d/, '');
    if (!motifs[key]) motifs[key] = [makeMotif(), makeMotif()];
    const [m1, m2] = motifs[key], varied = /\d/.test(name);   // A2, B2, A3... reaproveitam o tema com variações
    const intro = name === 'intro' || name === 'outro';
    for (let b = 0; b < bars; b++) {
      const s0 = (bar0 + b) * 16, ch = chordOf(b), root = deg(ch, -2);
      // baixo
      const bp = song.feel === 'drive' ? [0, 4, 8, 12] : song.feel === 'march' ? [0, 6, 8, 14] : song.feel === 'shuffle' ? [0, 6, 10] : song.feel === 'soft' ? [0, 8] : [0, 6, 8, 12];
      bp.forEach((st, k) => ev.push({ s: s0 + st, d: song.feel === 'soft' ? 7 : 3, n: k % 2 && song.feel !== 'soft' ? deg(ch + 4, -2) : root, i: 'bass', v: 0.9 }));
      // acordes / arpejo
      const tri = [deg(ch, -1), deg(ch + 2, -1), deg(ch + 4, -1)];
      if (song.feel === 'soft' || part === 2) ev.push(...tri.map((n) => ({ s: s0, d: 16, n, i: 'pad', v: 0.5 })));
      else for (let k = 0; k < 8; k++) ev.push({ s: s0 + k * 2, d: 2, n: tri[(k + (b % 2)) % 3] + (k > 3 && part === 1 ? 12 : 0), i: 'arp', v: 0.45 });
      // bateria
      if (!(name === 'intro' && b < 2)) for (let st = 0; st < 16; st++) {
        if (song.feel === 'soft') { if (st === 0 || (st === 10 && b % 2)) ev.push({ s: s0 + st, i: 'kick', v: 0.5 }); if (st % 4 === 2 && part !== 2) ev.push({ s: s0 + st, i: 'hat', v: 0.25 }); continue; }
        if (st % 8 === 0 || (song.feel === 'drive' && st % 4 === 0) || (song.feel === 'bounce' && st === 6)) ev.push({ s: s0 + st, i: 'kick', v: 0.9 });
        if (st === 4 || st === 12) ev.push({ s: s0 + st, i: 'snare', v: part === 2 ? 0.4 : 0.75 });
        if (st % 2 === 0 || (song.feel === 'drive' && part !== 2)) ev.push({ s: s0 + st, i: 'hat', v: st % 4 === 0 ? 0.35 : 0.22 });
      }
      if (b === bars - 1 && !intro) for (const st of [10, 12, 14]) ev.push({ s: s0 + st, i: 'snare', v: 0.5 });   // virada no fim da parte
    }
    // melodia: frases de 2 compassos; cada nota encaixa no acorde do momento
    if (!intro) for (let ph = 0; ph < bars / 2; ph++) {
      const m = ph % 2 === 0 ? m1 : m2, last = ph === bars / 2 - 1;
      m.forEach(([st, d], k) => {
        const b = ph * 2 + (st >= 16 ? 1 : 0), ch = chordOf(b);
        let dd = d + (varied ? (ph % 2 ? 1 : 0) + (name === 'A3' ? 2 : 0) : 0);
        if (st % 8 === 0) { const tones = [ch, ch + 2, ch + 4, ch + 7]; dd = tones.reduce((a, t) => (Math.abs(t - dd) < Math.abs(a - dd) ? t : a), tones[0]); }   // tempo forte: nota do acorde
        if (last && k === m.length - 1) dd = ch;   // fecha a frase no acorde
        const nx = m[k + 1] ? m[k + 1][0] : 32, dur = Math.max(1, Math.min(6, nx - st));
        const oct = part === 2 ? -1 : name === 'D' ? 1 : 0;
        ev.push({ s: (bar0 + ph * 2) * 16 + st, d: dur, n: deg(dd, oct), i: name === 'D' ? 'arp' : 'lead', v: name === 'D' ? 0.7 : 0.85 });
        if (varied && dur >= 4 && r() < 0.35) ev.push({ s: (bar0 + ph * 2) * 16 + st + 2, d: 2, n: deg(dd + 1, oct), i: 'lead', v: 0.6 });   // enfeite
      });
    }
    bar0 += bars;
  }
  ev.sort((a, b) => a.s - b.s);
  return { ev, steps: bar0 * 16, stepDur: 60 / song.bpm / 4 };
}

// ---------------------------------------------------------------- tocador (agenda as notas um pouco à frente)
let on = true, timer = null, playlist = [], cur = null, onSong = null;
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
let pulse = null;
function voice(type) {
  const ac = audioCtx();
  if (type === 'pulse25') {
    if (!pulse) { const N = 32, re = new Float32Array(N), im = new Float32Array(N); for (let k = 1; k < N; k++) im[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * 0.25); pulse = ac.createPeriodicWave(re, im); }
    const o = ac.createOscillator(); o.setPeriodicWave(pulse); return o;
  }
  const o = ac.createOscillator(); o.type = type; return o;
}
function play(e, t, stepDur) {
  const ac = audioCtx(), bus = musicBus(); if (!ac || !bus) return;
  if (e.i === 'kick' || e.i === 'snare' || e.i === 'hat') {
    if (e.i === 'kick') { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12); g.gain.setValueAtTime(0.9 * e.v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15); o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.16); return; }
    const len = e.i === 'hat' ? 0.04 : 0.14, n = Math.floor(ac.sampleRate * len), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
    for (let k = 0; k < n; k++) d[k] = (Math.random() * 2 - 1) * (1 - k / n);
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = b; f.type = e.i === 'hat' ? 'highpass' : 'bandpass'; f.frequency.value = e.i === 'hat' ? 7000 : 1800; g.gain.value = (e.i === 'hat' ? 0.35 : 0.6) * e.v;
    s.connect(f); f.connect(g); g.connect(bus); s.start(t); return;
  }
  const song = cur.song, type = e.i === 'bass' ? 'triangle' : e.i === 'pad' ? 'sawtooth' : e.i === 'arp' ? 'square' : song.lead;
  const o = voice(type), g = ac.createGain(), dur = e.d * stepDur;
  o.frequency.setValueAtTime(midi(e.n), t);
  const vol = { lead: 0.32, bass: 0.42, arp: 0.1, pad: 0.06 }[e.i] * e.v * (type === 'sine' || type === 'triangle' ? 1.6 : 1);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + (e.i === 'pad' ? 0.25 : 0.008));
  g.gain.setValueAtTime(vol * 0.75, t + Math.min(dur * 0.4, 0.15)); g.gain.exponentialRampToValueAtTime(0.0008, t + dur * 0.95 + (e.i === 'pad' ? 0.3 : 0.02));
  let out = g;
  if (e.i === 'pad') { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1200; g.connect(f); out = f; }
  if (e.i === 'lead' && dur > 0.35) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 5.5; lg.gain.value = midi(e.n) * 0.008; l.connect(lg); lg.connect(o.frequency); l.start(t + 0.18); l.stop(t + dur + 0.3); }   // vibrato nas notas longas
  o.connect(g); out.connect(bus); o.start(t); o.stop(t + dur + 0.35);
}
function nextSong() {
  if (!playlist.length) { playlist = SONGS.map((_, i) => i).sort(() => Math.random() - 0.5); if (cur && playlist[0] === cur.idx) playlist.push(playlist.shift()); }
  const idx = playlist.shift(), song = SONGS[idx], c = compose(song);
  cur = { idx, song, ...c, i: 0, t0: audioCtx().currentTime + 0.3 };
  if (onSong) onSong(song.name);
}
function tick() {
  const ac = audioCtx(); if (!ac || !on || ac.state !== 'running') return;
  if (!cur) nextSong();
  const ahead = ac.currentTime + 0.25;
  while (cur.i < cur.ev.length && cur.t0 + cur.ev[cur.i].s * cur.stepDur < ahead) { const e = cur.ev[cur.i++]; play(e, Math.max(ac.currentTime, cur.t0 + e.s * cur.stepDur), cur.stepDur); }
  if (cur.i >= cur.ev.length && ac.currentTime > cur.t0 + cur.steps * cur.stepDur + 1.5) nextSong();   // 1,5 s de pausa e a próxima
}
export function startMusic() { if (!on || timer || !audioCtx()) return; timer = setInterval(tick, 60); tick(); }
export function stopMusic() { clearInterval(timer); timer = null; }
export function setMusic(v) { on = v; if (!on) { stopMusic(); cur = null; } else startMusic(); }
export const musicEnabled = () => on;
export const onSongChange = (fn) => { onSong = fn; };
// se o tempo pulou (o app ficou em segundo plano), retoma a música atual do ponto em que parou
export function resyncMusic() { const ac = audioCtx(); if (cur && ac) { const s = cur.i < cur.ev.length ? cur.ev[cur.i].s : cur.steps; cur.t0 = ac.currentTime + 0.2 - s * cur.stepDur; } }
