// Trem sem fim da estação do Trem Infinito: vagões passam da esquerda para a direita sem parar e sem brecha.
// O movimento depende só do relógio (Date.now): todos os aparelhos veem o trem no mesmo lugar.
export const TRAIN = {
  rowY: 128,          // altura (px) do trilho dentro da tela
  speed: 150,         // px/s
  carW: 54, gap: 3,   // tamanho de cada vagão e do engate
};
export const TRAIN_PITCH = TRAIN.carW + TRAIN.gap;
export const TRAIN_HIT_Y = [106, 142];   // faixa vertical dos trilhos: encostar no trem é morte certa

// deslocamento do trem no instante `ms` e número do vagão (para alternar as cores)
export function trainState(ms = Date.now()) {
  const off = (ms / 1000) * TRAIN.speed;
  return { off: off % TRAIN_PITCH, n0: Math.floor(off / TRAIN_PITCH) };
}
