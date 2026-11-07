# Richard Is Bored

Sozinho na Torre das Treze Vozes, o Richard enlouquece de tédio e começa a ter **visões**: cada visão é um personagem
do universo Song of Moonlight (ou algo bem mais estranho) com seus minijogos de poucos segundos. Errou 3 vezes, acabou.

- 32 visões; a 1ª tem 7 minijogos, a 2ª tem 8, a 3ª tem 9... e cada uma termina num minijogo **chefe**.
- A cada 4 acertos, tudo fica mais rápido.
- Cenários alternam entre sala da torre (de lado), chão visto de cima e sonho.
- Configurações: música, efeitos e idioma (pt-BR, pt-PT, inglês, japonês, espanhol, francês e chinês).
- Termos, privacidade e compras: no site songofmoonlight.online.

## Rodar e gerar versões

- `npm start` — abre no PC (Electron)
- `npm run build` — gera o instalador do Windows (.exe) e o AppImage do Linux em `dist/`
- APK do Android: gerado pelo GitHub Actions a cada push no `main` (Release `android-latest` e branch `apk-latest`)
- `npm run icons` — refaz os ícones a partir do desenho do jogo
