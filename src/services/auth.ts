import { AuthSession } from '../types';
import { storage } from './storage';

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    }
  } catch (e) {
    console.warn('Erro ao decodificar JWT:', e);
  }
  return null;
}

function extractCleanUserInfo(payload: any): { name?: string; email?: string } {
  if (!payload) return {};
  const email = (payload.email || payload.upn || payload.unique_name || '').trim();

  let candidateName = '';
  if (payload.name && typeof payload.name === 'string') {
    candidateName = payload.name.trim();
  } else if (payload.given_name) {
    candidateName = payload.family_name
      ? `${payload.given_name} ${payload.family_name}`.trim()
      : payload.given_name.trim();
  }

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

function extractAllJwtsFromString(raw: string): string[] {
  if (!raw || typeof raw !== 'string') return [];
  const matches = raw.match(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g);
  return matches || [];
}

export class AuthService {
  private listeners: ((session: AuthSession) => void)[] = [];
  private isRefreshing = false;

  constructor() {
    this.setupNetworkInterceptors();
    this.detectSessionFromPage();
  }

  /**
   * Monitora requisições de rede feitas pela própria página do People Zup
   * para capturar automaticamente qualquer Bearer token enviado aos servidores Zup
   */
  private setupNetworkInterceptors() {
    try {
      const self = this;

      // 1. Interceptador de window.fetch
      const originalFetch = window.fetch;
      window.fetch = async function (...args) {
        try {
          const input = args[0];
          const init = args[1];

          let authHeader: string | null = null;
          if (init && init.headers) {
            if (init.headers instanceof Headers) {
              authHeader = init.headers.get('Authorization') || init.headers.get('authorization');
            } else if (Array.isArray(init.headers)) {
              const found = init.headers.find(([k]) => k.toLowerCase() === 'authorization');
              if (found) authHeader = found[1];
            } else if (typeof init.headers === 'object') {
              authHeader =
                (init.headers as any)['Authorization'] ||
                (init.headers as any)['authorization'] ||
                (init.headers as any)['AUTHORIZATION'];
            }
          }

          if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
            const token = authHeader.replace(/^bearer\s+/i, '').trim();
            if (token && token.length > 20) {
              self.handleDiscoveredToken(token);
            }
          }

          // Se a requisição for para o endpoint de token do Keycloak, captura o refresh token
          const url = typeof input === 'string' ? input : (input as any)?.url || '';
          if (url.includes('protocol/openid-connect/token') && init?.body) {
            const bodyStr = typeof init.body === 'string' ? init.body : '';
            const params = new URLSearchParams(bodyStr);
            const rt = params.get('refresh_token');
            if (rt) {
              storage.updateSession({ refreshToken: rt });
            }
          }
        } catch (e) {}

        return originalFetch.apply(this, args);
      };

      // 2. Interceptador de XMLHttpRequest
      const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
      XMLHttpRequest.prototype.setRequestHeader = function (header: string, value: string) {
        try {
          if (header && header.toLowerCase() === 'authorization' && value && value.toLowerCase().startsWith('bearer ')) {
            const token = value.replace(/^bearer\s+/i, '').trim();
            if (token && token.length > 20) {
              self.handleDiscoveredToken(token);
            }
          }
        } catch (e) {}
        return originalSetRequestHeader.apply(this, [header, value]);
      };
    } catch (e) {
      console.warn('Erro ao configurar interceptadores de rede no Bookmarklet:', e);
    }
  }

  private handleDiscoveredToken(token: string, refreshToken?: string) {
    const current = storage.getSession();
    if (current.token === token && !current.isExpired) {
      return;
    }
    console.log('Novo token interceptado na página do People Zup!');
    this.setManualToken(token, refreshToken);
  }

  /**
   * Varredura profunda na página: sessionStorage, localStorage, cookies e variáveis globais
   */
  public detectSessionFromPage(forceRefresh = false): AuthSession {
    const current = storage.getSession();
    if (!forceRefresh && current.token && !current.isExpired) {
      return current;
    }

    try {
      const candidates: { token: string; payload: any; exp: number; typ: string }[] = [];

      // Helper para analisar e registrar tokens encontrados
      const processStringForTokens = (str: string) => {
        const jwts = extractAllJwtsFromString(str);
        for (const jwt of jwts) {
          const payload = decodeJwtPayload(jwt);
          if (payload) {
            candidates.push({
              token: jwt,
              payload,
              exp: payload.exp ? payload.exp * 1000 : Infinity,
              typ: payload.typ || '',
            });
          }
        }
      };

      // 1. Varre sessionStorage por inteiro (valores e JSONs aninhados)
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          const val = sessionStorage.getItem(key);
          if (val) processStringForTokens(val);
        }
      }

      // 2. Varre localStorage por inteiro
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith('zup_logbook')) {
          const val = localStorage.getItem(key);
          if (val) processStringForTokens(val);
        }
      }

      // 3. Varre document.cookie
      processStringForTokens(document.cookie);

      // 4. Varre propriedades do objeto window
      const win = window as any;
      if (win.keycloak?.token) {
        processStringForTokens(win.keycloak.token);
      }
      if (win.keycloak?.refreshToken) {
        processStringForTokens(win.keycloak.refreshToken);
      }
      for (const k of ['keycloak', '_keycloak', 'kc', 'auth', 'currentUser', '__PRELOADED_STATE__']) {
        try {
          if (win[k]) {
            processStringForTokens(typeof win[k] === 'string' ? win[k] : JSON.stringify(win[k]));
          }
        } catch {}
      }

      if (candidates.length > 0) {
        const now = Date.now();
        // Filtra tokens não expirados (com margem de 10s)
        const validTokens = candidates.filter((c) => c.exp > now + 10000);

        // Identifica refresh token (typ: 'Refresh')
        const refreshCandidate = candidates.find(
          (c) => c.typ.toLowerCase() === 'refresh' || c.payload?.type?.toLowerCase() === 'refresh'
        );

        // Identifica access token (typ: 'Bearer' ou tokens válidos com permissões)
        const accessCandidate =
          validTokens.find((c) => c.typ.toLowerCase() === 'bearer') ||
          validTokens.find((c) => c !== refreshCandidate && c.payload?.email) ||
          validTokens[0] ||
          candidates[0];

        if (accessCandidate) {
          console.log('Sessão encontrada com sucesso na varredura profunda do People Zup!');
          return this.setManualToken(accessCandidate.token, refreshCandidate?.token);
        }
      }
    } catch (e) {
      console.warn('Erro ao auto-detectar sessão do portal:', e);
    }

    return storage.getSession();
  }

  /**
   * Executa verificação silenciosa de SSO via iframe invisível com prompt=none no Keycloak
   */
  public async triggerSilentSsoCheck(): Promise<boolean> {
    console.log('Disparando verificação silenciosa de SSO com Keycloak...');
    return new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.id = 'zup-logbook-sso-iframe';

      const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
      const state = Math.random().toString(36).substring(2);
      const nonce = Math.random().toString(36).substring(2);
      const ssoUrl = `https://keycloak-zenity.zup.com.br/auth/realms/zupinternal/protocol/openid-connect/auth?client_id=realwave_zupper_csp_ui&redirect_uri=${redirectUri}&response_mode=fragment&response_type=code%20id_token%20token&scope=openid&prompt=none&state=${state}&nonce=${nonce}`;

      let timer: any = null;

      const cleanup = () => {
        if (timer) clearTimeout(timer);
        try {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        } catch {}
      };

      timer = setTimeout(() => {
        cleanup();
        // Se o iframe não respondeu em 4s, faz uma última varredura no storage
        const current = this.detectSessionFromPage(true);
        resolve(Boolean(current.token));
      }, 4000);

      iframe.onload = () => {
        try {
          const href = iframe.contentWindow?.location.href || '';
          if (href.includes('access_token=') || href.includes('code=')) {
            const hash = href.split('#')[1] || href.split('?')[1] || '';
            const params = new URLSearchParams(hash);
            const at = params.get('access_token');
            const rt = params.get('refresh_token');
            if (at) {
              console.log('Token obtido com sucesso via Silent SSO do Keycloak!');
              this.setManualToken(at, rt || undefined);
              cleanup();
              resolve(true);
              return;
            }
          }
        } catch (e) {
          // Cross-origin se ainda em redirecionamento externo
        }
      };

      iframe.src = ssoUrl;
      document.body.appendChild(iframe);
    });
  }

  public setManualToken(token: string, refreshToken?: string): AuthSession {
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    const payload = decodeJwtPayload(cleanToken);
    const userInfo = payload ? extractCleanUserInfo(payload) : null;
    let expiresAt: string | null = null;
    if (payload?.exp) {
      expiresAt = new Date(payload.exp * 1000).toISOString();
    }

    const updated = storage.updateSession({
      token: cleanToken,
      ...(refreshToken ? { refreshToken: refreshToken.trim() } : {}),
      user: userInfo,
      lastLogin: new Date().toISOString(),
      expiresAt,
      isExpired: false,
    });

    this.notify(updated);
    return updated;
  }

  public async refreshAccessToken(): Promise<boolean> {
    if (this.isRefreshing) {
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
      // Se não tiver refresh token em storage, tenta fazer a renovação via silent SSO
      const ssoSuccess = await this.triggerSilentSsoCheck();
      if (ssoSuccess) return true;
      return false;
    }

    this.isRefreshing = true;
    console.log('Bookmarklet: executando renovação via Keycloak OpenID Connect...');

    try {
      const endpoint = 'https://keycloak-zenity.zup.com.br/auth/realms/zupinternal/protocol/openid-connect/token';
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });

      let response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: '*/*',
        },
        credentials: 'include',
        body: body.toString(),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {}

      if (!response.ok && (data.error === 'invalid_client' || data.error_description?.includes('client'))) {
        body.set('client_id', 'realwave_zupper_csp_ui');
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: '*/*',
          },
          credentials: 'include',
          body: body.toString(),
        });
        try {
          data = await response.json();
        } catch {}
      }

      if (response.ok && data.access_token) {
        console.log('Token JWT renovado com sucesso pelo Keycloak no Bookmarklet!');
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

        const payload = decodeJwtPayload(newAccessToken);
        const userInfo = payload ? extractCleanUserInfo(payload) : currentSession.user;

        const updated = storage.updateSession({
          token: newAccessToken,
          refreshToken: newRefreshToken,
          user: userInfo,
          lastLogin: new Date().toISOString(),
          expiresAt,
          refreshExpiresAt,
          isExpired: false,
        });

        this.notify(updated);
        return true;
      } else {
        console.warn('Falha na renovação via Keycloak no Bookmarklet:', data);
        return false;
      }
    } catch (e: any) {
      console.error('Erro ao chamar token endpoint no Bookmarklet:', e.message);
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  public logout(): void {
    storage.clearSession();
    this.notify(storage.getSession());
  }

  public onAuthStatusChanged(callback: (session: AuthSession) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify(session: AuthSession) {
    this.listeners.forEach((cb) => {
      try {
        cb(session);
      } catch (e) {
        console.error('Erro no callback de auth status:', e);
      }
    });
  }
}

export const authService = new AuthService();
