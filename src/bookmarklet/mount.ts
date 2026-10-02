const HOST_ID = 'zup-logbook-host';

const ALL_COMPETENCES = [
  { id: 1, name: 'Colaboramos de verdade' },
  { id: 2, name: 'Nosso compromisso é coletivo' },
  { id: 3, name: 'Vamos direto ao ponto' },
  { id: 4, name: 'Focamos no cliente' },
  { id: 5, name: 'Entregamos valor de ponta a ponta' },
  { id: 6, name: 'Decidimos com contexto' },
  { id: 7, name: 'Protagonizamos o futuro' },
  { id: 8, name: 'Tomamos a iniciativa' },
  { id: 9, name: 'Entrega soluções técnicas' },
  { id: 10, name: 'Aplicabilidade de novos conhecimentos técnicos' },
  { id: 11, name: 'Linguagem de Programação [Java, Go, Kotlin, C#, Python, Swift, etc ]' },
  { id: 12, name: 'Algoritmos e Estrutura de Dados' },
  { id: 13, name: 'Fluxo de trabalho/Workflow' },
  { id: 14, name: 'Pipeline CI/CD' },
  { id: 15, name: 'APIs' },
  { id: 16, name: 'Segurança' },
  { id: 17, name: 'Arquitetura de soluções' },
  { id: 18, name: 'Redes (VPC, CDN, DNS, etc)' },
  { id: 19, name: 'Infra / IaC (Terraform, CloudFormation, etc)' },
  { id: 23, name: 'StackSpot AI' },
  { id: 25, name: 'Computing services (EC2, ECS, EKS, Fargate, Lambda, etc)' },
  { id: 26, name: 'Observabilidade e Monitoramento' },
  { id: 27, name: 'SQL / noSQL' },
  { id: 28, name: 'Cache' },
  { id: 29, name: 'Inteligencia Artificial' },
  { id: 40, name: 'Arquitetura de Solução' },
  { id: 41, name: 'Qualidade' },
  { id: 50, name: 'Testes Automatizados' },
  { id: 52, name: 'Log, Debug, Performance' },
  { id: 53, name: 'Versionamento' },
  { id: 54, name: 'Code Review' },
  { id: 59, name: 'Arquitetura' },
  { id: 62, name: 'CI/CD' },
  { id: 72, name: 'Bancos de dados' },
  { id: 80, name: 'Codificação' },
  { id: 83, name: 'Arquitetura de Sistemas' },
  { id: 86, name: 'DevOps e Observabilidade' },
  { id: 97, name: 'Boas Práticas de programação e automação' },
  { id: 106, name: 'Linux' },
];

function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

function findCompetence(name: string) {
  const s = norm(name);
  if (!s) return null;
  const found = ALL_COMPETENCES.find((c) => {
    const cn = norm(c.name);
    return cn === s || cn.includes(s) || s.includes(cn);
  });
  return found || { id: 0, name: name.trim() };
}

