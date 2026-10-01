import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, LogbookDraft, CompetenceItem } from '../../types';
import { ProposalCard } from './ProposalCard';
import {
  SendHorizontal,
  Sparkles,
  Bot,
  User,
  Loader2,
  RotateCcw,
  Target,
  FileText,
} from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onApproveDraft: (draft: LogbookDraft) => void;
  onResetChat: () => void;
  onSelectChoice: (type: 'performance' | 'livre', rawInput: string) => void;
  onSelectInitialMode: (mode: 'performance' | 'livre') => void;
  onRefineWithAi: (draft: LogbookDraft) => void;
  isAiThinking: boolean;
  isSubmitting: boolean;
  availableCompetences?: CompetenceItem[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onApproveDraft,
  onResetChat,
  onSelectChoice,
  onSelectInitialMode,
  onRefineWithAi,
  isAiThinking,
  isSubmitting,
  availableCompetences,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiThinking]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isAiThinking || isSubmitting) return;

    onSendMessage(inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // Auto resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0F1017]">
      {/* Top action toolbar */}
      <div className="h-11 border-b border-[#1E212D] bg-[#12141D] px-6 flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span>Agente Diário de Bordo pronto</span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={onResetChat}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg hover:bg-[#1A1D29] text-gray-300 hover:text-white transition-colors cursor-pointer text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Novo Registro</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-10">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4 shadow-inner">
              <Bot className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Como deseja registrar seu dia?</h2>
            <p className="text-base text-gray-300 mb-6 max-w-md">
              Escolha uma das opções abaixo para iniciar ou digite diretamente seu relato no campo de texto:
            </p>

            {/* 2 Options Cards */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <button
                type="button"
                onClick={() => onSelectInitialMode('performance')}
                className="p-5 rounded-2xl bg-gradient-to-br from-[#1A1D2B] to-[#141624] hover:from-[#212638] hover:to-[#191D2E] border border-orange-500/30 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/15 transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-3">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-white mb-1 group-hover:text-orange-300 transition-colors">
                    Registro de Performance
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Estruturado com inteligência, seleção de competências oficiais do People Zup e avaliação de ciclo.
                  </p>
                </div>
                <span className="text-sm text-orange-400 font-semibold mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Fazer registro de performance →
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectInitialMode('livre')}
                className="p-5 rounded-2xl bg-gradient-to-br from-[#1A1D2B] to-[#141624] hover:from-[#1E2436] hover:to-[#171B2A] border border-blue-500/30 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/15 transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-white mb-1 group-hover:text-blue-300 transition-colors">
                    Registro Livre
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Envio rápido do texto bruto com título sugerido. Você pode refinar com IA quando achar necessário.
                  </p>
                </div>
                <span className="text-sm text-blue-400 font-semibold mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Fazer registro livre →
                </span>
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-sm ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                    : 'bg-gradient-to-tr from-orange-600 to-amber-500'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble & Content */}
              <div
                className={`flex flex-col space-y-3 max-w-3xl ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl text-base leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#181A26] border border-orange-500/60 text-gray-100 rounded-tr-none shadow-md shadow-orange-500/10'
                      : 'bg-[#181A26] border border-[#262A3B] text-gray-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Se a mensagem tiver botões de escolha de tipo de registro */}
                {msg.promptChoices && msg.promptChoices.length > 0 && (
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-1 w-full">
                    {msg.promptChoices.map((choice) => (
                      <button
                        key={choice.type}
                        type="button"
                        onClick={() => onSelectChoice(choice.type, msg.pendingRawInput || '')}
                        className={`flex-1 p-4 rounded-xl border transition-all text-left cursor-pointer group ${
                          choice.type === 'performance'
                            ? 'bg-gradient-to-br from-[#1E2235] to-[#181B2A] border-orange-500/40 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20'
                            : 'bg-gradient-to-br from-[#1E2235] to-[#181B2A] border-blue-500/40 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-base text-white group-hover:translate-x-0.5 transition-transform">
                            {choice.label}
                          </span>
                        </div>
                        {choice.description && (
                          <p className="text-sm text-gray-300 leading-snug">
                            {choice.description}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* If there's an attached proposal draft */}
                {msg.draft && (
                  <ProposalCard
                    draft={msg.draft}
                    isSubmitting={isSubmitting}
                    onApprove={onApproveDraft}
                    onRefineWithAi={onRefineWithAi}
                    status={msg.status}
                    availableCompetences={availableCompetences}
                  />
                )}
              </div>
            </div>
          ))
        )}

        {/* AI is thinking indicator */}
        {isAiThinking && (
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-[#181A26] border border-[#262A3B] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
              <span className="text-sm text-gray-200">
                Lendo seu relato e aplicando as regras do diário de bordo...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#1F2230] bg-[#12141D]">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2.5 bg-[#181A26] border border-[#2B2F44] focus-within:border-orange-500/70 rounded-2xl p-3 transition-colors shadow-lg"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder={
                messages.some((m) => !!m.draft && m.status !== 'submitted')
                  ? 'Digite ajustes para a proposta acima ou novas informações... (Enter para enviar)'
                  : 'Descreva o que você realizou hoje... (Pressione Enter para enviar, Shift+Enter para nova linha)'
              }
              disabled={isAiThinking || isSubmitting}
              className="flex-1 bg-transparent border-0 text-base text-white placeholder-gray-500 focus:outline-none resize-none px-2 py-1 max-h-40 leading-relaxed disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isAiThinking || isSubmitting}
              className="p-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:hover:bg-orange-500 text-white transition-all shadow-md shadow-orange-500/20 shrink-0 cursor-pointer"
              title="Enviar relato (Enter)"
            >
              <SendHorizontal className="w-5 h-5" />
            </button>
          </form>

          <p className="text-sm text-gray-400 text-center mt-2.5">
            Pressione <kbd className="bg-[#1C1F2E] px-2 py-0.5 rounded text-gray-300 border border-gray-700 text-sm">Enter</kbd> para enviar ou <kbd className="bg-[#1C1F2E] px-2 py-0.5 rounded text-gray-300 border border-gray-700 text-sm">Shift + Enter</kbd> para pular linha
          </p>
        </div>
      </div>
    </div>
  );
};
