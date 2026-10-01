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

    // Escuta requisições de rede para capturar o Bearer token do People Zup e Zenity Dune
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
      if (navUrl && (navUrl.includes('access_token=') || navUrl.includes('id_token='))) {
        try {
          const hashPart = navUrl.split('#')[1] || navUrl.split('?')[1] || '';
          const params = new URLSearchParams(hashPart);
          const accessToken = params.get('access_token');
          if (accessToken && accessToken.length > 20) {
            console.log('Token capturado com sucesso da URL fragment no login embutido!');
            this.handleTokenCaptured(accessToken);
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
      if (navUrl && (navUrl.includes('access_token=') || navUrl.includes('id_token='))) {
        try {
          const hashPart = navUrl.split('#')[1] || navUrl.split('?')[1] || '';
          const params = new URLSearchParams(hashPart);
          const accessToken = params.get('access_token');
          if (accessToken && accessToken.length > 20) {
            console.log('Token extraído da URL na janela de login!');
            this.handleTokenCaptured(accessToken);
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

  public async refreshTokenSilently(parentWindow?: BrowserWindow): Promise<boolean> {
    if (this.isRefreshing) return false;
    this.isRefreshing = true;

    console.log('Tentando renovação silenciosa de token via sessão em background...');

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

  private async handleTokenCaptured(token: string, headers?: Record<string, string>) {
    console.log('JWT capturado pelo interceptador! Fechando tela de login...');

    // FECHA A TELA DE LOGIN IMEDIATAMENTE (sumir da tela)
    this.closeLoginView();

    const ses = session.defaultSession;
    const cookiesList = await ses.cookies.get({ domain: 'zup.com.br' }).catch(() => []);
    const cookiesRecord: Record<string, string> = {};
    for (const c of cookiesList) {
      cookiesRecord[c.name] = c.value;
    }

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
    } catch (err) {
      console.warn('Não foi possível decodificar exp do JWT:', err);
    }

    const currentSession = storage.updateSession({
      token,
      cookies: cookiesRecord,
      user: userInfo,
      lastLogin: new Date().toISOString(),
      expiresAt,
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

  public setManualToken(token: string): AuthSession {
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
      user: userInfo,
      lastLogin: new Date().toISOString(),
      expiresAt,
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
