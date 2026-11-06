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
- **Limites:** anúncio entre partidas só a cada 3 mortes, nunca antes de 2 minutos do anterior, nunca nas 2 primeiras partidas do dia e no máximo 20 por dia. Cada anúncio espera no máximo 8 s para carregar; sem anúncio disponível, o jogo segue (o vídeo de reviver usa o anúncio próprio).
- **Reviver:** 1 vez por partida, vendo vídeo (sempre disponível, mesmo para quem tirou os anúncios) ou por 70 moedas (40 com a habilidade Pechincheiro).
- **Sem anúncios (R$ 9,90):** comprado no site com a conta (`#/comprar/jerry-way-noads`) ou por chave de resgate (Admin → Chaves de resgate → "Para que serve: Sem anúncios"; usar em songofmoonlight.online/#/chaves). O jogo confere em `/api/jerry?op=ent`.

## Dimensões bônus e habilidades

- **Portal dourado:** aparece no caminho (primeiro por volta da fileira 45-75, depois a cada 130-200 fileiras; mais com a habilidade Explorador). Pulando nele, o Jerry vai para uma dimensão bônus e depois volta para o mesmo lugar. Lá dentro ele não morre: se cair ou bater, só volta antes.
- **Cada dimensão dura no máximo 10 s e tem no máximo 17 moedas normais e 3 moedas de 5** (`BONUS_TIME` e `BONUS_MAX` em `src/world.js`). Nunca repete a mesma duas vezes seguidas.
- **9 dimensões:** Cofre da Lua, Lagoa Dourada, Mina de Lacrímora, Tempestade nas Dunas (vento empurra), Trilhos Dourados (trens), Chuva de Estrelas (moedas caindo, meteoros), Labirinto da Floresta, Lago Congelado (escorrega até bater) e Caça ao Esquilo Dourado.
- **Habilidades passivas:** toda skin tem uma (`ABILITIES` em `src/skins.js`). A raridade não deixa a habilidade mais forte; cada habilidade existe em todas as raridades.
- **Chave "Todas as skins":** criada no Admin (Chaves de resgate → Para que serve: Todas as skins) e usada na aba **Chaves** do site com a conta. O jogo confere em `/api/jerry?op=ent` e libera todas as skins do Jerry's Way, inclusive as míticas.
