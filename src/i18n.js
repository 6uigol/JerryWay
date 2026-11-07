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
  'Cada visão é alguém que ele conheceu, ou algo bem mais estranho. Vença as visões antes que a última vela apague.': ['Cada visão é alguém que ele conheceu, ou algo bem mais estranho. Vença as visões antes que a última vela se apague.', 'Each vision is someone he knew, or something much stranger. Beat the visions before the last candle goes out.', 'まぼろしは知り合いか、もっと奇妙な何か。最後のロウソクが消える前に勝て。', 'Cada visión es alguien que conoció, o algo mucho más raro. Vence las visiones antes de que se apague la última vela.', "Chaque vision est quelqu'un qu'il a connu, ou bien plus étrange. Bats les visions avant que la dernière bougie s'éteigne.", '每个幻象都是他认识的人，或更古怪的东西。在最后一支蜡烛熄灭前击败它们。'],
};
// falas das 23 visões (aparecem na escolha e quando você vence a visão)
const Q = [
  ['Mara, a Mariposa', 'Você me deu um nome. Agora me dê descanso.', 'You gave me a name. Now give me rest.'],
  ['Ícaro', 'A antena ainda chama a Terra. Ninguém atende.', 'The antenna still calls Earth. No one answers.'],
  ['Aldo, o Sábio', 'Magia sem cuidado é só barulho bonito.', 'Magic without care is just pretty noise.'],
  ['Selene Rúnica', 'Li o seu futuro: ele tem sono.', 'I read your future: it is sleepy.'],
  ['Gus', 'Hu-hu. Contar ovelhas é para amadores.', 'Hoo-hoo. Counting sheep is for amateurs.'],
  ['Doran das Minas', 'Cavei um túnel na sua cabeça. Tem eco.', 'I dug a tunnel in your head. It echoes.'],
  ['Coralina', 'Canto para os feridos. Você também é um.', 'I sing for the wounded. You are one too.'],
  ['Pipo Lanterna', 'Não apague a luz! Eu tenho medo do escuro.', "Don't turn off the light! I fear the dark."],
  ['Monice', 'Um solo de guitarra às três da manhã!', 'A guitar solo at three in the morning!'],
  ['Nico do Farol', 'Contei treze navios. Só existem doze.', 'I counted thirteen ships. There are only twelve.'],
  ['Marcos, o homem-peixe', 'Campeão de mergulho! Quer competir?', 'Diving champion! Want a race?'],
  ['Ray, a Arraia', 'Eu atravesso paredes. Você atravessa noites.', 'I swim through walls. You swim through nights.'],
  ['Jerry', 'Escondi uma noz no seu travesseiro.', 'I hid a nut in your pillow.'],
  ['Lyon', 'Eu vim te tirar daqui... daqui a pouco.', "I came to get you out... in a bit."],
  ['Hermes', 'Um cavalo no sétimo andar? Normal.', 'A horse on the seventh floor? Normal.'],
  ['Sentinela Autômato', 'INVASÃO DETECTADA. É SÓ VOCÊ.', 'INTRUDER DETECTED. IT IS ONLY YOU.'],
  ['Prisma de Empatia', 'Traduzi seu silêncio. Dizia: socorro.', 'I translated your silence. It said: help.'],
  ['O Paciente do Leito 13', 'Doze frascos. Eu era o décimo terceiro.', 'Twelve vials. I was the thirteenth.'],
  ['General Antigo', 'A guerra acabou? Ninguém me avisou.', 'The war is over? Nobody told me.'],
  ['Conselheiro Desperto', 'Preencha o formulário para enlouquecer.', 'Fill in the form to go mad.'],
  ['Eco da Cratera', 'Eco... eco... você ainda está aí?', 'Echo... echo... are you still there?'],
  ['Leviatã dos Sonhos', 'Eu nado no ar da sua torre.', 'I swim in the air of your tower.'],
  ['A Sombra de Richard', 'Eu sou o seu tédio. E eu nunca durmo.', 'I am your boredom. And I never sleep.'],
];
const QX = {   // as mesmas falas nos outros idiomas: pt-PT, ja, es, fr, zh-CN (inglês já está acima)
  0: ['Deste-me um nome. Agora dá-me descanso.', 'あなたは名前をくれた。今度は休みをちょうだい。', 'Me diste un nombre. Ahora dame descanso.', 'Tu m’as donné un nom. Donne-moi du repos.', '你给了我名字，现在给我安息。'],
  1: ['A antena ainda chama a Terra. Ninguém atende.', 'アンテナはまだ地球を呼んでる。だれも出ない。', 'La antena aún llama a la Tierra. Nadie contesta.', "L'antenne appelle encore la Terre. Personne ne répond.", '天线还在呼叫地球，没人回应。'],
  2: ['Magia sem cuidado é só barulho bonito.', '思いやりのない魔法は、ただのきれいな音。', 'Magia sin cuidado es solo ruido bonito.', 'La magie sans soin, ce n’est que du joli bruit.', '没有关怀的魔法只是好听的噪音。'],
  3: ['Li o teu futuro: tem sono.', 'あなたの未来を読んだ：ねむそう。', 'Leí tu futuro: tiene sueño.', "J'ai lu ton avenir : il a sommeil.", '我读了你的未来：它很困。'],
  4: ['Hu-hu. Contar ovelhas é para amadores.', 'ホーホー。羊を数えるのは素人だ。', 'Ju-ju. Contar ovejas es de aficionados.', 'Hou-hou. Compter les moutons, c’est pour les amateurs.', '咕咕。数羊是外行人干的。'],
  5: ['Cavei um túnel na tua cabeça. Tem eco.', '頭の中にトンネルを掘った。こだまするよ。', 'Cavé un túnel en tu cabeza. Hay eco.', "J'ai creusé un tunnel dans ta tête. Ça résonne.", '我在你脑袋里挖了条隧道，有回声。'],
  6: ['Canto para os feridos. Tu também és um.', '傷ついた人に歌う。あなたもそう。', 'Canto para los heridos. Tú también eres uno.', 'Je chante pour les blessés. Toi aussi, tu en es un.', '我为伤者歌唱，你也是其中之一。'],
  7: ['Não apagues a luz! Tenho medo do escuro.', '明かりを消さないで！暗いのがこわい。', '¡No apagues la luz! Me da miedo la oscuridad.', "N'éteins pas la lumière ! J'ai peur du noir.", '别关灯！我怕黑。'],
  8: ['Um solo de guitarra às três da manhã!', '午前3時のギターソロ！', '¡Un solo de guitarra a las tres de la mañana!', 'Un solo de guitare à trois heures du matin !', '凌晨三点的吉他独奏！'],
  9: ['Contei treze navios. Só existem doze.', '船を13隻数えた。12隻しかないのに。', 'Conté trece barcos. Solo hay doce.', "J'ai compté treize navires. Il n'y en a que douze.", '我数到十三艘船，可只有十二艘。'],
  10: ['Campeão de mergulho! Queres competir?', '潜水チャンピオン！勝負する？', '¡Campeón de buceo! ¿Echamos una carrera?', 'Champion de plongée ! On fait la course ?', '潜水冠军！要比一比吗？'],
  11: ['Eu atravesso paredes. Tu atravessas noites.', 'わたしは壁をすりぬける。あなたは夜をすりぬける。', 'Yo atravieso paredes. Tú atraviesas noches.', 'Je traverse les murs. Toi, les nuits.', '我穿过墙壁，你穿过黑夜。'],
  12: ['Escondi uma noz na tua almofada.', '枕にどんぐりをかくしたよ。', 'Escondí una nuez en tu almohada.', "J'ai caché une noix dans ton oreiller.", '我在你枕头里藏了颗坚果。'],
  13: ['Vim tirar-te daqui... daqui a pouco.', '助けに来た……もうすぐね。', 'Vine a sacarte de aquí... dentro de un rato.', 'Je suis venu te sortir de là... bientôt.', '我来救你出去……等一会儿。'],
  14: ['Um cavalo no sétimo andar? Normal.', '7階に馬？ふつうだね。', '¿Un caballo en el séptimo piso? Normal.', 'Un cheval au septième étage ? Normal.', '七楼有匹马？正常。'],
  15: ['INVASÃO DETETADA. ÉS SÓ TU.', '侵入者発見。あなただけだ。', 'INTRUSO DETECTADO. SOLO ERES TÚ.', "INTRUS DÉTECTÉ. CE N'EST QUE TOI.", '发现入侵者。只是你。'],
  16: ['Traduzi o teu silêncio. Dizia: socorro.', 'あなたの沈黙を訳した。「助けて」だった。', 'Traduje tu silencio. Decía: socorro.', "J'ai traduit ton silence. Il disait : à l'aide.", '我翻译了你的沉默：救命。'],
  17: ['Doze frascos. Eu era o décimo terceiro.', '薬は12本。ぼくは13人目だった。', 'Doce frascos. Yo era el decimotercero.', "Douze fioles. J'étais le treizième.", '十二瓶药，我是第十三个。'],
  18: ['A guerra acabou? Ninguém me avisou.', '戦争は終わった？だれも言ってくれなかった。', '¿La guerra acabó? Nadie me avisó.', 'La guerre est finie ? Personne ne me l’a dit.', '战争结束了？没人告诉我。'],
  19: ['Preencha o formulário para enlouquecer.', '気がくるうには書類に記入してください。', 'Rellene el formulario para enloquecer.', 'Remplissez le formulaire pour devenir fou.', '请填表后再发疯。'],
  20: ['Eco... eco... ainda estás aí?', 'こだま……こだま……まだいるの？', 'Eco... eco... ¿sigues ahí?', 'Écho... écho... tu es encore là ?', '回声……回声……你还在吗？'],
  21: ['Eu nado no ar da tua torre.', 'あなたの塔の空気を泳ぐ。', 'Nado en el aire de tu torre.', "Je nage dans l'air de ta tour.", '我在你塔里的空气中游泳。'],
  22: ['Eu sou o teu tédio. E nunca durmo.', 'わたしはあなたの退屈。決して眠らない。', 'Soy tu aburrimiento. Y nunca duermo.', 'Je suis ton ennui. Et je ne dors jamais.', '我就是你的无聊，而且我从不睡觉。'],
};
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
