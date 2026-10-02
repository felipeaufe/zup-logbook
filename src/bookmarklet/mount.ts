import { getAuthToken } from '../services/auth';

const HOST_ID = 'zup-logbook-host';

export function mountZupLogbook() {
  const existing = document.getElementById(HOST_ID);
  if (existing) {
    existing.style.display = existing.style.display === 'none' ? 'block' : 'none';
    return;
  }

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.style.position = 'fixed';
  host.style.top = '24px';
  host.style.right = '24px';
  host.style.zIndex = '2147483647';
  host.style.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';

  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}.card{width:440px;max-width:calc(100vw - 48px);background:#12141c;color:#f3f4f6;border-radius:16px;border:1px solid #1f2937;box-shadow:0 20px 40px rgba(0,0,0,.6);padding:20px;display:flex;flex-direction:column;gap:14px;font-size:14px;user-select:none}.header{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1f2937;padding-bottom:12px}.title-group{display:flex;align-items:center;gap:8px}.dot{width:8px;height:8px;border-radius:50%;background:#a855f7}.title{font-size:15px;font-weight:600;color:#fff}.badge{font-size:11px;background:rgba(88,28,135,.4);color:#d8b4fe;padding:2px 8px;border-radius:9999px;border:1px solid rgba(126,34,206,.3)}.close-btn{background:transparent;border:none;color:#9ca3af;cursor:pointer;padding:4px;border-radius:6px;display:flex;align-items:center;justify-content:center;transition:background .15s,color .15s}.close-btn:hover{background:#1f2937;color:#fff}.field{display:flex;flex-direction:column;gap:6px}.label{font-size:12px;font-weight:500;color:#9ca3af}.textarea{width:100%;height:140px;background:#0a0b10;border:1px solid #374151;border-radius:12px;padding:12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;color:#e9d5ff;resize:vertical;outline:none;transition:border-color .15s}.textarea:focus{border-color:#a855f7}.hint{font-size:11px;color:#6b7280;text-align:right}.status{display:none;align-items:flex-start;gap:8px;padding:10px 12px;border-radius:12px;font-size:12px;line-height:1.4;word-break:break-word}.status.success{display:flex;background:rgba(6,78,59,.4);border:1px solid rgba(16,185,129,.3);color:#6ee7b7}.status.error{display:flex;background:rgba(136,19,55,.4);border:1px solid rgba(244,63,94,.3);color:#fda4af}.submit-btn{width:100%;padding:10px 16px;border-radius:12px;background:linear-gradient(135deg,#9333ea,#4f46e5);color:#fff;font-size:13px;font-weight:600;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 10px 20px rgba(147,51,234,.2);transition:transform .1s,opacity .15s}.submit-btn:hover:not(:disabled){filter:brightness(1.1)}.submit-btn:active:not(:disabled){transform:scale(.99)}.submit-btn:disabled{opacity:.5;cursor:not-allowed}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.spinner{animation:spin 1s linear infinite}';
  shadow.appendChild(style);

  const container = document.createElement('div');
  container.className = 'card';
  container.innerHTML = '<div class="header"><div class="title-group"><div class="dot"></div><div class="title">Zup Logbook</div><div class="badge">Registro de Performance</div></div><button class="close-btn" type="button" aria-label="Fechar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div><div class="field"><label class="label">Cole o JSON do relato:</label><textarea class="textarea" placeholder=\'{"title": "...", "content": "...", "competences": [...]}\'></textarea><div class="hint">Pressione Ctrl+Enter para enviar</div></div><div class="status"></div><button class="submit-btn" type="button" disabled><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg><span>Enviar para o People</span></button>';
  shadow.appendChild(container);

  const closeBtn = container.querySelector('.close-btn') as HTMLButtonElement;
  const textarea = container.querySelector('.textarea') as HTMLTextAreaElement;
  const statusEl = container.querySelector('.status') as HTMLDivElement;
  const submitBtn = container.querySelector('.submit-btn') as HTMLButtonElement;

  closeBtn.onclick = () => {
    host.style.display = 'none';
  };

  const showStatus = (type: 'success' | 'error', text: string) => {
    statusEl.className = `status ${type}`;
    const iconSvg = type === 'success'
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    statusEl.innerHTML = `${iconSvg}<span>${text}</span>`;
  };

  const clearStatus = () => {
    statusEl.className = 'status';
    statusEl.innerHTML = '';
  };

  textarea.oninput = () => {
    submitBtn.disabled = !textarea.value.trim();
    clearStatus();
  };

  const send = async () => {
    const val = textarea.value.trim();
    if (!val) {
      showStatus('error', 'Por favor, cole o JSON do relato antes de enviar.');
      return;
    }

    try {
      JSON.parse(val);
    } catch (e: any) {
      showStatus('error', `JSON inválido: ${e.message}`);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      showStatus('error', 'Token de autenticação não encontrado. Certifique-se de estar logado no People Zup.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg><span>Enviando...</span>';
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
        body: val,
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { text };
      }

      if (res.ok) {
        showStatus('success', `Diário de Bordo${data?.id ? ` #${data.id}` : ''} registrado com sucesso no People Zup!`);
        textarea.value = '';
        submitBtn.disabled = true;
      } else {
        const msg = data?.message || data?.error || text || `Status HTTP ${res.status}`;
        showStatus('error', `Falha ao registrar (${res.status}): ${msg}`);
      }
    } catch (err: any) {
      showStatus('error', `Erro de conexão com People Zup: ${err.message}`);
    } finally {
      submitBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg><span>Enviar para o People</span>';
      submitBtn.disabled = !textarea.value.trim();
    }
  };

  submitBtn.onclick = () => send();

  textarea.onkeydown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      send();
    }
  };

  document.body.appendChild(host);
}

mountZupLogbook();
