import { BrowserWindow, BrowserView, session } from 'electron';
import { storage } from './store';
import { AuthSession } from '../types';

function extractCleanUserInfo(payload: any): { name?: string; email?: string } {
  const email = (payload.email || payload.upn || payload.unique_name || '').trim();

  let candidateName = '';
  if (payload.name && typeof payload.name === 'string') {
    candidateName = payload.name.trim();
  } else if (payload.given_name) {
    candidateName = payload.family_name
      ? `${payload.given_name} ${payload.family_name}`.trim()
      : payload.given_name.trim();
  }

  // Evita duplicações como "felipe.feitosa felipe.feitosa"
  if (candidateName) {
    const parts = candidateName.split(/\s+/);
    if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) {
      candidateName = parts[0];
    }
  }

  if (!candidateName && payload.preferred_username) {
    candidateName = payload.preferred_username.trim();
  }

  if (!candidateName) {
    candidateName = email ? email.split('@')[0] : payload.sub || '';
  }

  return {
    name: candidateName,
    email: email || undefined,
  };
}

export class AuthManager {
  private loginWindow: BrowserWindow | null = null;
  private authView: BrowserView | null = null;
  private parentWindow: BrowserWindow | null = null;
  private silentRefreshWindow: BrowserWindow | null = null;
  private onAuthCallback: ((session: AuthSession) => void) | null = null;
  private isRefreshing = false;

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    const ses = session.defaultSession;

