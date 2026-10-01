import { storage } from './store';
import { authManager } from './auth-manager';
import { LogbookDraft, SubmissionResult, CompetenceItem } from '../types';
import { setDynamicCompetences, getAvailableCompetences } from '../data/competences';

export class ApiClient {
  public async fetchCompetences(forceRefresh = false): Promise<CompetenceItem[]> {
    const session = storage.getSession();
    const settings = storage.getSettings();

    const cached = storage.getCachedCompetences();
    if (!forceRefresh && cached && cached.length > 0) {
      setDynamicCompetences(cached);
      return cached;
    }

    if (!session.token) {
      return cached && cached.length > 0 ? cached : getAvailableCompetences();
    }

    const endpoint = 'https://apiznt.zenity.zup.com.br/dune/v1/performance-review/competence';
    const headers: Record<string, string> = {
      Accept: 'application/json, text/plain, */*',
      authorization: `Bearer ${session.token}`,
      Origin: 'https://people.zup.com.br',
      Referer: 'https://people.zup.com.br/',
      'User-Agent':
        settings.capturedHeaders?.['user-agent'] ||
        'Mozilla/5.0 (X11; Linux x86_64; rv:156.0) Gecko/20100101 Firefox/156.0',
    };

    try {
      console.log(`Consultando competências dinâmicas no People Zup (${endpoint})...`);
      let response = await fetch(endpoint, {
        method: 'GET',
        headers,
      });

      if (response.status === 401) {
        console.warn('401 ao buscar competências. Tentando renovar token silenciosamente...');
        const renewed = await authManager.refreshTokenSilently();
        if (renewed) {
          const freshSession = storage.getSession();
          headers.authorization = `Bearer ${freshSession.token}`;
          response = await fetch(endpoint, {
            method: 'GET',
            headers,
          });
        }
      }

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          console.log(`Carregadas ${data.length} competências dinâmicas do People Zup com sucesso!`);
          storage.setCachedCompetences(data);
          setDynamicCompetences(data);
          return data;
        }
      } else {
        console.warn(`Resposta não esperada da API de competências (${response.status})`);
      }
    } catch (err: any) {
      console.error('Erro ao consultar competências dinâmicas:', err.message);
    }

    return cached && cached.length > 0 ? cached : getAvailableCompetences();
  }
  public async submitLogbook(draft: LogbookDraft, isRetry = false): Promise<SubmissionResult> {
    const session = storage.getSession();
    const settings = storage.getSettings();

    if (!session.token) {
      return {
        success: false,
        message: 'Token de autenticação não encontrado. Por favor, conecte-se ao People Zup.',
      };
    }

    // Se o token já expirou de acordo com o JWT exp, tentar renovação silenciosa antes de enviar
    if (session.isExpired && !isRetry) {
      console.log('Token JWT expirado detectado antes do envio. Tentando renovação silenciosa...');
      const renewed = await authManager.refreshTokenSilently();
      if (renewed) {
        return this.submitLogbook(draft, true);
      }
    }

    const targetUrl = settings.logbookEndpoint || 'https://apiznt.zenity.zup.com.br/dune/v1/entry';

    // Obtém o texto completo do diário (prioriza draft.content, com fallback para blocos) limitado a 2000 caracteres
    const rawContent =
      (draft.content && draft.content.trim()) ||
      (draft.blocks && draft.blocks.length > 0
        ? draft.blocks.map((b) => `${b.title}\n${b.description}`).join('\n\n')
        : '');
    const plainContent = rawContent.slice(0, 2000);

    // Converte o texto linha por linha para a estrutura Slate AST (formattedContent), exatamente como o portal do People Zup faz
    const formattedContent = plainContent.split('\n').map((line) => ({
      type: 'paragraph',
      children: [{ text: line }],
    }));

    const isPerformance = draft.isPerformanceReview !== false && draft.type !== 'livre';

    // Estrutura exata do payload conforme People Dune:
    // Para Registro Livre: content, formattedContent, title, isPerformanceReview: false
    // Para Performance: title, formattedContent, isPerformanceReview: true, competences, metadata, content
    const payload = isPerformance
      ? {
          title: draft.title || '',
          formattedContent,
          isPerformanceReview: true,
          competences: (draft.competences || []).map((c) => ({ id: c.id, name: c.name })),
          metadata: {
            templateFor: draft.templateFor || 'NON_LEADERSHIP',
          },
          content: plainContent,
        }
      : {
          content: plainContent,
          formattedContent,
          title: draft.title || '',
          isPerformanceReview: false,
        };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: '*/*',
      authorization: `Bearer ${session.token}`,
      Origin: 'https://people.zup.com.br',
      Referer: 'https://people.zup.com.br/',
      'User-Agent':
        settings.capturedHeaders?.['user-agent'] ||
        'Mozilla/5.0 (X11; Linux x86_64; rv:156.0) Gecko/20100101 Firefox/156.0',
    };

    console.log(`Disparando envio para: ${targetUrl}`);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let responseData: any = {};
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { text: responseText };
      }

      if (response.ok) {
        return {
          success: true,
          message: `Diário de Bordo #${responseData?.id || ''} registrado com sucesso no People Zup!`,
          responseStatus: response.status,
          data: responseData,
        };
      }

      // Se retornou 401 (token expirado) e ainda não tentamos retry:
      if (response.status === 401 && !isRetry) {
        console.warn('API retornou 401 Unauthorized. Tentando renovação silenciosa do token...');
        const renewed = await authManager.refreshTokenSilently();
        if (renewed) {
          console.log('Token renovado com sucesso. Reenviando requisição...');
          const retryResult = await this.submitLogbook(draft, true);
          retryResult.refreshedToken = true;
          return retryResult;
        }

        // Se renovação silenciosa falhar, solicitar reautenticação
        authManager.openLogin();
        return {
          success: false,
          message: 'Sua sessão expirou no People Zup. Abrimos a janela de login para você revalidar seu 2FA.',
          responseStatus: 401,
          data: responseData,
        };
      }

      return {
        success: false,
        message: `Falha ao registrar diário (${response.status}): ${responseData?.message || responseText || 'Erro inesperado'}`,
        responseStatus: response.status,
        data: responseData,
      };
    } catch (err: any) {
      console.error('Erro na requisição para Dune API:', err);
      return {
        success: false,
        message: `Erro de conexão com People Zup (${err.message}).`,
      };
    }
  }
}

export let apiClient: ApiClient;

export function initApiClient() {
  if (!apiClient) {
    apiClient = new ApiClient();
  }
  return apiClient;
}
