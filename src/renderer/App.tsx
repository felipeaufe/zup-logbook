import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { getAuthToken } from '../services/auth';

interface AppProps {
  onClose?: () => void;
}

export const App: React.FC<AppProps> = ({ onClose }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = jsonInput.trim();
    if (!trimmed) {
      setStatus({
        type: 'error',
        message: 'Por favor, cole o JSON do relato antes de enviar.',
      });
      return;
    }

    // Valida se a entrada possui sintaxe JSON válida antes do envio
    try {
      JSON.parse(trimmed);
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: `JSON inválido: ${err.message}`,
      });
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setStatus({
        type: 'error',
        message: 'Token de autenticação não encontrado. Certifique-se de estar logado no People Zup.',
      });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch('https://apiznt.zenity.zup.com.br/dune/v1/entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
          authorization: `Bearer ${token}`,
        },
        credentials: 'omit',
        body: trimmed,
      });

      const responseText = await response.text();
      let responseData: any = {};
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { text: responseText };
      }

      if (response.ok) {
        const entryId = responseData?.id ? ` #${responseData.id}` : '';
        setStatus({
          type: 'success',
          message: `Diário de Bordo${entryId} registrado com sucesso no People Zup!`,
        });
        setJsonInput(''); // Limpa o formulário após envio com sucesso
      } else {
        const errorMsg =
          responseData?.message ||
          responseData?.error ||
          responseText ||
          `Status HTTP ${response.status}`;
        setStatus({
          type: 'error',
          message: `Falha ao registrar diário (${response.status}): ${errorMsg}`,
        });
      }
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: `Erro de conexão com People Zup: ${err.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#12141c] text-gray-100 rounded-2xl border border-gray-800 shadow-2xl p-5 flex flex-col gap-4 font-sans select-none">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
          <h1 className="text-base font-semibold text-white tracking-wide">
            Zup Logbook
          </h1>
          <span className="text-[11px] bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded-full border border-purple-700/30">
            Registro de Performance
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
            title="Fechar"
            type="button"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Input JSON */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-400">
          Cole o JSON do relato:
        </label>
        <textarea
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value);
            if (status) setStatus(null);
          }}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              handleSubmit();
            }
          }}
          placeholder='{"title": "...", "content": "...", "competences": [...]}'
          rows={7}
          className="w-full bg-[#0a0b10] border border-gray-700/80 focus:border-purple-500 rounded-xl p-3 text-xs font-mono text-purple-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-y transition-all"
        />
        <span className="text-[11px] text-gray-500 text-right">
          Pressione Ctrl+Enter para enviar
        </span>
      </div>

      {/* Notificação de Sucesso ou Falha */}
      {status && (
        <div
          className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
            status.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/40 border-red-500/30 text-red-300'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          )}
          <span className="flex-1 break-words">{status.message}</span>
        </div>
      )}

      {/* Botão de Enviar */}
      <button
        onClick={() => handleSubmit()}
        disabled={isSubmitting || !jsonInput.trim()}
        type="button"
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Enviando...</span>
          </>
        ) : (
          <>
            <Send size={16} />
            <span>Enviar para o People</span>
          </>
        )}
      </button>
    </div>
  );
};

export default App;
