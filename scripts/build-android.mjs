import { cpSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { prepareAndroidWeb, projectRoot } from './prepare-android-web.mjs';

const windows = process.platform === 'win32';
const env = { ...process.env };
const candidates = windows
  ? [env.LOCALAPPDATA && join(env.LOCALAPPDATA, 'Android/Sdk')]
  : process.platform === 'darwin'
    ? [env.HOME && join(env.HOME, 'Library/Android/sdk')]
    : [env.HOME && join(env.HOME, 'Android/Sdk')];

if (!env.ANDROID_HOME && !env.ANDROID_SDK_ROOT) {
  const sdk = candidates.find(path => path && existsSync(join(path, 'platforms')));
  if (!sdk) {
    console.error('Instale e abra o Android Studio uma vez para instalar o SDK Android.');
    console.error('Depois execute Gerar-apk.bat novamente. Guia: ANDROID.md');
    process.exit(1);
  }
  env.ANDROID_HOME = sdk;
}

if (!env.JAVA_HOME) {
  const studios = windows
    ? [env.ProgramFiles && join(env.ProgramFiles, 'Android/Android Studio/jbr')]
    : process.platform === 'darwin'
      ? ['/Applications/Android Studio.app/Contents/jbr/Contents/Home']
      : ['/opt/android-studio/jbr'];
  const javaHome = studios.find(path => path && existsSync(join(path, windows ? 'bin/javac.exe' : 'bin/javac')));
  if (javaHome) env.JAVA_HOME = javaHome;
}

function run(command, args, cwd = projectRoot) {
  const result = spawnSync(command, args, { cwd, env, stdio: 'inherit' });
  if (result.error || result.status !== 0) {
    if (result.error) console.error(result.error.message);
    console.error('Nao foi possivel concluir o APK. Veja a mensagem acima.');
    process.exit(result.status || 1);
  }
}

prepareAndroidWeb();
run(process.execPath, [join(projectRoot, 'node_modules/@capacitor/cli/bin/capacitor'), 'sync', 'android']);
const android = join(projectRoot, 'android');
if (windows) {
  run(env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'gradlew.bat --no-daemon assembleDebug'], android);
} else {
  run('./gradlew', ['--no-daemon', 'assembleDebug'], android);
}

const version = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8')).version;
const output = join(projectRoot, 'dist', `Jerry-Way-${version}.apk`);
mkdirSync(join(projectRoot, 'dist'), { recursive: true });
cpSync(join(android, 'app/build/outputs/apk/debug/app-debug.apk'), output);
console.log(`\nAPK pronto: ${output}`);
