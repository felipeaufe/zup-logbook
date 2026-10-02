import React, { useState, useEffect } from 'react';
import { AuthSession, AppSettings, ChatMessage, LogbookDraft, CompetenceItem } from '../types';
import { ALL_COMPETENCES } from '../data/competences';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatInterface } from './components/ChatInterface';
import { SettingsModal } from './components/SettingsModal';
import { Toast } from './components/Toast';
import {
  DEFAULT_INSTRUCTIONS,
  DEFAULT_LEADERSHIP_TEMPLATE,
  DEFAULT_NON_LEADERSHIP_TEMPLATE,
} from '../data/templates';
import { storage } from '../services/storage';
import { authService } from '../services/auth';
import { apiClient } from '../services/api-client';
import { aiService } from '../services/ai-service';

function cleanErrorMessage(err: any): string {
  const msg = err?.message || String(err || '');
  return msg
    .replace(/^Error invoking remote method '[^']+':\s*/i, '')
    .replace(/^Error:\s*/i, '')
    .trim();
}

function createLivreDraft(userInput: string): LogbookDraft {
  const hoursMatch = userInput.match(/(\d+)\s*(?:h|horas|hrs|hora)/i);
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 8;

  return {
    title: '',
    blocks: [],
    content: userInput,
    templateFor: 'NON_LEADERSHIP',
    isPerformanceReview: false,
    competences: [],
    hours,
    rawInput: userInput,
    type: 'livre',
  };
}

function createPerformanceDraft(userInput: string, existingDraft?: LogbookDraft): LogbookDraft {
  const hoursMatch = userInput.match(/(\d+)\s*(?:h|horas|hrs|hora)/i);
  const hours = existingDraft?.hours || (hoursMatch ? parseInt(hoursMatch[1], 10) : 8);

  return {
    title: existingDraft?.title || '',
    blocks: existingDraft?.blocks || [],
    content: existingDraft?.content || userInput,
    templateFor: existingDraft?.templateFor || 'NON_LEADERSHIP',
    isPerformanceReview: true,
    competences: existingDraft?.competences || [],
    hours,
    rawInput: userInput,
    type: 'performance',
  };
}

interface AppProps {
  onClose?: () => void;
}

