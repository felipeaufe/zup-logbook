import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { AppSettings, AuthSession, CompetenceItem } from '../types';
import {
  DEFAULT_INSTRUCTIONS,
  DEFAULT_LEADERSHIP_TEMPLATE,
  DEFAULT_NON_LEADERSHIP_TEMPLATE,
} from '../data/templates';

const DEFAULT_SETTINGS: AppSettings = {
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

class StorageService {
  private configPath: string;
  private settings: AppSettings = DEFAULT_SETTINGS;
  private session: AuthSession = {
    token: null,
    refreshToken: null,
    cookies: {},
    user: null,
    lastLogin: null,
    expiresAt: null,
    refreshExpiresAt: null,
  };
  private cachedCompetences: CompetenceItem[] = [];

  constructor() {
    const userDataPath = app.getPath('userData');
    this.configPath = path.join(userDataPath, 'zup-logbook-config.json');
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
        this.settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
        if (!this.settings.leadershipTemplate) {
          this.settings.leadershipTemplate = DEFAULT_LEADERSHIP_TEMPLATE;
        }
        if (!this.settings.nonLeadershipTemplate) {
          this.settings.nonLeadershipTemplate = DEFAULT_NON_LEADERSHIP_TEMPLATE;
        }
        if (!this.settings.customInstructions) {
          this.settings.customInstructions = DEFAULT_INSTRUCTIONS;
        }
        if (data.session && this.settings.saveSession) {
          this.session = { ...this.session, ...data.session };
        }
        if (Array.isArray(data.cachedCompetences)) {
          this.cachedCompetences = data.cachedCompetences;
        }
      }
    } catch (err) {
      console.error('Erro ao carregar configurações locais:', err);
    }
  }

  public save() {
    try {
      const data = {
        settings: this.settings,
        session: this.settings.saveSession ? this.session : null,
        cachedCompetences: this.cachedCompetences,
      };
      fs.writeFileSync(this.configPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Erro ao salvar configurações locais:', err);
    }
  }

  public getCachedCompetences(): CompetenceItem[] {
    return this.cachedCompetences;
  }

  public setCachedCompetences(competences: CompetenceItem[]) {
    this.cachedCompetences = competences;
    this.save();
  }

  public getSettings(): AppSettings {
    return this.settings;
  }

  public updateSettings(newSettings: Partial<AppSettings>): AppSettings {
    this.settings = { ...this.settings, ...newSettings };
    this.save();
    return this.settings;
  }

  public getSession(): AuthSession {
    // Verificar se o token expirou com base no expiresAt
    if (this.session.expiresAt) {
      const expTime = new Date(this.session.expiresAt).getTime();
      this.session.isExpired = Date.now() > expTime;
    }
    return this.session;
  }

  public updateSession(newSession: Partial<AuthSession>): AuthSession {
    this.session = { ...this.session, ...newSession };
    if (this.session.expiresAt) {
      const expTime = new Date(this.session.expiresAt).getTime();
      this.session.isExpired = Date.now() > expTime;
    }
    this.save();
    return this.session;
  }

  public clearSession(): void {
    this.session = {
      token: null,
      refreshToken: null,
      cookies: {},
      user: null,
      lastLogin: null,
      expiresAt: null,
      refreshExpiresAt: null,
      isExpired: false,
    };
    this.save();
  }
}

export let storage: StorageService;

export function initStorage() {
  if (!storage) {
    storage = new StorageService();
  }
  return storage;
}
