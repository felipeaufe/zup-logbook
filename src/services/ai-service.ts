import { storage } from './storage';
import { LogbookDraft, ChatMessage, FormattedBlock, CompetenceItem, AppSettings } from '../types';
import { getAvailableCompetences } from '../data/competences';
import {
  DEFAULT_INSTRUCTIONS,
  DEFAULT_LEADERSHIP_TEMPLATE,
  DEFAULT_NON_LEADERSHIP_TEMPLATE,
} from '../data/templates';

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
        } else {
          throw new Error(
            'Credenciais da StackSpot AI não configuradas. Preencha o Token de Acesso (PAT) ou Client ID/Secret nas Configurações.'
          );
        }
      } else if (provider === 'gemini') {
        if (settings.aiApiKey) {
          return await this.callGemini(userInput, history, settings, lastDraft);
        } else {
          throw new Error('Chave de API do Gemini não configurada nas Configurações.');
        }
      } else if (provider === 'openai') {
        if (settings.aiApiKey) {
          return await this.callOpenAi(userInput, history, settings, lastDraft);
        } else {
          throw new Error('Chave de API da OpenAI não configurada nas Configurações.');
        }
      }
      throw new Error(`Provedor de IA desconhecido: ${provider}`);
    } catch (err: any) {
      console.error(`Erro ao consultar provedor ${provider}:`, err);
      throw new Error(`[IA ${provider.toUpperCase()}] ${err.message}`);
    }
  }

  private cleanCred(val?: string): string {
    return (val || '').replace(/^["'`]|["'`]$/g, '').trim();
  }

  /**
   * Testa as credenciais da StackSpot AI informadas pelo usuário
   */
  public async testStackSpotConnection(
    settings: Partial<AppSettings>
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.stackspotTokenCache = null; // força requisição limpa
      const realm = this.cleanCred(settings.stackspotRealm) || 'zup';
      const tokenUrl = `https://idm.stackspot.com/${realm}/oidc/oauth/token`;
      const token = await this.getStackSpotAccessToken(settings);
      if (!token) {
        return { success: false, message: 'Nenhum token foi retornado pelo provedor.' };
      }
      return {
        success: true,
        message: `Conexão bem-sucedida! Token de acesso obtido via OAuth2 no Realm "${realm}" (${tokenUrl}).`,
      };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  /**
   * Obtém token de acesso para a StackSpot AI (suporta Personal Access Token direto ou OAuth2 Client Credentials)
   */
  private async getStackSpotAccessToken(settings: any): Promise<string> {
    // 1. Se o usuário forneceu um Personal Access Token direto, use-o diretamente!
    const directToken = this.cleanCred(settings.stackspotToken);
    if (directToken) {
      return directToken;
    }

    // 2. Se já possuímos token em cache válido
    if (this.stackspotTokenCache && Date.now() < this.stackspotTokenCache.expiresAt - 60000) {
      return this.stackspotTokenCache.token;
    }

    const realm = this.cleanCred(settings.stackspotRealm) || 'zup';
    const tokenUrl = `https://idm.stackspot.com/${realm}/oidc/oauth/token`;
    const clientId = this.cleanCred(settings.stackspotClientId);
    const clientSecret = this.cleanCred(settings.stackspotClientSecret);

    if (!clientId || !clientSecret) {
      throw new Error(
        'Credenciais da StackSpot AI não configuradas (Client ID / Client Secret ou Personal Access Token).'
      );
    }

    console.log(`[StackSpot Auth] Solicitando token OAuth2 para URL: ${tokenUrl} (realm: "${realm}")`);

    // Método 1: Body x-www-form-urlencoded com client_id e client_secret (padrão StackSpot)
    const bodyParams = new URLSearchParams();
    bodyParams.append('grant_type', 'client_credentials');
    bodyParams.append('client_id', clientId);
    bodyParams.append('client_secret', clientSecret);

    let res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });

    // Método 2 (Fallback): Basic Auth Header se 401 (compatibilidade RFC 6749 para Keycloak)
    if (res.status === 401) {
      try {
        const basicAuth = btoa(`${clientId}:${clientSecret}`);
        const basicBody = new URLSearchParams();
        basicBody.append('grant_type', 'client_credentials');

        const basicRes = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${basicAuth}`,
          },
          body: basicBody.toString(),
        });

        if (basicRes.ok) {
          res = basicRes;
        }
      } catch (fallbackErr) {
        console.warn('[StackSpot Auth] Fallback Basic Auth falhou:', fallbackErr);
      }
    }

    if (!res.ok) {
      const err = await res.text();
      let hint = '';
      if (res.status === 401 && err.includes('invalid_client')) {
        hint = ` -> Verifique: 1) Se o Realm '${realm}' está correto (ex: 'zup' ou o slug da sua conta/workspace na StackSpot); 2) Se o Client ID e Client Secret não contêm aspas ou caracteres extras; 3) Se as credenciais foram criadas nesse realm. Como alternativa rápida, você pode gerar um Personal Access Token (PAT) no portal da StackSpot e colar no campo PAT acima.`;
      }
      throw new Error(`Falha na autenticação StackSpot (${res.status}): ${err} [Endpoint: ${tokenUrl}]${hint}`);
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
   * Constrói o prompt completo contendo as instruções, templates configurados pelo usuário,
   * catálogo oficial de competências e histórico de proposta em edição.
   */
  private buildFullPrompt(
    settings: AppSettings,
    userInput: string,
    previousDraft?: LogbookDraft
  ): string {
    const availableCompetences = getAvailableCompetences();
    const competencesListText = availableCompetences
      .map((c) => `- ID ${c.id}: ${c.name}`)
      .join('\n');

    const leadership = (settings.leadershipTemplate || DEFAULT_LEADERSHIP_TEMPLATE).trim();
    const nonLeadership = (settings.nonLeadershipTemplate || DEFAULT_NON_LEADERSHIP_TEMPLATE).trim();

    const templatesDefinition = `
TEMPLATES OFICIAIS DO PEOPLE ZUP:
1. "NON_LEADERSHIP" (Não Liderança / Especialista):
${nonLeadership}

2. "LEADERSHIP" (Liderança / Gestão):
${leadership}
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

    const instructions = (settings.customInstructions || DEFAULT_INSTRUCTIONS).trim();

    return `
${instructions}

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

  private async callStackSpotAi(
    userInput: string,
    history: ChatMessage[],
    settings: any,
    previousDraft?: LogbookDraft
  ): Promise<AiResponse> {
    const accessToken = await this.getStackSpotAccessToken(settings);
    const systemPrompt = this.buildFullPrompt(settings, userInput, previousDraft);

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
      let jsonStr = rawText.trim();
      const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      } else {
        const braceMatch = rawText.match(/(\{[\s\S]*\})/);
        if (braceMatch) {
          jsonStr = braceMatch[1].trim();
        }
      }

      const parsed = JSON.parse(jsonStr);

      const blocks: FormattedBlock[] =
        Array.isArray(parsed.blocks) && parsed.blocks.length > 0
          ? parsed.blocks
          : previousDraft?.blocks || [];

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

      if (
        selectedCompetences.length === 0 &&
        previousDraft &&
        previousDraft.competences.length > 0 &&
        !Array.isArray(parsed.competenceIds) &&
        !Array.isArray(parsed.competences)
      ) {
        selectedCompetences.push(...previousDraft.competences);
      }

      let plainContent = '';
      if (blocks.length > 0) {
        plainContent = blocks.map((b) => `${b.title}\n${b.description}`).join('\n\n');
      } else if (parsed.content && typeof parsed.content === 'string') {
        plainContent = parsed.content.trim();
      } else if (parsed.refinedText && typeof parsed.refinedText === 'string') {
        plainContent = parsed.refinedText.trim();
      } else if (previousDraft?.content) {
        plainContent = previousDraft.content;
      } else {
        plainContent = userInput;
      }

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
      console.error('Falha no parse do retorno da LLM:', err, 'Texto bruto retornado:', rawText);
      throw new Error(
        `A resposta da IA não pôde ser interpretada ou veio em formato inesperado: ${err.message}`
      );
    }
  }

  private async callGemini(
    userInput: string,
    history: ChatMessage[],
    settings: AppSettings,
    previousDraft?: LogbookDraft
  ): Promise<AiResponse> {
    const systemInstruction = this.buildFullPrompt(settings, userInput, previousDraft);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${settings.aiModel}:generateContent?key=${settings.aiApiKey}`;
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
    settings: AppSettings,
    previousDraft?: LogbookDraft
  ): Promise<AiResponse> {
    const systemPrompt = this.buildFullPrompt(settings, userInput, previousDraft);

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${settings.aiApiKey}` },
      body: JSON.stringify({
        model: settings.aiModel || 'gpt-4o-mini',
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

export const aiService = new AiService();
