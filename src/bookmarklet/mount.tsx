import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../renderer/App';
import styles from '../renderer/styles/globals.css?inline';

const HOST_ID = 'zup-logbook-host';

export function mountZupLogbook() {
  const existingHost = document.getElementById(HOST_ID);
  if (existingHost) {
    if (existingHost.style.display === 'none') {
      existingHost.style.display = 'block';
    } else {
      existingHost.style.display = 'none';
    }
    return;
  }

  // Cria o container host flutuante no canto superior direito
  const host = document.createElement('div');
  host.id = HOST_ID;
  host.style.position = 'fixed';
  host.style.top = '24px';
  host.style.right = '24px';
  host.style.width = '440px';
  host.style.maxWidth = 'calc(100vw - 48px)';
  host.style.zIndex = '2147483647';
  host.style.borderRadius = '16px';
  host.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.6)';
  host.style.transition = 'opacity 0.2s ease-in-out';

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

  const rootContainer = document.createElement('div');
  rootContainer.style.width = '100%';
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
  console.log('🚀 Zup Logbook (Simplificado) montado com sucesso via Bookmarklet!');
}

// Auto-executa ao ser injetado pelo bookmarklet
mountZupLogbook();
