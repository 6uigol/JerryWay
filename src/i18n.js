// Idiomas do Jerry's Way (os mesmos do Song of Moonlight). O jogo é escrito em português do Brasil; aqui cada texto
// tem a sua tradução. As telas HTML são traduzidas sozinhas (translateDom) e os textos do canvas passam por tr().
export const LANGS = [
  { code: 'pt-BR', name: 'Português (Brasil)' }, { code: 'pt-PT', name: 'Português (Portugal)' }, { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' }, { code: 'es', name: 'Español' }, { code: 'fr', name: 'Français' }, { code: 'zh-CN', name: '中文（简体）' },
];
// colunas: pt-PT, en, ja, es, fr, zh-CN.  {0}, {1}: números ou nomes que mudam
const T = {
  // início
  'JOGAR': ['JOGAR', 'PLAY', 'あそぶ', 'JUGAR', 'JOUER', '开始'],
  'Sortear skin': ['Sortear skin', 'Draw a skin', 'スキンガチャ', 'Sortear skin', 'Tirer un skin', '抽取皮肤'],
  'Coleção': ['Coleção', 'Collection', 'コレクション', 'Colección', 'Collection', '收藏'],
  'Ranking': ['Classificação', 'Leaderboard', 'ランキング', 'Ranking', 'Classement', '排行榜'],
  'Conta': ['Conta', 'Account', 'アカウント', 'Cuenta', 'Compte', '账号'],
  'Loja: moedas, Multiplicador e pacotes': ['Loja: moedas, Multiplicador e pacotes', 'Shop: coins, Multiplier and bundles', 'ショップ：コイン・倍率・パック', 'Tienda: monedas, Multiplicador y packs', 'Boutique : pièces, Multiplicateur et packs', '商店：金币、倍增器和礼包'],
  'Configurações': ['Definições', 'Settings', 'せってい', 'Ajustes', 'Réglages', '设置'],
  'Sair do jogo': ['Sair do jogo', 'Quit game', 'ゲームをやめる', 'Salir del juego', 'Quitter le jeu', '退出游戏'],
  'Toque para pular para frente. Arraste para os lados ou para trás.': ['Toque para saltar para a frente. Arraste para os lados ou para trás.', 'Tap to hop forward. Swipe sideways or back.', 'タップで前へジャンプ。左右や後ろへはスワイプ。', 'Toca para saltar hacia delante. Desliza a los lados o hacia atrás.', 'Touche pour sauter en avant. Glisse sur les côtés ou en arrière.', '点击向前跳，左右或向后滑动。'],
  'No PC: setas ou WASD. No controle: direcional ou analógico. Poder: botão na tela, E/Shift ou X/Y.': ['No PC: setas ou WASD. No comando: direcional ou analógico. Poder: botão no ecrã, E/Shift ou X/Y.', 'PC: arrows or WASD. Gamepad: D-pad or stick. Power: on-screen button, E/Shift or X/Y.', 'PC：矢印キーかWASD。コントローラー：十字キーかスティック。パワー：画面のボタン、E/Shift、X/Y。', 'PC: flechas o WASD. Mando: cruceta o stick. Poder: botón en pantalla, E/Shift o X/Y.', 'PC : flèches ou ZQSD/WASD. Manette : croix ou stick. Pouvoir : bouton à l\'écran, E/Shift ou X/Y.', '电脑：方向键或 WASD。手柄：十字键或摇杆。能力：屏幕按钮、E/Shift 或 X/Y。'],
  'Termos de Uso': ['Termos de Utilização', 'Terms of Use', '利用規約', 'Términos de uso', "Conditions d'utilisation", '使用条款'],
  'Privacidade': ['Privacidade', 'Privacy', 'プライバシー', 'Privacidad', 'Confidentialité', '隐私'],
  'Compras e Reembolsos': ['Compras e Reembolsos', 'Purchases and Refunds', '購入と返金', 'Compras y reembolsos', 'Achats et remboursements', '购买与退款'],
  'Recorde': ['Recorde', 'Best', 'ベスト', 'Récord', 'Record', '最高'],
  // configurações
  'Música': ['Música', 'Music', '音楽', 'Música', 'Musique', '音乐'],
  'Efeitos': ['Efeitos', 'Sound effects', '効果音', 'Efectos', 'Effets', '音效'],
  'Idioma': ['Idioma', 'Language', '言語', 'Idioma', 'Langue', '语言'],
  'Voltar': ['Voltar', 'Back', 'もどる', 'Volver', 'Retour', '返回'],
  'Desligado': ['Desligado', 'Off', 'オフ', 'Apagado', 'Coupé', '关闭'],
  // pausa e fim
  'Pausa': ['Pausa', 'Paused', 'ポーズ', 'Pausa', 'Pause', '暂停'],
  'CONTINUAR': ['CONTINUAR', 'RESUME', 'つづける', 'CONTINUAR', 'REPRENDRE', '继续'],
  'Desistir': ['Desistir', 'Give up', 'あきらめる', 'Rendirse', 'Abandonner', '放弃'],
  'Fim da corrida': ['Fim da corrida', 'Run over', 'ゲームオーバー', 'Fin de la carrera', 'Fin de la course', '本局结束'],
  'NOVO RECORDE MUNDIAL!': ['NOVO RECORDE MUNDIAL!', 'NEW WORLD RECORD!', '世界新記録！', '¡NUEVO RÉCORD MUNDIAL!', 'NOUVEAU RECORD DU MONDE !', '新的世界纪录！'],
  'NOVO RECORDE PESSOAL!': ['NOVO RECORDE PESSOAL!', 'NEW PERSONAL BEST!', '自己ベスト更新！', '¡NUEVO RÉCORD PERSONAL!', 'NOUVEAU RECORD PERSO !', '个人新纪录！'],
  'A tela passou do Jerry... ele abriu um portal para Lacrímora e foi embora!': ['O ecrã passou o Jerry... ele abriu um portal para Lacrímora e foi-se embora!', 'The screen left Jerry behind... he opened a portal to Lacrímora and left!', '画面に置いていかれたジェリーは、ラクリモラへのポータルを開いて行ってしまった！', 'La pantalla dejó atrás a Jerry... ¡abrió un portal a Lacrímora y se fue!', "L'écran a dépassé Jerry... il a ouvert un portail vers Lacrímora et il est parti !", '画面甩下了杰瑞……他打开通往拉克里莫拉的传送门走了！'],
  'O Jerry caiu na água!': ['O Jerry caiu à água!', 'Jerry fell in the water!', 'ジェリーが水に落ちた！', '¡Jerry cayó al agua!', "Jerry est tombé à l'eau !", '杰瑞掉进水里了！'],
  'O Jerry foi atropelado!': ['O Jerry foi atropelado!', 'Jerry got run over!', 'ジェリーがひかれた！', '¡Atropellaron a Jerry!', 'Jerry s\'est fait renverser !', '杰瑞被撞了！'],
  'Algo saiu da escuridão e pegou o Jerry...': ['Algo saiu da escuridão e apanhou o Jerry...', 'Something came out of the dark and got Jerry...', '暗やみから何かが出てきてジェリーをつかまえた……', 'Algo salió de la oscuridad y atrapó a Jerry...', "Quelque chose est sorti de l'ombre et a attrapé Jerry...", '黑暗中有东西抓走了杰瑞……'],
  'Pessoal': ['Pessoal', 'Personal', '自己', 'Personal', 'Perso', '个人'],
  'Mundial': ['Mundial', 'World', '世界', 'Mundial', 'Monde', '世界'],
  'JOGAR DE NOVO': ['JOGAR OUTRA VEZ', 'PLAY AGAIN', 'もう一回', 'JUGAR OTRA VEZ', 'REJOUER', '再玩一次'],
  'Sortear': ['Sortear', 'Draw', 'ガチャ', 'Sortear', 'Tirer', '抽取'],
  'Menu': ['Menu', 'Menu', 'メニュー', 'Menú', 'Menu', '菜单'],
  'Skin Mítica desbloqueada!': ['Skin Mítica desbloqueada!', 'Mythic skin unlocked!', '神話スキン解放！', '¡Skin mítica desbloqueada!', 'Skin mythique débloqué !', '神话皮肤已解锁！'],
  'Usar agora': ['Usar agora', 'Use now', '今すぐ使う', 'Usar ahora', 'Utiliser', '立即使用'],
  'Usando': ['A usar', 'In use', '使用中', 'En uso', 'Utilisé', '使用中'],
  'Com o Multiplicador você levaria +{0} moedas a mais': ['Com o Multiplicador levaria +{0} moedas a mais', 'With the Multiplier you would get +{0} more coins', '倍率があれば +{0} コイン多くもらえた', 'Con el Multiplicador ganarías +{0} monedas más', 'Avec le Multiplicateur tu aurais +{0} pièces de plus', '有倍增器的话会多得 +{0} 金币'],
  'Recorde enviado para o ranking!': ['Recorde enviado para a classificação!', 'Score sent to the leaderboard!', 'ランキングに送信しました！', '¡Récord enviado al ranking!', 'Record envoyé au classement !', '纪录已提交到排行榜！'],
  'Entre com sua conta (Conta) para aparecer no ranking.': ['Entre com a sua conta (Conta) para aparecer na classificação.', 'Sign in (Account) to appear on the leaderboard.', 'ランキングにのるには（アカウント）でログイン。', 'Inicia sesión (Cuenta) para aparecer en el ranking.', 'Connecte-toi (Compte) pour apparaître au classement.', '登录（账号）即可上榜。'],
  // sortear e coleção
  'Abrindo a noz...': ['A abrir a noz...', 'Opening the nut...', 'どんぐりを開けている……', 'Abriendo la nuez...', 'Ouverture de la noix...', '正在打开坚果……'],
  'Repetida! Você já tinha essa.': ['Repetida! Já tinha esta.', 'Duplicate! You already had it.', 'ダブり！もう持っている。', '¡Repetida! Ya la tenías.', 'Doublon ! Tu l\'avais déjà.', '重复了！你已经有了。'],
  'NOVA!': ['NOVA!', 'NEW!', 'NEW！', '¡NUEVA!', 'NOUVEAU !', '新！'],
  'TENTAR ({0})': ['TENTAR ({0})', 'DRAW ({0})', 'まわす（{0}）', 'PROBAR ({0})', 'TIRER ({0})', '抽取（{0}）'],
  'DE NOVO ({0})': ['OUTRA VEZ ({0})', 'AGAIN ({0})', 'もう一回（{0}）', 'OTRA VEZ ({0})', 'ENCORE ({0})', '再抽（{0}）'],
  'Faltam moedas? Comprar moedas': ['Faltam moedas? Comprar moedas', 'Need coins? Buy coins', 'コインが足りない？コインを買う', '¿Faltan monedas? Comprar monedas', 'Pas assez de pièces ? En acheter', '金币不够？购买金币'],
  'Todas': ['Todas', 'All', 'すべて', 'Todas', 'Tous', '全部'],
  'Faltam': ['Faltam', 'Missing', '未入手', 'Faltan', 'Manquants', '未拥有'],
  'Já tenho': ['Já tenho', 'Owned', '入手済み', 'Ya tengo', 'Obtenus', '已拥有'],
  'Usar esta skin': ['Usar esta skin', 'Use this skin', 'このスキンを使う', 'Usar esta skin', 'Utiliser ce skin', '使用此皮肤'],
  'Ainda não tem: sai no Sortear skin.': ['Ainda não tem: sai no Sortear skin.', 'Not yours yet: get it in Draw a skin.', 'まだない：スキンガチャで出る。', 'Aún no la tienes: sale en Sortear skin.', 'Pas encore : il sort dans Tirer un skin.', '还没有：可在抽取皮肤中获得。'],
  'Nenhuma skin aqui.': ['Nenhuma skin aqui.', 'No skins here.', 'ここにスキンはない。', 'No hay skins aquí.', 'Aucun skin ici.', '这里没有皮肤。'],
  // ranking e conta
  'Atualizar': ['Atualizar', 'Refresh', '更新', 'Actualizar', 'Actualiser', '刷新'],
  'Ninguém no ranking ainda. Seja o primeiro!': ['Ninguém na classificação ainda. Seja o primeiro!', 'Nobody on the leaderboard yet. Be the first!', 'まだだれもいない。一番乗りしよう！', 'Nadie en el ranking aún. ¡Sé el primero!', 'Personne au classement. Sois le premier !', '排行榜还没人，来当第一吧！'],
  'Entre com sua conta para aparecer no ranking.': ['Entre com a sua conta para aparecer na classificação.', 'Sign in to appear on the leaderboard.', 'ログインするとランキングにのる。', 'Inicia sesión para aparecer en el ranking.', 'Connecte-toi pour apparaître au classement.', '登录即可上榜。'],
  'ou com e-mail': ['ou com e-mail', 'or with e-mail', 'またはメールで', 'o con e-mail', 'ou par e-mail', '或使用邮箱'],
  'Entrar': ['Entrar', 'Sign in', 'ログイン', 'Entrar', 'Se connecter', '登录'],
  'Criar conta': ['Criar conta', 'Create account', 'アカウント作成', 'Crear cuenta', 'Créer un compte', '注册'],
  'Esqueci a senha': ['Esqueci-me da palavra-passe', 'Forgot password', 'パスワードを忘れた', 'Olvidé la contraseña', 'Mot de passe oublié', '忘记密码'],
  'Jogar sem conta': ['Jogar sem conta', 'Play without an account', 'アカウントなしで遊ぶ', 'Jugar sin cuenta', 'Jouer sans compte', '不登录直接玩'],
  'Já confirmei': ['Já confirmei', 'I confirmed it', '確認した', 'Ya confirmé', "C'est confirmé", '已确认'],
  'Reenviar': ['Reenviar', 'Resend', '再送信', 'Reenviar', 'Renvoyer', '重新发送'],
  'Sair': ['Sair', 'Sign out', 'ログアウト', 'Salir', 'Déconnexion', '退出'],
  'Sair da conta': ['Sair da conta', 'Sign out', 'ログアウト', 'Cerrar sesión', 'Se déconnecter', '退出账号'],
  'Trocar': ['Trocar', 'Change', '変更', 'Cambiar', 'Changer', '更改'],
  'Salvar': ['Guardar', 'Save', '保存', 'Guardar', 'Enregistrer', '保存'],
  'Confirme seu e-mail': ['Confirme o seu e-mail', 'Confirm your e-mail', 'メールを確認してね', 'Confirma tu e-mail', 'Confirme ton e-mail', '请确认邮箱'],
  'Seu nome': ['O seu nome', 'Your name', 'なまえ', 'Tu nombre', 'Ton nom', '你的名字'],
  'Senha': ['Palavra-passe', 'Password', 'パスワード', 'Contraseña', 'Mot de passe', '密码'],
  'Conectando...': ['A ligar...', 'Connecting...', '接続中……', 'Conectando...', 'Connexion...', '连接中……'],
  // reviver e loja
  'Reviver?': ['Reviver?', 'Revive?', '復活する？', '¿Revivir?', 'Revivre ?', '复活？'],
  'Continue de onde parou. Só dá para reviver uma vez por partida.': ['Continue de onde parou. Só dá para reviver uma vez por partida.', 'Continue where you left off. Only one revive per run.', '続きから再開。復活は1回のプレイで1度だけ。', 'Sigue donde lo dejaste. Solo se puede revivir una vez por partida.', 'Reprends là où tu étais. Une seule fois par partie.', '从原地继续。每局只能复活一次。'],
  'Reviver por {0}': ['Reviver por {0}', 'Revive for {0}', '{0} で復活', 'Revivir por {0}', 'Revivre pour {0}', '花 {0} 复活'],
  'Você tem {0}': ['Tem {0}', 'You have {0}', '所持 {0}', 'Tienes {0}', 'Tu as {0}', '你有 {0}'],
  'Comprar 150 moedas': ['Comprar 150 moedas', 'Buy 150 coins', '150コインを買う', 'Comprar 150 monedas', 'Acheter 150 pièces', '购买 150 金币'],
  'Não, obrigado': ['Não, obrigado', 'No, thanks', 'いいえ', 'No, gracias', 'Non merci', '不用了'],
  'Já comprei': ['Já comprei', 'I already bought it', '購入した', 'Ya compré', "J'ai déjà acheté", '我已购买'],
  'Loja': ['Loja', 'Shop', 'ショップ', 'Tienda', 'Boutique', '商店'],
  'Comprar': ['Comprar', 'Buy', '買う', 'Comprar', 'Acheter', '购买'],
  '✓ Já é seu': ['✓ Já é seu', '✓ Yours', '✓ 入手済み', '✓ Ya es tuyo', '✓ À toi', '✓ 已拥有'],
  'Entrar na conta': ['Entrar na conta', 'Sign in', 'ログイン', 'Iniciar sesión', 'Se connecter', '登录'],
  'Melhor oferta': ['Melhor oferta', 'Best deal', 'いちばんお得', 'Mejor oferta', 'Meilleure offre', '最划算'],
  'Multiplicador de moedas': ['Multiplicador de moedas', 'Coin Multiplier', 'コイン倍率', 'Multiplicador de monedas', 'Multiplicateur de pièces', '金币倍增器'],
  'Todas as skins': ['Todas as skins', 'All skins', '全スキン', 'Todas las skins', 'Tous les skins', '全部皮肤'],
  '{0} moedas': ['{0} moedas', '{0} coins', '{0}コイン', '{0} monedas', '{0} pièces', '{0} 金币'],
  // durante a partida (canvas)
  'Toque para pular': ['Toque para saltar', 'Tap to hop', 'タップでジャンプ', 'Toca para saltar', 'Touche pour sauter', '点击跳跃'],
  'Espaço ou setas para pular': ['Espaço ou setas para saltar', 'Space or arrows to hop', 'スペースか矢印でジャンプ', 'Espacio o flechas para saltar', 'Espace ou flèches pour sauter', '空格或方向键跳跃'],
  'PODER': ['PODER', 'POWER', 'パワー', 'PODER', 'POUVOIR', '能力'],
  'Novo recorde pessoal!': ['Novo recorde pessoal!', 'New personal best!', '自己ベスト更新！', '¡Nuevo récord personal!', 'Nouveau record perso !', '个人新纪录！'],
  'Passou a última partida!': ['Passou a última partida!', 'Beat your last run!', '前回をこえた！', '¡Superaste la última partida!', 'Tu as battu ta dernière partie !', '超过上一局了！'],
  'Passou {0}!': ['Passou {0}!', 'Passed {0}!', '{0} をぬいた！', '¡Pasaste a {0}!', 'Tu as dépassé {0} !', '超过了 {0}！'],
  'Campeão: +{0} moedas!': ['Campeão: +{0} moedas!', 'Champion: +{0} coins!', 'チャンピオン：+{0} コイン！', 'Campeón: +{0} monedas!', 'Champion : +{0} pièces !', '冠军：+{0} 金币！'],
  'Pegou o esquilo dourado! +5': ['Apanhou o esquilo dourado! +5', 'Caught the golden squirrel! +5', '金のリスをつかまえた！ +5', '¡Atrapaste la ardilla dorada! +5', "Écureuil doré attrapé ! +5", '抓到金松鼠！+5'],
  'Saiu do labirinto! +{0} moedas': ['Saiu do labirinto! +{0} moedas', 'Out of the maze! +{0} coins', '迷路を出た！ +{0} コイン', '¡Saliste del laberinto! +{0} monedas', 'Sorti du labyrinthe ! +{0} pièces', '走出迷宫！+{0} 金币'],
  'Voltou da dimensão: +{0} moedas': ['Voltou da dimensão: +{0} moedas', 'Back from the dimension: +{0} coins', '次元からもどった：+{0} コイン', 'Volviste de la dimensión: +{0} monedas', 'Retour de la dimension : +{0} pièces', '从异次元回来：+{0} 金币'],
  'Acabou o tempo: +{0} moedas': ['Acabou o tempo: +{0} moedas', "Time's up: +{0} coins", '時間切れ：+{0} コイン', 'Se acabó el tiempo: +{0} monedas', 'Temps écoulé : +{0} pièces', '时间到：+{0} 金币'],
  '+{0} moedas da Loja!': ['+{0} moedas da Loja!', '+{0} coins from the Shop!', 'ショップから +{0} コイン！', '¡+{0} monedas de la Tienda!', '+{0} pièces de la Boutique !', '商店到账 +{0} 金币！'],
  'Skin Mítica!': ['Skin Mítica!', 'Mythic skin!', '神話スキン！', '¡Skin mítica!', 'Skin mythique !', '神话皮肤！'],
  'O esquilo mítico fugiu!': ['O esquilo mítico fugiu!', 'The mythic squirrel ran away!', '神話のリスがにげた！', '¡La ardilla mítica escapó!', "L'écureuil mythique s'est enfui !", '神话松鼠跑掉了！'],
  'O poder não funciona nas dimensões bônus': ['O poder não funciona nas dimensões bónus', "Powers don't work in bonus dimensions", 'ボーナス次元ではパワーは使えない', 'El poder no funciona en las dimensiones bonus', 'Le pouvoir ne marche pas dans les dimensions bonus', '能力在奖励次元中无效'],
  'Nenhum lugar seguro agora': ['Nenhum lugar seguro agora', 'No safe spot right now', '今は安全な場所がない', 'Ningún lugar seguro ahora', 'Aucun endroit sûr pour le moment', '现在没有安全的地方'],
  'Toque de novo para ir': ['Toque outra vez para ir', 'Tap again to go', 'もう一度タップで移動', 'Toca otra vez para ir', 'Touche encore pour y aller', '再点一次前往'],
  'Acabou o Andar na Água: voltou para a margem': ['Acabou o Andar na Água: voltou para a margem', 'Water Walk ended: back to the shore', '水上歩きが終わった：岸にもどった', 'Se acabó Caminar sobre el Agua: volviste a la orilla', "Fin de Marche sur l'eau : retour au bord", '水上行走结束：回到岸边'],
  'Ache a saída do labirinto!': ['Encontre a saída do labirinto!', 'Find the maze exit!', '迷路の出口をさがせ！', '¡Encuentra la salida del laberinto!', 'Trouve la sortie du labyrinthe !', '找到迷宫出口！'],
  'Muitas moedas! Ache a saída!': ['Muitas moedas! Encontre a saída!', 'Lots of coins! Find the exit!', 'コインがいっぱい！出口をさがせ！', '¡Muchas monedas! ¡Encuentra la salida!', 'Plein de pièces ! Trouve la sortie !', '好多金币！找到出口！'],
  'Só dá para pisar nas vitórias-régias!': ['Só dá para pisar nos nenúfares!', 'Only step on the lily pads!', 'スイレンの葉だけ踏める！', '¡Solo se puede pisar los nenúfares!', 'Marche seulement sur les nénuphars !', '只能踩睡莲叶！'],
  'Desvie dos slimes no caminho!': ['Desvie-se dos slimes no caminho!', 'Dodge the slimes!', 'スライムをよけろ！', '¡Esquiva los slimes!', 'Évite les slimes !', '躲开史莱姆！'],
  // painéis do computador
  'Recorde mundial': ['Recorde mundial', 'World record', '世界記録', 'Récord mundial', 'Record du monde', '世界纪录'],
  'é seu agora!': ['é seu agora!', 'is yours now!', 'あなたのもの！', '¡ahora es tuyo!', 'est à toi !', '现在是你的了！'],
  'ninguém ainda': ['ninguém ainda', 'nobody yet', 'まだいない', 'nadie aún', 'personne', '还没有人'],
  'de {0}': ['de {0}', 'by {0}', '{0}', 'de {0}', 'de {0}', '{0}'],
  'Lugar': ['Lugar', 'Place', '場所', 'Lugar', 'Lieu', '地点'],
  'Poder:': ['Poder:', 'Power:', 'パワー：', 'Poder:', 'Pouvoir :', '能力：'],
  'Poder (botão):': ['Poder (botão):', 'Power (button):', 'パワー（ボタン）：', 'Poder (botón):', 'Pouvoir (bouton) :', '能力（按键）：'],
  'Poder': ['Poder', 'Power', 'パワー', 'Poder', 'Pouvoir', '能力'],
  'Ninguém ainda.': ['Ninguém ainda.', 'Nobody yet.', 'まだいない。', 'Nadie aún.', 'Personne.', '还没有人。'],
  'Controles': ['Controlos', 'Controls', '操作', 'Controles', 'Commandes', '操作'],
  'Setas ou WASD: pular': ['Setas ou WASD: saltar', 'Arrows or WASD: hop', '矢印かWASD：ジャンプ', 'Flechas o WASD: saltar', 'Flèches ou WASD : sauter', '方向键或 WASD：跳'],
  'Espaço: pra frente': ['Espaço: para a frente', 'Space: forward', 'スペース：前へ', 'Espacio: adelante', 'Espace : en avant', '空格：向前'],
  'Esc: pausa': ['Esc: pausa', 'Esc: pause', 'Esc：ポーズ', 'Esc: pausa', 'Échap : pause', 'Esc：暂停'],
  'Controle: direcional': ['Comando: direcional', 'Gamepad: D-pad', 'コントローラー：十字キー', 'Mando: cruceta', 'Manette : croix', '手柄：十字键'],
  'ou analógico, A, Start': ['ou analógico, A, Start', 'or stick, A, Start', 'かスティック、A、Start', 'o stick, A, Start', 'ou stick, A, Start', '或摇杆、A、Start'],
  'Campo de Brumavale': ['Campo de Brumavale', 'Brumavale Fields', 'ブルマヴァーレの野', 'Campo de Brumavale', 'Champs de Brumavale', '布鲁马瓦莱原野'],
  'Floresta Sombria': ['Floresta Sombria', 'Dark Forest', '暗い森', 'Bosque Sombrío', 'Forêt Sombre', '幽暗森林'],
  'Dunas': ['Dunas', 'Dunes', '砂丘', 'Dunas', 'Dunes', '沙丘'],
  'Picos Gelados': ['Picos Gelados', 'Frozen Peaks', '凍った峰', 'Picos Helados', 'Pics Gelés', '冰封山峰'],
  'A Lua': ['A Lua', 'The Moon', '月', 'La Luna', 'La Lune', '月亮'],
  'Labirinto da Floresta': ['Labirinto da Floresta', 'Forest Maze', '森の迷路', 'Laberinto del Bosque', 'Labyrinthe de la Forêt', '森林迷宫'],
  'Cofre da Lua': ['Cofre da Lua', 'Moon Vault', '月の金庫', 'Cofre de la Luna', 'Coffre de la Lune', '月之宝库'],
  'Lagoa Dourada': ['Lagoa Dourada', 'Golden Pond', '金の池', 'Laguna Dorada', 'Étang Doré', '金色池塘'],
  'Mina de Lacrímora': ['Mina de Lacrímora', 'Lacrímora Mine', 'ラクリモラ鉱山', 'Mina de Lacrímora', 'Mine de Lacrímora', '拉克里莫拉矿井'],
};
const COL = { 'pt-PT': 0, en: 1, ja: 2, es: 3, fr: 4, 'zh-CN': 5 };
const KEY = 'jw_lang';
let lang = 'pt-BR';
try {
  const s = localStorage.getItem(KEY);
  if (s && LANGS.some((l) => l.code === s)) lang = s;
  else { const n = (navigator.language || '').toLowerCase(); lang = n.startsWith('pt-pt') ? 'pt-PT' : n.startsWith('pt') ? 'pt-BR' : n.startsWith('ja') ? 'ja' : n.startsWith('es') ? 'es' : n.startsWith('fr') ? 'fr' : n.startsWith('zh') ? 'zh-CN' : n.startsWith('en') ? 'en' : 'pt-BR'; }
} catch (_) { /* sem storage */ }
export const getLang = () => lang;
export function setLang(code) { lang = code; try { localStorage.setItem(KEY, code); } catch (_) { /* ok */ } document.documentElement.lang = code; }
// textos com {0}: viram expressões (o valor no lugar é mantido)
const PATTERNS = Object.keys(T).filter((k) => k.includes('{0}')).map((k) => [new RegExp('^' + k.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace('{0}', '(.+?)') + '$'), k]);
export function tr(s) {
  if (lang === 'pt-BR' || typeof s !== 'string') return s;
  const col = COL[lang], row = T[s];
  if (row) return row[col] || s;
  for (const [re, k] of PATTERNS) { const m = s.match(re); if (m) return (T[k][col] || k).replace('{0}', m[1]); }
  return s;
}
// traduz os textos de um pedaço de HTML (botões, títulos, avisos), mantendo espaços e números em volta
export function translateDom(root) {
  if (lang === 'pt-BR' || !root) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const raw = n.nodeValue, s = raw.trim(); if (!s) continue;
    const t = tr(s); if (t !== s) n.nodeValue = raw.replace(s, t);
  }
  root.querySelectorAll?.('[placeholder]').forEach((el) => { const t = tr(el.getAttribute('placeholder')); if (t) el.setAttribute('placeholder', t); });
}
export const fontFor = (px) => (lang === 'ja' || lang === 'zh-CN' ? `${px}px "Press Start 2P", "Noto Sans CJK JP", "Hiragino Sans", "Microsoft YaHei", sans-serif` : `${px}px "Press Start 2P", monospace`);
