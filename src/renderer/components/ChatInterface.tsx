import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, LogbookDraft, CompetenceItem } from '../../types';
import { ProposalCard } from './ProposalCard';
import {
  SendHorizontal,
  Sparkles,
  Loader2,
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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0F1017] relative">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto py-12">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 shadow-inner">
                <Sparkles className="w-8 h-8" />
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
                  className="p-5 rounded-2xl bg-gradient-to-br from-[#1A1D2B] to-[#141624] hover:from-[#212638] hover:to-[#191D2E] border border-purple-500/30 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/15 transition-all text-left flex flex-col justify-between group cursor-pointer h-full"
                >
                  <div className="flex-1 flex flex-col">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 shrink-0">
                      <Target className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-white mb-2 group-hover:text-purple-300 transition-colors">
                      Registro de Performance
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed flex-1">
                      Estruturado com inteligência, seleção de competências oficiais do People Zup e avaliação de ciclo.
                    </p>
                  </div>
                  <div className="text-sm text-purple-400 font-semibold pt-4 flex items-center justify-between group-hover:translate-x-0.5 transition-transform border-t border-white/5 mt-4">
                    <span>Iniciar registro</span>
                    <span className="text-base">→</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectInitialMode('livre')}
                  className="p-5 rounded-2xl bg-gradient-to-br from-[#1A1D2B] to-[#141624] hover:from-[#1E2436] hover:to-[#171B2A] border border-blue-500/30 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/15 transition-all text-left flex flex-col justify-between group cursor-pointer h-full"
                >
                  <div className="flex-1 flex flex-col">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-white mb-2 group-hover:text-blue-300 transition-colors">
                      Registro Livre
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed flex-1">
                      Envio rápido do texto bruto com título sugerido. Você pode refinar com IA quando achar necessário.
                    </p>
                  </div>
                  <div className="text-sm text-blue-400 font-semibold pt-4 flex items-center justify-between group-hover:translate-x-0.5 transition-transform border-t border-white/5 mt-4">
                    <span>Iniciar registro</span>
                    <span className="text-base">→</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="w-full flex flex-col space-y-3">
                {/* Message Bubble & Content - 100% width */}
                <div
                  className={`w-full text-base leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#1A1D2B] border border-[#2D334A] text-gray-100 rounded-2xl px-5 py-4 shadow-sm'
                      : 'bg-transparent text-gray-200 px-1 py-2'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Se a mensagem tiver botões de escolha de tipo de registro */}
                {msg.promptChoices && msg.promptChoices.length > 0 && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-1 w-full">
                    {msg.promptChoices.map((choice) => (
                      <button
                        key={choice.type}
                        type="button"
                        onClick={() => onSelectChoice(choice.type, msg.pendingRawInput || '')}
                        className={`flex-1 p-4 rounded-xl border transition-all text-left cursor-pointer group ${
                          choice.type === 'performance'
                            ? 'bg-gradient-to-br from-[#1E2235] to-[#181B2A] border-purple-500/40 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20'
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
                  <div className="w-full pt-1">
                    <ProposalCard
                      draft={msg.draft}
                      isSubmitting={isSubmitting}
                      onApprove={onApproveDraft}
                      onRefineWithAi={onRefineWithAi}
                      status={msg.status}
                      availableCompetences={availableCompetences}
                    />
                  </div>
                )}
              </div>
            ))
          )}

          {/* AI is thinking indicator */}
          {isAiThinking && (
            <div className="w-full flex items-center gap-3 px-1 py-2 text-gray-300">
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin shrink-0" />
              <span className="text-sm text-gray-300">
                Lendo seu relato e aplicando as regras do diário de bordo...
              </span>
            </div>
          )}

          <div className="h-44 shrink-0" aria-hidden="true" />
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Input Area with seamless gradient fade-out */}
      <div className="absolute bottom-0 inset-x-0 pointer-events-none bg-gradient-to-t from-[#0F1017] via-[#0F1017]/95 via-40% to-transparent pt-24 pb-6 px-4 z-10">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2.5 bg-[#1F2232] border border-[#3A405A] focus-within:border-purple-500 rounded-2xl p-2 pl-4 transition-colors shadow-2xl shadow-black/80"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder={
                messages.some((m) => !!m.draft && m.status !== 'submitted')
                  ? 'Digite ajustes para a proposta acima ou novas informações...'
                  : 'Descreva o que você realizou hoje...'
              }
              disabled={isAiThinking || isSubmitting}
              className="flex-1 bg-transparent border-0 text-base text-gray-100 placeholder-gray-400 focus:outline-none resize-none py-1.5 max-h-40 leading-normal disabled:text-gray-400 my-auto"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isAiThinking || isSubmitting}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/30 disabled:text-white/50 text-white transition-all shadow-md shadow-purple-600/20 shrink-0 cursor-pointer self-center"
              title="Enviar relato (Enter)"
            >
              <SendHorizontal className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
