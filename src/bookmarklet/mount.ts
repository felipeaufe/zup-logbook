import { authService } from '../services/auth';
import { storage } from '../services/storage';

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

  if (formattedContent.length === 0) {
    const lines = text.split(/\r?\n/).filter(Boolean);
    const bodyText = text.trim();
    return {
      title: title || 'Registro',
      formattedContent: (lines.length > 0 ? lines : [text]).map((l) => ({
        type: 'paragraph',
        children: [{ text: l }],
      })),
      content: bodyText || title,
      isPerformanceReview: false,
    };
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

export function mountZupLogbook() {
  const existing = document.getElementById(HOST_ID);
  if (existing) {
    if (existing.style.display === 'none') {
      existing.style.display = 'block';
      existing.dispatchEvent(new CustomEvent('zup-open'));
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
      max-width: 230px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .session-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .session-refresh-btn {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 11px;
      padding: 2px;
      line-height: 1;
      transition: transform 0.2s, color 0.2s;
    }
    .session-refresh-btn:hover {
      color: #fff;
      transform: rotate(90deg);
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
    .manual-refresh-btn {
      background: #252836;
      color: #e2e8f0;
      border: 1px solid #3b4261;
      padding: 4px 6px;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
      line-height: 1;
    }
    .manual-refresh-btn:hover {
      background: #32374a;
      color: #fff;
    }
    .manual-clear-btn {
      background: #252836;
      color: #94a3b8;
      border: none;
      padding: 4px 6px;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
      line-height: 1;
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
      <div class="session-actions">
        <button class="session-refresh-btn" type="button" title="Atualizar sessão e testar token">🔄</button>
        <button class="session-toggle-btn" type="button">Chave manual</button>
      </div>
    </div>
    <div class="manual-box">
      <input type="password" class="manual-input" placeholder="Cole o Bearer token aqui..." />
      <button class="manual-apply-btn" type="button">Salvar</button>
      <button class="manual-refresh-btn" type="button" title="Recarregar e validar token">🔄</button>
      <button class="manual-clear-btn" type="button" title="Limpar token manual">✕</button>
    </div>
    <textarea placeholder="Cole o Markdown ou texto do relato aqui..." autofocus></textarea>
    <div class="status"></div>
    <button class="submit-btn" type="button" disabled>Enviar</button>
  `;
  shadow.appendChild(modal);

  const closeBtn = modal.querySelector('.close-btn') as HTMLButtonElement;
  const sessionBadge = modal.querySelector('.session-badge') as HTMLSpanElement;
  const sessionRefreshBtn = modal.querySelector('.session-refresh-btn') as HTMLButtonElement;
  const sessionToggleBtn = modal.querySelector('.session-toggle-btn') as HTMLButtonElement;
  const manualBox = modal.querySelector('.manual-box') as HTMLDivElement;
  const manualInput = modal.querySelector('.manual-input') as HTMLInputElement;
  const manualApplyBtn = modal.querySelector('.manual-apply-btn') as HTMLButtonElement;
  const manualRefreshBtn = modal.querySelector('.manual-refresh-btn') as HTMLButtonElement;
  const manualClearBtn = modal.querySelector('.manual-clear-btn') as HTMLButtonElement;
  const textarea = modal.querySelector('textarea') as HTMLTextAreaElement;
  const statusEl = modal.querySelector('.status') as HTMLDivElement;
  const submitBtn = modal.querySelector('.submit-btn') as HTMLButtonElement;

  const updateSessionUI = async (forceRefresh = false) => {
    let session = storage.getSession();
    if (forceRefresh || !session.token) {
      session = authService.detectSessionFromPage(forceRefresh);
    }
    if (session.token && !session.isExpired) {
      const mins = session.expiresAt
        ? Math.max(0, Math.round((new Date(session.expiresAt).getTime() - Date.now()) / 60000))
        : 5;
      const user = session.user?.name || session.user?.email?.split('@')[0] || 'Sessão ativa';
      sessionBadge.textContent = `🟢 ${user} (${mins}m)`;
      sessionBadge.style.color = '#4ade80';
      sessionBadge.title = session.expiresAt ? `Expira às ${new Date(session.expiresAt).toLocaleTimeString()}` : 'Sessão ativa';
    } else if (session.token && session.isExpired) {
      sessionBadge.textContent = '🔴 Sessão expirada (clique 🔄)';
      sessionBadge.style.color = '#f87171';
      sessionBadge.title = session.expiresAt ? `Expirou às ${new Date(session.expiresAt).toLocaleTimeString()}` : 'Expirado';
    } else {
      sessionBadge.textContent = '⚪ Token não detectado';
      sessionBadge.style.color = '#94a3b8';
      sessionBadge.title = 'Nenhum token encontrado na página.';
    }
  };

  authService.onAuthStatusChanged(() => {
    updateSessionUI();
  });

  const handleRefresh = async () => {
    sessionBadge.textContent = '🔄 Atualizando...';
    sessionBadge.style.color = '#818cf8';
    const refreshed = await authService.refreshAccessToken();
    if (!refreshed) {
      authService.detectSessionFromPage(true);
    }
    await updateSessionUI();
    const current = storage.getSession();
    if (current.token && !current.isExpired) {
      showStatus('success', 'Sessão atualizada!');
    } else {
      showStatus('error', 'Não foi possível renovar automaticamente. Atualize a página (F5) ou use a chave manual.');
    }
    setTimeout(clearStatus, 3000);
  };

  sessionRefreshBtn.onclick = (e) => {
    e.stopPropagation();
    handleRefresh();
  };

  manualRefreshBtn.onclick = (e) => {
    e.stopPropagation();
    handleRefresh();
  };

  sessionToggleBtn.onclick = () => {
    const isHidden = manualBox.style.display === 'none' || !manualBox.style.display;
    manualBox.style.display = isHidden ? 'flex' : 'none';
    if (isHidden) {
      const current = storage.getSession();
      manualInput.value = current.token || '';
      manualInput.focus();
    }
  };

  manualApplyBtn.onclick = async () => {
    const val = manualInput.value.trim().replace(/^bearer\s+/i, '');
    if (val) {
      authService.setManualToken(val);
      manualBox.style.display = 'none';
      await updateSessionUI();
      showStatus('success', 'Chave manual salva e validada com sucesso!');
      setTimeout(clearStatus, 3000);
    }
  };

  manualClearBtn.onclick = async () => {
    authService.logout();
    manualInput.value = '';
    manualBox.style.display = 'none';
    await updateSessionUI();
    showStatus('success', 'Chave manual removida.');
    setTimeout(clearStatus, 3000);
  };

  const close = () => {
    host.style.display = 'none';
  };

  const onOutsidePointer = (e: PointerEvent) => {
    if (host.style.display === 'none') return;
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

  host.addEventListener('zup-open', () => {
    updateSessionUI();
    setTimeout(() => {
      textarea.focus();
    }, 50);
  });

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

    let session = storage.getSession();
    if (!session.token || session.isExpired) {
      session = authService.detectSessionFromPage(true);
    }

    if (session.isExpired && session.refreshToken) {
      submitBtn.textContent = 'Renovando sessão...';
      await authService.refreshAccessToken();
      session = storage.getSession();
    }

    if (!session.token) {
      showStatus(
        'error',
        'Token de autenticação não encontrado. Atualize a página do People (F5) ou use a "Chave manual" acima.'
      );
      submitBtn.textContent = 'Enviar';
      submitBtn.disabled = !textarea.value.trim();
      return;
    }

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
      let result = await doSubmit(session.token);

      // Se falhar com 401, 403 ou "explicit deny" / "not authorized" / "expired", tenta renovar via refresh token ou SSO e reenvia uma vez
      if (!result.ok && (result.status === 401 || result.status === 403 || result.text.includes('not authorized') || result.text.includes('deny') || result.text.toLowerCase().includes('expired'))) {
        submitBtn.textContent = 'Renovando sessão...';
        const renewed = await authService.refreshAccessToken();
        if (renewed) {
          const freshSession = storage.getSession();
          if (freshSession.token) {
            submitBtn.textContent = 'Reenviando...';
            result = await doSubmit(freshSession.token);
          }
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

(window as any).ZupLogbook = { mountZupLogbook };
mountZupLogbook();
