'use strict';
// Entrar com o Google no app desktop usando SÓ o Firebase (sem criar nada no Google Cloud):
// o app abre uma página local (http://localhost:PORTA) no navegador do sistema; essa página faz o login do Google pelo
// próprio Firebase (pop-up normal, "localhost" já é um domínio autorizado) e devolve os tokens ao app por um POST local.
const http = require('node:http');
const crypto = require('node:crypto');
const fs = require('node:fs');

const page = (config, state) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Jerry Way</title>
<style>body{font-family:system-ui,sans-serif;background:#1a1226;color:#fff;text-align:center;padding-top:16vh}button{font:18px system-ui;padding:14px 26px;border:0;border-radius:8px;background:#ffcc3a;color:#1a1030;cursor:pointer}p{color:#c8c0d8}</style></head>
<body><h2>Jerry Way</h2><p id="m">Toque no botão para entrar com a sua conta Google.</p><button id="b">Entrar com o Google</button>
<script type="module">
import { init, googleTokens } from '/b.js';
const cfg = ${JSON.stringify(config).replace(/</g, '\\u003c')}, state = ${JSON.stringify(state)};
const m = document.getElementById('m'), b = document.getElementById('b');
try { init(cfg); } catch (e) { m.textContent = 'Não foi possível iniciar o login.'; }
b.onclick = async () => {
  b.disabled = true; m.textContent = 'Aguarde…';
  try {
    const t = await googleTokens();
    await fetch('/done', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ state, idToken: t.idToken, accessToken: t.accessToken }) });
    b.hidden = true; m.textContent = 'Pronto! Pode fechar esta aba e voltar ao jogo.';
  } catch (e) { b.disabled = false; m.textContent = e && e.code === 'auth/popup-closed-by-user' ? 'Login cancelado. Toque de novo para tentar.' : 'Não foi possível entrar (' + ((e && (e.code || e.message)) || 'erro') + ').'; }
};
</script></body></html>`;

module.exports = function googleFlow({ config, open, bundlePath, timeoutMs = 180000 }) {
  if (!config || typeof config.apiKey !== 'string' || typeof config.projectId !== 'string') return Promise.reject(new Error('Login com o Google não está configurado.'));
  const state = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    let done = false, timer = null;
    const srv = http.createServer((req, res) => {
      const u = new URL(req.url, 'http://localhost');
      if (req.method === 'GET' && u.pathname === '/' && u.searchParams.get('s') === state) {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); res.end(page(config, state)); return;
      }
      if (req.method === 'GET' && u.pathname === '/b.js') {
        res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' }); fs.createReadStream(bundlePath).pipe(res); return;
      }
      if (req.method === 'POST' && u.pathname === '/done') {
        let body = '';
        req.on('data', (c) => { body += c; if (body.length > 20000) req.destroy(); });
        req.on('end', () => {
          let j = null; try { j = JSON.parse(body); } catch (_) { /* inválido */ }
          const hasId = j && typeof j.idToken === 'string' && j.idToken.length > 0;
          const hasAccess = j && typeof j.accessToken === 'string' && j.accessToken.length > 0;
          if (!j || j.state !== state || (!hasId && !hasAccess)) { res.writeHead(400); res.end(); return; }
          res.writeHead(200); res.end('ok'); finish(null, { idToken: hasId ? j.idToken : undefined, accessToken: hasAccess ? j.accessToken : undefined });
        });
        return;
      }
      res.writeHead(404); res.end();
    });
    const finish = (err, val) => { if (done) return; done = true; clearTimeout(timer); setTimeout(() => srv.close(), 500); err ? reject(err) : resolve(val); };
    timer = setTimeout(() => finish(new Error('Tempo esgotado. Tente de novo.')), timeoutMs);
    srv.on('error', (e) => finish(e));
    srv.listen(0, 'localhost', () => { try { open('http://localhost:' + srv.address().port + '/?s=' + state); } catch (e) { finish(e); } });
  });
};
