import { storage } from './store';
import { LogbookDraft, ChatMessage, FormattedBlock, CompetenceItem } from '../types';
import { getAvailableCompetences } from '../data/competences';

export interface AiResponse {
  message: string;
  draft?: LogbookDraft;
}

export class AiService {
  private stackspotTokenCache: { token: string; expiresAt: number } | null = null;

  public async processRelato(userInput: string, history: ChatMessage[] = []): Promise<AiResponse> {
    const settings = storage.getSettings();
    const provider = settings.aiProvider || 'stackspot';

    // Procura a última proposta ativa para permitir ajustes contínuos via chat
    const lastDraft = [...history].reverse().find((m) => m.draft && m.status !== 'submitted')?.draft;

    try {
      if (provider === 'stackspot') {
        if (
          (settings.stackspotClientId && settings.stackspotClientSecret) ||
          (settings.stackspotToken && settings.stackspotToken.trim())
        ) {
          return await this.callStackSpotAi(userInput, history, settings, lastDraft);
        }
      } else if (provider === 'gemini' && settings.aiApiKey) {
        return await this.callGemini(userInput, history, settings.aiApiKey, settings.aiModel, settings.customInstructions, lastDraft);
      } else if (provider === 'openai' && settings.aiApiKey) {
        return await this.callOpenAi(userInput, history, settings.aiApiKey, settings.aiModel, settings.customInstructions, lastDraft);
      }
    } catch (err: any) {
      console.error(`Erro ao consultar provedor ${provider}:`, err);
      return this.createManualFallback(userInput, `${provider} retornou erro: ${err.message}`);
    }

    // Fallback manual caso nenhuma chave ou credencial esteja configurada
    return this.createManualFallback(userInput);
  }

