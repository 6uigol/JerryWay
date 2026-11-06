# Jerry's Way

Jogo infinito e grátis do Jerry, no universo **Song of Moonlight**. Pule de fileira em fileira, desvie de carroças,
atravesse rios em cima de troncos, fuja do Trem Infinito e dos slimes. A tela sobe sozinha, devagar e cada vez mais
rápido: se ela passar do Jerry, ele abre um portal para Lacrímora e vai embora.

- **Controles:** toque = pula para a frente; arrastar = lados ou para trás. No PC: setas ou WASD (Esc pausa).
- **Zonas:** Campo de Brumavale, Floresta Sombria, Dunas, Picos Gelados, Lacrímora e a Lua (a cada 120 fileiras).
- **Sorte:** 100 moedas por tentativa, sorteia uma das 180 skins (comum 55%, rara 28%, épica 12,2%, lendária 4%, mítica 0,8%). Pode repetir.
- **Recordes fantasma:** seu recorde, a última partida e os 10 do ranking aparecem no caminho.
- **Conta:** a mesma do Song of Moonlight e do site (Firebase `castle-faec9`). Progresso em `jerryway/{uid}`, ranking em `jerrywayScores/{uid}`.
  As regras ficam no repositório do site (`firebase/firestore.rules`) e precisam ser publicadas no console do Firebase.

## Rodar e gerar as versões

```bash
npm install
npm run start:web        # no navegador: http://localhost:8080
npm start                # app desktop (Electron)
npm run build:cloud      # empacota o Firebase em vendor/cloud.bundle.js
npm run build:android    # dist/Jerrys-Way-<versão>.apk (precisa do SDK Android)
npm run build            # dist/Jerrys-Way-Setup-<versão>.exe e dist/Jerrys-Way-<versão>.AppImage
npm test                 # confere que o caminho gerado nunca fecha
```

Código: `src/world.js` (faixas infinitas), `src/game.js` (partida), `src/draw.js` (arte em pixel art),
`src/jerry.js` (o Jerry, o mesmo desenho do Song of Moonlight), `src/skins.js` (as 180 skins), `src/ui.js` (menus).

## Anúncios e "Sem anúncios"

- **Android:** AdMob (`@capacitor-community/admob`). O jogo está com os IDs de **teste** do Google. Para receber de verdade:
  1. Crie a conta em admob.google.com, adicione o app Android `com.jerryway.game` e crie dois blocos: **Premiado** (reviver) e **Intersticial** (entre partidas).
  2. Troque o ID do app em `android/app/src/main/res/values/strings.xml` (`admob_app_id`, formato `ca-app-pub-XXXX~YYYY`).
  3. Troque os IDs dos blocos em `src/ads.js` (`ADMOB.rewarded` e `ADMOB.interstitial`); bloco com ID de teste do Google roda em modo teste.
- **PC (Windows/Linux):** anúncio próprio do Song of Moonlight (`icons/som-ad.jpg`), sem rede de anúncios.
- **Limites:** anúncio entre partidas a cada 3 mortes, nunca antes de 1 minuto do anterior e no máximo 20 por dia. Se o AdMob não abrir um anúncio em até 5 s, entra o anúncio próprio do Song of Moonlight. Cada anúncio espera no máximo 8 s para carregar; sem anúncio disponível, o jogo segue (o vídeo de reviver usa o anúncio próprio).
- **Reviver:** 1 vez por partida, vendo vídeo (sempre disponível, mesmo para quem tirou os anúncios) ou por 70 moedas (40 com a habilidade Pechincheiro).
- **Sem anúncios (R$ 9,90):** comprado no site com a conta (`#/comprar/jerry-way-noads`) ou por chave de resgate (Admin → Chaves de resgate → "Para que serve: Sem anúncios"; usar em songofmoonlight.online/#/chaves). O jogo confere em `/api/jerry?op=ent`.

## Dimensões bônus e habilidades

- **Portal dourado:** chance pequena-média: a partir da fileira 60, cada grama tem 1,2% de chance de ter o portal, com pelo menos 150 fileiras entre um e outro (em média um a cada ~400 fileiras; mais com a habilidade Explorador). Pulando nele, o Jerry vai para uma dimensão bônus e depois volta para o mesmo lugar. Lá dentro ele não morre: se bater, só volta antes.
- **Toda dimensão é um labirinto passável** (médio-difícil, numa tela só) com **no máximo 10 s** e **no máximo 17 moedas normais e 3 de 5** (a quantidade varia). Chegar à saída antes do tempo vale **+3 moedas**; se o tempo acabar, volta sem esse bônus. Nunca repete a mesma duas vezes seguidas. Constantes em `src/world.js` (`BONUS_TIME`, `BONUS_MAX`, `BONUS_FINISH`, `BONUS_CHANCE`).
- **9 dimensões:** Labirinto da Floresta, Cofre da Lua (mais moedas), Lagoa Dourada (só vitórias-régias), Mina de Lacrímora (slimes nos corredores), Trilhos Dourados (carrinhos), Tempestade nas Dunas (vento empurra), Chuva de Estrelas (meteoros com sombra), Lago Congelado (escorrega até a curva) e Caça ao Esquilo Dourado (pegar o esquilo vale 5).
- **Habilidades passivas:** toda skin tem uma (`ABILITIES` em `src/skins.js`). A raridade não deixa a habilidade mais forte; cada habilidade existe em todas as raridades.
- **Chave "Todas as skins":** criada no Admin (Chaves de resgate → Para que serve: Todas as skins) e usada na aba **Chaves** do site com a conta. O jogo confere em `/api/jerry?op=ent` e libera todas as skins do Jerry's Way, inclusive as míticas.
- **Depois da fileira 1000 (sem aviso):** tentáculos pretos sobem pela borda de baixo e perseguem o Jerry (a tela sobe 15% mais rápido); se alcançarem, acabou, e não dá para reviver. Cai 3,2% mais moeda (`HARD_ROW` e `HARD_COINS` em `src/world.js`). A tela treme de leve e toca uma playlist de 5 músicas tensas (`HARD_SONGS` em `src/music.js`).
