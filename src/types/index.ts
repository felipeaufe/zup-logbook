export interface CompetenceItem {
  id: number;
  name: string;
}

export interface AuthSession {
  token: string | null;
  cookies: Record<string, string>;
  user: {
    name?: string;
    email?: string;
    avatarUrl?: string;
  } | null;
  lastLogin: string | null;
  expiresAt: string | null;
  isExpired?: boolean;
}

export interface FormattedBlock {
  title: string;
  description: string;
}

export interface LogbookDraft {
  title: string;
  blocks: FormattedBlock[];
  content: string; // Plain text
  templateFor: 'NON_LEADERSHIP' | 'LEADERSHIP';
  isPerformanceReview: boolean;
  competences: CompetenceItem[];
  hours?: number;
  rawInput: string;
  type?: 'performance' | 'livre';
}

export interface AppSettings {
  aiProvider: 'stackspot' | 'gemini' | 'openai';
  // StackSpot AI
  stackspotClientId: string;
  stackspotClientSecret: string;
  stackspotRealm: string;
  stackspotSlug: string;
  stackspotToken?: string;
  // Gemini / OpenAI fallback
  aiApiKey: string;
  aiModel: string;
  // People Zup API
  peopleBaseUrl: string;
  logbookEndpoint: string;
  customInstructions: string;
  leadershipTemplate?: string;
  nonLeadershipTemplate?: string;
  saveSession: boolean;
  capturedHeaders?: Record<string, string>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  draft?: LogbookDraft;
  status?: 'thinking' | 'pending_approval' | 'submitting' | 'submitted' | 'error';
  promptChoices?: {
    type: 'performance' | 'livre';
    label: string;
    description?: string;
  }[];
  pendingRawInput?: string;
  error?: string;
  apiResponse?: any;
}

export interface SubmissionResult {
  success: boolean;
  message: string;
  responseStatus?: number;
  data?: any;
  refreshedToken?: boolean;
}
