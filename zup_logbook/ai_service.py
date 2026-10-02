import re
import json
import time
from typing import Dict, Any, List, Optional
import requests

from .storage import storage
from .competences import get_available_competences
from .templates import (
    DEFAULT_INSTRUCTIONS,
    DEFAULT_LEADERSHIP_TEMPLATE,
    DEFAULT_NON_LEADERSHIP_TEMPLATE,
)

class AiService:
    def __init__(self):
        self.stackspot_token_cache: Optional[Dict[str, Any]] = None

    def process_relato(self, user_input: str, history: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        if history is None:
            history = []
        settings = storage.get_settings()
        provider = settings.get("aiProvider") or "stackspot"

        last_draft = None
        for msg in reversed(history):
            if msg.get("draft") and msg.get("status") != "submitted":
                last_draft = msg["draft"]
                break

        try:
            if provider == "stackspot":
                has_creds = (
                    (settings.get("stackspotClientId") and settings.get("stackspotClientSecret"))
                    or (settings.get("stackspotToken") and settings["stackspotToken"].strip())
                )
                if has_creds:
                    return self._call_stackspot_ai(user_input, history, settings, last_draft)
                raise ValueError("Credenciais da StackSpot AI não configuradas. Preencha o Token de Acesso (PAT) ou Client ID/Secret nas Configurações.")

            elif provider == "gemini":
                if settings.get("aiApiKey"):
                    return self._call_gemini(user_input, history, settings, last_draft)
                raise ValueError("Chave de API do Gemini não configurada nas Configurações.")

            elif provider == "openai":
                if settings.get("aiApiKey"):
                    return self._call_openai(user_input, history, settings, last_draft)
                raise ValueError("Chave de API da OpenAI não configurada nas Configurações.")

            raise ValueError(f"Provedor de IA desconhecido: {provider}")
        except Exception as err:
            print(f"[AI] Erro ao consultar {provider}: {err}")
            raise RuntimeError(f"[IA {provider.upper()}] {err}")

    def _get_stackspot_access_token(self, settings: Dict[str, Any]) -> str:
        if settings.get("stackspotToken") and settings["stackspotToken"].strip():
            return settings["stackspotToken"].strip()

        if self.stackspot_token_cache and time.time() < (self.stackspot_token_cache["expiresAt"] - 60):
            return self.stackspot_token_cache["token"]

        realm = (settings.get("stackspotRealm") or "zup").strip()
        token_url = f"https://idm.stackspot.com/{realm}/oidc/oauth/token"
        client_id = (settings.get("stackspotClientId") or "").strip()
        client_secret = (settings.get("stackspotClientSecret") or "").strip()

        if not client_id or not client_secret:
            raise ValueError("Credenciais da StackSpot AI não configuradas.")

        print(f"[AI] Solicitando token OAuth2 StackSpot para realm: {realm}")
        res = requests.post(
            token_url,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data={
                "grant_type": "client_credentials",
                "client_id": client_id,
                "client_secret": client_secret,
            },
            timeout=(5, 15),
        )

        if not res.ok:
            raise RuntimeError(f"Falha na autenticação StackSpot ({res.status_code}): {res.text}")

        data = res.json()
        access_token = data["access_token"]
        expires_in = data.get("expires_in", 3600)

        self.stackspot_token_cache = {
            "token": access_token,
            "expiresAt": time.time() + expires_in,
        }
        return access_token

    def _build_full_prompt(
        self,
        settings: Dict[str, Any],
        user_input: str,
        previous_draft: Optional[Dict[str, Any]] = None,
    ) -> str:
        available = get_available_competences()
        competences_list_text = "\n".join([f"- ID {c['id']}: {c['name']}" for c in available])

        leadership = (settings.get("leadershipTemplate") or DEFAULT_LEADERSHIP_TEMPLATE).strip()
        non_leadership = (settings.get("nonLeadershipTemplate") or DEFAULT_NON_LEADERSHIP_TEMPLATE).strip()

        templates_def = f"""
TEMPLATES OFICIAIS DO PEOPLE ZUP:
1. "NON_LEADERSHIP" (Não Liderança / Especialista):
{non_leadership}

2. "LEADERSHIP" (Liderança / Gestão):
{leadership}
"""

        context_prompt = ""
        if previous_draft:
            context_data = {
                "title": previous_draft.get("title"),
                "blocks": previous_draft.get("blocks"),
                "hours": previous_draft.get("hours"),
                "templateFor": previous_draft.get("templateFor"),
                "competences": [
                    {"id": c["id"], "name": c["name"]}
                    for c in previous_draft.get("competences", [])
                    if "id" in c and "name" in c
                ],
            }
            context_prompt = (
                f"\n\nPROPOSTA ATUAL EM EDIÇÃO (Mantenha o que não for alterado e incorpore os novos pedidos do usuário):\n"
                f"{json.dumps(context_data, indent=2, ensure_ascii=False)}\n\n"
                "ATENÇÃO: O usuário está enviando uma instrução de ajuste, correção ou complemento para a proposta acima."
            )

        instructions = (settings.get("customInstructions") or DEFAULT_INSTRUCTIONS).strip()

        return f"""
{instructions}

{templates_def}

CATÁLOGO OFICIAL DE COMPETÊNCIAS DA ZUP (Selecione apenas as competências desta lista usando seus IDs numéricos):
{competences_list_text}

INSTRUÇÕES OBRIGATÓRIAS:
1. Valide o relato do usuário e selecione o modelo de template mais adequado ("NON_LEADERSHIP" ou "LEADERSHIP").
2. Formate o relato preenchendo as seções relevantes do template escolhido ("title" com o nome da seção e "description" com o conteúdo).
3. Crie um título profissional e conciso para o registro.
4. Analise detalhadamente o relato e selecione EXCLUSIVAMENTE no catálogo oficial acima quais competências mais se adequam às realizações descritas. Retorne os IDs numéricos correspondentes no campo "competenceIds".
5. Não invente IDs nem competências fora da lista fornecida. Se nenhuma competência se aplicar com segurança, retorne lista vazia [].

Responda OBRIGATORIAMENTE em formato JSON estrito:
{{
  "message": "Mensagem conversacional amigável explicando o que foi estruturado e as competências indicadas",
  "title": "Título conciso da realização",
  "blocks": [
    {{ "title": "Nome da Seção do Template:", "description": "Descritivo do que foi realizado" }}
  ],
  "templateFor": "NON_LEADERSHIP" | "LEADERSHIP",
  "competenceIds": [1, 23],
  "hours": 8
}}
{context_prompt}
"""

    def _call_stackspot_ai(
        self,
        user_input: str,
        history: List[Dict[str, Any]],
        settings: Dict[str, Any],
        previous_draft: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        access_token = self._get_stackspot_access_token(settings)
        system_prompt = self._build_full_prompt(settings, user_input, previous_draft)

        slug = settings.get("stackspotSlug")
        if slug:
            qc_url = f"https://genai-code-buddy-api.stackspot.com/v1/quick-commands/create-execution/{slug}"
            res = requests.post(
                qc_url,
                headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
                json={"input_data": f"{system_prompt}\n\nRelato do Zupper:\n{user_input}"},
                timeout=(5, 35),
            )
            if not res.ok:
                raise RuntimeError(f"StackSpot Quick Command retornou {res.status_code}: {res.text}")
            qc_data = res.json()
            return self._parse_ai_result(qc_data.get("result") or json.dumps(qc_data), user_input, previous_draft)

        chat_url = "https://genai-code-buddy-api.stackspot.com/v1/chat"
        chat_messages = [{"role": "system", "content": system_prompt}]
        for msg in history[-4:]:
            chat_messages.append({
                "role": "user" if msg.get("sender") == "user" else "assistant",
                "content": msg.get("text", ""),
            })
        chat_messages.append({"role": "user", "content": user_input})

        res = requests.post(
            chat_url,
            headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
            json={"streaming": False, "messages": chat_messages},
            timeout=(5, 35),
        )
        if not res.ok:
            raise RuntimeError(f"StackSpot Chat API retornou {res.status_code}: {res.text}")

        chat_data = res.json()
        content = ""
        if isinstance(chat_data, dict):
            if "message" in chat_data and isinstance(chat_data["message"], dict):
                content = chat_data["message"].get("content", "")
            else:
                content = chat_data.get("content", "")
        return self._parse_ai_result(content, user_input, previous_draft)

    def _call_gemini(
        self,
        user_input: str,
        history: List[Dict[str, Any]],
        settings: Dict[str, Any],
        previous_draft: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        system_instruction = self._build_full_prompt(settings, user_input, previous_draft)
        model = settings.get("aiModel") or "gemini-2.5-flash"
        api_key = settings["aiApiKey"]
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

        body = {
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "contents": [{"role": "user", "parts": [{"text": user_input}]}],
            "generationConfig": {"response_mime_type": "application/json", "temperature": 0.3},
        }

        res = requests.post(endpoint, headers={"Content-Type": "application/json"}, json=body, timeout=(5, 35))
        if not res.ok:
            raise RuntimeError(res.text)

        data = res.json()
        text = ""
        candidates = data.get("candidates", [])
        if candidates and "content" in candidates[0]:
            parts = candidates[0]["content"].get("parts", [])
            if parts and "text" in parts[0]:
                text = parts[0]["text"]

        return self._parse_ai_result(text, user_input, previous_draft)

    def _call_openai(
        self,
        user_input: str,
        history: List[Dict[str, Any]],
        settings: Dict[str, Any],
        previous_draft: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        system_prompt = self._build_full_prompt(settings, user_input, previous_draft)
        model = settings.get("aiModel") or "gpt-4o-mini"
        api_key = settings["aiApiKey"]

        messages = [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_input}]
        body = {
            "model": model,
            "messages": messages,
            "response_format": {"type": "json_object"},
        }

        res = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"},
            json=body,
            timeout=(5, 35),
        )
        if not res.ok:
            raise RuntimeError(res.text)

        data = res.json()
        text = ""
        choices = data.get("choices", [])
        if choices and "message" in choices[0]:
            text = choices[0]["message"].get("content", "")

        return self._parse_ai_result(text, user_input, previous_draft)

    def _parse_ai_result(
        self,
        raw_text: str,
        user_input: str,
        previous_draft: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        try:
            json_str = raw_text.strip()
            code_block_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw_text)
            if code_block_match:
                json_str = code_block_match.group(1).strip()
            else:
                brace_match = re.search(r"(\{[\s\S]*\})", raw_text)
                if brace_match:
                    json_str = brace_match.group(1).strip()

            parsed = json.loads(json_str)

            blocks = parsed.get("blocks")
            if not isinstance(blocks, list) or len(blocks) == 0:
                blocks = previous_draft.get("blocks", []) if previous_draft else []

            # Mapeamento estrito das competências a partir do catálogo oficial
            available = get_available_competences()
            selected_competences = []
            returned_ids = []

            if isinstance(parsed.get("competenceIds"), list):
                for item in parsed["competenceIds"]:
                    try:
                        returned_ids.append(int(item))
                    except Exception:
                        pass
            elif isinstance(parsed.get("competences"), list):
                for item in parsed["competences"]:
                    if isinstance(item, dict) and "id" in item:
                        try:
                            returned_ids.append(int(item["id"]))
                        except Exception:
                            pass
                    elif isinstance(item, (int, str)):
                        try:
                            returned_ids.append(int(item))
                        except Exception:
                            pass

            for cid in returned_ids:
                found = next((c for c in available if c["id"] == cid), None)
                if found and not any(sc["id"] == found["id"] for sc in selected_competences):
                    selected_competences.append(found)

            if (
                len(selected_competences) == 0
                and previous_draft
                and previous_draft.get("competences")
                and "competenceIds" not in parsed
                and "competences" not in parsed
            ):
                selected_competences.extend(previous_draft["competences"])

            plain_content = ""
            if blocks and len(blocks) > 0:
                plain_content = "\n\n".join([f"{b.get('title', '')}\n{b.get('description', '')}" for b in blocks])
            elif parsed.get("content"):
                plain_content = parsed["content"].strip()
            elif parsed.get("refinedText"):
                plain_content = parsed["refinedText"].strip()
            elif previous_draft and previous_draft.get("content"):
                plain_content = previous_draft["content"]
            else:
                plain_content = user_input

            default_msg = (
                "Ajustei a proposta conforme sua solicitação:"
                if previous_draft
                else "Estruturei o seu relato e selecionei as competências correspondentes:"
            )

            return {
                "message": parsed.get("message") or default_msg,
                "draft": {
                    "title": parsed.get("title") or (previous_draft.get("title") if previous_draft else ""),
                    "blocks": blocks,
                    "content": plain_content,
                    "templateFor": "LEADERSHIP" if parsed.get("templateFor") == "LEADERSHIP" else "NON_LEADERSHIP",
                    "isPerformanceReview": True,
                    "competences": selected_competences,
                    "hours": parsed.get("hours") or (previous_draft.get("hours", 8) if previous_draft else 8),
                    "rawInput": user_input,
                },
            }
        except Exception as err:
            print(f"[AI] Falha no parse do retorno LLM: {err} | Raw: {raw_text}")
            raise RuntimeError(f"A resposta da IA não pôde ser interpretada: {err}")

ai_service = AiService()
