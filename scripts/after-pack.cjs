// Depois de empacotar o Windows: tira partes do Electron que o jogo não usa (ele é desenhado em canvas 2D, sem WebGL/WebGPU),
// para o instalador .exe ficar abaixo de 100 MB (o limite de vários apps de mensagem e de alguns sites para baixar).
//   dxcompiler.dll / dxil.dll: compilador de shaders do WebGPU (D3D12)
//   vk_swiftshader*: placa de vídeo "de mentira" para WebGL quando não há GPU
// O d3dcompiler_47.dll (usado pelo Chromium para desenhar) e o ffmpeg.dll continuam.
const fs = require('fs'), path = require('path');
exports.default = async function afterPack(ctx) {
  if (ctx.electronPlatformName !== 'win32') return;
  for (const f of ['dxcompiler.dll', 'dxil.dll', 'vk_swiftshader.dll', 'vk_swiftshader_icd.json']) {
    const p = path.join(ctx.appOutDir, f);
    if (fs.existsSync(p)) fs.rmSync(p);
  }
};