function parseInput(raw: string) {
  let clean = raw
    .trim()
    .replace(/^```[a-z0-9_-]*\s*/i, '')
    .replace(/\s*```$/, '')
    .replace(/\[cite:[^\]]*\]/gi, '')
    .replace(/\[\d+(?:,\s*\d+)*\]/g, '')
    .trim();

  // 1. Verifica se é Markdown padrão com seções ##
  const hasMarkdownHeaders = /^##+\s+/m.test(clean);

  if (hasMarkdownHeaders) {
    let title = '';
    const titleMatch = clean.match(/^#\s*(?:t[ií]tulo:\s*)?(.+)$/mi) || clean.match(/^t[ií]tulo:\s*(.+)$/mi);
    if (titleMatch) {
      title = titleMatch[1].replace(/^t[ií]tulo:\s*/i, '').trim();
    } else {
      title = clean.split(/\r?\n/)[0]?.replace(/^[#\s*_-]+/, '').replace(/^t[ií]tulo:\s*/i, '').trim() || '';
    }

    const sectionRegex = /^##+\s+(.+)$/gm;
    let match: RegExpExecArray | null;
    const headerPositions: { header: string; index: number; end: number }[] = [];

    while ((match = sectionRegex.exec(clean)) !== null) {
      headerPositions.push({ header: match[1].trim(), index: match.index, end: match.index + match[0].length });
    }

    const competences: any[] = [];
    const formattedContent: any[] = [];
    const plainBlocks: string[] = [];

    for (let i = 0; i < headerPositions.length; i++) {
      const cur = headerPositions[i];
      const nextStart = i + 1 < headerPositions.length ? headerPositions[i + 1].index : clean.length;
      const body = clean.slice(cur.end, nextStart).trim();

      if (/compet[eê]ncias/i.test(cur.header)) {
        const items = body.split(/\r?\n/).map((l) => l.replace(/^[-*•\d.)\s]+/, '').trim()).filter(Boolean);
        for (const item of items) {
          const comp = findCompetence(item);
          if (comp) competences.push(comp);
        }
        continue;
      }

      let headerText = cur.header;
      if (!headerText.endsWith(':')) headerText += ':';

      formattedContent.push({
        type: 'paragraph',
        children: [{ text: headerText, bold: true }],
      });

      if (body) {
        formattedContent.push({
          type: 'paragraph',
          children: [{ text: body }],
        });
        plainBlocks.push(`${headerText}\n${body}`);
      } else {
        plainBlocks.push(headerText);
      }

      formattedContent.push({
        type: 'paragraph',
        children: [{ text: '', bold: true }],
      });
    }

    if (formattedContent.length > 0 && formattedContent[formattedContent.length - 1].children?.[0]?.text === '') {
      formattedContent.pop();
    }

    return {
      title,
      formattedContent,
      content: plainBlocks.join('\n\n'),
      isPerformanceReview: true,
      metadata: {
        templateFor: /lideran[cç]a/i.test(clean) && !/n[aã]o\s*lideran[cç]a/i.test(clean) ? 'LEADERSHIP' : 'NON_LEADERSHIP',
      },
      competences,
    };
  }

  // 2. Fallback para formato texto livre com regex flexível de tópicos
  let text = clean;
  const compMatch = text.match(/compet[eê]ncias:\s*([\s\S]*)$/i);
  let compText = '';
  if (compMatch) {
    compText = compMatch[1].trim();
    text = text.slice(0, compMatch.index).trim();
  }

  let title = '';
  const descIdx = text.search(/descri[cç][aã]o:/i);
  if (descIdx !== -1) {
    title = text.slice(0, descIdx).replace(/t[ií]tulo:\s*/i, '').trim();
    text = text.slice(descIdx).replace(/descri[cç][aã]o:\s*/i, '').trim();
  } else {
    title = text.split(/\r?\n/)[0]?.replace(/t[ií]tulo:\s*/i, '').trim() || '';
  }
  title = title.split(/\r?\n/)[0]?.replace(/^t[ií]tulo:\s*/i, '').trim() || '';

  const topicPattern = /(Resultado\/impacto(?:\s*\(momento atual\))?:?|Atitude e comportamento:?|Conhecimento T[eé]cnico da Pr[aá]tica:?|Aprendizado Tech:?|Expectativas de Entregas:?|Coment[aá]rios Adicionais(?: e Feedback Recebido)?:?)/gi;

  const matches: { index: number; header: string; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = topicPattern.exec(text)) !== null) {
    matches.push({ index: m.index, header: m[0], end: m.index + m[0].length });
  }

  const formattedContent: any[] = [];
  const plainBlocks: string[] = [];

  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const nextStart = i + 1 < matches.length ? matches[i + 1].index : text.length;
    let body = text.slice(cur.end, nextStart).trim().replace(/^-+\s*|\s*-+$/g, '').trim();

    let standardHeader = cur.header.trim();
    if (!standardHeader.endsWith(':')) standardHeader += ':';

    formattedContent.push({
      type: 'paragraph',
      children: [{ text: standardHeader, bold: true }],
    });

    if (body) {
      formattedContent.push({
        type: 'paragraph',
        children: [{ text: body }],
      });
      plainBlocks.push(`${standardHeader}\n${body}`);
    } else {
      plainBlocks.push(standardHeader);
    }

    if (i < matches.length - 1) {
      formattedContent.push({
        type: 'paragraph',
        children: [{ text: '', bold: true }],
      });
    }
  }

  const competences: any[] = [];
  if (compText) {
    const compLines = compText.split(/[\r\n,]+/).map((l) => l.replace(/^[-*•\d.)\s]+/, '').trim()).filter(Boolean);
    for (const line of compLines) {
      const match = findCompetence(line);
      if (match) competences.push(match);
    }
  }

  return {
    title,
    formattedContent,
    content: plainBlocks.join('\n\n'),
    isPerformanceReview: true,
    metadata: {
      templateFor: /lideran[cç]a/i.test(clean) && !/n[aã]o\s*lideran[cç]a/i.test(clean) ? 'LEADERSHIP' : 'NON_LEADERSHIP',
    },
    competences,
  };
}

