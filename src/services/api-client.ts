import { storage } from './storage';
import { authService } from './auth';
import { LogbookDraft, SubmissionResult, CompetenceItem } from '../types';
import { setDynamicCompetences, getAvailableCompetences } from '../data/competences';

function isLikelyTokenExpired(status: number, responseData: any, responseText: string): boolean {
  if (status === 401 || status === 403) return true;
  if (status === 400) {
    const text = (
      JSON.stringify(responseData || '') +
      ' ' +
      (responseText || '')
    ).toLowerCase();

    if (
      text.includes('token') ||
      text.includes('expired') ||
      text.includes('expirou') ||
      text.includes('expirado') ||
      text.includes('jwt') ||
      text.includes('unauthorized') ||
      text.includes('invalid_token') ||
      text.includes('bearer') ||
      text.includes('auth') ||
      text.includes('forbidden')
    ) {
      return true;
    }

    const session = storage.getSession();
    if (session.isExpired) return true;
    if (session.expiresAt) {
      const expTime = new Date(session.expiresAt).getTime();
      if (Date.now() >= expTime - 30000) return true;
    }

    if (session.refreshToken) {
      return true;
    }
  }
  return false;
}

export class ApiClient {
  public async fetchCompetences(forceRefresh = false): Promise<CompetenceItem[]> {
    const session = storage.getSession();

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
    };

    try {
      console.log(`Bookmarklet: consultando competências dinâmicas (${endpoint})...`);
      let response = await fetch(endpoint, {
        method: 'GET',
        headers,
        credentials: 'omit',
      });

      if (response.status === 401 || response.status === 400) {
        console.warn(`${response.status} ao buscar competências. Tentando renovar token...`);
        const renewed = await authService.refreshAccessToken();
        if (renewed) {
          const freshSession = storage.getSession();
          headers.authorization = `Bearer ${freshSession.token}`;
          response = await fetch(endpoint, {
            method: 'GET',
            headers,
            credentials: 'omit',
          });
        }
      }

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          console.log(`Carregadas ${data.length} competências dinâmicas com sucesso!`);
          storage.setCachedCompetences(data);
          setDynamicCompetences(data);
          return data;
        }
      }
    } catch (err: any) {
      console.error('Erro ao consultar competências dinâmicas no Bookmarklet:', err.message);
    }

    return cached && cached.length > 0 ? cached : getAvailableCompetences();
  }

  public async submitLogbook(draft: LogbookDraft, isRetry = false): Promise<SubmissionResult> {
    const session = storage.getSession();
    const settings = storage.getSettings();

    if (!session.token) {
      return {
        success: false,
        message: 'Token de autenticação não encontrado. Insira seu token ou conecte-se ao People Zup.',
      };
    }

    if (session.isExpired && !isRetry) {
      console.log('Token expirado antes do envio. Renovando...');
      const renewed = await authService.refreshAccessToken();
      if (renewed) {
        return this.submitLogbook(draft, true);
      }
    }

    const targetUrl = settings.logbookEndpoint || 'https://apiznt.zenity.zup.com.br/dune/v1/entry';

    const plainContent =
      (draft.content && draft.content.trim()) ||
      (draft.blocks && draft.blocks.length > 0
        ? draft.blocks.map((b) => `${b.title}\n${b.description}`).join('\n\n')
        : '');

    const formattedContent = plainContent.split('\n').map((line) => ({
      type: 'paragraph',
      children: [{ text: line }],
    }));

    const isPerformance = draft.isPerformanceReview !== false && draft.type !== 'livre';

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
    };

    console.log(`Bookmarklet disparando envio para: ${targetUrl}`);

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        credentials: 'omit',
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

      if (!isRetry && isLikelyTokenExpired(response.status, responseData, responseText)) {
        console.warn(`API retornou ${response.status} indicando token expirado. Renovando no Bookmarklet...`);
        const renewed = await authService.refreshAccessToken();
        if (renewed) {
          console.log('Token renovado com sucesso. Reenviando requisição do diário...');
          const retryResult = await this.submitLogbook(draft, true);
          retryResult.refreshedToken = true;
          return retryResult;
        }

        return {
          success: false,
          message: 'Sua sessão expirou no People Zup. Atualize a página do People ou renove seu token nas configurações.',
          responseStatus: response.status,
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

export const apiClient = new ApiClient();
