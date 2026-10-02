import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../renderer/App';
import styles from '../renderer/styles/globals.css?inline';

const HOST_ID = 'zup-logbook-host';

export function mountZupLogbook() {
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
