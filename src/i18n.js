// Idiomas (os mesmos do Song of Moonlight). Chave em português; cada idioma tem a sua tradução.
// O nome do jogo (Richard Is Bored) é sempre em inglês.
export const LANGS = [
  { code: 'pt-BR', name: 'Português (Brasil)' }, { code: 'pt-PT', name: 'Português (Portugal)' }, { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' }, { code: 'es', name: 'Español' }, { code: 'fr', name: 'Français' }, { code: 'zh-CN', name: '中文（简体）' },
];
// ordem das colunas: pt-PT, en, ja, es, fr, zh-CN
const T = {
  // menu
  'Jogar': ['Jogar', 'Play', 'あそぶ', 'Jugar', 'Jouer', '开始'],
  'História': ['História', 'Story', 'ものがたり', 'Historia', 'Histoire', '故事'],
  'Como jogar': ['Como jogar', 'How to play', 'あそびかた', 'Cómo jugar', 'Comment jouer', '玩法'],
  'Configurações': ['Definições', 'Settings', 'せってい', 'Ajustes', 'Réglages', '设置'],
  'Termos e privacidade': ['Termos e privacidade', 'Terms and privacy', '規約とプライバシー', 'Términos y privacidad', 'Conditions et confidentialité', '条款与隐私'],
  'Sair do jogo': ['Sair do jogo', 'Quit game', 'ゲームをやめる', 'Salir del juego', 'Quitter le jeu', '退出游戏'],
  'Voltar': ['Voltar', 'Back', 'もどる', 'Volver', 'Retour', '返回'],
  'Música': ['Música', 'Music', '音楽', 'Música', 'Musique', '音乐'],
  'Efeitos': ['Efeitos', 'Sound effects', '効果音', 'Efectos', 'Effets', '音效'],
  'Idioma': ['Idioma', 'Language', '言語', 'Idioma', 'Langue', '语言'],
  'Escolha uma visão': ['Escolha uma visão', 'Choose a vision', 'まぼろしを選ぼう', 'Elige una visión', 'Choisis une vision', '选择一个幻象'],
  'Visão': ['Visão', 'Vision', 'まぼろし', 'Visión', 'Vision', '幻象'],
  'Bloqueada: vença a visão anterior': ['Bloqueada: vença a visão anterior', 'Locked: clear the previous vision', 'ロック中：前のまぼろしをクリア', 'Bloqueada: supera la visión anterior', 'Verrouillée : bats la vision précédente', '未解锁：先通过上一个幻象'],
  'minijogos': ['minijogos', 'microgames', 'ミニゲーム', 'minijuegos', 'mini-jeux', '小游戏'],
  'chefe': ['chefe', 'boss', 'ボス', 'jefe', 'boss', '首领'],
  'Recorde': ['Recorde', 'Best', 'ベスト', 'Récord', 'Record', '最高'],
  'Pontos': ['Pontos', 'Score', 'スコア', 'Puntos', 'Points', '得分'],
  'Toque ou aperte A para continuar': ['Toque ou carregue em A para continuar', 'Tap or press A to continue', 'タップかAで続ける', 'Toca o pulsa A para seguir', 'Touche ou appuie sur A', '点击或按 A 继续'],
  'Gire o celular': ['Rode o telemóvel', 'Turn your phone sideways', 'スマホを横にしてね', 'Gira el móvil', 'Tourne ton téléphone', '请横屏'],
  'Termos de Uso': ['Termos de Utilização', 'Terms of Use', '利用規約', 'Términos de uso', "Conditions d'utilisation", '使用条款'],
  'Privacidade': ['Privacidade', 'Privacy', 'プライバシー', 'Privacidad', 'Confidentialité', '隐私'],
  'Compras e reembolsos': ['Compras e reembolsos', 'Purchases and refunds', '購入と返金', 'Compras y reembolsos', 'Achats et remboursements', '购买与退款'],
  'O jogo guarda só o seu progresso neste aparelho. Os textos completos estão no site.': ['O jogo guarda só o seu progresso neste aparelho. Os textos completos estão no site.', 'The game only stores your progress on this device. The full texts are on the website.', 'このゲームは進行状況をこの端末にだけ保存します。全文はサイトにあります。', 'El juego solo guarda tu progreso en este dispositivo. Los textos completos están en el sitio.', 'Le jeu enregistre seulement ta progression sur cet appareil. Les textes complets sont sur le site.', '游戏只在本设备保存进度。完整条款请见网站。'],
  // palco
  'MAIS RÁPIDO!': ['MAIS RÁPIDO!', 'FASTER!', 'スピードアップ！', '¡MÁS RÁPIDO!', 'PLUS VITE !', '加速！'],
  'CHEFE!': ['CHEFE!', 'BOSS!', 'ボス！', '¡JEFE!', 'BOSS !', '首领！'],
  'VISÃO VENCIDA!': ['VISÃO VENCIDA!', 'VISION CLEARED!', 'まぼろしクリア！', '¡VISIÓN SUPERADA!', 'VISION VAINCUE !', '幻象通关！'],
  'A ÚLTIMA VELA APAGOU': ['A ÚLTIMA VELA APAGOU', 'THE LAST CANDLE WENT OUT', '最後のロウソクが消えた', 'LA ÚLTIMA VELA SE APAGÓ', 'LA DERNIÈRE BOUGIE EST ÉTEINTE', '最后一支蜡烛熄灭了'],
  'Nova visão liberada!': ['Nova visão desbloqueada!', 'New vision unlocked!', '新しいまぼろし解放！', '¡Nueva visión desbloqueada!', 'Nouvelle vision débloquée !', '新幻象已解锁！'],
  // ordens dos minijogos
  'PEGUE OS FRASCOS!': ['APANHA OS FRASCOS!', 'CATCH THE VIALS!', 'びんをキャッチ！', '¡ATRAPA LOS FRASCOS!', 'ATTRAPE LES FIOLES !', '接住药瓶！'],
  'FUJA!': ['FOGE!', 'RUN AWAY!', 'にげろ！', '¡HUYE!', 'FUIS !', '快逃！'],
  'CURE NA HORA!': ['CURA NA ALTURA CERTA!', 'HEAL ON TIME!', 'いまだ、なおせ！', '¡CURA A TIEMPO!', 'SOIGNE PILE !', '看准时机治疗！'],
  'ONDE ESTÁ?': ['ONDE ESTÁ?', 'WHERE IS IT?', 'どこだ？', '¿DÓNDE ESTÁ?', 'OÙ EST-IL ?', '在哪里？'],
  'PULE!': ['SALTA!', 'JUMP!', 'ジャンプ！', '¡SALTA!', 'SAUTE !', '跳！'],
  'ESPANTE!': ['AFUGENTA!', 'SCARE THEM OFF!', 'おいはらえ！', '¡ESPÁNTALOS!', 'CHASSE-LES !', '赶走它们！'],
  'NÃO DURMA!': ['NÃO DURMAS!', "DON'T SLEEP!", 'ねるな！', '¡NO TE DUERMAS!', 'NE DORS PAS !', '别睡着！'],
  'PEGUE O LIVRO!': ['APANHA O LIVRO!', 'GET THE BOOK!', '本をとれ！', '¡COGE EL LIBRO!', 'PRENDS LE LIVRE !', '拿到书！'],
  'QUANTOS?': ['QUANTOS?', 'HOW MANY?', 'いくつ？', '¿CUÁNTOS?', 'COMBIEN ?', '有几个？'],
  'EQUILIBRE!': ['EQUILIBRA!', 'BALANCE!', 'バランス！', '¡EQUILIBRA!', 'ÉQUILIBRE !', '保持平衡！'],
  'QUAL É O DE VERDADE?': ['QUAL É O VERDADEIRO?', 'WHICH ONE IS REAL?', '本物はどれ？', '¿CUÁL ES EL DE VERDAD?', 'LEQUEL EST LE VRAI ?', '哪个是真的？'],
  'REPITA AS RUNAS!': ['REPETE AS RUNAS!', 'REPEAT THE RUNES!', 'ルーンをまねろ！', '¡REPITE LAS RUNAS!', 'RÉPÈTE LES RUNES !', '重复符文！'],
  'VENÇA A VISÃO!': ['VENCE A VISÃO!', 'BEAT THE VISION!', 'まぼろしを倒せ！', '¡VENCE A LA VISIÓN!', 'BATS LA VISION !', '击败幻象！'],
  // controles (embaixo da ordem)
  'Setas ou arraste': ['Setas ou arraste', 'Arrows or drag', '矢印かドラッグ', 'Flechas o arrastra', 'Flèches ou glisse', '方向键或拖动'],
  'Ande para todo lado': ['Ande para todo o lado', 'Move anywhere', '自由に動く', 'Muévete a todos lados', 'Déplace-toi partout', '四处移动'],
  'A ou toque': ['A ou toque', 'A or tap', 'Aかタップ', 'A o toca', 'A ou touche', 'A 或点击'],
  'Aperte sem parar!': ['Carregue sem parar!', 'Mash it!', '連打！', '¡Pulsa sin parar!', 'Tape sans arrêt !', '连打！'],
  'Toque nele (ou setas + A)': ['Toque nele (ou setas + A)', 'Tap it (or arrows + A)', 'タップ（か矢印＋A）', 'Tócalo (o flechas + A)', 'Touche-le (ou flèches + A)', '点它（或方向键 + A）'],
  'Setas (ou toque no lado)': ['Setas (ou toque no lado)', 'Arrows (or tap that side)', '矢印（かその方向をタップ）', 'Flechas (o toca ese lado)', 'Flèches (ou touche ce côté)', '方向键（或点该方向）'],
  'Segure para o lado certo': ['Segure para o lado certo', 'Hold the right way', '正しい方向に押し続ける', 'Mantén hacia el lado correcto', 'Maintiens du bon côté', '按住正确方向'],
  'Ande e atire com A': ['Ande e atire com A', 'Move and shoot with A', '動いてAでうつ', 'Muévete y dispara con A', 'Bouge et tire avec A', '移动并用 A 射击'],
  // controles adaptáveis: o texto muda conforme você joga no teclado, no controle ou no toque
  'Setas ou A/D': ['Setas ou A/D', 'Arrows or A/D', '矢印かA/D', 'Flechas o A/D', 'Flèches ou A/D', '方向键或 A/D'],
  'Analógico ou direcional': ['Analógico ou direcional', 'Stick or D-pad', 'スティックか十字キー', 'Stick o cruceta', 'Stick ou croix', '摇杆或十字键'],
  'Joystick na tela': ['Joystick no ecrã', 'On-screen joystick', '画面のスティック', 'Joystick en pantalla', "Joystick à l'écran", '屏幕摇杆'],
  'Setas ou WASD': ['Setas ou WASD', 'Arrows or WASD', '矢印かWASD', 'Flechas o WASD', 'Flèches ou WASD', '方向键或 WASD'],
  'Espaço': ['Espaço', 'Space', 'スペース', 'Espacio', 'Espace', '空格'],
  'Botão A': ['Botão A', 'A button', 'Aボタン', 'Botón A', 'Bouton A', 'A 键'],
  'Toque na tela': ['Toque no ecrã', 'Tap the screen', '画面をタップ', 'Toca la pantalla', "Touche l'écran", '点击屏幕'],
  'Botão na tela': ['Botão no ecrã', 'On-screen button', '画面のボタン', 'Botón en pantalla', "Bouton à l'écran", '屏幕按键'],
  'sem parar!': ['sem parar!', 'nonstop!', '連打！', '¡sin parar!', 'sans arrêt !', '连打！'],
  'Toque no certo': ['Toque no certo', 'Tap the right one', '正しいのをタップ', 'Toca el correcto', 'Touche le bon', '点正确的'],
  'Escolha + Espaço': ['Escolha + Espaço', 'Choose + Space', '選んでスペース', 'Elige + Espacio', 'Choisis + Espace', '选择 + 空格'],
  'Escolha + A': ['Escolha + A', 'Choose + A', '選んでA', 'Elige + A', 'Choisis + A', '选择 + A'],
  'Toque no lado da seta': ['Toque no lado da seta', 'Tap that side', '矢印の方向をタップ', 'Toca el lado de la flecha', 'Touche le côté de la flèche', '点箭头那一侧'],
  'Segure o lado certo': ['Segure o lado certo', 'Hold the right side', '正しい方向を押し続ける', 'Mantén el lado correcto', 'Maintiens le bon côté', '按住正确方向'],
  'pula': ['salta', 'jump', 'ジャンプ', 'salta', 'saute', '跳'],
  'atira': ['dispara', 'shoot', 'うつ', 'dispara', 'tire', '射击'],
  'ande': ['anda', 'move', '移動', 'muévete', 'bouge', '移动'],
  'Plataforma: ande e pule': ['Plataforma: anda e salta', 'Platform: move and jump', 'アクション：動いてジャンプ', 'Plataformas: muévete y salta', 'Plateforme : bouge et saute', '平台：移动并跳跃'],
  'Pule nas plataformas e pegue o livro!': ['Salta nas plataformas e apanha o livro!', 'Jump the ledges and get the book!', '足場をとんで本をとれ！', '¡Salta por las plataformas y coge el libro!', 'Saute sur les plateformes et prends le livre !', '跳上平台拿到书！'],
  // como jogar
  'Cada visão é uma sequência de minijogos de poucos segundos.': ['Cada visão é uma sequência de minijogos de poucos segundos.', 'Each vision is a string of microgames that last a few seconds.', 'まぼろしは数秒のミニゲームの連続。', 'Cada visión es una serie de minijuegos de pocos segundos.', 'Chaque vision est une suite de mini-jeux de quelques secondes.', '每个幻象都是一连串几秒钟的小游戏。'],
  'Leia a ordem gigante e obedeça antes do pavio queimar.': ['Leia a ordem gigante e obedeça antes de o pavio queimar.', 'Read the giant command and obey before the fuse burns out.', '大きな命令を読んで、導火線が燃えつきる前に従おう。', 'Lee la orden gigante y obedece antes de que se queme la mecha.', "Lis l'ordre géant et obéis avant que la mèche brûle.", '看清巨大的指令，在引线烧完前完成。'],
  'Errou? Uma vela se apaga. Com 3 velas apagadas, acabou.': ['Errou? Uma vela apaga-se. Com 3 velas apagadas, acabou.', 'Missed? A candle goes out. Three out and it is over.', '失敗するとロウソクが1本消える。3本消えたら終わり。', '¿Fallaste? Se apaga una vela. Con 3 apagadas, se acabó.', 'Raté ? Une bougie s’éteint. Trois éteintes, c’est fini.', '失败就熄灭一支蜡烛，三支全灭就结束。'],
  'A cada 4 acertos tudo fica mais rápido. No fim vem o chefe.': ['A cada 4 acertos tudo fica mais rápido. No fim vem o chefe.', 'Every 4 wins it all speeds up. The boss comes last.', '4回クリアごとにスピードアップ。最後はボス。', 'Cada 4 aciertos todo va más rápido. Al final llega el jefe.', 'Tous les 4 succès, tout accélère. Le boss arrive à la fin.', '每成功4次就会加速，最后是首领。'],
  'A 1ª visão tem 7 minijogos, a 2ª tem 8, a 3ª tem 9...': ['A 1.ª visão tem 7 minijogos, a 2.ª tem 8, a 3.ª tem 9...', 'Vision 1 has 7 microgames, vision 2 has 8, vision 3 has 9...', '1つ目は7個、2つ目は8個、3つ目は9個……', 'La 1.ª visión tiene 7 minijuegos, la 2.ª 8, la 3.ª 9...', 'La 1re vision a 7 mini-jeux, la 2e en a 8, la 3e en a 9...', '第1个幻象有7个小游戏，第2个有8个，第3个有9个……'],
  'Os ícones dizem como jogar:': ['Os ícones dizem como jogar:', 'The icons tell you how to play:', 'アイコンが操作を教えてくれる：', 'Los iconos dicen cómo jugar:', 'Les icônes montrent comment jouer :', '图标告诉你怎么玩：'],
  // história
  'Lacrímora. Torre das Treze Vozes.': ['Lacrímora. Torre das Treze Vozes.', 'Lacrímora. The Tower of Thirteen Voices.', 'ラクリモラ。十三の声の塔。', 'Lacrímora. Torre de las Trece Voces.', 'Lacrímora. La Tour des Treize Voix.', '拉克里莫拉。十三之声塔。'],
  'Richard deu palavras às criaturas. A primeira foi Mara, uma mariposa ferida. Ela escolheu o próprio nome.': ['O Richard deu palavras às criaturas. A primeira foi a Mara, uma mariposa ferida. Ela escolheu o próprio nome.', 'Richard gave words to the creatures. The first was Mara, a wounded moth. She chose her own name.', 'リチャードは生き物に言葉をあたえた。最初は傷ついた蛾のマラ。名前は自分で選んだ。', 'Richard dio palabras a las criaturas. La primera fue Mara, una polilla herida. Eligió su propio nombre.', 'Richard a donné des mots aux créatures. La première fut Mara, un papillon de nuit blessé. Elle a choisi son nom.', '理查德赋予生灵语言。第一个是受伤的飞蛾玛拉，她给自己取了名字。'],
  'Depois veio a guerra entre Antigos e Despertos. Treze feridos, doze frascos de remédio.': ['Depois veio a guerra entre Antigos e Despertos. Treze feridos, doze frascos de remédio.', 'Then came the war between the Ancients and the Awakened. Thirteen wounded, twelve vials of medicine.', 'そして古き者と目覚めし者の戦争。けが人は13人、薬は12本。', 'Luego llegó la guerra entre Antiguos y Despiertos. Trece heridos, doce frascos de remedio.', 'Puis vint la guerre entre Anciens et Éveillés. Treize blessés, douze fioles de remède.', '后来，古老者与觉醒者爆发战争。十三个伤者，只有十二瓶药。'],
  'Richard se trancou na torre para não ferir mais ninguém. E parou de dormir.': ['O Richard fechou-se na torre para não ferir mais ninguém. E deixou de dormir.', 'Richard locked himself in the tower so he would hurt no one else. And he stopped sleeping.', 'リチャードはもうだれも傷つけないよう塔にこもった。そして眠らなくなった。', 'Richard se encerró en la torre para no herir a nadie más. Y dejó de dormir.', "Richard s'est enfermé dans la tour pour ne plus blesser personne. Et il a cessé de dormir.", '理查德把自己锁在塔里，不再伤害任何人。他也不再睡觉。'],
  'Sozinho, entediado, ele começa a ouvir vozes... e a ver coisas.': ['Sozinho e aborrecido, começa a ouvir vozes... e a ver coisas.', 'Alone and bored, he starts hearing voices... and seeing things.', 'ひとりで退屈な彼に、声が聞こえ……幻が見えはじめる。', 'Solo y aburrido, empieza a oír voces... y a ver cosas.', 'Seul et ennuyé, il commence à entendre des voix... et à voir des choses.', '孤独又无聊的他开始听见声音……看见幻象。'],
  'Pelo portal de Aldo chegam também os ecos de Brumavale: o rei que parou de dormir e a Noite do Silêncio.': ['Pelo portal de Aldo chegam também os ecos de Brumavale: o rei que deixou de dormir e a Noite do Silêncio.', "Through Aldo's portal come the echoes of Brumavale too: the king who stopped sleeping, and the Night of Silence.", 'アルドの門からはブルマヴァーレのこだまも届く。眠らなくなった王と、沈黙の夜。', 'Por el portal de Aldo llegan también los ecos de Brumavale: el rey que dejó de dormir y la Noche del Silencio.', "Par le portail d'Aldo arrivent aussi les échos de Brumavale : le roi qui ne dormait plus, et la Nuit du Silence.", '阿尔多的传送门也带来布鲁马瓦莱的回声：不再睡觉的国王，与寂静之夜。'],
  'Cada visão é alguém que ele conheceu, ou algo bem mais estranho. Vença as visões antes que a última vela apague.': ['Cada visão é alguém que ele conheceu, ou algo bem mais estranho. Vença as visões antes que a última vela se apague.', 'Each vision is someone he knew, or something much stranger. Beat the visions before the last candle goes out.', 'まぼろしは知り合いか、もっと奇妙な何か。最後のロウソクが消える前に勝て。', 'Cada visión es alguien que conoció, o algo mucho más raro. Vence las visiones antes de que se apague la última vela.', "Chaque vision est quelqu'un qu'il a connu, ou bien plus étrange. Bats les visions avant que la dernière bougie s'éteigne.", '每个幻象都是他认识的人，或更古怪的东西。在最后一支蜡烛熄灭前击败它们。'],
};
// as 23 visões: gente do passado de Brumavale (a história do Rei Aldric, da rainha Elara, do mago Orin e da Noite do
// Silêncio), gente do presente de Lacrímora (onde fica a torre do Richard) e alguns que fazem parte das duas histórias.
// As falas vêm do próprio Song of Moonlight.
const Q = [
  ['Mara, jardineira', 'Eu pedi uma casa. Não outra experiência.', 'I asked for a home. Not another experiment.'],
  ['Hilda', 'Desce, Lua, desce devagar, que o povo dorme e eu vou te guardar.', 'Come down, Moon, come down slow; the people sleep, I will keep you so.'],
  ['Sálvia, curandeira', 'O hospital recusou meu avô por causa de um formulário. Você abriu a porta.', 'The hospital turned my grandpa away over a form. You opened the door.'],
  ['Pedro', 'Na Noite do Silêncio eu estava de folga. Nunca me perdoei.', 'On the Night of Silence I was off duty. I never forgave myself.'],
  ['Doran, capataz', 'Os mineiros achavam pó lunar nas paredes. Diziam que a Lua chorava ali.', 'The miners found moon dust in the walls. They said the Moon wept there.'],
  ['Mirela', 'Vi as mãos do Valério sem as luvas. Brilhavam como luar.', "I saw Valério's hands without his gloves. They shone like moonlight."],
  ['Elo, paciente Antigo', 'Disseram que eu precisava de mãos. Você disse que minhas feridas bastavam.', 'They said I needed hands. You said my wounds were enough.'],
  ['Bento', 'A Íris pescou comigo a noite inteira do Silêncio.', 'Íris fished with me the whole Night of Silence.'],
  ['Íria, filhote do ninho', 'Desenhei nós três. O soldado não soube dizer quem estava errado.', 'I drew the three of us. The soldier could not say who was wrong.'],
  ['Brenda', 'Pedi um cadeado mais forte. O rei disse: não adianta, ela abre por dentro.', 'I asked for a stronger lock. The king said: no use, it opens from inside.'],
  ['Ruk, voz dos Antigos', 'Eu aprendi a sua língua por escolha.', 'I learned your language by choice.'],
  ['Tobias', 'Depois do enterro do Orin, alguém continua comprando tinta no meu nome.', "After Orin's funeral, someone still buys ink in my name."],
  ['Brusk, escaravelho desertor', 'Eu desobedeci. Perdi uma asa e a patente. Fiquei com a consciência.', 'I disobeyed. I lost a wing and my rank. I kept my conscience.'],
  ['Odete', 'A rainha pediu: não deixe o Aldric sozinho. Eu deixei.', 'The queen asked: do not leave Aldric alone. I did.'],
  ['Nara, arquivista', 'A guerra ganhou dois nomes. Uma criança morta não escolhe o livro.', 'The war got two names. A dead child does not choose the book.'],
  ['Hermes', 'Era o cavalo da rainha Elara. Só deixa montar quem ama a Lua.', 'He was Queen Elara’s horse. Only those who love the Moon may ride him.'],
  ['Maelis, regente', 'A paz não é um feitiço pronto. É o que fazemos depois dele.', 'Peace is not a finished spell. It is what we do after it.'],
  ['Aldo', 'Eu carreguei o caixão do Orin. Estava leve demais.', "I carried Orin's coffin. It was far too light."],
  ['Capitão Ícaro', 'Que lugar silencioso. Vamos erguer uma antena para chamar a Terra.', "What a silent place. Let's build an antenna to call Earth."],
  ['Ray, a arraia', 'Só confio em quem carrega a Âncora Prismática.', 'I only trust whoever carries the Prismatic Anchor.'],
  ['Aldric, o Primeiro', 'Eu desejei ser eterno... e fui!', 'I wished to be eternal... and I was!'],
  ['Valério', 'Eu só abri a porta... só abri a porta.', 'I only opened the door... only opened the door.'],
  ['Eco do Silêncio', 'Eu sou o Silêncio que sobrou.', 'I am the Silence that was left behind.'],
];
const QX = {   // pt-PT, ja, es, fr, zh-CN
  0: ['Eu pedi uma casa. Não outra experiência.', 'ほしかったのは家。実験じゃない。', 'Pedí una casa. No otro experimento.', "J'ai demandé une maison. Pas une autre expérience.", '我要的是一个家，不是另一场实验。'],
  1: ['Desce, Lua, desce devagar, que o povo dorme e eu vou-te guardar.', 'おりておいで月よ、ゆっくりと。みんな眠るからわたしが守る。', 'Baja, Luna, baja despacio, que el pueblo duerme y yo te guardo.', 'Descends, Lune, descends doucement, le peuple dort, je te garde.', '月亮啊，慢慢降下来，众人入睡，我来守护你。'],
  2: ['O hospital recusou o meu avô por causa de um formulário. Tu abriste a porta.', '病院は書類のせいで祖父を断った。あなたは扉を開けた。', 'El hospital rechazó a mi abuelo por un formulario. Tú abriste la puerta.', "L'hôpital a refusé mon grand-père pour un formulaire. Tu as ouvert la porte.", '医院因为一张表格拒收我爷爷。是你开了门。'],
  3: ['Na Noite do Silêncio eu estava de folga. Nunca me perdoei.', '沈黙の夜、ぼくは非番だった。自分を許せない。', 'En la Noche del Silencio yo estaba libre. Nunca me lo perdoné.', 'La Nuit du Silence, je n’étais pas de garde. Je ne me le pardonne pas.', '寂静之夜我正好休假。我从没原谅自己。'],
  4: ['Os mineiros achavam pó lunar nas paredes. Diziam que a Lua chorava ali.', '鉱夫たちは壁に月の粉を見つけた。月が泣いたと言った。', 'Los mineros hallaban polvo lunar en las paredes. Decían que la Luna lloraba allí.', 'Les mineurs trouvaient de la poussière de lune dans les murs. La Lune pleurait là, disaient-ils.', '矿工在墙里发现月尘，说月亮曾在那里哭泣。'],
  5: ['Vi as mãos do Valério sem as luvas. Brilhavam como luar.', '手袋をはずしたヴァレリオの手は月明かりのように光っていた。', 'Vi las manos de Valério sin guantes. Brillaban como la luz de luna.', 'J’ai vu les mains de Valério sans ses gants. Elles brillaient comme la lune.', '我见过瓦莱里奥摘下手套的手，像月光一样发亮。'],
  6: ['Disseram que eu precisava de mãos. Tu disseste que as minhas feridas bastavam.', '手が必要だと言われた。あなたは傷だけで十分だと言った。', 'Dijeron que necesitaba manos. Tú dijiste que mis heridas bastaban.', "On m'a dit qu'il me fallait des mains. Tu as dit que mes blessures suffisaient.", '他们说我得先有手。你说我的伤就够了。'],
  7: ['A Íris pescou comigo a noite inteira do Silêncio.', 'イリスは沈黙の夜、ずっとぼくと釣りをしていた。', 'Íris pescó conmigo toda la Noche del Silencio.', 'Íris a pêché avec moi toute la Nuit du Silence.', '寂静之夜，伊里斯整晚都和我在钓鱼。'],
  8: ['Desenhei nós os três. O soldado não soube dizer quem estava errado.', '3人の絵をかいた。兵士はだれがまちがいか言えなかった。', 'Dibujé a los tres. El soldado no supo decir quién estaba mal.', "J'ai dessiné nous trois. Le soldat n'a pas su dire qui avait tort.", '我画了我们三个，士兵说不出谁是错的。'],
  9: ['Pedi um cadeado mais forte. O rei disse: não adianta, ela abre por dentro.', 'もっと強い錠をと頼んだ。王は言った、むだだ、内から開くと。', 'Pedí un candado más fuerte. El rey dijo: no sirve, se abre por dentro.', 'J’ai demandé un cadenas plus solide. Le roi a dit : inutile, elle s’ouvre de l’intérieur.', '我请求更结实的锁。国王说：没用，它会从里面打开。'],
  10: ['Aprendi a tua língua por escolha.', 'あなたの言葉は自分で選んで覚えた。', 'Aprendí tu lengua por elección.', "J'ai appris ta langue par choix.", '我是自愿学会你的语言的。'],
  11: ['Depois do enterro do Orin, alguém continua a comprar tinta em meu nome.', 'オリンの葬式のあとも、だれかがわたしの名でインクを買う。', 'Tras el entierro de Orin, alguien sigue comprando tinta a mi nombre.', "Après l'enterrement d'Orin, quelqu'un achète encore de l'encre à mon nom.", '奥林下葬后，仍有人用我的名字买墨水。'],
  12: ['Desobedeci. Perdi uma asa e a patente. Fiquei com a consciência.', '命令にそむいた。羽と階級を失った。良心は残った。', 'Desobedecí. Perdí un ala y el rango. Me quedé con la conciencia.', "J'ai désobéi. J'ai perdu une aile et mon grade. J'ai gardé ma conscience.", '我抗命了。失去一只翅膀和军衔，留住了良心。'],
  13: ['A rainha pediu: não deixes o Aldric sozinho. Eu deixei.', '王妃は言った、アルドリックをひとりにしないでと。わたしはした。', 'La reina pidió: no dejes solo a Aldric. Yo lo dejé.', 'La reine a demandé : ne laisse pas Aldric seul. Je l’ai laissé.', '王后说：别让奥德里克独自一人。我却没做到。'],
  14: ['A guerra ganhou dois nomes. Uma criança morta não escolhe o livro.', '戦争には名前が2つ。死んだ子は本を選べない。', 'La guerra tuvo dos nombres. Un niño muerto no elige el libro.', 'La guerre a eu deux noms. Un enfant mort ne choisit pas le livre.', '战争有两个名字。死去的孩子选不了写进哪本书。'],
  15: ['Era o cavalo da rainha Elara. Só deixa montar quem ama a Lua.', 'エララ王妃の馬。月を愛する人しか乗せない。', 'Era el caballo de la reina Elara. Solo deja montar a quien ama la Luna.', "C'était le cheval de la reine Elara. Seuls ceux qui aiment la Lune le montent.", '他是埃拉拉王后的马，只让爱月亮的人骑。'],
  16: ['A paz não é um feitiço pronto. É o que fazemos depois dele.', '平和はできあがった呪文じゃない。そのあとにすることだ。', 'La paz no es un hechizo hecho. Es lo que hacemos después.', "La paix n'est pas un sort tout fait. C'est ce qu'on fait après.", '和平不是现成的咒语，而是之后我们所做的事。'],
  17: ['Carreguei o caixão do Orin. Estava leve demais.', 'オリンの棺をかついだ。軽すぎた。', 'Cargué el ataúd de Orin. Pesaba demasiado poco.', "J'ai porté le cercueil d'Orin. Il était bien trop léger.", '我抬过奥林的棺材，轻得过分。'],
  18: ['Que lugar silencioso. Vamos erguer uma antena para chamar a Terra.', 'なんて静かな場所。地球を呼ぶアンテナを建てよう。', 'Qué lugar tan silencioso. Levantemos una antena para llamar a la Tierra.', 'Quel endroit silencieux. Construisons une antenne pour appeler la Terre.', '多安静的地方。我们来建天线呼叫地球吧。'],
  19: ['Só confio em quem carrega a Âncora Prismática.', 'プリズムの錨を持つ人しか信じない。', 'Solo confío en quien lleva el Ancla Prismática.', "Je ne fais confiance qu'à qui porte l'Ancre Prismatique.", '我只信任带着棱镜之锚的人。'],
  20: ['Eu desejei ser eterno... e fui!', '永遠を願った……そしてそうなった！', 'Deseé ser eterno... ¡y lo fui!', "J'ai souhaité être éternel... et je l'ai été !", '我许愿永生……我做到了！'],
  21: ['Eu só abri a porta... só abri a porta.', 'わたしは扉を開けただけ……開けただけだ。', 'Yo solo abrí la puerta... solo abrí la puerta.', "J'ai seulement ouvert la porte... seulement ouvert la porte.", '我只是开了门……只是开了门。'],
  22: ['Eu sou o Silêncio que sobrou.', 'わたしは残された沈黙。', 'Soy el Silencio que quedó.', 'Je suis le Silence qui est resté.', '我是残留下来的寂静。'],
};
const QN = {   // nomes com título (pt-PT, en, ja, es, fr, zh-CN)
  'Mara, jardineira': ['Mara, jardineira', 'Mara, the gardener', '庭師マラ', 'Mara, jardinera', 'Mara, jardinière', '园丁玛拉'],
  'Sálvia, curandeira': ['Sálvia, curandeira', 'Sálvia, the healer', '癒し手サルヴィア', 'Sálvia, curandera', 'Sálvia, guérisseuse', '治疗师萨尔维娅'],
  'Doran, capataz': ['Doran, capataz', 'Doran, the foreman', '親方ドラン', 'Doran, capataz', 'Doran, contremaître', '工头多兰'],
  'Elo, paciente Antigo': ['Elo, paciente Antigo', 'Elo, Ancient patient', '古き者の患者エロ', 'Elo, paciente Antiguo', 'Elo, patient Ancien', '古老者病人埃洛'],
  'Íria, filhote do ninho': ['Íria, cria do ninho', 'Íria, nest hatchling', '巣のひなイリア', 'Íria, cría del nido', 'Íria, petite du nid', '巢中幼崽伊莉娅'],
  'Ruk, voz dos Antigos': ['Ruk, voz dos Antigos', 'Ruk, voice of the Ancients', '古き者の声ルク', 'Ruk, voz de los Antiguos', 'Ruk, voix des Anciens', '古老者之声鲁克'],
  'Brusk, escaravelho desertor': ['Brusk, escaravelho desertor', 'Brusk, deserter beetle', '脱走したカブトムシ、ブルスク', 'Brusk, escarabajo desertor', 'Brusk, scarabée déserteur', '逃兵甲虫布鲁斯克'],
  'Nara, arquivista': ['Nara, arquivista', 'Nara, the archivist', '記録係ナラ', 'Nara, archivista', 'Nara, archiviste', '档案员娜拉'],
  'Maelis, regente': ['Maelis, regente', 'Maelis, the regent', '摂政マエリス', 'Maelis, regente', 'Maelis, régente', '摄政者梅莉丝'],
  'Capitão Ícaro': ['Capitão Ícaro', 'Captain Ícaro', 'イカロ船長', 'Capitán Ícaro', 'Capitaine Ícaro', '伊卡洛船长'],
  'Ray, a arraia': ['Ray, a raia', 'Ray, the manta', 'エイのレイ', 'Ray, la raya', 'Ray, la raie', '鳐鱼雷'],
  'Aldric, o Primeiro': ['Aldric, o Primeiro', 'Aldric the First', 'アルドリック一世', 'Aldric el Primero', 'Aldric Ier', '奥德里克一世'],
  'Eco do Silêncio': ['Eco do Silêncio', 'Echo of Silence', '沈黙のこだま', 'Eco del Silencio', 'Écho du Silence', '寂静回声'],
};
Object.assign(T, QN);
Q.forEach(([, pt, en], i) => { const x = QX[i]; T[pt] = [x[0], en, x[1], x[2], x[3], x[4]]; });
export const VISION_TEXT = Q.map(([name, quote]) => ({ name, quote }));

const KEY = 're_lang';
let lang = 'pt-BR';
try { const s = localStorage.getItem(KEY); if (s && LANGS.some((l) => l.code === s)) lang = s; else { const n = (navigator.language || '').toLowerCase(); lang = n.startsWith('pt-pt') ? 'pt-PT' : n.startsWith('pt') ? 'pt-BR' : n.startsWith('ja') ? 'ja' : n.startsWith('es') ? 'es' : n.startsWith('fr') ? 'fr' : n.startsWith('zh') ? 'zh-CN' : n.startsWith('en') ? 'en' : 'pt-BR'; } } catch (_) { /* sem storage */ }
const COL = { 'pt-PT': 0, en: 1, ja: 2, es: 3, fr: 4, 'zh-CN': 5 };
export const getLang = () => lang;
export function setLang(code) { lang = code; try { localStorage.setItem(KEY, code); } catch (_) { /* ok */ } }
export function tr(s) { if (lang === 'pt-BR') return s; const row = T[s]; return row ? row[COL[lang]] || s : s; }
// fonte: o Press Start 2P não tem ideogramas; japonês e chinês caem na fonte do sistema
export const cjk = () => lang === 'ja' || lang === 'zh-CN';
export const font = (px) => (cjk() ? `${px}px "Press Start 2P", "Noto Sans CJK JP", "Hiragino Sans", "Microsoft YaHei", sans-serif` : `${px}px "Press Start 2P", monospace`);
