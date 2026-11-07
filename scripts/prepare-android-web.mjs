import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
// copia só os arquivos do jogo para a pasta que vai dentro do APK
export function prepareAndroidWeb() {
  const destination = join(projectRoot, 'android-web');
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(destination, { recursive: true });
  for (const entry of ['index.html', 'style.css', 'src', 'fonts', 'icons']) cpSync(join(projectRoot, entry), join(destination, entry), { recursive: true });
  if (existsSync(join(projectRoot, 'android/app/src/main'))) cpSync(join(projectRoot, 'icons/icon-512.png'), join(projectRoot, 'android/app/src/main/res/drawable/richard_icon.png'));
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) { prepareAndroidWeb(); console.log('Arquivos Android preparados.'); }
