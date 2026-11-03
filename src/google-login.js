// O Android guarda o resultado até o Firebase confirmar a conta dentro da WebView.
const androidLogin = () => {
  const cap = window.Capacitor;
  return cap?.getPlatform?.() === 'android'
    ? cap.Plugins?.GoogleLogin || cap.registerPlugin?.('GoogleLogin') : null;
};
const unavailable = () => new Error('Atualize o aplicativo para usar o login com o Google.');

// Um retorno da ponte também pode se perder durante a pausa da WebView.
// Consultas curtas têm prazo e podem ser repetidas sem consumir a credencial.
function nativeReply(operation) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Object.assign(new Error('O Android não respondeu. Tente novamente.'), { code: 'native/reply-timeout' })), 2500);
    Promise.resolve().then(operation).then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
  });
}

export async function pendingGoogleLogin() {
  const login = androidLogin();
  if (!login?.getResult) return null;
  const result = await nativeReply(() => login.getResult());
  return result.status === 'pending' || result.status === 'complete' ? result : null;
}

async function waitForResult(login, state) {
  const deadline = Date.now() + 305000;
  while (Date.now() < deadline) {
    // Cada consulta é uma chamada nova: o retorno não depende do callback que abriu o Chrome.
    if (typeof document !== 'undefined' && document.hidden) {
      await new Promise(resolve => setTimeout(resolve, 400)); continue;
    }
    let result;
    try { result = await nativeReply(() => login.getResult()); }
    catch (error) { if (error.code === 'native/reply-timeout') continue; throw error; }
    if (result.state !== state || result.status === 'idle') throw new Error('Este login expirou. Toque no Google para tentar novamente.');
    if (result.status === 'error') throw new Error(result.error || 'Não foi possível entrar com o Google.');
    if (result.status === 'complete') return result;
    await new Promise(resolve => setTimeout(resolve, 400));
  }
  throw new Error('O tempo do login acabou. Toque no Google para tentar novamente.');
}

export function nativeGoogleLogin(config, pending = null) {
  if (window.desktop?.googleLogin) return () => window.desktop.googleLogin(config);
  if (window.Capacitor?.getPlatform?.() !== 'android') return null;
  const login = androidLogin();
  if (!login?.begin || !login?.getResult) return () => Promise.reject(unavailable());
  return async () => {
    let session = pending;
    if (!session) {
      try { session = await nativeReply(() => login.begin({ config })); }
      catch (error) {
        if (error.code !== 'native/reply-timeout') throw error;
        session = await pendingGoogleLogin();
        if (!session) throw error;
      }
    }
    return waitForResult(login, session.state);
  };
}

// Só apaga as credenciais temporárias DEPOIS do signInWithCredential confirmado.
export async function acknowledgeGoogleLogin(state) {
  if (state) await nativeReply(() => androidLogin()?.acknowledge({ state }));
}
export const isNativeGoogleLogin = () => !!window.desktop?.googleLogin || window.Capacitor?.getPlatform?.() === 'android';
