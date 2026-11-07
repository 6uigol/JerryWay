// Idiomas (os mesmos do Song of Moonlight). Chave em português; cada idioma tem a sua tradução.
export const LANGS = [
  { code: 'pt-BR', name: 'Português (Brasil)' }, { code: 'pt-PT', name: 'Português (Portugal)' }, { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' }, { code: 'es', name: 'Español' }, { code: 'fr', name: 'Français' }, { code: 'zh-CN', name: '中文（简体）' },
];
// ordem das colunas: pt-PT, en, ja, es, fr, zh-CN
const T = {
  'RICHARD ENTEDIADO': ['RICHARD ENTEDIADO', 'RICHARD IS BORED', 'リチャードは退屈', 'RICHARD ABURRIDO', 'RICHARD S\'ENNUIE', '无聊的理查德'],
  'Sozinho na torre, Richard começa a ver coisas.': ['Sozinho na torre, o Richard começa a ver coisas.', 'Alone in the tower, Richard starts seeing things.', '塔にひとり、リチャードは幻を見はじめる。', 'Solo en la torre, Richard empieza a ver cosas.', 'Seul dans la tour, Richard commence à voir des choses.', '独自在塔里，理查德开始看见幻象。'],
  'Jogar': ['Jogar', 'Play', 'あそぶ', 'Jugar', 'Jouer', '开始'],
  'Configurações': ['Definições', 'Settings', 'せってい', 'Ajustes', 'Réglages', '设置'],
  'Termos e privacidade': ['Termos e privacidade', 'Terms and privacy', '規約とプライバシー', 'Términos y privacidad', 'Conditions et confidentialité', '条款与隐私'],
  'Sair do jogo': ['Sair do jogo', 'Quit game', 'ゲームをやめる', 'Salir del juego', 'Quitter le jeu', '退出游戏'],
  'Voltar': ['Voltar', 'Back', 'もどる', 'Volver', 'Retour', '返回'],
  'Música': ['Música', 'Music', '音楽', 'Música', 'Musique', '音乐'],
  'Efeitos': ['Efeitos', 'Sound effects', '効果音', 'Efectos', 'Effets', '音效'],
  'Idioma': ['Idioma', 'Language', '言語', 'Idioma', 'Langue', '语言'],
  'Visões': ['Visões', 'Visions', 'まぼろし', 'Visiones', 'Visions', '幻象'],
  'Escolha uma visão': ['Escolha uma visão', 'Choose a vision', 'まぼろしを選ぼう', 'Elige una visión', 'Choisis une vision', '选择一个幻象'],
  'Bloqueada': ['Bloqueada', 'Locked', 'ロック中', 'Bloqueada', 'Verrouillée', '未解锁'],
  'Em breve': ['Em breve', 'Coming soon', '近日公開', 'Próximamente', 'Bientôt', '即将推出'],
  'minijogos': ['minijogos', 'microgames', 'ミニゲーム', 'minijuegos', 'mini-jeux', '小游戏'],
  'Chefe!': ['Chefe!', 'Boss!', 'ボス！', '¡Jefe!', 'Boss !', '首领！'],
  'Mais rápido!': ['Mais rápido!', 'Faster!', 'スピードアップ！', '¡Más rápido!', 'Plus vite !', '加速！'],
  'Fim da visão': ['Fim da visão', 'Vision over', 'まぼろしが消えた', 'Fin de la visión', 'Fin de la vision', '幻象结束'],
  'Visão vencida!': ['Visão vencida!', 'Vision cleared!', 'まぼろしクリア！', '¡Visión superada!', 'Vision vaincue !', '幻象通关！'],
  'Pontos': ['Pontos', 'Score', 'スコア', 'Puntos', 'Points', '得分'],
  'Recorde': ['Recorde', 'Best', 'ベスト', 'Récord', 'Record', '最高'],
  'Toque ou aperte para continuar': ['Toque ou carregue para continuar', 'Tap or press to continue', 'タップかボタンで続ける', 'Toca o pulsa para seguir', 'Touche ou appuie pour continuer', '点击或按键继续'],
  'Abrir no site': ['Abrir no site', 'Open on the website', 'サイトで開く', 'Abrir en el sitio', 'Ouvrir sur le site', '在网站打开'],
  'Termos de Uso': ['Termos de Utilização', 'Terms of Use', '利用規約', 'Términos de uso', "Conditions d'utilisation", '使用条款'],
  'Privacidade': ['Privacidade', 'Privacy', 'プライバシー', 'Privacidad', 'Confidentialité', '隐私'],
  'Compras e reembolsos': ['Compras e reembolsos', 'Purchases and refunds', '購入と返金', 'Compras y reembolsos', 'Achats et remboursements', '购买与退款'],
  'O jogo guarda só o seu progresso neste aparelho. Os textos completos estão no site.': ['O jogo guarda só o seu progresso neste aparelho. Os textos completos estão no site.', 'The game only stores your progress on this device. The full texts are on the website.', 'このゲームは進行状況をこの端末にだけ保存します。全文はサイトにあります。', 'El juego solo guarda tu progreso en este dispositivo. Los textos completos están en el sitio.', 'Le jeu enregistre seulement ta progression sur cet appareil. Les textes complets sont sur le site.', '游戏只在本设备保存进度。完整条款请见网站。'],
  // instruções dos minijogos
  'PEGUE!': ['APANHA!', 'CATCH!', 'とれ！', '¡ATRAPA!', 'ATTRAPE !', '接住！'],
  'DESVIE!': ['DESVIA-TE!', 'DODGE!', 'よけろ！', '¡ESQUIVA!', 'ESQUIVE !', '躲开！'],
  'NA HORA!': ['NA ALTURA CERTA!', 'TIME IT!', 'いまだ！', '¡A TIEMPO!', 'PILE !', '看准时机！'],
  'APERTE MUITO!': ['CARREGA MUITO!', 'MASH IT!', '連打！', '¡PULSA RÁPIDO!', 'TAPE VITE !', '连打！'],
  'QUANTOS?': ['QUANTOS?', 'HOW MANY?', 'いくつ？', '¿CUÁNTOS?', 'COMBIEN ?', '有几个？'],
  'QUAL PORTA?': ['QUE PORTA?', 'WHICH DOOR?', 'どのドア？', '¿QUÉ PUERTA?', 'QUELLE PORTE ?', '哪扇门？'],
  'PULE!': ['SALTA!', 'JUMP!', 'ジャンプ！', '¡SALTA!', 'SAUTE !', '跳！'],
  'ACERTE!': ['ACERTA!', 'HIT IT!', 'たたけ！', '¡GOLPEA!', 'TAPE !', '打中！'],
  'SOBREVIVA!': ['SOBREVIVE!', 'SURVIVE!', '生きのびろ！', '¡SOBREVIVE!', 'SURVIS !', '活下去！'],
  'Setas ou toque nos lados: escolher. A ou toque no meio: confirmar.': ['Setas ou toque nos lados: escolher. A ou toque no meio: confirmar.', 'Arrows or tap the sides: choose. A or tap the middle: confirm.', '矢印か画面の左右で選ぶ。Aか中央で決定。', 'Flechas o toca los lados: elegir. A o toca el centro: confirmar.', 'Flèches ou touche les côtés : choisir. A ou touche le milieu : valider.', '方向键或点两侧选择，A 或点中间确认。'],
};
const KEY = 're_lang';
let lang = 'pt-BR';
try { const s = localStorage.getItem(KEY); if (s && LANGS.some((l) => l.code === s)) lang = s; else { const n = (navigator.language || '').toLowerCase(); lang = n.startsWith('pt-pt') ? 'pt-PT' : n.startsWith('pt') ? 'pt-BR' : n.startsWith('ja') ? 'ja' : n.startsWith('es') ? 'es' : n.startsWith('fr') ? 'fr' : n.startsWith('zh') ? 'zh-CN' : n.startsWith('en') ? 'en' : 'pt-BR'; } } catch (_) { /* sem storage */ }
const COL = { 'pt-PT': 0, en: 1, ja: 2, es: 3, fr: 4, 'zh-CN': 5 };
export const getLang = () => lang;
export function setLang(code) { lang = code; try { localStorage.setItem(KEY, code); } catch (_) { /* ok */ } }
export function tr(s) { if (lang === 'pt-BR') return s; const row = T[s]; return row ? row[COL[lang]] || s : s; }
// fonte: o Press Start 2P não tem ideogramas; japonês e chinês caem na fonte do sistema
export const font = (px) => (lang === 'ja' || lang === 'zh-CN' ? `${px}px "Press Start 2P", "Noto Sans CJK JP", "Hiragino Sans", "Microsoft YaHei", sans-serif` : `${px}px "Press Start 2P", monospace`);
