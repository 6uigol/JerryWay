'use strict';
// Richard Entediado — casca Electron (Windows e Linux). O jogo é o mesmo HTML/CSS/JS, servido por app://jogo/
// (módulos ES não funcionam em file://).
const { app, BrowserWindow, Menu, protocol, net, shell, session, ipcMain } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT = path.join(__dirname, '..');
const DEV = !app.isPackaged && process.argv.includes('--dev');
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }]);
const SERVE = new Set(['index.html', 'style.css', 'src', 'vendor', 'icons', 'fonts']);
function serveGame(req) {
  const rel = decodeURIComponent(new URL(req.url).pathname).replace(/^\/+/, '') || 'index.html';
  const full = path.normalize(path.join(ROOT, rel));
  if (full !== ROOT && !full.startsWith(ROOT + path.sep)) return new Response('Proibido', { status: 403 });
  if (!SERVE.has(path.relative(ROOT, full).split(path.sep)[0])) return new Response('Não encontrado', { status: 404 });
  return net.fetch(pathToFileURL(full).toString());
}
// entrar com o Google: abre uma página local no navegador do sistema, que faz o login pelo Firebase e devolve os tokens
let win = null;
function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 800, minWidth: 480, minHeight: 480, backgroundColor: '#1a1226', show: false, title: 'Richard Entediado',
    fullscreen: true, frame: false,   // sempre em tela cheia, sem a barra com X, maximizar e minimizar (para sair: botão Sair do jogo)
    icon: path.join(ROOT, 'icons', process.platform === 'win32' ? 'app.ico' : 'icon-512.png'), autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, devTools: DEV, spellcheck: false, backgroundThrottling: false },
  });
  win.removeMenu();
  win.once('ready-to-show', () => win.show());
  win.loadURL('app://jogo/index.html');
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https:\/\//.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('app://jogo/')) e.preventDefault(); });
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') e.preventDefault();   // a tela cheia é fixa
    else if (!DEV && (input.key === 'F12' || input.key === 'F5' || (input.control && /^[r]$/i.test(input.key)) || (input.control && input.shift && /^[ijc]$/i.test(input.key)))) e.preventDefault();
  });
  win.on('leave-full-screen', () => { if (win) win.setFullScreen(true); });   // nada tira da tela cheia
  win.on('closed', () => { win = null; });
}
ipcMain.on('app:quit', () => app.quit());   // botão Sair do jogo
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
  app.whenReady().then(() => {
    if (process.platform === 'win32') app.setAppUserModelId('com.songofmoonlight.richard');
    protocol.handle('app', serveGame);
    Menu.setApplicationMenu(null);
    session.defaultSession.setPermissionRequestHandler((_wc, perm, cb) => cb(perm === 'fullscreen'));
    createWindow();
  });
  app.on('window-all-closed', () => app.quit());
}