interface DecodedToken {
  token: string;
  payload: any;
  exp: number;
  typ: string;
  iss?: string;
  azp?: string;
}

interface AuthSessionInfo {
  token: string | null;
  exp: number;
  isExpired: boolean;
  userEmail?: string;
  userName?: string;
  source: string;
}

function parseJwt(token: string): DecodedToken | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.trim().split('.');
  if (parts.length !== 3) return null;
  try {
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) b64 += '=';
    const jsonStr = decodeURIComponent(
      atob(b64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonStr);
    return {
      token: token.trim(),
      payload,
      exp: payload.exp ? payload.exp * 1000 : Infinity,
      typ: (payload.typ || payload.type || '').toLowerCase(),
      iss: payload.iss,
      azp: payload.azp || payload.client_id,
    };
  } catch {
    try {
      let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4 !== 0) b64 += '=';
      const payload = JSON.parse(atob(b64));
      return {
        token: token.trim(),
        payload,
        exp: payload.exp ? payload.exp * 1000 : Infinity,
        typ: (payload.typ || payload.type || '').toLowerCase(),
        iss: payload.iss,
        azp: payload.azp || payload.client_id,
      };
    } catch {
      return null;
    }
  }
}

function isAccessToken(p: DecodedToken): boolean {
  if (!p || !p.payload) return false;
  if (p.typ === 'refresh' || p.payload.type === 'refresh') return false;
  if (p.typ === 'id' || p.payload.type === 'id') return false;
  if (p.typ === 'bearer' || p.payload.token_type?.toLowerCase() === 'bearer') return true;
  if (p.payload.resource_access || p.payload.realm_access) return true;
  if (p.payload.scope && !p.payload.nonce && !p.payload.auth_time) return true;
  return false;
}

function isRefreshToken(p: DecodedToken): boolean {
  return p.typ === 'refresh' || (p.payload && p.payload.type === 'refresh');
}

let capturedToken: string | null = null;
let capturedRefreshToken: string | null = null;

try {
  if (typeof window !== 'undefined') {
    const origFetch = window.fetch;
    window.fetch = async function (...args) {
      try {
        const input = args[0];
        const init = args[1];
        let h: string | null = null;
        if (init?.headers) {
          if (init.headers instanceof Headers) {
            h = init.headers.get('Authorization') || init.headers.get('authorization');
          } else if (Array.isArray(init.headers)) {
            const found = init.headers.find(([k]) => k.toLowerCase() === 'authorization');
            if (found) h = found[1];
          } else if (typeof init.headers === 'object') {
            h = (init.headers as any).Authorization || (init.headers as any).authorization;
          }
        }
        if (h && h.toLowerCase().startsWith('bearer ')) {
          const t = h.replace(/^bearer\s+/i, '').trim();
          const parsed = parseJwt(t);
          if (parsed && isAccessToken(parsed)) {
            capturedToken = t;
          }
        }

        const url = typeof input === 'string' ? input : (input as any)?.url || '';
        if (url.includes('protocol/openid-connect/token') && init?.body) {
          const bodyStr = typeof init.body === 'string' ? init.body : '';
          const params = new URLSearchParams(bodyStr);
          const rt = params.get('refresh_token');
          if (rt) capturedRefreshToken = rt;
        }
      } catch {}
      return origFetch.apply(this, args);
    };

    const origSetHeader = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function (name: string, val: string) {
      try {
        if (name?.toLowerCase() === 'authorization' && val?.toLowerCase().startsWith('bearer ')) {
          const t = val.replace(/^bearer\s+/i, '').trim();
          const parsed = parseJwt(t);
          if (parsed && isAccessToken(parsed)) {
            capturedToken = t;
          }
        }
      } catch {}
      return origSetHeader.apply(this, [name, val]);
    };
  }
} catch {}