    // 1. Escuta requisições de rede para capturar o Bearer token do People Zup e Zenity Dune
    ses.webRequest.onSendHeaders({ urls: ['https://*/*', 'http://*/*'] }, (details) => {
      const url = details.url.toLowerCase();
      if (!url.includes('zup.com.br') && !url.includes('zenity.zup.com.br')) return;

      const authHeader =
        details.requestHeaders['Authorization'] ||
        details.requestHeaders['authorization'] ||
        details.requestHeaders['AUTHORIZATION'];

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        if (token && token.length > 20) {
          this.handleTokenCaptured(token, details.requestHeaders);
        }
      }
    });

    // 2. Intercepta chamadas POST ao endpoint de token do Keycloak para capturar refresh_token do payload
    ses.webRequest.onBeforeRequest(
      { urls: ['https://keycloak-zenity.zup.com.br/*openid-connect/token*'] },
      (details) => {
        if (details.method === 'POST' && details.uploadData) {
          for (const upload of details.uploadData) {
            if (upload.bytes) {
              try {
                const bodyStr = upload.bytes.toString('utf-8');
                const params = new URLSearchParams(bodyStr);
                const rt = params.get('refresh_token');
                if (rt && rt.length > 20) {
                  console.log('Refresh token interceptado no payload da requisição POST /token!');
                  storage.updateSession({ refreshToken: rt });
                }
              } catch (e) {
                console.error('Erro ao ler uploadData do token endpoint:', e);
              }
            }
          }
        }
      }
    );
  }

  private async getCombinedCookieHeader(): Promise<string> {
    const ses = session.defaultSession;
    const currentSession = storage.getSession();
    const cookieMap: Record<string, string> = { ...(currentSession.cookies || {}) };

    try {
      const [keycloakCookies, zupCookies] = await Promise.all([
        ses.cookies.get({ domain: 'keycloak-zenity.zup.com.br' }).catch(() => []),
        ses.cookies.get({ domain: 'zup.com.br' }).catch(() => []),
      ]);

      for (const c of [...keycloakCookies, ...zupCookies]) {
        cookieMap[c.name] = c.value;
      }

      // Persistir cookies atualizados na sessão
      storage.updateSession({ cookies: cookieMap });
    } catch (e) {
      console.warn('Erro ao consultar cookies da sessão Electron:', e);
    }

    return Object.entries(cookieMap)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }

  private buildAuthUrl(): string {
    const state = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const redirectUri = encodeURIComponent('https://people.zup.com.br/career/logbook');
    return `https://keycloak-zenity.zup.com.br/auth/realms/zupinternal/protocol/openid-connect/auth?client_id=realwave_zupper_csp_ui&redirect_uri=${redirectUri}&response_mode=fragment&response_type=code%20id_token%20token&scope=openid&state=${state}&nonce=${nonce}`;
  }

  /**
   * Abre a tela de autenticação na MESMA JANELA (embutida) via BrowserView
   */
  public openLogin(parentWindow?: BrowserWindow, callback?: (session: AuthSession) => void) {
    if (callback) {
      this.onAuthCallback = callback;
    }

    if (parentWindow && !parentWindow.isDestroyed()) {
      this.parentWindow = parentWindow;
      this.openInSameWindow(parentWindow);
    } else {
      this.openSeparateWindow();
    }
  }

  private openInSameWindow(mainWindow: BrowserWindow) {
    // Se já estiver aberta, não recriar
    if (this.authView) {
      return;
    }

    const targetUrl = this.buildAuthUrl();
    console.log('Abrindo tela de autenticação na MESMA JANELA via BrowserView:', targetUrl);

    this.authView = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
    });

    mainWindow.setBrowserView(this.authView);

    // Ajusta o tamanho da BrowserView para ocupar todo o espaço abaixo do Header (64px)
    const bounds = mainWindow.getContentBounds();
    this.authView.setBounds({
      x: 0,
      y: 64, // Começa abaixo do Header de 64px
      width: bounds.width,
      height: Math.max(bounds.height - 64, 400),
    });
    this.authView.setAutoResize({ width: true, height: true });

    const handleUrlCheck = (navUrl: string) => {
      console.log('Navegação no login embutido:', navUrl);
      if (navUrl && (navUrl.includes('access_token=') || navUrl.includes('id_token=') || navUrl.includes('code='))) {
        try {
          const hashPart = navUrl.split('#')[1] || navUrl.split('?')[1] || '';
          const params = new URLSearchParams(hashPart);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const code = params.get('code');

          if (accessToken && accessToken.length > 20) {
            console.log('Token capturado com sucesso da URL fragment no login embutido!');
            this.handleTokenCaptured(accessToken, undefined, refreshToken || undefined);
          }

          if (code) {
            console.log('Authorization code detectado, trocando por tokens no Keycloak...');
            this.exchangeCodeForTokens(code, 'https://people.zup.com.br/career/logbook').catch((e) => {
              console.warn('Troca de authorization code falhou ou já processada:', e.message);
            });
          }
        } catch (e) {
          console.error('Erro ao extrair token da URL:', e);
        }
      }
    };

    this.authView.webContents.on('did-navigate', (_e, url) => handleUrlCheck(url));
    this.authView.webContents.on('did-navigate-in-page', (_e, url) => handleUrlCheck(url));
    this.authView.webContents.on('will-redirect', (_e, url) => handleUrlCheck(url));

    this.authView.webContents.loadURL(targetUrl);
  }

  private openSeparateWindow() {
    if (this.loginWindow && !this.loginWindow.isDestroyed()) {
      this.loginWindow.focus();
      return;
    }

    const targetUrl = this.buildAuthUrl();
    console.log('Abrindo tela de autenticação em janela separada:', targetUrl);

    this.loginWindow = new BrowserWindow({
      width: 1080,
      height: 780,
      title: 'Autenticação People Zup (Keycloak & 2FA)',
      modal: false,
      autoHideMenuBar: true,
      show: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
    });

    const handleUrlCheck = (navUrl: string) => {
      if (navUrl && (navUrl.includes('access_token=') || navUrl.includes('id_token=') || navUrl.includes('code='))) {
        try {
          const hashPart = navUrl.split('#')[1] || navUrl.split('?')[1] || '';
          const params = new URLSearchParams(hashPart);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const code = params.get('code');

          if (accessToken && accessToken.length > 20) {
            console.log('Token extraído da URL na janela de login!');
            this.handleTokenCaptured(accessToken, undefined, refreshToken || undefined);
          }

          if (code) {
            console.log('Authorization code detectado na janela separada, trocando por tokens no Keycloak...');
            this.exchangeCodeForTokens(code, 'https://people.zup.com.br/career/logbook').catch((e) => {
              console.warn('Troca de authorization code falhou ou já processada:', e.message);
            });
          }
        } catch (e) {
          console.error('Erro ao extrair token da URL:', e);
        }
      }
    };

    this.loginWindow.webContents.on('did-navigate', (_e, url) => handleUrlCheck(url));
    this.loginWindow.webContents.on('did-navigate-in-page', (_e, url) => handleUrlCheck(url));
    this.loginWindow.webContents.on('will-redirect', (_e, url) => handleUrlCheck(url));

    this.loginWindow.loadURL(targetUrl);
    this.loginWindow.show();
    this.loginWindow.focus();
  }

  /**
   * Fecha imediatamente qualquer view embutida ou janela de login aberta
   */
  public closeLoginView() {
    console.log('Fechando tela de autenticação...');
    if (this.authView) {
      try {
        if (this.parentWindow && !this.parentWindow.isDestroyed()) {
          this.parentWindow.removeBrowserView(this.authView);
        }
        (this.authView.webContents as any)?.close?.();
      } catch (e) {
        console.error('Erro ao remover BrowserView:', e);
      }
      this.authView = null;
    }

    if (this.loginWindow && !this.loginWindow.isDestroyed()) {
      try {
        this.loginWindow.destroy();
      } catch (e) {
        console.error('Erro ao fechar loginWindow:', e);
      }
      this.loginWindow = null;
    }

    // Fecha qualquer janela secundária aberta (ex: se abriu via popup ou window.open)
    BrowserWindow.getAllWindows().forEach((win) => {
      if (this.parentWindow && win !== this.parentWindow && !win.isDestroyed()) {
        try {
          win.destroy();
        } catch (e) {}
      }
    });
  }

  /**
   * Executa a troca de authorization_code recebido no callback por access_token e refresh_token
   */
  public async exchangeCodeForTokens(code: string, redirectUri: string): Promise<boolean> {
    try {
      console.log('Trocando authorization_code por tokens no Keycloak...');
      const endpoint = 'https://keycloak-zenity.zup.com.br/auth/realms/zupinternal/protocol/openid-connect/token';
      const cookieHeader = await this.getCombinedCookieHeader();
      const settings = storage.getSettings();
      const userAgent =
        settings.capturedHeaders?.['user-agent'] ||
        'Mozilla/5.0 (X11; Linux x86_64; rv:156.0) Gecko/20100101 Firefox/156.0';

      const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: '*/*',
        Origin: 'https://people.zup.com.br',
        Referer: 'https://people.zup.com.br/',
        'User-Agent': userAgent,
      };
      if (cookieHeader) headers['Cookie'] = cookieHeader;

      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: 'realwave_zupper_csp_ui',
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: body.toString(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          console.log('Troca de código concluída com sucesso! Tokens e refresh_token obtidos.');
          await this.handleTokenCaptured(
            data.access_token,
            undefined,
            data.refresh_token,
            data.expires_in,
            data.refresh_expires_in
          );
          return true;
        }
      } else {
        console.warn(`Resposta da troca de authorization code (${response.status}):`, await response.text());
      }
    } catch (e: any) {
      console.error('Erro na troca de authorization code:', e.message);
    }
    return false;
  }

  /**
   * Executa a renovação oficial via Keycloak OpenID Connect token endpoint,
   * replicando a requisição disparada pelo portal People Zup ao receber erro de token expirado.
   */
  public async refreshAccessToken(): Promise<boolean> {
    if (this.isRefreshing) {
      console.log('Renovação de token já em andamento, aguardando término...');
      for (let i = 0; i < 20; i++) {
        await new Promise((r) => setTimeout(r, 200));
        if (!this.isRefreshing) {
          const s = storage.getSession();
          return !!s.token && !s.isExpired;
        }
      }
      return false;
    }

    const currentSession = storage.getSession();
    const refreshToken = currentSession.refreshToken;

    if (!refreshToken) {
      console.warn('Tentativa de renovação, mas nenhum refresh_token está disponível.');
      return false;
    }

    this.isRefreshing = true;
    console.log('Executando renovação de token no Keycloak via refresh_token...');

    try {
      const endpoint = 'https://keycloak-zenity.zup.com.br/auth/realms/zupinternal/protocol/openid-connect/token';
      const cookieHeader = await this.getCombinedCookieHeader();
      const settings = storage.getSettings();
      const userAgent =
        settings.capturedHeaders?.['user-agent'] ||
        'Mozilla/5.0 (X11; Linux x86_64; rv:156.0) Gecko/20100101 Firefox/156.0';

      const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: '*/*',
        Origin: 'https://people.zup.com.br',
        Referer: 'https://people.zup.com.br/',
        'User-Agent': userAgent,
      };

      if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
      }

      // Requisição idêntica à do portal People Zup:
      // grant_type=refresh_token&refresh_token=[TOKEN]
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });

      console.log(`Disparando POST para ${endpoint}...`);
      let response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: body.toString(),
      });

      let responseText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { text: responseText };
      }

      // Se der erro de client_id exigido, tenta com client_id
      if (!response.ok && (data.error === 'invalid_client' || data.error_description?.includes('client'))) {
        console.log('Keycloak indicou necessidade de client_id. Repetindo com realwave_zupper_csp_ui...');
        body.set('client_id', 'realwave_zupper_csp_ui');
        response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: body.toString(),
        });
        responseText = await response.text();
        try {
          data = JSON.parse(responseText);
        } catch {
          data = { text: responseText };
        }
      }

      if (response.ok && data.access_token) {
        console.log('Token JWT renovado com sucesso pelo Keycloak via refresh_token!');
        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token || refreshToken;

        let expiresAt: string | null = null;
        let refreshExpiresAt: string | null = null;

        if (data.expires_in) {
          expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
        }
        if (data.refresh_expires_in) {
          refreshExpiresAt = new Date(Date.now() + data.refresh_expires_in * 1000).toISOString();
        }

        let userInfo = currentSession.user;
        try {
          const parts = newAccessToken.split('.');
          if (parts.length === 3) {
            const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
            const payload = JSON.parse(payloadJson);
            userInfo = extractCleanUserInfo(payload);
            if (!expiresAt && payload.exp) {
              expiresAt = new Date(payload.exp * 1000).toISOString();
            }
          }
        } catch (e) {}

        const updatedSession = storage.updateSession({
          token: newAccessToken,
          refreshToken: newRefreshToken,
          user: userInfo,
          lastLogin: new Date().toISOString(),
          expiresAt,
          refreshExpiresAt,
          isExpired: false,
        });

        if (this.onAuthCallback) {
          this.onAuthCallback(updatedSession);
        }

        return true;
      } else {
        console.warn(`Falha na renovação via Keycloak (${response.status}):`, data);
        return false;
      }
    } catch (err: any) {
      console.error('Erro na requisição de refresh token:', err.message);
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  public async refreshTokenSilently(parentWindow?: BrowserWindow): Promise<boolean> {
    // 1. Tenta a renovação oficial via Keycloak Refresh Token
    if (storage.getSession().refreshToken) {
      const success = await this.refreshAccessToken();
      if (success) {
        return true;
      }
    }

    if (this.isRefreshing) return false;
    this.isRefreshing = true;

    console.log('Tentando renovação silenciosa de token via sessão em background (fallback)...');

    return new Promise((resolve) => {
      let resolved = false;

      const finish = (success: boolean) => {
        if (!resolved) {
          resolved = true;
          this.isRefreshing = false;
          if (this.silentRefreshWindow && !this.silentRefreshWindow.isDestroyed()) {
            this.silentRefreshWindow.destroy();
            this.silentRefreshWindow = null;
          }
          resolve(success);
        }
      };

      const timeoutTimer = setTimeout(() => {
        console.log('Renovação silenciosa excedeu o tempo limite.');
        finish(false);
      }, 7000);

      this.silentRefreshWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
        },
      });

      const oldToken = storage.getSession().token;

      const checkTokenUpdated = setInterval(() => {
        const currentToken = storage.getSession().token;
        if (currentToken && currentToken !== oldToken) {
          clearInterval(checkTokenUpdated);
          clearTimeout(timeoutTimer);
          console.log('Token JWT renovado silenciosamente com sucesso!');
          finish(true);
        }
      }, 500);

      const targetUrl = 'https://people.zup.com.br/career/logbook';
      this.silentRefreshWindow.loadURL(targetUrl).catch(() => {
        clearInterval(checkTokenUpdated);
        clearTimeout(timeoutTimer);
        finish(false);
      });
    });
  }

  private async handleTokenCaptured(
    token: string,
    headers?: Record<string, string>,
    refreshToken?: string,
    expiresInSec?: number,
    refreshExpiresInSec?: number
  ) {
    console.log('JWT capturado! Fechando tela de login...');

    // FECHA A TELA DE LOGIN IMEDIATAMENTE (sumir da tela)
    this.closeLoginView();

    const ses = session.defaultSession;
    const [zupCookies, keycloakCookies] = await Promise.all([
      ses.cookies.get({ domain: 'zup.com.br' }).catch(() => []),
      ses.cookies.get({ domain: 'keycloak-zenity.zup.com.br' }).catch(() => []),
    ]);

    const cookiesRecord: Record<string, string> = { ...(storage.getSession().cookies || {}) };
    for (const c of [...zupCookies, ...keycloakCookies]) {
      cookiesRecord[c.name] = c.value;
    }

    let userInfo: { name?: string; email?: string } | null = null;
    let expiresAt: string | null = null;
    let refreshExpiresAt: string | null = null;

    if (expiresInSec) {
      expiresAt = new Date(Date.now() + expiresInSec * 1000).toISOString();
    }
    if (refreshExpiresInSec) {
      refreshExpiresAt = new Date(Date.now() + refreshExpiresInSec * 1000).toISOString();
    }

    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        userInfo = extractCleanUserInfo(payload);

        if (!expiresAt && payload.exp) {
          expiresAt = new Date(payload.exp * 1000).toISOString();
        }
      }
    } catch (err) {
      console.warn('Não foi possível decodificar exp do JWT:', err);
    }

    const currentSession = storage.updateSession({
      token,
      ...(refreshToken ? { refreshToken } : {}),
      cookies: cookiesRecord,
      user: userInfo,
      lastLogin: new Date().toISOString(),
      expiresAt,
      ...(refreshExpiresAt ? { refreshExpiresAt } : {}),
      isExpired: false,
    });

    if (headers) {
      storage.updateSettings({
        capturedHeaders: {
          'user-agent': headers['user-agent'] || '',
          origin: 'https://people.zup.com.br',
          referer: 'https://people.zup.com.br/',
        },
      });
    }

    if (this.onAuthCallback) {
      this.onAuthCallback(currentSession);
    }
  }

  public setManualToken(token: string, refreshToken?: string): AuthSession {
    let userInfo: { name?: string; email?: string } | null = null;
    let expiresAt: string | null = null;

    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        userInfo = extractCleanUserInfo(payload);
        if (payload.exp) {
          expiresAt = new Date(payload.exp * 1000).toISOString();
        }
      }
    } catch (err) {}

    return storage.updateSession({
      token,
      ...(refreshToken !== undefined ? { refreshToken } : {}),
      user: userInfo,
      lastLogin: new Date().toISOString(),
      expiresAt,
      isExpired: false,
    });
  }

  public async logout(): Promise<void> {
    this.closeLoginView();
    storage.clearSession();
    const ses = session.defaultSession;
    await ses.clearStorageData({
      storages: ['cookies', 'localstorage'],
    }).catch(() => {});
  }
}

export let authManager: AuthManager;

export function initAuthManager() {
  if (!authManager) {
    authManager = new AuthManager();
  }
  return authManager;
}
