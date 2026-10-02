import { AuthSession } from '../types';
import { storage } from './storage';

function decodeJwtPayload(token: string): any {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.trim().split('.');
    if (parts.length === 3) {
      let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4 !== 0) base64 += '=';
      try {
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
      } catch {
        return JSON.parse(atob(base64));
      }
    }
  } catch (e) {
    console.warn('Erro ao decodificar JWT:', e);
  }
  return null;
}

function extractCleanUserInfo(payload: any): { name?: string; username?: string; email?: string } {
  if (!payload) return {};
  const email = (payload.email || payload.upn || payload.unique_name || '').trim();
  const username = (payload.preferred_username || (email ? email.split('@')[0] : '') || payload.sub || '').trim();

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

  return {
    name: candidateName || undefined,
    username: username || undefined,
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
      if ((window as any).__zup_interceptors_installed) return;
      (window as any).__zup_interceptors_installed = true;
      const self = this;

      // 1. Interceptador de window.fetch
      const originalFetch = window.fetch;
      window.fetch = async function (...args) {
        const input = args[0];
        const init = args[1];
        try {

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

        const response = await originalFetch.apply(this, args);

        try {
          const url = typeof input === 'string' ? input : (input as any)?.url || '';
          if (url.includes('protocol/openid-connect/token') && response.ok) {
            const clone = response.clone();
            clone.json().then((data: any) => {
              if (data?.access_token) {
                console.log('[ZupLogbook] Novo token interceptado da resposta do Keycloak!');
                self.handleKeycloakTokenResponse(data);
              }
            }).catch(() => {});
          }
        } catch (e) {}

        return response;
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
      // 0. Inspeção direta de OIDC no sessionStorage e localStorage
      for (const st of [sessionStorage, localStorage]) {
        try {
          for (let i = 0; i < st.length; i++) {
            const k = st.key(i);
            if (k && k.startsWith('oidc.user:')) {
              const item = JSON.parse(st.getItem(k) || '{}');
              if (item.access_token) {
                const payload = decodeJwtPayload(item.access_token);
                const exp = payload?.exp ? payload.exp * 1000 : (item.expires_at ? item.expires_at * 1000 : Infinity);
                if (exp > Date.now() + 10000) {
                  console.log('[ZupLogbook] Sessão OIDC ativa encontrada diretamente em ' + k);
                  return this.setManualToken(item.access_token, item.refresh_token);
                }
              }
            }
          }
        } catch {}
      }

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
              typ: (payload.typ || payload.type || '').toLowerCase(),
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
          (c) => c.typ === 'refresh' || (c.payload?.type || '').toLowerCase() === 'refresh'
        );

        // Candidatos a Access Token: EXCLUI explicitamente tokens de ID e Refresh
        const isIdToken = (c: typeof candidates[0]) =>
          c.typ === 'id' || (c.payload?.type || '').toLowerCase() === 'id';

        const accessPool = validTokens.filter((c) => c !== refreshCandidate && !isIdToken(c));

        // Prioriza Bearer token genuíno, com claims de autorização, e mais recente
        accessPool.sort((a, b) => {
          const aBearer = a.typ === 'bearer' ? 2 : (a.payload?.resource_access || a.payload?.realm_access ? 1 : 0);
          const bBearer = b.typ === 'bearer' ? 2 : (b.payload?.resource_access || b.payload?.realm_access ? 1 : 0);
          if (aBearer !== bBearer) return bBearer - aBearer;
          return b.exp - a.exp;
        });

        if (refreshCandidate) {
          storage.updateSession({ refreshToken: refreshCandidate.token });
        }

        const accessCandidate = accessPool[0] || validTokens.find((c) => c.typ === 'bearer') || validTokens[0];

        if (accessCandidate) {
          console.log('[ZupLogbook] Sessão encontrada com sucesso na varredura profunda!');
          return this.setManualToken(accessCandidate.token, refreshCandidate?.token);
        }
      }
    } catch (e) {
      console.warn('Erro ao auto-detectar sessão do portal:', e);
    }

    // Se a sessão está expirada mas possui refresh token, tenta renovação automática em segundo plano
    const session = storage.getSession();
    if ((!session.token || session.isExpired) && session.refreshToken && !this.isRefreshing) {
      console.log('[ZupLogbook] Sessão expirada na página, renovando automaticamente com refresh token...');
      this.refreshAccessToken().catch(() => {});
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

  public handleKeycloakTokenResponse(data: any): AuthSession | null {
    if (!data?.access_token) return null;
    const newAccessToken = data.access_token;
    const newRefreshToken = data.refresh_token;

    const payload = decodeJwtPayload(newAccessToken);
    const userInfo = payload ? extractCleanUserInfo(payload) : null;

    let expMs = payload?.exp ? payload.exp * 1000 : 0;
    if (data.expires_in) {
      const fromExpiresIn = Date.now() + Number(data.expires_in) * 1000;
      if (!expMs || fromExpiresIn > expMs) expMs = fromExpiresIn;
    }
    // Garante que o token recém emitido tem validade de no mínimo 5 minutos (evita falhas por clock skew)
    if (expMs <= Date.now()) {
      expMs = Date.now() + 300000;
    }

    const expiresAt = new Date(expMs).toISOString();

    // Atualiza sessionStorage para People Zup e futuras leituras da página
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith('oidc.user:')) {
          const item = JSON.parse(sessionStorage.getItem(k) || '{}');
          item.access_token = newAccessToken;
          if (newRefreshToken) item.refresh_token = newRefreshToken;
          if (data.id_token) item.id_token = data.id_token;
          item.expires_at = Math.floor(expMs / 1000);
          sessionStorage.setItem(k, JSON.stringify(item));
          console.log('[ZupLogbook] sessionStorage atualizado com novo access_token para ' + k);
        }
      }
    } catch {}

    const updated = storage.updateSession({
      token: newAccessToken,
      ...(newRefreshToken ? { refreshToken: newRefreshToken } : {}),
      user: userInfo || storage.getSession().user,
      lastLogin: new Date().toISOString(),
      expiresAt,
      isExpired: false,
    });

    this.notify(updated);
    return updated;
  }

  public setManualToken(token: string, refreshToken?: string): AuthSession {
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    const payload = decodeJwtPayload(cleanToken);
    const userInfo = payload ? extractCleanUserInfo(payload) : null;
    let expMs = payload?.exp ? payload.exp * 1000 : 0;
    if (expMs <= Date.now()) {
      // Se não tem exp ou relógio local está com skew, assume válido por no mínimo 5 minutos
      expMs = Date.now() + 300000;
    }
    const expiresAt = new Date(expMs).toISOString();

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
    console.log('[ZupLogbook] Executando renovação via Keycloak OpenID Connect...');

    try {
      const endpoint = 'https://keycloak-zenity.zup.com.br/auth/realms/zupinternal/protocol/openid-connect/token';
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken.trim(),
        client_id: 'realwave_zupper_csp_ui',
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

      if (response.ok && data.access_token) {
        console.log('[ZupLogbook] Token JWT renovado com sucesso pelo Keycloak no Bookmarklet!');
        this.handleKeycloakTokenResponse(data);
        return true;
      } else {
        console.warn('[ZupLogbook] Falha na renovação via Keycloak token endpoint:', data);
        const ssoSuccess = await this.triggerSilentSsoCheck();
        return ssoSuccess;
      }
    } catch (e: any) {
      console.error('[ZupLogbook] Erro ao chamar token endpoint:', e.message);
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
