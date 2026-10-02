let capturedToken: string | null = null;

try {
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      try {
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
            capturedToken = token;
          }
        }
      } catch {}
      return originalFetch.apply(this, args);
    };

    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function (header: string, value: string) {
      try {
        if (header && header.toLowerCase() === 'authorization' && value && value.toLowerCase().startsWith('bearer ')) {
          const token = value.replace(/^bearer\s+/i, '').trim();
          if (token && token.length > 20) {
            capturedToken = token;
          }
        }
      } catch {}
      return originalSetRequestHeader.apply(this, [header, value]);
    };
  }
} catch {}

function extractAllJwtsFromString(raw: string): string[] {
  if (!raw || typeof raw !== 'string') return [];
  const matches = raw.match(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g);
  return matches || [];
}

export function getAuthToken(): string | null {
  if (capturedToken) return capturedToken;
  if (typeof window === 'undefined') return null;

  const win = window as any;
  if (win.keycloak?.token) return win.keycloak.token;

  const candidates: { token: string; exp: number }[] = [];

  const checkString = (str: string) => {
    const jwts = extractAllJwtsFromString(str);
    for (const jwt of jwts) {
      try {
        const parts = jwt.split('.');
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        candidates.push({
          token: jwt,
          exp: payload.exp ? payload.exp * 1000 : Infinity,
        });
      } catch {}
    }
  };

  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const val = sessionStorage.getItem(key);
        if (val) checkString(val);
      }
    }
  } catch {}

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key);
        if (val) checkString(val);
      }
    }
  } catch {}

  try {
    checkString(document.cookie);
  } catch {}

  for (const k of ['keycloak', '_keycloak', 'kc', 'auth', 'currentUser', '__PRELOADED_STATE__']) {
    try {
      if (win[k]) {
        checkString(typeof win[k] === 'string' ? win[k] : JSON.stringify(win[k]));
      }
    } catch {}
  }

  if (candidates.length > 0) {
    const now = Date.now();
    const valid = candidates.filter((c) => c.exp > now);
    if (valid.length > 0) return valid[0].token;
    return candidates[0].token;
  }

  return null;
}
