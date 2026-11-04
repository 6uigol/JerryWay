// Abertura da marca Song of Moonlight, como abertura de filme: o escuro clareia num degradê azul de luar, o logotipo
// aparece com um som curto de sino e depois tudo fecha de volta para o escuro antes do jogo. Toque ou tecla pula.
const CSS = `
#brand-intro{position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;padding:0;border:0;z-index:2147483647;background:#000;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;
  animation:bi-out .45s ease-in 3.15s forwards}
#brand-intro::backdrop{background:transparent}
#brand-intro .bi-glow{position:absolute;inset:-20%;opacity:0;background:radial-gradient(ellipse at 50% 52%,#3a4ab0 0%,#1a2066 30%,#070a24 60%,#000 82%);
  animation:bi-glow 3.15s ease-in-out forwards}
#brand-intro .bi-star{position:absolute;width:2px;height:2px;background:#fff;border-radius:50%;opacity:0;box-shadow:0 0 4px #bcd0ff;
  animation:bi-twinkle 1.6s ease-in-out infinite, bi-fade 3.15s ease-in-out forwards}
#brand-intro .bi-logo{position:relative;width:min(64vw,620px);aspect-ratio:900/366;opacity:0;filter:blur(6px);transform:translateY(14px) scale(.97);
  animation:bi-logo 3.15s cubic-bezier(.22,.8,.3,1) forwards}
#brand-intro .bi-logo img{width:100%;height:100%;display:block;filter:brightness(.8) sepia(.15) hue-rotate(185deg) drop-shadow(0 0 18px rgba(170,190,255,.55))}
/* faixa de luz que passa pelas letras (recortada no formato do logotipo) */
#brand-intro .bi-shine{position:absolute;inset:0;-webkit-mask:var(--logo) center/100% 100% no-repeat;mask:var(--logo) center/100% 100% no-repeat;
  background:linear-gradient(105deg,transparent 0 36%,rgba(255,255,255,.55) 42%,#ffffff 48%,#fff6dc 51%,rgba(255,255,255,.55) 56%,transparent 62% 100%) no-repeat;filter:drop-shadow(0 0 6px #fff);background-size:260% 100%;background-position:130% 0;
  animation:bi-shine 1s ease-in-out 1.15s forwards}
/* a lua crescente de "Moonlight" brilhando */
#brand-intro .bi-moon{position:absolute;left:30%;top:73%;width:18%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;opacity:0;
  background:radial-gradient(circle,rgba(220,232,255,.55),rgba(140,170,255,.18) 45%,transparent 70%);animation:bi-moon 3.15s ease-in-out forwards}
#brand-intro .bi-spark{position:absolute;width:6px;height:6px;opacity:0;background:
  linear-gradient(#fff,#fff) center/2px 100% no-repeat, linear-gradient(#fff,#fff) center/100% 2px no-repeat;filter:drop-shadow(0 0 3px #bcd0ff);animation:bi-spark 1.2s ease-out forwards}
@keyframes bi-glow{0%{opacity:0}30%{opacity:1}76%{opacity:1}100%{opacity:0}}
@keyframes bi-fade{0%,12%{opacity:0}35%,74%{opacity:1}100%{opacity:0}}
@keyframes bi-twinkle{0%,100%{transform:scale(.6)}50%{transform:scale(1.4)}}
@keyframes bi-logo{0%,10%{opacity:0;filter:blur(6px);transform:translateY(14px) scale(.97)}38%{opacity:1;filter:blur(0);transform:translateY(0) scale(1)}76%{opacity:1;filter:blur(0);transform:translateY(-2px) scale(1.01)}97%,100%{opacity:0;filter:blur(3px);transform:translateY(-6px) scale(1.02)}}
@keyframes bi-shine{to{background-position:-30% 0}}
@keyframes bi-moon{0%,30%{opacity:0;transform:translate(-50%,-50%) scale(.6)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.05)}62%,76%{opacity:.75;transform:translate(-50%,-50%) scale(1)}100%{opacity:0}}
@keyframes bi-spark{0%{opacity:0;transform:scale(.2) rotate(0)}30%{opacity:1;transform:scale(1.4) rotate(45deg)}100%{opacity:0;transform:scale(.4) rotate(90deg) translateY(-8px)}}
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
    // estrelinhas espalhadas e brilhinhos em volta da lua crescente do logotipo
    const stars = Array.from({ length: 46 }, (_, i) => `<i class="bi-star" style="left:${(i * 37.7) % 100}%;top:${(i * 61.3 + 7) % 100}%;animation-delay:${(i % 7) * 0.23}s,0s;${i % 5 === 0 ? 'width:3px;height:3px;' : ''}"></i>`).join('');
    const sparks = [[24, 58, 1.35], [36, 88, 1.55], [27, 92, 1.75], [33, 60, 1.95]].map(([x, y, d]) => `<i class="bi-spark" style="left:${x}%;top:${y}%;animation-delay:${d}s"></i>`).join('');
    el.innerHTML = `<div class="bi-glow"></div>${stars}<div class="bi-logo" style="--logo:url('${logo}')"><img src="${logo}" alt="Song of Moonlight"><div class="bi-moon"></div><div class="bi-shine"></div>${sparks}</div>`;
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
    setTimeout(end, 4600);   // garantia
  });
}
