import React, { useState, useEffect } from 'react';
import { AppSettings, AuthSession } from '../../types';
import { X, Key, Globe, Sparkles, Shield, Save, Eye, EyeOff, Check, Copy, RefreshCw, AlertCircle, RotateCcw } from 'lucide-react';
import {
  DEFAULT_INSTRUCTIONS,
  DEFAULT_LEADERSHIP_TEMPLATE,
  DEFAULT_NON_LEADERSHIP_TEMPLATE,
} from '../../data/templates';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  session: AuthSession;
  onSaveSettings: (settings: Partial<AppSettings>) => void;
  onSaveManualToken: (token: string, refreshToken?: string) => void;
  onTriggerSilentRefresh?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  session,
  onSaveSettings,
  onSaveManualToken,
  onTriggerSilentRefresh,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [manualToken, setManualToken] = useState(session.token || '');
  const [manualRefreshToken, setManualRefreshToken] = useState(session.refreshToken || '');
  const [showSecret, setShowSecret] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'people' | 'rules'>('ai');
  const [copiedToken, setCopiedToken] = useState(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [refreshFeedback, setRefreshFeedback] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setFormData(settings);
    setManualToken(session.token || '');
    setManualRefreshToken(session.refreshToken || '');
  }, [settings, session, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    if (
      (manualToken && manualToken !== session.token) ||
      (manualRefreshToken && manualRefreshToken !== session.refreshToken)
    ) {
      onSaveManualToken(manualToken.trim(), manualRefreshToken.trim() || undefined);
    }
    onClose();
  };

  const handleManualRefresh = async () => {
    if (!window.electronAPI) return;
    setIsRefreshingToken(true);
    setRefreshFeedback(null);
    try {
      const res = await window.electronAPI.refreshToken();
      if (res.success) {
        setRefreshFeedback({ success: true, message: 'Token renovado com sucesso via Keycloak!' });
      } else {
        setRefreshFeedback({
          success: false,
          message: 'Não foi possível renovar. O refresh token pode ter expirado ou não estar presente.',
        });
      }
    } catch (err: any) {
      setRefreshFeedback({ success: false, message: `Erro: ${err.message}` });
    } finally {
      setIsRefreshingToken(false);
      setTimeout(() => setRefreshFeedback(null), 5000);
    }
  };

  const handleCopyToken = () => {
    if (session.token) {
      navigator.clipboard.writeText(session.token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleResetRulesToDefault = () => {
    setFormData((prev) => ({
      ...prev,
      customInstructions: DEFAULT_INSTRUCTIONS,
      leadershipTemplate: DEFAULT_LEADERSHIP_TEMPLATE,
      nonLeadershipTemplate: DEFAULT_NON_LEADERSHIP_TEMPLATE,
    }));
  };

  const isTokenExpired = session.expiresAt
    ? Date.now() > new Date(session.expiresAt).getTime()
    : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#141620] border border-[#262A3B] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#242738] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Configurações do Zup Logbook</h2>
              <p className="text-sm text-gray-400">StackSpot AI, Autenticação e API People Zup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1E2232] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#242738] px-6 bg-[#10121A]">
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3.5 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'ai'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Provedor de IA</span>
          </button>
          <button
            onClick={() => setActiveTab('people')}
            className={`py-3.5 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'people'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>People Zup & Sessão</span>
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-3.5 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'rules'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Instruções & Regras</span>
          </button>
        </div>

        {/* Tab Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                  Provedor de IA Selecionado
                </label>
                <select
                  value={formData.aiProvider}
                  onChange={(e) => setFormData({ ...formData, aiProvider: e.target.value as any })}
                  className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="stackspot">StackSpot AI (Oficial Zup)</option>
                  <option value="gemini">Google Gemini (Alternativa)</option>
                  <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                </select>
              </div>

              {formData.aiProvider === 'stackspot' && (
                <div className="space-y-3.5 p-4 rounded-xl bg-[#171924] border border-[#262A3B]">
                  <div className="flex items-center gap-2 text-sm font-bold text-purple-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Configuração StackSpot AI</span>
                  </div>

                  {/* Personal Access Token (PAT) */}
                  <div className="p-3.5 bg-[#13151F] border border-purple-500/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-purple-300">
                        Personal Access Token (PAT) - Recomendado
                      </label>
                      <span className="text-sm px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-medium">
                        Direto sem OAuth2
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Se você possui um Token de Acesso Pessoal gerado no Portal StackSpot AI (Perfil → Access Token), cole-o aqui:
                    </p>
                    <input
                      type="password"
                      placeholder="Cole aqui seu PAT (Bearer eyJhbGci...)"
                      value={formData.stackspotToken || ''}
                      onChange={(e) => setFormData({ ...formData, stackspotToken: e.target.value })}
                      className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  <div className="text-sm text-gray-500 text-center font-semibold uppercase tracking-wider py-1">
                    ── OU Credenciais OAuth2 (Service Account) ──
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Client ID</label>
                    <input
                      type="text"
                      placeholder="Ex: 12345678-abcd-..."
                      value={formData.stackspotClientId || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, stackspotClientId: e.target.value })
                      }
                      className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Client Secret</label>
                    <div className="relative">
                      <input
                        type={showSecret ? 'text' : 'password'}
                        placeholder="••••••••••••••••••••"
                        value={formData.stackspotClientSecret || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, stackspotClientSecret: e.target.value })
                        }
                        className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl px-3.5 py-2.5 pr-10 text-base text-white focus:outline-none focus:border-purple-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-white"
                      >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Realm</label>
                    <input
                      type="text"
                      placeholder="zup"
                      value={formData.stackspotRealm || 'zup'}
                      onChange={(e) =>
                        setFormData({ ...formData, stackspotRealm: e.target.value })
                      }
                      className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {formData.aiProvider !== 'stackspot' && (
                <div className="space-y-3 p-4 rounded-xl bg-[#171924] border border-[#262A3B]">
                  <label className="block text-sm text-gray-300 mb-1">Chave de API</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={formData.aiApiKey}
                      onChange={(e) => setFormData({ ...formData, aiApiKey: e.target.value })}
                      className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl px-3.5 py-2.5 pr-10 text-base text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-white"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'people' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                  Endpoint Oficial da API Dune (Zenity)
                </label>
                <input
                  type="text"
                  value={formData.logbookEndpoint}
                  onChange={(e) => setFormData({ ...formData, logbookEndpoint: e.target.value })}
                  placeholder="https://apiznt.zenity.zup.com.br/dune/v1/entry"
                  className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              {/* Status da Sessão e Expiração */}
              <div className="p-4 bg-[#171924] border border-[#262A3B] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        session.token && !isTokenExpired ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                    ></span>
                    <span className="text-base font-semibold text-white">Status da Sessão (JWT)</span>
                  </div>

                  {session.token && (
                    <button
                      type="button"
                      onClick={handleCopyToken}
                      className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
                    >
                      {copiedToken ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedToken ? 'Copiado!' : 'Copiar JWT'}</span>
                    </button>
                  )}
                </div>

                <div className="text-sm text-gray-300 flex items-center gap-2">
                  <span>Validade do Access Token:</span>
                  {session.expiresAt ? (
                    <span className={isTokenExpired ? 'text-rose-400 font-bold' : 'text-emerald-400 font-medium'}>
                      {isTokenExpired ? 'Expirado em ' : 'Válido até '}
                      {new Date(session.expiresAt).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-gray-500">Desconhecida / Não capturada</span>
                  )}
                </div>

                {/* Bloco do Keycloak Refresh Token */}
                <div className="pt-2 border-t border-[#262A3B] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className={`w-3.5 h-3.5 ${session.refreshToken ? 'text-emerald-400' : 'text-gray-500'}`} />
                      <span className="text-sm font-semibold text-gray-200">Keycloak Refresh Token:</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          session.refreshToken
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {session.refreshToken ? 'Disponível para renovação' : 'Não capturado'}
                      </span>
                    </div>

                    {session.refreshToken && (
                      <button
                        type="button"
                        onClick={handleManualRefresh}
                        disabled={isRefreshingToken}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                        title="Dispara a requisição oficial ao Keycloak para renovar o token"
                      >
                        <RefreshCw className={`w-3 h-3 ${isRefreshingToken ? 'animate-spin text-purple-300' : ''}`} />
                        <span>{isRefreshingToken ? 'Renovando...' : 'Renovar Token Agora'}</span>
                      </button>
                    )}
                  </div>

                  {refreshFeedback && (
                    <div
                      className={`text-xs p-2 rounded-lg border ${
                        refreshFeedback.success
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {refreshFeedback.message}
                    </div>
                  )}

                  {isTokenExpired && (
                    <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/20">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>
                        O token expirou. Ao enviar um diário, o app tentará renovar automaticamente no Keycloak.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Manual Tokens */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-300 block mb-1">
                    Access Token JWT Manual (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Bearer eyJhbGciOi..."
                    className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl px-3.5 py-2 text-xs text-gray-300 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 block mb-1">
                    Refresh Token Keycloak Manual (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={manualRefreshToken}
                    onChange={(e) => setManualRefreshToken(e.target.value)}
                    placeholder="eyJhbGciOi..."
                    className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl px-3.5 py-2 text-xs text-gray-300 focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ao autenticar com 2FA pelo app, ambos os tokens são capturados automaticamente do Keycloak.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-[#242738]">
                <div>
                  <h3 className="text-base font-bold text-white">Instruções & Templates da IA</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Personalize as diretrizes e a estrutura dos templates que a IA utilizará para organizar os relatos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetRulesToDefault}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#33384D] bg-[#1C1F2E] hover:bg-[#252A3D] text-xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer shadow-sm hover:border-purple-500/40"
                  title="Restaurar as instruções e os templates para os padrões originais definidos pelo sistema"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                  <span>Redefinir Padrão</span>
                </button>
              </div>

              {/* Bloco 1: Instruções do diário de bordo */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                  Instruções do diário de bordo
                </label>
                <textarea
                  rows={6}
                  value={formData.customInstructions}
                  onChange={(e) => setFormData({ ...formData, customInstructions: e.target.value })}
                  placeholder="Instruções gerais para a IA..."
                  className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl p-3.5 text-sm text-gray-200 focus:outline-none focus:border-purple-500 leading-relaxed font-mono"
                />
              </div>

              {/* Bloco 2: Template de Liderança */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                  Template de Liderança
                </label>
                <textarea
                  rows={8}
                  value={formData.leadershipTemplate || ''}
                  onChange={(e) => setFormData({ ...formData, leadershipTemplate: e.target.value })}
                  placeholder="Seções e instruções do template de liderança..."
                  className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl p-3.5 text-sm text-gray-200 focus:outline-none focus:border-purple-500 leading-relaxed font-mono"
                />
              </div>

              {/* Bloco 3: Template de não liderança */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                  Template de não liderança
                </label>
                <textarea
                  rows={8}
                  value={formData.nonLeadershipTemplate || ''}
                  onChange={(e) => setFormData({ ...formData, nonLeadershipTemplate: e.target.value })}
                  placeholder="Seções e instruções do template de não liderança..."
                  className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl p-3.5 text-sm text-gray-200 focus:outline-none focus:border-purple-500 leading-relaxed font-mono"
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-[#242738] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#2D3247] text-gray-300 hover:text-white hover:bg-[#1E2232] text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-base font-semibold shadow-md shadow-purple-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Configurações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
