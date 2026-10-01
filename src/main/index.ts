import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initStorage, storage } from './store';
import { initAuthManager, authManager } from './auth-manager';
import { initAiService, aiService } from './ai-service';
import { initApiClient, apiClient } from './api-client';
import { AppSettings, LogbookDraft, ChatMessage } from '../types';

import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getPreloadPath(): string {
  const candidates = [
    path.join(__dirname, 'index.cjs'),
    path.join(__dirname, 'preload.cjs'),
    path.join(__dirname, 'index.mjs'),
    path.join(__dirname, 'preload.mjs'),
    path.join(__dirname, 'index.js'),
    path.join(__dirname, 'preload.js'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      console.log('Preload script localizado:', c);
      return c;
    }
  }
  return path.join(__dirname, 'index.cjs');
}

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 850,
    minWidth: 900,
    minHeight: 650,
    backgroundColor: '#0D0E12',
    title: 'Zup Logbook - Diário de Bordo Inteligente',
    webPreferences: {
      preload: getPreloadPath(),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Intercepta qualquer window.open e força abertura na MESMA janela via BrowserView
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log('Interceptado window.open para mesma janela:', url);
    if (mainWindow && !mainWindow.isDestroyed()) {
      authManager.openLogin(mainWindow);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('preload-error', (_event, preloadPath, error) => {
    console.error('PRELOAD ERROR:', preloadPath, error);
  });

  // Hot reload / Carregamento no modo desenvolvimento
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

import { setDynamicCompetences } from '../data/competences';

function registerIpcHandlers() {
  ipcMain.handle('auth:get-session', () => {
    return storage.getSession();
  });

  ipcMain.handle('auth:start-login', () => {
    console.log('IPC: auth:start-login recebido no processo Main');
    authManager.openLogin(mainWindow || undefined, (session) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('auth:status-changed', session);
      }
      if (session.token) {
        apiClient.fetchCompetences(true).then((comps) => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('competences:updated', comps);
          }
        }).catch(console.error);
      }
    });
    return true;
  });

  ipcMain.handle('auth:cancel-login', () => {
    console.log('IPC: auth:cancel-login recebido');
    authManager.closeLoginView();
    return true;
  });

  ipcMain.handle('auth:set-manual-token', (_event, token: string) => {
    const session = authManager.setManualToken(token);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('auth:status-changed', session);
    }
    if (session.token) {
      apiClient.fetchCompetences(true).then((comps) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('competences:updated', comps);
        }
      }).catch(console.error);
    }
    return session;
  });

  ipcMain.handle('auth:logout', async () => {
    await authManager.logout();
    const session = storage.getSession();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('auth:status-changed', session);
    }
    return session;
  });

  ipcMain.handle('settings:get', () => {
    return storage.getSettings();
  });

  ipcMain.handle('settings:save', (_event, newSettings: Partial<AppSettings>) => {
    return storage.updateSettings(newSettings);
  });

  ipcMain.handle(
    'ai:process-relato',
    async (_event, userInput: string, history: ChatMessage[]) => {
      return await aiService.processRelato(userInput, history);
    }
  );

  ipcMain.handle('logbook:submit', async (_event, draft: LogbookDraft) => {
    return await apiClient.submitLogbook(draft);
  });

  ipcMain.handle('competences:get', async (_event, forceRefresh = false) => {
    return await apiClient.fetchCompetences(forceRefresh);
  });
}

app.whenReady().then(() => {
  initStorage();
  initAuthManager();
  initAiService();
  initApiClient();

  const cachedComps = storage.getCachedCompetences();
  if (cachedComps && cachedComps.length > 0) {
    setDynamicCompetences(cachedComps);
  }

  registerIpcHandlers();
  createWindow();

  if (storage.getSession().token) {
    apiClient.fetchCompetences(true).catch(console.error);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
