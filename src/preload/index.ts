import { contextBridge, ipcRenderer } from 'electron';
import { AuthSession, AppSettings, LogbookDraft, ChatMessage, SubmissionResult, CompetenceItem } from '../types';

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

const electronAPI: ElectronAPI = {
  getSession: () => ipcRenderer.invoke('auth:get-session'),
  startLogin: () => ipcRenderer.invoke('auth:start-login'),
  cancelLogin: () => ipcRenderer.invoke('auth:cancel-login'),
  setManualToken: (token: string, refreshToken?: string) =>
    ipcRenderer.invoke('auth:set-manual-token', token, refreshToken),
  refreshToken: () => ipcRenderer.invoke('auth:refresh-token'),
  logout: () => ipcRenderer.invoke('auth:logout'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  processRelato: (userInput, history) => ipcRenderer.invoke('ai:process-relato', userInput, history),
  submitLogbook: (draft) => ipcRenderer.invoke('logbook:submit', draft),
  getCompetences: (forceRefresh = false) => ipcRenderer.invoke('competences:get', forceRefresh),
  onAuthStatusChanged: (callback) => {
    const handler = (_event: any, session: AuthSession) => callback(session);
    ipcRenderer.on('auth:status-changed', handler);
    return () => {
      ipcRenderer.removeListener('auth:status-changed', handler);
    };
  },
  onCompetencesUpdated: (callback) => {
    const handler = (_event: any, competences: CompetenceItem[]) => callback(competences);
    ipcRenderer.on('competences:updated', handler);
    return () => {
      ipcRenderer.removeListener('competences:updated', handler);
    };
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
