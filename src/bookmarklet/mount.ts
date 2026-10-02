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

function parseLogbookText(raw: string) {
  const text = raw.trim();
  const descIdx = text.search(/descri[cç][aã]o:/i);
  const compIdx = text.search(/compet[eê]ncias:/i);

  let title = '';
  if (descIdx !== -1) {
    const rawTitlePart = text.slice(0, descIdx);
    const lines = rawTitlePart.replace(/t[ií]tulo:\s*/i, '').trim().split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    title = lines[0] || '';
  } else {
    title = text.split(/\r?\n/)[0]?.replace(/t[ií]tulo:\s*/i, '').trim() || '';
  }

  let descText = '';
  if (descIdx !== -1) {
    descText = compIdx !== -1 ? text.slice(descIdx, compIdx) : text.slice(descIdx);
    descText = descText.replace(/descri[cç][aã]o:\s*/i, '').trim();
  }

  let compText = '';
  if (compIdx !== -1) {
    compText = text.slice(compIdx).replace(/compet[eê]ncias:\s*/i, '').trim();
  }

  const rawBlocks = descText ? descText.split(/[\r\n]+\s*-{3,}\s*[\r\n]+/) : [];
  const formattedContent: any[] = [];
  const plainBlocks: string[] = [];

  for (let i = 0; i < rawBlocks.length; i++) {
    const block = rawBlocks[i].trim();
    if (!block) continue;
    const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    const topicTitle = lines[0];
    const topicDesc = lines.slice(1).join('\n');

    formattedContent.push({
      type: 'paragraph',
      children: [{ text: topicTitle, bold: true }],
    });

    if (topicDesc) {
      formattedContent.push({
        type: 'paragraph',
        children: [{ text: topicDesc }],
      });
      plainBlocks.push(`${topicTitle}\n${topicDesc}`);
    } else {
      plainBlocks.push(topicTitle);
    }

    if (i < rawBlocks.length - 1) {
      formattedContent.push({
        type: 'paragraph',
        children: [{ text: '', bold: true }],
      });
    }
  }

  const competences: any[] = [];
  if (compText) {
    const compLines = compText.split(/[\r\n]+/).map((l) => l.replace(/^[-*•\d.)\s]+/, '').trim()).filter(Boolean);
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
      templateFor: /lideran[cç]a/i.test(text) && !/n[aã]o\s*lideran[cç]a/i.test(text) ? 'LEADERSHIP' : 'NON_LEADERSHIP',
    },
    competences,
  };
}

let capturedToken: string | null = null;
try {
  if (typeof window !== 'undefined') {
    const origFetch = window.fetch;
    window.fetch = async function (...args) {
      try {
        const init = args[1];
        let h: string | null = null;
        if (init?.headers) {
          if (init.headers instanceof Headers) h = init.headers.get('Authorization') || init.headers.get('authorization');
          else if (Array.isArray(init.headers)) {
            const found = init.headers.find(([k]) => k.toLowerCase() === 'authorization');
            if (found) h = found[1];
          } else if (typeof init.headers === 'object') {
            h = (init.headers as any).Authorization || (init.headers as any).authorization;
          }
        }
        if (h && h.toLowerCase().startsWith('bearer ')) {
          const t = h.replace(/^bearer\s+/i, '').trim();
          if (t.length > 20) capturedToken = t;
        }
      } catch {}
      return origFetch.apply(this, args);
    };

    const origSetHeader = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function (name: string, val: string) {
      try {
        if (name?.toLowerCase() === 'authorization' && val?.toLowerCase().startsWith('bearer ')) {
          const t = val.replace(/^bearer\s+/i, '').trim();
          if (t.length > 20) capturedToken = t;
        }
      } catch {}
      return origSetHeader.apply(this, [name, val]);
    };
  }
} catch {}

function getAuthToken(): string | null {
  if (capturedToken) return capturedToken;
  if (typeof window === 'undefined') return null;

  const win = window as any;
  if (win.keycloak?.token) return win.keycloak.token;

  const candidates: { token: string; exp: number }[] = [];
  const check = (str: string) => {
    if (!str || typeof str !== 'string') return;
    const matches = str.match(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g);
    if (!matches) return;
    for (const m of matches) {
      try {
        const p = JSON.parse(atob(m.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        candidates.push({ token: m, exp: p.exp ? p.exp * 1000 : Infinity });
      } catch {}
    }
  };

  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k) check(sessionStorage.getItem(k) || '');
    }
  } catch {}

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) check(localStorage.getItem(k) || '');
    }
  } catch {}

  try { check(document.cookie); } catch {}

  for (const k of ['keycloak', '_keycloak', 'kc', 'auth', 'currentUser', '__PRELOADED_STATE__']) {
    try { if (win[k]) check(typeof win[k] === 'string' ? win[k] : JSON.stringify(win[k])); } catch {}
  }

  if (candidates.length > 0) {
    const now = Date.now();
    const valid = candidates.filter((c) => c.exp > now);
    return valid.length > 0 ? valid[0].token : candidates[0].token;
  }
  return null;
}

export function mountZupLogbook() {
  const existing = document.getElementById(HOST_ID);
  if (existing) {
    if (existing.style.display === 'none') {
      existing.style.display = 'block';
      setTimeout(() => {
        const ta = existing.shadowRoot?.querySelector('textarea');
        ta?.focus();
      }, 50);
    } else {
      existing.style.display = 'none';
    }
    return;
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
      padding: 16px;
      gap: 10px;
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
    <textarea placeholder="Cole o texto ou JSON do relato aqui..." autofocus></textarea>
    <div class="status"></div>
    <button class="submit-btn" type="button" disabled>Enviar</button>
  `;
  shadow.appendChild(modal);

  const closeBtn = modal.querySelector('.close-btn') as HTMLButtonElement;
  const textarea = modal.querySelector('textarea') as HTMLTextAreaElement;
  const statusEl = modal.querySelector('.status') as HTMLDivElement;
  const submitBtn = modal.querySelector('.submit-btn') as HTMLButtonElement;

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
      payload = parseLogbookText(val);
    }

    if (!payload || (!payload.title && !payload.content)) {
      showStatus('error', 'Não foi possível identificar o título ou conteúdo do relato.');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      showStatus('error', 'Token de autenticação não encontrado na página.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    clearStatus();

    try {
      const res = await fetch('https://apiznt.zenity.zup.com.br/dune/v1/entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
          authorization: `Bearer ${token}`,
        },
        credentials: 'omit',
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch { data = { text }; }

      if (res.ok) {
        showStatus('success', `Relato${data?.id ? ` #${data.id}` : ''} enviado com sucesso!`);
        textarea.value = '';
        submitBtn.disabled = true;
      } else {
        const msg = data?.message || data?.error || text || `Status HTTP ${res.status}`;
        showStatus('error', `Falha (${res.status}): ${msg}`);
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
  setTimeout(() => {
    textarea.focus();
    window.addEventListener('pointerdown', onOutsidePointer, true);
  }, 100);
}

mountZupLogbook();
