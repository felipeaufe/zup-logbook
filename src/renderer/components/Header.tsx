import React from 'react';
import { AuthSession } from '../../types';
import { Settings, LogOut, LogIn, BookOpen, ShieldCheck, ShieldAlert, X, Loader2 } from 'lucide-react';

interface HeaderProps {
  session: AuthSession;
  isLoggingIn?: boolean;
  onOpenLogin: () => void;
  onCancelLogin?: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  isLoggingIn = false,
  onOpenLogin,
  onCancelLogin,
  onLogout,
  onOpenSettings,
}) => {
  const isAuthenticated = Boolean(session.token);

  const getCleanUserName = (): string | null => {
    if (!session.user) return null;
    let name = (session.user.name || session.user.email || '').trim();
    if (!name) return null;
    const parts = name.split(/\s+/);
    if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) {
      return parts[0];
    }
    return name;
  };

  return (
    <header className="h-16 border-b border-[#222530] bg-[#12141C]/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 select-none z-40">
      {/* Brand logo & title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg tracking-tight text-white">Zup Logbook</h1>
            <span className="px-2.5 py-0.5 text-sm font-semibold tracking-wide uppercase bg-orange-500/10 text-orange-400 rounded-full border border-orange-500/20">
              StackSpot AI
            </span>
          </div>
          <p className="text-sm text-gray-400">Automatizador de Diário de Bordo</p>
        </div>
      </div>

      {/* Session status & actions */}
      <div className="flex items-center gap-3">
        {/* Status pill */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-sm font-medium transition-all ${
            isAuthenticated
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : isLoggingIn
              ? 'bg-blue-950/40 border-blue-500/30 text-blue-300'
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          }`}
        >
          {isAuthenticated ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Conectado ao People</span>
              {getCleanUserName() && (
                <span className="text-emerald-400/80 font-normal">({getCleanUserName()})</span>
              )}
            </>
          ) : isLoggingIn ? (
            <>
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              <span>Aguardando autenticação e 2FA...</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Não autenticado</span>
            </>
          )}
        </div>

        {/* Buttons */}
        {isAuthenticated ? (
          <button
            onClick={onLogout}
            title="Desconectar do People Zup"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2A2D3A] text-gray-300 hover:text-white hover:bg-rose-500/10 hover:border-rose-500/30 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        ) : isLoggingIn ? (
          <button
            onClick={onCancelLogin}
            title="Cancelar e fechar tela de login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-sm font-medium transition-all"
          >
            <X className="w-4 h-4" />
            <span>Cancelar Login</span>
          </button>
        ) : (
          <button
            onClick={onOpenLogin}
            title="Conectar ao People Zup"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Entrar no People</span>
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          title="Configurações (StackSpot AI, Endpoints, Regras)"
          className="p-2 rounded-lg border border-[#2A2D3A] text-gray-400 hover:text-white hover:bg-[#1A1D27] hover:border-gray-600 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