async function refreshKeycloakToken(
  refreshToken: string,
  iss?: string,
  azp?: string
): Promise<string | null> {
  if (!refreshToken) return null;
  try {
    const baseRealm = iss ? iss.replace(/\/+$/, '') : 'https://keycloak-zenity.zup.com.br/auth/realms/zupinternal';
    const endpoint = `${baseRealm}/protocol/openid-connect/token`;
    const clientId = azp || 'realwave_zupper_csp_ui';

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken.trim(),
      client_id: clientId,
    });

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: '*/*',
      },
      credentials: 'omit',
      body: body.toString(),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.access_token) {
        capturedToken = data.access_token;
        if (data.refresh_token) capturedRefreshToken = data.refresh_token;

        try {
          for (let i = 0; i < sessionStorage.length; i++) {
            const k = sessionStorage.key(i);
            if (k && k.startsWith('oidc.user:')) {
              const item = JSON.parse(sessionStorage.getItem(k) || '{}');
              item.access_token = data.access_token;
              if (data.refresh_token) item.refresh_token = data.refresh_token;
              if (data.id_token) item.id_token = data.id_token;
              if (data.expires_in) item.expires_at = Math.floor(Date.now() / 1000) + data.expires_in;
              sessionStorage.setItem(k, JSON.stringify(item));
            }
          }
        } catch {}

        return data.access_token;
      }
    }
  } catch {}
  return null;
}

async function triggerSilentSsoCheck(): Promise<string | null> {
  if (typeof window === 'undefined' || !document.body) return null;
  return new Promise((resolve) => {
    try {
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
        resolve(null);
      }, 3000);

      iframe.onload = () => {
        try {
          const href = iframe.contentWindow?.location.href || '';
          if (href.includes('access_token=')) {
            const hash = href.split('#')[1] || href.split('?')[1] || '';
            const params = new URLSearchParams(hash);
            const at = params.get('access_token');
            const rt = params.get('refresh_token');
            if (at) {
              capturedToken = at;
              if (rt) capturedRefreshToken = rt;
              cleanup();
              resolve(at);
              return;
            }
          }
        } catch {}
      };

      iframe.src = ssoUrl;
      document.body.appendChild(iframe);
    } catch {
      resolve(null);
    }
  });
}

