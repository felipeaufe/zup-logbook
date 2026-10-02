import { AppSettings, AuthSession, CompetenceItem } from '../types';
import {
  DEFAULT_INSTRUCTIONS,
  DEFAULT_LEADERSHIP_TEMPLATE,
  DEFAULT_NON_LEADERSHIP_TEMPLATE,
} from '../data/templates';

const STORAGE_KEYS = {
  SETTINGS: 'zup_logbook_settings',
  SESSION: 'zup_logbook_session',
  COMPETENCES: 'zup_logbook_competences',
};

const DEFAULT_SETTINGS: AppSettings = {
  aiProvider: 'stackspot',
  stackspotClientId: '',
  stackspotClientSecret: '',
  stackspotRealm: 'zup',
  stackspotSlug: '',
  stackspotToken: '',
  aiApiKey: '',
  aiModel: 'gemini-2.5-flash',
  peopleBaseUrl: 'https://people.zup.com.br',
  logbookEndpoint: 'https://apiznt.zenity.zup.com.br/dune/v1/entry',
  customInstructions: DEFAULT_INSTRUCTIONS,
  leadershipTemplate: DEFAULT_LEADERSHIP_TEMPLATE,
  nonLeadershipTemplate: DEFAULT_NON_LEADERSHIP_TEMPLATE,
  saveSession: true,
};

class BrowserStorageService {
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
    this.load();
  }

  private load() {
    try {
      const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (rawSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) };
      }
      if (!this.settings.leadershipTemplate) {
        this.settings.leadershipTemplate = DEFAULT_LEADERSHIP_TEMPLATE;
      }
      if (!this.settings.nonLeadershipTemplate) {
        this.settings.nonLeadershipTemplate = DEFAULT_NON_LEADERSHIP_TEMPLATE;
      }
      if (!this.settings.customInstructions) {
        this.settings.customInstructions = DEFAULT_INSTRUCTIONS;
      }

      const rawSession = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (rawSession && this.settings.saveSession) {
        this.session = { ...this.session, ...JSON.parse(rawSession) };
      }

      const rawComps = localStorage.getItem(STORAGE_KEYS.COMPETENCES);
      if (rawComps) {
        this.cachedCompetences = JSON.parse(rawComps);
      }
    } catch (e) {
      console.warn('Erro ao carregar dados do localStorage:', e);
    }
  }

  public save() {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
      if (this.settings.saveSession) {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(this.session));
      } else {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
      localStorage.setItem(STORAGE_KEYS.COMPETENCES, JSON.stringify(this.cachedCompetences));
    } catch (e) {
      console.warn('Erro ao salvar dados no localStorage:', e);
    }
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

  public getCachedCompetences(): CompetenceItem[] {
    return this.cachedCompetences;
  }

  public setCachedCompetences(competences: CompetenceItem[]) {
    this.cachedCompetences = competences;
    this.save();
  }
}

export const storage = new BrowserStorageService();
