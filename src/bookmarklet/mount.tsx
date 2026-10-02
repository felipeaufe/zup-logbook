import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../renderer/App';
import styles from '../renderer/styles/globals.css?inline';

const HOST_ID = 'zup-logbook-host';

export const LOGBOOK_FAVICON_DATA_URI =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjN0MzQUVEIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjNEY0NkU1Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTYiIGZpbGw9InVybCgjZykiLz48cGF0aCBkPSJNMTYgMjBjNC0yIDEwLTIgMTYgMnYyMmMtNi00LTEyLTQtMTYtMlYyMHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC45NSIvPjxwYXRoIGQ9Ik00OCAyMGMtNC0yLTEwLTItMTYgMnYyMmM2LTQgMTItNCAxNi0yVjIweiIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjg1Ii8+PHBhdGggZD0iTTMyIDIydjIyIiBzdHJva2U9IiM0RjQ2RTUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTQ3IDEzbDEuNSAzLjVMNTIgMThsLTMuNSAxLjVMNDcgMjNsLTEuNS0zLjVMNDIgMThsMy41LTEuNXoiIGZpbGw9IiNGQkJGMjQiLz48L3N2Zz4=';

function applyLogbookFavicon() {
  try {
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/svg+xml';
    link.href = LOGBOOK_FAVICON_DATA_URI;
  } catch {}
}

export function mountZupLogbook() {
  applyLogbookFavicon();
  const existingHost = document.getElementById(HOST_ID);
  if (existingHost) {
    // Alterna a visibilidade se já estiver montado na página
    if (existingHost.style.display === 'none') {
      existingHost.style.display = 'block';
    } else {
      existingHost.style.display = 'none';
    }
    return;
  }

  // Cria o container host fixado à direita da tela
  const host = document.createElement('div');
  host.id = HOST_ID;
  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.right = '0';
  host.style.left = 'auto';
  host.style.width = '100vw';
  host.style.maxWidth = '100vw';
  host.style.height = '100vh';
  host.style.zIndex = '2147483647'; // Fica acima de qualquer elemento da página
  host.style.boxShadow = '-8px 0 32px rgba(0, 0, 0, 0.6)';
  host.style.transition = 'width 0.25s ease-in-out, transform 0.25s ease-in-out';

  // Cria a Shadow DOM para isolar completamente o CSS do People Zup e do Tailwind
  const shadowRoot = host.attachShadow({ mode: 'open' });

  // Injeta o CSS compilado do Tailwind dentro do Shadow DOM
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    :host, *, ::before, ::after {
      box-sizing: border-box;
      --tw-gradient-from-position: 0%;
      --tw-gradient-via-position: 50%;
      --tw-gradient-to-position: 100%;
    }
    ${styles}
  `;
  shadowRoot.appendChild(styleEl);

  // Elemento raiz do React
  const rootContainer = document.createElement('div');
  rootContainer.style.width = '100%';
  rootContainer.style.height = '100%';
  rootContainer.style.display = 'flex';
  rootContainer.style.flexDirection = 'column';
  rootContainer.style.overflow = 'hidden';
  shadowRoot.appendChild(rootContainer);

  const reactRoot = ReactDOM.createRoot(rootContainer);
  reactRoot.render(
    <App
      onClose={() => {
        host.style.display = 'none';
      }}
    />
  );

  document.body.appendChild(host);
  console.log('🚀 Zup Logbook montado com sucesso via Bookmarklet!');
}

// Auto-executa ao ser injetado pelo bookmarklet
mountZupLogbook();
