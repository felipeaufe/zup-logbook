import { AuthSession, AppSettings, LogbookDraft, ChatMessage, SubmissionResult, CompetenceItem } from '../types';
import { ALL_COMPETENCES } from '../data/competences';
import {
  DEFAULT_INSTRUCTIONS,
  DEFAULT_LEADERSHIP_TEMPLATE,
  DEFAULT_NON_LEADERSHIP_TEMPLATE,
} from '../data/templates';

declare global {
  interface Window {
    pywebview?: {
      api: any;
    };
    electronAPI: ElectronAPI;
  }
}

export interface ElectronAPI {
  getSession: () => Promise<AuthSession>;
  startLogin: () => Promise<boolean>;
  cancelLogin: () => Promise<boolean>;
  setManualToken: (token: string, refreshToken?: string) => Promise<AuthSession>;
  refreshToken: () => Promise<{ success: boolean; session: AuthSession }>;
  logout: () => Promise<AuthSession>;
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;
  processRelato: (userInput: string, history: ChatMessage[]) => Promise<{ message: string; draft?: LogbookDraft }>;
  submitLogbook: (draft: LogbookDraft) => Promise<SubmissionResult>;
  getCompetences: (forceRefresh?: boolean) => Promise<CompetenceItem[]>;
  onAuthStatusChanged: (callback: (session: AuthSession) => void) => () => void;
  onCompetencesUpdated: (callback: (competences: CompetenceItem[]) => void) => () => void;
}

// Aguarda a disponibilidade do bridge do pywebview
function getPyApi(): Promise<any> {
  if (window.pywebview && window.pywebview.api) {
    return Promise.resolve(window.pywebview.api);
  }

  return new Promise((resolve) => {
    let resolved = false;

    const onReady = () => {
      if (!resolved && window.pywebview && window.pywebview.api) {
        resolved = true;
        resolve(window.pywebview.api);
      }
    };

    window.addEventListener('pywebviewready', onReady, { once: true });

    // Fallback polling para garantir resolução rápida
    const interval = setInterval(() => {
      if (window.pywebview && window.pywebview.api) {
        clearInterval(interval);
        if (!resolved) {
          resolved = true;
          resolve(window.pywebview.api);
        }
      }
    }, 50);

    // Timeout de 2s para ambiente de desenvolvimento sem pywebview
    setTimeout(() => {
      clearInterval(interval);
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    }, 2000);
  });
}

// Mock fallback em memória para testes no navegador
let mockSession: AuthSession = {
  token: null,
  cookies: {},
  user: null,
  lastLogin: null,
  expiresAt: null,
};

let mockSettings: AppSettings = {
  aiProvider: 'stackspot',
  stackspotClientId: '',
  stackspotClientSecret: '',
  stackspotRealm: 'zup',
  stackspotSlug: '',
  aiApiKey: '',
  aiModel: 'gemini-2.5-flash',
  peopleBaseUrl: 'https://people.zup.com.br',
  logbookEndpoint: 'https://apiznt.zenity.zup.com.br/dune/v1/entry',
  customInstructions: DEFAULT_INSTRUCTIONS,
  leadershipTemplate: DEFAULT_LEADERSHIP_TEMPLATE,
  nonLeadershipTemplate: DEFAULT_NON_LEADERSHIP_TEMPLATE,
  saveSession: true,
};

export const pythonBridgeAPI: ElectronAPI = {
  async getSession(): Promise<AuthSession> {
    const api = await getPyApi();
    if (api && api.getSession) {
      return await api.getSession();
    }
    return mockSession;
  },

  async startLogin(): Promise<boolean> {
    const api = await getPyApi();
    if (api && api.startLogin) {
      return await api.startLogin();
    }
    return false;
  },

  async cancelLogin(): Promise<boolean> {
    const api = await getPyApi();
    if (api && api.cancelLogin) {
      return await api.cancelLogin();
    }
    return true;
  },

  async setManualToken(token: string, refreshToken?: string): Promise<AuthSession> {
    const api = await getPyApi();
    if (api && api.setManualToken) {
      return await api.setManualToken(token, refreshToken);
    }
    mockSession = {
      ...mockSession,
      token,
      refreshToken,
      user: { name: 'Zupper Dev' },
      lastLogin: new Date().toISOString(),
    };
    return mockSession;
  },

  async refreshToken(): Promise<{ success: boolean; session: AuthSession }> {
    const api = await getPyApi();
    if (api && api.refreshToken) {
      return await api.refreshToken();
    }
    return { success: false, session: mockSession };
  },

  async logout(): Promise<AuthSession> {
    const api = await getPyApi();
    if (api && api.logout) {
      return await api.logout();
    }
    mockSession = {
      token: null,
      cookies: {},
      user: null,
      lastLogin: null,
      expiresAt: null,
    };
    return mockSession;
  },

  async getSettings(): Promise<AppSettings> {
    const api = await getPyApi();
    if (api && api.getSettings) {
      return await api.getSettings();
    }
    return mockSettings;
  },

  async saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const api = await getPyApi();
    if (api && api.saveSettings) {
      return await api.saveSettings(settings);
    }
    mockSettings = { ...mockSettings, ...settings };
    return mockSettings;
  },

  async processRelato(userInput: string, history: ChatMessage[]): Promise<{ message: string; draft?: LogbookDraft }> {
    const api = await getPyApi();
    if (api && api.processRelato) {
      return await api.processRelato(userInput, history);
    }
    throw new Error('Serviço Python de IA não conectado.');
  },

  async submitLogbook(draft: LogbookDraft): Promise<SubmissionResult> {
    const api = await getPyApi();
    if (api && api.submitLogbook) {
      return await api.submitLogbook(draft);
    }
    return { success: false, message: 'Serviço Python de API People Zup não conectado.' };
  },

  async getCompetences(forceRefresh = false): Promise<CompetenceItem[]> {
    const api = await getPyApi();
    if (api && api.getCompetences) {
      return await api.getCompetences(forceRefresh);
    }
    return ALL_COMPETENCES;
  },

  onAuthStatusChanged(callback: (session: AuthSession) => void): () => void {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<AuthSession>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      }
    };
    window.addEventListener('py:auth-status-changed', handler);
    return () => {
      window.removeEventListener('py:auth-status-changed', handler);
    };
  },

  onCompetencesUpdated(callback: (competences: CompetenceItem[]) => void): () => void {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<CompetenceItem[]>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      }
    };
    window.addEventListener('py:competences-updated', handler);
    return () => {
      window.removeEventListener('py:competences-updated', handler);
    };
  },
};

// Expõe globalmente como window.electronAPI para preservar 100% de compatibilidade com os componentes
window.electronAPI = pythonBridgeAPI;