async function getAuthSession(forceRefresh = false): Promise<AuthSessionInfo> {
  const now = Date.now();
  const minValidityMs = 15000;

  // 0. Verifica token manual configurado pelo usuário
  try {
    const manual = sessionStorage.getItem('zup_manual_token') || localStorage.getItem('zup_manual_token');
    if (manual) {
      const p = parseJwt(manual);
      if (p) {
        console.info('[ZupLogbook] Usando token manual salvo');
        return {
          token: p.token,
          exp: p.exp,
          isExpired: p.exp <= now,
          userEmail: p.payload?.email,
          userName: p.payload?.name,
          source: 'manual',
        };
      }
    }
  } catch {}

  let bestRefreshToken: { token: string; iss?: string; azp?: string } | null = null;
  if (capturedRefreshToken) {
    const p = parseJwt(capturedRefreshToken);
    bestRefreshToken = { token: capturedRefreshToken, iss: p?.iss, azp: p?.azp };
  }

  // 1. Checa Keycloak no window (win.keycloak)
  const win = window as any;
  if (win?.keycloak) {
    try {
      if (typeof win.keycloak.updateToken === 'function') {
        await win.keycloak.updateToken(forceRefresh ? 999999 : 30);
      }
      if (win.keycloak.refreshToken && !bestRefreshToken) {
        const p = parseJwt(win.keycloak.refreshToken);
        bestRefreshToken = { token: win.keycloak.refreshToken, iss: p?.iss, azp: p?.azp };
      }
      if (win.keycloak.token) {
        const parsed = parseJwt(win.keycloak.token);
        if (parsed && isAccessToken(parsed) && (forceRefresh ? false : parsed.exp > now + minValidityMs)) {
          console.info('[ZupLogbook] Token obtido via window.keycloak');
          return {
            token: win.keycloak.token,
            exp: parsed.exp,
            isExpired: false,
            userEmail: parsed.payload?.email,
            userName: parsed.payload?.name,
            source: 'keycloak',
          };
        }
      }
    } catch {}
  }

  // 2. Se interceptado na rede e válido
  if (!forceRefresh && capturedToken) {
    const parsed = parseJwt(capturedToken);
    if (parsed && isAccessToken(parsed) && parsed.exp > now + minValidityMs) {
      console.info('[ZupLogbook] Token obtido via interceptador de rede');
      return {
        token: capturedToken,
        exp: parsed.exp,
        isExpired: false,
        userEmail: parsed.payload?.email,
        userName: parsed.payload?.name,
        source: 'interceptor',
      };
    }
  }

  // 3. Inspeção direta de OIDC no sessionStorage e localStorage
  const storages = [sessionStorage, localStorage];
  for (const st of storages) {
    try {
      for (let i = 0; i < st.length; i++) {
        const k = st.key(i);
        if (k && k.startsWith('oidc.user:')) {
          const item = JSON.parse(st.getItem(k) || '{}');
          if (item.refresh_token && !bestRefreshToken) {
            const p = parseJwt(item.refresh_token);
            bestRefreshToken = { token: item.refresh_token, iss: p?.iss, azp: p?.azp };
          }
          if (item.access_token) {
            const parsed = parseJwt(item.access_token);
            if (parsed && isAccessToken(parsed) && (forceRefresh ? false : parsed.exp > now + minValidityMs)) {
              console.info('[ZupLogbook] Token obtido via storage OIDC (' + k + ')');
              return {
                token: item.access_token,
                exp: parsed.exp,
                isExpired: false,
                userEmail: parsed.payload?.email,
                userName: parsed.payload?.name,
                source: 'oidc',
              };
            }
          }
        }
      }
    } catch {}
  }

  // 4. Varredura profunda de JWTs em todas as chaves de storage, cookies e window
  const accessCandidates: DecodedToken[] = [];
  const check = (str: string, src: string) => {
    if (!str || typeof str !== 'string') return;
    const matches = str.match(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g);
    if (!matches) return;
    for (const m of matches) {
      const p = parseJwt(m);
      if (!p) continue;
      if (isRefreshToken(p)) {
        if (!bestRefreshToken) bestRefreshToken = { token: m, iss: p.iss, azp: p.azp };
      } else if (isAccessToken(p)) {
        console.info(`[ZupLogbook] Candidato Access Token (${src}): exp=${new Date(p.exp).toLocaleTimeString()}, expirado=${p.exp <= now}`);
        accessCandidates.push(p);
      }
    }
  };

  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k) check(sessionStorage.getItem(k) || '', `sessionStorage[${k}]`);
    }
  } catch {}

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && !k.startsWith('zup_manual_token')) check(localStorage.getItem(k) || '', `localStorage[${k}]`);
    }
  } catch {}

  try { check(document.cookie, 'cookie'); } catch {}

  for (const k of ['keycloak', '_keycloak', 'kc', 'auth', 'currentUser', '__PRELOADED_STATE__']) {
    try { if (win[k]) check(typeof win[k] === 'string' ? win[k] : JSON.stringify(win[k]), `window.${k}`); } catch {}
  }

  // Filtra candidatos válidos (não expirados)
  if (!forceRefresh && accessCandidates.length > 0) {
    const valid = accessCandidates.filter((c) => c.exp > now + minValidityMs);
    if (valid.length > 0) {
      valid.sort((a, b) => {
        const aBearer = a.typ === 'bearer' ? 1 : 0;
        const bBearer = b.typ === 'bearer' ? 1 : 0;
        if (aBearer !== bBearer) return bBearer - aBearer;
        return b.exp - a.exp;
      });
      const best = valid[0];
      console.info(`[ZupLogbook] Melhor token selecionado: exp=${new Date(best.exp).toLocaleTimeString()}`);
      return {
        token: best.token,
        exp: best.exp,
        isExpired: false,
        userEmail: best.payload?.email,
        userName: best.payload?.name,
        source: 'storage',
      };
    }
  }

  // 5. Tenta renovar via refresh token se disponível
  if (bestRefreshToken) {
    console.info('[ZupLogbook] Tentando renovar sessão com Refresh Token...');
    const refreshed = await refreshKeycloakToken(
      bestRefreshToken.token,
      bestRefreshToken.iss,
      bestRefreshToken.azp
    );
    if (refreshed) {
      const p = parseJwt(refreshed);
      return {
        token: refreshed,
        exp: p?.exp || now + 300000,
        isExpired: false,
        userEmail: p?.payload?.email,
        userName: p?.payload?.name,
        source: 'refresh_token',
      };
    }
  }

  // 6. Silent SSO via iframe
  console.info('[ZupLogbook] Tentando Silent SSO via iframe...');
  const ssoToken = await triggerSilentSsoCheck();
  if (ssoToken) {
    const p = parseJwt(ssoToken);
    return {
      token: ssoToken,
      exp: p?.exp || now + 300000,
      isExpired: false,
      userEmail: p?.payload?.email,
      userName: p?.payload?.name,
      source: 'sso_iframe',
    };
  }

  // Se houver candidato expirado
  if (accessCandidates.length > 0) {
    accessCandidates.sort((a, b) => b.exp - a.exp);
    const candidate = accessCandidates[0];
    console.warn(`[ZupLogbook] Todos os access tokens estão expirados (último expirou às ${new Date(candidate.exp).toLocaleTimeString()})`);
    return {
      token: null,
      exp: candidate.exp,
      isExpired: true,
      userEmail: candidate.payload?.email,
      userName: candidate.payload?.name,
      source: 'expired',
    };
  }

  console.warn('[ZupLogbook] Nenhum token de acesso encontrado na página.');
  return {
    token: null,
    exp: 0,
    isExpired: false,
    source: 'not_found',
  };
}

