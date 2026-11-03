import { init, googleTokens } from '/vendor/cloud.bundle.js';

const message = document.getElementById('message');
const button = document.getElementById('google');
const back = document.getElementById('return');
const state = new URL(location.href).searchParams.get('s');

try {
  if (!state || !/^[a-f0-9]{64}$/.test(state)) throw new Error('Abra o login pelo botão do jogo.');
  const response = await fetch('/session?s=' + state, { cache: 'no-store' });
  if (!response.ok) throw new Error('Este acesso expirou. Volte ao jogo e tente novamente.');
  const session = await response.json();
  init(session.config);
  back.href = session.returnUrl;
  message.textContent = 'Entre com a sua conta Google. Ao terminar, volte ao jogo.';
  button.disabled = false;
  button.onclick = async () => {
    button.disabled = true;
    message.textContent = 'Conclua o acesso na janela do Google…';
    try {
      // Chamado diretamente pelo clique, preservando a permissão de abrir a janela.
      const tokens = await googleTokens();
      if (!tokens?.idToken && !tokens?.accessToken) throw new Error('O Google não retornou o acesso. Tente novamente.');
      const result = await fetch('/done', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ state, idToken: tokens.idToken, accessToken: tokens.accessToken }),
      });
      if (!result.ok) throw new Error('Não foi possível devolver o acesso ao jogo. Volte e tente novamente.');
      button.hidden = true;
      back.hidden = false;
      message.textContent = 'Google autorizado. Volte ao jogo para confirmar a conta e concluir o acesso.';
    } catch (error) {
      button.disabled = false;
      const code = error?.code;
      message.textContent = code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request'
        ? 'A janela do Google foi fechada. Você pode tentar novamente.'
        : code === 'auth/popup-blocked'
          ? 'Permita a janela do Google neste navegador e toque no botão novamente.'
          : code === 'auth/unauthorized-domain'
            ? 'Não foi possível autorizar este endereço. Volte ao jogo e tente novamente.'
            : error?.message || 'Não foi possível entrar. Tente novamente.';
    }
  };
} catch (error) {
  message.textContent = error?.message || 'Não foi possível abrir o login. Volte ao jogo e tente novamente.';
}