export const App: React.FC<AppProps> = ({ onClose }) => {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'chat'>('welcome');
  const [session, setSession] = useState<AuthSession>(storage.getSession());
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(
    null
  );
  const [activeMode, setActiveMode] = useState<'performance' | 'livre' | null>(null);
  const [competences, setCompetences] = useState<CompetenceItem[]>(ALL_COMPETENCES);
  const [isFullWidth, setIsFullWidth] = useState(true);

  const handleToggleWidth = () => {
    const next = !isFullWidth;
    setIsFullWidth(next);
    const host = document.getElementById('zup-logbook-host');
    if (host) {
      host.style.width = next ? '100vw' : '720px';
    }
  };

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
  };

  // Carregar competências dinâmicas do People Zup e sincronizar
  useEffect(() => {
    apiClient
      .fetchCompetences(Boolean(session.token))
      .then((list) => {
        if (list && list.length > 0) {
          setCompetences(list);
        }
      })
      .catch(console.error);
  }, [session.token]);

  // Carregar sessão e configurações iniciais ao montar
  useEffect(() => {
    const loadedSettings = storage.getSettings();
    setSettings({
      ...loadedSettings,
      customInstructions: loadedSettings.customInstructions || DEFAULT_INSTRUCTIONS,
      leadershipTemplate: loadedSettings.leadershipTemplate || DEFAULT_LEADERSHIP_TEMPLATE,
      nonLeadershipTemplate: loadedSettings.nonLeadershipTemplate || DEFAULT_NON_LEADERSHIP_TEMPLATE,
    });

    // Detectar sessão já existente no portal People Zup
    const detected = authService.detectSessionFromPage();
    setSession(detected);

    if (detected.token) {
      setCurrentScreen('chat');
    }

    const unsubscribe = authService.onAuthStatusChanged((newSession) => {
      setSession(newSession);
      setIsLoggingIn(false);
      if (newSession.token) {
        showToast('success', `Conectado como ${newSession.user?.name || 'Zupper'}!`);
        setCurrentScreen('chat');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleStartLogin = async () => {
    setIsLoggingIn(true);
    try {
      // 1. Tenta varredura profunda no storage e cookies
      let detected = authService.detectSessionFromPage(true);
      if (detected.token) {
        setSession(detected);
        showToast('success', `Sessão ativa detectada: ${detected.user?.name || 'Zupper'}!`);
        setCurrentScreen('chat');
        setIsLoggingIn(false);
        return;
      }

      // 2. Tenta obter token silenciosamente via Keycloak SSO
      showToast('info', 'Verificando sessão ativa com Keycloak...');
      const ssoSuccess = await authService.triggerSilentSsoCheck();
      detected = storage.getSession();

      if (ssoSuccess && detected.token) {
        setSession(detected);
        showToast('success', `Conectado via Keycloak: ${detected.user?.name || 'Zupper'}!`);
        setCurrentScreen('chat');
        setIsLoggingIn(false);
        return;
      }

      showToast('info', 'Não foi possível ler o token automaticamente. Você pode inseri-lo nas configurações.');
      setIsSettingsOpen(true);
    } catch (err: any) {
      showToast('error', `Erro na detecção de autenticação: ${err.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCancelLogin = () => {
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    authService.logout();
    setSession(storage.getSession());
    setMessages([]);
    setActiveMode(null);
    setCurrentScreen('welcome');
    showToast('info', 'Você foi desconectado com sucesso.');
  };

  const handleSaveSettings = (newSettings: Partial<AppSettings>) => {
    const saved = storage.updateSettings(newSettings);
    setSettings(saved);
    showToast('success', 'Configurações salvas com sucesso!');
  };

  const handleSaveManualToken = (token: string, refreshToken?: string) => {
    const updatedSession = authService.setManualToken(token, refreshToken);
    setSession(updatedSession);
    if (token || refreshToken) {
      showToast('success', 'Credenciais de autenticação salvas com sucesso!');
      if (token) setCurrentScreen('chat');
    }
  };

  const handleSelectInitialMode = (mode: 'performance' | 'livre') => {
    setActiveMode(mode);
    const welcomeMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'assistant',
      text:
        mode === 'performance'
          ? '🎯 Modo Registro de Performance ativado!\nDescreva o que realizou hoje (ex: entregas, reuniões, tempo dedicado) para estruturarmos o diário e selecionarmos as competências oficiais do People Zup:'
          : '📝 Modo Registro Livre ativado!\nDigite livremente o seu relato para prepararmos o envio rápido ao People Zup:',
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages([welcomeMsg]);
  };

  const handleSelectChoice = async (type: 'performance' | 'livre', rawInput: string) => {
    setActiveMode(type);

    if (type === 'livre') {
      const livreDraft = createLivreDraft(rawInput);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: '📝 Preparei o seu Registro Livre! Você pode aprovar e enviar diretamente ou clicar em "Refinar com IA" para aprimorar o texto:',
        timestamp: new Date().toLocaleTimeString(),
        draft: livreDraft,
        status: 'pending_approval',
      };
      setMessages((prev) => [...prev, assistantMsg]);
      return;
    }

    setIsAiThinking(true);
    try {
      const response = await aiService.processRelato(rawInput, messages);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.message,
        timestamp: new Date().toLocaleTimeString(),
        draft: response.draft
          ? {
              ...response.draft,
              type: 'performance',
              isPerformanceReview: true,
            }
          : undefined,
        status: 'pending_approval',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const cleanErr = cleanErrorMessage(err);
      showToast('error', `Falha ao processar com IA: ${cleanErr}`);

      const manualDraft = createPerformanceDraft(rawInput);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `⚠️ Não foi possível processar via IA (${cleanErr}). Disponibilizei o formulário abaixo para preenchimento manual do diário de bordo:`,
        timestamp: new Date().toLocaleTimeString(),
        draft: manualDraft,
        status: 'pending_approval',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleRefineWithAi = async (draft: LogbookDraft) => {
    setIsAiThinking(true);
    const promptText = draft.content || draft.rawInput;
    try {
      const response = await aiService.processRelato(promptText, messages);
      const isLivre = draft.type === 'livre';
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: isLivre
          ? '✨ Refinei o seu Registro Livre com IA! O texto foi estruturado e aprimorado mantendo o modo livre:'
          : '✨ Refinei o seu relato com IA! Estruturei o texto, vinculei as competências do People Zup e preparei para a avaliação de performance:',
        timestamp: new Date().toLocaleTimeString(),
        draft: response.draft
          ? {
              ...response.draft,
              type: draft.type || 'livre',
              isPerformanceReview: draft.type === 'performance',
            }
          : undefined,
        status: 'pending_approval',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const cleanErr = cleanErrorMessage(err);
      showToast('error', `Falha ao refinar com IA: ${cleanErr}`);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `⚠️ Não foi possível refinar com IA (${cleanErr}). O formulário anterior permanece disponível para que você continue preenchendo manualmente.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsgId = Date.now().toString();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);

    const hasActiveDraft = messages.some((m) => !!m.draft && m.status !== 'submitted');
    if (hasActiveDraft) {
      const activeDraft = [...messages].reverse().find((m) => !!m.draft && m.status !== 'submitted')?.draft;
      const isLivre = activeDraft?.type === 'livre' || (activeDraft?.type !== 'performance' && activeMode === 'livre');

      setIsAiThinking(true);
      try {
        const response = await aiService.processRelato(text, updatedMessages);
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: response.message,
          timestamp: new Date().toLocaleTimeString(),
          draft: response.draft
            ? {
                ...response.draft,
                type: isLivre ? 'livre' : 'performance',
                isPerformanceReview: !isLivre,
              }
            : undefined,
          status: 'pending_approval',
        };
        setMessages([...updatedMessages, assistantMsg]);
      } catch (err: any) {
        const cleanErr = cleanErrorMessage(err);
        showToast('error', `Falha ao processar ajuste: ${cleanErr}`);
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: `⚠️ Falha ao processar ajuste com IA: ${cleanErr}. O formulário em edição permanece ativo para ajustes manuais.`,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages([...updatedMessages, errorMsg]);
      } finally {
        setIsAiThinking(false);
      }
      return;
    }

    if (activeMode === 'livre') {
      const livreDraft = createLivreDraft(text);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: '📝 Preparei o seu Registro Livre! Você pode aprovar e enviar diretamente ou clicar em "Refinar com IA" para aprimorar o texto:',
        timestamp: new Date().toLocaleTimeString(),
        draft: livreDraft,
        status: 'pending_approval',
      };
      setMessages([...updatedMessages, assistantMsg]);
      return;
    }

    if (activeMode === 'performance') {
      setIsAiThinking(true);
      try {
        const response = await aiService.processRelato(text, updatedMessages);
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: response.message,
          timestamp: new Date().toLocaleTimeString(),
          draft: response.draft
            ? {
                ...response.draft,
                type: 'performance',
                isPerformanceReview: true,
              }
            : undefined,
          status: 'pending_approval',
        };
        setMessages([...updatedMessages, assistantMsg]);
      } catch (err: any) {
        const cleanErr = cleanErrorMessage(err);
        showToast('error', `Falha ao processar com IA: ${cleanErr}`);

        const manualDraft = createPerformanceDraft(text);
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: `⚠️ Não foi possível processar via IA (${cleanErr}). Disponibilizei o formulário abaixo para preenchimento manual do diário de bordo:`,
          timestamp: new Date().toLocaleTimeString(),
          draft: manualDraft,
          status: 'pending_approval',
        };
        setMessages([...updatedMessages, assistantMsg]);
      } finally {
        setIsAiThinking(false);
      }
      return;
    }

    const choiceMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      text: 'Como você deseja registrar esse relato? Escolha uma das opções abaixo para continuarmos:',
      timestamp: new Date().toLocaleTimeString(),
      promptChoices: [
        {
          type: 'performance',
          label: '🎯 Fazer Registro de Performance',
          description: 'Estruturação com IA, seleção de competências oficiais do People Zup e avaliação de ciclo.',
        },
        {
          type: 'livre',
          label: '📝 Fazer Registro Livre',
          description: 'Envio rápido do texto bruto com título sugerido e opção de refinar com IA.',
        },
      ],
      pendingRawInput: text,
    };
    setMessages([...updatedMessages, choiceMsg]);
  };

  const handleApproveDraft = async (draft: LogbookDraft) => {
    setIsSubmitting(true);

    try {
      const result = await apiClient.submitLogbook(draft);

      if (result.success) {
        showToast('success', result.message || 'Diário de Bordo enviado com sucesso!');

        setMessages((prev) =>
          prev.map((m) => (m.draft ? { ...m, status: 'submitted' as const } : m))
        );

        setTimeout(() => {
          setMessages([]);
          setActiveMode(null);
          showToast('info', 'Tela limpa e pronta para um novo registro de diário.');
        }, 1500);
      } else {
        showToast('error', result.message || 'Não foi possível registrar o Diário de Bordo.');
      }
    } catch (err: any) {
      showToast('error', `Erro ao submeter: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#0D0E12] text-gray-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        session={session}
        isLoggingIn={isLoggingIn}
        onOpenLogin={handleStartLogin}
        onCancelLogin={handleCancelLogin}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewEntry={() => {
          setMessages([]);
          setActiveMode(null);
        }}
        onClose={onClose}
        hasMessages={currentScreen === 'chat' && messages.length > 0}
        isFullWidth={isFullWidth}
        onToggleWidth={handleToggleWidth}
      />

      {/* Screen Router */}
      <main className="flex-1 flex overflow-hidden">
        {currentScreen === 'welcome' ? (
          <WelcomeScreen
            onStartLogin={handleStartLogin}
            onOpenSettings={() => setIsSettingsOpen(true)}
            isAuthenticated={Boolean(session.token)}
            onContinueToChat={() => setCurrentScreen('chat')}
          />
        ) : (
          <ChatInterface
            messages={messages}
            isAiThinking={isAiThinking}
            isSubmitting={isSubmitting}
            onSendMessage={handleSendMessage}
            onApproveDraft={handleApproveDraft}
            onRefineWithAi={handleRefineWithAi}
            onSelectChoice={handleSelectChoice}
            onSelectInitialMode={handleSelectInitialMode}
            onResetChat={() => {
              setMessages([]);
              setActiveMode(null);
            }}
            availableCompetences={competences}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        session={session}
        onSaveSettings={handleSaveSettings}
        onSaveManualToken={handleSaveManualToken}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default App;