export function mountZupLogbook() {
  const existing = document.getElementById(HOST_ID);
  if (existing) {
    existing.remove();
  }

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.style.position = 'fixed';
  host.style.top = '50%';
  host.style.left = '50%';
  host.style.transform = 'translate(-50%, -50%)';
  host.style.width = '380px';
  host.style.height = '380px';
  host.style.maxWidth = '90vw';
  host.style.maxHeight = '90vh';
  host.style.zIndex = '2147483647';
  host.style.display = 'block';
  host.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 100vmax rgba(0, 0, 0, 0.45)';
  host.style.borderRadius = '12px';
  host.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :host {
      all: initial;
      display: block;
    }
    .modal {
      width: 100%;
      height: 100%;
      background: #181920;
      border: 1px solid #2d3142;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      padding: 14px 16px;
      gap: 8px;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      user-select: none;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .title {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
    }
    .close-btn {
      background: none;
      border: none;
      color: #8892b0;
      font-size: 16px;
      cursor: pointer;
      line-height: 1;
      padding: 4px;
      border-radius: 4px;
    }
    .close-btn:hover {
      color: #fff;
      background: #252836;
    }
    .session-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #94a3b8;
      padding: 0 2px;
    }
    .session-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .session-toggle-btn {
      background: none;
      border: none;
      color: #818cf8;
      cursor: pointer;
      font-size: 11px;
      text-decoration: underline;
      padding: 0;
    }
    .session-toggle-btn:hover {
      color: #a5b4fc;
    }
    .manual-box {
      display: none;
      gap: 6px;
      align-items: center;
      padding: 6px 8px;
      background: #0f1015;
      border: 1px solid #2d3142;
      border-radius: 8px;
    }
    .manual-input {
      flex: 1;
      background: transparent;
      border: none;
      color: #f1f5f9;
      font-size: 11px;
      outline: none;
      font-family: monospace;
    }
    .manual-apply-btn {
      background: #6366f1;
      color: #fff;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
    }
    .manual-apply-btn:hover {
      background: #4f46e5;
    }
    .manual-clear-btn {
      background: #252836;
      color: #94a3b8;
      border: none;
      padding: 4px 6px;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
    }
    textarea {
      flex: 1;
      width: 100%;
      background: #0f1015;
      border: 1px solid #2d3142;
      border-radius: 8px;
      color: #f1f5f9;
      padding: 10px;
      font-size: 12px;
      font-family: monospace;
      resize: none;
      outline: none;
      user-select: text;
    }
    textarea:focus {
      border-color: #6366f1;
    }
    .status {
      display: none;
      font-size: 11px;
      padding: 6px 8px;
      border-radius: 6px;
      word-break: break-word;
      line-height: 1.3;
    }
    .status.success {
      display: block;
      color: #4ade80;
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.25);
    }
    .status.error {
      display: block;
      color: #f87171;
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.25);
    }
    .submit-btn {
      width: 100%;
      height: 38px;
      background: #6366f1;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, opacity 0.15s;
    }
    .submit-btn:hover:not(:disabled) {
      background: #4f46e5;
    }
    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;
  shadow.appendChild(style);

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="header">
      <span class="title">Zup Logbook</span>
      <button class="close-btn" type="button" title="Fechar">✕</button>
    </div>
    <div class="session-bar">
      <span class="session-badge">● Detectando sessão...</span>
      <button class="session-toggle-btn" type="button">Chave manual</button>
    </div>
    <div class="manual-box">
      <input type="password" class="manual-input" placeholder="Cole o Bearer token aqui..." />
      <button class="manual-apply-btn" type="button">Salvar</button>
      <button class="manual-clear-btn" type="button" title="Limpar token manual">✕</button>
    </div>
    <textarea placeholder="Cole o Markdown ou texto do relato aqui..." autofocus></textarea>
    <div class="status"></div>
    <button class="submit-btn" type="button" disabled>Enviar</button>
  `;
  shadow.appendChild(modal);

  const closeBtn = modal.querySelector('.close-btn') as HTMLButtonElement;
  const sessionBadge = modal.querySelector('.session-badge') as HTMLSpanElement;
  const sessionToggleBtn = modal.querySelector('.session-toggle-btn') as HTMLButtonElement;
  const manualBox = modal.querySelector('.manual-box') as HTMLDivElement;
  const manualInput = modal.querySelector('.manual-input') as HTMLInputElement;
  const manualApplyBtn = modal.querySelector('.manual-apply-btn') as HTMLButtonElement;
  const manualClearBtn = modal.querySelector('.manual-clear-btn') as HTMLButtonElement;
  const textarea = modal.querySelector('textarea') as HTMLTextAreaElement;
  const statusEl = modal.querySelector('.status') as HTMLDivElement;
  const submitBtn = modal.querySelector('.submit-btn') as HTMLButtonElement;

  const updateSessionUI = async () => {
    const auth = await getAuthSession();
    if (auth.token && !auth.isExpired) {
      const mins = Math.max(0, Math.round((auth.exp - Date.now()) / 60000));
      const user = auth.userEmail ? auth.userEmail.split('@')[0] : 'Sessão ativa';
      sessionBadge.textContent = `🟢 ${auth.source === 'manual' ? 'Manual: ' : ''}${user} (${mins}m)`;
      sessionBadge.style.color = '#4ade80';
      sessionBadge.title = `Expira às ${new Date(auth.exp).toLocaleTimeString()}`;
    } else if (auth.isExpired) {
      sessionBadge.textContent = '🔴 Sessão expirada (F5 no People)';
      sessionBadge.style.color = '#f87171';
      sessionBadge.title = `Expirou às ${new Date(auth.exp).toLocaleTimeString()}`;
    } else {
      sessionBadge.textContent = '⚪ Token não detectado';
      sessionBadge.style.color = '#94a3b8';
      sessionBadge.title = 'Nenhum token encontrado na página.';
    }
  };

  sessionToggleBtn.onclick = () => {
    const isHidden = manualBox.style.display === 'none' || !manualBox.style.display;
    manualBox.style.display = isHidden ? 'flex' : 'none';
    if (isHidden) {
      const existing = sessionStorage.getItem('zup_manual_token') || localStorage.getItem('zup_manual_token') || '';
      manualInput.value = existing;
      manualInput.focus();
    }
  };

  manualApplyBtn.onclick = () => {
    const val = manualInput.value.trim().replace(/^bearer\s+/i, '');
    if (val) {
      sessionStorage.setItem('zup_manual_token', val);
      manualBox.style.display = 'none';
      updateSessionUI();
      showStatus('success', 'Chave manual salva com sucesso!');
    }
  };

  manualClearBtn.onclick = () => {
    sessionStorage.removeItem('zup_manual_token');
    localStorage.removeItem('zup_manual_token');
    manualInput.value = '';
    manualBox.style.display = 'none';
    updateSessionUI();
    showStatus('success', 'Chave manual removida.');
  };

  const close = () => {
    host.style.display = 'none';
    window.removeEventListener('pointerdown', onOutsidePointer, true);
  };

  const onOutsidePointer = (e: PointerEvent) => {
    const path = e.composedPath();
    if (!path.includes(host)) {
      close();
    }
  };

  closeBtn.onclick = (e) => {
    e.stopPropagation();
    close();
  };

  const showStatus = (type: 'success' | 'error', msg: string) => {
    statusEl.className = `status ${type}`;
    statusEl.textContent = msg;
  };

  const clearStatus = () => {
    statusEl.className = 'status';
    statusEl.textContent = '';
  };

  textarea.oninput = () => {
    submitBtn.disabled = !textarea.value.trim();
    clearStatus();
  };

  const send = async () => {
    const val = textarea.value.trim();
    if (!val) {
      showStatus('error', 'Cole o relato antes de enviar.');
      return;
    }

    let payload: any = null;
    try {
      payload = JSON.parse(val);
    } catch {
      payload = parseInput(val);
    }

    if (!payload || (!payload.title && !payload.content)) {
      showStatus('error', 'Não foi possível identificar o título ou conteúdo do relato.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Autenticando...';
    clearStatus();

    let auth = await getAuthSession();
    if (!auth.token) {
      if (auth.isExpired) {
        showStatus(
          'error',
          `Sessão expirada no People Zup (expirou às ${new Date(auth.exp).toLocaleTimeString()}). Recarregue a página (F5) ou use a "Chave manual" acima.`
        );
      } else {
        showStatus(
          'error',
          'Token de autenticação não encontrado na página. Atualize a página (F5) ou use a "Chave manual" acima.'
        );
      }
      submitBtn.textContent = 'Enviar';
      submitBtn.disabled = !textarea.value.trim();
      return;
    }

    let token = auth.token;
    submitBtn.textContent = 'Enviando...';

    const doSubmit = async (authToken: string) => {
      const res = await fetch('https://apiznt.zenity.zup.com.br/dune/v1/entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
          authorization: `Bearer ${authToken}`,
        },
        credentials: 'omit',
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { text };
      }
      return { ok: res.ok, status: res.status, data, text };
    };

    try {
      let result = await doSubmit(token);

      // Se falhar por autorização (401, 403 ou explicit deny na policy), força renovação e reenvia uma vez
      if (!result.ok && (result.status === 401 || result.status === 403 || result.text.includes('not authorized'))) {
        submitBtn.textContent = 'Renovando sessão...';
        const refreshedAuth = await getAuthSession(true);
        if (refreshedAuth.token && refreshedAuth.token !== token) {
          token = refreshedAuth.token;
          submitBtn.textContent = 'Reenviando...';
          result = await doSubmit(token);
        }
      }

      if (result.ok) {
        showStatus('success', `Relato${result.data?.id ? ` #${result.data.id}` : ''} enviado com sucesso!`);
        textarea.value = '';
        submitBtn.disabled = true;
        updateSessionUI();
      } else {
        const msg =
          result.data?.message ||
          result.data?.Message ||
          result.data?.error ||
          result.text ||
          `Status HTTP ${result.status}`;
        showStatus('error', `Falha (${result.status}): ${msg}`);
      }
    } catch (err: any) {
      showStatus('error', `Erro de conexão: ${err.message}`);
    } finally {
      submitBtn.textContent = 'Enviar';
      submitBtn.disabled = !textarea.value.trim();
    }
  };

  submitBtn.onclick = (e) => {
    e.stopPropagation();
    send();
  };

  textarea.onkeydown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      send();
    }
    if (e.key === 'Escape') {
      close();
    }
  };

  document.body.appendChild(host);
  updateSessionUI();
  setTimeout(() => {
    textarea.focus();
    window.addEventListener('pointerdown', onOutsidePointer, true);
  }, 100);
}

mountZupLogbook();
