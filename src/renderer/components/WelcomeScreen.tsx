import React from 'react';
import { BookOpen, Sparkles, KeyRound, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface WelcomeScreenProps {
  onStartLogin: () => void;
  onOpenSettings: () => void;
  isAuthenticated: boolean;
  onContinueToChat: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartLogin,
  onOpenSettings,
  isAuthenticated,
  onContinueToChat,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#0D0E12] via-[#12141C] to-[#0D0E12] overflow-y-auto">
      <div className="max-w-2xl w-full flex flex-col items-center animate-fade-in">
        {/* Glow Logo badge */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
          <div className="relative w-20 h-20 rounded-2xl bg-[#181A22] border border-orange-500/40 flex items-center justify-center shadow-2xl">
            <BookOpen className="w-10 h-10 text-orange-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Diário de Bordo Inteligente
        </h1>
        <p className="text-gray-400 text-base max-w-lg mb-8 leading-relaxed">
          Registre suas atividades diárias no <span className="text-orange-400 font-medium">People Zup</span> de forma rápida e natural. Basta relatar o que você fez em linguagem livre e nosso agente de IA estrutura, valida e submete o registro por você.
        </p>

        {/* 3 Step Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-10 text-left">
          <div className="p-4 rounded-xl bg-[#161821] border border-[#222532] shadow-sm hover:border-orange-500/30 transition-all">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-3">
              <KeyRound className="w-4 h-4 text-orange-400" />
            </div>
            <h3 className="font-semibold text-white text-base mb-1">1. Autenticação 2FA</h3>
            <p className="text-sm text-gray-400">
              Faça login no People Zup com 2FA normalmente. O app intercepta o JWT de sessão com total segurança.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#161821] border border-[#222532] shadow-sm hover:border-orange-500/30 transition-all">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="font-semibold text-white text-base mb-1">2. Assistente com IA</h3>
            <p className="text-sm text-gray-400">
              Digite seu relato livremente. A IA resume as tarefas, calcula as horas e categoriza o registro.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#161821] border border-[#222532] shadow-sm hover:border-orange-500/30 transition-all">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white text-base mb-1">3. Aprovação & Envio</h3>
            <p className="text-sm text-gray-400">
              Revise o card amigável gerado, faça ajustes com um clique e aprove para enviar direto à API do People.
            </p>
          </div>
        </div>

        {/* Call to action */}
        {isAuthenticated ? (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onContinueToChat}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Abrir Chat do Agente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onStartLogin}
              className="px-4 py-3.5 rounded-xl border border-[#2A2D3A] text-gray-300 hover:text-white hover:bg-[#1A1D27] text-base font-medium transition-colors"
            >
              Reautenticar com 2FA
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onStartLogin}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-base shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Conectar ao People Zup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSettings}
              className="px-5 py-3.5 rounded-xl border border-[#2A2D3A] text-gray-300 hover:text-white hover:bg-[#1A1D27] text-base font-medium transition-colors cursor-pointer"
            >
              Configurar Chaves & Endpoints
            </button>
          </div>
        )}

        {/* Security badge notice */}
        <div className="mt-8 flex items-center gap-2 text-sm text-gray-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Suas credenciais são inseridas apenas no navegador oficial do People Zup.</span>
        </div>
      </div>
    </div>
  );
};
