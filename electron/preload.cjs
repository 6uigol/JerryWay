'use strict';
// Ponte segura entre o jogo e o Electron: o jogo só enxerga `window.desktop` com estas funções.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktop', Object.freeze({
  isDesktop: true,
  quit: () => ipcRenderer.send('app:quit'),   // botão Sair do jogo
  googleLogin: (cfg) => ipcRenderer.invoke('auth:google', JSON.parse(JSON.stringify(cfg))),   // { idToken, accessToken } do Google, login feito no navegador do sistema
}));
