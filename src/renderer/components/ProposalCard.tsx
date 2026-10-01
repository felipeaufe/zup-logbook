import React, { useState } from 'react';
import { LogbookDraft, CompetenceItem } from '../../types';
import { ALL_COMPETENCES } from '../../data/competences';
import {
  Check,
  Edit3,
  Loader2,
  Plus,
  Trash2,
  Tag,
  Briefcase,
  Layers,
  Search,
  X,
  Sparkles,
  FileText,
  Heading,
  Code2,
  Crown,
} from 'lucide-react';

interface ProposalCardProps {
  draft: LogbookDraft;
  isSubmitting: boolean;
  onApprove: (draft: LogbookDraft) => void;
  onRefineWithAi?: (draft: LogbookDraft) => void;
  status?: 'thinking' | 'pending_approval' | 'submitting' | 'submitted' | 'error';
  availableCompetences?: CompetenceItem[];
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  draft,
  isSubmitting,
  onApprove,
  onRefineWithAi,
  status = 'pending_approval',
  availableCompetences,
}) => {
  const competenceList =
    availableCompetences && availableCompetences.length > 0 ? availableCompetences : ALL_COMPETENCES;

  const getInitialContent = (d: LogbookDraft) =>
    d.content && d.content.trim()
      ? d.content
      : d.blocks && d.blocks.length > 0
      ? d.blocks.map((b) => `${b.title}\n${b.description}`).join('\n\n')
      : '';

  const [isEditing, setIsEditing] = useState(false);
  const [editedDraft, setEditedDraft] = useState<LogbookDraft>({
    ...draft,
    content: getInitialContent(draft),
  });
  const [showCompetencesDropdown, setShowCompetencesDropdown] = useState(false);
  const [competenceSearch, setCompetenceSearch] = useState('');

  React.useEffect(() => {
    setEditedDraft({
      ...draft,
      content: getInitialContent(draft),
    });
  }, [draft]);

  const current = isEditing ? editedDraft : draft;
  const currentContent = isEditing ? editedDraft.content : getInitialContent(draft);

  const handleSaveEdit = () => {
    setIsEditing(false);
    draft.title = editedDraft.title;
    draft.content = editedDraft.content;
    draft.templateFor = editedDraft.templateFor;
    draft.competences = editedDraft.competences;
    draft.isPerformanceReview = editedDraft.isPerformanceReview;
  };

  const handleToggleCompetence = (comp: CompetenceItem) => {
    const exists = current.competences.some((c) => c.id === comp.id);
    const updated = exists
      ? current.competences.filter((c) => c.id !== comp.id)
      : [...current.competences, comp];

    if (isEditing) {
      setEditedDraft({ ...editedDraft, competences: updated });
    } else {
      draft.competences = updated;
      setEditedDraft({ ...draft, competences: updated, content: currentContent });
    }
  };

  const handleSelectTemplate = (template: 'NON_LEADERSHIP' | 'LEADERSHIP') => {
    if (isEditing) {
      setEditedDraft({ ...editedDraft, templateFor: template });
    } else {
      draft.templateFor = template;
      setEditedDraft({ ...draft, templateFor: template, content: currentContent });
    }
  };

  return (
    <div className="w-full max-w-2xl bg-[#161822] border border-[#262A3B] rounded-2xl p-5 shadow-xl transition-all">
      {/* Header banner */}
      <div className="flex items-center justify-between border-b border-[#242738] pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full animate-pulse ${
              current.type === 'livre' ? 'bg-blue-400' : 'bg-orange-400'
            }`}
          ></span>
          <h3 className="font-semibold text-white text-base">
            {current.type === 'livre' ? 'Amostra - Registro Livre' : 'Proposta - Registro de Performance'}
          </h3>
          {current.type === 'livre' && (
            <span className="text-sm px-2.5 py-0.5 rounded-full font-medium border bg-blue-500/10 text-blue-400 border-blue-500/20">
              Livre
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {current.type === 'livre' && onRefineWithAi && (
            <button
              onClick={() => onRefineWithAi(current)}
              disabled={isSubmitting || status === 'submitted'}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
              title="Estruturar com IA e selecionar competências oficiais"
            >
              <Sparkles className="w-4 h-4" />
              <span>Refinar com IA</span>
            </button>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            disabled={isSubmitting || status === 'submitted'}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border border-[#2D3144] text-gray-300 hover:text-white hover:bg-[#202434] transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditing ? 'Concluir Edição' : 'Editar Campos'}</span>
          </button>
        </div>
      </div>

      {/* Main card body */}
      <div className="space-y-4">
        {/* Banner para Registro Livre */}
        {current.type === 'livre' && (
          <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between text-sm text-blue-300">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Amostra de texto bruto. Você pode enviar diretamente ou refinar com IA.</span>
            </div>
            {onRefineWithAi && (
              <button
                type="button"
                onClick={() => onRefineWithAi(current)}
                className="underline font-semibold hover:text-white shrink-0 ml-2 cursor-pointer text-sm"
              >
                Refinar agora
              </button>
            )}
          </div>
        )}

        {/* Modelo de Template - Seletor Lúdico Acima do Título */}
        {current.type !== 'livre' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold tracking-wider text-gray-300 uppercase flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-orange-400" />
                <span>Modelo de Template</span>
              </label>
              <span className="text-sm text-gray-400">
                Clique para alternar o modelo
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Opção Não Liderança */}
              <button
                type="button"
                disabled={isSubmitting || status === 'submitted'}
                onClick={() => handleSelectTemplate('NON_LEADERSHIP')}
                className={`relative flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer group ${
                  current.templateFor === 'NON_LEADERSHIP'
                    ? 'bg-gradient-to-r from-orange-500/15 to-amber-500/10 border-orange-500/50 shadow-sm shadow-orange-500/10 ring-1 ring-orange-500/30'
                    : 'bg-[#141622] hover:bg-[#1A1D2D] border-[#25283A] text-gray-400 hover:text-gray-200'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    current.templateFor === 'NON_LEADERSHIP'
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 scale-105'
                      : 'bg-[#1E2235] text-gray-400 group-hover:text-gray-200'
                  }`}
                >
                  <Code2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-base font-semibold ${
                        current.templateFor === 'NON_LEADERSHIP' ? 'text-white' : 'text-gray-300'
                      }`}
                    >
                      Não Liderança
                    </span>
                    {current.templateFor === 'NON_LEADERSHIP' && (
                      <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 leading-tight mt-0.5 truncate">
                    Especialistas & Execução Técnica
                  </p>
                </div>
              </button>

              {/* Opção Liderança */}
              <button
                type="button"
                disabled={isSubmitting || status === 'submitted'}
                onClick={() => handleSelectTemplate('LEADERSHIP')}
                className={`relative flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer group ${
                  current.templateFor === 'LEADERSHIP'
                    ? 'bg-gradient-to-r from-purple-500/15 to-indigo-500/10 border-purple-500/50 shadow-sm shadow-purple-500/10 ring-1 ring-purple-500/30'
                    : 'bg-[#141622] hover:bg-[#1A1D2D] border-[#25283A] text-gray-400 hover:text-gray-200'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    current.templateFor === 'LEADERSHIP'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-105'
                      : 'bg-[#1E2235] text-gray-400 group-hover:text-gray-200'
                  }`}
                >
                  <Crown className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-base font-semibold ${
                        current.templateFor === 'LEADERSHIP' ? 'text-white' : 'text-gray-300'
                      }`}
                    >
                      Liderança
                    </span>
                    {current.templateFor === 'LEADERSHIP' && (
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 leading-tight mt-0.5 truncate">
                    Gestão, Pessoas & Estratégia
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="text-sm font-semibold tracking-wider text-gray-300 uppercase flex items-center gap-1.5 mb-1.5">
            <Heading className="w-4 h-4 text-orange-400" />
            <span>Título do Registro</span>
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedDraft.title}
              placeholder="Digite um título para o registro (opcional)"
              onChange={(e) => setEditedDraft({ ...editedDraft, title: e.target.value })}
              className="w-full bg-[#12141D] border border-[#33384D] focus:border-orange-500 rounded-xl p-3.5 text-base font-semibold text-white placeholder-gray-500 focus:outline-none transition-colors"
            />
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="bg-[#191C29] hover:bg-[#1C2030] p-4 rounded-xl border border-[#252838] hover:border-orange-500/40 text-base text-gray-100 font-semibold cursor-pointer transition-colors group relative"
              title="Clique para editar o título"
            >
              <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-sm text-orange-400 flex items-center gap-1 bg-[#13151F] px-2.5 py-0.5 rounded border border-orange-500/30">
                <Edit3 className="w-3.5 h-3.5" />
                <span>Clique para editar</span>
              </div>
              {current.title ? (
                <span>{current.title}</span>
              ) : (
                <span className="text-gray-500 font-normal italic">
                  Sem título registrado (clique para adicionar)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Conteúdo do Diário (Textarea único como no portal original) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold tracking-wider text-gray-300 uppercase flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-orange-400" />
              <span>Conteúdo do Diário de Bordo</span>
            </label>
            <span
              className={`text-sm font-mono ${
                currentContent.length >= 2000
                  ? 'text-rose-400 font-bold'
                  : currentContent.length > 1800
                  ? 'text-amber-400'
                  : 'text-gray-400'
              }`}
            >
              {currentContent.length} / 2000 caracteres
            </span>
          </div>

          {isEditing ? (
            <textarea
              rows={8}
              maxLength={2000}
              value={editedDraft.content}
              onChange={(e) => {
                const newContent = e.target.value.slice(0, 2000);
                setEditedDraft({
                  ...editedDraft,
                  content: newContent,
                });
              }}
              className="w-full bg-[#12141D] border border-[#33384D] focus:border-orange-500 rounded-xl p-3.5 text-base leading-relaxed text-gray-100 placeholder-gray-500 focus:outline-none resize-y font-sans transition-colors"
              placeholder="Digite livremente o que você realizou (máximo 2000 caracteres)..."
            />
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="bg-[#191C29] hover:bg-[#1C2030] p-4 rounded-xl border border-[#252838] hover:border-orange-500/40 text-base text-gray-200 leading-relaxed whitespace-pre-wrap font-sans cursor-pointer transition-colors group relative"
              title="Clique para editar o texto"
            >
              <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-sm text-orange-400 flex items-center gap-1 bg-[#13151F] px-2.5 py-0.5 rounded border border-orange-500/30">
                <Edit3 className="w-3.5 h-3.5" />
                <span>Clique para editar</span>
              </div>
              {currentContent || 'Nenhum conteúdo registrado.'}
            </div>
          )}
        </div>

        {/* Competences Tags (Apenas para Registro de Performance) */}
        {current.type !== 'livre' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold tracking-wider text-gray-300 uppercase flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-orange-400" />
                <span>Competências Selecionadas ({current.competences.length})</span>
              </label>
              <button
                type="button"
                onClick={() => setShowCompetencesDropdown(!showCompetencesDropdown)}
                className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showCompetencesDropdown ? 'Fechar Catálogo' : 'Gerenciar Competências'}</span>
              </button>
            </div>

            {/* Active tags */}
            <div className="flex flex-wrap gap-2">
              {current.competences.map((comp) => (
                <span
                  key={comp.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/25 text-orange-300 text-sm font-medium"
                >
                  <span>{comp.name}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleCompetence(comp)}
                    className="hover:text-rose-400 text-orange-400/70 cursor-pointer text-base leading-none"
                    title="Remover competência"
                  >
                    ×
                  </button>
                </span>
              ))}
              {current.competences.length === 0 && (
                <p className="text-sm text-gray-400 italic">Nenhuma competência selecionada.</p>
              )}
            </div>

            {/* Dropdown / selector for all competences with search input */}
            {showCompetencesDropdown && (
              <div className="mt-3 p-4 bg-[#13151F] border border-[#2A2E42] rounded-xl space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-300 uppercase font-semibold">
                    Catálogo de Competências People Zup
                  </span>
                  <span className="text-sm text-orange-400 font-mono">
                    {
                      competenceList.filter((c) =>
                        c.name.toLowerCase().includes(competenceSearch.toLowerCase().trim())
                      ).length
                    }{' '}
                    de {competenceList.length}
                  </span>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Filtrar competência (ex: Java, Liderança, Testes, Cloud)..."
                    value={competenceSearch}
                    onChange={(e) => setCompetenceSearch(e.target.value)}
                    className="w-full bg-[#1C1F2E] border border-[#33384D] focus:border-orange-500 rounded-lg pl-9 pr-9 py-2 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                    autoFocus
                  />
                  {competenceSearch && (
                    <button
                      type="button"
                      onClick={() => setCompetenceSearch('')}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                      title="Limpar busca"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {competenceList.filter((comp) =>
                      comp.name.toLowerCase().includes(competenceSearch.toLowerCase().trim())
                    ).map((comp) => {
                      const selected = current.competences.some((c) => c.id === comp.id);
                      return (
                        <button
                          key={comp.id}
                          type="button"
                          onClick={() => handleToggleCompetence(comp)}
                          className={`text-left px-3 py-2 rounded-lg text-sm transition-colors truncate flex items-center justify-between cursor-pointer ${
                            selected
                              ? 'bg-orange-500/20 text-orange-300 font-semibold border border-orange-500/30'
                              : 'text-gray-300 hover:bg-[#1E2232] hover:text-white border border-transparent'
                          }`}
                        >
                          <span className="truncate">{comp.name}</span>
                          {selected && <Check className="w-3.5 h-3.5 text-orange-400 shrink-0 ml-1.5" />}
                        </button>
                      );
                    })}
                  </div>

                  {competenceList.filter((comp) =>
                    comp.name.toLowerCase().includes(competenceSearch.toLowerCase().trim())
                  ).length === 0 && (
                    <div className="py-6 text-center text-sm text-gray-400">
                      Nenhuma competência encontrada para "{competenceSearch}".
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-[#242738] flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-400 flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              current.type === 'livre' ? 'bg-blue-400' : 'bg-orange-400'
            }`}
          ></span>
          <span>
            {current.type === 'livre'
              ? 'Para ajustar o texto ou título, clique em Editar Campos ou digite no chat.'
              : 'Para ajustar a proposta, digite o que deseja alterar no chat abaixo.'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <button
              onClick={handleSaveEdit}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base border border-[#3A3F55] bg-[#222534] hover:bg-[#2B2F42] hover:border-gray-500 text-gray-200 hover:text-white shadow-md hover:scale-[1.02] cursor-pointer transition-all"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Salvar Edição</span>
            </button>
          ) : (
            <button
              onClick={() => onApprove({ ...current, content: currentContent })}
              disabled={isSubmitting || status === 'submitted'}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base shadow-lg transition-all ${
                status === 'submitted'
                  ? 'bg-emerald-600 text-white cursor-default'
                  : current.type === 'livre'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-blue-500/25 hover:scale-[1.02] cursor-pointer'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25 hover:scale-[1.02] cursor-pointer'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Enviando para People Dune...</span>
                </>
              ) : status === 'submitted' ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Enviado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Aprovar e Enviar</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