  /**
   * Obtém token de acesso para a StackSpot AI (suporta Personal Access Token direto ou OAuth2 Client Credentials)
   */
  private async getStackSpotAccessToken(settings: any): Promise<string> {
    // 1. Se o usuário forneceu um Personal Access Token direto, use-o diretamente!
    if (settings.stackspotToken && settings.stackspotToken.trim()) {
      return settings.stackspotToken.trim();
    }

    // 2. Se já possuímos token em cache válido
    if (this.stackspotTokenCache && Date.now() < this.stackspotTokenCache.expiresAt - 60000) {
      return this.stackspotTokenCache.token;
    }

    const realm = (settings.stackspotRealm || 'zup').trim();
    const tokenUrl = `https://idm.stackspot.com/${realm}/oidc/oauth/token`;
    const clientId = (settings.stackspotClientId || '').trim();
    const clientSecret = (settings.stackspotClientSecret || '').trim();

    if (!clientId || !clientSecret) {
      throw new Error('Credenciais da StackSpot AI não configuradas (Client ID / Client Secret ou Personal Access Token).');
    }

    console.log(`Solicitando token OAuth2 da StackSpot para realm: ${realm}`);

    // Tentativa com formato padrão da documentação StackSpot (form-urlencoded)
    const bodyParams = new URLSearchParams();
    bodyParams.append('grant_type', 'client_credentials');
    bodyParams.append('client_id', clientId);
    bodyParams.append('client_secret', clientSecret);

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Falha na autenticação StackSpot (${res.status}): ${err}`);
    }

    const data = await res.json();
    const accessToken = data.access_token;
    const expiresIn = data.expires_in || 3600;

    this.stackspotTokenCache = {
      token: accessToken,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    return accessToken;
  }

  /**
   * Constrói o prompt completo contendo as instruções, templates disponíveis,
   * catálogo oficial de competências e histórico de proposta em edição.
   */
  private buildFullPrompt(
    customInstructions: string,
    userInput: string,
    previousDraft?: LogbookDraft
  ): string {
    const availableCompetences = getAvailableCompetences();
    const competencesListText = availableCompetences
      .map((c) => `- ID ${c.id}: ${c.name}`)
      .join('\n');

    const templatesDefinition = `
TEMPLATES OFICIAIS DO PEOPLE ZUP:
1. "NON_LEADERSHIP" (Não Liderança / Especialista):
   - Seções do template:
     * Resultado/impacto (momento atual): Cases e entregas alinhados com as expectativas da Zup.
     * Atitude e comportamento: Contribuições para agregar valor aos clientes e ao time.
     * Conhecimento Técnico da Prática: Tecnologias, ferramentas e metodologias aplicadas na prática.
     * Aprendizado Tech: Aprendizados e evolução técnica na execução e estudos.
     * Expectativas de Entregas: Combinados e expectativas alinhados com a liderança para os próximos períodos.
     * Comentários Adicionais e Feedback Recebido: Comentários e feedbacks recebidos.
2. "LEADERSHIP" (Liderança / Gestão):
   - Seções do template:
     * Resultado/impacto (momento atual): Cases e entregas da área alinhados com as expectativas da Zup.
     * Atitude e comportamento: Como atitudes e comportamentos agregam valor a clientes e ao sucesso da área/time.
     * Conhecimento Técnico da Prática: Tecnologias e metodologias aplicadas como liderança e incentivo ao time.
     * Aprendizado Tech: Aprendizados e evolução técnica como liderança e incentivo ao time.
     * Expectativas de Entregas: Combinados e expectativas de entregas alinhados com o time.
     * Comentários Adicionais e Feedback Recebido: Comentários e feedbacks recebidos.
`;

    const contextPrompt = previousDraft
      ? `\n\nPROPOSTA ATUAL EM EDIÇÃO (Mantenha o que não for alterado e incorpore os novos pedidos do usuário):\n` +
        JSON.stringify(
          {
            title: previousDraft.title,
            blocks: previousDraft.blocks,
            hours: previousDraft.hours,
            templateFor: previousDraft.templateFor,
            competences: previousDraft.competences.map((c) => ({ id: c.id, name: c.name })),
          },
          null,
          2
        ) +
        `\n\nATENÇÃO: O usuário está enviando uma instrução de ajuste, correção ou complemento para a proposta acima.`
      : '';

    return `
${customInstructions || 'Você é o assistente inteligente de Diário de Bordo da Zup.'}

${templatesDefinition}

CATÁLOGO OFICIAL DE COMPETÊNCIAS DA ZUP (Selecione apenas as competências desta lista usando seus IDs numéricos):
${competencesListText}

INSTRUÇÕES OBRIGATÓRIAS:
1. Valide o relato do usuário e selecione o modelo de template mais adequado ("NON_LEADERSHIP" ou "LEADERSHIP").
2. Formate o relato preenchendo as seções relevantes do template escolhido ("title" com o nome da seção e "description" com o conteúdo).
3. Crie um título profissional e conciso para o registro.
4. Analise detalhadamente o relato e selecione EXCLUSIVAMENTE no catálogo oficial acima quais competências mais se adequam às realizações descritas. Retorne os IDs numéricos correspondentes no campo "competenceIds".
5. Não invente IDs nem competências fora da lista fornecida. Se nenhuma competência se aplicar com segurança, retorne lista vazia [].

Responda OBRIGATORIAMENTE em formato JSON estrito:
{
  "message": "Mensagem conversacional amigável explicando o que foi estruturado e as competências indicadas",
  "title": "Título conciso da realização",
  "blocks": [
    { "title": "Nome da Seção do Template:", "description": "Descritivo do que foi realizado" }
  ],
  "templateFor": "NON_LEADERSHIP" | "LEADERSHIP",
  "competenceIds": [1, 23],
  "hours": 8
}
${contextPrompt}
`;
  }

  /**
   * Fallback quando não há conexão com IA ou quando ocorre falha:
   * Sem título, sem competências calculadas e com o texto bruto inserido no conteúdo.
   */
  public createManualFallback(userInput: string, errorMessage?: string): AiResponse {
    const message = errorMessage
      ? `⚠️ Não foi possível obter sugestão da IA (${errorMessage}). O seu relato foi mantido abaixo no Conteúdo para que você preencha manualmente o título, competências ou faça ajustes:`
      : `ℹ️ Nenhuma IA configurada ou conectada. O seu relato foi inserido no Conteúdo para que você faça o registro manualmente:`;

    return {
      message,
      draft: {
        title: '',
        blocks: [],
        content: userInput,
        templateFor: 'NON_LEADERSHIP',
        isPerformanceReview: true,
        competences: [],
        hours: 8,
        rawInput: userInput,
        type: 'livre',
      },
    };
  }

  /**
   * Executa chamada à API da StackSpot AI
   */
  private async callStackSpotAi(
    userInput: string,
    history: ChatMessage[],
    settings: any,
    previousDraft?: LogbookDraft
  ): Promise<AiResponse> {
    const accessToken = await this.getStackSpotAccessToken(settings);
    const systemPrompt = this.buildFullPrompt(settings.customInstructions, userInput, previousDraft);

    // Se houver um Quick Command configurado, disparar via Quick Command
    if (settings.stackspotSlug) {
      const qcUrl = `https://genai-code-buddy-api.stackspot.com/v1/quick-commands/create-execution/${settings.stackspotSlug}`;
      const qcRes = await fetch(qcUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_data: `${systemPrompt}\n\nRelato do Zupper:\n${userInput}`,
        }),
      });

      if (!qcRes.ok) {
        throw new Error(`StackSpot Quick Command retornou ${qcRes.status}: ${await qcRes.text()}`);
      }

      const qcData = await qcRes.json();
      return this.parseAiResult(qcData.result || JSON.stringify(qcData), userInput, previousDraft);
    }

    // Caso contrário, chamar endpoint de chat padrão da StackSpot
    const chatUrl = 'https://genai-code-buddy-api.stackspot.com/v1/chat';

    const chatMessages: any[] = [{ role: 'system', content: systemPrompt }];
    for (const msg of history.slice(-4)) {
      chatMessages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      });
    }
    chatMessages.push({ role: 'user', content: userInput });

    const chatRes = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        streaming: false,
        messages: chatMessages,
      }),
    });

    if (!chatRes.ok) {
      const err = await chatRes.text();
      throw new Error(`StackSpot Chat API retornou ${chatRes.status}: ${err}`);
    }

    const chatData = await chatRes.json();
    const content = chatData.message?.content || chatData.content || '';
    return this.parseAiResult(content, userInput, previousDraft);
  }

  private parseAiResult(
    rawText: string,
    userInput: string,
    previousDraft?: LogbookDraft
  ): AiResponse {
    try {
      const cleanJson = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const blocks: FormattedBlock[] = Array.isArray(parsed.blocks) && parsed.blocks.length > 0
        ? parsed.blocks
        : previousDraft?.blocks || [];

      // Seleção de competências EXCLUSIVAMENTE feita pela LLM
      const available = getAvailableCompetences();
      const selectedCompetences: CompetenceItem[] = [];

      const returnedIds: number[] = [];
      if (Array.isArray(parsed.competenceIds)) {
        for (const item of parsed.competenceIds) {
          const num = typeof item === 'number' ? item : parseInt(item, 10);
          if (!isNaN(num)) returnedIds.push(num);
        }
      } else if (Array.isArray(parsed.competences)) {
        for (const item of parsed.competences) {
          const num = typeof item === 'number' ? item : item?.id;
          if (num && !isNaN(num)) returnedIds.push(num);
        }
      }

      for (const id of returnedIds) {
        const found = available.find((c) => c.id === id);
        if (found && !selectedCompetences.some((c) => c.id === found.id)) {
          selectedCompetences.push(found);
        }
      }

      // Se for um ajuste e a LLM não informou lista de competências, mantém as anteriores do draft
      if (
        selectedCompetences.length === 0 &&
        previousDraft &&
        previousDraft.competences.length > 0 &&
        !Array.isArray(parsed.competenceIds) &&
        !Array.isArray(parsed.competences)
      ) {
        selectedCompetences.push(...previousDraft.competences);
      }

      const plainContent = blocks.length > 0
        ? blocks.map((b) => `${b.title}\n${b.description}`).join('\n\n')
        : userInput;

      return {
        message:
          parsed.message ||
          (previousDraft
            ? 'Ajustei a proposta conforme sua solicitação:'
            : 'Estruturei o seu relato e selecionei as competências correspondentes:'),
        draft: {
          title: parsed.title || previousDraft?.title || '',
          blocks,
          content: plainContent,
          templateFor: parsed.templateFor === 'LEADERSHIP' ? 'LEADERSHIP' : 'NON_LEADERSHIP',
          isPerformanceReview: true,
          competences: selectedCompetences,
          hours: parsed.hours || previousDraft?.hours || 8,
          rawInput: userInput,
        },
      };
    } catch (err: any) {
      console.warn('Falha no parse do retorno da LLM:', err);
      return this.createManualFallback(userInput, 'A IA retornou um formato inesperado');
    }
  }

  private async callGemini(
    userInput: string,
    history: ChatMessage[],
    apiKey: string,
    model: string,
    customInstructions: string,
    previousDraft?: LogbookDraft
  ): Promise<AiResponse> {
    const systemInstruction = this.buildFullPrompt(customInstructions, userInput, previousDraft);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: userInput }] }],
        generationConfig: { response_mime_type: 'application/json', temperature: 0.3 },
      }),
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return this.parseAiResult(text, userInput, previousDraft);
  }

  private async callOpenAi(
    userInput: string,
    history: ChatMessage[],
    apiKey: string,
    model: string,
    customInstructions: string,
    previousDraft?: LogbookDraft
  ): Promise<AiResponse> {
    const systemPrompt = this.buildFullPrompt(customInstructions, userInput, previousDraft);

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return this.parseAiResult(data.choices?.[0]?.message?.content, userInput, previousDraft);
  }
}

export let aiService: AiService;

export function initAiService() {
  if (!aiService) {
    aiService = new AiService();
  }
  return aiService;
}
