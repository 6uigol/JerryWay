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

## Reviver e chaves

- **Sem anúncios:** o jogo não tem anúncio nenhum (nem AdMob nem anúncio próprio).
- **Reviver:** 1 vez por partida, por 70 moedas (40 com a habilidade Pechincheiro). Sem moedas suficientes, vai direto para o fim. Depois da fileira 1000 não dá para reviver.

## Dimensões bônus e habilidades

- **Portal dourado:** chance pequena-média: a partir da fileira 60, cada grama tem 1,2% de chance de ter o portal, com pelo menos 150 fileiras entre um e outro (em média um a cada ~400 fileiras; mais com a habilidade Explorador). Pulando nele, o Jerry vai para uma dimensão bônus e depois volta para o mesmo lugar. Lá dentro ele não morre: se bater, só volta antes.
- **Toda dimensão é um labirinto passável** (médio-difícil, numa tela só) com **no máximo 10 s** e **no máximo 17 moedas normais e 3 de 5** (a quantidade varia). Chegar à saída antes do tempo vale **+3 moedas**; se o tempo acabar, volta sem esse bônus. Nunca repete a mesma duas vezes seguidas. Constantes em `src/world.js` (`BONUS_TIME`, `BONUS_MAX`, `BONUS_FINISH`, `BONUS_CHANCE`).
- **9 dimensões:** Labirinto da Floresta, Cofre da Lua (mais moedas), Lagoa Dourada (só vitórias-régias), Mina de Lacrímora (slimes nos corredores), Trilhos Dourados (carrinhos), Tempestade nas Dunas (vento empurra), Chuva de Estrelas (meteoros com sombra), Lago Congelado (escorrega até a curva) e Caça ao Esquilo Dourado (pegar o esquilo vale 5).
- **450 skins** (170 comuns, 135 raras, 90 épicas, 35 lendárias e 20 míticas). As novas entram sempre no fim da lista (ids s180-s449), para ninguém perder as que já tem.
- **450 poderes, um para cada skin** (`POWER_TYPES` em `src/skins.js`): 15 passivos (Ímã, Sortudo, Faro de Tesouro, Explorador, Caminhante, Pechincheiro, Mergulho Longo, Caçador de Portais, Sangue-Frio, Pés Firmes, Reflexo, Ligeiro, Cofrinho, Largada Segura, Campeão) e 11 ativos no botão **PODER** (Teleporte, Voo, Parar o Tempo, Escudo, Turbo, Ímã Poderoso, Andar na Água, Fôlego, Chuva de Moedas, Investida, Câmera Lenta). Cada skin tem uma variação de números que nenhuma outra tem; o tipo combina com o nome da skin. Nos ativos, a espera é proporcional à força. Botão: na tela (celular), E ou Shift (PC), X ou Y (controle). Não funcionam dentro das dimensões bônus. Nenhum poder dá vida extra: voltar depois de morrer só pelo Reviver, pagando moedas.
- **Teleporte, Voo e Investida:** 1º toque mostra onde o Jerry vai parar (4 s); 2º toque vai. O destino é sempre um lugar seguro (grama livre, tronco embaixo na chegada, estrada/slime/trilho sem nada chegando); sem lugar seguro, o poder não é gasto. Andar na Água: se acabar em cima da água, ele volta para a margem.
- **Chave "Todas as skins":** criada no Admin (Chaves de resgate → Para que serve: Todas as skins) e usada na aba **Chaves** do site com a conta. O jogo confere em `/api/jerry?op=ent` e libera todas as skins do Jerry's Way, inclusive as míticas.
- **Depois da fileira 1000 (sem aviso):** tentáculos pretos sobem pela borda de baixo e perseguem o Jerry (a tela sobe 15% mais rápido); se alcançarem, acabou, e não dá para reviver. Aparecem 3,2 vezes mais moedas que no caminho normal (`HARD_ROW` e `HARD_COINS` em `src/world.js`). A tela treme de leve e toca uma playlist de 5 músicas tensas (`HARD_SONGS` em `src/music.js`). Ao entrar nessa fase, o jogo sorteia de novo o esquilo mítico com 3x a chance (`MYTH_HARD_BOOST`), mantendo no máximo uma mítica por partida.

## Loja (no site)

- **Multiplicador de moedas (R$ 7,90):** as moedas de cada partida valem o dobro (`coinMult` em `src/store.js`).
- **150 moedas (R$ 12,00):** pode comprar várias vezes; o servidor guarda e o jogo busca em `/api/jerry` (`claimCoins`), uma vez só.
- **Pacote Lua Cheia (R$ 47,90):** Song of Moonlight + 500 moedas + Multiplicador.
- **Todas as skins (R$ 239,90):** também por chave.
- No jogo: botão **Loja** no menu, aviso no fim da partida ("com o Multiplicador você levaria +X") e no Sortear skin quando faltam moedas; a compra abre o site em `#/comprar/<item>`.
