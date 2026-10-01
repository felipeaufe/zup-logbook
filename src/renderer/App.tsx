import React, { useState, useEffect } from 'react';
import { AuthSession, AppSettings, ChatMessage, LogbookDraft, CompetenceItem } from '../types';
import { ALL_COMPETENCES } from '../data/competences';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatInterface } from './components/ChatInterface';
import { SettingsModal } from './components/SettingsModal';
import { Toast, ToastProps } from './components/Toast';
import {
  DEFAULT_INSTRUCTIONS,
  DEFAULT_LEADERSHIP_TEMPLATE,
  DEFAULT_NON_LEADERSHIP_TEMPLATE,
} from '../data/templates';



function cleanErrorMessage(err: any): string {
  const msg = err?.message || String(err || '');
  return msg
    .replace(/^Error invoking remote method '[^']+':\s*/i, '')
    .replace(/^Error:\s*/i, '')
    .trim();
}

// Auxiliar para Registro Manual / Livre (sem título, sem competências, texto bruto)
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

// Auxiliar para formulário manual de Registro de Performance
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

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'chat'>('welcome');
  const [session, setSession] = useState<AuthSession>({
    token: null,
    cookies: {},
    user: null,
    lastLogin: null,
    expiresAt: null,
  });
  const [settings, setSettings] = useState<AppSettings>({
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
  });
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

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
  };

  // Carregar competências dinâmicas do People Zup e sincronizar
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI
        .getCompetences(Boolean(session.token))
        .then((list) => {
          if (list && list.length > 0) {
            setCompetences(list);
          }
        })
        .catch(console.error);

      const unsubscribe = window.electronAPI.onCompetencesUpdated((list) => {
        if (list && list.length > 0) {
          setCompetences(list);
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [session.token]);

  // Carregar sessão e configurações iniciais ao abrir o app
  useEffect(() => {
    const initApp = async () => {
      try {
        if (window.electronAPI) {
          const loadedSession = await window.electronAPI.getSession();
          const loadedSettings = await window.electronAPI.getSettings();

          setSession(loadedSession);
          if (loadedSettings) {
            setSettings({
              ...loadedSettings,
              customInstructions: loadedSettings.customInstructions || DEFAULT_INSTRUCTIONS,
              leadershipTemplate: loadedSettings.leadershipTemplate || DEFAULT_LEADERSHIP_TEMPLATE,
              nonLeadershipTemplate: loadedSettings.nonLeadershipTemplate || DEFAULT_NON_LEADERSHIP_TEMPLATE,
            });
          }

          // Se já possuir token ativo, vai direto para o chat
          if (loadedSession.token) {
            setCurrentScreen('chat');
          }

          // Listener para atualizações de login
          window.electronAPI.onAuthStatusChanged((newSession) => {
            setSession(newSession);
            setIsLoggingIn(false);
            if (newSession.token) {
              showToast('success', `Conectado como ${newSession.user?.name || 'Zupper'}!`);
              setCurrentScreen('chat');
            }
          });
        }
      } catch (err: any) {
        showToast('error', `Erro ao inicializar app: ${err.message}`);
      }
    };

    initApp();
  }, []);

  // Iniciar fluxo de autenticação People Zup
  const handleStartLogin = async () => {
    setIsLoggingIn(true);
    try {
      if (window.electronAPI) {
        const started = await window.electronAPI.startLogin();
        if (!started) {
          showToast('error', 'Falha ao iniciar tela de autenticação');
          setIsLoggingIn(false);
        }
      } else {
        // Fallback para dev em navegador web
        showToast('info', 'Ambiente web de teste. Abrindo simulação de login.');
        setTimeout(() => {
          setIsLoggingIn(false);
          setSession({
            token: 'mock-jwt-token',
            cookies: {},
            user: { name: 'Zupper Dev', email: 'zupper@zup.com.br' },
            lastLogin: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 3600000).toISOString(),
          });
          setCurrentScreen('chat');
        }, 1500);
      }
    } catch (err: any) {
      showToast('error', `Erro ao abrir autenticação: ${err.message}`);
      setIsLoggingIn(false);
    }
  };

  const handleCancelLogin = async () => {
    if (window.electronAPI) {
      await window.electronAPI.cancelLogin();
    }
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    if (window.electronAPI) {
      await window.electronAPI.logout();
    }
    setSession({
      token: null,
      cookies: {},
      user: null,
      lastLogin: null,
      expiresAt: null,
    });
    setMessages([]);
    setActiveMode(null);
    setCurrentScreen('welcome');
    showToast('info', 'Você foi desconectado com sucesso.');
  };

  const handleSaveSettings = async (newSettings: Partial<AppSettings>) => {
    if (window.electronAPI) {
      const saved = await window.electronAPI.saveSettings(newSettings);
      setSettings(saved);
    } else {
      setSettings((prev) => ({ ...prev, ...newSettings } as AppSettings));
    }
    showToast('success', 'Configurações salvas com sucesso!');
  };

  const handleSaveManualToken = async (token: string) => {
    if (window.electronAPI) {
      const updatedSession = await window.electronAPI.setManualToken(token);
      setSession(updatedSession);
      if (token) {
        showToast('success', 'Token JWT aplicado com sucesso!');
        setCurrentScreen('chat');
      }
    }
  };

  // Seleção de modo inicial pelo empty state
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

  // Escolha do tipo de registro quando o usuário digitou sem escolher previamente
  const handleSelectChoice = async (type: 'performance' | 'livre', rawInput: string) => {
    setActiveMode(type);

    if (type === 'livre') {
      const livreDraft = createLivreDraft(rawInput);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Preparei a amostra do seu Registro Livre com base no texto enviado. Você pode aprovar o envio ou refinar com IA a qualquer momento:',
        timestamp: new Date().toLocaleTimeString(),
        draft: livreDraft,
        status: 'pending_approval',
      };
      setMessages((prev) => [...prev, assistantMsg]);
      return;
    }

    // Se for 'performance', processa com IA
    setIsAiThinking(true);
    try {
      if (window.electronAPI) {
        const response = await window.electronAPI.processRelato(rawInput, messages);
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: response.message,
          timestamp: new Date().toLocaleTimeString(),
          draft: response.draft
            ? { ...response.draft, type: 'performance', isPerformanceReview: true }
            : createPerformanceDraft(rawInput),
          status: 'pending_approval',
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      const cleanErr = cleanErrorMessage(err);
      showToast('error', `Falha ao processar com IA: ${cleanErr}`);
      const manualDraft = createPerformanceDraft(rawInput);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `⚠️ Não foi possível estruturar o relato com IA (${cleanErr}).\n\nDisponibilizei o formulário de Registro de Performance abaixo com o seu texto para que você possa preencher o título, competências e concluir o registro manualmente:`,
        timestamp: new Date().toLocaleTimeString(),
        draft: manualDraft,
        status: 'pending_approval',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Refinar um Registro Livre com IA preservando estritamente o modo e tipo Livre
  const handleRefineWithAi = async (draft: LogbookDraft) => {
    setIsAiThinking(true);
    // NÃO alternar activeMode: a escolha do usuário por Registro Livre DEVE ser sempre preservada.

    const promptText = draft.content || draft.rawInput;
    try {
      if (window.electronAPI) {
        const response = await window.electronAPI.processRelato(promptText, messages);
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
      }
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

  // Envio de mensagem pelo input principal
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

    // 1. Se já existe uma proposta em edição no chat, trata-se de um ajuste implícito contínuo
    const hasActiveDraft = messages.some((m) => !!m.draft && m.status !== 'submitted');
    if (hasActiveDraft) {
      const activeDraft = [...messages].reverse().find((m) => !!m.draft && m.status !== 'submitted')?.draft;
      const isLivre = activeDraft?.type === 'livre' || (activeDraft?.type !== 'performance' && activeMode === 'livre');

      setIsAiThinking(true);
      try {
        if (window.electronAPI) {
          const response = await window.electronAPI.processRelato(text, updatedMessages);
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
        }
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

    // 2. Se o modo Livre estiver pré-selecionado:
    if (activeMode === 'livre') {
      const livreDraft = createLivreDraft(text);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Preparei a amostra do seu Registro Livre. Você pode aprovar o envio diretamente ou refinar com IA:',
        timestamp: new Date().toLocaleTimeString(),
        draft: livreDraft,
        status: 'pending_approval',
      };
      setMessages([...updatedMessages, assistantMsg]);
      return;
    }

    // 3. Se o modo Performance estiver pré-selecionado:
    if (activeMode === 'performance') {
      setIsAiThinking(true);
      try {
        if (window.electronAPI) {
          const response = await window.electronAPI.processRelato(text, updatedMessages);
          const assistantMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'assistant',
            text: response.message,
            timestamp: new Date().toLocaleTimeString(),
            draft: response.draft
              ? { ...response.draft, type: 'performance', isPerformanceReview: true }
              : createPerformanceDraft(text),
            status: 'pending_approval',
          };
          setMessages([...updatedMessages, assistantMsg]);
        }
      } catch (err: any) {
        const cleanErr = cleanErrorMessage(err);
        showToast('error', `Falha ao processar com IA: ${cleanErr}`);
        const manualDraft = createPerformanceDraft(text);
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: `⚠️ Não foi possível estruturar o relato com IA (${cleanErr}).\n\nDisponibilizei o formulário de Registro de Performance abaixo para que você possa preencher o título, competências e concluir o registro manualmente:`,
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

    // 4. Caso o usuário apenas digite algo sem escolher previamente:
    // Exibe no chat uma mensagem pedindo para escolher uma das opções (com 2 botões no chat)
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

  // Aprovação e Envio do Diário para a API Dune do People Zup
  const handleApproveDraft = async (draft: LogbookDraft) => {
    setIsSubmitting(true);

    try {
      if (!window.electronAPI) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        showToast('success', 'Diário de Bordo registrado com sucesso! (Modo Simulação)');
        setMessages([]);
        setActiveMode(null);
        setIsSubmitting(false);
        return;
      }

      const result = await window.electronAPI.submitLogbook(draft);

      if (result.success) {
        showToast('success', result.message || 'Diário de Bordo enviado com sucesso!');

        // Atualizar status do card para enviado
        setMessages((prev) =>
          prev.map((m) => (m.draft ? { ...m, status: 'submitted' as const } : m))
        );

        // Limpar tela após 1.5s para preparar novo registro
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
    <div className="h-screen w-screen flex flex-col bg-[#0D0E12] text-gray-100 overflow-hidden font-sans">
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
        hasMessages={currentScreen === 'chat' && messages.length > 0}
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
            onSendMessage={handleSendMessage}
            onApproveDraft={handleApproveDraft}
            onSelectChoice={handleSelectChoice}
            onSelectInitialMode={handleSelectInitialMode}
            onRefineWithAi={handleRefineWithAi}
            onResetChat={() => {
              setMessages([]);
              setActiveMode(null);
            }}
            isAiThinking={isAiThinking}
            isSubmitting={isSubmitting}
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
