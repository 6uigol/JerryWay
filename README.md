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
