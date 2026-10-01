import React, { useState, useEffect } from 'react';
import { AppSettings, AuthSession } from '../../types';
import { X, Key, Globe, Sparkles, Shield, Save, Eye, EyeOff, Check, Copy, RefreshCw, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  session: AuthSession;
  onSaveSettings: (settings: Partial<AppSettings>) => void;
  onSaveManualToken: (token: string) => void;
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
  const [showSecret, setShowSecret] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'people' | 'rules'>('ai');
  const [copiedToken, setCopiedToken] = useState(false);

  useEffect(() => {
    setFormData(settings);
    setManualToken(session.token || '');
  }, [settings, session, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    if (manualToken && manualToken !== session.token) {
      onSaveManualToken(manualToken.trim());
    }
    onClose();
  };

  const handleCopyToken = () => {
    if (session.token) {
      navigator.clipboard.writeText(session.token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
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
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
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
                ? 'border-orange-500 text-orange-400'
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
                ? 'border-orange-500 text-orange-400'
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
                ? 'border-orange-500 text-orange-400'
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
                  className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="stackspot">StackSpot AI (Oficial Zup)</option>
                  <option value="gemini">Google Gemini (Alternativa)</option>
                  <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                </select>
              </div>

              {formData.aiProvider === 'stackspot' && (
                <div className="space-y-3.5 p-4 rounded-xl bg-[#171924] border border-[#262A3B]">
                  <div className="flex items-center gap-2 text-sm font-bold text-orange-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Configuração StackSpot AI</span>
                  </div>

                  {/* Personal Access Token (PAT) */}
                  <div className="p-3.5 bg-[#13151F] border border-orange-500/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-orange-300">
                        Personal Access Token (PAT) - Recomendado
                      </label>
                      <span className="text-sm px-2.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-medium">
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
                      className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-orange-500 font-mono"
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
                      className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-orange-500 font-mono"
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
                        className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl px-3.5 py-2.5 pr-10 text-base text-white focus:outline-none focus:border-orange-500 font-mono"
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

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Realm</label>
                      <input
                        type="text"
                        placeholder="zup"
                        value={formData.stackspotRealm || 'zup'}
                        onChange={(e) =>
                          setFormData({ ...formData, stackspotRealm: e.target.value })
                        }
                        className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-orange-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Quick Command Slug (Opcional)</label>
                      <input
                        type="text"
                        placeholder="diario-de-bordo"
                        value={formData.stackspotSlug || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, stackspotSlug: e.target.value })
                        }
                        className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-orange-500 font-mono"
                      />
                    </div>
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
                      className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl px-3.5 py-2.5 pr-10 text-base text-white focus:outline-none focus:border-orange-500 font-mono"
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
                  className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              {/* Status da Sessão e Expiração */}
              <div className="p-4 bg-[#171924] border border-[#262A3B] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        session.token && !isTokenExpired ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                    ></span>
                    <span className="text-base font-semibold text-white">Status da Sessão</span>
                  </div>

                  {session.token && (
                    <button
                      type="button"
                      onClick={handleCopyToken}
                      className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1 font-medium"
                    >
                      {copiedToken ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedToken ? 'Copiado!' : 'Copiar JWT'}</span>
                    </button>
                  )}
                </div>

                <div className="text-sm text-gray-300 flex items-center gap-2">
                  <span>Validade do Token:</span>
                  {session.expiresAt ? (
                    <span className={isTokenExpired ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {isTokenExpired ? 'Expirado em ' : 'Válido até '}
                      {new Date(session.expiresAt).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-gray-500">Desconhecida / Não capturada</span>
                  )}
                </div>

                {isTokenExpired && (
                  <div className="flex items-center gap-2 text-sm text-amber-300 bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/20">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>O token expirou. Ao enviar um diário, o app tentará renovar automaticamente em background.</span>
                  </div>
                )}
              </div>

              {/* Manual Token */}
              <div>
                <label className="text-sm font-semibold text-gray-300 block mb-1.5">
                  Token JWT Manual (Caso deseje colar manualmente)
                </label>
                <textarea
                  rows={3}
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Bearer eyJhbGciOi..."
                  className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl px-3.5 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                  Instruções e Regras de Negócio para o Diário de Bordo
                </label>
                <textarea
                  rows={8}
                  value={formData.customInstructions}
                  onChange={(e) => setFormData({ ...formData, customInstructions: e.target.value })}
                  className="w-full bg-[#1A1D2B] border border-[#2D3247] rounded-xl p-3.5 text-base text-gray-200 focus:outline-none focus:border-orange-500 leading-relaxed font-mono"
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-base font-semibold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
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
