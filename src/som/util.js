// Constantes e utilidades compartilhadas
export const TILE = 16;
export const COLS = 20;
export const ROWS = 11;
export const HUD_H = 16;
export const W = COLS * TILE;            // 320
export const ROOM_H = ROWS * TILE;       // 176
export const H = ROOM_H + HUD_H;         // 192

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
export const randi = (a, b) => Math.floor(rand(a, b + 1));
export const chance = (p) => Math.random() < p;
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Hash determinístico (para texturas procedurais estáveis)
export function hash(x, y, s = 0) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export const overlap = (a, b) =>
  Math.abs(a.x - b.x) < a.hw + b.hw && Math.abs(a.y - b.y) < a.hh + b.hh;

export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Direções: 0 baixo, 1 cima, 2 esquerda, 3 direita
export const DIRS = [[0, 1], [0, -1], [-1, 0], [1, 0]];
export function dirFromVec(x, y) {
  return Math.abs(x) > Math.abs(y) ? (x < 0 ? 2 : 3) : (y < 0 ? 1 : 0);
}

export function norm(x, y) {
  const l = Math.hypot(x, y) || 1;
  return [x / l, y / l];
}

// Controles "vazios" (menu aberto, contagem regressiva): o herói fica parado
export const NULL_PAD = { axis: () => ({ x: 0, y: 0 }), isDown: () => false, hit: () => false };

// duração (s) da viagem de foguete: para quem viaja, para quem só assiste, e o instante da troca de sala
export const ROCKET_T = { traveler: 6.2, watcher: 3.8, mid: 3.7 };
