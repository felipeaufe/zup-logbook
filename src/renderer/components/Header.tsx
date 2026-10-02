import React from 'react';
import { AuthSession } from '../../types';
import {
  Settings,
  LogIn,
  BookOpen,
  X,
  Loader2,
  RotateCcw,
  Maximize2,
  Minimize2,
  ArrowLeftToLine,
  ArrowRightToLine,
} from 'lucide-react';

interface HeaderProps {
  session: AuthSession;
  isLoggingIn?: boolean;
  onOpenLogin: () => void;
  onCancelLogin?: () => void;
  onLogout?: () => void;
  onOpenSettings: () => void;
  onNewEntry?: () => void;
  onClose?: () => void;
  hasMessages?: boolean;
  isFullWidth?: boolean;
  onToggleWidth?: () => void;
  dockSide?: 'right' | 'left';
  onToggleSide?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  isLoggingIn = false,
  onOpenLogin,
  onCancelLogin,
  onOpenSettings,
  onNewEntry,
  onClose,
  hasMessages = false,
  isFullWidth = true,
  onToggleWidth,
  dockSide = 'right',
  onToggleSide,
}) => {
  const isAuthenticated = Boolean(session.token);

  const getUserDisplayName = (): string => {
    if (!session.user) return '';
    if (session.user.name && session.user.name.trim()) {
      const parts = session.user.name.trim().split(/\s+/);
      if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) {
        return parts[0];
      }
      return session.user.name.trim();
    }
    if (session.user.username && session.user.username.trim()) {
      return session.user.username.trim();
    }
    if (session.user.email && session.user.email.trim()) {
      return session.user.email.trim();
    }
    return 'Zupper';
  };

  return (
    <header className="h-16 border-b border-[#222530] bg-[#12141C]/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 select-none z-40">
      {/* Brand logo & title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg tracking-tight text-white">Zup Logbook</h1>
          </div>
          <p className="text-sm text-gray-400">Automatizador de Diário de Bordo</p>
        </div>
      </div>

      {/* Session status & actions */}
      <div className="flex items-center gap-3">
        {/* User Info (when authenticated) */}
        {isAuthenticated ? (
          <div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#181B26] border border-[#2B3042] text-gray-200 text-sm font-medium shrink-0"
            title={`Logado como: ${getUserDisplayName()}${session.user?.email ? ` (${session.user.email})` : ''}`}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm shrink-0">
              {getUserDisplayName().charAt(0)}
            </div>
            {isFullWidth && (
              <span className="font-semibold text-gray-100 truncate max-w-[200px]">
                {getUserDisplayName()}
              </span>
            )}
          </div>
        ) : isLoggingIn ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-300 text-sm">
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            <span>Verificando sessão...</span>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            title="Conectar ao People Zup"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Conectar</span>
          </button>
        )}

        {/* New entry button */}
        {hasMessages && onNewEntry && (
          <button
            onClick={onNewEntry}
            title="Iniciar um novo registro do diário de bordo"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B1E2B] border border-[#2D3246] hover:border-purple-500/50 text-gray-200 hover:text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-purple-400" />
            <span>Novo Registro</span>
          </button>
        )}

        {/* Dock position toggle button: Left <-> Right (only visible when not full width) */}
        {!isFullWidth && onToggleSide && (
          <button
            onClick={onToggleSide}
            title={dockSide === 'right' ? "Mover painel para a esquerda" : "Mover painel para a direita"}
            className="p-2 rounded-lg border border-[#2A2D3A] text-gray-400 hover:text-white hover:bg-[#1A1D27] hover:border-gray-600 transition-colors cursor-pointer"
          >
            {dockSide === 'right' ? (
              <ArrowLeftToLine className="w-4 h-4 text-gray-300 hover:text-white" />
            ) : (
              <ArrowRightToLine className="w-4 h-4 text-gray-300 hover:text-white" />
            )}
          </button>
        )}

        {/* Toggle width button: 100% <-> 720px */}
        {onToggleWidth && (
          <button
            onClick={onToggleWidth}
            title={isFullWidth ? "Diminuir para 720px (painel lateral)" : "Expandir para 100% (tela cheia)"}
            className="p-2 rounded-lg border border-[#2A2D3A] text-gray-400 hover:text-white hover:bg-[#1A1D27] hover:border-gray-600 transition-colors cursor-pointer"
          >
            {isFullWidth ? (
              <Minimize2 className="w-4 h-4 text-gray-300 hover:text-white" />
            ) : (
              <Maximize2 className="w-4 h-4 text-gray-300 hover:text-white" />
            )}
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          title="Configurações (StackSpot AI, Endpoints, Regras)"
          className="p-2 rounded-lg border border-[#2A2D3A] text-gray-400 hover:text-white hover:bg-[#1A1D27] hover:border-gray-600 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Close/Hide Bookmarklet button */}
        {onClose && (
          <button
            onClick={onClose}
            title="Fechar / Ocultar Zup Logbook"
            className="p-2 rounded-lg border border-[#2A2D3A] text-gray-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-300 hover:text-white" />
          </button>
        )}
      </div>
    </header>
  );
};
