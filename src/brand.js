// Abertura da marca Song of Moonlight, como abertura de filme: o escuro clareia num degradê azul de luar, o logotipo
// aparece com um som curto de sino e depois tudo fecha de volta para o escuro antes do jogo. Toque ou tecla pula.
const CSS = `
#brand-intro{position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;padding:0;border:0;z-index:2147483647;background:#000;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;
  animation:bi-out .45s ease-in 2.75s forwards}
#brand-intro::backdrop{background:transparent}
#brand-intro .bi-glow{position:absolute;inset:-20%;opacity:0;background:radial-gradient(ellipse at 50% 50%,#3a4ab0 0%,#1a2066 32%,#070a24 62%,#000 82%);
  animation:bi-glow 2.75s ease-in-out forwards}
#brand-intro img{position:relative;width:min(64vw,620px);height:auto;opacity:0;filter:drop-shadow(0 0 18px rgba(170,190,255,.55));
  animation:bi-logo 2.75s ease-in-out forwards}
@keyframes bi-glow{0%{opacity:0}35%{opacity:1}72%{opacity:1}100%{opacity:0}}
@keyframes bi-logo{0%{opacity:0;transform:scale(.97)}14%{opacity:0}40%{opacity:1;transform:scale(1)}72%{opacity:1;transform:scale(1.01)}96%{opacity:0;transform:scale(1.02)}100%{opacity:0}}
@keyframes bi-out{to{opacity:0;visibility:hidden}}`;

function chime() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    const t0 = ac.currentTime + 0.45, out = ac.createGain(); out.gain.value = 0.22; out.connect(ac.destination);
    // acorde de sino (fundamental + quinta + oitava) com um brilho por cima
    for (const [f, d, v] of [[659.25, 1.6, 0.5], [987.77, 1.4, 0.32], [1318.5, 1.2, 0.22], [2637, 0.5, 0.06]]) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + d + 0.05);
    }
    setTimeout(() => ac.close().catch(() => {}), 3500);
  } catch (_) { /* sem som: a abertura continua */ }
}

// mostra a abertura; a promessa resolve quando ela termina (ou é pulada)
export function brandIntro(logo = 'icons/brand-logo.png') {
  return new Promise((done) => {
    if (document.getElementById('brand-intro')) return done();
    const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
    const el = document.createElement('div'); el.id = 'brand-intro';
    el.innerHTML = `<div class="bi-glow"></div><img src="${logo}" alt="Song of Moonlight">`;
    document.body.appendChild(el);
    // camada do topo do navegador: fica por cima de qualquer coisa do jogo (canvas, telas de carregamento, menus)
    try { el.popover = 'manual'; el.showPopover(); } catch (_) { /* navegador antigo: z-index máximo */ }
    chime();
    let over = false;
    const end = () => { if (over) return; over = true; el.remove(); style.remove(); removeEventListener('keydown', key, true); done(); };
    const key = (e) => { e.stopImmediatePropagation(); e.preventDefault(); end(); };   // a tecla que pula não chega ao jogo
    el.addEventListener('animationend', (e) => { if (e.animationName === 'bi-out') end(); });
    el.addEventListener('pointerdown', end);
    addEventListener('keydown', key, true);
    setTimeout(end, 4000);   // garantia
  });
}
